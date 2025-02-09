import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { PartyValues } from "../utils/Party.ts";

type Store = {
  parliamentId: string;
  setParliamentId: (id: string) => void;

  directCandidates: PartyValues[];
  addDirectCandidate: (name: PartyValues) => void;
  removeDirectCandidate: (name: PartyValues) => void;
};

export const useParliamentStore = create<Store>()(
  persist(
    (set) => ({
      parliamentId: "0",
      setParliamentId: (id) =>
        set(() => ({
          parliamentId: id,
        })),

      directCandidates: [],
      addDirectCandidate: (name) =>
        set((state) => ({
          directCandidates: [...state.directCandidates, name],
        })),
      removeDirectCandidate: (name) =>
        set((state) => ({
          directCandidates: state.directCandidates.filter((d) => d !== name),
        })),
    }),
    {
      name: "parliament-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
