import { useMemo } from "react";
import { Poll, Survey } from "@/assets/poll.ts";
import { getPartyColor } from "@/utils/getPartyColor.ts";
import { useTheme } from "@/hooks/use-theme.ts";

export type PartyTrendStat = {
  name: string;
  color: string;
  current: number;
  delta30: number | null;
  delta90: number | null;
  spread: number | null;
};

/** Returns all surveys for a given parliament, sorted newest-first. */
export function surveysForParliament(
  parliamentId: string,
  pollData: Poll,
): Survey[] {
  return Object.values(pollData.Surveys)
    .filter((s) => s.Parliament_ID === parliamentId)
    .sort((a, b) => (a.Date > b.Date ? -1 : a.Date < b.Date ? 1 : 0));
}

/**
 * For each institute, get its most recent survey for this parliament.
 * Returns a map: partyShortcut → array of values (one per institute).
 */
export function latestPerInstitute(
  parliamentId: string,
  pollData: Poll,
): Map<string, number[]> {
  const byInstitute = new Map<string, Survey>();
  for (const survey of surveysForParliament(parliamentId, pollData)) {
    if (!byInstitute.has(survey.Institute_ID)) {
      byInstitute.set(survey.Institute_ID, survey);
    }
  }

  const result = new Map<string, number[]>();
  for (const survey of byInstitute.values()) {
    for (const [partyId, value] of Object.entries(survey.Results)) {
      const shortcut = pollData.Parties[partyId]?.Shortcut;
      if (!shortcut) continue;
      if (!result.has(shortcut)) result.set(shortcut, []);
      result.get(shortcut)!.push(value);
    }
  }
  return result;
}

/**
 * Average each institute's most recent poll within a date window (surveys
 * published on or before `cutoffDate`). Returns map: partyShortcut → average.
 */
export function averageAtCutoff(
  parliamentId: string,
  pollData: Poll,
  cutoffDate: Date,
): Map<string, number> {
  const all = surveysForParliament(parliamentId, pollData).filter(
    (s) => new Date(s.Date) <= cutoffDate,
  );

  const byInstitute = new Map<string, Survey>();
  for (const survey of all) {
    if (!byInstitute.has(survey.Institute_ID)) {
      byInstitute.set(survey.Institute_ID, survey);
    }
  }

  // Need at least 2 institutes' worth of data for a valid window average
  if (byInstitute.size < 2) return new Map();

  const sums = new Map<string, { total: number; count: number }>();
  for (const survey of byInstitute.values()) {
    for (const [partyId, value] of Object.entries(survey.Results)) {
      const shortcut = pollData.Parties[partyId]?.Shortcut;
      if (!shortcut) continue;
      if (!sums.has(shortcut)) sums.set(shortcut, { total: 0, count: 0 });
      const entry = sums.get(shortcut)!;
      entry.total += value;
      entry.count += 1;
    }
  }

  const result = new Map<string, number>();
  for (const [name, { total, count }] of sums) {
    result.set(name, total / count);
  }
  return result;
}

export function usePartyTrendStats(
  parliamentId: string,
  pollData: Poll | undefined,
): PartyTrendStat[] {
  const { isLight } = useTheme();

  return useMemo(() => {
    if (!pollData) return [];

    const now = new Date();
    const cutoff30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const cutoff90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const currentMap = latestPerInstitute(parliamentId, pollData);
    const avg30Map = averageAtCutoff(parliamentId, pollData, cutoff30);
    const avg90Map = averageAtCutoff(parliamentId, pollData, cutoff90);

    const stats: PartyTrendStat[] = [];

    for (const [name, values] of currentMap) {
      if (name.includes("Sonstige")) continue;

      const current = values.reduce((s, v) => s + v, 0) / values.length;
      const color = getPartyColor(isLight, name);

      const past30 = avg30Map.get(name);
      const past90 = avg90Map.get(name);

      const delta30 =
        past30 !== undefined ? parseFloat((current - past30).toFixed(1)) : null;
      const delta90 =
        past90 !== undefined ? parseFloat((current - past90).toFixed(1)) : null;

      const spread =
        values.length >= 2
          ? parseFloat((Math.max(...values) - Math.min(...values)).toFixed(1))
          : null;

      stats.push({ name, color, current, delta30, delta90, spread });
    }

    return stats.sort((a, b) => b.current - a.current);
  }, [parliamentId, pollData, isLight]);
}
