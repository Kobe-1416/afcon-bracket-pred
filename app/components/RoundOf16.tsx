'use client';

import { useState } from 'react';
import { saveStagePrediction } from '@/lib/predictions';
import VotesProviderWrapper from './VotesProviderWrapper';
import { VoteableButton } from './VoteableButton';

type RO16Match = { id: string; team1: string; team2: string };

type RO16Props = {
  top2: Record<string, string[]>;
  thirdPlace: string[];
  onAdvance: (winners: string[]) => void;
};

// Generate RO16 matches
export function generateRO16Matches(
  top2: Record<string, string[]>,
  thirdPlace: string[]
): RO16Match[] {
  const winners: Record<string, string> = {};
  const runners: Record<string, string> = {};

  Object.entries(top2).forEach(([group, teams]) => {
    winners[group] = teams[0];
    runners[group] = teams[1];
  });

  const [t1, t2, t3, t4] = thirdPlace;

  return [
    { id: 'match 1', team1: winners['A'], team2: t1 },
    { id: 'match 2', team1: runners['B'], team2: runners['C'] },
    { id: 'match 3', team1: winners['B'], team2: t2 },
    { id: 'match 4', team1: winners['C'], team2: t3 },
    { id: 'match 5', team1: winners['D'], team2: t4 },
    { id: 'match 6', team1: runners['E'], team2: runners['F'] },
    { id: 'match 7', team1: winners['E'], team2: runners['D'] },
    { id: 'match 8', team1: winners['F'], team2: runners['A'] },
  ];
}

export default function RO16({ top2, thirdPlace, onAdvance }: RO16Props) {
  
  const matches = generateRO16Matches(top2, thirdPlace);
  const [winners, setWinners] = useState<Record<string, string>>({});
  

  const selectWinner = (matchId: string, team: string) => {
    setWinners(prev => ({ ...prev, [matchId]: team }));
  };

  const handleNext = async () => {
    if (!matches.every(m => winners[m.id])) {
      alert('Please select a winner for all matches!');
      return;
    }

    await saveStagePrediction('ro16', winners);
    onAdvance(matches.map(m => winners[m.id]));
  };
  

  return (
    <VotesProviderWrapper stage="ro16">
      <div style={{ padding: '2rem' }}>
        <h1 style={{ textAlign: 'center' }}>Round of 16</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
          {matches.map(m => (
            <div key={m.id} style={{ background: '#8B0000', padding: '1rem' }}>
              <h3 style={{ textAlign: 'center', color: '#fff' }}>{m.id}</h3>
              
              {[m.team1, m.team2].map(team => (
                <VoteableButton
                  key={team}
                  team={team}
                  matchId={m.id}
                  selected={winners[m.id] === team}
                  onVote={() => selectWinner(m.id, team)}
                />
              ))}
            </div>
          ))}
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
          >Next Round</button>
        </div>
      </div>
    </VotesProviderWrapper>
  );
}
