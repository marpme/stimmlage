import { useMemo } from "react";

import { Poll } from "@/assets/poll.ts";
import { getPartyColor } from "@/utils/getPartyColor.ts";
import { useTheme } from "@/hooks/use-theme.ts";

export type TimelinePoint = { date: Date; value: number };

export type TimelineBucket = {
  /** Mid-month date used as the x position */
  date: Date;
  min: number;
  max: number;
};

export type TimelinePartyData = {
  party: string;
  color: string;
  /** Rolling-average line — one point per raw survey, for the smooth trend */
  smooth: TimelinePoint[];
  /** Monthly min/max buckets — ~111 points, for the range band */
  band: TimelineBucket[];
  /** Sorted unique dates for binary-search tooltip lookup */
  sortedDates: Date[];
  /** Map from date timestamp → raw value for tooltip */
  valueByDate: Map<number, number>;
};

const FIVE_PERCENT_THRESHOLD = 5;
const ROLLING_DAYS = 14;
const ROLLING_MS = ROLLING_DAYS * 24 * 60 * 60 * 1000;

/** O(n) sliding-window rolling average. Points must be sorted ascending. */
function rollingAverageLinear(points: TimelinePoint[]): TimelinePoint[] {
  if (points.length === 0) return [];
  const result: TimelinePoint[] = new Array(points.length);
  let windowStart = 0;
  let windowSum = 0;
  for (let i = 0; i < points.length; i++) {
    windowSum += points[i].value;
    while (
      points[i].date.getTime() - points[windowStart].date.getTime() >
      ROLLING_MS
    ) {
      windowSum -= points[windowStart].value;
      windowStart++;
    }
    result[i] = {
      date: points[i].date,
      value: windowSum / (i - windowStart + 1),
    };
  }
  return result;
}

/** Bucket raw points into calendar months, returning min/max per bucket. */
function monthlyBand(points: TimelinePoint[]): TimelineBucket[] {
  if (points.length === 0) return [];
  const buckets = new Map<string, { min: number; max: number; ts: number }>();
  for (const p of points) {
    const key = `${p.date.getFullYear()}-${p.date.getMonth()}`;
    const existing = buckets.get(key);
    if (!existing) {
      buckets.set(key, { min: p.value, max: p.value, ts: p.date.getTime() });
    } else {
      if (p.value < existing.min) existing.min = p.value;
      if (p.value > existing.max) existing.max = p.value;
    }
  }
  return Array.from(buckets.values())
    .sort((a, b) => a.ts - b.ts)
    .map(({ min, max, ts }) => ({ date: new Date(ts), min, max }));
}

export const useTimelineSurveys = (
  parliamentId: string,
  pollData?: Poll,
): TimelinePartyData[] => {
  const { isLight } = useTheme();

  return useMemo(() => {
    if (!pollData) return [];

    const surveys = Object.values(pollData.Surveys)
      .filter((s) => s.Parliament_ID === parliamentId)
      .toSorted((a, b) => (a.Date < b.Date ? -1 : a.Date > b.Date ? 1 : 0));

    if (surveys.length === 0) return [];

    const qualifyingParties = new Set<string>();
    for (const survey of surveys) {
      for (const [partyId, pct] of Object.entries(survey.Results)) {
        const shortcut = pollData.Parties[partyId]?.Shortcut;
        if (
          shortcut &&
          !shortcut.includes("Sonstige") &&
          pct >= FIVE_PERCENT_THRESHOLD
        ) {
          qualifyingParties.add(shortcut);
        }
      }
    }

    const partyMap = new Map<string, TimelinePoint[]>();
    for (const survey of surveys) {
      const surveyDate = new Date(survey.Date);
      for (const [partyId, pct] of Object.entries(survey.Results)) {
        const shortcut = pollData.Parties[partyId]?.Shortcut;
        if (!shortcut || !qualifyingParties.has(shortcut)) continue;
        if (!partyMap.has(shortcut)) partyMap.set(shortcut, []);
        partyMap.get(shortcut)!.push({ date: surveyDate, value: pct });
      }
    }

    return Array.from(partyMap.entries()).map(([party, raw]) => ({
      party,
      color: getPartyColor(isLight, party),
      smooth: rollingAverageLinear(raw),
      band: monthlyBand(raw),
      sortedDates: raw.map((p) => p.date),
      valueByDate: new Map(raw.map((p) => [p.date.getTime(), p.value])),
    }));
  }, [parliamentId, pollData, isLight]);
};
