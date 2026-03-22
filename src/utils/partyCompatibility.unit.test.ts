import { describe, it, expect } from "vitest";
import { areCompatible, isViableCoalition } from "@/utils/partyCompatibility";

describe("areCompatible", () => {
  it("detects known incompatibilities", () => {
    expect(areCompatible("CDU/CSU", "AfD")).toBe(false);
  });

  it("returns true for compatible parties", () => {
    expect(areCompatible("CDU/CSU", "SPD")).toBe(true);
  });
});

describe("isViableCoalition", () => {
  it("returns false when any pair is incompatible", () => {
    expect(isViableCoalition(["AfD", "CDU/CSU"])).toBe(false);
  });
});
