'use client';

import { useState } from 'react';
import { saveStagePrediction } from '@/lib/predictions';
import VotesProviderWrapper from './VotesProviderWrapper';
import { VoteableButton } from './VoteableButton';

/**
 * A third-place entry now includes the group it came from.
 * This matches the updated GroupStage that will send:
 * thirdPlace: { team: string; group: string }[]
 */
type ThirdPlaceEntry = { team: string; group: string };

type RO16Match = { id: string; team1: string; team2: string };

type RO16Props = {
  top2: Record<string, string[]>; // e.g. { A: ['Morocco','Mali'], B: [...] }
  thirdPlace: ThirdPlaceEntry[]; // exactly 4 entries, each with team & group (A..F)
  onAdvance: (winners: string[]) => void;
};

/**
 * generateRO16Matches
 *
 * - Accepts `top2` (winners/runners per group) and `thirdPlace` (array with team & group).
 * - Uses the official AFCON mapping to determine which third-placed group fills R1, R3, R5, R6
 *   based on which groups produced the four best third-placed teams.
 * - If mapping for the combination isn't found (defensive fallback), it uses the incoming
 *   thirdPlace array order to fill the R1/R3/R5/R6 slots.
 *
 * Implementation note:
 * The mapping keys are sorted concatenations of the 4 groups that qualified (e.g. 'ABCD')
 * and values are arrays describing which group's third-place goes into [R1, R3, R5, R6].
 *
 * The mapping is taken from the AFCON Round-of-16 table (which enumerates all possible
 * combinations). See: Wikipedia knockout mapping. :contentReference[oaicite:1]{index=1}
 */
export function generateRO16Matches(
  top2: Record<string, string[]>,
  thirdPlace: ThirdPlaceEntry[]
): RO16Match[] {
  // Build quick lookup for winners and runners from the top2 input
  const winners: Record<string, string> = {};
  const runners: Record<string, string> = {};

  Object.entries(top2).forEach(([group, teams]) => {
    winners[group] = teams[0]; // first selected = group winner
    runners[group] = teams[1]; // second selected = runner-up
  });

  // Mapping for which third-placed group fills R1, R3, R5, R6 for each 4-group combination.
  // Keys are sorted group letters (e.g. 'ABCD'), values are [R1, R3, R5, R6] group letters.
 const comboToSlots: Record<string, string[]> = {
  ABCD: ['B','C','D','A'],
  ABCE: ['E','C','A','B'],
  ABCF: ['F','C','A','B'],
  ABDE: ['E','D','A','B'],
  ABDF: ['F','D','A','B'],
  ABEF: ['F','E','A','B'],
  ACDE: ['E','C','D','A'],
  ACDF: ['F','C','D','A'],
  ACEF: ['E','C','A','F'],
  ADEF: ['E','D','A','F'],
  BCDE: ['E','C','D','B'],
  BCDF: ['F','C','D','B'],
  BCEF: ['F','E','C','B'],
  BDEF: ['F','E','D','B'],
  CDEF: ['E','C','D','F'],
};

  // Normalize groups provided by thirdPlace and form the lookup key
  const thirdGroups = thirdPlace.map(tp => tp.group.toUpperCase());
  const key = [...thirdGroups].sort().join(''); // e.g. 'ABCD'

  // Helper to find team name by group letter
  const findThirdTeam = (groupLetter: string) =>
    thirdPlace.find(tp => tp.group.toUpperCase() === groupLetter)?.team ?? '';

  // Determine which group supplies the third-placed teams for R1,R3,R5,R6
  let slotGroups = comboToSlots[key];

  // Defensive fallback: if mapping not found, use the incoming thirdPlace order
  // mapped into the R1,R3,R5,R6 slots in the order provided.
  if (!slotGroups) {
    // If fallback, take up to 4 group letters in the order provided
    const fallbackGroups = thirdGroups.slice(0, 4);
    // Fill remaining slots with empty strings (shouldn't happen if input is valid)
    while (fallbackGroups.length < 4) fallbackGroups.push('');
    slotGroups = fallbackGroups;
  }

  // Resolve the actual team names for the 4 third-team slots using the slotGroups
  const r1Third = findThirdTeam(slotGroups[0]);
  const r3Third = findThirdTeam(slotGroups[1]);
  const r5Third = findThirdTeam(slotGroups[2]);
  const r6Third = findThirdTeam(slotGroups[3]);

  // Build the Round of 16 matches in the official order (R1..R8)
  // Matches that involve "3rd Group X" use the resolved third-place teams above.
  return [
    // R1: Winner Group D vs appropriate 3rd (slotGroups[0])
    { id: 'R1', team1: winners['D'] ?? '', team2: r1Third },

    // R2: Runner-up Group A vs Runner-up Group C
    { id: 'R2', team1: runners['A'] ?? '', team2: runners['C'] ?? '' },

    // R3: Winner Group A vs appropriate 3rd (slotGroups[1])
    { id: 'R3', team1: winners['A'] ?? '', team2: r3Third },

    // R4: Runner-up Group B vs Runner-up Group F
    { id: 'R4', team1: runners['B'] ?? '', team2: runners['F'] ?? '' },

    // R5: Winner Group B vs appropriate 3rd (slotGroups[2])
    { id: 'R5', team1: winners['B'] ?? '', team2: r5Third },

    // R6: Winner Group C vs appropriate 3rd (slotGroups[3])
    { id: 'R6', team1: winners['C'] ?? '', team2: r6Third },

    // R7: Winner Group E vs Runner-up Group D
    { id: 'R7', team1: winners['E'] ?? '', team2: runners['D'] ?? '' },

    // R8: Winner Group F vs Runner-up Group E
    { id: 'R8', team1: winners['F'] ?? '', team2: runners['E'] ?? '' },
  ];
}

export default function RO16({ top2, thirdPlace, onAdvance }: RO16Props) {
  // Generate matches using the AFCON-aware generator above
  const matches = generateRO16Matches(top2, thirdPlace);

  // Local UI state: chosen winners per match, keyed by match id (e.g. 'R1')
  const [winners, setWinners] = useState<Record<string, string>>({});

  // Select a winner for a specific match
  const selectWinner = (matchId: string, team: string) => {
    setWinners(prev => ({ ...prev, [matchId]: team }));
  };

  // Next button: validate selections, persist prediction, and advance
  const handleNext = async () => {
    // Ensure every match has a selected winner and both teams exist
    for (const m of matches) {
      if (!m.team1 || !m.team2) {
        alert(`Match ${m.id} is missing a team — check group/third-place input.`);
        return;
      }
      if (!winners[m.id]) {
        alert('Please select a winner for all matches!');
        return;
      }
    }

    // Save (persist) the RO16 prediction (shape: { R1: 'Team', ... })
    await saveStagePrediction('ro16', winners);

    // Notify parent: pass array of winners in match order
    onAdvance(matches.map(m => winners[m.id]));
  };

  return (
    <VotesProviderWrapper stage="ro16">
      <div style={{ padding: '2rem' }}>
        <h1 style={{ textAlign: 'center' }}>Round of 16</h1>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }}>
          {matches.map(m => (
            <div key={m.id} style={{ background: '#8B0000', padding: '1rem' }}>
              {/* show match id */}
              <h3 style={{ textAlign: 'center', color: '#fff' }}>{m.id}</h3>

              {/* each match lists its two teams as VoteableButton components */}
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
          >
            Next Round
          </button>
        </div>
      </div>
    </VotesProviderWrapper>
  );
}
