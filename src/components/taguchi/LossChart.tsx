import { useId } from 'react';
import { defaultFmt } from '../ui/StatTable';

interface Props {
  /** Konstanta biaya kerugian k. */
  k: number;
  /** Nilai target m. */
  target: number;
  /** Nilai aktual y yang ditandai pada kurva. */
  actual: number;
}

const W = 560;
const H = 230;
const PAD = { top: 20, right: 18, bottom: 44, left: 62 };

/** Kurva L(y) = k(y − m)² dengan penanda nilai aktual. */
export default function LossChart({ k, target, actual }: Props) {
  const id = useId().replace(/:/g, '');
  const R = Math.max(Math.abs(target) * 0.35, 2);
  const yMin = target - R;
  const yMax = target + R;
  const lMax = Math.max(k * R * R, 1e-9);

  const sx = (v: number) => PAD.left + ((v - yMin) / (yMax - yMin)) * (W - PAD.left - PAD.right);
  const sy = (l: number) => H - PAD.bottom - (l / lMax) * (H - PAD.top - PAD.bottom);

  const samples = Array.from({ length: 81 }, (_, i) => {
    const v = yMin + (i / 80) * (yMax - yMin);
    return { v, l: k * (v - target) ** 2 };
  });
  const path = samples.map((s, i) => `${i === 0 ? 'M' : 'L'}${sx(s.v).toFixed(2)},${sy(s.l).toFixed(2)}`).join(' ');
  const area = `${path} L${sx(yMax).toFixed(2)},${sy(0).toFixed(2)} L${sx(yMin).toFixed(2)},${sy(0).toFixed(2)} Z`;
  const loss = k * (actual - target) ** 2;

  return (
    <div>
      <svg className="tg-chart-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id}-t ${id}-d`} style={{ width: '100%', height: 'auto' }}>
        <title id={`${id}-t`}>Fungsi kerugian kualitas Taguchi</title>
        <desc id={`${id}-d`}>
          Kurva parabola L(y) = k kali kuadrat selisih y dengan target {defaultFmt(target)}.
          Konstanta k = {defaultFmt(k)}. Pada nilai aktual {defaultFmt(actual)}, kerugian sebesar {defaultFmt(loss)}.
        </desc>
        <defs>
          <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f6bff" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#2f6bff" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const gy = sy(f * lMax);
          return (
            <g key={f}>
              <line x1={PAD.left} x2={W - PAD.right} y1={gy} y2={gy} stroke="#dce7fb" strokeWidth="1" strokeDasharray={f === 0 ? '0' : '3 3'} />
              <text x={PAD.left - 8} y={gy + 3} textAnchor="end" fontSize="10" fill="var(--ink-soft)" fontFamily="var(--font-mono)">{defaultFmt(f * lMax)}</text>
            </g>
          );
        })}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => {
          const v = yMin + f * (yMax - yMin);
          return (
            <text key={f} x={sx(v)} y={H - 16} textAnchor="middle" fontSize="10" fill="var(--ink-soft)" fontFamily="var(--font-mono)">{defaultFmt(v)}</text>
          );
        })}

        <path d={area} fill={`url(#${id}-fill)`} />
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.6" strokeLinejoin="round" />

        <line x1={sx(target)} x2={sx(target)} y1={PAD.top} y2={sy(0)} stroke="#1fa971" strokeWidth="1.6" strokeDasharray="6 4" />
        <text x={sx(target) + 6} y={PAD.top + 12} fontSize="10" fontWeight="700" fill="#0d6b49">target m</text>

        <line x1={sx(actual)} x2={sx(actual)} y1={sy(loss)} y2={sy(0)} stroke="#f5a524" strokeWidth="1.4" strokeDasharray="4 3" />
        <circle cx={sx(actual)} cy={sy(loss)} r="6" fill="#f5a524" stroke="#fff" strokeWidth="2" />
        <text x={Math.min(Math.max(sx(actual), PAD.left + 30), W - PAD.right - 30)} y={Math.max(sy(loss) - 12, PAD.top + 10)} textAnchor="middle" fontSize="10.5" fontWeight="700" fill="#8a5700">
          L = {defaultFmt(loss)}
        </text>

        <text x={W - PAD.right} y={H - 4} textAnchor="end" fontSize="10" fill="var(--ink-soft)">Nilai karakteristik y</text>
        <text x={6} y={12} fontSize="10" fill="var(--ink-soft)">L(y) — biaya (ribu Rp)</text>
      </svg>
      <p className="tg-card-note">
        Makin jauh nilai aktual dari target, kerugian naik secara kuadratik—meski masih di dalam batas spesifikasi.
        Geser <strong>k</strong> untuk melihat skala biaya, dan <strong>y aktual</strong> untuk menandai titik pada kurva.
      </p>
    </div>
  );
}
