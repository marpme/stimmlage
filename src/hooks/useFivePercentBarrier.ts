import { PartyValues } from "@/utils/Party.ts";
import { useParliamentStore } from "@/model/useParliamentConfiguration.ts";
import { PartyEntry } from "@/types/PartyEntry.ts";

export const useFivePercentBarrier = (
  data: Array<PartyEntry>,
): Array<PartyEntry> => {
  const { directCandidates } = useParliamentStore();

  return data.filter(
    (e) =>
      (e.value >= 5 || directCandidates.includes(e.name as PartyValues)) &&
      !e.name.includes("Sonstige"),
  );
};
