'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

type VotesMap = Record<string, Record<string, number>>;

type VotesContextType = {
  votes: VotesMap;
  /**
   * getPercent(matchId, team)
   * - Numerator: total votes for `team` across ALL match fields in the document (how many people predicted that team somewhere this round).
   * - Denominator: total votes cast in the specific `matchId` (i.e. number of people who voted in that match).
   * Returns 0 if denominator is 0 or team has no votes.
   */
  getPercent: (matchId: string, team: string) => number;
  refresh: () => Promise<void>;
};

const VotesContext = createContext<VotesContextType | null>(null);

export function VotesProvider({
  stage,
  children,
}: {
  stage: 'ro16' | 'qf' | 'sf' | 'final';
  children: React.ReactNode;
}) {
  const [votes, setVotes] = useState<VotesMap>({});

  // fetch the predictions document for the stage and store it in state
  const fetchVotes = async () => {
    const ref = doc(db, 'predictions', stage);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      // Expect document shape: { R1: { TeamA: 3, TeamB: 5 }, R2: {...}, ... }
      setVotes(snap.data() as VotesMap);
    } else {
      setVotes({});
    }
  };

  useEffect(() => {
    fetchVotes();
  }, [stage]);

  const getPercent = (matchId: string, team: string) => {
    // Total votes cast in the provided matchId (denominator)
    const match = votes[matchId];
    const totalInMatch = match
      ? Object.values(match).reduce((a, b) => a + b, 0)
      : 0;

    if (totalInMatch === 0) return 0;

    // Numerator: sum of votes for `team` across ALL matches in the doc
    const totalForTeamAcrossMatches = Object.values(votes).reduce(
      (acc, matchObj) => acc + (matchObj[team] || 0),
      0
    );

    // percent of voters (those who voted in matchId) who predicted `team` somewhere in the round
    return Math.round((totalForTeamAcrossMatches / totalInMatch) * 100);
  };

  return (
    <VotesContext.Provider value={{ votes, getPercent, refresh: fetchVotes }}>
      {children}
    </VotesContext.Provider>
  );
}

export function useVotes() {
  const ctx = useContext(VotesContext);
  if (!ctx) throw new Error('useVotes must be used inside VotesProvider');
  return ctx;
}
