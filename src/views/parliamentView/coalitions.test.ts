import { describe, it, expect } from "vitest";
import { buildCoalitions } from "./coalitions";
import {
  areCompatible,
  isViableCoalition,
} from "../../utils/partyCompatibility";

// Bundestag-like scenario
// CDU/CSU (26) > AfD (22.9) > SPD (16.2) > Grüne (12.6) > Linke (9.8)
// AfD+CDU/CSU = 48.8% → shown but inviable (incompatible pair)
// CDU/CSU+SPD = 42.2% → below 45% threshold, absent
// CDU/CSU+Grüne = 38.6% → below threshold, absent
const bundestag = [
  { name: "CDU/CSU", value: 26, color: "" },
  { name: "AfD", value: 22.9, color: "" },
  { name: "SPD", value: 16.2, color: "" },
  { name: "Grüne", value: 12.6, color: "" },
  { name: "Linke", value: 9.8, color: "" },
];
const bundestagTotal = bundestag.reduce((s, p) => s + p.value, 0);

const bayern = [
  { name: "CSU", value: 39.6, color: "" },
  { name: "AfD", value: 17, color: "" },
  { name: "Grüne", value: 12.9, color: "" },
  { name: "Freie Wähler", value: 11.3, color: "" },
  { name: "SPD", value: 7.9, color: "" },
];
const bayernTotal = bayern.reduce((s, p) => s + p.value, 0);

describe("buildCoalitions", () => {
  describe("viable flag", () => {
    it("AfD+CDU/CSU is included but marked inviable", () => {
      const result = buildCoalitions(bundestag, bundestagTotal);
      const afdCdu = result.find(
        (c) =>
          c.parties
            .map((p) => p.name)
            .sort()
            .join("+") === "AfD+CDU/CSU",
      );
      expect(afdCdu).toBeDefined();
      expect(afdCdu!.viable).toBe(false);
    });

    it("CDU/CSU+SPD+Grüne is marked viable when it appears", () => {
      const result = buildCoalitions(bundestag, bundestagTotal);
      const combo = result.find(
        (c) =>
          c.parties
            .map((p) => p.name)
            .sort()
            .join("+") === "CDU/CSU+Grüne+SPD",
      );
      if (combo) expect(combo.viable).toBe(true);
    });

    it("all results have a boolean viable field", () => {
      const result = buildCoalitions(bundestag, bundestagTotal);
      for (const c of result) {
        expect(typeof c.viable).toBe("boolean");
      }
    });
  });

  describe("sort order", () => {
    it("within same tier: viable entries appear before inviable entries", () => {
      const result = buildCoalitions(bundestag, bundestagTotal);
      for (let tier = 1; tier <= 3; tier++) {
        const tierItems = result.filter((c) => c.size === tier);
        let seenInviable = false;
        for (const c of tierItems) {
          if (!c.viable) seenInviable = true;
          if (seenInviable && c.viable) {
            expect.fail(
              `Viable entry for ${c.parties.map((p) => p.name).join("+")} came after inviable in tier ${tier}`,
            );
          }
        }
      }
    });

    it("fewer parties come before more parties", () => {
      const result = buildCoalitions(bundestag, bundestagTotal);
      for (let i = 1; i < result.length; i++) {
        if (result[i - 1].size !== result[i].size) {
          expect(result[i - 1].size).toBeLessThan(result[i].size);
        }
      }
    });

    it("within same tier and same viability, higher share comes first", () => {
      const result = buildCoalitions(bundestag, bundestagTotal);
      for (let i = 1; i < result.length; i++) {
        const prev = result[i - 1];
        const curr = result[i];
        if (prev.size === curr.size && prev.viable === curr.viable) {
          expect(prev.share).toBeGreaterThanOrEqual(curr.share);
        }
      }
    });
  });

  describe("deduplication — only viable majority combos block higher tiers", () => {
    it("AfD (inviable participant) does NOT block tier-3 combos", () => {
      // AfD+CDU/CSU is inviable → AfD's participation doesn't count for majorityParticipants
      // So AfD can still appear in tier-3 combos (though those too will be inviable)
      const result = buildCoalitions(bundestag, bundestagTotal);
      const tier3WithAfD = result.filter(
        (c) => c.size === 3 && c.parties.some((p) => p.name === "AfD"),
      );
      // These should exist but be marked inviable
      for (const c of tier3WithAfD) {
        expect(c.viable).toBe(false);
      }
    });

    it("CDU/CSU can lead tier-3 combos since no viable tier-2 majority exists with CDU/CSU as participant", () => {
      const result = buildCoalitions(bundestag, bundestagTotal);
      const tier3WithCDU = result.filter(
        (c) =>
          c.size === 3 &&
          c.viable &&
          [...c.parties].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0]
            .name === "CDU/CSU",
      );
      expect(tier3WithCDU.length).toBeGreaterThan(0);
    });
  });

  describe("Bayern scenario", () => {
    it("CSU+AfD appears but is marked inviable", () => {
      const result = buildCoalitions(bayern, bayernTotal);
      const csuAfd = result.find(
        (c) =>
          c.parties
            .map((p) => p.name)
            .sort()
            .join("+") === "AfD+CSU",
      );
      expect(csuAfd).toBeDefined();
      expect(csuAfd!.viable).toBe(false);
    });

    it("viable tier-2 combos for CSU don't contain AfD", () => {
      const result = buildCoalitions(bayern, bayernTotal);
      const viableTier2 = result.filter((c) => c.size === 2 && c.viable);
      for (const c of viableTier2) {
        expect(c.parties.map((p) => p.name)).not.toContain("AfD");
      }
    });
  });

  describe("solo majority scenario", () => {
    const parties = [
      { name: "BigParty", value: 55, color: "" },
      { name: "SmallA", value: 25, color: "" },
      { name: "SmallB", value: 20, color: "" },
    ];
    const total = 100;

    it("shows BigParty alone at tier-1 as viable", () => {
      const result = buildCoalitions(parties, total);
      const solo = result.find((c) => c.size === 1);
      expect(solo?.parties[0].name).toBe("BigParty");
      expect(solo?.viable).toBe(true);
    });

    it("BigParty does NOT lead tier-2 or tier-3 viable combos after solo majority", () => {
      const result = buildCoalitions(parties, total);
      const multiViableWithBig = result.filter(
        (c) =>
          c.size > 1 &&
          c.viable &&
          [...c.parties].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0]
            .name === "BigParty",
      );
      expect(multiViableWithBig).toHaveLength(0);
    });
  });

  describe("political compatibility helpers", () => {
    it("CDU/CSU and AfD are incompatible", () => {
      expect(areCompatible("CDU/CSU", "AfD")).toBe(false);
    });

    it("CDU/CSU and SPD are compatible (GroKo)", () => {
      expect(areCompatible("CDU/CSU", "SPD")).toBe(true);
    });

    it("SPD and Grüne are compatible", () => {
      expect(areCompatible("SPD", "Grüne")).toBe(true);
    });

    it("AfD + CDU/CSU coalition is not viable", () => {
      expect(isViableCoalition(["AfD", "CDU/CSU"])).toBe(false);
    });

    it("CDU/CSU + SPD coalition is viable", () => {
      expect(isViableCoalition(["CDU/CSU", "SPD"])).toBe(true);
    });

    it("CDU/CSU + SPD + Grüne coalition is viable", () => {
      expect(isViableCoalition(["CDU/CSU", "SPD", "Grüne"])).toBe(true);
    });

    it("AfD + SPD + Grüne coalition is not viable", () => {
      expect(isViableCoalition(["AfD", "SPD", "Grüne"])).toBe(false);
    });

    it("CDU/CSU + Linke coalition is not viable", () => {
      expect(isViableCoalition(["CDU/CSU", "Linke"])).toBe(false);
    });
  });
});
