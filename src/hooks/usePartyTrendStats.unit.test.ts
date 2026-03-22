import { describe, it, expect } from "vitest";
import type { Poll } from "@/assets/poll";
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

function buildPoll(surveys: Array<ReturnType<typeof makeSurvey>>) {
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
    Parties: {
      p1: { Shortcut: "SPD", Name: "Sozialdemokraten" },
    },
    Surveys: Object.fromEntries(surveys),
  } as unknown as Poll;
}

describe("surveysForParliament", () => {
  it("returns surveys filtered by parliamentId sorted newest-first", () => {
    const surveys = [
      makeSurvey("s1", "1", daysFromNow(-10), "i1", { p1: 20 }),
      makeSurvey("s2", "2", daysFromNow(-5), "i1", { p1: 20 }),
      makeSurvey("s3", "1", daysFromNow(-3), "i1", { p1: 25 }),
    ];
    const poll = buildPoll(surveys);
    const result = surveysForParliament("1", poll);
    expect(result).toHaveLength(2);
    expect(result[0].Date.getTime()).toBeGreaterThan(result[1].Date.getTime());
  });

  it("returns empty array when no surveys match", () => {
    const poll = buildPoll([]);
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
    const poll = buildPoll(surveys);
    const result = latestPerInstitute("1", poll);
    expect(result.get("SPD")).toEqual([25, 30]);
  });

  it("returns empty map when no surveys match parliament", () => {
    const poll = buildPoll([]);
    expect(latestPerInstitute("nonexistent", poll).size).toBe(0);
  });
});

describe("averageAtCutoff", () => {
  it("returns empty map when fewer than 2 institutes exist", () => {
    const surveys = [makeSurvey("s1", "1", daysFromNow(-5), "i1", { p1: 20 })];
    const poll = buildPoll(surveys);
    const result = averageAtCutoff("1", poll, new Date());
    expect(result.size).toBe(0);
  });

  it("averages the most recent survey per institute before cutoff", () => {
    const surveys = [
      makeSurvey("s1", "1", daysFromNow(-5), "i1", { p1: 20 }),
      makeSurvey("s2", "1", daysFromNow(-3), "i1", { p1: 40 }),
      makeSurvey("s3", "1", daysFromNow(-4), "i2", { p1: 30 }),
    ];
    const poll = buildPoll(surveys);
    const result = averageAtCutoff("1", poll, new Date());
    expect(result.get("SPD")).toBe(35);
  });

  it("excludes surveys after the cutoff date", () => {
    const surveys = [
      makeSurvey("s1", "1", daysFromNow(-5), "i1", { p1: 10 }),
      makeSurvey("s2", "1", daysFromNow(-20), "i2", { p1: 30 }),
    ];
    const poll = buildPoll(surveys);
    const result = averageAtCutoff("1", poll, daysFromNow(-10));
    expect(result.size).toBe(0);
  });
});
