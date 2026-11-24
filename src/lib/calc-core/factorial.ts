/**
 * Faktorial 2^k dengan algoritma Yates, estimasi efek dan ANOVA.
 * Pengamatan harus dalam urutan Yates standar: (1), a, b, ab, c, ac, bc, abc, ...
 */
import type { AnovaRow, AnovaResult, FactorialEffect, FactorialResult } from '../types';
import { fCritical as fCrit, fSf } from './distributions';
import { formatNumber, formatP } from './format';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SUBSCRIPTS = '₀₁₂₃₄₅₆₇₈₉';
const EPS = 1e-12;

function subscript(value: number): string {
  return String(value)
    .split('')
    .map((digit) => SUBSCRIPTS[Number(digit)] ?? digit)
    .join('');
}

/** Indeks bit dari efek (1..2^k-1) → "A", "AB", "ABC", ... */
function termName(index: number): string {
  let name = '';
  for (let j = 0; j < ALPHABET.length; j += 1) {
    if ((index >> j) & 1) name += ALPHABET[j];
  }
  return name;
}

/** Kolom tanda ±1 untuk efek `index` pada urutan perlakuan Yates standar. */
function signColumn(index: number, size: number): number[] {
  const mask = size - 1;
  return Array.from({ length: size }, (_, treatment) => {
    const lowBits = (~treatment) & mask;
    let bits = index & lowBits;
    let sign = 1;
    while (bits !== 0) {
      sign = -sign;
      bits &= bits - 1;
    }
    return sign;
  });
}

/**
 * Faktorial 2^k.
 *
 * Kontras Yates → coefficient = kontras / (2^k · n), effect = 2 · coefficient,
 * SS_efek = kontras² / (2^k · n). Galat murni diestimasi dari replikasi;
 * tanpa replikasi F/p tidak dihitung dan `warning` diisi.
 */
export function yatesFactorial(
  observations: number[],
  k: number,
  replicates: number,
  names?: string[],
): FactorialResult {
  if (!Number.isInteger(k) || k < 1 || k > 20) {
    throw new Error('Orde faktorial k harus bilangan bulat antara 1 dan 20.');
  }
  if (!Number.isInteger(replicates) || replicates < 1) {
    throw new Error('Jumlah replikasi harus bilangan bulat ≥ 1.');
  }
  const size = 2 ** k;
  const totalN = size * replicates;
  if (!Array.isArray(observations) || observations.length !== totalN) {
    throw new Error(`Diperlukan ${totalN} pengamatan untuk 2^${k} dengan ${replicates} replikasi.`);
  }
  for (const value of observations) {
    if (!Number.isFinite(value)) throw new Error('Semua pengamatan harus berupa angka hingga.');
  }

  // Total tiap kombinasi perlakuan (urutan Yates standar).
  const totals = Array.from({ length: size }, (_, i) => {
    let sum = 0;
    for (let r = 0; r < replicates; r += 1) sum += observations[i * replicates + r];
    return sum;
  });

  // Algoritma kupu-kupu Yates.
  const work = totals.slice();
  for (let stage = 0; stage < k; stage += 1) {
    const half = 2 ** stage;
    for (let start = 0; start < size; start += 2 * half) {
      for (let j = 0; j < half; j += 1) {
        const plus = work[start + j];
        const minus = work[start + half + j];
        work[start + j] = plus + minus;
        work[start + half + j] = minus - plus;
      }
    }
  }

  const grandMean = work[0] / totalN;
  const effects: FactorialEffect[] = [];
  for (let index = 1; index < size; index += 1) {
    const contrast = work[index];
    const coefficient = contrast / totalN;
    effects.push({
      term: termName(index),
      effect: 2 * coefficient,
      coefficient,
      ss: (contrast * contrast) / totalN,
      signTable: signColumn(index, size),
    });
  }

  // Persamaan: bentuk simbolik + koefisien numerik (koma desimal).
  const symbolic: string[] = ['β₀'];
  let numeric = formatNumber(grandMean);
  for (let index = 1; index < size; index += 1) {
    const term = termName(index);
    let vars = '';
    let subs = '';
    for (let j = 0; j < k; j += 1) {
      if ((index >> j) & 1) {
        vars += `x${subscript(j + 1)}`;
        subs += subscript(j + 1);
      }
    }
    symbolic.push(`β${subs}${vars}`);
    const coefficient = effects[index - 1].coefficient;
    const operator = coefficient < 0 ? '−' : '+';
    numeric += ` ${operator} ${formatNumber(Math.abs(coefficient))}${vars}`;
  }
  const equation = `ŷ = ${symbolic.join(' + ')} = ${numeric}`;

  const hasReplication = replicates >= 2;
  if (!hasReplication) {
    return {
      effects,
      equation,
      hasReplication: false,
      warning:
        'Replikasi < 2: galat murni tidak dapat diestimasi. Efek dan SS ditampilkan, tetapi F dan p-value tidak dihitung.',
    };
  }

  // Galat murni: variasi antar replikasi di dalam tiap kombinasi perlakuan.
  let ssError = 0;
  for (let i = 0; i < size; i += 1) {
    const group = observations.slice(i * replicates, (i + 1) * replicates);
    const groupMean = group.reduce((sum, value) => sum + value, 0) / replicates;
    for (const value of group) ssError += (value - groupMean) ** 2;
  }
  let ssTotal = 0;
  for (const value of observations) ssTotal += (value - grandMean) ** 2;

  const dfError = size * (replicates - 1);
  const dfTotal = totalN - 1;
  const msError = ssError / dfError;
  const alpha = 0.05;
  const critical = fCrit(alpha, 1, dfError);

  const rows: AnovaRow[] = effects.map((effect, i) => {
    const f = msError > EPS ? effect.ss / msError : Number.POSITIVE_INFINITY;
    const p = fSf(f, 1, dfError);
    const factorIndex = i + 1;
    const factorNames = names
      ?.map((name, j) => ((factorIndex >> j) & 1 ? name : null))
      .filter((name): name is string => name !== null);
    return {
      source: effect.term,
      ss: effect.ss,
      df: 1,
      ms: effect.ss,
      f,
      p,
      note: factorNames?.length ? factorNames.join(' × ') : undefined,
    };
  });
  rows.push({ source: 'Error', ss: ssError, df: dfError, ms: msError });
  rows.push({
    source: 'Total',
    ss: ssTotal,
    df: dfTotal,
    ms: ssTotal / dfTotal,
    note: 'SS total = Σ efek + SS galat murni',
  });

  const significant = rows.filter((row) => row.p !== undefined && row.p < alpha);
  const rejected = significant.length > 0;
  const conclusion = rejected
    ? `Tolak H₀: efek ${significant.map((row) => row.source).join(', ')} signifikan (${formatP(Math.min(...significant.map((row) => row.p ?? 1)))}, α = ${alpha}).`
    : `Gagal menolak H₀: tidak ada efek yang signifikan pada α = ${alpha}.`;

  const anova: AnovaResult = {
    rows,
    totalSs: ssTotal,
    errorMs: msError,
    conclusion,
    rejected,
    alpha,
    fCritical: critical,
    grandMean,
  };

  return { effects, anova, equation, hasReplication: true };
}
