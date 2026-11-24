/** Pembantu tampilan untuk kurva OC & metrik sampling (tanpa logika statistik baru). */

export interface OcPoint {
  p: number;
  pa: number;
}

/** Interpolasi linier Peluang Terima (Pa) pada proporsi cacat p dari titik-titik kurva OC. */
export function paAt(points: OcPoint[], p: number): number {
  if (points.length === 0) return NaN;
  const sorted = [...points].sort((a, b) => a.p - b.p);
  if (p <= sorted[0].p) return sorted[0].pa;
  if (p >= sorted[sorted.length - 1].p) return sorted[sorted.length - 1].pa;
  for (let i = 1; i < sorted.length; i++) {
    if (p <= sorted[i].p) {
      const lo = sorted[i - 1];
      const hi = sorted[i];
      const t = hi.p === lo.p ? 0 : (p - lo.p) / (hi.p - lo.p);
      return lo.pa + t * (hi.pa - lo.pa);
    }
  }
  return sorted[sorted.length - 1].pa;
}

/** Format persentase dengan pemisah desimal koma (Indonesia). */
export function fmtPct(p: number, digits = 2): string {
  if (!Number.isFinite(p)) return '—';
  return p.toLocaleString('id-ID', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/** Format peluang dengan 4 desimal sesuai kontrak. */
export function fmtProb(p: number): string {
  if (!Number.isFinite(p)) return '—';
  if (p !== 0 && Math.abs(p) < 0.0001) return '< 0,0001';
  return p.toLocaleString('id-ID', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
}
