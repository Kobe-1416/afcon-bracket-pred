// components/VoteableTeamButton.tsx
'use client';

import React from 'react';
import { useVotes } from './VotesProvider';

type Props = {
  matchId: string;
  team: string;
  stage: 'ro16' | 'qf' | 'sf' | 'final'; // <-- new prop
  onSelect?: (team: string) => void; 
  className?: string;
  style?: React.CSSProperties;
};

export default function VoteableTeamButton({ matchId, team, stage, onSelect, className, style }: Props) {
  const { vote, getPercent, hasVoted } = useVotes();

  const voted = hasVoted(matchId);
  const percent = voted ? getPercent(matchId, team) : null;

  const handleClick = () => {
    onSelect?.(team);
    vote(matchId, team, stage); // <-- pass stage here
  };

  return (
    <button
      onClick={handleClick}
      className={className ?? 'predict-button'}
      style={style}
      aria-pressed={voted && percent !== null}
      aria-live="polite"
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        <span>{team}</span>
        {voted && (
          <span style={{ fontWeight: 700, marginLeft: 6 }}>{percent}%</span>
        )}
      </span>
    </button>
  );
}
