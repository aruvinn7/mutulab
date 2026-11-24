import { useId, useMemo, useState } from 'react';
import type { OcPoint } from './sampling-utils';
import { fmtPct, fmtProb } from './sampling-utils';

interface Props {
  points: OcPoint[];
  aql?: number;
  ltpd?: number;
  /** Pa pada AQL (disediakan pemanggil bila tersedia). */
  paAql?: number;
  /** Pa pada LTPD. */
  paLtpd?: number;
  /** Ukuran lebih ringkas untuk simulator. */
  compact?: boolean;
  /** Penanda tambahan, misalnya proporsi cacat lot saat ini. */
  marker?: { p: number; pa: number; label: string; color: string };
}

/** Kurva Operating Characteristic: Peluang terima vs. proporsi cacat, dengan grid & titik AQL/LTPD. */
export default function OcCurve({ points, aql, ltpd, paAql, paLtpd, compact = false, marker }: Props) {
  const rawId = useId().replace(/:/g, '');
  const [hover, setHover] = useState<number | null>(null);

  const W = compact ? 400 : 660;
  const H = compact ? 250 : 400;
  const PAD = compact
    ? { top: 18, right: 16, bottom: 46, left: 50 }
    : { top: 26, right: 22, bottom: 58, left: 62 };

  const sorted = useMemo(() => [...points].filter((p) => Number.isFinite(p.p) && Number.isFinite(p.pa)).sort((a, b) => a.p - b.p), [points]);
  const xMax = Math.min(1, Math.max(0.08, ...sorted.map((d) => d.p), aql ?? 0, ltpd ?? 0) * 1.04);

  const sx = (p: number) => PAD.left + (p / xMax) * (W - PAD.left - PAD.right);
  const sy = (pa: number) => H - PAD.bottom - pa * (H - PAD.top - PAD.bottom);

  const line = sorted.map((d, i) => `${i === 0 ? 'M' : 'L'}${sx(d.p).toFixed(2)},${sy(d.pa).toFixed(2)}`).join(' ');
  const area = sorted.length ? `${line} L${sx(sorted[sorted.length - 1].p).toFixed(2)},${sy(0).toFixed(2)} L${sx(sorted[0].p).toFixed(2)},${sy(0).toFixed(2)} Z` : '';

  const xTicks = [0, 0.2, 0.4, 0.6, 0.8, 1].map((f) => f * xMax);
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const hit = hover !== null ? sorted[hover] : null;
  const tooltipX = hit ? Math.min(Math.max(sx(hit.p), PAD.left + 52), W - PAD.right - 52) : 0;
  const tooltipY = hit ? Math.max(sy(hit.pa) - 46, PAD.top + 4) : 0;

  const summary = `Kurva OC turun dari kiri ke kanan.${aql !== undefined && paAql !== undefined ? ` Pada AQL ${fmtPct(aql)} persen, peluang terima ${fmtPct(paAql, 1)} persen.` : ''}${ltpd !== undefined && paLtpd !== undefined ? ` Pada LTPD ${fmtPct(ltpd)} persen, peluang terima ${fmtPct(paLtpd, 1)} persen.` : ''}${marker ? ` Penanda ${marker.label}: p ${fmtPct(marker.p)} persen dengan peluang terima ${fmtPct(marker.pa, 1)} persen.` : ''}`;

  return (
    <div>
      <svg className="sp-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-labelledby={`${rawId}-t ${rawId}-d`}>
        <title id={`${rawId}-t`}>Kurva OC — peluang menerima lot</title>
        <desc id={`${rawId}-d`}>{summary}</desc>
        <defs>
          <linearGradient id={`${rawId}-g`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2f6bff" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#2f6bff" stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {yTicks.map((v) => (
          <g key={`y${v}`}>
            <line x1={PAD.left} x2={W - PAD.right} y1={sy(v)} y2={sy(v)} stroke="#dce7fb" strokeWidth="1" strokeDasharray={v === 0 ? '0' : '3 4'} />
            <text x={PAD.left - 8} y={sy(v) + 3.5} textAnchor="end" fontSize="10.5" fill="var(--ink-soft)" fontFamily="var(--font-mono)">{fmtPct(v, 0)}</text>
          </g>
        ))}
        {xTicks.map((p) => (
          <g key={`x${p}`}>
            <line x1={sx(p)} x2={sx(p)} y1={PAD.top} y2={sy(0)} stroke="#eaf1fd" strokeWidth="1" />
            <text x={sx(p)} y={H - PAD.bottom + 16} textAnchor="middle" fontSize="10.5" fill="var(--ink-soft)" fontFamily="var(--font-mono)">{fmtPct(p, 1)}</text>
          </g>
        ))}
        <line x1={PAD.left} x2={W - PAD.right} y1={sy(0)} y2={sy(0)} stroke="#94a9cf" strokeWidth="1.2" />
        <line x1={PAD.left} x2={PAD.left} y1={PAD.top} y2={sy(0)} stroke="#94a9cf" strokeWidth="1.2" />

        {area && <path d={area} fill={`url(#${rawId}-g)`} />}
        {line && <path d={line} fill="none" stroke="var(--accent)" strokeWidth="2.8" strokeLinejoin="round" />}

        {aql !== undefined && aql <= xMax && (
          <g>
            <line x1={sx(aql)} x2={sx(aql)} y1={PAD.top} y2={sy(0)} stroke="#1fa971" strokeWidth="1.6" strokeDasharray="6 4" />
            {paAql !== undefined && <circle cx={sx(aql)} cy={sy(paAql)} r="6" fill="#1fa971" stroke="#fff" strokeWidth="2" />}
            <text x={Math.min(sx(aql) + 7, W - PAD.right - 40)} y={PAD.top + 12} fontSize="11" fontWeight="700" fill="#0d6b49">AQL</text>
          </g>
        )}
        {ltpd !== undefined && ltpd <= xMax && (
          <g>
            <line x1={sx(ltpd)} x2={sx(ltpd)} y1={PAD.top} y2={sy(0)} stroke="#e5484d" strokeWidth="1.6" strokeDasharray="6 4" />
            {paLtpd !== undefined && (
              <rect x={sx(ltpd) - 5.5} y={sy(paLtpd) - 5.5} width="11" height="11" fill="#e5484d" stroke="#fff" strokeWidth="1.8" transform={`rotate(45 ${sx(ltpd)} ${sy(paLtpd)})`} />
            )}
            <text x={Math.min(sx(ltpd) + 7, W - PAD.right - 48)} y={PAD.top + 26} fontSize="11" fontWeight="700" fill="#a5161b">LTPD</text>
          </g>
        )}

        {marker && marker.p <= xMax && (
          <g>
            <line x1={sx(marker.p)} x2={sx(marker.p)} y1={PAD.top} y2={sy(0)} stroke={marker.color} strokeWidth="1.8" strokeDasharray="5 4" />
            <circle cx={sx(marker.p)} cy={sy(marker.pa)} r="5.5" fill={marker.color} stroke="#fff" strokeWidth="1.8" />
            <text x={Math.min(sx(marker.p) + 7, W - PAD.right - 64)} y={PAD.top + 38} fontSize="10.5" fontWeight="700" fill={marker.color}>{marker.label}</text>
          </g>
        )}

        {sorted.map((d, i) => (
          <circle key={i} className="sp-chart-hit" cx={sx(d.p)} cy={sy(d.pa)} r={compact ? 7 : 9} fill="transparent"
            tabIndex={0} role="img" aria-label={`Proporsi cacat ${fmtPct(d.p)} persen, peluang terima ${fmtPct(d.pa, 1)} persen`}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)} onBlur={() => setHover(null)} />
        ))}

        {hit && (
          <g className="sp-tooltip" pointerEvents="none">
            <rect x={tooltipX - 52} y={tooltipY} width="104" height="38" rx="8" />
            <text x={tooltipX} y={tooltipY + 15} textAnchor="middle">p = {fmtPct(hit.p)}%</text>
            <text x={tooltipX} y={tooltipY + 29} textAnchor="middle">Pa = {fmtProb(hit.pa)}</text>
          </g>
        )}

        {!compact && <text x={W - PAD.right} y={H - 6} textAnchor="end" fontSize="11" fill="var(--ink-soft)">Proporsi cacat lot p (%)</text>}
        {!compact && <text x={4} y={13} fontSize="11" fill="var(--ink-soft)">Pa (%)</text>}
      </svg>
      <p className="sr-only">Ringkasan teks kurva OC: {summary} Arahkan kursor atau gunakan Tab untuk membaca nilai pada titik.</p>
    </div>
  );
}
