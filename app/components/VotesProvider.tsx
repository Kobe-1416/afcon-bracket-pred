'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../../lib/firebase';
import { doc, getDoc, runTransaction } from 'firebase/firestore';

type VotesMap = Record<string, Record<string, number>>;
type UserVotesMap = Record<string, string>;

type VotesContextValue = {
  vote: (matchId: string, team: string, stage: string) => Promise<void>;
  getPercent: (matchId: string, team: string) => number;
  hasVoted: (matchId: string) => boolean;
  userVotedTeam: (matchId: string) => string | undefined;
  rawVotes: VotesMap;
};

const STORAGE_KEY = 'afcon_votes_user_v2';

const VotesContext = createContext<VotesContextValue | null>(null);

export const VotesProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [votes, setVotes] = useState<VotesMap>({});
  const [userVotes, setUserVotes] = useState<UserVotesMap>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userVotes));
  }, [userVotes]);

  // Fetch votes from Firebase for the stage (optional: you can fetch all stages if needed)
  const fetchVotes = async (stage: string) => {
    try {
      const docRef = doc(db, 'predictions', stage);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setVotes(prev => ({ ...prev, ...{ [stage]: snap.data() as VotesMap[string] } }));
      }
    } catch (err) {
      console.error('Error fetching votes:', err);
    }
  };

  const vote = async (matchId: string, team: string, stage: string) => {
    if (userVotes[matchId]) return; // already voted locally

    try {
      const docRef = doc(db, 'predictions', stage);
      await runTransaction(db, async (transaction) => {
        const docSnap = await transaction.get(docRef);
        let data: Record<string, Record<string, number>> = {};
        if (docSnap.exists()) {
          data = docSnap.data() as Record<string, Record<string, number>>;
        }
        if (!data[matchId]) data[matchId] = {};
        data[matchId][team] = (data[matchId][team] || 0) + 1;
        transaction.set(docRef, data);
      });

      setUserVotes(prev => ({ ...prev, [matchId]: team }));
      await fetchVotes(stage); // update percentages from database
    } catch (err) {
      console.error('Error saving vote:', err);
    }
  };

  const getPercent = (matchId: string, team: string) => {
    const stageVotes = Object.values(votes);
    let total = 0;
    let teamVotes = 0;

    stageVotes.forEach(stage => {
      if (!stage[matchId]) return;
      Object.entries(stage[matchId]).forEach(([t, count]) => {
        total += count;
        if (t === team) teamVotes = count;
      });
    });

    return total > 0 ? Math.round((teamVotes / total) * 100) : 0;
  };

  const hasVoted = (matchId: string) => !!userVotes[matchId];
  const userVotedTeam = (matchId: string) => userVotes[matchId];

  return (
    <VotesContext.Provider value={{ vote, getPercent, hasVoted, userVotedTeam, rawVotes: votes }}>
      {children}
    </VotesContext.Provider>
  );
};

export function useVotes() {
  const ctx = useContext(VotesContext);
  if (!ctx) throw new Error('useVotes must be used inside VotesProvider');
  return ctx;
}
