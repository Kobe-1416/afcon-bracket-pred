'use client';

import { useState } from 'react';
import { saveStagePrediction } from '@/lib/predictions';
import VotesProviderWrapper from './VotesProviderWrapper';
import { VoteableButton } from './VoteableButton';

type Match = { id: string; team1: string; team2: string };
type Props = { winners: string[]; onAdvance: (sfWinners: string[]) => void };

function generateSemiFinals(winners: string[]): Match[] {
  return [
    { id: 'SF Match 1', team1: winners[0], team2: winners[1] },
    { id: 'SF Match 2', team1: winners[2], team2: winners[3] },
  ];
}

export default function SemiFinal({ winners, onAdvance }: Props) {
  const matches = generateSemiFinals(winners);
  const [sfWinners, setSfWinners] = useState<Record<string, string>>({});

  const selectWinner = (matchId: string, team: string) => {
    setSfWinners(prev => ({ ...prev, [matchId]: team }));
  };

  const handleNext = async () => {
    if (!matches.every(m => sfWinners[m.id])) {
      alert('Select a winner for all matches!');
      return;
    }

    await saveStagePrediction('sf', sfWinners);
    onAdvance(matches.map(m => sfWinners[m.id]));
  };

  return (
    <VotesProviderWrapper stage="sf">
      <div style={{ padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Semi Finals
        </h1>

        {/* MATCHES CONTAINER */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
          }}
        >
          {matches.map(m => (
            <div
              key={m.id}
              style={{
                backgroundColor: '#8B0000',
                padding: '1.5rem',
                width: '60%',
                minWidth: '280px',
                borderRadius: '8px',
              }}
            >
              <h3
                style={{
                  textAlign: 'center',
                  color: '#fff',
                  marginBottom: '1rem',
                }}
              >
                {m.id}
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {[m.team1, m.team2].map(team => (
                  <VoteableButton
                    key={team}
                    team={team}
                    matchId={m.id}
                    selected={sfWinners[m.id] === team}
                    onVote={() => selectWinner(m.id, team)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* NEXT BUTTON */}
        <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
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
    </VotesProviderWrapper>
  );
}
