/** Interaction Plot — SVG murni, marker berbeda + legenda + ringkasan aksesibel. */
import { useState } from 'react';
import './charts.css';

export interface InteractionSeries {
  label: string;
  values: number[];
}

interface Props {
  xLabels: string[];
  series: InteractionSeries[];
  xTitle?: string;
  yTitle?: string;
  title?: string;
  caption?: string;
  summary?: string;
}

const COLORS = ['var(--accent)', 'var(--ok)', 'var(--warn)', 'var(--mtn-near)'];
const GLYPHS = ['●', '■', '▲', '◆'];
const W = 660;
const H = 390;
const M = { top: 24, right: 24, bottom: 70, left: 76 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;

function axisFmt(n: number): string {
  if (!Number.isFinite(n)) return '—';
  return n.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
}

/** Heuristik visual: seberapa tidak sejajar garis-garisnya (bukan uji statistik). */
export function interactionCue(series: InteractionSeries[]): { label: string; tone: 'ok' | 'warn'; divergence: number } {
  if (series.length < 2 || series[0].values.length < 2) {
    return { label: 'Interaksi tidak dapat dinilai', tone: 'ok', divergence: 0 };
  }
  const steps = series[0].values.length - 1;
  const all = series.flatMap((s) => s.values).filter(Number.isFinite);
  const range = all.length ? Math.max(...all) - Math.min(...all) : 0;
  let maxDiv = 0;
  for (let i = 0; i < steps; i++) {
    const gaps = series.map((s) => (s.values[i + 1] ?? 0) - (s.values[i] ?? 0));
    maxDiv = Math.max(maxDiv, Math.max(...gaps) - Math.min(...gaps));
  }
  const relative = range > 0 ? maxDiv / range : 0;
  if (relative > 0.18) return { label: 'Interaksi kuat — garis berpotongan', tone: 'warn', divergence: maxDiv };
  if (relative > 0.06) return { label: 'Interaksi moderat', tone: 'warn', divergence: maxDiv };
  return { label: 'Interaksi lemah — garis cenderung sejajar', tone: 'ok', divergence: maxDiv };
}

function Marker({ x, y, index, color, active }: { x: number; y: number; index: number; color: string; active: boolean }) {
  const s = active ? 8 : 5.5;
  const common = { fill: color, stroke: '#fff', strokeWidth: 1.6, className: 'plot-marker' } as const;
  switch (index % 4) {
    case 0: return <circle cx={x} cy={y} r={s} {...common} />;
    case 1: return <rect x={x - s} y={y - s} width={s * 2} height={s * 2} rx={1} {...common} />;
    case 2: return <polygon points={`${x},${y - s} ${x + s},${y + s} ${x - s},${y + s}`} {...common} />;
    default: return <polygon points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`} {...common} />;
  }
}

export default function InteractionPlot({ xLabels, series, xTitle = 'Level faktor', yTitle = 'Rata-rata respons', title, caption, summary }: Props) {
  const [hover, setHover] = useState<{ si: number; i: number } | null>(null);

  if (!xLabels.length || !series.length) {
    return <p className="plot-caption">Belum ada data untuk digambar.</p>;
  }

  const values = series.flatMap((s) => s.values).filter((v) => Number.isFinite(v));
  if (!values.length) return <p className="plot-caption">Belum ada data numerik yang valid.</p>;

  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const pad = (rawMax - rawMin) * 0.12 || Math.abs(rawMax) * 0.05 || 1;
  const yMin = rawMin - pad;
  const yMax = rawMax + pad;
  const stepX = PLOT_W / xLabels.length;
  const xAt = (i: number) => M.left + stepX * (i + 0.5);
  const yAt = (v: number) => M.top + ((yMax - v) / (yMax - yMin)) * PLOT_H;
  const ticks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) * i) / 4);

  const aria = summary ?? `${title ?? 'Interaction plot'}: ${series.map((s) => `${s.label} ${s.values.map(axisFmt).join(', ')}`).join('; ')}.`;

  return (
    <figure className="plot-figure">
      {title && <figcaption className="plot-caption" style={{ fontWeight: 700, color: 'var(--ink)' }}>{title}</figcaption>}
      <svg className="plot-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria}>
        <g className="plot-grid">
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={M.left} x2={W - M.right} y1={yAt(t)} y2={yAt(t)} />
              <text className="plot-tick" x={M.left - 10} y={yAt(t) + 4} textAnchor="end">{axisFmt(t)}</text>
            </g>
          ))}
        </g>
        <line className="plot-axis" x1={M.left} x2={W - M.right} y1={M.top} y2={M.top} />
        <line className="plot-axis" x1={M.left} x2={M.left} y1={M.top} y2={M.top + PLOT_H} />
        <line className="plot-axis" x1={M.left} x2={W - M.right} y1={M.top + PLOT_H} y2={M.top + PLOT_H} />

        <text className="plot-axis-title" x={M.left + PLOT_W / 2} y={H - 24} textAnchor="middle">{xTitle}</text>
        <text className="plot-axis-title" transform={`translate(20 ${M.top + PLOT_H / 2}) rotate(-90)`} textAnchor="middle">{yTitle}</text>
        {xLabels.map((label, i) => (
          <text className="plot-tick" key={i} x={xAt(i)} y={M.top + PLOT_H + 20} textAnchor="middle">{label}</text>
        ))}

        {series.map((s, si) => (
          <polyline
            key={`line-${si}`}
            points={s.values.map((v, i) => `${xAt(i)},${yAt(v)}`).join(' ')}
            fill="none"
            stroke={COLORS[si % COLORS.length]}
            strokeWidth={2.6}
            strokeDasharray={si % 4 === 3 ? '6 4' : si % 4 === 2 ? '2 3' : undefined}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        ))}

        {series.flatMap((s, si) => s.values.map((v, i) => {
          const px = xAt(i);
          const py = yAt(v);
          const active = hover?.si === si && hover?.i === i;
          const label = `${s.label}, ${xLabels[i] ?? i}: ${axisFmt(v)}`;
          return (
            <g
              key={`pt-${si}-${i}`}
              className="plot-point"
              tabIndex={0}
              role="img"
              aria-label={label}
              onMouseEnter={() => setHover({ si, i })}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover({ si, i })}
              onBlur={() => setHover(null)}
            >
              <title>{label}</title>
              <circle cx={px} cy={py} r={13} fill="transparent" />
              <Marker x={px} y={py} index={si} color={COLORS[si % COLORS.length]} active={active} />
            </g>
          );
        }))}

        {hover && (
          <g pointerEvents="none">
            <rect
              className="plot-tooltip-box"
              x={Math.min(Math.max(xAt(hover.i) + 12, M.left), W - M.right - 152)}
              y={Math.min(Math.max(yAt(series[hover.si].values[hover.i]) - 48, M.top), M.top + PLOT_H - 42)}
              width={148}
              height={38}
              rx={9}
            />
            <text
              className="plot-tooltip-text"
              x={Math.min(Math.max(xAt(hover.i) + 22, M.left + 10), W - M.right - 142)}
              y={Math.min(Math.max(yAt(series[hover.si].values[hover.i]) - 33, M.top + 15), M.top + PLOT_H - 27)}
            >
              {series[hover.si].label} · {xLabels[hover.i]}
            </text>
            <text
              className="plot-tooltip-text"
              x={Math.min(Math.max(xAt(hover.i) + 22, M.left + 10), W - M.right - 142)}
              y={Math.min(Math.max(yAt(series[hover.si].values[hover.i]) - 18, M.top + 30), M.top + PLOT_H - 12)}
            >
              ȳ = {axisFmt(series[hover.si].values[hover.i])}
            </text>
          </g>
        )}
      </svg>

      <ul className="plot-legend">
        {series.map((s, si) => (
          <li key={s.label}>
            <span className="plot-legend-glyph" style={{ color: COLORS[si % COLORS.length] }} aria-hidden="true">{GLYPHS[si % GLYPHS.length]}</span>
            <span>{s.label}</span>
          </li>
        ))}
      </ul>

      <table className="sr-only">
        <caption>Rata-rata respons untuk interaction plot</caption>
        <thead><tr><th scope="col">Seri</th>{xLabels.map((l, i) => <th scope="col" key={i}>{l}</th>)}</tr></thead>
        <tbody>
          {series.map((s) => (
            <tr key={s.label}><th scope="row">{s.label}</th>{s.values.map((v, i) => <td key={i}>{axisFmt(v)}</td>)}</tr>
          ))}
        </tbody>
      </table>
      {caption && <p className="plot-caption">{caption}</p>}
    </figure>
  );
}
