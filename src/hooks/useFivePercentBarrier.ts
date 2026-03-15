import { PartyEntry } from "@/types/PartyEntry.ts";

export const useFivePercentBarrier = (
  data: Array<PartyEntry>,
): Array<PartyEntry> => {
  return data.filter((party) => party.value >= 5 && !party.name.includes("Sonstige"));
};
