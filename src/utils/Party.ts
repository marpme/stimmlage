export enum Party {
  AFD = "AfD",
  FW = "Freie Wähler",
  UNION = "CDU/CSU",
  CDU = "CDU",
  CSU = "CSU",
  FDP = "FDP",
  SPD = "SPD",
  GREENS = "Grüne",
  LEFT = "Linke",
  LEFT2 = "BSW",
  OTHERS = "Sonstige",
}

export type PartyKeys = keyof typeof Party;
export type PartyValues = (typeof Party)[PartyKeys];
