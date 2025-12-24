// components/VoteableTeamButton.tsx
'use client';

import React from 'react';
import { useVotes } from './VotesProvider';

type Props = {
  matchId: string;
  team: string;
  onSelect?: (team: string) => void; // call your existing winner-select handler too
  // optional style passthrough (you can keep your existing inline style)
  className?: string;
  style?: React.CSSProperties;
};

export default function VoteableTeamButton({ matchId, team, onSelect, className, style }: Props) {
  const { vote, getPercent, hasVoted } = useVotes();

  const voted = hasVoted(matchId);
  const percent = voted ? getPercent(matchId, team) : null;

  const handleClick = () => {
    // register selection in app (for bracket progression)
    onSelect?.(team);
    // record vote (local demo backend)
    vote(matchId, team);
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
        {/* When the user has voted for this match, show percent to the right */}
        {voted && (
          <span style={{ fontWeight: 700, marginLeft: 6 }}>{percent}%</span>
        )}
      </span>
    </button>
  );
}
