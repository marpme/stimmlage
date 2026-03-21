import { describe, it, expect } from "vitest";
import type { Poll } from "@/assets/poll";
import type { PartyEntry } from "@/types/PartyEntry";
import { applyFivePercentBarrier } from "@/hooks/useFivePercentBarrier";
import { computeCoalitionSet } from "@/hooks/useSetOfCoalition";
import { getSortingValueOfParty } from "@/hooks/useSortedParliament";
import {
  surveysForParliament,
  latestPerInstitute,
  averageAtCutoff,
} from "@/hooks/usePartyTrendStats";

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

function makeParties(
  parties: Array<{ id: string; shortcut: string; name: string }>,
) {
  return Object.fromEntries(
    parties.map((p) => [p.id, { Shortcut: p.shortcut, Name: p.name }]),
  );
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
    Parties: makeParties(parties),
    Surveys: Object.fromEntries(surveys),
  } as unknown as Poll;
}

const PARTIES = [
  { id: "p1", shortcut: "SPD", name: "Sozialdemokraten" },
  { id: "p2", shortcut: "CDU/CSU", name: "Union" },
  { id: "p3", shortcut: "AfD", name: "AfD" },
  { id: "p4", shortcut: "Sonstige", name: "Sonstige" },
];

describe("applyFivePercentBarrier", () => {
  const parties: PartyEntry[] = [
    { name: "SPD", value: 25, color: "#E3000F", date: new Date() },
    { name: "CDU/CSU", value: 4.9, color: "#000", date: new Date() },
    { name: "Grüne", value: 5, color: "#46962B", date: new Date() },
    { name: "Sonstige", value: 10, color: "#ccc", date: new Date() },
    { name: "BSW", value: 4, color: "#7b2450", date: new Date() },
  ];

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

describe("surveysForParliament", () => {
  it("returns surveys filtered by parliamentId sorted newest-first", () => {
    const surveys = [
      makeSurvey("s1", "1", daysFromNow(-10), "i1", { p1: 20 }),
      makeSurvey("s2", "2", daysFromNow(-5), "i1", { p1: 20 }),
      makeSurvey("s3", "1", daysFromNow(-3), "i1", { p1: 25 }),
    ];
    const poll = buildPoll(surveys, PARTIES);
    const result = surveysForParliament("1", poll);
    expect(result).toHaveLength(2);
    expect(result[0].Date.getTime()).toBeGreaterThan(result[1].Date.getTime());
  });

  it("returns empty array when no surveys match", () => {
    const poll = buildPoll([], PARTIES);
    expect(surveysForParliament("nonexistent", poll)).toEqual([]);
  });
});

describe("latestPerInstitute", () => {
  it("returns most recent survey per institute", () => {
    const surveys = [
      makeSurvey("s1", "1", daysFromNow(-20), "i1", { p1: 10 }),
      makeSurvey("s2", "1", daysFromNow(-5), "i1", { p1: 30 }),
      makeSurvey("s3", "1", daysFromNow(-3), "i2", { p1: 25 }),
    ];
    const poll = buildPoll(surveys, PARTIES);
    const result = latestPerInstitute("1", poll);
    // i1 first seen in s1 (newest-first order → s3,s2,s1 → s1 is last), i2 first seen in s3
    // byInstitute iteration: s3(i2) first → i2 added, s2(i1) → i1 added, s1(i1) skipped
    // values: [s3(i2, SPD=25), s2(i1, SPD=30)]
    expect(result.get("SPD")).toEqual([25, 30]);
  });

  it("returns empty map when no surveys match parliament", () => {
    const poll = buildPoll([], PARTIES);
    expect(latestPerInstitute("nonexistent", poll).size).toBe(0);
  });
});

describe("averageAtCutoff", () => {
  it("returns empty map when fewer than 2 institutes exist", () => {
    const surveys = [makeSurvey("s1", "1", daysFromNow(-5), "i1", { p1: 20 })];
    const poll = buildPoll(surveys, PARTIES);
    const result = averageAtCutoff("1", poll, new Date());
    expect(result.size).toBe(0);
  });

  it("averages the most recent survey per institute before cutoff", () => {
    const surveys = [
      makeSurvey("s1", "1", daysFromNow(-5), "i1", { p1: 20 }),
      makeSurvey("s2", "1", daysFromNow(-3), "i1", { p1: 40 }),
      makeSurvey("s3", "1", daysFromNow(-4), "i2", { p1: 30 }),
    ];
    const poll = buildPoll(surveys, PARTIES);
    const result = averageAtCutoff("1", poll, new Date());
    expect(result.get("SPD")).toBe(35);
  });

  it("excludes surveys after the cutoff date", () => {
    const surveys = [
      makeSurvey("s1", "1", daysFromNow(-5), "i1", { p1: 10 }),
      makeSurvey("s2", "1", daysFromNow(-20), "i2", { p1: 30 }),
    ];
    const poll = buildPoll(surveys, PARTIES);
    const result = averageAtCutoff("1", poll, daysFromNow(-10));
    expect(result.size).toBe(0);
  });
});
