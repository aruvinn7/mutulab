/**
 * Distribusi probabilitas murni untuk MutuLab.
 *
 * Fungsi beta tak lengkap teregularisasi dihitung dengan pecahan berlanjut
 * Lentz (Numerical Recipes, `betacf`) dan pendekatan Lanczos untuk log-Gamma.
 * Nilai kritis dicari dengan bisection; semua angka internal double precision.
 * Tidak ada DOM, tidak ada dependensi UI.
 */

const LANCZOS = [
  76.18009172947146,
  -86.50532032941677,
  24.01409824083091,
  -1.231739572450155,
  0.1208650973866179e-2,
  -0.5395239384953e-5,
] as const;

const LOG_SQRT_2PI = 0.9189385332046727; // ln(sqrt(2π))
const FPMIN = 1e-300;
const EPS = 3e-14;
const MAX_ITER = 300;

/** Log Gamma, pendekatan Lanczos (galat relatif < 1e-14 untuk x > 0). */
export function logGamma(x: number): number {
  if (!Number.isFinite(x) || x <= 0) return Number.NaN;
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let series = 1.000000000190015;
  for (let j = 0; j < LANCZOS.length; j += 1) {
    y += 1;
    series += LANCZOS[j] / y;
  }
  return LOG_SQRT_2PI + Math.log(series / x) - tmp;
}

/** Pecahan berlanjut untuk I_x(a, b) menurut Lentz. */
function betaContinuedFraction(a: number, b: number, x: number): number {
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;

  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;

  for (let m = 1; m <= MAX_ITER; m += 1) {
    const m2 = 2 * m;

    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;

    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;

    const delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) <= EPS) break;
  }
  return h;
}

/** Regularized incomplete beta function I_x(a, b). */
export function regularizedIncompleteBeta(x: number, a: number, b: number): number {
  if (Number.isNaN(x) || Number.isNaN(a) || Number.isNaN(b)) return Number.NaN;
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const front = Math.exp(
    logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log1p(-x),
  );
  if (x < (a + 1) / (a + b + 2)) {
    return (front * betaContinuedFraction(a, b, x)) / a;
  }
  return 1 - (front * betaContinuedFraction(b, a, 1 - x)) / b;
}

/** Pencarian akar bisection untuk fungsi monoton. */
function bisect(decreasing: (x: number) => number, upperStart = 1): number {
  let lo = 0;
  let hi = upperStart;
  let guard = 0;
  while (decreasing(hi) > 0 && guard < 200) {
    lo = hi;
    hi *= 2;
    guard += 1;
  }

  if (guard >= 200) return Number.POSITIVE_INFINITY;
  for (let i = 0; i < 200; i += 1) {
    const mid = (lo + hi) / 2;
    const value = decreasing(mid);
    if (value === 0) return mid;
    if (value > 0) lo = mid;
    else hi = mid;
    if (hi - lo <= 1e-13 * Math.max(1, Math.abs(mid))) break;
  }
  return (lo + hi) / 2;
}

/** CDF distribusi F: P(F_{df1,df2} ≤ x). */
export function fCdf(x: number, df1: number, df2: number): number {
  if (x <= 0) return 0;
  if (!Number.isFinite(x)) return 1;
  if (df1 <= 0 || df2 <= 0) return Number.NaN;
  const z = (df1 * x) / (df1 * x + df2);
  return regularizedIncompleteBeta(z, df1 / 2, df2 / 2);
}

/** Upper-tail distribusi F (p-value): P(F_{df1,df2} > x). */
export function fSf(x: number, df1: number, df2: number): number {
  if (x <= 0) return 1;
  if (!Number.isFinite(x)) return 0;
  if (df1 <= 0 || df2 <= 0) return Number.NaN;
  const z = df2 / (df1 * x + df2);
  return regularizedIncompleteBeta(z, df2 / 2, df1 / 2);
}

/** Nilai kritis F pada taraf α (upper tail). fSf(fCritical(α,·)) = α. */
export function fCritical(alpha: number, df1: number, df2: number): number {
  if (alpha <= 0) return Number.POSITIVE_INFINITY;
  if (alpha >= 1) return 0;
  if (df1 <= 0 || df2 <= 0) return Number.NaN;
  return bisect((x) => fSf(x, df1, df2) - alpha, 1);
}

/** Upper-tail dua sisi distribusi t: P(|T_df| > t). */
export function tTwoSidedSf(t: number, df: number): number {
  if (df <= 0) return Number.NaN;
  const at = Math.abs(t);
  if (at === 0) return 1;
  return regularizedIncompleteBeta(df / (df + at * at), df / 2, 0.5);
}

/**
 * Nilai kritis t dua sisi pada taraf α:
 * tCritical(0,05, 12) = t_{0,025,12} ≈ 2,1788.
 */
export function tCritical(alpha: number, df: number): number {
  if (alpha <= 0) return Number.POSITIVE_INFINITY;
  if (alpha >= 1) return 0;
  return bisect((t) => tTwoSidedSf(t, df) - alpha, 1);
}

/** CDF distribusi t (dipakai internal dan berguna untuk keperluan UI). */
export function tCdf(t: number, df: number): number {
  const upper = tTwoSidedSf(t, df) / 2;
  return t >= 0 ? 1 - upper : upper;
}

/**
 * Survival function normal standar P(Z > z).
 * Abramowitz & Stegun 7.1.26, galat absolut < 7,5e-8.
 */
export function normalSf(z: number): number {
  if (z === 0) return 0.5;
  const x = Math.abs(z);
  const t = 1 / (1 + 0.2316419 * x);
  const polynomial =
    ((((1.330274429 * t - 1.821255978) * t + 1.781477937) * t - 0.356563782) * t +
      0.319381530) *
    t;
  const upper = (Math.exp((-x * x) / 2) / Math.sqrt(2 * Math.PI)) * polynomial;
  return z >= 0 ? upper : 1 - upper;
}
