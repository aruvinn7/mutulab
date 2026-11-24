/**
 * Bank latihan soal acak berbasis template (F-06).
 * - Deterministik: seed yang sama → template, data, kunci, langkah, dan pembahasan identik.
 * - Kunci dihitung langsung dengan rumus yang benar (double precision); pembulatan hanya saat ditampilkan.
 * - Toleransi absolut = maks(1% dari |jawaban|, 0,01) sesuai PRD §5.3.
 */

import { seededRandom } from '../lib/storage';
import type { PracticeQuestion } from '../lib/types';

type Built = Omit<PracticeQuestion, 'id' | 'seed' | 'modul' | 'difficulty'>;

export interface QuestionTemplate {
  id: string;
  modul: string;
  topik: string;
  difficulty: PracticeQuestion['difficulty'];
  build: (rnd: () => number) => Built;
}

/* ------------------------------- pembantu ------------------------------- */

const r3 = (n: number): number => Math.round((n + Number.EPSILON) * 1000) / 1000;
const tolFor = (n: number): number => Math.max(0.01, Math.abs(r3(n)) * 0.01);
const idnum = (n: number): string => n.toLocaleString('id-ID', { maximumFractionDigits: 4 });
const int = (rnd: () => number, min: number, max: number): number => min + Math.floor(rnd() * (max - min + 1));
const mean = (xs: number[]): number => xs.reduce((s, x) => s + x, 0) / xs.length;
const sampleVar = (xs: number[]): number => {
  const m = mean(xs);
  return xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1);
};
function comb(n: number, k: number): number {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}
function binomialAtMost(n: number, c: number, p: number): number {
  let total = 0;
  for (let d = 0; d <= c; d++) total += comb(n, d) * p ** d * (1 - p) ** (n - d);
  return total;
}

/* ------------------------------- template ------------------------------- */

export const QUESTION_TEMPLATES: QuestionTemplate[] = [
  // ============================================================ m2 · ANOVA
  {
    id: 'm2-ss-perlakuan',
    modul: 'm2',
    topik: 'SS Perlakuan (CRD)',
    difficulty: 'dasar',
    build: (rnd) => {
      const a = int(rnd, 3, 4);
      const n = int(rnd, 3, 5);
      const base = int(rnd, 35, 55);
      const groups = Array.from({ length: a }, (_, i) => {
        const shift = i === 0 ? 0 : (i % 2 === 0 ? 1 : -1) * int(rnd, 3, 11);
        return Array.from({ length: n }, () => base + shift + int(rnd, -3, 3));
      });
      const means = groups.map(mean);
      const grand = mean(groups.flat());
      const answer = n * means.reduce((s, m) => s + (m - grand) ** 2, 0);
      return {
        prompt: `Percobaan RAL membandingkan ${a} level suhu oven dengan ${n} ulangan. Respons adalah kekuatan tarik (MPa). Data per level: ${groups.map((g, i) => `level ${i + 1} = [${g.map(idnum).join(', ')}]`).join('; ')}. Hitung SS Perlakuan.`,
        data: { groups: groups.flat(), a, n },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `Rata-rata tiap level: ${means.map((m) => idnum(m)).join(', ')} MPa.`,
          `Rata-rata besar (grand mean): ȳ = ${idnum(grand)} MPa.`,
          `SS Perlakuan = n · Σ(ȳᵢ − ȳ)² = ${n} · [${means.map((m) => `(${idnum(m)} − ${idnum(grand)})²`).join(' + ')}] = ${idnum(answer)}.`,
        ],
        explanation: `Dengan a = ${a} level dan n = ${n} ulangan, SS Perlakuan = ${idnum(answer)} pada df = a − 1 = ${a - 1}. Nilai ini dibandingkan dengan MS Error melalui uji F; besarnya SS saja belum menentukan signifikansi.`,
      };
    },
  },
  {
    id: 'm2-df-error',
    modul: 'm2',
    topik: 'Derajat bebas galat CRD',
    difficulty: 'dasar',
    build: (rnd) => {
      const a = int(rnd, 3, 5);
      const n = int(rnd, 2, 6);
      const answer = a * (n - 1);
      return {
        prompt: `Sebuah RAL (CRD) menggunakan ${a} perlakuan dengan ${n} ulangan/perlakuan (total ${a * n} percobaan). Berapa derajat bebas galat (df Error)?`,
        data: { a, n, total: a * n },
        answer,
        tolerance: tolFor(answer),
        steps: [
          `df Total = N − 1 = ${a * n} − 1 = ${a * n - 1}.`,
          `df Perlakuan = a − 1 = ${a} − 1 = ${a - 1}.`,
          `df Error = N − a = a(n − 1) = ${a} × (${n} − 1) = ${answer}.`,
        ],
        explanation: `Pada RAL seimbang, df Error = a(n − 1) = ${answer}. Pemeriksaan cepat: df Perlakuan + df Error = ${a - 1} + ${answer} = ${a * n - 1} = df Total.`,
      };
    },
  },
  {
    id: 'm2-f-hitung',
    modul: 'm2',
    topik: 'F-hitung ANOVA satu arah',
    difficulty: 'menengah',
    build: (rnd) => {
      const a = int(rnd, 3, 4);
      const n = int(rnd, 3, 5);
      const ssTreat = int(rnd, 140, 700);
      const ssErr = int(rnd, 60, 320);
      const dfTreat = a - 1;
      const dfErr = a * (n - 1);
      const answer = (ssTreat / dfTreat) / (ssErr / dfErr);
      return {
        prompt: `Ringkasan ANOVA satu arah: SS Perlakuan = ${idnum(ssTreat)}, SS Error = ${idnum(ssErr)}, jumlah perlakuan a = ${a}, ulangan per perlakuan n = ${n}. Hitung F-hitung untuk uji perlakuan.`,
        data: { ssTreat, ssErr, a, n },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `df Perlakuan = a − 1 = ${dfTreat}; df Error = a(n − 1) = ${dfErr}.`,
          `MS Perlakuan = ${idnum(ssTreat)} / ${dfTreat} = ${idnum(ssTreat / dfTreat)}.`,
          `MS Error = ${idnum(ssErr)} / ${dfErr} = ${idnum(ssErr / dfErr)}.`,
          `F = MS Perlakuan / MS Error = ${idnum(answer)}.`,
        ],
        explanation: `F-hitung = ${idnum(answer)}. Bandingkan dengan F₍${dfTreat},${dfErr}₎ pada α yang dipilih; tolak H₀ bila F-hitung lebih besar dari nilai kritis tersebut.`,
      };
    },
  },

  // ============================================================== m3 · RCBD
  {
    id: 'm3-ss-blok',
    modul: 'm3',
    topik: 'SS Blok (RCBD)',
    difficulty: 'menengah',
    build: (rnd) => {
      const a = int(rnd, 3, 4);
      const b = int(rnd, 3, 4);
      const base = int(rnd, 45, 80);
      const stepT = int(rnd, 2, 6);
      const stepB = int(rnd, 2, 5);
      const rows = Array.from({ length: a }, (_, i) =>
        Array.from({ length: b }, (_, j) => base + i * stepT + j * stepB + int(rnd, -2, 2)),
      );
      const totals = Array.from({ length: b }, (_, j) => rows.reduce((s, row) => s + row[j], 0));
      const grand = rows.flat().reduce((s, x) => s + x, 0);
      const answer = totals.reduce((s, t) => s + t ** 2, 0) / a - grand ** 2 / (a * b);
      return {
        prompt: `RCBD dengan ${a} perlakuan dan ${b} blok menghasilkan data (baris = perlakuan, kolom = blok): ${rows.map((r) => `[${r.map(idnum).join(', ')}]`).join('; ')}. Hitung SS Blok.`,
        data: { matrix: rows.flat(), a, b },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `Total tiap blok Bⱼ: ${totals.map((t) => idnum(t)).join(', ')}.`,
          `Total besar G = ${idnum(grand)}; koreksi faktor = G²/(ab) = ${idnum(grand ** 2 / (a * b))}.`,
          `SS Blok = Σ Bⱼ²/a − G²/(ab) = ${idnum(answer)}.`,
        ],
        explanation: `SS Blok = ${idnum(answer)} dengan df = b − 1 = ${b - 1}. Blok yang menyumbang SS besar mengindikasikan sumber pengganggu (mis. shift atau batch) memang perlu dikendalikan.`,
      };
    },
  },
  {
    id: 'm3-df-error',
    modul: 'm3',
    topik: 'Derajat bebas galat RCBD',
    difficulty: 'dasar',
    build: (rnd) => {
      const a = int(rnd, 3, 5);
      const b = int(rnd, 3, 5);
      const answer = (a - 1) * (b - 1);
      return {
        prompt: `Rancangan blok lengkap (RCBD) memiliki ${a} perlakuan dan ${b} blok. Setiap perlakuan muncul tepat sekali di setiap blok. Berapa df Error?`,
        data: { a, b },
        answer,
        tolerance: tolFor(answer),
        steps: [
          `df Total = ab − 1 = ${a * b} − 1 = ${a * b - 1}.`,
          `df Perlakuan = a − 1 = ${a - 1}; df Blok = b − 1 = ${b - 1}.`,
          `df Error = (a − 1)(b − 1) = ${a - 1} × ${b - 1} = ${answer}.`,
        ],
        explanation: `Pemeriksaan: ${a - 1} + ${b - 1} + ${answer} = ${a * b - 1} = df Total. df Error RCBD lebih kecil daripada RAL dengan jumlah pengamatan sama, itulah sebabnya uji F menjadi lebih sensitif bila blok efektif.`,
      };
    },
  },
  {
    id: 'm3-f-treatment',
    modul: 'm3',
    topik: 'Uji F perlakuan RCBD',
    difficulty: 'ujian',
    build: (rnd) => {
      const a = int(rnd, 3, 4);
      const b = int(rnd, 3, 4);
      const ssTreat = int(rnd, 100, 480);
      const ssBlock = int(rnd, 40, 220);
      const ssErr = int(rnd, 30, 160);
      const dfTreat = a - 1;
      const dfErr = (a - 1) * (b - 1);
      const answer = (ssTreat / dfTreat) / (ssErr / dfErr);
      return {
        prompt: `Tabel ANOVA RCBD menunjukkan SS Perlakuan = ${idnum(ssTreat)}, SS Blok = ${idnum(ssBlock)}, SS Error = ${idnum(ssErr)}, dengan a = ${a} perlakuan dan b = ${b} blok. Hitung F-hitung untuk uji perlakuan.`,
        data: { ssTreat, ssBlock, ssErr, a, b },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `df Perlakuan = a − 1 = ${dfTreat}; df Error = (a − 1)(b − 1) = ${dfErr}. (SS Blok tidak dipakai dalam F uji perlakuan.)`,
          `MS Perlakuan = ${idnum(ssTreat)} / ${dfTreat} = ${idnum(ssTreat / dfTreat)}.`,
          `MS Error = ${idnum(ssErr)} / ${dfErr} = ${idnum(ssErr / dfErr)}.`,
          `F = ${idnum(ssTreat / dfTreat)} / ${idnum(ssErr / dfErr)} = ${idnum(answer)}.`,
        ],
        explanation: `F-hitung = ${idnum(answer)} dibandingkan dengan F₍${dfTreat},${dfErr}₎. SS Blok = ${idnum(ssBlock)} sudah masuk ke baris blok dan tidak mengubah F uji perlakuan, tetapi mengecilkan MS Error dibanding analisis RAL.`,
      };
    },
  },

  // ========================================================== m4 · 2^k Yates
  {
    id: 'm4-efek-a',
    modul: 'm4',
    topik: 'Efek utama A (2²)',
    difficulty: 'dasar',
    build: (rnd) => {
      const y = Array.from({ length: 4 }, () => int(rnd, 20, 80));
      const answer = (-y[0] + y[1] - y[2] + y[3]) / 2;
      return {
        prompt: `Faktorial 2² menghasilkan rata-rata respons (urutan standar (1), a, b, ab): ${y.map(idnum).join(', ')} MPa. Faktor A adalah suhu oven, faktor B adalah waktu. Hitung efek utama A.`,
        data: { y },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `Tanda kontras A: −1, +1, −1, +1 untuk (1), a, b, ab.`,
          `Kontras A = −${idnum(y[0])} + ${idnum(y[1])} − ${idnum(y[2])} + ${idnum(y[3])} = ${idnum(-y[0] + y[1] - y[2] + y[3])}.`,
          `Efek A = kontras / 2 = ${idnum(answer)} MPa.`,
        ],
        explanation: `Efek A = ${idnum(answer)} MPa, artinya kenaikan faktor A dari level rendah ke tinggi mengubah respons rata-rata sebesar ${idnum(Math.abs(answer))} MPa (diukur pada kedua level B).`,
      };
    },
  },
  {
    id: 'm4-efek-b',
    modul: 'm4',
    topik: 'Efek utama B (2²)',
    difficulty: 'dasar',
    build: (rnd) => {
      const y = Array.from({ length: 4 }, () => int(rnd, 20, 80));
      const answer = (-y[0] - y[1] + y[2] + y[3]) / 2;
      return {
        prompt: `Rata-rata respons faktorial 2² (urutan (1), a, b, ab): ${y.map(idnum).join(', ')}. Hitung efek utama B (waktu pengeringan).`,
        data: { y },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `Tanda kontras B: −1, −1, +1, +1.`,
          `Kontras B = −${idnum(y[0])} − ${idnum(y[1])} + ${idnum(y[2])} + ${idnum(y[3])} = ${idnum(-y[0] - y[1] + y[2] + y[3])}.`,
          `Efek B = kontras / 2 = ${idnum(answer)}.`,
        ],
        explanation: `Efek B = ${idnum(answer)}. Tanda negatif berarti kenaikan level B menurunkan respons rata-rata; tanda positif berarti menaikkannya.`,
      };
    },
  },
  {
    id: 'm4-interaksi-ab',
    modul: 'm4',
    topik: 'Interaksi AB (2²)',
    difficulty: 'menengah',
    build: (rnd) => {
      const y = Array.from({ length: 4 }, () => int(rnd, 20, 80));
      const answer = (y[0] - y[1] - y[2] + y[3]) / 2;
      return {
        prompt: `Dari faktorial 2² diperoleh rata-rata (1), a, b, ab berturut-turut ${y.map(idnum).join(', ')}. Hitung efek interaksi AB.`,
        data: { y },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `Tanda kontras AB: +1, −1, −1, +1.`,
          `Kontras AB = ${idnum(y[0])} − ${idnum(y[1])} − ${idnum(y[2])} + ${idnum(y[3])} = ${idnum(y[0] - y[1] - y[2] + y[3])}.`,
          `Efek AB = kontras / 2 = ${idnum(answer)}.`,
        ],
        explanation: `Efek AB = ${idnum(answer)}. Nilai besar menandakan efek A bergantung pada level B (interaksi kuat); pada kasus tersebut grafik interaksi tidak sejajar dan efek utama harus diinterpretasikan dengan hati-hati.`,
      };
    },
  },
  {
    id: 'm4-ss-kontras',
    modul: 'm4',
    topik: 'SS dari kontras Yates',
    difficulty: 'ujian',
    build: (rnd) => {
      const cells = Array.from({ length: 4 }, () => [
        int(rnd, 25, 70),
        int(rnd, 25, 70),
      ]);
      const m = cells.map(mean);
      const contrast = -m[0] + m[1] - m[2] + m[3]; // kontras rata-rata sel
      const replicas = 2;
      const N = 8;
      const contrastTotal = replicas * contrast; // kontras dari total tiap sel (format yatesFactorial)
      const answer = contrastTotal ** 2 / N;
      return {
        prompt: `Faktorial 2² dengan 2 replikasi menghasilkan pengamatan (urutan (1), a, b, ab; tiap sel 2 angka): ${cells.map((c) => `[${c.map(idnum).join(', ')}]`).join('; ')}. Hitung SS untuk efek utama A.`,
        data: { observations: cells.flat(), replicates: 2, k: 2 },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `Rata-rata sel: ${m.map(idnum).join(', ')}.`,
          `Kontras rata-rata A = −m₍₁₎ + mₐ − m_b + mₐᵦ = ${idnum(contrast)}.`,
          `Kontras total = replikasi × kontras rata-rata = ${replicas} × ${idnum(contrast)} = ${idnum(contrastTotal)}; jumlah pengamatan N = 4 × ${replicas} = ${N}.`,
          `SS_A = (kontras total)² / N = (${idnum(contrastTotal)})² / ${N} = ${idnum(answer)}.`,
        ],
        explanation: `SS_A = ${idnum(answer)} dengan df = 1. Rumus SS = (kontras total)²/N berlaku untuk desain 2^k seimbang; kontras total memakai total tiap sel (replikasi × rata-rata sel), dan N adalah total pengamatan.`,
      };
    },
  },

  // ============================================================== m5 · Taguchi
  {
    id: 'm5-sn-smaller',
    modul: 'm5',
    topik: 'S/N smaller-is-better',
    difficulty: 'dasar',
    build: (rnd) => {
      const n = int(rnd, 3, 5);
      const ys = Array.from({ length: n }, () => int(rnd, 2, 14));
      const answer = -10 * Math.log10(mean(ys.map((y) => y ** 2)));
      return {
        prompt: `Pada baris L4 jumlah goresan permukaan tercatat ${ys.map(idnum).join(', ')} (semakin kecil semakin baik). Hitung rasio S/N smaller-is-better dalam dB.`,
        data: { y: ys },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `Karakteristik smaller-is-better: η = −10 log₁₀[ (1/n) Σ yᵢ² ].`,
          `Rata-rata kuadrat = (${ys.map((y) => `${idnum(y)}²`).join(' + ')}) / ${n} = ${idnum(mean(ys.map((y) => y ** 2)))}.`,
          `η = −10 log₁₀(${idnum(mean(ys.map((y) => y ** 2)))}) = ${idnum(answer)} dB.`,
        ],
        explanation: `η = ${idnum(answer)} dB. Pada smaller-is-better, nilai η yang lebih tinggi (kurang negatif) lebih baik karena variasi dan nilai rata-rata sama-sama ditekan.`,
      };
    },
  },
  {
    id: 'm5-sn-larger',
    modul: 'm5',
    topik: 'S/N larger-is-better',
    difficulty: 'menengah',
    build: (rnd) => {
      const n = int(rnd, 3, 5);
      const ys = Array.from({ length: n }, () => int(rnd, 6, 30));
      const answer = -10 * Math.log10(mean(ys.map((y) => 1 / y ** 2)));
      return {
        prompt: `Kekuatan tarik serat (MPa) pada satu kombinasi parameter: ${ys.map(idnum).join(', ')}. Karakteristik larger-is-better. Hitung rasio S/N dalam dB.`,
        data: { y: ys },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `Karakteristik larger-is-better: η = −10 log₁₀[ (1/n) Σ 1/yᵢ² ].`,
          `Rata-rata 1/y² = ${idnum(mean(ys.map((y) => 1 / y ** 2)))}.`,
          `η = −10 log₁₀(${idnum(mean(ys.map((y) => 1 / y ** 2)))}) = ${idnum(answer)} dB.`,
        ],
        explanation: `η = ${idnum(answer)} dB. S/N larger-is-better memberi penalti lebih besar pada nilai yang kecil, sehingga cocok untuk respons seperti kekuatan atau daya tahan.`,
      };
    },
  },
  {
    id: 'm5-sn-nominal',
    modul: 'm5',
    topik: 'S/N nominal-is-better',
    difficulty: 'ujian',
    build: (rnd) => {
      const n = int(rnd, 4, 6);
      const target = int(rnd, 20, 45);
      const ys = Array.from({ length: n }, () => target + int(rnd, -5, 5));
      let s2 = sampleVar(ys);
      if (s2 <= 0) s2 = 1;
      const m = mean(ys);
      const answer = 10 * Math.log10(m ** 2 / s2);
      return {
        prompt: `Ketebalan (mm) dengan target T = ${target} menghasilkan ${ys.map(idnum).join(', ')}. Hitung S/N nominal-is-better (menggunakan variansi sampel s²).`,
        data: { y: ys, target },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `ȳ = ${idnum(m)}; s² = Σ(yᵢ − ȳ)²/(n − 1) = ${idnum(s2)}.`,
          `η = 10 log₁₀(ȳ² / s²) = 10 log₁₀(${idnum(m ** 2)} / ${idnum(s2)}).`,
          `η = ${idnum(answer)} dB.`,
        ],
        explanation: `η = ${idnum(answer)} dB. S/N nominal-is-better naik bila rata-rata mendekati target dan variansi mengecil; arah optimasi tidak selalu "lebih besar lebih baik".`,
      };
    },
  },
  {
    id: 'm5-delta-respon',
    modul: 'm5',
    topik: 'Tabel respon · Delta',
    difficulty: 'menengah',
    build: (rnd) => {
      const levelCount = 3;
      const sn = Array.from({ length: levelCount }, () => -(int(rnd, 12, 30) + rnd()));
      const answer = Math.max(...sn) - Math.min(...sn);
      return {
        prompt: `Tabel respon S/N untuk faktor "suhu oven" pada tiga level: ${sn.map((v, i) => `level ${i + 1} = ${idnum(v)} dB`).join(', ')}. Berapa Delta (selisih S/N tertinggi dan terendah) faktor tersebut?`,
        data: { sn },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `S/N tertinggi = ${idnum(Math.max(...sn))} dB (level ${sn.indexOf(Math.max(...sn)) + 1}).`,
          `S/N terendah = ${idnum(Math.min(...sn))} dB (level ${sn.indexOf(Math.min(...sn)) + 1}).`,
          `Delta = tertinggi − terendah = ${idnum(answer)} dB.`,
        ],
        explanation: `Delta = ${idnum(answer)} dB. Faktor dengan Delta terbesar diberi peringkat (Rank) 1 dan menjadi prioritas pengendalian dalam tabel respon Taguchi.`,
      };
    },
  },

  // ================================================ m0 · Acceptance Sampling
  {
    id: 'm0-pa-binomial',
    modul: 'm0',
    topik: 'Peluang penerimaan Pa',
    difficulty: 'dasar',
    build: (rnd) => {
      const n = int(rnd, 8, 20);
      const c = int(rnd, 0, 2);
      const p = int(rnd, 2, 20) / 100;
      const answer = binomialAtMost(n, c, p);
      return {
        prompt: `Rencana sampling tunggal n = ${n}, c = ${c}. Jika fraksi cacat proses p = ${idnum(p)}, berapa peluang lot diterima (Pa) menurut model binomial?`,
        data: { n, c, p },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `Model: Pa = P(d ≤ c) = Σ_{d=0..${c}} C(${n},d) · pᵈ · (1−p)^(${n}−d).`,
          `d = 0: ${idnum(comb(n, 0) * (1 - p) ** n)}; d = 1: ${idnum(comb(n, 1) * p * (1 - p) ** (n - 1))}${c >= 2 ? `; d = 2: ${idnum(comb(n, 2) * p ** 2 * (1 - p) ** (n - 2))}` : ''}.`,
          `Pa = ${idnum(answer)}.`,
        ],
        explanation: `Pa = ${idnum(answer)}. Titik (p, Pa) ini adalah satu titik pada kurva OC; mengulang untuk berbagai p menghasilkan kurva lengkap yang dipakai untuk membaca risiko produsen dan konsumen.`,
      };
    },
  },
  {
    id: 'm0-ati',
    modul: 'm0',
    topik: 'Average Total Inspection',
    difficulty: 'menengah',
    build: (rnd) => {
      const N = int(rnd, 4, 20) * 50;
      const n = int(rnd, 20, 60);
      const c = int(rnd, 0, 2);
      const p = int(rnd, 3, 15) / 100;
      const pa = binomialAtMost(n, c, p);
      const answer = n + (1 - pa) * N;
      return {
        prompt: `Lot berisi N = ${N} unit diperiksa dengan rencana n = ${n}, c = ${c}. Fraksi cacat p = ${idnum(p)}. Di bawah inspeksi 100% untuk lot yang ditolak, berapa ATI (Average Total Inspection)?`,
        data: { N, n, c, p },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `Peluang terima Pa = Σ_{d=0..${c}} C(${n},d)·pᵈ·(1−p)^(${n}−d) = ${idnum(pa)}.`,
          `Peluang ditolak = 1 − Pa = ${idnum(1 - pa)}.`,
          `ATI = n + (1 − Pa)·N = ${n} + ${idnum(1 - pa)} × ${N} = ${idnum(answer)} unit.`,
        ],
        explanation: `ATI = ${idnum(answer)} unit. Meskipun sampel awal hanya ${n} unit, lot yang ditolak diperiksa seluruhnya sehingga rata-rata total inspeksi jauh lebih besar.`,
      };
    },
  },
  {
    id: 'm0-aoq',
    modul: 'm0',
    topik: 'Average Outgoing Quality',
    difficulty: 'ujian',
    build: (rnd) => {
      const N = int(rnd, 4, 20) * 50;
      const n = int(rnd, 20, 60);
      const c = int(rnd, 0, 2);
      const p = int(rnd, 3, 12) / 100;
      const pa = binomialAtMost(n, c, p);
      const answer = pa * p * (N - n) / N;
      return {
        prompt: `Rencana sampling n = ${n}, c = ${c} diterapkan pada lot N = ${N} dengan p = ${idnum(p)}. Barang cacat pada lot yang ditolak diganti dengan barang baik. Hitung AOQ (Average Outgoing Quality) menurut pendekatan binomial.`,
        data: { N, n, c, p },
        answer: r3(answer),
        tolerance: tolFor(answer),
        steps: [
          `Pa = ${idnum(pa)} (dari Σ_{d=0..${c}} C(${n},d)·pᵈ·(1−p)^(${n}−d)).`,
          `Faktor koreksi sampel: (N − n)/N = (${N} − ${n})/${N} = ${idnum((N - n) / N)}.`,
          `AOQ = Pa · p · (N − n)/N = ${idnum(answer)}.`,
        ],
        explanation: `AOQ = ${idnum(answer)} (fraksi cacat yang keluar). Kurva AOQ terhadap p memiliki puncak (AOQL); memahami puncak ini penting agar kualitas keluar tetap terkendali pada berbagai kondisi proses.`,
      };
    },
  },
];

/** Modul yang memiliki bank soal (dipakai daftar pilihan di /latihan/). */
export const LATIHAN_MODULES: string[] = Array.from(new Set(QUESTION_TEMPLATES.map((t) => t.modul)));

/**
 * Bangun satu soal dari seed. Filter `modul` dan `difficulty` bersifat opsional;
 * bila kombinasi tidak tersedia, fungsi jatuh kembali ke pool modul yang diminta.
 */
export function generateQuestion(
  seed: number,
  modul?: string,
  difficulty?: PracticeQuestion['difficulty'],
): PracticeQuestion {
  const byModule = modul ? QUESTION_TEMPLATES.filter((t) => t.modul === modul) : QUESTION_TEMPLATES;
  const base = byModule.length ? byModule : QUESTION_TEMPLATES;
  const matched = difficulty ? base.filter((t) => t.difficulty === difficulty) : [];
  const pool = matched.length ? matched : base;
  const rnd = seededRandom(seed);
  const template = pool[Math.floor(rnd() * pool.length) % pool.length];
  const built = template.build(rnd);
  return {
    id: `${template.id}-${seed}`,
    seed,
    modul: template.modul,
    difficulty: template.difficulty,
    ...built,
  };
}
