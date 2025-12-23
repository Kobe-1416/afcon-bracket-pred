'use client';

import { useState } from 'react';

const countryCodes: Record<string, string> = {
  'Morocco': 'ma', 'Mali': 'ml', 'Zambia': 'zm', 'Comoros': 'km',
  'Egypt': 'eg', 'South Africa': 'za', 'Angola': 'ao', 'Zimbabwe': 'zw',
  'Nigeria': 'ng', 'Tunisia': 'tn', 'Uganda': 'ug', 'Tanzania': 'tz',
  'Senegal': 'sn', 'DR Congo': 'cd', 'Benin': 'bj', 'Botswana': 'bw',
  'Algeria': 'dz', 'Burkina Faso': 'bf', 'Equatorial Guinea': 'gq',
  'Sudan': 'sd', 'Ivory Coast': 'ci', 'Cameroon': 'cm', 'Gabon': 'ga',
  'Mozambique': 'mz',
};

type Props = { finalists: string[]; onAdvance: (winner: string) => void; };

type VoteableButtonProps = {
  team: string;
  selected: boolean;
  votes: number;
  totalVotes: number;
  onVote: (team: string) => void;
};

function VoteableButton({ team, selected, votes, totalVotes, onVote }: VoteableButtonProps) {
  const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  return (
    <button
      onClick={() => onVote(team)}
      style={{
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '1rem 2rem',
        borderRadius: '8px',
        border: selected ? '3px solid #006400' : '2px solid #ccc',
        backgroundColor: selected ? '#90EE90' : '#F0FFF0',
        cursor: 'pointer',
        fontSize: '1.2rem',
      }}
    >
      <img src={`/flags/${countryCodes[team]}.svg`} alt={team} width={32} height={32} />
      {team} {selected && `— ${percentage}%`}
    </button>
  );
}

export default function Final({ finalists, onAdvance }: Props) {
  const [champion, setChampion] = useState<string | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>(() => ({ [finalists[0]]: 0, [finalists[1]]: 0 }));

  const selectChampion = (team: string) => {
    setChampion(team);
    setVotes({ ...votes, [team]: (votes[team] || 0) + 1 });
  };

  const handleFinish = () => {
    if (!champion) return alert('Select the champion!');
    onAdvance(champion);
  };

  const totalVotes = Object.values(votes).reduce((a, b) => a + b, 0);

  return (
    <div style={{ padding: '2rem', backgroundColor: '#8B0000', color: '#000', borderRadius: '12px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Final</h1>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '2rem' }}>
        {finalists.map(team => (
          <VoteableButton
            key={team}
            team={team}
            selected={champion === team}
            votes={votes[team]}
            totalVotes={totalVotes}
            onVote={selectChampion}
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
          fontSize: '1rem'
        }}
      >
        Declare Champion
      </button>
    </div>
  );
}
