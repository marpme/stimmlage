import { Party } from "./Party.ts";

// Mutual political incompatibilities — if either party refuses the other,
// they cannot form a coalition together. Based on publicly stated positions
// of German parties as of 2025 (Bundesebene).
//
// This is deliberately conservative: only encode firm, publicly stated
// exclusions — not mere preferences or historical tensions.
const INCOMPATIBLE_PAIRS: [string, string][] = [
  // CDU/CSU has ruled out governing with AfD and Linke at federal level
  [Party.UNION, Party.AFD],
  [Party.CDU,   Party.AFD],
  [Party.CSU,   Party.AFD],
  [Party.UNION, Party.LEFT],
  [Party.CDU,   Party.LEFT],
  [Party.CSU,   Party.LEFT],
  [Party.UNION, Party.LEFT2],  // BSW ruled out by CDU/CSU federally
  [Party.CDU,   Party.LEFT2],
  [Party.CSU,   Party.LEFT2],

  // SPD has ruled out governing with AfD at federal level
  [Party.SPD, Party.AFD],

  // Grüne have ruled out governing with AfD
  [Party.GREENS, Party.AFD],

  // FDP has ruled out governing with AfD and Linke
  [Party.FDP, Party.AFD],
  [Party.FDP, Party.LEFT],
];

// Build a fast lookup set: "PartyA|PartyB" (alphabetically sorted)
const incompatibleSet = new Set(
  INCOMPATIBLE_PAIRS.map(([a, b]) => [a, b].sort().join("|"))
);

export function areCompatible(partyA: string, partyB: string): boolean {
  return !incompatibleSet.has([partyA, partyB].sort().join("|"));
}

// Returns true only if ALL pairs within the coalition are compatible
export function isViableCoalition(partyNames: string[]): boolean {
  for (let i = 0; i < partyNames.length; i++) {
    for (let j = i + 1; j < partyNames.length; j++) {
      if (!areCompatible(partyNames[i], partyNames[j])) return false;
    }
  }
  return true;
}
