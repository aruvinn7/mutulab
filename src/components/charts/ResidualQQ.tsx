/** Q-Q plot residual dengan pendekatan normal Acklam — tanpa library eksternal. */
import './charts.css';

interface Props {
  residuals: number[];
  caption?: string;
}

const W = 460;
const H = 340;
const M = { top: 22, right: 22, bottom: 52, left: 60 };
const PLOT_W = W - M.left - M.right;
const PLOT_H = H - M.top - M.bottom;

/** Inverse normal CDF — aproksimasi rasional Acklam (galat < 1,2e-9). */
function invNorm(p: number): number {
  const clamped = Math.min(1 - 1e-12, Math.max(1e-12, p));
  const a = [-39.6968302866538, 220.946098424521, -275.928510446969, 138.357751867269, -30.6647980661472, 2.50662827745924];
  const b = [-54.4760987982241, 161.585836858041, -155.698979859887, 66.8013118877197, -13.2806815528857];
  const c = [-0.00778489400243029, -0.322396458041136, -2.40075827716184, -2.54973253934373, 4.37466414146497, 2.93816398269878];
  const d = [0.00778469570904146, 0.32246712907004, 2.445134137143, 3.75440866190742];
  const plow = 0.02425;
  if (clamped < plow) {
    const q = Math.sqrt(-2 * Math.log(clamped));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (clamped > 1 - plow) return -invNorm(1 - clamped);
  const q = clamped - 0.5;
  const r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
    (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

function fmt(n: number): string {
  return Number.isFinite(n) ? n.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 3 }) : '—';
}

export default function ResidualQQ({ residuals, caption }: Props) {
  const clean = residuals.filter((r) => Number.isFinite(r)).sort((a, b) => a - b);
  if (clean.length < 3) return <p className="plot-caption">Diperlukan minimal 3 residual untuk Q-Q plot.</p>;

  const n = clean.length;
  const mean = clean.reduce((s, v) => s + v, 0) / n;
  const variance = clean.reduce((s, v) => s + (v - mean) ** 2, 0) / Math.max(n - 1, 1);
  const sd = Math.sqrt(variance) || 1e-6;
  const points = clean.map((value, i) => ({ z: invNorm((i + 0.625) / (n + 0.25)), value }));
  const zMin = Math.min(...points.map((p) => p.z)) - 0.2;
  const zMax = Math.max(...points.map((p) => p.z)) + 0.2;
  const vMin = Math.min(...clean, mean + sd * zMin) - 0.05;
  const vMax = Math.max(...clean, mean + sd * zMax) + 0.05;
  const xAt = (z: number) => M.left + ((z - zMin) / (zMax - zMin)) * PLOT_W;
  const yAt = (v: number) => M.top + ((vMax - v) / (vMax - vMin)) * PLOT_H;
  const refTop = { x: xAt(zMin), y: yAt(mean + sd * zMin) };
  const refBottom = { x: xAt(zMax), y: yAt(mean + sd * zMax) };

  return (
    <figure className="plot-figure">
      <svg className="plot-svg" viewBox={`0 0 ${W} ${H}`} role="img"
        aria-label={`Q-Q plot residual dengan ${n} titik. Mean ${fmt(mean)}, simpangan baku ${fmt(sd)}. Titik yang mengikuti garis diagonal menunjukkan residual mendekati normal.`}>
        <g className="plot-grid">
          {Array.from({ length: 4 }, (_, i) => {
            const v = vMin + ((vMax - vMin) * i) / 3;
            return <line key={i} x1={M.left} x2={W - M.right} y1={yAt(v)} y2={yAt(v)} />;
          })}
        </g>
        <line className="plot-axis" x1={M.left} x2={W - M.right} y1={M.top + PLOT_H} y2={M.top + PLOT_H} />
        <line className="plot-axis" x1={M.left} x2={M.left} y1={M.top} y2={M.top + PLOT_H} />
        <line x1={refTop.x} y1={refTop.y} x2={refBottom.x} y2={refBottom.y}
          stroke="var(--danger)" strokeWidth={1.8} strokeDasharray="6 5" />
        {points.map((p, i) => (
          <circle key={i} cx={xAt(p.z)} cy={yAt(p.value)} r={4.5}
            fill="var(--accent)" stroke="#fff" strokeWidth={1.3}>
            <title>{`Kuanti ${fmt(p.z)} · residual ${fmt(p.value)}`}</title>
          </circle>
        ))}
        <text className="plot-axis-title" x={M.left + PLOT_W / 2} y={H - 14} textAnchor="middle">Kuanti normal teoretis (z)</text>
        <text className="plot-axis-title" transform={`translate(18 ${M.top + PLOT_H / 2}) rotate(-90)`} textAnchor="middle">Residual</text>
      </svg>
      <ul className="plot-legend">
        <li><span className="plot-legend-glyph" style={{ color: 'var(--accent)' }} aria-hidden="true">●</span><span>Residual teramati</span></li>
        <li><span className="plot-legend-glyph" style={{ color: 'var(--danger)' }} aria-hidden="true">╌</span><span>Garis normal acuan</span></li>
      </ul>
      {caption && <p className="plot-caption">{caption}</p>}
    </figure>
  );
}
