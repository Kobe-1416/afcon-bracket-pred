'use client';

import { useState } from 'react';
import { saveStagePrediction } from '@/lib/predictions';
import VotesProviderWrapper from './VotesProviderWrapper';
import { VoteableButton } from './VoteableButton';

type Props = {
  finalists: string[];
  onAdvance: (winner: string) => void;
};

export default function Final({ finalists, onAdvance }: Props) {
  const matchId = 'final';
  const [champion, setChampion] = useState<string | null>(null);

  const selectWinner = (matchId: string, team: string) => {
    setChampion(team);
  };

  const handleNext = async () => {
    if (!champion) {
      alert('Select the tournament winner!');
      return;
    }

    await saveStagePrediction('final', { [matchId]: champion });
    onAdvance(champion);
  };

  return (
    <VotesProviderWrapper stage="final">
      <div style={{ padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Final
        </h1>

        {/* MATCH CONTAINER */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
          }}
        >
          <div
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
              Tournament Winner
            </h3>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {finalists.map(team => (
                <VoteableButton
                  key={team}
                  team={team}
                  matchId={matchId}
                  selected={champion === team}
                  onVote={() => selectWinner(matchId, team)}
                />
              ))}
            </div>
          </div>
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
            Declare Champion
          </button>
        </div>
      </div>
    </VotesProviderWrapper>
  );
}