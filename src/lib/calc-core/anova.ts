/**
 * ANOVA untuk Rancangan Acak Lengkap (CRD), Rancangan Acak Kelompok (RCBD),
 * dan uji lanjut Fisher LSD. Tanpa dependensi UI/DOM.
 */
import type { AnovaResult, AnovaRow } from '../types';
import { fCritical as fCrit, fSf, tCritical } from './distributions';
import { formatP } from './format';

const EPS = 1e-12;

interface CrdInternals {
  result: AnovaResult;
  means: number[];
  sizes: number[];
  dfError: number;
  msError: number;
}

function mean(values: number[]): number {
  let sum = 0;
  for (const value of values) sum += value;
  return sum / values.length;
}

function validateGroups(groups: number[][]): void {
  if (!Array.isArray(groups) || groups.length < 2) {
    throw new Error('ANOVA memerlukan minimal dua kelompok perlakuan.');
  }
  for (let i = 0; i < groups.length; i += 1) {
    if (!Array.isArray(groups[i]) || groups[i].length === 0) {
      throw new Error(`Kelompok ke-${i + 1} tidak boleh kosong.`);
    }
    for (const value of groups[i]) {
      if (!Number.isFinite(value)) {
        throw new Error('Semua pengamatan harus berupa angka hingga.');
      }
    }
  }
}

function decomposeCrd(groups: number[][], alpha: number): CrdInternals {
  validateGroups(groups);

  const sizes = groups.map((group) => group.length);
  const means = groups.map(mean);
  const totalN = sizes.reduce((sum, size) => sum + size, 0);
  const grandMean = groups.reduce((sum, group) => sum + group.reduce((s, v) => s + v, 0), 0) / totalN;

  let ssTotal = 0;
  for (const group of groups) {
    for (const value of group) ssTotal += (value - grandMean) ** 2;
  }
  let ssTreatment = 0;
  for (let i = 0; i < groups.length; i += 1) {
    ssTreatment += sizes[i] * (means[i] - grandMean) ** 2;
  }
  const ssError = Math.max(0, ssTotal - ssTreatment);

  const dfTreatment = groups.length - 1;
  const dfError = totalN - groups.length;
  if (dfError <= 0) {
    throw new Error('Derajat kebebasan galat harus > 0: tambahkan replikasi pada setiap perlakuan.');
  }
  const dfTotal = totalN - 1;
  const msTreatment = ssTreatment / dfTreatment;
  const msError = ssError / dfError;
  const f = msError > EPS ? msTreatment / msError : Number.POSITIVE_INFINITY;
  const p = fSf(f, dfTreatment, dfError);
  const critical = fCrit(alpha, dfTreatment, dfError);
  const rejected = p < alpha;

  const rows: AnovaRow[] = [
    {
      source: 'Treatment',
      ss: ssTreatment,
      df: dfTreatment,
      ms: msTreatment,
      f,
      p,
    },
    { source: 'Error', ss: ssError, df: dfError, ms: msError },
    {
      source: 'Total',
      ss: ssTotal,
      df: dfTotal,
      ms: dfTotal > 0 ? ssTotal / dfTotal : Number.NaN,
      note: 'MS total hanya informatif',
    },
  ];

  const conclusion = rejected
    ? `Tolak H₀: terdapat perbedaan signifikan antar perlakuan (${formatP(p)}, α = ${alpha}).`
    : `Gagal menolak H₀: tidak cukup bukti perbedaan signifikan antar perlakuan (${formatP(p)}, α = ${alpha}).`;

  return {
    result: {
      rows,
      totalSs: ssTotal,
      errorMs: msError,
      conclusion,
      rejected,
      alpha,
      fCritical: critical,
      grandMean,
    },
    means,
    sizes,
    dfError,
    msError,
  };
}

/** ANOVA Rancangan Acak Lengkap (CRD / completely randomized design). */
export function crdAnova(groups: number[][], alpha = 0.05): AnovaResult {
  return decomposeCrd(groups, alpha).result;
}

export interface LsdPair {
  a: number;
  b: number;
  diff: number;
  lsd: number;
  significant: boolean;
}

export interface FisherLsdResult {
  alpha: number;
  dfError: number;
  msError: number;
  pairs: LsdPair[];
}

/**
 * Fisher LSD untuk semua pasangan perlakuan.
 * LSD = t_{α/2, dfError} · sqrt(MSE · (1/n_a + 1/n_b)),
 * yang sama dengan t_{α/2} · sqrt(2·MSE/n) bila ukuran kelompok sama.
 */
export function fisherLsd(groups: number[][], alpha = 0.05): FisherLsdResult {
  const internals = decomposeCrd(groups, alpha);
  const tCrit = tCritical(alpha, internals.dfError);
  const pairs: LsdPair[] = [];

  for (let a = 0; a < groups.length; a += 1) {
    for (let b = a + 1; b < groups.length; b += 1) {
      const variance = internals.msError * (1 / internals.sizes[a] + 1 / internals.sizes[b]);
      const lsd = tCrit * Math.sqrt(Math.max(0, variance));
      const diff = internals.means[a] - internals.means[b];
      pairs.push({ a, b, diff, lsd, significant: Math.abs(diff) > lsd });
    }
  }

  return { alpha, dfError: internals.dfError, msError: internals.msError, pairs };
}

/** ANOVA Rancangan Acak Kelompok (RCBD), baris: Treatment, Block, Error, Total. */
export function rcbdAnova(treatmentsXBlocks: number[][], alpha = 0.05): AnovaResult {
  if (!Array.isArray(treatmentsXBlocks) || treatmentsXBlocks.length < 2) {
    throw new Error('RCBD memerlukan minimal dua perlakuan.');
  }
  const t = treatmentsXBlocks.length;
  const b = treatmentsXBlocks[0].length;
  if (b < 2) {
    throw new Error('RCBD memerlukan minimal dua blok.');
  }
  for (let i = 0; i < t; i += 1) {
    if (!Array.isArray(treatmentsXBlocks[i]) || treatmentsXBlocks[i].length !== b) {
      throw new Error('Setiap perlakuan harus memiliki jumlah blok yang sama.');
    }
    for (const value of treatmentsXBlocks[i]) {
      if (!Number.isFinite(value)) throw new Error('Semua pengamatan harus berupa angka hingga.');
    }
  }

  let sum = 0;
  for (const row of treatmentsXBlocks) for (const value of row) sum += value;
  const grandMean = sum / (t * b);

  let ssTotal = 0;
  for (const row of treatmentsXBlocks) {
    for (const value of row) ssTotal += (value - grandMean) ** 2;
  }

  const treatmentMeans = treatmentsXBlocks.map((row) => mean(row));
  const blockMeans = Array.from({ length: b }, (_, j) =>
    mean(treatmentsXBlocks.map((row) => row[j])),
  );

  let ssTreatment = 0;
  for (const m of treatmentMeans) ssTreatment += b * (m - grandMean) ** 2;
  let ssBlock = 0;
  for (const m of blockMeans) ssBlock += t * (m - grandMean) ** 2;
  const ssError = Math.max(0, ssTotal - ssTreatment - ssBlock);

  const dfTreatment = t - 1;
  const dfBlock = b - 1;
  const dfError = (t - 1) * (b - 1);
  const dfTotal = t * b - 1;
  if (dfError <= 0) throw new Error('Derajat kebebasan galat RCBD harus > 0.');

  const msTreatment = ssTreatment / dfTreatment;
  const msBlock = ssBlock / dfBlock;
  const msError = ssError / dfError;
  const fTreatment = msError > EPS ? msTreatment / msError : Number.POSITIVE_INFINITY;
  const fBlock = msError > EPS ? msBlock / msError : Number.POSITIVE_INFINITY;
  const pTreatment = fSf(fTreatment, dfTreatment, dfError);
  const pBlock = fSf(fBlock, dfBlock, dfError);
  const rejected = pTreatment < alpha;

  const rows: AnovaRow[] = [
    {
      source: 'Treatment',
      ss: ssTreatment,
      df: dfTreatment,
      ms: msTreatment,
      f: fTreatment,
      p: pTreatment,
    },
    {
      source: 'Block',
      ss: ssBlock,
      df: dfBlock,
      ms: msBlock,
      f: fBlock,
      p: pBlock,
    },
    { source: 'Error', ss: ssError, df: dfError, ms: msError },
    {
      source: 'Total',
      ss: ssTotal,
      df: dfTotal,
      ms: ssTotal / dfTotal,
      note: 'MS total hanya informatif',
    },
  ];

  const conclusion = rejected
    ? `Tolak H₀: perlakuan berbeda signifikan setelah efek blok dikontrol (${formatP(pTreatment)}, α = ${alpha}).`
    : `Gagal menolak H₀: tidak cukup bukti perbedaan perlakuan setelah efek blok dikontrol (${formatP(pTreatment)}, α = ${alpha}).`;

  return {
    rows,
    totalSs: ssTotal,
    errorMs: msError,
    conclusion,
    rejected,
    alpha,
    fCritical: fCrit(alpha, dfTreatment, dfError),
    grandMean,
  };
}
