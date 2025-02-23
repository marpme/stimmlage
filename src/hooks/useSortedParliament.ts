import { useMemo } from "react";

import { Party } from "../utils/Party.ts";

export const getSortingValueOfParty = (partyName: string) => {
  switch (partyName) {
    case Party.AFD:
      return -1;
    case Party.FW:
      return -2;
    case Party.UNION:
      return -2;
    case Party.CDU:
      return -2;
    case Party.CSU:
      return -2;
    case Party.FDP:
      return -3;
    case Party.SPD:
      return -4;
    case Party.GREENS:
      return -5;
    case Party.LEFT:
      return -6;
    case Party.LEFT2:
      return -7;
    case Party.OTHERS:
    default:
      return -8;
  }
};

export const useSortedParliament = <T extends Array<{ name: string }>>(
  data: T,
) => {
  return useMemo(
    () =>
      data.sort(
        (a, b) =>
          getSortingValueOfParty(a.name) - getSortingValueOfParty(b.name),
      ),
    [data],
  );
};
