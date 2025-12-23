'use client';

import React from 'react';

// country -> two-letter file name mapping
const countryCodes: Record<string, string> = {
  'Morocco': 'ma','Mali': 'ml','Zambia': 'zm','Comoros': 'km','Egypt': 'eg',
  'South Africa': 'za','Angola': 'ao','Zimbabwe': 'zw','Nigeria': 'ng','Tunisia': 'tn',
  'Uganda': 'ug','Tanzania': 'tz','Senegal': 'sn','DR Congo': 'cd','Benin': 'bj',
  'Botswana': 'bw','Algeria': 'dz','Burkina Faso': 'bf','Equatorial Guinea': 'gq',
  'Sudan': 'sd','Ivory Coast': 'ci','Cameroon': 'cm','Gabon': 'ga','Mozambique': 'mz',
};

function abbr(name: string) {
  if (!name) return '';
  if (name === 'DR Congo') return 'DRC';
  if (name === 'Ivory Coast') return 'CIV';
  return name.slice(0, 3).toUpperCase();
}

type Match = { id: string; team1: string; team2: string };
type FinalMatch = { team1: string; team2: string; winner?: string };

type Props = {
  ro16Matches: Match[];   // length 8
  qfMatches: Match[];     // length 4
  sfMatches: Match[];     // length 2
  finalMatch: FinalMatch | null; // finalists and optional winner
  champion?: string | null; // NEW: optional champion to display under the bracket
};

export default function BracketView({
  ro16Matches = [],
  qfMatches = [],
  sfMatches = [],
  finalMatch = null,
  champion = null,
}: Props) {
  const leftRo16 = ro16Matches.slice(0, 4);
  const rightRo16 = ro16Matches.slice(4, 8);

  const flattenMatchesToTeams = (matches: Match[]) => matches.flatMap((m) => [m.team1, m.team2]);

  const leftTeams = flattenMatchesToTeams(leftRo16);   // 8 teams top->bottom
  const rightTeams = flattenMatchesToTeams(rightRo16).reverse(); // mirrored

  // ------------------------
  // SWAPPED SIDES FOR QF & SF
  // ------------------------
  const leftQF = qfMatches.slice(0, 2);   // QF1, QF2 -> left side (from left RO16)
  const rightQF = qfMatches.slice(2, 4);  // QF3, QF4 -> right side (from right RO16)

  const leftQFteams = flattenMatchesToTeams(leftQF);  // Don't reverse here
  const rightQFteams = flattenMatchesToTeams(rightQF).reverse(); // Keep reverse for symmetry

  const leftSFteams = flattenMatchesToTeams(sfMatches.slice(0, 1)); // SF1 -> left side
  const rightSFteams = flattenMatchesToTeams(sfMatches.slice(1, 2)).reverse(); // SF2 -> right side
  // animation delay helper
  const teamStyleDelay = (index: number) => ({ ['--i' as any]: `${index * 80}ms` });

  // helper renderer: show flag if available, otherwise show abbreviation box
  const FlagOrAbbr = ({ name, size = 28 }: { name?: string | null; size?: number }) => {
    if (!name) return <div className="flag-placeholder" aria-hidden>{abbr(name ?? '')}</div>;
    const code = countryCodes[name];
    if (code) {
      return (
        <img
          src={`/flags/${code}.svg`}
          alt={name}
          width={size}
          height={Math.round((size * 0.7))}
          style={{ width: size, height: Math.round(size * 0.7), objectFit: 'cover', borderRadius: 2 }}
        />
      );
    }
    return <div className="flag-placeholder" aria-hidden>{abbr(name)}</div>;
  };

  return (
    <div className="bracket-wrap">
      <div className="bracket-grid">
        {/* Leftmost: RO16 left teams (8) */}
        <div className="col ro16-col">
          {leftTeams.map((team, i) => (
            <div key={`L${i}-${team}`} className="team-card team-left" style={teamStyleDelay(i)}>
              <FlagOrAbbr name={team} size={28} />
              <span className="abbr">{abbr(team)}</span>
            </div>
          ))}
        </div>

        {/* Left QF (4) -- now shows QF3/QF4 */}
        <div className="col qf-col">
          {leftQFteams.map((team, i) => (
            <div key={`LQ${i}-${team}`} className="team-card" style={teamStyleDelay(i + 2)}>
              <FlagOrAbbr name={team} size={26} />
              <span className="abbr">{abbr(team)}</span>
            </div>
          ))}
        </div>

        {/* Left SF (2) -- now shows SF2 */}
        <div className="col sf-col">
          {leftSFteams.map((team, i) => (
            <div key={`LSF${i}-${team}`} className="team-card" style={teamStyleDelay(i + 4)}>
              <FlagOrAbbr name={team} size={26} />
              <span className="abbr">{abbr(team)}</span>
            </div>
          ))}
        </div>

        {/* CENTER: Final (1) */}
        <div className="col final-col">
          <div className={`final-card ${finalMatch?.winner ? 'champion' : ''}`} style={teamStyleDelay(6)}>
            <div className="final-flag-wrap">
              <FlagOrAbbr name={finalMatch?.team1 ?? null} size={36} />
              <span className="abbr small">{abbr(finalMatch?.team1 ?? '')}</span>
            </div>
            <div className="vs">VS</div>
            <div className="final-flag-wrap">
              <FlagOrAbbr name={finalMatch?.team2 ?? null} size={36} />
              <span className="abbr small">{abbr(finalMatch?.team2 ?? '')}</span>
            </div>
            {finalMatch?.winner && <div className="winner-banner">🏆 {abbr(finalMatch.winner)}</div>}
            {!finalMatch && <div className="final-placeholder">Finalists not set</div>}
          </div>
        </div>

        {/* Right SF (2) -- now shows SF1 */}
        <div className="col sf-col">
          {rightSFteams.map((team, i) => (
            <div key={`RSF${i}-${team}`} className="team-card" style={teamStyleDelay(i + 4)}>
              <FlagOrAbbr name={team} size={26} />
              <span className="abbr">{abbr(team)}</span>
            </div>
          ))}
        </div>

        {/* Right QF (4) -- now shows QF1/QF2 */}
        <div className="col qf-col">
          {rightQFteams.map((team, i) => (
            <div key={`RQ${i}-${team}`} className="team-card" style={teamStyleDelay(i + 2)}>
              <FlagOrAbbr name={team} size={26} />
              <span className="abbr">{abbr(team)}</span>
            </div>
          ))}
        </div>

        {/* Rightmost: RO16 right teams (8) */}
        <div className="col ro16-col">
          {rightTeams.map((team, i) => (
            <div key={`R${i}-${team}`} className="team-card team-right" style={teamStyleDelay(i)}>
              <FlagOrAbbr name={team} size={28} />
              <span className="abbr">{abbr(team)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CHAMPION BANNER (displayed under bracket if champion available) */}
      {champion && (
        <div className="champion-row" role="status" aria-live="polite">
          <div className="champion-inner">
            <div className="champion-flag"><FlagOrAbbr name={champion} size={36} /></div>
            <div className="champion-text">
              <div className="champion-title">🏆 Champion</div>
              <div className="champion-name">{champion}</div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .bracket-wrap {
          padding: 1.25rem;
          background: linear-gradient(180deg, #7a0b0b 0%, #5d0909 100%);
          border-radius: 12px;
          color: #fff;
          min-height: 560px;
        }

        .bracket-grid {
          display: grid;
          grid-template-columns: repeat(7, minmax(120px, 1fr));
          gap: 1.25rem 2rem;
          align-items: stretch;
          height: 480px;
        }

        .col {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          align-items: center;
          justify-content: space-between;
          height: 100%;
          position: relative;
        }

        .col.final-col { justify-content: center; }

        .sf-col{ justify-content: center; gap: 11rem; }
        .qf-col{ justify-content: center; gap: 5rem; }

        .team-card {
          width: 100%;
          min-height: 44px;
          background: rgba(255,255,255,0.95);
          color: #000;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.4rem 0.6rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.25);
          position: relative;
          overflow: visible;
          transform-origin: left center;
          animation: slideIn 520ms ease forwards;
          opacity: 0;
        }

        .team-left { transform-origin: right center; }
        .team-right { transform-origin: left center; }

        .team-card img { width: 28px; height: 20px; object-fit: cover; border-radius: 2px; }
        .flag-placeholder { width: 28px; height: 20px; display:inline-flex; align-items:center; justify-content:center; background:#eee; color:#333; border-radius:2px; font-weight:700; }

        .abbr { font-weight: 700; letter-spacing: 0.5px; }
        .abbr.small { font-size: 0.85rem; }

        .final-card {
          background: linear-gradient(180deg,#2a5e2a 0%, #144a14 100%);
          padding: 1rem;
          border-radius: 10px;
          min-height: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          position: relative;
          box-shadow: 0 6px 18px rgba(0,0,0,0.45);
          animation: popIn 420ms ease forwards;
          opacity: 0;
          z-index: 2;
        }

        .final-placeholder {
          margin-top: 6px;
          padding: 8px 12px;
          border-radius: 8px;
          background: rgba(255,255,255,0.08);
          color: #fff;
          border: 1px dashed rgba(255,255,255,0.12);
          font-weight: 600;
        }

        .final-flag-wrap { display: flex; align-items: center; gap: 0.5rem; }
        .vs { color: #fff; font-weight: 700; margin: 0.25rem 0; }

        .winner-banner { margin-top: 6px; background: rgba(255, 215, 0, 0.95); color: #6b0000; padding: 6px 10px; border-radius: 20px; font-weight:700; }
        .final-card.champion { animation: championPulse 1400ms ease-in-out 600ms forwards; }

        .col:not(.final-col) .team-card::after {
          content: "";
          position: absolute;
          top: 50%;
          right: -1rem;
          width: 1rem;
          height: 2px;
          background: rgba(255,255,255,0.6);
          transform: translateY(-50%);
        }

        .final-col ~ .col .team-card::after { display: none; }
        .final-col ~ .col .team-card::before {
          content: "";
          position: absolute;
          top: 50%;
          left: -1rem;
          width: 1rem;
          height: 2px;
          background: rgba(255,255,255,0.6);
          transform: translateY(-50%);
        }

        .final-col .team-card::after, .final-col .team-card::before { display: none; }

        @keyframes slideIn { from { transform: translateX(var(--tx, 0px)) scale(0.98); opacity: 0 } to { transform: translateX(0) scale(1); opacity: 1 } }
        @keyframes popIn { from { transform: scale(0.95) translateY(-6px); opacity: 0 } to { transform: scale(1) translateY(0); opacity: 1 } }
        @keyframes championPulse { 0% { box-shadow: 0 0 0 rgba(255,215,0,0.0) } 50% { box-shadow: 0 0 18px rgba(255,215,0,0.35) } 100% { box-shadow: 0 0 0 rgba(255,215,0,0.0) } }

        .team-card { animation-delay: var(--i, 0ms); }
        .final-card { animation-delay: var(--i, 0ms); }

        /* ========== CHAMPION ROW STYLES ========== */
        .champion-row {
          margin-top: 18px;
          display: flex;
          justify-content: center;
        }
        .champion-inner {
          background: linear-gradient(90deg, rgba(255,215,0,0.95), rgba(255,240,180,0.95));
          color: #6b0000;
          padding: 10px 16px;
          border-radius: 12px;
          display:flex;
          align-items:center;
          gap: 12px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.25);
          min-width: 260px;
        }
        .champion-flag img, .champion-flag .flag-placeholder {
          width: 40px; height: 28px;
        }
        .champion-title { font-weight: 800; font-size: 0.95rem; }
        .champion-name { font-weight: 700; font-size: 1.05rem; }

        @media (max-width: 900px) {
          .bracket-grid { grid-template-columns: 1fr; gap: 1rem; height: auto; }
          .col { align-items: stretch; justify-content: flex-start; }
          .team-card { justify-content: flex-start; }
          .final-card { min-height: auto; }
          .col:not(.final-col) .team-card::after, .final-col ~ .col .team-card::before { display:none; }
        }
      `}</style>
    </div>
  );
}
