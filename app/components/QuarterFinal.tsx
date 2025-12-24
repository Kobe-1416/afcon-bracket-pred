'use client';

import { useState } from 'react';
import { saveStagePrediction } from '@/lib/predictions';
import VotesProviderWrapper from './VotesProviderWrapper';
import { VoteableButton } from './VoteableButton';

type Match = { id: string; team1: string; team2: string };
type Props = { winners: string[]; onAdvance: (qfWinners: string[]) => void };

function generateQuarterMatches(winners: string[]): Match[] {
  return [
    { id: 'QF Match 1', team1: winners[0], team2: winners[1] },
    { id: 'QF Match 2', team1: winners[2], team2: winners[3] },
    { id: 'QF Match 3', team1: winners[4], team2: winners[5] },
    { id: 'QF Match 4', team1: winners[6], team2: winners[7] },
  ];
}

export default function QuarterFinal({ winners, onAdvance }: Props) {
  const matches = generateQuarterMatches(winners);
  const [qfWinners, setQfWinners] = useState<Record<string, string>>({});

  const selectWinner = (matchId: string, team: string) => {
    setQfWinners(prev => ({ ...prev, [matchId]: team }));
  };

  const handleNext = async () => {
    if (!matches.every(m => qfWinners[m.id])) {
      alert('Select a winner for all matches!');
      return;
    }

    await saveStagePrediction('qf', qfWinners);
    onAdvance(matches.map(m => qfWinners[m.id]));
  };

  return (
    <VotesProviderWrapper stage="qf">
      <div style={{ padding: '2rem' }}>
        <h1>Quarter Finals</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {matches.map(m => (
            <div key={m.id} style={{ backgroundColor: '#8B0000', padding: '1rem' }}>
              <h3 style={{ textAlign: 'center', color: '#fff' }}>{m.id}</h3>

              {[m.team1, m.team2].map(team => (
                <VoteableButton
                  key={team}
                  team={team}
                  matchId={m.id}
                  selected={qfWinners[m.id] === team}
                  onVote={() => selectWinner(m.id, team)}
                />
              ))}
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={handleNext}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#FFD700',
            color: '#8B0000',
            border: 'none',
            borderRadius: '4px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
          >Next Round</button>
        </div>
      </div>
    </VotesProviderWrapper>
  );
}
