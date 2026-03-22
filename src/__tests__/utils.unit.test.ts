import { describe, it, expect } from "vitest";
import { areCompatible, isViableCoalition } from "@/utils/partyCompatibility";
import { getPartyColor } from "@/utils/getPartyColor";

describe("partyCompatibility helpers", () => {
  it("detects known incompatibilities", () => {
    expect(areCompatible("CDU/CSU", "AfD")).toBe(false);
    expect(areCompatible("CDU/CSU", "SPD")).toBe(true);
  });

  it("evaluates multi-party viability correctly", () => {
    expect(isViableCoalition(["AfD", "CDU/CSU"])).toBe(false);
  });
});

describe("getPartyColor", () => {
  it("returns a color string for known parties", () => {
    expect(typeof getPartyColor(true, "SPD")).toBe("string");
    expect(getPartyColor(true, "SPD")).toBe("#E3000F");
  });
});
