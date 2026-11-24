/** Format angka dan pembulatan. Pembulatan HANYA di sini, bukan di komputasi. */

/** Bulatkan ke `digits` angka desimal (default 4). */
export function roundTo(n: number, digits = 4): number {
  if (!Number.isFinite(n)) return n;
  const factor = 10 ** Math.trunc(digits);
  return Math.round((n + Number.EPSILON * Math.abs(n)) * factor) / factor;
}

/** Format p-value dengan koma desimal ala Indonesia. */
export function formatP(p: number): string {
  if (!Number.isFinite(p)) return 'p = —';
  if (p < 1e-4) return 'p < 0,0001';
  return `p = ${p.toFixed(4).replace('.', ',')}`;
}

/** Format angka untuk dipakai dalam string (4 desimal, koma desimal). */
export function formatNumber(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return '—';
  return n.toFixed(digits).replace('.', ',');
}
