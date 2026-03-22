import { describe, it, expect } from "vitest";
import { getSortingValueOfParty } from "@/hooks/useSortedParliament";

describe("getSortingValueOfParty", () => {
  it("returns correct sort values for all major parties", () => {
    expect(getSortingValueOfParty("AfD")).toBe(-1);
    expect(getSortingValueOfParty("Freie Wähler")).toBe(-2);
    expect(getSortingValueOfParty("CDU/CSU")).toBe(-2);
    expect(getSortingValueOfParty("CDU")).toBe(-2);
    expect(getSortingValueOfParty("CSU")).toBe(-2);
    expect(getSortingValueOfParty("FDP")).toBe(-3);
    expect(getSortingValueOfParty("SPD")).toBe(-4);
    expect(getSortingValueOfParty("Grüne")).toBe(-5);
    expect(getSortingValueOfParty("Linke")).toBe(-6);
    expect(getSortingValueOfParty("BSW")).toBe(-7);
  });

  it("defaults unknown parties to -8", () => {
    expect(getSortingValueOfParty("XYZ")).toBe(-8);
    expect(getSortingValueOfParty("Sonstige")).toBe(-8);
  });

  it("sorts left-to-right political spectrum", () => {
    const parties = [
      { name: "BSW" },
      { name: "Linke" },
      { name: "Grüne" },
      { name: "SPD" },
      { name: "FDP" },
      { name: "CDU/CSU" },
      { name: "Freie Wähler" },
      { name: "AfD" },
    ];
    const sorted = [...parties].sort(
      (a, b) => getSortingValueOfParty(a.name) - getSortingValueOfParty(b.name),
    );
    expect(sorted.map((p) => p.name)).toEqual([
      "BSW",
      "Linke",
      "Grüne",
      "SPD",
      "FDP",
      "CDU/CSU",
      "Freie Wähler",
      "AfD",
    ]);
  });
});
