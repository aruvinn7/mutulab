/** Kontrak bersama seluruh modul MutuLab. Calm, eksplisit, bebas dependensi UI. */

export interface AnovaRow {
  source: string;
  ss: number;
  df: number;
  ms: number;
  f?: number;
  p?: number;
  note?: string;
}

export interface AnovaResult {
  rows: AnovaRow[];
  totalSs: number;
  errorMs: number;
  conclusion: string;
  rejected: boolean;
  alpha: number;
  fCritical: number;
  grandMean: number;
}

export interface FactorialEffect {
  term: string;
  effect: number;
  coefficient: number;
  ss: number;
  signTable: number[];
}

export interface FactorialResult {
  effects: FactorialEffect[];
  anova?: AnovaResult;
  equation: string;
  hasReplication: boolean;
  warning?: string;
}

export type SnCharacteristic = 'smaller' | 'larger' | 'nominal';

export interface SnResult {
  characteristic: SnCharacteristic;
  ratios: number[];
  means: number[];
  target?: number;
}

export interface TaguchiResponseRow {
  factor: string;
  levels: number[];
  delta: number;
  rank: number;
  optimalLevel: number;
}

export interface SamplingPlanResult {
  n: number;
  c: number;
  points: { p: number; pa: number }[];
  aql?: number;
  ltpd?: number;
  aoq: { p: number; aoq: number }[];
  aoql: number;
  asn: number;
  ati: number;
}

export interface CalcWarning {
  level: 'info' | 'warn' | 'error';
  message: string;
}

export interface CalcResult<T = unknown> {
  ok: boolean;
  data?: T;
  warnings: CalcWarning[];
  steps: CalcStep[];
}

export interface CalcStep {
  title: string;
  formula?: string;
  substitution?: string;
  result?: string;
  detail?: string;
}

export interface Preset {
  id: string;
  judul: string;
  modul: string;
  kategori: 'dasar' | 'efek' | 'interaksi' | 'pelanggaran';
  parameter: Record<string, number | string | number[]>;
  data: number[] | number[][];
  tujuan_ajar: string;
  pertanyaan_pemantik: string[];
}

export interface TeachingState {
  active: boolean;
  revealStep: number;
  totalSteps: number;
  presetId?: string;
}

export interface PracticeQuestion {
  id: string;
  seed: number;
  modul: string;
  difficulty: 'dasar' | 'menengah' | 'ujian';
  prompt: string;
  data: Record<string, number[] | number>;
  answer: number;
  tolerance: number;
  steps: string[];
  explanation: string;
}
