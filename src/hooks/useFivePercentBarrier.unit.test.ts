import { describe, it, expect } from "vitest";
import type { PartyEntry } from "@/types/PartyEntry";
import { applyFivePercentBarrier } from "@/hooks/useFivePercentBarrier";

const parties: PartyEntry[] = [
  { name: "SPD", value: 25, color: "#E3000F", date: new Date() },
  { name: "CDU/CSU", value: 4.9, color: "#000", date: new Date() },
  { name: "Grüne", value: 5, color: "#46962B", date: new Date() },
  { name: "Sonstige", value: 10, color: "#ccc", date: new Date() },
  { name: "BSW", value: 4, color: "#7b2450", date: new Date() },
];

describe("applyFivePercentBarrier", () => {
  it("filters out parties below 5%", () => {
    const result = applyFivePercentBarrier(parties);
    expect(result.map((p) => p.name)).not.toContain("CDU/CSU");
    expect(result.map((p) => p.name)).not.toContain("BSW");
  });

  it("keeps parties at exactly 5%", () => {
    const result = applyFivePercentBarrier(parties);
    expect(result.map((p) => p.name)).toContain("Grüne");
  });

  it("filters out Sonstige regardless of value", () => {
    const result = applyFivePercentBarrier(parties);
    expect(result.map((p) => p.name)).not.toContain("Sonstige");
  });

  it("returns empty array when all parties are filtered", () => {
    const allBelow: PartyEntry[] = [
      { name: "X", value: 3, color: "#000", date: new Date() },
      { name: "Sonstige", value: 20, color: "#ccc", date: new Date() },
    ];
    expect(applyFivePercentBarrier(allBelow)).toEqual([]);
  });
});
