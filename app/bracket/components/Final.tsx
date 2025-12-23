'use client';

import { useState } from 'react';
import { saveStagePrediction } from '../../../lib/predictions';

const countryCodes: Record<string, string> = {
  Morocco: 'ma', Mali: 'ml', Zambia: 'zm', Comoros: 'km',
  Egypt: 'eg', 'South Africa': 'za', Angola: 'ao', Zimbabwe: 'zw',
  Nigeria: 'ng', Tunisia: 'tn', Uganda: 'ug', Tanzania: 'tz',
  Senegal: 'sn', 'DR Congo': 'cd', Benin: 'bj', Botswana: 'bw',
  Algeria: 'dz', 'Burkina Faso': 'bf', 'Equatorial Guinea': 'gq',
  Sudan: 'sd', 'Ivory Coast': 'ci', Cameroon: 'cm', Gabon: 'ga',
  Mozambique: 'mz',
};

type Props = {
  finalists: string[];
  onAdvance: (winner: string) => void;
};

type VoteableButtonProps = {
  team: string;
  selected: boolean;
  percentage: number;
  onVote: () => void;
};

function VoteableButton({ team, selected, percentage, onVote }: VoteableButtonProps) {
  return (
    <button
      onClick={onVote}
      style={{
        padding: '0.5rem 1rem',
        display: 'flex',
        width: '100%',
        marginBottom: '0.5rem',
        alignItems: 'center',
        gap: '0.5rem',
        border: selected ? '2px solid #006400' : '1px solid #ccc',
        borderRadius: '4px',
        backgroundColor: selected ? '#90EE90' : '#F0FFF0',
        cursor: 'pointer',
      }}
    >
      <img
        src={`/flags/${countryCodes[team]}.svg`}
        alt={team}
        width={24}
        height={24}
      />
      {team} {selected && `— ${percentage}%`}
    </button>
  );
}

export default function Final({ finalists, onAdvance }: Props) {
  const [champion, setChampion] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>({
    [finalists[0]]: 0,
    [finalists[1]]: 0,
  });

  // Calculate percentages dynamically based on total votes for this match
  const totalVotes = votes[finalists[0]] + votes[finalists[1]];
  const percentages = {
    [finalists[0]]: totalVotes ? Math.round((votes[finalists[0]] / totalVotes) * 100) : 0,
    [finalists[1]]: totalVotes ? Math.round((votes[finalists[1]] / totalVotes) * 100) : 0,
  };

  const selectChampion = (team: string) => {
    setChampion(team);
    setVotes(prev => ({ ...prev, [team]: prev[team] + 1 }));
  };

  const handleFinish = async () => {
    if (!champion) return alert('Select the champion!');
    try {
      await saveStagePrediction('final', { final: champion });
      onAdvance(champion);
    } catch (error) {
      console.error('Error saving champion:', error);
      alert('Failed to save champion. Please try again.');
    }
  };

  return (
    <div style={{ padding: '2rem', backgroundColor: '#8B0000', borderRadius: '12px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#fff' }}>Final</h1>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
        {finalists.map(team => (
          <VoteableButton
            key={team}
            team={team}
            selected={champion === team}
            percentage={percentages[team]}
            onVote={() => selectChampion(team)}
          />
        ))}
      </div>

      <button
        onClick={handleFinish}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#FFD700',
          color: '#8B0000',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        Declare Champion
      </button>
    </div>
  );
}
