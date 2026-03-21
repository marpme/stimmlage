import { useMemo } from "react";

import { getPartyColor } from "../utils/getPartyColor.ts";

import { useTheme } from "@/hooks/use-theme.ts";
import { PartyEntry } from "@/types/PartyEntry.ts";
import { Poll } from "@/assets/poll.ts";

export function computeCoalitionSet(
  parliamentId: string,
  data: Poll | undefined,
  isLight: boolean,
): Array<PartyEntry> {
  if (!data) return [];
  const allSurveys = Object.values(data.Surveys)
    .filter((e) => e.Parliament_ID === parliamentId)
    .toSorted((a, b) => (a.Date > b.Date ? -1 : a.Date < b.Date ? 1 : 0));

  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const withinWindow = allSurveys.filter((e) => e.Date >= cutoff);
  const uniqueInstitutesInWindow = new Set(
    withinWindow.map((e) => e.Institute_ID),
  ).size;
  const recentSurveys =
    uniqueInstitutesInWindow >= 2 ? withinWindow : allSurveys;

  const instituteResult = Object.entries(
    Object.groupBy(recentSurveys, (e) => e.Institute_ID),
  ).map(([instituteId, institutePolls]) => ({
    name: instituteId,
    value: Object.entries(institutePolls!.at(0)!.Results).map(
      ([partyId, pollResult]) => ({
        name: data.Parties[partyId].Shortcut,
        color: getPartyColor(isLight, data.Parties[partyId].Shortcut),
        value: pollResult,
        date: institutePolls!.at(0)!.Date,
      }),
    ),
  }));

  const pollsPerParty = Object.entries(
    Object.groupBy(
      instituteResult.flatMap((e) => e.value),
      (e) => e.name,
    ),
  );

  return pollsPerParty.map(([partyName, partyPolls]) => ({
    name: partyName,
    value:
      partyPolls!.reduce((sum, e) => sum + e.value, 0) / partyPolls!.length,
    color: partyPolls!.at(0)!.color,
    date: partyPolls!.at(0)!.date,
  }));
}

export const useSetOfCoalition = (
  parliamentId: string,
  data?: Poll,
): Array<PartyEntry> => {
  const { isLight } = useTheme();

  return useMemo(() => {
    if (!data) return [];
    return computeCoalitionSet(parliamentId, data, isLight);
  }, [parliamentId, data, isLight]);
};
