/** Main Effects Plot — satu panel per faktor, skala bersama agar mudah dibandingkan. */
import './charts.css';

export interface MainEffect {
  name: string;
  low: number;
  high: number;
}

interface Props {
  effects: MainEffect[];
  yTitle?: string;
  caption?: string;
}

const W = 240;
const H = 176;
const M = { top: 20, right: 16, bottom: 46, left: 46 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;

function axisFmt(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) : '—';
}

export default function MainEffectsPlot({ effects, yTitle = 'Rata-rata respons', caption }: Props) {
  const usable = effects.filter((e) => Number.isFinite(e.low) && Number.isFinite(e.high));
  if (!usable.length) return <p className="plot-caption">Belum ada efek utama untuk digambar.</p>;

  const all = usable.flatMap((e) => [e.low, e.high]);
  const rawMin = Math.min(...all);
  const rawMax = Math.max(...all);
  const pad = (rawMax - rawMin) * 0.12 || Math.abs(rawMax) * 0.05 || 1;
  const yMin = rawMin - pad;
  const yMax = rawMax + pad;
  const yAt = (v: number) => M.top + ((yMax - v) / (yMax - yMin)) * PLOT_H;
  const xs = [M.left + PLOT_W * 0.25, M.left + PLOT_W * 0.75];
  const ticks = Array.from({ length: 4 }, (_, i) => yMin + ((yMax - yMin) * i) / 3);

  return (
    <figure className="plot-figure">
      <div className="plot-mini-row">
        {usable.map((e) => (
          <svg key={e.name} className="plot-svg plot-mini" viewBox={`0 0 ${W} ${H}`} role="img"
            aria-label={`Efek utama ${e.name}: rata-rata level rendah ${axisFmt(e.low)}, level tinggi ${axisFmt(e.high)}`}>
            <g className="plot-grid">
              {ticks.map((t, i) => (
                <line key={i} x1={M.left} x2={W - M.right} y1={yAt(t)} y2={yAt(t)} />
              ))}
            </g>
            <line className="plot-axis" x1={M.left} x2={W - M.right} y1={M.top + PLOT_H} y2={M.top + PLOT_H} />
            <text className="plot-axis-title" x={M.left + PLOT_W / 2} y={H - 8} textAnchor="middle">{e.name}</text>
            <text className="plot-tick" x={M.left - 8} y={M.top + 4} textAnchor="end">{axisFmt(yMax)}</text>
            <text className="plot-tick" x={M.left - 8} y={M.top + PLOT_H + 4} textAnchor="end">{axisFmt(yMin)}</text>
            <polyline points={`${xs[0]},${yAt(e.low)} ${xs[1]},${yAt(e.high)}`} fill="none" stroke="var(--accent)" strokeWidth={2.6} strokeLinecap="round" />
            <circle cx={xs[0]} cy={yAt(e.low)} r={5.5} fill="var(--accent)" stroke="#fff" strokeWidth={1.6} />
            <rect x={xs[1] - 5.5} y={yAt(e.high) - 5.5} width={11} height={11} rx={1} fill="var(--ok)" stroke="#fff" strokeWidth={1.6} />
            <text className="plot-tick" x={xs[0]} y={M.top + PLOT_H + 18} textAnchor="middle">−</text>
            <text className="plot-tick" x={xs[1]} y={M.top + PLOT_H + 18} textAnchor="middle">+</text>
            <text className="plot-tick" x={xs[0]} y={yAt(e.low) - 10} textAnchor="middle">{axisFmt(e.low)}</text>
            <text className="plot-tick" x={xs[1]} y={yAt(e.high) - 10} textAnchor="middle">{axisFmt(e.high)}</text>
          </svg>
        ))}
      </div>
      <ul className="plot-legend">
        <li><span className="plot-legend-glyph" style={{ color: 'var(--accent)' }} aria-hidden="true">●</span><span>Level rendah (−1)</span></li>
        <li><span className="plot-legend-glyph" style={{ color: 'var(--ok)' }} aria-hidden="true">■</span><span>Level tinggi (+1)</span></li>
      </ul>
      <table className="sr-only">
        <caption>Rata-rata respons pada tiap level faktor ({yTitle})</caption>
        <thead><tr><th scope="col">Faktor</th><th scope="col">Level rendah</th><th scope="col">Level tinggi</th></tr></thead>
        <tbody>{usable.map((e) => <tr key={e.name}><th scope="row">{e.name}</th><td>{axisFmt(e.low)}</td><td>{axisFmt(e.high)}</td></tr>)}</tbody>
      </table>
      {caption && <p className="plot-caption">{caption}</p>}
    </figure>
  );
}
