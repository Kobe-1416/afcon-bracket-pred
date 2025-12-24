'use client';

import { useState } from 'react';

const countryCodes: Record<string, string> = {
  Morocco: 'ma', Mali: 'ml', Zambia: 'zm', Comoros: 'km',
  Egypt: 'eg', 'South Africa': 'za', Angola: 'ao', Zimbabwe: 'zw',
  Nigeria: 'ng', Tunisia: 'tn', Uganda: 'ug', Tanzania: 'tz',
  Senegal: 'sn', 'DR Congo': 'cd', Benin: 'bj', Botswana: 'bw',
  Algeria: 'dz', 'Burkina Faso': 'bf', 'Equatorial Guinea': 'gq', Sudan: 'sd',
  'Ivory Coast': 'ci', Cameroon: 'cm', Gabon: 'ga', Mozambique: 'mz',
};

type Group = {
  name: string;
  teams: string[];
};

type Props = {
  groups: Group[];
  onAdvance: (selected: { top2: Record<string, string[]>; thirdPlace: string[] }) => void;
};

export default function GroupStage({ groups, onAdvance }: Props) {
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  const [thirdPlace, setThirdPlace] = useState<string[]>([]);

  const toggleTeam = (groupName: string, team: string) => {
    const groupSelected = selected[groupName] || [];

    let updated: string[];
    if (groupSelected.includes(team)) {
      updated = groupSelected.filter((t) => t !== team);
    } else {
      if (groupSelected.length >= 2) return;
      updated = [...groupSelected, team];
    }

    setSelected({ ...selected, [groupName]: updated });
  };

  const toggleThird = (team: string) => {
    let updated: string[];
    if (thirdPlace.includes(team)) {
      updated = thirdPlace.filter((t) => t !== team);
    } else {
      if (thirdPlace.length >= 4) return;
      updated = [...thirdPlace, team];
    }
    setThirdPlace(updated);
  };

  const handleNext = () => {
    const allValid = groups.every((g) => (selected[g.name] || []).length === 2);
    if (!allValid) return alert('Select 2 teams for each group.');
    if (thirdPlace.length !== 4) return alert('Select exactly 4 third-place teams.');
    onAdvance({ top2: selected, thirdPlace });
  };

  const allTeams = groups.flatMap((g) => g.teams);
  const unselectedTeams = allTeams.filter(
    (team) => !Object.values(selected).flat().includes(team)
  );

  return (
    <div style={{ padding: '2rem' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '3rem',
          marginBottom: '3rem',
          
        }}
      >
        {groups.map((group) => {
          const groupSelected = selected[group.name] || [];

          return (
            <div
              key={group.name}
              style={{
                backgroundColor: '#8B0000',
                padding: '1rem',
                borderRadius: '8px',
              }}
            >
              <h2 style={{ textAlign: 'center',fontSize: '1.45rem',
                  fontWeight: '600', color: '#FFD700' }}>Group {group.name}</h2>

              {/* UX helper text */}
              <p
                style={{
                  textAlign: 'center',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  opacity: 0.85,
                  
                  marginBottom: '0.75rem',
                }}
              >
                🥇 First click = Group Winner<br />
                🥈 Second click = Runner-up
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {group.teams.map((team) => {
                  const index = groupSelected.indexOf(team);
                  const isSelected = index !== -1;

                  const isWinner = index === 0;
                  const isRunnerUp = index === 1;

                  return (
                    <button
                      key={team}
                      onClick={() => toggleTeam(group.name, team)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: "#000000ff",
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        border: isWinner
                          ? '2px solid #FFD700'
                          : isRunnerUp
                          ? '2px solid #006400'
                          : '1px solid #ccc',
                        backgroundColor: isWinner
                          ? '#FFF5CC'
                          : isRunnerUp
                          ? '#90EE90'
                          : '#F0FFF0',
                      }}
                    >
                      <img
                        src={`/flags/${countryCodes[team]}.svg`}
                        alt={team}
                        width={24}
                        height={24}
                      />

                      <span style={{ flexGrow: 1 }}>{team}</span>

                      {isWinner && <span>🥇</span>}
                      {isRunnerUp && <span>🥈</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Third place unchanged */}
      <h2 style={{ textAlign: 'center' }}>Best Third-Place Countries</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
        {unselectedTeams.map((team) => {
          const isSelected = thirdPlace.includes(team);
          return (
            <button
              key={team}
              onClick={() => toggleThird(team)}
              style={{
                padding: '0.5rem 1rem',
                display: 'flex',
                borderRadius: '4px',
                border: isSelected ? '2px solid #FFD700' : '1px solid #ccc',
                backgroundColor: isSelected ? '#FFA07A' : '#FFE4E1',
                cursor: 'pointer',
              }}
            >
              <img
                        style={{ marginRight: '0.5rem' }}
                        src={`/flags/${countryCodes[team]}.svg`}
                        alt={team}
                        width={24}
                        height={24}
                      />
              {team}
            </button>
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
