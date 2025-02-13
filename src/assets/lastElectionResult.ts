import { PartyEntry } from "@/types/PartyEntry.ts";
import { getPartyColor } from "@/utils/getPartyColor.ts";
import { useTheme } from "@/hooks/use-theme.ts";

const lastElectionDate = new Date("09/26/2021");

export const useLastElectionResults = (): Array<PartyEntry> => {
  const { isLight } = useTheme();

  return [
    {
      name: "SPD",
      color: getPartyColor(isLight, "SPD"),
      value: 25.7,
      date: lastElectionDate,
    },
    {
      name: "CDU/CSU",
      color: getPartyColor(isLight, "CDU"),
      value: 18.9 + 5.2,
      date: lastElectionDate,
    },
    {
      name: "Grüne",
      color: getPartyColor(isLight, "Grüne"),
      value: 14.8,
      date: lastElectionDate,
    },
    {
      name: "FDP",
      color: getPartyColor(isLight, "FDP"),
      value: 11.5,
      date: lastElectionDate,
    },
    {
      name: "AfD",
      color: getPartyColor(isLight, "AfD"),
      value: 10.3,
      date: lastElectionDate,
    },
    {
      name: "Linke",
      color: getPartyColor(isLight, "Linke"),
      value: 4.9,
      date: lastElectionDate,
    },
    {
      name: "Sonstige",
      color: getPartyColor(isLight, "Sonstige"),
      value: 8.6,
      date: lastElectionDate,
    },
  ];
};
