import { useId } from 'react';
import { fmtPct, fmtProb } from './sampling-utils';

interface Props {
  aoq: { p: number; aoq: number }[];
  aoql: number;
}

const W = 460;
const H = 210;
const PAD = { top: 18, right: 18, bottom: 44, left: 56 };

/** Average Outgoing Quality: kualitas rata-rata barang yang keluar setelah inspeksi & perbaikan. */
export default function AoqCurve({ aoq, aoql }: Props) {
  const id = useId().replace(/:/g, '');
  const pts = [...aoq].filter((d) => Number.isFinite(d.p) && Number.isFinite(d.aoq)).sort((a, b) => a.p - b.p);
  if (pts.length === 0) return <p className="sp-note">Kurva AOQ belum tersedia.</p>;

  const xMax = Math.min(1, Math.max(0.08, ...pts.map((d) => d.p)) * 1.04);
  const yMax = Math.max(aoql, ...pts.map((d) => d.aoq), 1e-6) * 1.18;
  const sx = (p: number) => PAD.left + (p / xMax) * (W - PAD.left - PAD.right);
  const sy = (v: number) => H - PAD.bottom - (v / yMax) * (H - PAD.top - PAD.bottom);

  const line = pts.map((d, i) => `${i === 0 ? 'M' : 'L'}${sx(d.p).toFixed(2)},${sy(d.aoq).toFixed(2)}`).join(' ');
  const peak = pts.reduce((best, d) => (d.aoq > best.aoq ? d : best), pts[0]);

  return (
    <div>
      <svg className="sp-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${id}-t ${id}-d`}>
        <title id={`${id}-t`}>Kurva AOQ dan nilai AOQL</title>
        <desc id={`${id}-d`}>
          Kurva AOQ naik lalu turun. Nilai maksimum AOQL kira-kira {fmtProb(aoql)} terjadi pada proporsi cacat {fmtPct(peak.p)} persen.
        </desc>
        <defs>
          <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1fa971" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#1fa971" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((f) => (
          <g key={f}>
            <line x1={PAD.left} x2={W - PAD.right} y1={sy(f * yMax)} y2={sy(f * yMax)} stroke="#dce7fb" strokeWidth="1" strokeDasharray={f === 0 ? '0' : '3 4'} />
            <text x={PAD.left - 7} y={sy(f * yMax) + 3} textAnchor="end" fontSize="10" fill="var(--ink-soft)" fontFamily="var(--font-mono)">{fmtPct(f * yMax, 1)}</text>
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <text key={f} x={sx(f * xMax)} y={H - PAD.bottom + 15} textAnchor="middle" fontSize="10" fill="var(--ink-soft)" fontFamily="var(--font-mono)">{fmtPct(f * xMax, 1)}</text>
        ))}
        <path d={`${line} L${sx(pts[pts.length - 1].p).toFixed(2)},${sy(0).toFixed(2)} L${sx(pts[0].p).toFixed(2)},${sy(0).toFixed(2)} Z`} fill={`url(#${id}-g)`} />
        <path d={line} fill="none" stroke="#1fa971" strokeWidth="2.6" strokeLinejoin="round" />
        <line x1={sx(peak.p)} x2={sx(peak.p)} y1={sy(peak.aoq)} y2={sy(0)} stroke="#f5a524" strokeWidth="1.4" strokeDasharray="4 3" />
        <circle cx={sx(peak.p)} cy={sy(peak.aoq)} r="5.5" fill="#f5a524" stroke="#fff" strokeWidth="1.8" />
        <text x={Math.min(sx(peak.p) + 8, W - PAD.right - 78)} y={Math.max(sy(peak.aoq) - 9, PAD.top + 10)} fontSize="10.5" fontWeight="700" fill="#8a5700">AOQL {fmtProb(aoql)}</text>
        <text x={W - PAD.right} y={H - 5} textAnchor="end" fontSize="10" fill="var(--ink-soft)">Proporsi cacat p (%)</text>
      </svg>
      <p className="sr-only">AOQ maksimum sebesar {fmtProb(aoql)} terjadi pada p = {fmtPct(peak.p)} persen.</p>
    </div>
  );
}
