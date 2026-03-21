import { describe, it, expect } from "vitest";
import { projectPollData } from "@/hooks/usePollProjection";
import type { Poll } from "@/assets/poll";

const DAY = 24 * 60 * 60 * 1000;

function makeDate(daysFromNow: number): Date {
  return new Date(Date.now() + daysFromNow * DAY);
}

function makeParty(id: string, shortcut: string, name: string) {
  return [id, { Shortcut: shortcut, Name: name }] as const;
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
  surveys: ReturnType<typeof makeSurvey>[],
  parties: ReturnType<typeof makeParty>[],
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
      institute1: { Name: "Infratest" },
      institute2: { Name: "Forschungsgruppe" },
    },
    Taskers: {},
    Methods: {},
    Parties: Object.fromEntries(parties),
    Surveys: Object.fromEntries(surveys),
  } as unknown as Poll;
}

const PARTIES = [
  makeParty("p1", "SPD", "Sozialdemokratische Partei"),
  makeParty("p2", "CDU/CSU", "Christlich Demokratische Union"),
  makeParty("p3", "AfD", "Alternative für Deutschland"),
  makeParty("p4", "Sonstige", "Sonstige Parteien"),
];

describe("projectPollData", () => {
  it("returns empty array when pollData is undefined", () => {
    expect(projectPollData("1", undefined, new Date(), true)).toEqual([]);
  });

  it("returns empty array when no surveys match parliamentId", () => {
    const poll = buildPoll([], PARTIES);
    expect(projectPollData("nonexistent", poll, new Date(), true)).toEqual([]);
  });

  it("excludes parties with 'Sonstige' in shortcut", () => {
    const now = new Date();
    const surveys = [
      makeSurvey("s1", "1", makeDate(-5), "institute1", { p1: 25, p4: 10 }),
    ];
    const poll = buildPoll(surveys, PARTIES);
    const result = projectPollData("1", poll, now, true);
    const names = result.map((r) => r.name);
    expect(names).not.toContain("Sonstige");
  });

  it("returns empty array when fewer than MIN_POINTS surveys exist", () => {
    const now = new Date();
    const surveys = [
      makeSurvey("s1", "1", makeDate(-5), "institute1", { p1: 20 }),
      makeSurvey("s2", "1", makeDate(-4), "institute1", { p1: 22 }),
      makeSurvey("s3", "1", makeDate(-3), "institute1", { p1: 21 }),
    ];
    const poll = buildPoll(surveys, PARTIES);
    expect(projectPollData("1", poll, now, true)).toEqual([]);
  });

  it("produces a projection when enough surveys exist", () => {
    const now = new Date();
    const surveys = Array.from({ length: 6 }, (_, i) =>
      makeSurvey(`s${i}`, "1", makeDate(-(6 - i)), "institute1", {
        p1: 20 + i,
      }),
    );
    const poll = buildPoll(surveys, PARTIES);
    const result = projectPollData("1", poll, now, true);
    expect(result.length).toBeGreaterThan(0);
    const spd = result.find((r) => r.name === "SPD");
    expect(spd).toBeDefined();
    expect(typeof spd!.fromValue).toBe("number");
    expect(typeof spd!.toValue).toBe("number");
    expect(spd!.toDate > spd!.fromDate).toBe(true);
  });

  it("clamps projected values between 0 and 100", () => {
    const now = new Date();
    const surveys = Array.from({ length: 6 }, (_, i) =>
      makeSurvey(`s${i}`, "1", makeDate(-(6 - i)), "institute1", { p1: 99 }),
    );
    const poll = buildPoll(surveys, PARTIES);
    const result = projectPollData("1", poll, now, true);
    const spd = result.find((r) => r.name === "SPD");
    expect(spd!.toValue).toBeLessThanOrEqual(100);
    expect(spd!.toValue).toBeGreaterThanOrEqual(0);
  });

  it("returns one entry per qualifying party", () => {
    const now = new Date();
    const surveys = Array.from({ length: 6 }, (_, i) =>
      makeSurvey(`s${i}`, "1", makeDate(-(6 - i)), "institute1", {
        p1: 20,
        p2: 30,
      }),
    );
    const poll = buildPoll(surveys, PARTIES);
    const result = projectPollData("1", poll, now, true);
    const names = result.map((r) => r.name).sort();
    expect(names).toContain("SPD");
    expect(names).toContain("CDU/CSU");
  });

  it("filters surveys outside the 60-day window", () => {
    const now = new Date();
    const surveys = [
      ...Array.from({ length: 5 }, (_, i) =>
        makeSurvey(`s${i}`, "1", makeDate(-(5 + i)), "institute1", { p1: 20 }),
      ),
      makeSurvey("sold", "1", makeDate(-90), "institute1", { p1: 99 }),
      makeSurvey("snew", "1", makeDate(1), "institute1", { p1: 20 }),
    ];
    const poll = buildPoll(surveys, PARTIES);
    const result = projectPollData("1", poll, now, true);
    const spd = result.find((r) => r.name === "SPD");
    expect(spd!.fromValue).toBeCloseTo(20);
  });
});
