'use client';

import { useState } from 'react';
import { saveStagePrediction } from '../../lib/predictions';

const countryCodes: Record<string, string> = {
  Morocco: 'ma', Mali: 'ml', Zambia: 'zm', Comoros: 'km',
  Egypt: 'eg', 'South Africa': 'za', Angola: 'ao', Zimbabwe: 'zw',
  Nigeria: 'ng', Tunisia: 'tn', Uganda: 'ug', Tanzania: 'tz',
  Senegal: 'sn', 'DR Congo': 'cd', Benin: 'bj', Botswana: 'bw',
  Algeria: 'dz', 'Burkina Faso': 'bf', 'Equatorial Guinea': 'gq',
  Sudan: 'sd', 'Ivory Coast': 'ci', Cameroon: 'cm', Gabon: 'ga',
  Mozambique: 'mz',
};

type Match = { id: string; team1: string; team2: string };
type Props = { winners: string[]; onAdvance: (sfWinners: string[]) => void };

function generateSemiMatches(winners: string[]): Match[] {
  return [
    { id: 'SF Match 1', team1: winners[0], team2: winners[1] },
    { id: 'SF Match 2', team1: winners[2], team2: winners[3] },
  ];
}

type VoteableButtonProps = {
  team: string;
  selected: boolean;
  percentage: number;
  onVote: () => void;
};

function VoteableButton({ team, matchId, selected, votes, userCount, onVote }: {
  team: string;
  matchId: string;
  selected: boolean;
  votes: number;
  userCount: number;
  onVote: (matchId: string, team: string) => void;
}) {
  const percentage = userCount > 0 ? Math.round((votes / userCount) * 100) : 0;
  return (
    <button onClick={() => onVote(matchId, team)}
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

export default function SemiFinal({ winners, onAdvance }: Props) {
  const [matches] = useState(generateSemiMatches(winners));
  const [sfWinners, setSfWinners] = useState<Record<string, string>>({});
  const [votes, setVotes] = useState<Record<string, Record<string, number>>>(() => {
    const init: Record<string, Record<string, number>> = {};
    matches.forEach(m => {
      init[m.id] = { [m.team1]: 0, [m.team2]: 0 };
    });
    return init;
  });

  const toggleWinner = (matchId: string, team: string) => {
    setSfWinners(prev => ({ ...prev, [matchId]: team }));
    setVotes(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: prev[matchId][team] + 1,
      },
    }));
  };

  const handleNext = async () => {
    if (!matches.every(m => sfWinners[m.id])) return alert('Select a winner for all matches!');
    const orderedWinners = matches.map(m => sfWinners[m.id]);
    await saveStagePrediction('sf', sfWinners);
    onAdvance(orderedWinners);
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Semi Finals</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        {matches.map(m => {
          const aVotes = votes[m.id][m.team1];
          const bVotes = votes[m.id][m.team2];
          const total = aVotes + bVotes;

          const percentages = {
            [m.team1]: total ? Math.round((aVotes / total) * 100) : 0,
            [m.team2]: total ? Math.round((bVotes / total) * 100) : 0,
          };

          return (
            <div key={m.id} style={{ backgroundColor: '#8B0000', padding: '1rem', borderRadius: '8px' }}>
              <h3 style={{ textAlign: 'center', color: '#fff' }}>{m.id}</h3>

              {[m.team1, m.team2].map(team => (
                <VoteableButton
                    key={team}
                    team={team}
                    matchId={m.id}
                    selected={sfWinners[m.id] === team}
                    votes={votes[m.id][team]}
                    userCount={Object.values(votes[m.id]).reduce((a, b) => a + b, 0)}
                    onVote={toggleWinner}
                  />
              ))}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <button
          onClick={handleNext}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#FFD700',
            color: '#8B0000',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Next Round
        </button>
      </div>
    </div>
  );
}
