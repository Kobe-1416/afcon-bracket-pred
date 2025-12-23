'use client';

import { useState } from 'react';
import { db } from '../../../lib/firebase';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { saveStagePrediction, getRoundPercentages } from '../../../lib/predictions';



const countryCodes: Record<string, string> = {
  'Morocco': 'ma',
  'Mali': 'ml',
  'Zambia': 'zm',
  'Comoros': 'km',
  'Egypt': 'eg',
  'South Africa': 'za',
  'Angola': 'ao',
  'Zimbabwe': 'zw',
  'Nigeria': 'ng',
  'Tunisia': 'tn',
  'Uganda': 'ug',
  'Tanzania': 'tz',
  'Senegal': 'sn',
  'DR Congo': 'cd',
  'Benin': 'bj',
  'Botswana': 'bw',
  'Algeria': 'dz',
  'Burkina Faso': 'bf',
  'Equatorial Guinea': 'gq',
  'Sudan': 'sd',
  'Ivory Coast': 'ci',
  'Cameroon': 'cm',
  'Gabon': 'ga',
  'Mozambique': 'mz',
};

type RO16Match = { id: string; team1: string; team2: string };
type RO16Props = {
  top2: Record<string, string[]>; // from GroupStage
  thirdPlace: string[];           // from GroupStage
  onAdvance: (winners: string[]) => void;
};

// Generate RO16 matches according to AFCON rules
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

// -------- VoteableButton --------
type VoteableButtonProps = {
  team: string;
  matchId: string;
  selected: boolean;
  percentage: number;
  onVote: (matchId: string, team: string) => void;
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


export default function RO16({ top2, thirdPlace, onAdvance }: RO16Props) {
  const [matches] = useState<RO16Match[]>(generateRO16Matches(top2, thirdPlace));
  const [winners, setWinners] = useState<Record<string, string>>({});
  const [votes, setVotes] = useState<Record<string, Record<string, number>>>(() => {
    const initVotes: Record<string, Record<string, number>> = {};
    matches.forEach((m) => {
      initVotes[m.id] = { [m.team1]: 0, [m.team2]: 0 };
    });
    return initVotes;
  });

  const roundPercentages = getRoundPercentages(votes);

  const toggleWinner = (matchId: string, team: string) => {
    setWinners({ ...winners, [matchId]: team });
    setVotes({
      ...votes,
      [matchId]: { ...votes[matchId], [team]: (votes[matchId][team] || 0) + 1 },
    });
  };

  const handleNext = async () => {
  const allSelected = matches.every((m) => Boolean(winners[m.id]));
  if (!allSelected) {
    alert('Please select a winner for all matches!');
    return;
  }

  const orderedWinners = matches.map((m) => winners[m.id] as string);

  // Save to Firestore
  try {
    await saveStagePrediction('ro16', winners); // <--- ADD THIS
    console.log('Predictions saved successfully.');
  } catch (err) {
    console.error('Error saving predictions:', err);
  }

  // Advance to next stage in your app
  onAdvance(orderedWinners);
};

  return (
    <div
      style={{
        backgroundColor: '#ffffffff',
        color: '#000000ff',
        padding: '2rem',
        borderRadius: '12px',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '2rem' }}>Round of 16</h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '3rem',
          marginBottom: '2rem',
        }}
      >
        {matches.map((m) => {
          const totalVotes = Object.values(votes[m.id]).reduce((a, b) => a + b, 0);

          return (
            <div
              key={m.id}
              style={{
                backgroundColor: '#8B0000',
                padding: '1rem',
                borderRadius: '8px',
              }}
            >
              <h3 style={{ textAlign: 'center', marginBottom: '1rem', fontWeight: 600 }}>{m.id.toUpperCase()}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingLeft: '2rem', paddingRight: '2rem' }}>
                {[m.team1, m.team2].map((team) => (
                  <VoteableButton
                    key={team}
                    team={team}
                    matchId={m.id}
                    selected={winners[m.id] === team}
                    votes={votes[m.id][team]}
                    userCount={Object.values(votes[m.id]).reduce((a, b) => a + b, 0)}
                    onVote={toggleWinner}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center' }}>
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
