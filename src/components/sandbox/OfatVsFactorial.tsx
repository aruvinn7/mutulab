import { useId, useMemo, useState } from 'react';
import { seededRandom } from '../../lib/storage';
import { defaultFmt } from '../ui/StatTable';
import './sandbox.css';

const BASE = 50;
const VIEW = { w: 380, h: 330, left: 46, top: 18, pw: 290, ph: 246 };

interface Point { x1: number; x2: number; y: number }

function response(x1: number, x2: number, a: number, b: number, ab: number): number {
  return BASE + a * x1 + b * x2 + ab * x1 * x2;
}

function lerpColor(t: number): string {
  const stops: [number, number, number][] = [[232, 241, 255], [141, 181, 255], [31, 63, 133]];
  const s = Math.min(0.9999, Math.max(0, t)) * 2;
  const i = Math.floor(s);
  const f = s - i;
  const c = stops[i].map((v, k) => Math.round(v + (stops[i + 1][k] - v) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

/** OFAT vs. Faktorial: permukaan respon 2D saat terjadi interaksi. */
export default function OfatVsFactorial() {
  const uid = useId().replace(/:/g, '');
  const [effectA, setEffectA] = useState(4);
  const [effectB, setEffectB] = useState(6);
  const [interaction, setInteraction] = useState(-10);

  const { cells, min, max, corners, ofat, factorial, noise } = useMemo(() => {
    const grid: { gx: number; gy: number; v: number }[] = [];
    for (let i = 0; i < 20; i++) {
      for (let j = 0; j < 20; j++) {
        const x1 = -1 + (2 * i) / 19;
        const x2 = 1 - (2 * j) / 19;
        grid.push({ gx: i, gy: j, v: response(x1, x2, effectA, effectB, interaction) });
      }
    }
    const vals = grid.map((c) => c.v);
    const lo = Math.min(...vals);
    const hi = Math.max(...vals);

    const cs: Point[] = ([
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ] as [number, number][]).map(([x1, x2]) => ({ x1, x2, y: response(x1, x2, effectA, effectB, interaction) }));
    const best = cs.reduce((a, b) => (b.y > a.y ? b : a), cs[0]);

    const stepA = effectA > 0 ? 1 : effectA < 0 ? -1 : 0;
    const slopeB = effectB + interaction * stepA;
    const stepB = slopeB > 0 ? 1 : slopeB < 0 ? -1 : 0;
    const ofatPoint: Point = {
      x1: stepA,
      x2: stepB,
      y: response(stepA, stepB, effectA, effectB, interaction),
    };

    const rand = seededRandom(Math.round((effectA + 10) * 97 + (effectB + 10) * 131 + (interaction + 20) * 17));
    const n1 = (rand() - 0.5) * 1.8;
    const n2 = (rand() - 0.5) * 1.8;

    return { cells: grid, min: lo, max: hi, corners: cs, ofat: ofatPoint, factorial: best, noise: [n1, n2] };
  }, [effectA, effectB, interaction]);

  const px = (x1: number) => VIEW.left + ((x1 + 1) / 2) * VIEW.pw;
  const py = (x2: number) => VIEW.top + ((1 - x2) / 2) * VIEW.ph;
  const cellW = VIEW.pw / 20;
  const cellH = VIEW.ph / 20;

  const ofatPath = `${px(0)},${py(0)} ${px(ofat.x1)},${py(0)} ${px(ofat.x1)},${py(ofat.x2)}`;
  const same = Math.abs(ofat.y - factorial.y) < 1e-6;
  const summary = `Permukaan respon dengan interaksi ${defaultFmt(interaction)}. OFAT berhenti pada A=${ofat.x1}, B=${ofat.x2}, respon ${defaultFmt(ofat.y)}. Faktorial menemukan A=${factorial.x1}, B=${factorial.x2}, respon ${defaultFmt(factorial.y)}.`;

  return (
    <section className="sbx-card span-6" aria-labelledby={`${uid}-title`}>
      <div className="sbx-head"><h3 className="sbx-title" id={`${uid}-title`}>OFAT vs. Faktorial</h3><span className="sbx-tag">Modul 1 · interaksi</span></div>
      <p className="sbx-sub">Geser efek dan interaksi. OFAT mengubah satu faktor pada satu waktu; faktorial mengevaluasi seluruh kombinasi level sekaligus.</p>

      <div className="sbx-split">
        <div className="sbx-body">
          <div className="sbx-control">
            <label htmlFor={`${uid}-a`}>Efek faktor A <output>{defaultFmt(effectA)}</output></label>
            <input id={`${uid}-a`} className="sbx-range" type="range" min="-10" max="10" step="0.5" value={effectA} onChange={(e) => setEffectA(Number(e.target.value))} />
          </div>
          <div className="sbx-control">
            <label htmlFor={`${uid}-b`}>Efek faktor B <output>{defaultFmt(effectB)}</output></label>
            <input id={`${uid}-b`} className="sbx-range" type="range" min="-10" max="10" step="0.5" value={effectB} onChange={(e) => setEffectB(Number(e.target.value))} />
          </div>
          <div className="sbx-control">
            <label htmlFor={`${uid}-ab`}>Interaksi A×B <output>{defaultFmt(interaction)}</output></label>
            <input id={`${uid}-ab`} className="sbx-range" type="range" min="-20" max="20" step="0.5" value={interaction} onChange={(e) => setInteraction(Number(e.target.value))} />
          </div>
          <p className="sbx-hint">Model: ŷ = {BASE} + ({defaultFmt(effectA)})·A + ({defaultFmt(effectB)})·B + ({defaultFmt(interaction)})·A·B</p>
          <div className="sbx-note" data-tone={same ? 'ok' : 'warn'}>
            {same
              ? 'Pada kombinasi ini OFAT kebetulan mencapai optimum yang sama dengan faktorial. Geser interaksi untuk melihat kegagalannya.'
              : <>OFAT berhenti di <strong>A={ofat.x1}, B={ofat.x2}</strong> (ŷ={defaultFmt(ofat.y)}), padahal faktorial menemukan <strong>A={factorial.x1}, B={factorial.x2}</strong> (ŷ={defaultFmt(factorial.y)}).</>}
          </div>
        </div>

        <div className="sbx-panel">
          <h4>Permukaan respon (heatmap)</h4>
          <svg viewBox={`0 0 ${VIEW.w} ${VIEW.h}`} role="img" aria-labelledby={`${uid}-t ${uid}-d`}>
            <title id={`${uid}-t`}>Permukaan respon dua faktor</title>
            <desc id={`${uid}-d`}>{summary}</desc>
            {cells.map((cell, i) => (
              <rect key={i} x={VIEW.left + cell.gx * cellW} y={VIEW.top + cell.gy * cellH}
                width={cellW + 0.6} height={cellH + 0.6} fill={lerpColor((cell.v - min) / (max - min || 1))} />
            ))}
            <rect x={VIEW.left} y={VIEW.top} width={VIEW.pw} height={VIEW.ph} fill="none" stroke="#94a9cf" strokeWidth="1" />
            {[-1, 0, 1].map((v) => (
              <g key={v}>
                <text x={px(v)} y={VIEW.h - 16} textAnchor="middle" fontSize="10" fill="var(--ink-soft)" fontFamily="var(--font-mono)">{v}</text>
                <text x={VIEW.left - 8} y={py(v) + 3} textAnchor="end" fontSize="10" fill="var(--ink-soft)" fontFamily="var(--font-mono)">{v}</text>
              </g>
            ))}
            <text x={VIEW.left + VIEW.pw / 2} y={VIEW.h - 3} textAnchor="middle" fontSize="10.5" fill="var(--ink-soft)">Faktor A (x₁)</text>
            <text x={12} y={VIEW.top + VIEW.ph / 2} textAnchor="middle" fontSize="10.5" fill="var(--ink-soft)" transform={`rotate(-90 12 ${VIEW.top + VIEW.ph / 2})`}>Faktor B (x₂)</text>

            <polyline points={ofatPath} fill="none" stroke="#f5a524" strokeWidth="2.2" strokeDasharray="6 4" />
            <circle cx={px(0)} cy={py(0)} r="4.5" fill="#fff" stroke="var(--ink-soft)" strokeWidth="2" />
            <circle cx={px(ofat.x1)} cy={py(0)} r="5" fill="#f5a524" stroke="#fff" strokeWidth="1.6" />
            <line x1={px(ofat.x1)} x2={px(ofat.x1)} y1={py(0) - 7 - Math.abs(noise[0])} y2={py(0) + 7 + Math.abs(noise[0])} stroke="#8a5700" strokeWidth="1.4" />
            <rect x={px(ofat.x1) - 5} y={py(ofat.x2) - 5} width="10" height="10" fill="#f5a524" stroke="#fff" strokeWidth="1.8" transform={`rotate(45 ${px(ofat.x1)} ${py(ofat.x2)})`} />

            <circle cx={px(factorial.x1)} cy={py(factorial.x2)} r="10" fill="rgba(31,169,113,.22)" />
            <circle cx={px(factorial.x1)} cy={py(factorial.x2)} r="5.5" fill="#1fa971" stroke="#fff" strokeWidth="2" />
            <text x={Math.min(px(factorial.x1) + 12, VIEW.left + VIEW.pw - 6)} y={py(factorial.x2) - 10} textAnchor="start" fontSize="10" fontWeight="700" fill="#0d6b49">faktorial</text>
          </svg>
          <div className="sbx-legend" aria-hidden="true">
            <span className="sbx-legend-item"><span className="sbx-swatch" style={{ background: '#f5a524' }} /> jalur OFAT</span>
            <span className="sbx-legend-item"><span className="sbx-swatch" style={{ background: '#1fa971', borderRadius: '50%' }} /> optimum faktorial</span>
            <span className="sbx-legend-item">cerah = respon rendah · gelap = respon tinggi</span>
          </div>
        </div>
      </div>
      <p className="sbx-hint" style={{ marginTop: '.7rem' }}>
        Kisaran respon permukaan: {defaultFmt(min)} – {defaultFmt(max)}. Titik berubah langsung saat slider digeser; gangguan pengukuran kecil memakai PRNG ber-seed agar deterministik.
      </p>
      <p className="sr-only">{summary}</p>
    </section>
  );
}
