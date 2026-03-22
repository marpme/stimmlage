import { describe, it, expect, beforeEach } from "vitest";
import { useParliamentStore } from "@/model/useParliamentConfiguration";
import { Party } from "@/utils/Party";

describe("useParliamentStore", () => {
  beforeEach(() => {
    useParliamentStore.setState({
      parliamentId: "0",
      directCandidates: new Set(),
    });
  });

  it("has default parliamentId of '0'", () => {
    expect(useParliamentStore.getState().parliamentId).toBe("0");
  });

  it("setParliamentId updates parliamentId", () => {
    useParliamentStore.getState().setParliamentId("42");
    expect(useParliamentStore.getState().parliamentId).toBe("42");
  });

  it("addDirectCandidate adds a party to directCandidates", () => {
    useParliamentStore.getState().addDirectCandidate(Party.SPD);
    expect(useParliamentStore.getState().directCandidates.has(Party.SPD)).toBe(true);
  });

  it("addDirectCandidate is idempotent (Set semantics)", () => {
    useParliamentStore.getState().addDirectCandidate(Party.SPD);
    useParliamentStore.getState().addDirectCandidate(Party.SPD);
    expect(useParliamentStore.getState().directCandidates.size).toBe(1);
  });

  it("removeDirectCandidate removes the party", () => {
    useParliamentStore.getState().addDirectCandidate(Party.SPD);
    useParliamentStore.getState().addDirectCandidate(Party.GREENS);
    useParliamentStore.getState().removeDirectCandidate(Party.SPD);
    const { directCandidates } = useParliamentStore.getState();
    expect(directCandidates.has(Party.SPD)).toBe(false);
    expect(directCandidates.has(Party.GREENS)).toBe(true);
  });

  it("removeDirectCandidate on non-existent party does nothing", () => {
    useParliamentStore.getState().addDirectCandidate(Party.SPD);
    useParliamentStore.getState().removeDirectCandidate(Party.FDP);
    expect(useParliamentStore.getState().directCandidates.size).toBe(1);
  });

  it("clearDirectCandidates empties the set", () => {
    useParliamentStore.getState().addDirectCandidate(Party.SPD);
    useParliamentStore.getState().addDirectCandidate(Party.GREENS);
    useParliamentStore.getState().clearDirectCandidates();
    expect(useParliamentStore.getState().directCandidates.size).toBe(0);
  });

  it("each action returns a new Set instance (immutability)", () => {
    const before = useParliamentStore.getState().directCandidates;
    useParliamentStore.getState().addDirectCandidate(Party.SPD);
    const after = useParliamentStore.getState().directCandidates;
    expect(before).not.toBe(after);
  });
});
