import { isViableCoalition } from "@/utils/partyCompatibility.ts";

export type CoalitionParty = {
  name: string;
  value?: number;
  color: string;
};

export type Coalition = {
  parties: CoalitionParty[];
  share: number;
  size: number;
  viable: boolean; // politically viable per party compatibility rules
};

const MAJORITY = 0.5;
const REACH = 0.05;

function coalitionCombinations(parties: CoalitionParty[]) {
  const combos: { parties: CoalitionParty[]; size: number }[] = [];
  const n = parties.length;
  for (let i = 0; i < n; i++) {
    combos.push({ parties: [parties[i]], size: 1 });
    for (let j = i + 1; j < n; j++) {
      combos.push({ parties: [parties[i], parties[j]], size: 2 });
      for (let k = j + 1; k < n; k++) {
        combos.push({ parties: [parties[i], parties[j], parties[k]], size: 3 });
      }
    }
  }
  return combos;
}

// Lead = largest party (by poll share) in a combo
function lead(parties: CoalitionParty[]): string {
  return [...parties].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0].name;
}

// Build the coalition list:
// - All tiers (1→2→3), combos within 5% of majority, top 3 per tier
// - Each entry is tagged with `viable` based on party compatibility
// - Viable and inviable combos are both included — callers decide how to render them
// - Deduplication: once a lead's viable majority is found, skip them in higher tiers
export function buildCoalitions(parties: CoalitionParty[], total: number): Coalition[] {
  const eligible = parties.filter((d) => (d.value ?? 0) > 0);
  const scored = coalitionCombinations(eligible).map(({ parties: ps, size }) => {
    const combined = ps.reduce((s, p) => s + (p.value ?? 0), 0);
    const share = combined / total;
    const viable = isViableCoalition(ps.map((p) => p.name));
    return { parties: ps, share, size, viable };
  });

  // Only viable majority combos block their participants from leading larger tiers
  const majorityParticipants = new Set<string>();
  const result: Coalition[] = [];

  for (let tier = 1; tier <= 3; tier++) {
    // Viable candidates: within reach, compatible, lead not already covered
    const viableCandidates = scored
      .filter((c) => {
        if (c.size !== tier || !c.viable) return false;
        if (c.share < MAJORITY - REACH) return false;
        if (tier > 1 && majorityParticipants.has(lead(c.parties))) return false;
        return true;
      })
      .sort((a, b) => b.share - a.share)
      .slice(0, 3);

    // Inviable candidates: same share threshold, not already covered by a viable entry
    const viableKeys = new Set(viableCandidates.map((c) => c.parties.map((p) => p.name).sort().join("|")));
    const inviableCandidates = scored
      .filter((c) => {
        if (c.size !== tier || c.viable) return false;
        if (c.share < MAJORITY - REACH) return false;
        if (tier > 1 && majorityParticipants.has(lead(c.parties))) return false;
        // Don't duplicate a combo already shown as viable
        return !viableKeys.has(c.parties.map((p) => p.name).sort().join("|"));
      })
      .sort((a, b) => b.share - a.share)
      .slice(0, 3);

    // Only viable majority combos block leads in higher tiers
    for (const c of viableCandidates) {
      if (c.share >= MAJORITY) {
        for (const p of c.parties) majorityParticipants.add(p.name);
      }
    }

    result.push(...viableCandidates, ...inviableCandidates);
  }

  // Sort: viable first within same size, then fewer parties, then higher share
  return result.sort((a, b) => {
    if (a.size !== b.size) return a.size - b.size;
    if (a.viable !== b.viable) return a.viable ? -1 : 1;
    return b.share - a.share;
  });
}
