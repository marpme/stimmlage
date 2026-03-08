import { useMemo } from "react";

import { Poll } from "@/assets/poll.ts";
import { getPartyColor } from "@/utils/getPartyColor.ts";
import { useTheme } from "@/hooks/use-theme.ts";

export type TimelinePoint = { date: Date; value: number };

export type TimelinePartyData = {
  party: string;
  color: string;
  /** Raw survey points — rendered as faint scatter dots */
  raw: TimelinePoint[];
  /** Rolling-average line — rendered as the smooth trend line */
  smooth: TimelinePoint[];
};

const FIVE_PERCENT_THRESHOLD = 5;
/** Number of days on each side of a point to include in the rolling average */
const ROLLING_DAYS = 14;

function rollingAverage(points: TimelinePoint[], halfWindowDays: number): TimelinePoint[] {
  const windowMs = halfWindowDays * 24 * 60 * 60 * 1000;
  return points.map((p) => {
    const t = p.date.getTime();
    const inWindow = points.filter(
      (q) => Math.abs(q.date.getTime() - t) <= windowMs,
    );
    const avg = inWindow.reduce((sum, q) => sum + q.value, 0) / inWindow.length;
    return { date: p.date, value: avg };
  });
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
        if (shortcut && !shortcut.includes("Sonstige") && pct >= FIVE_PERCENT_THRESHOLD) {
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
      raw,
      smooth: rollingAverage(raw, ROLLING_DAYS),
    }));
  }, [parliamentId, pollData, isLight]);
};
