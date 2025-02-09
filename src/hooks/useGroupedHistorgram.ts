import { useMemo } from "react";

import { getPartyColor } from "../utils/getPartyColor.ts";
import { Poll } from "../assets/poll.ts";

import { useTheme } from "@/hooks/use-theme.ts";
import { PartyEntry } from "@/types/PartyEntry.ts";

export const useGroupedHistogram = (
  parliamentId: string,
  data: Poll,
): Array<PartyEntry> => {
  const { isLight } = useTheme();

  return useMemo(
    () =>
      Object.values(data.Surveys)
        .filter((e) => e.Parliament_ID === parliamentId)
        .flatMap((e) =>
          Object.entries(e.Results).map(([key, value]) => ({
            name: data.Parties[key].Shortcut,
            value: value,
            date: e.Date,
            color: getPartyColor(isLight, data.Parties[key].Shortcut),
          })),
        ),
    [data, parliamentId],
  );
};
