import { describe, expect, it } from 'vitest';
import {
  crdAnova,
  fCdf,
  fCritical,
  fSf,
  fisherLsd,
  formatP,
  normalSf,
  paBinomial,
  paPoisson,
  rcbdAnova,
  regularizedIncompleteBeta,
  roundTo,
  samplingPlan,
  snRatio,
  tCritical,
  taguchiAnalysis,
  yatesFactorial,
} from './index';

/** Bandingkan terhadap acuan scipy dengan toleransi relatif. */
function close(actual: number, expected: number, relative = 1e-6): void {
  const tolerance = relative * Math.max(1, Math.abs(expected));
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

describe('distribusi', () => {
  it('fCdf cocok dengan acuan scipy', () => {
    close(fCdf(1, 2, 10), 0.5981224279835391);
    close(fCdf(2.5, 5, 8), 0.8802459745444757);
    expect(fCdf(0, 1, 5)).toBe(0);
  });

  it('fSf adalah upper tail dan berpadanan dengan fCdf', () => {
    close(fSf(6.607890973703364, 1, 5), 0.05);
    close(fCdf(6.607890973703364, 1, 5) + fSf(6.607890973703364, 1, 5), 1);
    close(fCdf(4.1028210151304, 2, 10), 0.95);
    close(fCdf(3.098391212140781, 3, 20), 0.95);
  });

  it('fCritical terhadap tiga nilai acuan yang diminta', () => {
    close(fCritical(0.05, 1, 5), 6.607890973703364);
    close(fCritical(0.05, 2, 10), 4.1028210151304);
    close(fCritical(0.05, 3, 20), 3.098391212140781);
    close(fCritical(0.05, 1, 5), 6.6079, 1e-4);
    close(fCritical(0.05, 2, 10), 4.1028, 1e-4);
    close(fCritical(0.05, 3, 20), 3.0984, 1e-4);
  });

  it('fCritical juga benar untuk α = 0,01', () => {
    close(fCritical(0.01, 2, 10), 7.559432157547899);
  });

  it('fCritical stabil untuk df kecil maupun besar', () => {
    close(fCritical(0.05, 100, 200), 1.3206374592426364);
    close(fCritical(0.01, 5, 3), 28.237080837755045);
    close(fCritical(0.1, 1, 1), 39.86345818906141);
    close(fCritical(0.001, 10, 15), 6.080778142374001);
    close(fCritical(0.05, 500, 1000), 1.1342122216540915);
  });

  it('tCritical menghitung kuantil dua sisi', () => {
    close(tCritical(0.05, 12), 2.1788128296672284);
    close(tCritical(0.01, 8), 3.355387331333395);
    close(tCritical(0.05, 1000), 1.9623390808264083);
    close(tCritical(0.001, 5), 6.868826625881276);
    close(tCritical(0.1, 1), 6.313751514675037);
  });

  it('normalSf memakai aproksimasi A&S 7.1.26', () => {
    close(normalSf(1.96), 0.024997895148220435, 1e-5);
    expect(normalSf(0)).toBeCloseTo(0.5, 12);
    close(normalSf(-1.96), 1 - 0.024997895148220435, 1e-5);
  });

  it('beta tak lengkap teregularisasi dasar', () => {
    close(regularizedIncompleteBeta(0.5, 1, 1), 0.5);
    close(regularizedIncompleteBeta(0.4, 2, 3), 0.5248);
    expect(regularizedIncompleteBeta(0, 2, 2)).toBe(0);
    expect(regularizedIncompleteBeta(1, 2, 2)).toBe(1);
  });
});

describe('CRD ANOVA (Montgomery-style, 3 grup)', () => {
  const groups = [
    [10, 12, 11, 13, 11],
    [14, 15, 13, 16, 14],
    [9, 11, 10, 8, 10],
  ];
  const result = crdAnova(groups);

  it('baris berurutan Treatment, Error, Total', () => {
    expect(result.rows.map((row) => row.source)).toEqual(['Treatment', 'Error', 'Total']);
  });

  it('SS dan rata-rata besar sesuai perhitungan manual', () => {
    close(result.grandMean, 11.8);
    close(result.totalSs, 74.4);
    close(result.rows[0].ss, 58.8);
    close(result.rows[1].ss, 15.6);
  });

  it('df, MS, F, p, dan F kritis sesuai scipy', () => {
    expect(result.rows.map((row) => row.df)).toEqual([2, 12, 14]);
    close(result.rows[0].ms, 29.4);
    close(result.errorMs, 1.3);
    close(result.rows[0].f ?? NaN, 22.615384615384627);
    close(result.rows[0].p ?? NaN, 8.497867923209193e-05);
    close(result.fCritical, 3.8852938346523924);
  });

  it('keputusan dan kesimpulan berbahasa Indonesia', () => {
    expect(result.rejected).toBe(true);
    expect(result.conclusion).toContain('Tolak H₀');
    expect(result.conclusion).toContain('signifikan');
    expect(result.alpha).toBe(0.05);
  });
});

describe('Fisher LSD', () => {
  const groups = [
    [10, 12, 11, 13, 11],
    [11, 13, 12, 12, 12],
    [14, 15, 13, 16, 14],
  ];
  const lsd = fisherLsd(groups);

  it('menghasilkan tiga pasangan unik', () => {
    expect(lsd.pairs).toHaveLength(3);
    expect(lsd.pairs.map((pair) => [pair.a, pair.b])).toEqual([[0, 1], [0, 2], [1, 2]]);
    expect(lsd.dfError).toBe(12);
    close(lsd.msError, 1.0333333333333332);
  });

  it('nilai LSD memakai tCritical(α, dfError)·sqrt(2·MSE/n)', () => {
    close(lsd.pairs[0].lsd, 1.4007806668587721);
    close(lsd.pairs[0].diff, -0.6);
    close(lsd.pairs[1].diff, -3);
    expect(lsd.pairs[0].significant).toBe(false);
    expect(lsd.pairs[1].significant).toBe(true);
    expect(lsd.pairs[2].significant).toBe(true);
  });

  it('ukuran kelompok tidak sama memakai rata-rata harmonik per pasangan', () => {
    const uneven = fisherLsd([
      [1, 2, 3],
      [4, 5, 6, 7, 8],
    ]);
    expect(uneven.pairs).toHaveLength(1);
    expect(uneven.pairs[0].lsd).toBeGreaterThan(0);
  });
});

describe('RCBD ANOVA', () => {
  const matrix = [
    [9, 11, 10],
    [12, 14, 13],
    [8, 9, 10],
    [15, 16, 14],
  ];
  const result = rcbdAnova(matrix);

  it('baris berurutan Treatment, Block, Error, Total', () => {
    expect(result.rows.map((row) => row.source)).toEqual(['Treatment', 'Block', 'Error', 'Total']);
  });

  it('SS, df, dan MS sesuai perhitungan scipy', () => {
    close(result.totalSs, 76.25);
    close(result.rows[0].ss, 68.25);
    close(result.rows[1].ss, 4.5);
    close(result.rows[2].ss, 3.5);
    expect(result.rows.map((row) => row.df)).toEqual([3, 2, 6, 11]);
    close(result.errorMs, 0.5833333333333334);
  });

  it('F dan p perlakuan serta blok', () => {
    close(result.rows[0].f ?? NaN, 39);
    close(result.rows[0].p ?? NaN, 0.00024922287429433567);
    close(result.rows[1].f ?? NaN, 3.8571428571428568);
    close(result.rows[1].p ?? NaN, 0.083740234375);
    expect(result.rejected).toBe(true);
  });
});

describe('Faktorial 2^k dengan Yates', () => {
  const replicated = [20, 22, 28, 30, 24, 26, 34, 36];

  it('2^2: efek, koefisien, SS, dan tanda sesuai algoritma Yates', () => {
    const result = yatesFactorial(replicated, 2, 2, ['Suhu', 'Waktu']);
    expect(result.effects.map((effect) => effect.term)).toEqual(['A', 'B', 'AB']);
    close(result.effects[0].effect, 9);
    close(result.effects[0].coefficient, 4.5);
    close(result.effects[0].ss, 162);
    close(result.effects[1].effect, 5);
    close(result.effects[1].ss, 50);
    close(result.effects[2].effect, 1);
    close(result.effects[2].ss, 2);
    expect(result.effects[0].signTable).toEqual([-1, 1, -1, 1]);
    expect(result.effects[2].signTable).toEqual([1, -1, -1, 1]);
  });

  it('2^2: ANOVA memakai galat murni replikasi', () => {
    const result = yatesFactorial(replicated, 2, 2);
    expect(result.hasReplication).toBe(true);
    const rows = result.anova?.rows ?? [];
    expect(rows.map((row) => row.source)).toEqual(['A', 'B', 'AB', 'Error', 'Total']);
    close(result.anova?.errorMs ?? NaN, 2);
    close(rows[3].df, 4);
    close(rows[0].f ?? NaN, 81);
    close(rows[0].p ?? NaN, 0.0008438325176012779);
    close(result.anova?.fCritical ?? NaN, 7.708647422176786);
    expect(result.anova?.rejected).toBe(true);
  });

  it('persamaan memuat bentuk simbolik dan koefisien numerik', () => {
    const result = yatesFactorial(replicated, 2, 2);
    expect(result.equation).toContain('ŷ =');
    expect(result.equation).toContain('β₁₂x₁x₂');
    expect(result.equation).toContain('27,5000');
    expect(result.equation).toContain('4,5000');
  });

  it('2^3 tanpa replikasi: efek ada, F/p tidak dihitung, warning diisi', () => {
    const observations = [12, 18, 15, 22, 14, 19, 17, 25];
    const result = yatesFactorial(observations, 3, 1);
    expect(result.hasReplication).toBe(false);
    expect(result.anova).toBeUndefined();
    expect(result.warning).toContain('galat murni');
    expect(result.effects.map((effect) => effect.term)).toEqual([
      'A', 'B', 'AB', 'C', 'AC', 'BC', 'ABC',
    ]);
    close(result.effects[0].effect, 6.5);
    close(result.effects[3].effect, 2);
    close(result.effects[4].effect, 0);
    close(result.effects[6].effect, 0.5);
  });
});

describe('Taguchi S/N dan tabel respons', () => {
  it('tiga karakteristik sesuai rumus', () => {
    close(snRatio([2, 3, 4], 'smaller'), -9.852767431792936);
    close(snRatio([2, 3, 4], 'larger'), 8.501539118041451);
    close(snRatio([9.8, 10.2, 10, 9.9], 'nominal'), 35.32939010414924);
  });

  it('menangani nol dan varians nol tanpa menghasilkan NaN', () => {
    expect(Number.isFinite(snRatio([0, 0, 5], 'smaller'))).toBe(true);
    expect(Number.isFinite(snRatio([0, 4], 'larger'))).toBe(true);
    expect(Number.isFinite(snRatio([5, 5, 5], 'nominal'))).toBe(true);
  });

  const oa = [
    [1, 1, 1],
    [1, 2, 2],
    [2, 1, 2],
    [2, 2, 1],
  ];
  const observations = [
    [10, 11],
    [14, 15],
    [12, 13],
    [16, 17],
  ];

  it('rasio S/N dan rata-rata tiap baris', () => {
    const { sn } = taguchiAnalysis(oa, observations, 'smaller');
    expect(sn.characteristic).toBe('smaller');
    close(sn.ratios[0], -20.433622780211298);
    close(sn.ratios[3], -24.35366507, 1e-5);
    close(sn.means[0], 10.5);
    expect(sn.ratios).toHaveLength(4);
  });

  it('tabel respons: level, Delta, Rank, optimalLevel', () => {
    const { response } = taguchiAnalysis(oa, observations, 'smaller');
    expect(response.map((row) => row.factor)).toEqual(['F1', 'F2', 'F3']);
    close(response[0].levels[0], -21.83307189096408);
    close(response[0].levels[1], -23.14940424247564);
    close(response[0].delta, 1.3163323515115586, 1e-5);
    expect(response[0].optimalLevel).toBe(1);
    expect(response.map((row) => row.rank)).toEqual([2, 1, 3]);
  });

  it('prediksi η_opt = rata-rata + Σ(effect terbaik)', () => {
    const { predicted } = taguchiAnalysis(oa, observations, 'smaller');
    close(predicted, -20.433622780211298, 1e-5);
  });
});

describe('Sampling plan', () => {
  const plan = samplingPlan({ n: 20, c: 1, N: 1000, aql: 0.05, ltpd: 0.15 });

  it('kurva OC memuat 101 titik dari p = 0 sampai 1', () => {
    expect(plan.points).toHaveLength(101);
    expect(plan.points[0]).toEqual({ p: 0, pa: 1 });
    expect(plan.points[100].p).toBe(1);
    expect(plan.points[100].pa).toBe(0);
  });

  it('Pa binomial sesuai acuan', () => {
    close(paBinomial(20, 1, 0.05), 0.7358395249438492);
    close(plan.points[5].pa, 0.7358395249438492);
    close(plan.points[10].pa, 0.3917469981251679);
    close(plan.points[15].pa, 0.1755578760886826);
  });

  it('Pa Poisson sesuai acuan dan c ≥ n menerima semua', () => {
    close(paPoisson(20, 1, 0.05), 0.7357588823428847);
    close(paPoisson(20, 1, 0.15), 0.19914827347145578);
    expect(paBinomial(20, 20, 0.9)).toBe(1);
  });

  it('AOQ, AOQL, ASN, dan ATI', () => {
    expect(plan.aoq).toHaveLength(101);
    close(plan.aoq[8].aoq, 0.040521482234821105, 1e-4);
    close(plan.aoql, 0.040521482234821105, 1e-3);
    expect(plan.asn).toBe(20);
    // ATI eksak = n + (1 − Pa)·(N − n), dievaluasi pada AQL.
    close(plan.ati, 20 + (1 - 0.7358395249438492) * 980, 1e-6);
  });

  it('tanpa N, AOQ = Pa·p dan ATI = n', () => {
    const withoutLot = samplingPlan({ n: 20, c: 1 });
    close(withoutLot.aoq[5].aoq, 0.7358395249438492 * 0.05);
    expect(withoutLot.ati).toBe(20);
  });
});

describe('utilitas dan determinisme', () => {
  it('roundTo membulatkan sesuai jumlah digit', () => {
    expect(roundTo(1.23456)).toBe(1.2346);
    expect(roundTo(1.23456, 2)).toBe(1.23);
    expect(roundTo(-1.237, 2)).toBe(-1.24);
  });

  it('formatP memakai koma dan ambang 0,0001', () => {
    expect(formatP(8.497867923209193e-05)).toBe('p < 0,0001');
    expect(formatP(0.0001)).toBe('p = 0,0001');
    expect(formatP(0.083740234375)).toBe('p = 0,0837');
  });

  it('semua fungsi deterministik untuk input yang sama', () => {
    const groups = [[3, 5, 4], [7, 6, 8]];
    expect(crdAnova(groups)).toEqual(crdAnova(groups));
    expect(fisherLsd(groups)).toEqual(fisherLsd(groups));
    expect(samplingPlan({ n: 10, c: 0 })).toEqual(samplingPlan({ n: 10, c: 0 }));
    expect(yatesFactorial([1, 2, 3, 4], 1, 2)).toEqual(yatesFactorial([1, 2, 3, 4], 1, 2));
  });

  it('tidak memodifikasi array input', () => {
    const groups = [[3, 5, 4], [7, 6, 8]];
    const snapshot = JSON.stringify(groups);
    crdAnova(groups);
    fisherLsd(groups);
    expect(JSON.stringify(groups)).toBe(snapshot);
  });
});
