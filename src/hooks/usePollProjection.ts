import { useMemo } from "react";
import { Poll } from "@/assets/poll.ts";
import { getPartyColor } from "@/utils/getPartyColor.ts";
import { useTheme } from "@/hooks/use-theme.ts";

export type PartyProjection = {
  name: string;
  color: string;
  fromDate: Date;
  fromValue: number;
  toDate: Date;
  toValue: number;
};

const MIN_POINTS = 5;
const WINDOW_DAYS = 60;
const PROJECT_DAYS = 30;

export function usePollProjection(
  parliamentId: string,
  pollData: Poll | undefined,
): PartyProjection[] {
  const { isLight } = useTheme();

  return useMemo(() => {
    if (!pollData) return [];

    const now = new Date();
    const windowStart = new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const projectTo = new Date(now.getTime() + PROJECT_DAYS * 24 * 60 * 60 * 1000);

    // Collect all surveys for this parliament within the window
    const surveys = Object.values(pollData.Surveys)
      .filter((s) => {
        if (s.Parliament_ID !== parliamentId) return false;
        const d = new Date(s.Date);
        return d >= windowStart && d <= now;
      })
      .sort((a, b) => (a.Date < b.Date ? -1 : 1));

    if (surveys.length === 0) return [];

    // Group surveys by date, averaging across institutes per date
    // Build: partyShortcut → Map<dateStr, { total, count }>
    const partyDateSums = new Map<string, Map<string, { total: number; count: number }>>();

    for (const survey of surveys) {
      const dateStr = new Date(survey.Date).toISOString().slice(0, 10);
      for (const [partyId, value] of Object.entries(survey.Results)) {
        const shortcut = pollData.Parties[partyId]?.Shortcut;
        if (!shortcut || shortcut.includes("Sonstige")) continue;

        if (!partyDateSums.has(shortcut)) {
          partyDateSums.set(shortcut, new Map());
        }
        const dateMap = partyDateSums.get(shortcut)!;
        if (!dateMap.has(dateStr)) {
          dateMap.set(dateStr, { total: 0, count: 0 });
        }
        const entry = dateMap.get(dateStr)!;
        entry.total += value;
        entry.count += 1;
      }
    }

    const projections: PartyProjection[] = [];

    for (const [name, dateMap] of partyDateSums) {
      // Build sorted [date, avgValue] points
      const points: [Date, number][] = [...dateMap.entries()]
        .map(([dateStr, { total, count }]) => [new Date(dateStr), total / count] as [Date, number])
        .sort((a, b) => a[0].getTime() - b[0].getTime());

      if (points.length < MIN_POINTS) continue;

      // Convert to numeric x (ms since epoch) for regression
      const xs = points.map(([d]) => d.getTime());
      const ys = points.map(([, v]) => v);

      // Manual ordinary least squares: y = slope * x + intercept
      const n = xs.length;
      const meanX = xs.reduce((s, v) => s + v, 0) / n;
      const meanY = ys.reduce((s, v) => s + v, 0) / n;
      const ssXX = xs.reduce((s, v) => s + (v - meanX) ** 2, 0);
      const ssXY = xs.reduce((s, v, i) => s + (v - meanX) * (ys[i] - meanY), 0);
      const slope = ssXX === 0 ? 0 : ssXY / ssXX;
      const intercept = meanY - slope * meanX;

      const lastPoint = points[points.length - 1];
      const fromDate = lastPoint[0];
      const fromValue = lastPoint[1];

      const toX = projectTo.getTime();
      const rawToValue = slope * toX + intercept;
      const toValue = Math.max(0, Math.min(100, rawToValue));

      const color = getPartyColor(isLight, name);

      projections.push({ name, color, fromDate, fromValue, toDate: projectTo, toValue });
    }

    return projections;
  }, [parliamentId, pollData, isLight]);
}
