/** Taguchi: rasio S/N tiga karakteristik, tabel respons, dan prediksi η_opt. */
import type { SnCharacteristic, SnResult, TaguchiResponseRow } from '../types';

const EPSILON = 1e-12;

/**
 * Rasio signal-to-noise.
 * smaller : −10 log10( mean(y²) )
 * larger  : −10 log10( mean(1/y²) )
 * nominal : 10 log10( ȳ² / s² ), s² = varians sampel (n−1)
 * Nilai y = 0 dan varians nol dibatasi dengan epsilon kecil.
 */
export function snRatio(
  observations: number[],
  characteristic: SnCharacteristic,
  target?: number,
): number {
  if (!Array.isArray(observations) || observations.length === 0) {
    throw new Error('Rasio S/N memerlukan minimal satu pengamatan.');
  }
  for (const value of observations) {
    if (!Number.isFinite(value)) throw new Error('Semua pengamatan harus berupa angka hingga.');
  }
  if (characteristic !== 'smaller' && characteristic !== 'larger' && characteristic !== 'nominal') {
    throw new Error('Karakteristik S/N harus smaller, larger, atau nominal.');
  }

  const n = observations.length;
  const safe = observations.map((value) => (Math.abs(value) < EPSILON ? EPSILON : value));
  const average = safe.reduce((sum, value) => sum + value, 0) / n;

  if (characteristic === 'smaller') {
    const meanSquare = safe.reduce((sum, value) => sum + value * value, 0) / n;
    return -10 * Math.log10(Math.max(meanSquare, EPSILON));
  }
  if (characteristic === 'larger') {
    const meanInverseSquare =
      safe.reduce((sum, value) => sum + 1 / (value * value), 0) / n;
    return -10 * Math.log10(Math.max(meanInverseSquare, EPSILON));
  }

  let variance = 0;
  for (const value of safe) variance += (value - average) ** 2;
  variance = n > 1 ? variance / (n - 1) : EPSILON;
  if (variance < EPSILON) variance = EPSILON;
  return 10 * Math.log10((average * average) / variance);
}

export interface TaguchiAnalysisResult {
  sn: SnResult;
  response: TaguchiResponseRow[];
  predicted: number;
}

/** Analisis tabel respons Taguchi untuk OA berbentuk array baris kode level (1..L). */
export function taguchiAnalysis(
  oa: number[][],
  observations: number[][],
  characteristic: SnCharacteristic,
  target?: number,
): TaguchiAnalysisResult {
  if (!Array.isArray(oa) || oa.length === 0) {
    throw new Error('Array orthogonal array tidak boleh kosong.');
  }
  if (observations.length !== oa.length) {
    throw new Error('Jumlah baris observasi harus sama dengan jumlah baris OA.');
  }
  const factors = oa[0].length;
  if (factors === 0) throw new Error('OA harus memiliki minimal satu faktor.');
  for (let i = 0; i < oa.length; i += 1) {
    if (!Array.isArray(oa[i]) || oa[i].length !== factors) {
      throw new Error('Setiap baris OA harus memiliki jumlah faktor yang sama.');
    }
    if (!Array.isArray(observations[i]) || observations[i].length === 0) {
      throw new Error(`Baris observasi ke-${i + 1} tidak boleh kosong.`);
    }
  }

  const ratios = observations.map((row) => snRatio(row, characteristic, target));
  const means = observations.map((row) => row.reduce((sum, value) => sum + value, 0) / row.length);
  const sn: SnResult = { characteristic, ratios, means, target };

  const grandEta = ratios.reduce((sum, value) => sum + value, 0) / ratios.length;
  const response: TaguchiResponseRow[] = [];

  for (let factor = 0; factor < factors; factor += 1) {
    const levels = Array.from(
      new Set(oa.map((row) => row[factor]).filter((level) => Number.isFinite(level))),
    ).sort((a, b) => a - b);
    const levelMeans = levels.map((level) => {
      const indices = oa.map((row, i) => (row[factor] === level ? i : -1)).filter((i) => i >= 0);
      return indices.reduce((sum, i) => sum + ratios[i], 0) / indices.length;
    });
    const best = levelMeans.indexOf(Math.max(...levelMeans));
    response.push({
      factor: `F${factor + 1}`,
      levels: levelMeans,
      delta: Math.max(...levelMeans) - Math.min(...levelMeans),
      rank: 0,
      optimalLevel: levels[best],
    });
  }

  const ranked = response.slice().sort((a, b) => b.delta - a.delta);
  ranked.forEach((row, index) => {
    if (index === 0 || row.delta !== ranked[index - 1].delta) {
      row.rank = index + 1;
    } else {
      row.rank = ranked[index - 1].rank;
    }
  });

  const predicted = grandEta + response.reduce((sum, row) => sum + (Math.max(...row.levels) - grandEta), 0);

  return { sn, response, predicted };
}
