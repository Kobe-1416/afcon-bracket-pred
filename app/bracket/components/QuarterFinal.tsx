'use client';

import { useState } from 'react';

const countryCodes: Record<string, string> = {
  'Morocco': 'ma', 'Mali': 'ml', 'Zambia': 'zm', 'Comoros': 'km',
  'Egypt': 'eg', 'South Africa': 'za', 'Angola': 'ao', 'Zimbabwe': 'zw',
  'Nigeria': 'ng', 'Tunisia': 'tn', 'Uganda': 'ug', 'Tanzania': 'tz',
  'Senegal': 'sn', 'DR Congo': 'cd', 'Benin': 'bj', 'Botswana': 'bw',
  'Algeria': 'dz', 'Burkina Faso': 'bf', 'Equatorial Guinea': 'gq',
  'Sudan': 'sd', 'Ivory Coast': 'ci', 'Cameroon': 'cm', 'Gabon': 'ga', 'Mozambique': 'mz',
};

type Match = { id: string; team1: string; team2: string };
type Props = { winners: string[]; onAdvance: (qfWinners: string[]) => void; };

function generateQuarterMatches(winners: string[]): Match[] {
  return [
    { id: 'QF Match 1', team1: winners[0], team2: winners[1] },
    { id: 'QF Match 2', team1: winners[2], team2: winners[3] },
    { id: 'QF Match 3', team1: winners[4], team2: winners[5] },
    { id: 'QF Match 4', team1: winners[6], team2: winners[7] },
  ];
}

type VoteableButtonProps = {
  team: string;
  matchId: string;
  selected: boolean;
  votes: number;
  totalVotes: number;
  onVote: (matchId: string, team: string) => void;
};

function VoteableButton({ team, matchId, selected, votes, totalVotes, onVote }: VoteableButtonProps) {
  const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
  return (
    <button
      onClick={() => onVote(matchId, team)}
      style={{
        marginBottom: '0.5rem',
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: selected ? '#90EE90' : '#F0FFF0',
        border: selected ? '2px solid #006400' : '1px solid #ccc',
        borderRadius: '4px',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
      }}
    >
      <img src={`/flags/${countryCodes[team]}.svg`} alt={team} width={24} height={24} />
      {team} {selected && `— ${percentage}%`}
    </button>
  );
}

export default function QuarterFinal({ winners, onAdvance }: Props) {
  const [matches] = useState(generateQuarterMatches(winners));
  const [qfWinners, setQfWinners] = useState<Record<string, string>>({});
  const [votes, setVotes] = useState<Record<string, Record<string, number>>>(() => {
    const init: Record<string, Record<string, number>> = {};
    matches.forEach((m) => init[m.id] = { [m.team1]: 0, [m.team2]: 0 });
    return init;
  });

  const toggleWinner = (matchId: string, team: string) => {
    setQfWinners({ ...qfWinners, [matchId]: team });
    setVotes({ ...votes, [matchId]: { ...votes[matchId], [team]: (votes[matchId][team] || 0) + 1 } });
  };

  const handleNext = () => {
    if (!matches.every(m => qfWinners[m.id])) return alert('Select a winner for all matches!');
    onAdvance(matches.map(m => qfWinners[m.id] as string));
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Quarter Finals</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {matches.map(m => {
          const totalVotes = Object.values(votes[m.id]).reduce((a, b) => a + b, 0);
          return (
            <div key={m.id} style={{ backgroundColor: '#8B0000', padding: '1rem', borderRadius: '8px' }}>
              <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>{m.id}</h3>
              {[m.team1, m.team2].map(team => (
                <VoteableButton
                  key={team}
                  team={team}
                  matchId={m.id}
                  selected={qfWinners[m.id] === team}
                  votes={votes[m.id][team]}
                  totalVotes={totalVotes}
                  onVote={toggleWinner}
                />
              ))}
            </div>
          );
        })}
      </div>
      <div style={{ textAlign: 'center' }}>
        <button onClick={handleNext} style={{ padding: '0.75rem 1.5rem', backgroundColor: '#FFD700', color: '#8B0000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          Next Round
        </button>
      </div>
    </div>
  );
}
