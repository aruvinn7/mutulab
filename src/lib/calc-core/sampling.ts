/** Rencana sampling penerimaan tunggal: kurva OC, AOQ/AOQL, ASN, dan ATI. */
import type { SamplingPlanResult } from '../types';
import { logGamma } from './distributions';

export type SamplingDistribution = 'binomial' | 'poisson';

/** Pa = P(d ≤ c) untuk distribusi binomial. */
export function paBinomial(n: number, c: number, p: number): number {
  if (c >= n) return 1;
  if (p <= 0) return 1;
  if (p >= 1) return 0;

  const logP = Math.log(p);
  const logQ = Math.log1p(-p);
  let probability = 0;
  for (let d = 0; d <= c; d += 1) {
    const logCombination =
      logGamma(n + 1) - logGamma(d + 1) - logGamma(n - d + 1);
    probability += Math.exp(logCombination + d * logP + (n - d) * logQ);
  }
  return Math.min(1, Math.max(0, probability));
}

/** Pa = P(d ≤ c) untuk pendekatan Poisson dengan λ = n·p. */
export function paPoisson(n: number, c: number, p: number): number {
  if (c >= n) return 1;
  if (p <= 0) return 1;
  const lambda = n * p;
  const logLambda = Math.log(lambda);
  let probability = 0;
  for (let d = 0; d <= c; d += 1) {
    probability += Math.exp(-lambda + d * logLambda - logGamma(d + 1));
  }
  return Math.min(1, Math.max(0, probability));
}

export interface SamplingPlanParams {
  n: number;
  c: number;
  N?: number;
  aql?: number;
  ltpd?: number;
  distribution?: SamplingDistribution;
}

/**
 * Rencana sampling tunggal.
 * AOQ = Pa·p·(N−n)/N bila N diketahui, selain itu Pa·p; AOQL = maksimum AOQ.
 * ATI dievaluasi pada AQL (atau LTPD bila AQL tidak ada, atau p = 0,5)
 * dengan rumus eksak ATI = n + (1 − Pa)(N − n).
 */
export function samplingPlan(params: SamplingPlanParams): SamplingPlanResult {
  const { n, c, N, aql, ltpd } = params;
  const distribution = params.distribution ?? 'binomial';

  if (!Number.isInteger(n) || n < 1) throw new Error('Ukuran sampel n harus bilangan bulat ≥ 1.');
  if (!Number.isInteger(c) || c < 0 || c > n) {
    throw new Error('Angka penerimaan c harus bilangan bulat antara 0 dan n.');
  }
  if (N !== undefined && (!Number.isFinite(N) || N <= 0)) {
    throw new Error('Ukuran lot N harus bilangan positif.');
  }
  if (distribution !== 'binomial' && distribution !== 'poisson') {
    throw new Error('Distribusi harus binomial atau poisson.');
  }
  for (const level of [aql, ltpd]) {
    if (level !== undefined && (!Number.isFinite(level) || level < 0 || level > 1)) {
      throw new Error('AQL dan LTPD harus berada dalam rentang 0–1.');
    }
  }

  const acceptance =
    distribution === 'binomial'
      ? (p: number) => paBinomial(n, c, p)
      : (p: number) => paPoisson(n, c, p);

  const points = Array.from({ length: 101 }, (_, i) => {
    const p = i / 100;
    return { p, pa: acceptance(p) };
  });

  const correction = N !== undefined && N > 0 ? (N - n) / N : 1;
  const aoq = points.map(({ p, pa }) => ({ p, aoq: pa * p * correction }));
  let aoql = 0;
  for (const point of aoq) if (point.aoq > aoql) aoql = point.aoq;

  const referenceP = aql ?? ltpd ?? 0.5;
  const referencePa = acceptance(referenceP);
  const ati = N !== undefined && N > 0 ? n + (1 - referencePa) * Math.max(N - n, 0) : n;

  return {
    n,
    c,
    points,
    aql,
    ltpd,
    aoq,
    aoql,
    asn: n,
    ati,
  };
}
