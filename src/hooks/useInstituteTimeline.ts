import { useMemo } from "react";

import { Poll, Survey } from "@/assets/poll.ts";
import { getPartyColor } from "@/utils/getPartyColor.ts";
import { useTheme } from "@/hooks/use-theme.ts";
import {
  TimelinePartyData,
  TimelinePoint,
  rollingAverageLinear,
  monthlyBand,
} from "@/hooks/useTimelineSurveys.ts";

const FIVE_PERCENT_THRESHOLD = 5;

export const useInstituteTimeline = (
  instituteId: string,
  parliamentId: string,
  surveys: { [id: string]: Survey } | undefined,
  pollData: Poll | undefined,
): TimelinePartyData[] => {
  const { isLight } = useTheme();

  return useMemo(() => {
    if (!surveys || !pollData) return [];

    const filtered = Object.values(surveys)
      .filter(
        (s) =>
          s.Parliament_ID === parliamentId && s.Institute_ID === instituteId,
      )
      .toSorted((a, b) => (a.Date < b.Date ? -1 : a.Date > b.Date ? 1 : 0));

    if (filtered.length === 0) return [];

    const qualifyingParties = new Set<string>();
    for (const survey of filtered) {
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

    const isCduCsu = (shortcut: string) =>
      shortcut === "CDU" || shortcut === "CSU" || shortcut === "CDU/CSU";
    const CDU_CSU_KEY = "CDU/CSU";

    const partyMap = new Map<string, TimelinePoint[]>();
    for (const survey of filtered) {
      const surveyDate = new Date(survey.Date);
      let cduCsuTotal = 0;
      let hasCduCsu = false;

      for (const [partyId, pct] of Object.entries(survey.Results)) {
        const shortcut = pollData.Parties[partyId]?.Shortcut;
        if (!shortcut) continue;

        if (isCduCsu(shortcut)) {
          cduCsuTotal += pct;
          hasCduCsu = true;
          continue;
        }

        if (!qualifyingParties.has(shortcut)) continue;
        if (!partyMap.has(shortcut)) partyMap.set(shortcut, []);
        partyMap.get(shortcut)!.push({ date: surveyDate, value: pct });
      }

      if (hasCduCsu && (qualifyingParties.has("CDU") || qualifyingParties.has("CSU") || qualifyingParties.has(CDU_CSU_KEY))) {
        if (!partyMap.has(CDU_CSU_KEY)) partyMap.set(CDU_CSU_KEY, []);
        partyMap.get(CDU_CSU_KEY)!.push({ date: surveyDate, value: cduCsuTotal });
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
  }, [instituteId, parliamentId, surveys, pollData, isLight]);
};
