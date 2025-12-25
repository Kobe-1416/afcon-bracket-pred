'use client';

import { useState } from 'react';

import GroupStage from '../components/GroupStage';
import RO16, { generateRO16Matches } from '../components/RoundOf16';
import QuarterFinal from '../components/QuarterFinal';
import SemiFinal from '../components/SemiFinal';
import Final from '../components/Final';
import BracketView from '../components/BracketView';
import VotesProviderWrapper from '../components/VotesProviderWrapper';

type Group = { name: string; teams: string[] };

/**
 * Third-place entry now includes originating group
 * (matches updated GroupStage + RO16 expectations)
 */
type ThirdPlaceEntry = {
  team: string;
  group: string;
};

/**
 * Payload returned by GroupStage.onAdvance
 * (UPDATED thirdPlace type)
 */
type GroupAdvancePayload = {
  top2: Record<string, string[]>;
  thirdPlace: ThirdPlaceEntry[];
};

export default function BracketPage() {
  // -------- Stage control --------
  const [stage, setStage] = useState<'group' | 'ro16' | 'qf' | 'sf' | 'final'>('group');

  // -------- Tournament state --------
  const [groupSelections, setGroupSelections] = useState<GroupAdvancePayload | null>(null);
  const [ro16Winners, setRo16Winners] = useState<string[] | null>(null);
  const [qfWinners, setQfWinners] = useState<string[] | null>(null);
  const [sfWinners, setSfWinners] = useState<string[] | null>(null);
  const [champion, setChampion] = useState<string | null>(null);
  const [showBracket, setShowBracket] = useState(false);

  // -------- Groups --------
  const groups: Group[] = [
    { name: 'A', teams: ['Morocco', 'Mali', 'Zambia', 'Comoros'] },
    { name: 'B', teams: ['Egypt', 'South Africa', 'Angola', 'Zimbabwe'] },
    { name: 'C', teams: ['Nigeria', 'Tunisia', 'Uganda', 'Tanzania'] },
    { name: 'D', teams: ['Senegal', 'DR Congo', 'Benin', 'Botswana'] },
    { name: 'E', teams: ['Algeria', 'Burkina Faso', 'Equatorial Guinea', 'Sudan'] },
    { name: 'F', teams: ['Ivory Coast', 'Cameroon', 'Gabon', 'Mozambique'] },
  ];

  // -------- Stage handlers --------

  // Receives top2 + structured thirdPlace (team + group)
  const handleGroupAdvance = (selected: GroupAdvancePayload) => {
    setGroupSelections(selected);
    setStage('ro16');
  };

  const handleRO16Advance = (winners: string[]) => {
    setRo16Winners(winners);
    setStage('qf');
  };

  const handleQFAdvance = (winners: string[]) => {
    setQfWinners(winners);
    setStage('sf');
  };

  const handleSFAdvance = (winners: string[]) => {
    setSfWinners(winners);
    setStage('final');
  };

  const handleFinalChampion = (winner: string) => {
    setChampion(winner);
    setShowBracket(true);
    alert(`🏆 Champion of AFCON 2025: ${winner}`);
  };

  // -------- Build bracket data --------

  /**
   * RO16 matches are now CAF-correct and depend on:
   * - group winners / runners-up
   * - third-place teams WITH group metadata
   */
  const ro16Matches = groupSelections
    ? generateRO16Matches(groupSelections.top2, groupSelections.thirdPlace)
    : [];

  const qfMatches = ro16Winners
    ? [
        { id: 'QF1', team1: ro16Winners[0], team2: ro16Winners[1] },
        { id: 'QF2', team1: ro16Winners[2], team2: ro16Winners[3] },
        { id: 'QF3', team1: ro16Winners[4], team2: ro16Winners[5] },
        { id: 'QF4', team1: ro16Winners[6], team2: ro16Winners[7] },
      ]
    : [];

  const sfMatchesData = qfWinners
    ? [
        { id: 'SF1', team1: qfWinners[0], team2: qfWinners[1] },
        { id: 'SF2', team1: qfWinners[2], team2: qfWinners[3] },
      ]
    : [];

  const finalMatch =
    sfWinners && sfWinners.length === 2
      ? { team1: sfWinners[0], team2: sfWinners[1] }
      : null;

  const showBracketNow = stage === 'final' || showBracket;

  // -------- Render --------
  return (
    <VotesProviderWrapper
      stage={
        stage === 'ro16' || stage === 'qf' || stage === 'sf' || stage === 'final'
          ? stage
          : 'ro16'
      }
    >
      <div style={{ padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', paddingLeft: '1.75rem' }}>
          AFCON 2025 Bracket Predictor
        </h1>

        {stage === 'group' && (
          <GroupStage groups={groups} onAdvance={handleGroupAdvance} />
        )}

        {stage === 'ro16' && groupSelections && (
          <RO16
            top2={groupSelections.top2}
            thirdPlace={groupSelections.thirdPlace}
            onAdvance={handleRO16Advance}
          />
        )}

        {stage === 'qf' && ro16Winners && (
          <QuarterFinal winners={ro16Winners} onAdvance={handleQFAdvance} />
        )}

        {stage === 'sf' && qfWinners && (
          <SemiFinal winners={qfWinners} onAdvance={handleSFAdvance} />
        )}

        {stage === 'final' && sfWinners?.length === 2 && (
          <Final finalists={sfWinners} onAdvance={handleFinalChampion} />
        )}

        {showBracketNow && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', fontWeight: 600 }}>
              Tournament Bracket
            </h2>

            <BracketView
              ro16Matches={ro16Matches}
              qfMatches={qfMatches}
              sfMatches={sfMatchesData}
              finalMatch={finalMatch}
              champion={champion}
            />
          </div>
        )}
      </div>
    </VotesProviderWrapper>
  );
}
