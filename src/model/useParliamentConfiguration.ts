import { create } from "zustand";

import { PartyValues } from "../utils/Party.ts";

type Store = {
  parliamentId: string;
  setParliamentId: (id: string) => void;

  directCandidates: Set<PartyValues>;
  addDirectCandidate: (name: PartyValues) => void;
  removeDirectCandidate: (name: PartyValues) => void;
  clearDirectCandidates: () => void;
};

export const useParliamentStore = create<Store>()((set) => ({
  parliamentId: "0",
  setParliamentId: (id) =>
    set(() => ({
      parliamentId: id,
    })),

  directCandidates: new Set(),
  addDirectCandidate: (name) =>
    set((state) => ({
      directCandidates: new Set(state.directCandidates).add(name),
    })),
  removeDirectCandidate: (name) =>
    set((state) => {
      const newSet = new Set(state.directCandidates);
      newSet.delete(name);
      return { directCandidates: newSet };
    }),
  clearDirectCandidates: () =>
    set(() => ({
      directCandidates: new Set(),
    })),
}));
