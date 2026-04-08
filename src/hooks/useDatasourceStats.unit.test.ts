import { describe, it, expect } from "vitest";
import { computeDatasourceStats } from "./useDatasourceStats.ts";
import { Poll } from "@/assets/poll.ts";

// ── helpers ──────────────────────────────────────────────────────────────────

function makePoll(overrides: Partial<Poll> = {}): Poll {
  return {
    Database: {
      License: { Name: "ODbL", Shortcut: "ODbL", Link: "https://opendatacommons.org/licenses/odbl/" },
      Publisher: "dawum.de",
      Author: "Test Author",
      Last_Update: new Date("2025-01-01"),
    },
    Parliaments: {
      "0": { Shortcut: "Bundestag", Name: "Bundestag", Election: "Bundestagswahl" },
      "1": { Shortcut: "Bayern", Name: "Bayerischer Landtag", Election: "Landtagswahl Bayern" },
    },
    Institutes: {
      "1": { Name: "Institut A" },
      "2": { Name: "Institut B" },
    },
    Taskers: {
      "1": { Name: "ARD" },
      "2": { Name: "ZDF" },
    },
    Methods: {
      "1": { Name: "Telefonisch" },
      "2": { Name: "Online" },
    },
    Parties: {
      "1": { Shortcut: "SPD", Name: "Sozialdemokratische Partei Deutschlands" },
      "2": { Shortcut: "CDU", Name: "Christlich Demokratische Union" },
    },
    Surveys: {},
    ...overrides,
  };
}

function makeSurvey(
  date: string,
  instituteId: string,
  parliamentId: string,
  persons: number,
  methodId = "1",
) {
  return {
    Date: new Date(date),
    Survey_Period: { Date_Start: new Date(date), Date_End: new Date(date) },
    Surveyed_Persons: String(persons),
    Parliament_ID: parliamentId,
    Institute_ID: instituteId,
    Tasker_ID: "1",
    Method_ID: methodId,
    Results: { "1": 30, "2": 40 },
  };
}

function compute(poll: Poll | undefined) {
  if (!poll) return null;
  return computeDatasourceStats(poll);
}

// ── tests ────────────────────────────────────────────────────────────────────

describe("useDatasourceStats", () => {
  it("returns null when pollData is undefined", () => {
    expect(compute(undefined)).toBeNull();
  });

  it("returns null when pollData is null-ish", () => {
    expect(compute(undefined)).toBeNull();
  });

  describe("totals", () => {
    it("counts surveys correctly", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-03-01", "1", "0", 1000),
          "2": makeSurvey("2024-04-01", "2", "0", 2000),
          "3": makeSurvey("2024-05-01", "1", "1", 1500),
        },
      });
      const stats = compute(poll)!;
      expect(stats.totalSurveys).toBe(3);
    });

    it("sums total persons surveyed", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-03-01", "1", "0", 1000),
          "2": makeSurvey("2024-04-01", "2", "0", 2000),
        },
      });
      expect(compute(poll)!.totalPersonsSurveyed).toBe(3000);
    });

    it("computes average persons per survey", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-03-01", "1", "0", 1000),
          "2": makeSurvey("2024-04-01", "2", "0", 3000),
        },
      });
      expect(compute(poll)!.avgPersonsPerSurvey).toBe(2000);
    });

    it("computes median persons per survey (odd count)", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-01", "1", "0", 500),
          "2": makeSurvey("2024-02-01", "1", "0", 1000),
          "3": makeSurvey("2024-03-01", "1", "0", 3000),
        },
      });
      expect(compute(poll)!.medianPersonsPerSurvey).toBe(1000);
    });

    it("computes median persons per survey (even count)", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-01", "1", "0", 500),
          "2": makeSurvey("2024-02-01", "1", "0", 1500),
          "3": makeSurvey("2024-03-01", "1", "0", 2000),
          "4": makeSurvey("2024-04-01", "1", "0", 3000),
        },
      });
      // median of [500, 1500, 2000, 3000] = (1500+2000)/2 = 1750
      expect(compute(poll)!.medianPersonsPerSurvey).toBe(1750);
    });

    it("reports min and max persons", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-01", "1", "0", 500),
          "2": makeSurvey("2024-02-01", "1", "0", 5000),
        },
      });
      const stats = compute(poll)!;
      expect(stats.minPersons).toBe(500);
      expect(stats.maxPersons).toBe(5000);
    });

    it("counts unique institutes with surveys", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-01", "1", "0", 1000),
          "2": makeSurvey("2024-02-01", "1", "0", 1000), // same institute
        },
      });
      expect(compute(poll)!.totalInstitutes).toBe(1);
    });

    it("counts parties and taskers from poll metadata", () => {
      const poll = makePoll({
        Surveys: { "1": makeSurvey("2024-01-01", "1", "0", 1000) },
      });
      const stats = compute(poll)!;
      expect(stats.totalParties).toBe(2);
      expect(stats.totalTaskers).toBe(2);
    });
  });

  describe("date range and span", () => {
    it("computes first and last dates", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2022-01-15", "1", "0", 1000),
          "2": makeSurvey("2024-06-20", "2", "0", 1000),
        },
      });
      const stats = compute(poll)!;
      expect(stats.dateRange.first.toISOString().slice(0, 10)).toBe("2022-01-15");
      expect(stats.dateRange.last.toISOString().slice(0, 10)).toBe("2024-06-20");
    });

    it("computes span in days", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-01", "1", "0", 1000),
          "2": makeSurvey("2024-01-31", "2", "0", 1000),
        },
      });
      expect(compute(poll)!.spanDays).toBe(30);
    });
  });

  describe("recent activity", () => {
    it("counts surveys within last 30 and 90 days", () => {
      const now = new Date();
      const minus20 = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      const minus60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      const minus120 = new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey(minus20, "1", "0", 1000),  // within 30d and 90d
          "2": makeSurvey(minus60, "1", "0", 1000),  // within 90d only
          "3": makeSurvey(minus120, "1", "0", 1000), // outside both
        },
      });
      const stats = compute(poll)!;
      expect(stats.surveysLast30Days).toBe(1);
      expect(stats.surveysLast90Days).toBe(2);
    });
  });

  describe("institute stats", () => {
    it("sorts institutes by survey count descending", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-01", "2", "0", 1000),
          "2": makeSurvey("2024-02-01", "1", "0", 1000),
          "3": makeSurvey("2024-03-01", "1", "0", 1000),
        },
      });
      const { institutes } = compute(poll)!;
      expect(institutes[0].name).toBe("Institut A"); // 2 surveys
      expect(institutes[1].name).toBe("Institut B"); // 1 survey
    });

    it("computes average persons per institute", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-01", "1", "0", 1000),
          "2": makeSurvey("2024-02-01", "1", "0", 3000),
        },
      });
      expect(compute(poll)!.institutes[0].avgPersons).toBe(2000);
    });

    it("tracks distinct parliaments per institute", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-01", "1", "0", 1000),
          "2": makeSurvey("2024-02-01", "1", "1", 1000),
          "3": makeSurvey("2024-03-01", "1", "0", 1000), // duplicate parliament
        },
      });
      expect(compute(poll)!.institutes[0].parliaments.size).toBe(2);
    });

    it("excludes institutes with no surveys", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-01", "1", "0", 1000),
          // institute "2" has no surveys
        },
      });
      const names = compute(poll)!.institutes.map((i) => i.name);
      expect(names).toContain("Institut A");
      expect(names).not.toContain("Institut B");
    });
  });

  describe("concentration metrics", () => {
    it("computes top institute share as percentage", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-01", "1", "0", 1000),
          "2": makeSurvey("2024-02-01", "1", "0", 1000),
          "3": makeSurvey("2024-03-01", "2", "0", 1000),
          "4": makeSurvey("2024-04-01", "2", "0", 1000),
        },
      });
      // 2 surveys each out of 4 → 50% each for top
      expect(compute(poll)!.topInstituteShare).toBe(50);
    });

    it("computes top-3 institute share (with fewer than 3 institutes)", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-01", "1", "0", 1000),
          "2": makeSurvey("2024-02-01", "2", "0", 1000),
        },
      });
      // only 2 institutes, top 3 = 100%
      expect(compute(poll)!.top3InstituteShare).toBe(100);
    });
  });

  describe("coverage gaps", () => {
    it("detects no gaps when every month is covered", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-15", "1", "0", 1000),
          "2": makeSurvey("2024-02-10", "1", "0", 1000),
          "3": makeSurvey("2024-03-20", "1", "0", 1000),
        },
      });
      const stats = compute(poll)!;
      // Jan, Feb, Mar covered → 0 gaps for those months
      expect(stats.coverageGaps.length).toBe(0);
    });

    it("detects a gap when a month has no Bundestag survey", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-15", "1", "0", 1000),
          // February missing
          "2": makeSurvey("2024-03-20", "1", "0", 1000),
        },
      });
      const stats = compute(poll)!;
      expect(stats.coverageGaps).toContainEqual({ year: 2024, month: 1 }); // month 1 = February
    });

    it("does not flag Landtag surveys as covering Bundestag months", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-15", "1", "0", 1000),
          // February: only Landtag survey, not Bundestag
          "2": makeSurvey("2024-02-10", "1", "1", 1000),
          "3": makeSurvey("2024-03-20", "1", "0", 1000),
        },
      });
      const stats = compute(poll)!;
      expect(stats.coverageGaps).toContainEqual({ year: 2024, month: 1 });
    });
  });

  describe("year buckets", () => {
    it("groups surveys by year with correct counts and averages", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2023-06-01", "1", "0", 1000),
          "2": makeSurvey("2023-09-01", "1", "0", 3000),
          "3": makeSurvey("2024-01-01", "1", "0", 2000),
        },
      });
      const { byYear } = compute(poll)!;
      const y2023 = byYear.find((y) => y.year === 2023)!;
      const y2024 = byYear.find((y) => y.year === 2024)!;
      expect(y2023.count).toBe(2);
      expect(y2023.avgPersons).toBe(2000);
      expect(y2024.count).toBe(1);
      expect(y2024.avgPersons).toBe(2000);
    });

    it("sorts year buckets ascending", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2025-01-01", "1", "0", 1000),
          "2": makeSurvey("2023-01-01", "1", "0", 1000),
          "3": makeSurvey("2024-01-01", "1", "0", 1000),
        },
      });
      const years = compute(poll)!.byYear.map((y) => y.year);
      expect(years).toEqual([2023, 2024, 2025]);
    });
  });

  describe("methods", () => {
    it("groups and sorts survey methods by count descending", () => {
      const poll = makePoll({
        Surveys: {
          "1": makeSurvey("2024-01-01", "1", "0", 1000, "1"),
          "2": makeSurvey("2024-02-01", "1", "0", 1000, "1"),
          "3": makeSurvey("2024-03-01", "1", "0", 1000, "2"),
        },
      });
      const { methods } = compute(poll)!;
      expect(methods[0].name).toBe("Telefonisch");
      expect(methods[0].count).toBe(2);
      expect(methods[1].name).toBe("Online");
      expect(methods[1].count).toBe(1);
    });
  });

  describe("meta fields", () => {
    it("exposes publisher, author, license and lastUpdate", () => {
      const poll = makePoll({
        Surveys: { "1": makeSurvey("2024-01-01", "1", "0", 1000) },
      });
      const stats = compute(poll)!;
      expect(stats.publisher).toBe("dawum.de");
      expect(stats.author).toBe("Test Author");
      expect(stats.license).toBe("ODbL");
      expect(stats.licenseLink).toBe("https://opendatacommons.org/licenses/odbl/");
    });
  });
});
