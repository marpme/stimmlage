import { PartyValues } from "@/utils/Party.ts";
import { useParliamentStore } from "@/model/useParliamentConfiguration.ts";
import { PartyEntry } from "@/types/PartyEntry.ts";
import { useCallback } from "react";

export const qualifiesAsParty = (party: PartyEntry) => {
  return party.value >= 5 && !party.name.includes("Sonstige");
};

export const useFivePercentBarrier = (
  data: Array<PartyEntry>,
): Array<PartyEntry> => {
  const { directCandidates } = useParliamentStore();

  const allowsForDirectEntry = useCallback(
    (party: PartyEntry) => {
      if (!directCandidates.has(party.name as PartyValues)) {
        // party has been selected for direct entry
        return false;
      }

      if (qualifiesAsParty(party)) {
        // party has qualified for direct entry
        return true;
      }

      if (directCandidates.has(party.name as PartyValues)) {
        // party has been selected for direct entry
        return true;
      }

      // user has selected party for direct entry
      return false;
    },
    [directCandidates],
  );

  return data.filter((partyEntry) => allowsForDirectEntry(partyEntry));
};
