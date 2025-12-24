// components/VotesProvider.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type VotesMap = Record<string, Record<string, number>>; // { matchId: { teamName: count } }
type UserVotesMap = Record<string, string>; // { matchId: votedTeam }

type VotesContextValue = {
  vote: (matchId: string, team: string) => void;
  getVoteCount: (matchId: string, team: string) => number;
  getTotalVotesForMatch: (matchId: string) => number;
  getPercent: (matchId: string, team: string) => number;
  hasVoted: (matchId: string) => boolean;
  userVotedTeam: (matchId: string) => string | undefined;
  rawVotes: VotesMap;
};

const STORAGE_KEY = 'afcon_votes_v1';
const USER_STORAGE_KEY = 'afcon_votes_user_v1';

const VotesContext = createContext<VotesContextValue | null>(null);

export const VotesProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [votes, setVotes] = useState<VotesMap>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const [userVotes, setUserVotes] = useState<UserVotesMap>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(USER_STORAGE_KEY) : null;
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
    } catch {}
  }, [votes]);

  useEffect(() => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userVotes));
    } catch {}
  }, [userVotes]);

  const vote = (matchId: string, team: string) => {
    // if already voted for this match from this browser do nothing
    if (userVotes[matchId]) return;

    setVotes((prev) => {
      const match = { ...(prev[matchId] || {}) };
      match[team] = (match[team] || 0) + 1;
      return { ...prev, [matchId]: match };
    });

    setUserVotes((prev) => ({ ...prev, [matchId]: team }));
  };

  const getVoteCount = (matchId: string, team: string) => {
    return votes[matchId]?.[team] || 0;
  };

  const getTotalVotesForMatch = (matchId: string) => {
    const match = votes[matchId] || {};
    return Object.values(match).reduce((s, n) => s + n, 0);
  };

  const getPercent = (matchId: string, team: string) => {
    const total = getTotalVotesForMatch(matchId);
    if (total === 0) return 0;
    return Math.round((getVoteCount(matchId, team) / total) * 100);
  };

  const hasVoted = (matchId: string) => !!userVotes[matchId];
  const userVotedTeam = (matchId: string) => userVotes[matchId];

  const value: VotesContextValue = {
    vote,
    getVoteCount,
    getTotalVotesForMatch,
    getPercent,
    hasVoted,
    userVotedTeam,
    rawVotes: votes,
  };

  return <VotesContext.Provider value={value}>{children}</VotesContext.Provider>;
};

export function useVotes() {
  const ctx = useContext(VotesContext);
  if (!ctx) throw new Error('useVotes must be used inside VotesProvider');
  return ctx;
}
