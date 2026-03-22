import { describe, it, expect } from "vitest";
import { getPartyColor } from "@/utils/getPartyColor";

describe("getPartyColor", () => {
  it("returns expected colors for known parties in light mode", () => {
    expect(getPartyColor(true, "SPD")).toBe("#E3000F");
    expect(getPartyColor(true, "FDP")).toBe("#FFED00");
    expect(getPartyColor(true, "CDU/CSU")).toBe("#000000");
    expect(getPartyColor(true, "Sonstige")).toBe("#CCCCCC");
  });

  it("returns dark-mode variants for known parties", () => {
    expect(getPartyColor(false, "CDU/CSU")).toBe("#3e3e3e");
  });

  it("returns a string for known parties", () => {
    expect(typeof getPartyColor(true, "SPD")).toBe("string");
  });
});
