import { useMemo } from "react";
import { Poll } from "@/assets/poll.ts";

export interface InstituteStats {
  id: string;
  name: string;
  surveyCount: number;
  totalPersons: number;
  avgPersons: number;
  parliaments: Set<string>;
  firstDate: Date;
  lastDate: Date;
  daysSinceLastSurvey: number;
  surveysLast90Days: number;
}

export interface ParliamentStats {
  id: string;
  shortcut: string;
  name: string;
  surveyCount: number;
  institutes: Set<string>;
  firstDate: Date;
  lastDate: Date;
  daysSinceLastSurvey: number;
  surveysLast90Days: number;
}

export interface MethodStats {
  name: string;
  count: number;
}

export interface YearStats {
  year: number;
  count: number;
  totalPersons: number;
  avgPersons: number;
}

// Months with zero surveys — a coverage gap
export interface CoverageGap {
  year: number;
  month: number; // 0-based
}

export interface DatasourceStats {
  // Totals
  totalSurveys: number;
  totalPersonsSurveyed: number;
  avgPersonsPerSurvey: number;
  medianPersonsPerSurvey: number;
  minPersons: number;
  maxPersons: number;
  totalInstitutes: number;
  totalParliaments: number;
  totalParties: number;
  totalTaskers: number;
  totalMethods: number;

  // Time coverage
  dateRange: { first: Date; last: Date };
  spanDays: number;
  surveysLast30Days: number;
  surveysLast90Days: number;
  avgSurveysPerMonth: number;
  coverageGaps: CoverageGap[];
  bundestagMonthCounts: Map<string, number>; // "YYYY-M" → survey count // calendar months with 0 surveys (Bundestag)

  // Concentration
  topInstituteShare: number; // % of all surveys by top institute
  top3InstituteShare: number; // % by top 3

  // Per-entity lists
  institutes: InstituteStats[];
  parliaments: ParliamentStats[];
  methods: MethodStats[];
  byYear: YearStats[];

  // Meta
  publisher: string;
  author: string;
  lastUpdate: Date;
  license: string;
  licenseLink: string;
}

export function computeDatasourceStats(pollData: Poll): DatasourceStats {
    const surveys = Object.values(pollData.Surveys);
    const now = Date.now();
    const ms30 = 30 * 24 * 60 * 60 * 1000;
    const ms90 = 90 * 24 * 60 * 60 * 1000;

    // ── Per-institute ───────────────────────────────────────────────────────
    const instituteMap = new Map<string, InstituteStats>();
    for (const [id, inst] of Object.entries(pollData.Institutes)) {
      instituteMap.set(id, {
        id,
        name: inst.Name,
        surveyCount: 0,
        totalPersons: 0,
        avgPersons: 0,
        parliaments: new Set(),
        firstDate: new Date(8640000000000000),
        lastDate: new Date(-8640000000000000),
        daysSinceLastSurvey: 0,
        surveysLast90Days: 0,
      });
    }

    // ── Per-parliament ──────────────────────────────────────────────────────
    const parliamentMap = new Map<string, ParliamentStats>();
    for (const [id, p] of Object.entries(pollData.Parliaments)) {
      parliamentMap.set(id, {
        id,
        shortcut: p.Shortcut,
        name: p.Name,
        surveyCount: 0,
        institutes: new Set(),
        firstDate: new Date(8640000000000000),
        lastDate: new Date(-8640000000000000),
        daysSinceLastSurvey: 0,
        surveysLast90Days: 0,
      });
    }

    const methodCount = new Map<string, number>();
    const yearBuckets = new Map<number, { count: number; persons: number }>();

    // Month coverage for Bundestag (id "0") — key: "YYYY-M", value: survey count
    const bundestagMonths = new Set<string>();
    const bundestagMonthCounts = new Map<string, number>();

    let totalPersons = 0;
    const allPersons: number[] = [];
    let minPersons = Infinity;
    let maxPersons = -Infinity;
    let firstDate = new Date(8640000000000000);
    let lastDate = new Date(-8640000000000000);
    let surveysLast30 = 0;
    let surveysLast90 = 0;

    for (const s of surveys) {
      const persons = parseInt(s.Surveyed_Persons, 10) || 0;
      const date = new Date(s.Date);
      const year = date.getFullYear();
      const age = now - date.getTime();

      totalPersons += persons;
      if (persons > 0) {
        allPersons.push(persons);
        if (persons < minPersons) minPersons = persons;
      }
      if (persons > maxPersons) maxPersons = persons;
      if (date < firstDate) firstDate = date;
      if (date > lastDate) lastDate = date;
      if (age <= ms30) surveysLast30++;
      if (age <= ms90) surveysLast90++;

      // Institute
      const inst = instituteMap.get(s.Institute_ID);
      if (inst) {
        inst.surveyCount++;
        inst.totalPersons += persons;
        inst.parliaments.add(s.Parliament_ID);
        if (date < inst.firstDate) inst.firstDate = date;
        if (date > inst.lastDate) inst.lastDate = date;
        if (age <= ms90) inst.surveysLast90Days++;
      }

      // Parliament
      const parl = parliamentMap.get(s.Parliament_ID);
      if (parl) {
        parl.surveyCount++;
        parl.institutes.add(s.Institute_ID);
        if (date < parl.firstDate) parl.firstDate = date;
        if (date > parl.lastDate) parl.lastDate = date;
        if (age <= ms90) parl.surveysLast90Days++;
      }

      // Bundestag month coverage — key: "YYYY-M" (unpadded, matches gap lookup)
      if (s.Parliament_ID === "0") {
        const mk = `${year}-${date.getMonth()}`;
        bundestagMonths.add(mk);
        bundestagMonthCounts.set(mk, (bundestagMonthCounts.get(mk) ?? 0) + 1);
      }

      // Method
      methodCount.set(s.Method_ID, (methodCount.get(s.Method_ID) ?? 0) + 1);

      // Year
      const yb = yearBuckets.get(year) ?? { count: 0, persons: 0 };
      yb.count++;
      yb.persons += persons;
      yearBuckets.set(year, yb);
    }

    // Median sample size
    allPersons.sort((a, b) => a - b);
    const mid = Math.floor(allPersons.length / 2);
    const median =
      allPersons.length % 2 === 0
        ? Math.round((allPersons[mid - 1] + allPersons[mid]) / 2)
        : allPersons[mid];

    // Finalise institutes
    const institutes: InstituteStats[] = Array.from(instituteMap.values())
      .filter((i) => i.surveyCount > 0)
      .map((i) => ({
        ...i,
        avgPersons: Math.round(i.totalPersons / i.surveyCount),
        daysSinceLastSurvey: Math.round((now - i.lastDate.getTime()) / (24 * 60 * 60 * 1000)),
      }))
      .sort((a, b) => b.surveyCount - a.surveyCount);

    // Concentration
    const totalSurveys = surveys.length;
    const topInstituteShare = institutes[0]
      ? Math.round((institutes[0].surveyCount / totalSurveys) * 100)
      : 0;
    const top3Share = institutes.slice(0, 3).reduce((s, i) => s + i.surveyCount, 0);
    const top3InstituteShare = Math.round((top3Share / totalSurveys) * 100);

    const parliaments: ParliamentStats[] = Array.from(parliamentMap.values())
      .filter((p) => p.surveyCount > 0)
      .map((p) => ({
        ...p,
        daysSinceLastSurvey: Math.round((now - p.lastDate.getTime()) / (24 * 60 * 60 * 1000)),
      }))
      .sort((a, b) => b.surveyCount - a.surveyCount);

    const methods: MethodStats[] = Array.from(methodCount.entries())
      .map(([id, count]) => ({ name: pollData.Methods[id]?.Name ?? id, count }))
      .sort((a, b) => b.count - a.count);

    const byYear: YearStats[] = Array.from(yearBuckets.entries())
      .map(([year, { count, persons }]) => ({
        year,
        count,
        totalPersons: persons,
        avgPersons: Math.round(persons / count),
      }))
      .sort((a, b) => a.year - b.year);

    // Coverage gaps: months between firstDate and lastDate with no Bundestag survey.
    // Always set day=1 before advancing month to avoid JS date overflow
    // (e.g. Jan 31 + 1 month = Mar 3, skipping Feb entirely).
    // Guard: only run if we actually have Bundestag surveys.
    const coverageGaps: CoverageGap[] = [];
    if (bundestagMonths.size > 0) {
      const cur = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);
      const gapEnd = new Date(lastDate.getFullYear(), lastDate.getMonth(), 1);
      while (cur <= gapEnd) {
        const key = `${cur.getFullYear()}-${cur.getMonth()}`;
        if (!bundestagMonths.has(key)) {
          coverageGaps.push({ year: cur.getFullYear(), month: cur.getMonth() });
        }
        cur.setDate(1);
        cur.setMonth(cur.getMonth() + 1);
      }
    }

    const spanDays = Math.round(
      (lastDate.getTime() - firstDate.getTime()) / (24 * 60 * 60 * 1000),
    );

    return {
      totalSurveys,
      totalPersonsSurveyed: totalPersons,
      avgPersonsPerSurvey: Math.round(totalPersons / totalSurveys),
      medianPersonsPerSurvey: median,
      minPersons: minPersons === Infinity ? 0 : minPersons,
      maxPersons,
      totalInstitutes: institutes.length,
      totalParliaments: parliaments.length,
      totalParties: Object.keys(pollData.Parties).length,
      totalTaskers: Object.keys(pollData.Taskers).length,
      totalMethods: methods.length,
      dateRange: { first: firstDate, last: lastDate },
      spanDays,
      surveysLast30Days: surveysLast30,
      surveysLast90Days: surveysLast90,
      avgSurveysPerMonth: Math.round((totalSurveys / spanDays) * 30),
      coverageGaps,
      bundestagMonthCounts,
      topInstituteShare,
      top3InstituteShare,
      institutes,
      parliaments,
      methods,
      byYear,
      publisher: pollData.Database.Publisher,
      author: pollData.Database.Author,
      lastUpdate: new Date(pollData.Database.Last_Update),
      license: pollData.Database.License.Shortcut,
      licenseLink: pollData.Database.License.Link,
    };
}

export function useDatasourceStats(pollData: Poll | undefined): DatasourceStats | null {
  return useMemo(
    () => (pollData ? computeDatasourceStats(pollData) : null),
    [pollData],
  );
}
