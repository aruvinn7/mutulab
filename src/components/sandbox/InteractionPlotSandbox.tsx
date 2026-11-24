import { useId, useMemo, useState } from 'react';
import { seededRandom } from '../../lib/storage';
import { defaultFmt } from '../ui/StatTable';
import './sandbox.css';

const BASE = 50;
const H = 250;
const W = 470;
const PAD = { top: 20, right: 20, bottom: 48, left: 52 };

function response(x1: number, x2: number, a: number, b: number, ab: number): number {
  return BASE + a * x1 + b * x2 + ab * x1 * x2;
}

/** Plot interaksi dua faktor: garis sejajar vs. berpotongan, diperbarui langsung. */
export default function InteractionPlotSandbox() {
  const uid = useId().replace(/:/g, '');
  const [effectA, setEffectA] = useState(4);
  const [effectB, setEffectB] = useState(5);
  const [interaction, setInteraction] = useState(6);

  const model = useMemo(() => {
    const low = [-1, 1].map((x1) => response(x1, -1, effectA, effectB, interaction));
    const high = [-1, 1].map((x1) => response(x1, 1, effectA, effectB, interaction));
    const vals = [...low, ...high];
    const lo = Math.min(...vals) - 4;
    const hi = Math.max(...vals) + 4;
    const rand = seededRandom(Math.round((effectA + 10) * 89 + (effectB + 10) * 113 + (interaction + 12) * 31));
    const jitter = [-1, 1].flatMap((x1) => [-1, 1].flatMap((x2) =>
      Array.from({ length: 3 }, () => ({ x1, x2, y: response(x1, x2, effectA, effectB, interaction) + (rand() - 0.5) * 3 }))));
    const deltaA = 2 * interaction;
    return { low, high, lo, hi, jitter, deltaA };
  }, [effectA, effectB, interaction]);

  const sx = (x1: number) => PAD.left + ((x1 + 1) / 2) * (W - PAD.left - PAD.right);
  const sy = (v: number) => H - PAD.bottom - ((v - model.lo) / (model.hi - model.lo)) * (H - PAD.top - PAD.bottom);

  const linePath = (x2: number) => Array.from({ length: 21 }, (_, i) => {
    const x1 = -1 + (2 * i) / 20;
    return `${i === 0 ? 'M' : 'L'}${sx(x1).toFixed(1)},${sy(response(x1, x2, effectA, effectB, interaction)).toFixed(1)}`;
  }).join(' ');

  const crosses = model.low[0] > model.high[0] && model.low[1] < model.high[1] ||
    model.low[0] < model.high[0] && model.low[1] > model.high[1];
  const parallel = Math.abs(interaction) < 0.5;
  const tone = parallel ? 'ok' : crosses ? 'danger' : 'warn';
  const message = parallel
    ? 'Garis sejajar → tidak ada interaksi. Efek A sama pada kedua level B.'
    : crosses
      ? 'Garis berpotongan → interaksi kuat. Arah efek A bergantung pada level B.'
      : 'Garis tidak sejajar → ada interaksi, meski belum berpotongan di rentang ini.';

  return (
    <section className="sbx-card span-6" aria-labelledby={`${uid}-title`}>
      <div className="sbx-head"><h3 className="sbx-title" id={`${uid}-title`}>Interaction Plot Sandbox</h3><span className="sbx-tag">Modul 4 · interaksi</span></div>
      <p className="sbx-sub">Ubah efek utama dan efek interaksi, lalu lihat langsung bagaimana dua garis berubah dari sejajar menjadi berpotongan.</p>

      <div className="sbx-body">
        <div className="sbx-control">
          <label htmlFor={`${uid}-a`}>Efek utama A <output>{defaultFmt(effectA)}</output></label>
          <input id={`${uid}-a`} className="sbx-range" type="range" min="-10" max="10" step="0.5" value={effectA} onChange={(e) => setEffectA(Number(e.target.value))} />
        </div>
        <div className="sbx-control">
          <label htmlFor={`${uid}-b`}>Efek utama B <output>{defaultFmt(effectB)}</output></label>
          <input id={`${uid}-b`} className="sbx-range" type="range" min="-10" max="10" step="0.5" value={effectB} onChange={(e) => setEffectB(Number(e.target.value))} />
        </div>
        <div className="sbx-control">
          <label htmlFor={`${uid}-ab`}>Efek interaksi A×B <output>{defaultFmt(interaction)}</output></label>
          <input id={`${uid}-ab`} className="sbx-range" type="range" min="-12" max="12" step="0.5" value={interaction} onChange={(e) => setInteraction(Number(e.target.value))} />
        </div>

        <div className="sbx-panel">
          <h4>Plot interaksi</h4>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${uid}-t ${uid}-d`}>
            <title id={`${uid}-t`}>Grafik interaksi dua faktor</title>
            <desc id={`${uid}-d`}>{message} Selisih efek A antara dua level B sebesar {defaultFmt(model.deltaA)}.</desc>
            {[0, 0.25, 0.5, 0.75, 1].map((f) => {
              const gy = PAD.top + f * (H - PAD.top - PAD.bottom);
              return (
                <g key={f}>
                  <line x1={PAD.left} x2={W - PAD.right} y1={gy} y2={gy} stroke="#e2eafb" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={PAD.left - 8} y={gy + 3} textAnchor="end" fontSize="9.5" fill="var(--ink-soft)" fontFamily="var(--font-mono)">{defaultFmt(model.lo + f * (model.hi - model.lo))}</text>
                </g>
              );
            })}
            <line x1={sx(0)} x2={sx(0)} y1={PAD.top} y2={H - PAD.bottom} stroke="#cfe0ff" strokeWidth="1" />
            {[-1, 1].map((v) => <text key={v} x={sx(v)} y={H - PAD.bottom + 17} textAnchor="middle" fontSize="10" fill="var(--ink-soft)" fontFamily="var(--font-mono)">{v === -1 ? 'A rendah (−1)' : 'A tinggi (+1)'}</text>)}
            <text x={W - PAD.right} y={H - 6} textAnchor="end" fontSize="10" fill="var(--ink-soft)">Level faktor A</text>
            <text x={10} y={14} fontSize="10" fill="var(--ink-soft)">Respon ŷ</text>

            {model.jitter.map((p, i) => (
              <circle key={i} cx={sx(p.x1) + (p.x1 < 0 ? -5 : 5)} cy={sy(p.y)} r="2.4"
                fill={p.x2 < 0 ? '#2f6bff' : '#e5484d'} opacity="0.32" />
            ))}

            <path d={linePath(-1)} fill="none" stroke="#2f6bff" strokeWidth="2.8" />
            <path d={linePath(1)} fill="none" stroke="#e5484d" strokeWidth="2.8" strokeDasharray="7 4" />
            {[-1, 1].map((x1, i) => (
              <g key={x1}>
                <circle cx={sx(x1)} cy={sy(model.low[i])} r="5.5" fill="#2f6bff" stroke="#fff" strokeWidth="1.8" />
                <rect x={sx(x1) - 5.5} y={sy(model.high[i]) - 5.5} width="11" height="11" fill="#e5484d" stroke="#fff" strokeWidth="1.8" />
                <text x={sx(x1) - 10} y={sy(model.low[i]) - 10} textAnchor="end" fontSize="10" fontWeight="700" fill="#1f4fbf" fontFamily="var(--font-mono)">{defaultFmt(model.low[i])}</text>
                <text x={sx(x1) + 10} y={sy(model.high[i]) - 10} textAnchor="start" fontSize="10" fontWeight="700" fill="#a5161b" fontFamily="var(--font-mono)">{defaultFmt(model.high[i])}</text>
              </g>
            ))}
            <text x={PAD.left + 8} y={PAD.top + 12} fontSize="10.5" fontWeight="700" fill="#1f4fbf">B rendah (−1)</text>
            <text x={PAD.left + 8} y={PAD.top + 26} fontSize="10.5" fontWeight="700" fill="#a5161b">B tinggi (+1) ┄</text>
          </svg>
          <div className="sbx-legend" aria-hidden="true">
            <span className="sbx-legend-item"><span className="sbx-swatch" style={{ background: '#2f6bff', borderRadius: '50%' }} /> B rendah · lingkaran</span>
            <span className="sbx-legend-item"><span className="sbx-swatch" style={{ background: '#e5484d' }} /> B tinggi · kotak + garis putus</span>
            <span className="sbx-legend-item">titik kecil = replikasi</span>
          </div>
        </div>

        <div className="sbx-note" data-tone={tone}>
          {message} Selisih efek A antara B rendah dan B tinggi = <strong>{defaultFmt(model.deltaA)}</strong> = 2 × interaksi.
        </div>
      </div>
      <p className="sr-only">{message}</p>
    </section>
  );
}
