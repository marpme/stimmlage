import { describe, it, expect } from "vitest";
import { rollingAverageLinear, monthlyBand } from "@/hooks/useTimelineSurveys";
import { getPartyColor } from "@/utils/getPartyColor";

const DAY = 24 * 60 * 60 * 1000;

describe("rollingAverageLinear", () => {
  it("returns empty for empty input", () => {
    expect(rollingAverageLinear([])).toEqual([]);
  });

  it("computes a sliding average over 14 days window", () => {
    const base = new Date(2020, 0, 15);
    const pts = [
      { date: new Date(base.getTime() - 16 * DAY), value: 10 }, // falls out of window later
      { date: new Date(base.getTime() - 10 * DAY), value: 20 },
      { date: new Date(base.getTime() - 1 * DAY), value: 30 },
      { date: new Date(base.getTime()), value: 40 },
    ];

    const out = rollingAverageLinear(pts);
    expect(out).toHaveLength(4);

    // i=0 -> window [0] => 10
    expect(out[0].value).toBeCloseTo(10);
    // i=1 -> window includes first two (diff 6 days) => (10+20)/2 = 15
    expect(out[1].value).toBeCloseTo(15);
    // i=2 -> window includes pts[1],pts[2] (pts[0] is 15+ days before) => (20+30)/2 = 25
    expect(out[2].value).toBeCloseTo(25);
    // i=3 -> window includes pts[1],pts[2],pts[3] => (20+30+40)/3 = 30
    expect(out[3].value).toBeCloseTo(30);
  });
});

describe("monthlyBand", () => {
  it("buckets points by calendar month returning min/max", () => {
    const pts = [
      { date: new Date(2021, 0, 5), value: 1 },
      { date: new Date(2021, 0, 20), value: 5 },
      { date: new Date(2021, 1, 1), value: 2 },
      { date: new Date(2021, 1, 15), value: 8 },
    ];

    const bands = monthlyBand(pts);
    expect(bands).toHaveLength(2);
    // January bucket
    expect(bands[0].min).toBe(1);
    expect(bands[0].max).toBe(5);
    // February bucket
    expect(bands[1].min).toBe(2);
    expect(bands[1].max).toBe(8);
  });
});

describe("getPartyColor", () => {
  it("returns expected colors for known parties and respects light/dark", () => {
    expect(getPartyColor(true, "SPD")).toBe("#E3000F");
    expect(getPartyColor(true, "FDP")).toBe("#FFED00");
    expect(getPartyColor(true, "CDU/CSU")).toBe("#000000");
    expect(getPartyColor(false, "CDU/CSU")).toBe("#3e3e3e");
    expect(getPartyColor(true, "Sonstige")).toBe("#CCCCCC");
  });
});
