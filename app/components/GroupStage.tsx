'use client';

import { useState } from 'react';

/* minimal country code map used for flag icons */
const countryCodes: Record<string, string> = {
  Morocco: 'ma', Mali: 'ml', Zambia: 'zm', Comoros: 'km',
  Egypt: 'eg', 'South Africa': 'za', Angola: 'ao', Zimbabwe: 'zw',
  Nigeria: 'ng', Tunisia: 'tn', Uganda: 'ug', Tanzania: 'tz',
  Senegal: 'sn', 'DR Congo': 'cd', Benin: 'bj', Botswana: 'bw',
  Algeria: 'dz', 'Burkina Faso': 'bf', 'Equatorial Guinea': 'gq', Sudan: 'sd',
  'Ivory Coast': 'ci', Cameroon: 'cm', Gabon: 'ga', Mozambique: 'mz',
};

/* Types */
type Group = {
  name: string;
  teams: string[];
};

/* store third-place as an object with team and its originating group */
type ThirdPlaceEntry = {
  team: string;
  group: string;
};

type Props = {
  groups: Group[];
  /* onAdvance now receives thirdPlace entries including the group they came from */
  onAdvance: (selected: { top2: Record<string, string[]>; thirdPlace: ThirdPlaceEntry[] }) => void;
};

export default function GroupStage({ groups, onAdvance }: Props) {
  /* top-two selections per group: same as before */
  const [selected, setSelected] = useState<Record<string, string[]>>({});
  /* thirdPlace now stores objects with team + group */
  const [thirdPlace, setThirdPlace] = useState<ThirdPlaceEntry[]>([]);

  /* toggleTeam: select winner/runner-up for a group (unchanged logic) */
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

  /* toggleThird: add/remove third-place entry, but keep the group it belongs to */
  const toggleThird = (team: string) => {
    const existingIndex = thirdPlace.findIndex((t) => t.team === team);

    if (existingIndex !== -1) {
      // remove if already selected
      const updated = thirdPlace.filter((t) => t.team !== team);
      setThirdPlace(updated);
    } else {
      // find the group the team belongs to
      const groupObj = groups.find((g) => g.teams.includes(team));
      const groupName = groupObj ? groupObj.name : '';

      if (thirdPlace.length >= 4) return; // limit to 4
      setThirdPlace([...thirdPlace, { team, group: groupName }]);
    }
  };

  /* proceed to next round: validate and pass selected data upward */
  const handleNext = () => {
    const allValid = groups.every((g) => (selected[g.name] || []).length === 2);
    if (!allValid) return alert('Select 2 teams for each group.');
    if (thirdPlace.length !== 4) return alert('Select exactly 4 third-place teams.');

    onAdvance({ top2: selected, thirdPlace });
  };

  /* derive list of teams not chosen in top2 selections */
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
              <h2 style={{
                textAlign: 'center',
                fontSize: '1.45rem',
                fontWeight: '600',
                color: '#FFD700'
              }}>
                Group {group.name}
              </h2>

              {/* UX helper text */}
              <p style={{
                textAlign: 'center',
                fontSize: '0.85rem',
                fontWeight: '600',
                opacity: 0.85,
                marginBottom: '0.75rem',
              }}>
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

      {/* Third place selection: now stores team + originating group */}
      <h2 style={{ textAlign: 'center' }}>Best Third-Place Countries</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
        {unselectedTeams.map((team) => {
          const isSelected = thirdPlace.some((t) => t.team === team);
          return (
            <button
              key={team}
              onClick={() => toggleThird(team)}
              style={{
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: "#000000ff",
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
              <span>{team}</span>

              {/* small hint (optional): show group when selected */}
              {isSelected && (
                <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', opacity: 0.9 }}>
                  {/* find the associated group to display */}
                  {(() => {
                    const entry = thirdPlace.find((t) => t.team === team);
                    return entry ? `(${entry.group})` : '';
                  })()}
                </span>
              )}
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
