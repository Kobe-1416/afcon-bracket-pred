'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

type VotesMap = Record<string, Record<string, number>>;

type VotesContextType = {
  votes: VotesMap;
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

  const fetchVotes = async () => {
    const ref = doc(db, 'predictions', stage);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      setVotes(snap.data() as VotesMap);
    } else {
      setVotes({});
    }
  };

  useEffect(() => {
    fetchVotes();
  }, [stage]);

  const getPercent = (matchId: string, team: string) => {
    const match = votes[matchId];
    if (!match) return 0;
    const total = Object.values(match).reduce((a, b) => a + b, 0);
    if (total === 0) return 0;
    return Math.round(((match[team] || 0) / total) * 100);
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
