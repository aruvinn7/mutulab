import type { TaguchiResponseRow } from '../../lib/types';
import { defaultFmt } from '../ui/StatTable';

interface Props {
  response: TaguchiResponseRow[];
  factorNames?: string[];
}

const W = 230;
const H = 160;
const PAD = { top: 26, right: 14, bottom: 30, left: 42 };

/** Small-multiple plot: rata-rata S/N per level untuk setiap faktor. */
export default function MainEffectsChart({ response, factorNames = [] }: Props) {
  if (response.length === 0) {
    return <p className="tg-card-note">Belum ada tabel respon yang bisa divisualisasikan.</p>;
  }

  const allValues = response.flatMap((r) => r.levels.filter(Number.isFinite));
  const rawMin = allValues.length ? Math.min(...allValues) : 0;
  const rawMax = allValues.length ? Math.max(...allValues) : 1;
  const span = rawMax - rawMin || 1;
  const yMin = rawMin - span * 0.18;
  const yMax = rawMax + span * 0.18;

  const x = (i: number, count: number) =>
    count === 1 ? (W - PAD.left - PAD.right) / 2 + PAD.left : PAD.left + (i * (W - PAD.left - PAD.right)) / (count - 1);
  const y = (v: number) => PAD.top + ((yMax - v) / (yMax - yMin)) * (H - PAD.top - PAD.bottom);

  const summary = response
    .map((r, i) => {
      const name = factorNames[i] ?? r.factor ?? `Faktor ${i + 1}`;
      const values = r.levels.map((v) => defaultFmt(v)).join(', ');
      return `${name}: level ${values}, selisih ${defaultFmt(r.delta)}, level terbaik ${r.optimalLevel}.`;
    })
    .join(' ');

  return (
    <>
      <div className="tg-effects-grid">
        {response.map((row, i) => {
          const name = factorNames[i] ?? row.factor ?? `Faktor ${i + 1}`;
          const pts = row.levels.map((v, li) => ({ li, v, px: x(li, row.levels.length), py: y(v) }));
          const path = pts.map((p) => `${p.px},${p.py}`).join(' ');
          return (
            <div className="tg-effect-panel" key={`${row.factor}-${i}`}>
              <h4>{name} <span className="tg-card-tag">Δ {defaultFmt(row.delta)}</span></h4>
              <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`Grafik efek utama faktor ${name}`}>
                {[0, 0.5, 1].map((f) => {
                  const gy = PAD.top + f * (H - PAD.top - PAD.bottom);
                  const gv = yMax - f * (yMax - yMin);
                  return (
                    <g key={f}>
                      <line x1={PAD.left} x2={W - PAD.right} y1={gy} y2={gy} stroke="#dce7fb" strokeWidth="1" strokeDasharray={f === 1 ? '0' : '3 3'} />
                      <text x={PAD.left - 6} y={gy + 3} textAnchor="end" fontSize="9" fill="var(--ink-soft)" fontFamily="var(--font-mono)">{defaultFmt(gv)}</text>
                    </g>
                  );
                })}
                <polyline points={path} fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinejoin="round" />
                {pts.map((p) => {
                  const best = p.li + 1 === row.optimalLevel;
                  return (
                    <g key={p.li}>
                      {best && <circle cx={p.px} cy={p.py} r="9" fill="rgba(31,169,113,.20)" />}
                      {best ? (
                        <polygon points={`${p.px},${p.py - 5.2} ${p.px + 5.2},${p.py} ${p.px},${p.py + 5.2} ${p.px - 5.2},${p.py}`}
                          fill="var(--ok)" stroke="#fff" strokeWidth="1.4" />
                      ) : (
                        <circle cx={p.px} cy={p.py} r={3.4} fill="var(--accent)" stroke="#fff" strokeWidth="1.4" />
                      )}
                      <text x={p.px} y={p.py - 9} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={best ? '#0d6b49' : '#0b1b3a'} fontFamily="var(--font-mono)">{defaultFmt(p.v)}</text>
                      <text x={p.px} y={H - 10} textAnchor="middle" fontSize="10" fill="var(--ink-soft)" fontFamily="var(--font-mono)">L{p.li + 1}</text>
                    </g>
                  );
                })}
                <text x={4} y={12} fontSize="9" fill="var(--ink-soft)">η̄ (dB)</text>
              </svg>
            </div>
          );
        })}
      </div>
      <p className="sr-only">Ringkasan grafik efek utama: {summary}</p>
      <div className="tg-legend" aria-hidden="true">
        <span className="tg-legend-item"><span className="tg-swatch" style={{ background: 'var(--ok)', borderRadius: '2px', transform: 'rotate(45deg)' }} /> ◆ Level optimal (η̄ tertinggi)</span>
        <span className="tg-legend-item"><span className="tg-swatch" style={{ background: 'var(--accent)', borderRadius: '50%' }} /> ● Level lainnya</span>
        <span className="tg-legend-item">Garis makin curam → pengaruh faktor makin besar (Delta)</span>
      </div>
    </>
  );
}
