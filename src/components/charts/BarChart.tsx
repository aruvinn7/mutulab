/** BarChart ringan untuk perbandingan MSE — SVG murni. */
import './charts.css';

export interface ChartBar {
  label: string;
  value: number;
  tone?: 'accent' | 'ok' | 'warn' | 'danger';
}

interface Props {
  bars: ChartBar[];
  yTitle?: string;
  caption?: string;
}

const COLORS: Record<NonNullable<ChartBar['tone']>, string> = {
  accent: 'var(--accent)',
  ok: 'var(--ok)',
  warn: 'var(--warn)',
  danger: 'var(--danger)',
};
const W = 520;
const H = 320;
const M = { top: 26, right: 20, bottom: 62, left: 84 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;

function axisFmt(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 3 }) : '—';
}

export default function BarChart({ bars, yTitle = 'Nilai', caption }: Props) {
  const usable = bars.filter((b) => Number.isFinite(b.value));
  if (!usable.length) return <p className="plot-caption">Belum ada nilai untuk digambar.</p>;

  const rawMax = Math.max(...usable.map((b) => b.value), 0);
  const yMax = rawMax > 0 ? rawMax * 1.16 : 1;
  const yAt = (v: number) => M.top + PLOT_H - (v / yMax) * PLOT_H;
  const ticks = Array.from({ length: 5 }, (_, i) => (yMax * i) / 4);
  const slot = PLOT_W / usable.length;
  const barW = Math.min(84, slot * 0.52);

  return (
    <figure className="plot-figure">
      <svg className="plot-svg" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Diagram batang perbandingan ${yTitle}: ${usable.map((b) => `${b.label} ${axisFmt(b.value)}`).join('; ')}`}>
        <g className="plot-grid">
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={M.left} x2={W - M.right} y1={yAt(t)} y2={yAt(t)} />
              <text className="plot-tick" x={M.left - 10} y={yAt(t) + 4} textAnchor="end">{axisFmt(t)}</text>
            </g>
          ))}
        </g>
        <line className="plot-axis" x1={M.left} x2={W - M.right} y1={M.top + PLOT_H} y2={M.top + PLOT_H} />
        <line className="plot-axis" x1={M.left} x2={M.left} y1={M.top} y2={M.top + PLOT_H} />
        <text className="plot-axis-title" transform={`translate(20 ${M.top + PLOT_H / 2}) rotate(-90)`} textAnchor="middle">{yTitle}</text>

        {usable.map((b, i) => {
          const cx = M.left + slot * (i + 0.5);
          const top = yAt(Math.max(b.value, 0));
          return (
            <g key={b.label} className="plot-bar">
              <title>{`${b.label}: ${axisFmt(b.value)}`}</title>
              <rect x={cx - barW / 2} y={top} width={barW} height={M.top + PLOT_H - top} rx={7}
                fill={COLORS[b.tone ?? 'accent']} opacity={0.88} />
              <text className="plot-tick" x={cx} y={top - 8} textAnchor="middle" style={{ fill: 'var(--ink)', fontWeight: 700 }}>{axisFmt(b.value)}</text>
              <text className="plot-tick" x={cx} y={M.top + PLOT_H + 20} textAnchor="middle">{b.label}</text>
            </g>
          );
        })}
      </svg>
      <table className="sr-only">
        <caption>Perbandingan {yTitle}</caption>
        <thead><tr><th scope="col">Kondisi</th><th scope="col">Nilai</th></tr></thead>
        <tbody>{usable.map((b) => <tr key={b.label}><th scope="row">{b.label}</th><td>{axisFmt(b.value)}</td></tr>)}</tbody>
      </table>
      {caption && <p className="plot-caption">{caption}</p>}
    </figure>
  );
}
