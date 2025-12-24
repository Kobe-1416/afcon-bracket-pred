// VoteableButton.tsx
'use client';

import React from 'react';
import { useVotes } from './VotesProvider';

const countryCodes: Record<string, string> = {
  Morocco: 'ma',
  Mali: 'ml',
  Zambia: 'zm',
  Comoros: 'km',
  Egypt: 'eg',
  'South Africa': 'za',
  Angola: 'ao',
  Zimbabwe: 'zw',
  Nigeria: 'ng',
  Tunisia: 'tn',
  Uganda: 'ug',
  Tanzania: 'tz',
  Senegal: 'sn',
  'DR Congo': 'cd',
  Benin: 'bj',
  Botswana: 'bw',
  Algeria: 'dz',
  'Burkina Faso': 'bf',
  'Equatorial Guinea': 'gq',
  Sudan: 'sd',
  'Ivory Coast': 'ci',
  Cameroon: 'cm',
  Gabon: 'ga',
  Mozambique: 'mz',
};

type VoteableButtonProps = {
  team: string;
  matchId: string;
  selected: boolean;
  onVote: () => void;
};

export function VoteableButton({ team, matchId, selected, onVote }: VoteableButtonProps) {
  const { getPercent } = useVotes();
  const percent = typeof getPercent === 'function' ? getPercent(matchId, team) : 0;

  return (
    <button
      onClick={onVote}
      style={{
        padding: '0.5rem 1rem',
        display: 'flex',
        width: '100%',
        marginBottom: '0.5rem',
        alignItems: 'center',
        color: '#000000ff',
        gap: '0.5rem',
        border: selected ? '2px solid #006400' : '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: selected ? '#90EE90' : '#F0FFF0',
        cursor: 'pointer',
      }}
    >
      <img
        src={`/flags/${countryCodes[team] ?? 'unknown'}.svg`}
        alt={team}
        width={24}
        height={24}
        style={{ flex: '0 0 auto' }}
      />
      <span style={{ flex: '1 1 auto', textAlign: 'left' }}>
        {team}
      </span>

      {selected && (
        <strong style={{ flex: '0 0 auto' }}>— {percent}%</strong>
      )}
    </button>
  );
}
