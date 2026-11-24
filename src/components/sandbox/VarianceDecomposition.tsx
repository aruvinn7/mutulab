import { useId, useMemo, useState } from 'react';
import { seededRandom } from '../../lib/storage';
import { defaultFmt } from '../ui/StatTable';
import './sandbox.css';

const GROUPS = 3;
const REPLICATES = 6;
const W = 470;

function fmt(n: number): string { return defaultFmt(n); }

/** Dekomposisi SS Total = SS Treatment + SS Error, dengan data acak ber-seed. */
export default function VarianceDecomposition() {
  const uid = useId().replace(/:/g, '');
  const [errorVar, setErrorVar] = useState(4);
  const [effect, setEffect] = useState(6);

  const stat = useMemo(() => {
    const rand = seededRandom(Math.round(errorVar * 1000 + effect * 100 + 7));
    const scale = Math.sqrt(errorVar * 3);
    const data: number[][] = Array.from({ length: GROUPS }, (_, g) => {
      const mean = (g - (GROUPS - 1) / 2) * effect;
      return Array.from({ length: REPLICATES }, () =>
        mean + (rand() + rand() + rand() + rand() - 2) * scale);
    });
    const all = data.flat();
    const grand = all.reduce((a, b) => a + b, 0) / all.length;
    const groupMeans = data.map((row) => row.reduce((a, b) => a + b, 0) / row.length);
    const ssTotal = all.reduce((a, v) => a + (v - grand) ** 2, 0);
    const ssTreat = groupMeans.reduce((a, m) => a + REPLICATES * (m - grand) ** 2, 0);
    const ssError = Math.max(0, ssTotal - ssTreat);
    const dfTreat = GROUPS - 1;
    const dfError = GROUPS * (REPLICATES - 1);
    const msTreat = ssTreat / dfTreat;
    const msError = ssError / dfError;
    const f = msError > 0 ? msTreat / msError : Infinity;
    return { data, groupMeans, grand, ssTotal, ssTreat, ssError, dfTreat, dfError, msTreat, msError, f };
  }, [errorVar, effect]);

  const total = Math.max(stat.ssTotal, 1e-9);
  const treatFrac = stat.ssTreat / total;
  const errFrac = 1 - treatFrac;
  const x0 = 40;
  const barW = W - 70;
  const treatW = barW * treatFrac;
  const errW = barW * errFrac;
  const ratio = stat.ssError > 0 ? stat.ssTreat / stat.ssError : Infinity;

  return (
    <section className="sbx-card span-6" aria-labelledby={`${uid}-title`}>
      <div className="sbx-head"><h3 className="sbx-title" id={`${uid}-title`}>Dekomposisi Variansi</h3><span className="sbx-tag">Modul 2 · ANOVA</span></div>
      <p className="sbx-sub">Melihat bagaimana total variasi data terbagi menjadi pengaruh perlakuan dan galat murni. Geser slider untuk mengubah perbandingan sinyal terhadap noise.</p>

      <div className="sbx-body">
        <div className="sbx-control">
          <label htmlFor={`${uid}-err`}>Variansi galat σ² <output>{fmt(errorVar)}</output></label>
          <input id={`${uid}-err`} className="sbx-range" type="range" min="0.5" max="20" step="0.5" value={errorVar} onChange={(e) => setErrorVar(Number(e.target.value))} />
        </div>
        <div className="sbx-control">
          <label htmlFor={`${uid}-eff`}>Efek perlakuan Δ <output>{fmt(effect)}</output></label>
          <input id={`${uid}-eff`} className="sbx-range" type="range" min="0" max="12" step="0.5" value={effect} onChange={(e) => setEffect(Number(e.target.value))} />
        </div>

        <div className="sbx-panel">
          <h4>Batang SS Total</h4>
          <svg viewBox={`0 0 ${W} 156`} role="img" aria-labelledby={`${uid}-t ${uid}-d`}>
            <title id={`${uid}-t`}>Dekomposisi jumlah kuadrat</title>
            <desc id={`${uid}-d`}>
              SS Total {fmt(stat.ssTotal)} terdiri dari SS Treatment {fmt(stat.ssTreat)} dan SS Error {fmt(stat.ssError)}. F hitung {fmt(stat.f)}.
            </desc>
            {[0, 0.25, 0.5, 0.75, 1].map((f) => (
              <g key={f}>
                <line x1={x0 + barW * f} x2={x0 + barW * f} y1={26} y2={92} stroke="#e2eafb" strokeWidth="1" strokeDasharray="3 3" />
                <text x={x0 + barW * f} y={110} textAnchor="middle" fontSize="9.5" fill="var(--ink-soft)" fontFamily="var(--font-mono)">{fmt(total * f)}</text>
              </g>
            ))}
            <rect x={x0} y={48} width={treatW} height="34" fill="#2f6bff" rx="4" />
            <rect x={x0 + treatW} y={48} width={errW} height="34" fill="#f5a524" rx="4" />
            <rect x={x0} y={48} width={barW} height="34" fill="none" stroke="#94a9cf" strokeWidth="1" rx="4" />
            {treatW > 86 && <text x={x0 + treatW / 2} y={69} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#fff">Treatment {(treatFrac * 100).toFixed(0)}%</text>}
            {errW > 70 && <text x={x0 + treatW + errW / 2} y={69} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#6b4700">Error {(errFrac * 100).toFixed(0)}%</text>}
            <text x={x0} y={132} fontSize="10.5" fill="var(--ink-soft)" fontFamily="var(--font-mono)">SS Total = SS Treatment + SS Error</text>
            <text x={x0 + barW} y={146} textAnchor="end" fontSize="10" fill="var(--ink-soft)">Jumlah kuadrat</text>
          </svg>
          <div className="sbx-legend" aria-hidden="true">
            <span className="sbx-legend-item"><span className="sbx-swatch" style={{ background: '#2f6bff' }} /> SS Treatment (sinyal)</span>
            <span className="sbx-legend-item"><span className="sbx-swatch" style={{ background: '#f5a524' }} /> SS Error (noise)</span>
          </div>
        </div>

        <div className="sbx-note" data-tone={ratio > 1 ? 'ok' : 'warn'}>
          Perbandingan sinyal/noise = {Number.isFinite(ratio) ? fmt(ratio) : '∞'}. F hitung = {Number.isFinite(stat.f) ? fmt(stat.f) : '∞'} dengan df ({stat.dfTreat}, {stat.dfError}).
          {ratio > 1 ? ' Efek perlakuan lebih dominan daripada galat.' : ' Galat masih mendominasi—efek sulit terdeteksi.'}
        </div>

        <div className="sbx-panel">
          <h4>Rata-rata tiap perlakuan</h4>
          <table className="sbx-mini-table">
            <caption className="sr-only">Rata-rata tiga kelompok perlakuan</caption>
            <thead><tr><th>Perlakuan</th><th>Rata-rata</th><th>Selisih dari total</th></tr></thead>
            <tbody>
              {stat.groupMeans.map((m, i) => <tr key={i}><td>P{i + 1}</td><td>{fmt(m)}</td><td>{fmt(m - stat.grand)}</td></tr>)}
            </tbody>
          </table>
          <p className="sbx-hint" style={{ marginTop: '.6rem' }}>Data: {GROUPS} perlakuan × {REPLICATES} replikasi. Gangguan acak memakai PRNG ber-seed sehingga sliders selalu menghasilkan data yang sama.</p>
        </div>
      </div>
      <p className="sr-only">SS Total {fmt(stat.ssTotal)}, SS Treatment {fmt(stat.ssTreat)}, SS Error {fmt(stat.ssError)}.</p>
    </section>
  );
}
