/**
 * MutuLab calc-core — pustaka komputasi statistik murni (tanpa UI/DOM).
 * Semua angka internal double precision; pembulatan hanya saat format.
 */
export {
  fCdf,
  fSf,
  fCritical,
  tCritical,
  tCdf,
  tTwoSidedSf,
  normalSf,
  regularizedIncompleteBeta,
  logGamma,
} from './distributions';

export { crdAnova, fisherLsd, rcbdAnova } from './anova';
export type { FisherLsdResult, LsdPair } from './anova';

export { yatesFactorial } from './factorial';

export { snRatio, taguchiAnalysis } from './taguchi';
export type { TaguchiAnalysisResult } from './taguchi';

export { samplingPlan, paBinomial, paPoisson } from './sampling';
export type { SamplingPlanParams, SamplingDistribution } from './sampling';

export { formatP, formatNumber, roundTo } from './format';
