import { useMemo } from "react";

import { Poll } from "../utils/poller.ts";
import { getPartyColor } from "../utils/getPartyColor.ts";
import { PartyValues } from "../utils/Party.ts";

import { useTheme } from "@/hooks/use-theme.ts";
import { PartyEntry } from "@/types/PartyEntry.ts";

export const useSetOfCoalition = (
  parliamentId: string,
  data: Poll,
  directCandidates: PartyValues[],
): Array<PartyEntry> => {
  const { isLight } = useTheme();

  return useMemo(() => {
    const instituteResult = Object.entries(
      Object.groupBy(
        Object.values(data.Surveys)
          .filter((e) => e.Parliament_ID === parliamentId)
          .toSorted((a, b) => (a.Date > b.Date ? -1 : a.Date < b.Date ? 1 : 0)),
        (e) => e.Institute_ID,
      ),
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

    // generate average poll result for each party mixing all institute results
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
  }, [parliamentId, data, directCandidates]);
};
