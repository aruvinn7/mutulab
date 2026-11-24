/** Data Orthogonal Array Taguchi (L4, L8, L9) — orisinal, mengikuti konvensi standar. */

export type ArrayKey = 'L4' | 'L8' | 'L9';

export interface OrthogonalArray {
  key: ArrayKey;
  label: string;
  /** Jumlah level tiap faktor (seragam pada ketiga array ini). */
  levels: 2 | 3;
  /** Jumlah kolom faktor maksimum. */
  maxFactors: number;
  /** Baris matriks, berisi kode level 1..levels. */
  rows: number[][];
  /** Nama faktor bawaan yang bisa diubah pengguna. */
  defaultNames: string[];
}

const L4: number[][] = [
  [1, 1, 1],
  [1, 2, 2],
  [2, 1, 2],
  [2, 2, 1],
];

const L8: number[][] = [
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 2, 2, 2, 2],
  [1, 2, 2, 1, 1, 2, 2],
  [1, 2, 2, 2, 2, 1, 1],
  [2, 1, 2, 1, 2, 1, 2],
  [2, 1, 2, 2, 1, 2, 1],
  [2, 2, 1, 1, 2, 2, 1],
  [2, 2, 1, 2, 1, 1, 2],
];

const L9: number[][] = [
  [1, 1, 1, 1],
  [1, 2, 2, 2],
  [1, 3, 3, 3],
  [2, 1, 2, 3],
  [2, 2, 3, 1],
  [2, 3, 1, 2],
  [3, 1, 3, 2],
  [3, 2, 1, 3],
  [3, 3, 2, 1],
];

const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

export const ORTHOGONAL_ARRAYS: OrthogonalArray[] = [
  { key: 'L4', label: 'L₄ (2³)', levels: 2, maxFactors: 3, rows: L4, defaultNames: letters.slice(0, 3) },
  { key: 'L8', label: 'L₈ (2⁷)', levels: 2, maxFactors: 7, rows: L8, defaultNames: letters.slice(0, 7) },
  { key: 'L9', label: 'L₉ (3⁴)', levels: 3, maxFactors: 4, rows: L9, defaultNames: letters.slice(0, 4) },
];

export function getArray(key: ArrayKey): OrthogonalArray {
  return ORTHOGONAL_ARRAYS.find((a) => a.key === key) ?? ORTHOGONAL_ARRAYS[0];
}

/** Potong kolom sesuai jumlah faktor yang dipakai. */
export function columnsOf(oa: OrthogonalArray, factorCount: number): number[][] {
  return oa.rows.map((row) => row.slice(0, Math.min(factorCount, oa.maxFactors)));
}

/** Nilai observasi awal yang deterministik agar kalkulator langsung bisa dipakai. */
export function initialObservations(oa: OrthogonalArray, replicates: number): number[][] {
  return oa.rows.map((_, rowIndex) =>
    Array.from({ length: replicates }, (_, rep) => Number((42 + ((rowIndex * 7 + rep * 3) % 13) * 0.4).toFixed(2))),
  );
}
