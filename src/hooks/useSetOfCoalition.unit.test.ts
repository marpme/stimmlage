import { describe, it, expect } from "vitest";
import type { Poll } from "@/assets/poll";
import { computeCoalitionSet } from "@/hooks/useSetOfCoalition";

const DAY = 24 * 60 * 60 * 1000;

function daysFromNow(n: number) {
  return new Date(Date.now() + n * DAY);
}

function makeSurvey(
  id: string,
  parliamentId: string,
  date: Date,
  instituteId: string,
  results: Record<string, number>,
) {
  return [
    id,
    {
      Date: date,
      Survey_Period: { Date_Start: date, Date_End: date },
      Surveyed_Persons: "1000",
      Parliament_ID: parliamentId,
      Institute_ID: instituteId,
      Tasker_ID: "t1",
      Method_ID: "m1",
      Results: results,
    },
  ] as const;
}

function buildPoll(
  surveys: Array<ReturnType<typeof makeSurvey>>,
  parties: Array<{ id: string; shortcut: string; name: string }>,
) {
  return {
    Database: {
      License: { Name: "CC", Shortcut: "CC", Link: "" },
      Publisher: "",
      Author: "",
      Last_Update: new Date(),
    },
    Parliaments: {
      "1": { Shortcut: "BT", Name: "Bundestag", Election: "2025" },
    },
    Institutes: {
      i1: { Name: "Infratest" },
      i2: { Name: "Forschungsgruppe" },
    },
    Taskers: {},
    Methods: {},
    Parties: Object.fromEntries(
      parties.map((p) => [p.id, { Shortcut: p.shortcut, Name: p.name }]),
    ),
    Surveys: Object.fromEntries(surveys),
  } as unknown as Poll;
}

const PARTIES = [
  { id: "p1", shortcut: "SPD", name: "Sozialdemokraten" },
  { id: "p2", shortcut: "CDU/CSU", name: "Union" },
  { id: "p3", shortcut: "AfD", name: "AfD" },
  { id: "p4", shortcut: "Sonstige", name: "Sonstige" },
];

describe("computeCoalitionSet", () => {
  it("returns empty array when data is undefined", () => {
    const result = computeCoalitionSet("1", undefined as unknown as Poll, true);
    expect(result).toEqual([]);
  });

  it("includes all parties from surveys (Sonstige filtered separately downstream)", () => {
    const surveys = [
      makeSurvey("s1", "1", daysFromNow(-5), "i1", { p1: 25, p4: 15 }),
      makeSurvey("s2", "1", daysFromNow(-3), "i2", { p1: 24, p4: 16 }),
    ];
    const poll = buildPoll(surveys, PARTIES);
    const result = computeCoalitionSet("1", poll, true);
    const names = result.map((r) => r.name);
    expect(names).toContain("SPD");
    expect(names).toContain("Sonstige");
  });

  it("averages results across institutes", () => {
    const surveys = [
      makeSurvey("s1", "1", daysFromNow(-5), "i1", { p1: 20 }),
      makeSurvey("s2", "1", daysFromNow(-3), "i2", { p1: 30 }),
    ];
    const poll = buildPoll(surveys, PARTIES);
    const result = computeCoalitionSet("1", poll, true);
    const spd = result.find((r) => r.name === "SPD");
    expect(spd!.value).toBe(25);
  });

  it("uses only the most recent survey per institute", () => {
    const surveys = [
      makeSurvey("s1", "1", daysFromNow(-30), "i1", { p1: 10 }),
      makeSurvey("s2", "1", daysFromNow(-5), "i1", { p1: 30 }),
      makeSurvey("s3", "1", daysFromNow(-3), "i2", { p1: 20 }),
    ];
    const poll = buildPoll(surveys, PARTIES);
    const result = computeCoalitionSet("1", poll, true);
    const spd = result.find((r) => r.name === "SPD");
    expect(spd!.value).toBe(25);
  });

  it("returns empty array when no surveys match parliamentId", () => {
    const surveys = [makeSurvey("s1", "99", daysFromNow(-5), "i1", { p1: 20 })];
    const poll = buildPoll(surveys, PARTIES);
    const result = computeCoalitionSet("1", poll, true);
    expect(result).toEqual([]);
  });

  it("uses the most recent survey per institute when within 30-day window", () => {
    const surveys = [
      makeSurvey("s1", "1", daysFromNow(-5), "i1", { p1: 20 }),
      makeSurvey("s2", "1", daysFromNow(-3), "i2", { p1: 30 }),
    ];
    const poll = buildPoll(surveys, PARTIES);
    const result = computeCoalitionSet("1", poll, true);
    const spd = result.find((r) => r.name === "SPD");
    expect(spd!.value).toBe(25);
  });
});
