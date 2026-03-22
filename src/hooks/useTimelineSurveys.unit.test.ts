import { describe, it, expect } from "vitest";
import {
  rollingAverageLinear,
  monthlyBand,
  TimelinePoint,
} from "@/hooks/useTimelineSurveys";

const DAY = 24 * 60 * 60 * 1000;

function makeDate(offsetDays: number): Date {
  return new Date(Date.UTC(2024, 0, 1) + offsetDays * 86_400_000);
}

function pt(offsetDays: number, value: number): TimelinePoint {
  return { date: makeDate(offsetDays), value };
}

// ---------------------------------------------------------------------------
// Inline replication of the qualifyingParties + partyMap logic shared by
// useTimelineSurveys and useInstituteTimeline, testable without React hooks.
// ---------------------------------------------------------------------------

function buildPartyTimeline(
  surveys: Array<{
    Date: string;
    Parliament_ID: string;
    Institute_ID?: string;
    Results: Record<string, number>;
  }>,
  parties: Record<string, { Shortcut: string }>,
  parliamentId: string,
  instituteId?: string,
): Map<string, TimelinePoint[]> {
  const FIVE_PERCENT = 5;

  const filtered = surveys
    .filter(
      (s) =>
        s.Parliament_ID === parliamentId &&
        (instituteId === undefined || s.Institute_ID === instituteId),
    )
    .sort((a, b) => (a.Date < b.Date ? -1 : a.Date > b.Date ? 1 : 0));

  const qualifyingParties = new Set<string>();
  for (const survey of filtered) {
    for (const [partyId, pct] of Object.entries(survey.Results)) {
      const shortcut = parties[partyId]?.Shortcut;
      if (shortcut && !shortcut.includes("Sonstige") && pct >= FIVE_PERCENT) {
        qualifyingParties.add(shortcut);
      }
    }
  }

  const isCduCsu = (s: string) =>
    s === "CDU" || s === "CSU" || s === "CDU/CSU";
  const CDU_CSU_KEY = "CDU/CSU";

  const partyMap = new Map<string, TimelinePoint[]>();
  for (const survey of filtered) {
    const surveyDate = new Date(survey.Date);
    let cduCsuTotal = 0;
    let hasCduCsu = false;

    for (const [partyId, pct] of Object.entries(survey.Results)) {
      const shortcut = parties[partyId]?.Shortcut;
      if (!shortcut) continue;

      if (isCduCsu(shortcut)) {
        cduCsuTotal += pct;
        hasCduCsu = true;
        continue;
      }

      if (!qualifyingParties.has(shortcut)) continue;
      if (!partyMap.has(shortcut)) partyMap.set(shortcut, []);
      partyMap.get(shortcut)!.push({ date: surveyDate, value: pct });
    }

    if (
      hasCduCsu &&
      (qualifyingParties.has("CDU") ||
        qualifyingParties.has("CSU") ||
        qualifyingParties.has(CDU_CSU_KEY))
    ) {
      if (!partyMap.has(CDU_CSU_KEY)) partyMap.set(CDU_CSU_KEY, []);
      partyMap.get(CDU_CSU_KEY)!.push({ date: surveyDate, value: cduCsuTotal });
    }
  }

  return partyMap;
}

// ---------------------------------------------------------------------------
// rollingAverageLinear
// ---------------------------------------------------------------------------

describe("rollingAverageLinear", () => {
  it("returns empty array for empty input", () => {
    expect(rollingAverageLinear([])).toEqual([]);
  });

  it("returns single point unchanged for one-element input", () => {
    const result = rollingAverageLinear([pt(0, 20)]);
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(20);
  });

  it("computes a sliding average over the 14-day window", () => {
    const base = new Date(2020, 0, 15);
    const pts = [
      { date: new Date(base.getTime() - 16 * DAY), value: 10 },
      { date: new Date(base.getTime() - 10 * DAY), value: 20 },
      { date: new Date(base.getTime() - 1 * DAY), value: 30 },
      { date: new Date(base.getTime()), value: 40 },
    ];
    const out = rollingAverageLinear(pts);
    expect(out).toHaveLength(4);
    expect(out[0].value).toBeCloseTo(10);
    expect(out[1].value).toBeCloseTo(15);
    expect(out[2].value).toBeCloseTo(25);
    expect(out[3].value).toBeCloseTo(30);
  });

  it("averages points within 14-day window", () => {
    const points = [pt(0, 10), pt(5, 20), pt(10, 30)];
    const result = rollingAverageLinear(points);
    expect(result[2].value).toBeCloseTo((10 + 20 + 30) / 3);
  });

  it("drops points outside 14-day window from the average", () => {
    const points = [pt(0, 100), pt(8, 10), pt(15, 20)];
    const result = rollingAverageLinear(points);
    expect(result[2].value).toBeCloseTo((10 + 20) / 2);
  });

  it("preserves dates from input", () => {
    const points = [pt(0, 10), pt(7, 20)];
    const result = rollingAverageLinear(points);
    expect(result[0].date).toEqual(points[0].date);
    expect(result[1].date).toEqual(points[1].date);
  });

  it("returns same number of points as input", () => {
    const points = [pt(0, 10), pt(3, 15), pt(6, 20), pt(20, 25)];
    expect(rollingAverageLinear(points)).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// monthlyBand
// ---------------------------------------------------------------------------

describe("monthlyBand", () => {
  it("returns empty array for empty input", () => {
    expect(monthlyBand([])).toEqual([]);
  });

  it("buckets points by calendar month returning min/max", () => {
    const pts = [
      { date: new Date(2021, 0, 5), value: 1 },
      { date: new Date(2021, 0, 20), value: 5 },
      { date: new Date(2021, 1, 1), value: 2 },
      { date: new Date(2021, 1, 15), value: 8 },
    ];
    const bands = monthlyBand(pts);
    expect(bands).toHaveLength(2);
    expect(bands[0].min).toBe(1);
    expect(bands[0].max).toBe(5);
    expect(bands[1].min).toBe(2);
    expect(bands[1].max).toBe(8);
  });

  it("creates separate buckets for different months", () => {
    const points = [
      { date: new Date("2024-01-15"), value: 10 },
      { date: new Date("2024-02-15"), value: 20 },
      { date: new Date("2024-03-15"), value: 30 },
    ];
    expect(monthlyBand(points)).toHaveLength(3);
  });

  it("sorts buckets chronologically", () => {
    const points = [
      { date: new Date("2024-03-01"), value: 30 },
      { date: new Date("2024-01-01"), value: 10 },
      { date: new Date("2024-02-01"), value: 20 },
    ];
    const result = monthlyBand(points);
    expect(result[0].min).toBe(10);
    expect(result[1].min).toBe(20);
    expect(result[2].min).toBe(30);
  });

  it("min equals max for single-point months", () => {
    const points = [{ date: new Date("2024-06-15"), value: 25 }];
    const result = monthlyBand(points);
    expect(result[0].min).toBe(25);
    expect(result[0].max).toBe(25);
  });
});

// ---------------------------------------------------------------------------
// Qualifying-party filtering logic
// ---------------------------------------------------------------------------

const PARTIES = {
  p1: { Shortcut: "SPD" },
  p2: { Shortcut: "CDU" },
  p3: { Shortcut: "CSU" },
  p4: { Shortcut: "AfD" },
  p5: { Shortcut: "Sonstige" },
  p6: { Shortcut: "FDP" },
};

function makeSurvey(
  date: string,
  parliamentId: string,
  results: Record<string, number>,
  instituteId = "i1",
) {
  return { Date: date, Parliament_ID: parliamentId, Institute_ID: instituteId, Results: results };
}

describe("qualifying-party filtering", () => {
  it("excludes parties that never reach 5%", () => {
    const surveys = [makeSurvey("2024-01-01", "1", { p1: 30, p6: 3 })];
    const map = buildPartyTimeline(surveys, PARTIES, "1");
    expect(map.has("SPD")).toBe(true);
    expect(map.has("FDP")).toBe(false);
  });

  it("qualifies a party that reaches 5% in any survey", () => {
    const surveys = [
      makeSurvey("2024-01-01", "1", { p6: 3 }),
      makeSurvey("2024-02-01", "1", { p6: 7 }),
    ];
    const map = buildPartyTimeline(surveys, PARTIES, "1");
    expect(map.has("FDP")).toBe(true);
    expect(map.get("FDP")).toHaveLength(2);
  });

  it("excludes Sonstige even at high percentages", () => {
    const surveys = [makeSurvey("2024-01-01", "1", { p5: 20 })];
    const map = buildPartyTimeline(surveys, PARTIES, "1");
    expect(map.has("Sonstige")).toBe(false);
  });

  it("filters to specified parliament only", () => {
    const surveys = [
      makeSurvey("2024-01-01", "1", { p1: 30 }),
      makeSurvey("2024-01-01", "2", { p4: 30 }),
    ];
    const map = buildPartyTimeline(surveys, PARTIES, "1");
    expect(map.has("SPD")).toBe(true);
    expect(map.has("AfD")).toBe(false);
  });

  it("returns empty map when no surveys match", () => {
    const map = buildPartyTimeline([], PARTIES, "1");
    expect(map.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// CDU/CSU merging logic (also used in useInstituteTimeline)
// ---------------------------------------------------------------------------

describe("CDU/CSU merging", () => {
  const CDU_CSU_PARTIES = {
    p1: { Shortcut: "CDU" },
    p2: { Shortcut: "CSU" },
    p3: { Shortcut: "SPD" },
  };

  it("merges CDU and CSU into CDU/CSU key", () => {
    const surveys = [makeSurvey("2024-01-01", "1", { p1: 15, p2: 10 })];
    const map = buildPartyTimeline(surveys, CDU_CSU_PARTIES, "1");
    expect(map.has("CDU/CSU")).toBe(true);
    expect(map.get("CDU/CSU")![0].value).toBe(25);
    expect(map.has("CDU")).toBe(false);
    expect(map.has("CSU")).toBe(false);
  });

  it("does not emit CDU/CSU when combined total is below 5%", () => {
    const surveys = [makeSurvey("2024-01-01", "1", { p1: 2, p2: 1 })];
    const map = buildPartyTimeline(surveys, CDU_CSU_PARTIES, "1");
    expect(map.has("CDU/CSU")).toBe(false);
  });

  it("accumulates CDU/CSU values across multiple surveys", () => {
    const surveys = [
      makeSurvey("2024-01-01", "1", { p1: 15, p2: 8 }),
      makeSurvey("2024-02-01", "1", { p1: 20, p2: 6 }),
    ];
    const map = buildPartyTimeline(surveys, CDU_CSU_PARTIES, "1");
    const pts = map.get("CDU/CSU")!;
    expect(pts).toHaveLength(2);
    expect(pts[0].value).toBe(23);
    expect(pts[1].value).toBe(26);
  });

  it("handles a pre-merged CDU/CSU shortcut entry", () => {
    const parties = { p1: { Shortcut: "CDU/CSU" }, p2: { Shortcut: "SPD" } };
    const surveys = [makeSurvey("2024-01-01", "1", { p1: 30, p2: 25 })];
    const map = buildPartyTimeline(surveys, parties, "1");
    expect(map.has("CDU/CSU")).toBe(true);
    expect(map.get("CDU/CSU")![0].value).toBe(30);
  });

  it("filters by instituteId when provided", () => {
    const surveys = [
      makeSurvey("2024-01-01", "1", { p1: 20, p2: 10 }, "i1"),
      makeSurvey("2024-01-15", "1", { p1: 18, p2: 9 }, "i2"),
    ];
    const map = buildPartyTimeline(surveys, CDU_CSU_PARTIES, "1", "i1");
    const pts = map.get("CDU/CSU")!;
    expect(pts).toHaveLength(1);
    expect(pts[0].value).toBe(30);
  });
});
