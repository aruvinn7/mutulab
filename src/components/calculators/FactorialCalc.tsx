/** F-04 — Kalkulator faktorial 2^k: Algoritma Yates, efek, regresi, ANOVA, interaction plot. */
import { useEffect, useMemo, useState } from 'react';
import { yatesFactorial, fCritical, formatP } from '../../lib/calc-core';
import type { FactorialResult, Preset } from '../../lib/types';
import { buildShareUrl, readScenarioFromUrl, safeNumber } from '../../lib/share';
import CalculatorFrame from '../ui/CalculatorFrame';
import RevealSteps, { type RevealStep } from '../ui/RevealSteps';
import StatTable, { defaultFmt } from '../ui/StatTable';
import Formula from '../ui/Formula';
import InteractionPlot, { interactionCue, type InteractionSeries } from '../charts/InteractionPlot';
import MainEffectsPlot, { type MainEffect } from '../charts/MainEffectsPlot';
import {
  CalcActions, Kpi, Notice, NumberField, NumberMatrix,
  chunkFlat, clampInt, flattenMatrix, presetsFor, resizeRows, scenarioInputs,
} from './shared';

const LETTERS = ['A', 'B', 'C'];
const DEFAULT_NAMES = ['Suhu', 'Waktu', 'Konsentrasi'];
const DEFAULT_GRID = [
  [18.2, 18.6],
  [21.4, 21.0],
  [20.1, 19.8],
  [25.6, 26.1],
];

type PairKey = 'AB' | 'AC' | 'BC';

function signsFor(index: number, k: number): number[] {
  return Array.from({ length: k }, (_, j) => ((index & (1 << j)) !== 0 ? 1 : -1));
}

function comboLabel(index: number, k: number): string {
  const parts = signsFor(index, k).map((s, j) => (s > 0 ? LETTERS[j] : '')).filter(Boolean);
  return parts.length ? parts.join('') : '(1)';
}

function makeDefaultGrid(k: number, n: number): number[][] {
  const combos = 2 ** k;
  return Array.from({ length: combos }, (_, i) => {
    const s = signsFor(i, k);
    const A = s[0] ?? 1;
    const B = s[1] ?? 1;
    const C = s[2] ?? 1;
    const mu = 22 + 2.4 * A + 1.5 * B + 0.7 * C + 1.8 * A * B + 0.9 * A * C - 0.6 * B * C;
    return Array.from({ length: n }, (_, j) => Number((mu + (j % 2 === 0 ? -0.22 : 0.22)).toFixed(2)));
  });
}

function cellMeans(grid: number[][], n: number, k: number, xFactor: number, lineFactor: number): InteractionSeries[] {
  const sums = [[0, 0], [0, 0]];
  const counts = [[0, 0], [0, 0]];
  grid.forEach((row, i) => {
    const signs = signsFor(i, k);
    const xi = signs[xFactor] > 0 ? 1 : 0;
    const li = signs[lineFactor] > 0 ? 1 : 0;
    row.slice(0, n).forEach((v) => {
      if (Number.isFinite(v)) { sums[li][xi] += v; counts[li][xi] += 1; }
    });
  });
  return [0, 1].map((li) => ({
    label: `${LETTERS[lineFactor]} ${li === 0 ? 'rendah (−)' : 'tinggi (+)'}`,
    values: [0, 1].map((xi) => (counts[li][xi] ? sums[li][xi] / counts[li][xi] : NaN)),
  }));
}

function mainEffectMeans(grid: number[][], n: number, k: number, names: string[]): MainEffect[] {
  return Array.from({ length: k }, (_, f) => {
    let lowSum = 0, lowN = 0, highSum = 0, highN = 0;
    grid.forEach((row, i) => {
      const sign = signsFor(i, k)[f];
      row.slice(0, n).forEach((v) => {
        if (!Number.isFinite(v)) return;
        if (sign > 0) { highSum += v; highN += 1; } else { lowSum += v; lowN += 1; }
      });
    });
    return { name: names[f] ?? LETTERS[f], low: lowN ? lowSum / lowN : NaN, high: highN ? highSum / highN : NaN };
  });
}

const TERM_VARS: Record<string, string> = {
  A: 'x_{1}', B: 'x_{2}', C: 'x_{3}',
  AB: 'x_{1}x_{2}', AC: 'x_{1}x_{3}', BC: 'x_{2}x_{3}', ABC: 'x_{1}x_{2}x_{3}',
};

function equationTex(effects: FactorialResult['effects'], grandMean: number): string {
  let tex = String.raw`\hat{y}=${Number.isFinite(grandMean) ? grandMean.toFixed(4) : 'b_0'}`;
  effects.forEach((e) => {
    const c = Number.isFinite(e.coefficient) ? e.coefficient : e.effect / 2;
    const sign = c < 0 ? '-' : '+';
    const vars = TERM_VARS[e.term] ?? e.term.toLowerCase();
    tex += ` ${sign} ${Math.abs(c).toFixed(4)}${vars}`;
  });
  return tex;
}

const PRESETS = presetsFor('m4', 'factorial', 'faktorial', 'yates');

export default function FactorialCalc() {
  const [k, setK] = useState<2 | 3>(2);
  const [n, setN] = useState(2);
  const [names, setNames] = useState<string[]>([...DEFAULT_NAMES]);
  const [grid, setGrid] = useState<number[][]>(DEFAULT_GRID.map((r) => [...r]));
  const [alpha, setAlpha] = useState(0.05);
  const [pair, setPair] = useState<PairKey>('AB');

  useEffect(() => {
    const payload = readScenarioFromUrl();
    if (!payload || payload.module !== 'factorial') return;
    const inputs = scenarioInputs(payload.inputs);
    const kk = Number(inputs.k) === 3 ? 3 : 2;
    const nn = clampInt(Number(inputs.n), 1, 5, 2);
    const rawNames = inputs.names;
    const parsedNames = typeof rawNames === 'string' && rawNames.trim()
      ? rawNames.split(/[|,]/).map((s) => s.trim()).filter(Boolean)
      : [...DEFAULT_NAMES];
    const flat = Array.isArray(inputs.data) ? inputs.data.map((v) => safeNumber(v, 0)) : [];
    const sizes = Array.from({ length: 2 ** kk }, () => nn);
    const aa = Number(inputs.alpha);
    setK(kk);
    setN(nn);
    setNames(Array.from({ length: 3 }, (_, i) => parsedNames[i] ?? DEFAULT_NAMES[i]));
    setGrid(resizeRows<number>(chunkFlat(flat, sizes), 2 ** kk, () => Array.from({ length: nn }, () => NaN)));
    setAlpha(Number.isFinite(aa) && aa > 0 && aa < 0.5 ? aa : 0.05);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeK(next: number) {
    const kk: 2 | 3 = next === 3 ? 3 : 2;
    setK(kk);
    setGrid(makeDefaultGrid(kk, Number.isFinite(n) ? n : 2));
    setPair('AB');
  }

  function changeN(next: number) {
    const nn = Number.isFinite(next) ? clampInt(next, 1, 5, 2) : NaN;
    setN(nn);
    const width = Number.isFinite(nn) ? nn : 2;
    setGrid((prev) => prev.map((row) => Array.from({ length: width }, (_, j) => (j < row.length ? row[j] : NaN))));
  }

  function changeName(i: number, value: string) {
    setNames((prev) => prev.map((v, idx) => (idx === i ? value : v)));
  }

  function changeCell(r: number, c: number, value: number) {
    setGrid((prev) => prev.map((row, i) => (i === r ? row.map((v, j) => (j === c ? value : v)) : row)));
  }

  function reset() {
    setK(2);
    setN(2);
    setNames([...DEFAULT_NAMES]);
    setGrid(DEFAULT_GRID.map((r) => [...r]));
    setAlpha(0.05);
    setPair('AB');
    try { sessionStorage.removeItem('mutulab.reveal.faktorial-2k'); } catch { /* abaikan */ }
  }

  function applyPreset(p: Preset) {
    const par = p.parameter as Record<string, unknown>;
    const kk: 2 | 3 = Number(par.k) === 3 ? 3 : 2;
    const nn = clampInt(Number(par.replicates ?? par.n), 1, 5, 2);
    const rawNames = par.names;
    const parsed = Array.isArray(rawNames)
      ? rawNames.map(String)
      : typeof rawNames === 'string' && rawNames.trim()
        ? rawNames.split(/[|,]/).map((s) => s.trim()).filter(Boolean)
        : [...DEFAULT_NAMES];
    const raw = p.data;
    let rows: number[][];
    if (Array.isArray(raw) && Array.isArray(raw[0])) {
      rows = (raw as number[][]).slice(0, 2 ** kk).map((row) =>
        Array.from({ length: nn }, (_, j) => Number.isFinite(row[j]) ? row[j] : NaN));
    } else if (Array.isArray(raw)) {
      rows = resizeRows<number>(chunkFlat((raw as number[]).map(Number), Array.from({ length: 2 ** kk }, () => nn)),
        2 ** kk, () => Array.from({ length: nn }, () => NaN));
    } else {
      rows = makeDefaultGrid(kk, nn);
    }
    const aa = Number(par.alpha);
    setK(kk);
    setN(nn);
    setNames(Array.from({ length: 3 }, (_, i) => parsed[i] ?? DEFAULT_NAMES[i]));
    setGrid(rows);
    setAlpha(Number.isFinite(aa) && aa > 0 && aa < 0.5 ? aa : 0.05);
  }

  const errors = useMemo(() => {
    const list: string[] = [];
    if (k !== 2 && k !== 3) list.push('Pilih k = 2 atau k = 3.');
    if (!Number.isInteger(n) || n < 1 || n > 5) list.push('Jumlah replikasi n harus bilangan bulat 1–5.');
    grid.slice(0, 2 ** k).forEach((row, i) => row.slice(0, Number.isFinite(n) ? n : 0).forEach((v, j) => {
      if (!Number.isFinite(v)) list.push(`Data kombinasi ${comboLabel(i, k)} · replikasi ${j + 1} belum berisi angka.`);
    }));
    return list;
  }, [k, n, grid]);

  const analysis = useMemo(() => {
    if (errors.length) return null;
    const flat = grid.slice(0, 2 ** k).flatMap((row) => row.slice(0, n).map(Number));
    try {
      const result = yatesFactorial(flat, k, n, names.slice(0, k));
      const grandMean = flat.reduce((s, v) => s + v, 0) / flat.length;
      return { result, grandMean, totalSs: flat.reduce((s, v) => s + (v - grandMean) ** 2, 0) };
    } catch {
      return null;
    }
  }, [k, n, grid, names, errors.length]);

  const mainEffects = useMemo(() => (analysis ? mainEffectMeans(grid, n, k, names) : []), [analysis, grid, n, k, names]);
  const pairCfg: Record<PairKey, { x: number; line: number; label: string }> = {
    AB: { x: 0, line: 1, label: `${names[0]} × ${names[1]}` },
    AC: { x: 0, line: 2, label: `${names[0]} × ${names[2]}` },
    BC: { x: 1, line: 2, label: `${names[1]} × ${names[2]}` },
  };
  const activePair = k === 3 ? pair : 'AB';
  const cfg = pairCfg[activePair];
  const series = analysis ? cellMeans(grid, n, k, cfg.x, cfg.line) : [];
  const cue = interactionCue(series);
  const hasAnova = Boolean(analysis?.result.anova);

  const steps: RevealStep[] = analysis ? [
    {
      title: 'Rancangan & urutan Yates',
      content: <>
        <p>Desain {k === 2 ? '2²' : '2³'} memiliki {2 ** k} kombinasi level. Level rendah dikode −1 dan level tinggi +1. Data harus dimasukkan menurut urutan Yates standar: (1), a, b, ab{ k === 3 ? ', c, ac, bc, abc' : ''}.</p>
        <div className="calc-scroll">
          <table className="calc-tight-table">
            <caption>Sign table Algoritma Yates (±1)</caption>
            <thead>
              <tr>
                <th scope="col">Kombinasi</th>
                {analysis.result.effects.map((e) => <th scope="col" key={e.term}>{e.term}</th>)}
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 2 ** k }, (_, i) => (
                <tr key={i}>
                  <td>{comboLabel(i, k)}</td>
                  {analysis.result.effects.map((e) => <td key={e.term}>{e.signTable[i] > 0 ? '+1' : '−1'}</td>)}
                  <td>{defaultFmt(grid[i]?.slice(0, n).reduce((s, v) => s + v, 0) ?? NaN)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>,
    },
    {
      title: 'SS Total & kontras Yates',
      content: <>
        <p>Algoritma Yates membentuk kontras ortogonal dari total tiap kombinasi; kuadrat kontras dibagi {2 ** k} · n menghasilkan SS untuk setiap efek.</p>
        <div className="calc-formula-line"><Formula tex={String.raw`SS_{\text{Total}}=\sum_{i=1}^{2^k}\sum_{j=1}^{n}\left(y_{ij}-\bar{y}_{..}\right)^2`} display /></div>
        <div className="calc-substitution">N = {2 ** k} × {n} = {2 ** k * n} · ȳ = {defaultFmt(analysis.grandMean)}</div>
        <p><strong>SS Total = {defaultFmt(analysis.totalSs)}</strong>.</p>
      </>,
    },
    {
      title: 'Efek utama & interaksi',
      content: <>
        <p>Efek = selisih rata-rata pada level +1 dan −1. Koefisien regresi dengan kode ±1 adalah setengah dari efek.</p>
        <div className="calc-scroll">
          <table className="calc-tight-table">
            <caption>Hasil Algoritma Yates</caption>
            <thead><tr><th scope="col">Efek</th><th scope="col">Efek</th><th scope="col">Koefisien</th><th scope="col">SS</th></tr></thead>
            <tbody>
              {analysis.result.effects.map((e) => (
                <tr key={e.term}><td>{e.term}</td><td>{defaultFmt(e.effect)}</td><td>{defaultFmt(e.coefficient)}</td><td>{defaultFmt(e.ss)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ marginTop: '0.6rem' }}>Efek dengan nilai absolut terbesar: <strong>{analysis.result.effects.reduce((a, b) => Math.abs(b.effect) > Math.abs(a.effect) ? b : a).term}</strong>.</p>
      </>,
    },
    {
      title: 'Persamaan model regresi',
      content: <>
        <p>Dengan pengkodean ±1, intersep adalah rata-rata besar dan tiap koefisien bernilai setengah efek.</p>
        <div className="calc-formula-line"><Formula tex={equationTex(analysis.result.effects, analysis.grandMean)} display /></div>
        {analysis.result.equation && <div className="calc-substitution">Ringkasan calc-core: {analysis.result.equation}</div>}
      </>,
    },
    {
      title: 'Membaca interaction plot',
      content: <>
        <p>Garis yang sejajar menandakan efek satu faktor tidak berubah pada level faktor lain (tanpa interaksi). Garis yang berpotongan atau sangat tidak sejajar menandakan interaksi.</p>
        <div className="calc-chip-row"><span className="chip" data-tone={cue.tone}>{cue.label}</span></div>
        <p>Pada grafik di samping, sumbu x adalah faktor <strong>{names[cfg.x]}</strong> dan garis adalah level faktor <strong>{names[cfg.line]}</strong>.</p>
      </>,
    },
    {
      title: hasAnova ? 'ANOVA faktorial' : 'Galat murni tidak tersedia',
      content: hasAnova ? <>
        <StatTable
          rows={analysis.result.anova!.rows}
          caption={`Tabel ANOVA faktorial 2^${k} — α = ${defaultFmt(alpha)}`}
          decision={{ label: analysis.result.anova!.rejected ? 'Ada efek signifikan' : 'Tidak ada efek signifikan', accepted: !analysis.result.anova!.rejected }}
        />
        <div className="calc-chip-row">
          {analysis.result.anova!.rows.filter((r) => !['Error', 'Total'].includes(r.source)).map((r) => (
            <span className="chip" key={r.source}>
              F-kritis {r.source} = {defaultFmt(fCritical(alpha, r.df, analysis.result.anova!.rows.find((x) => x.source === 'Error')?.df ?? 2 ** k * (n - 1)))}
            </span>
          ))}
        </div>
      </> : <>
        <Notice tone="warn" title="n = 1 — uji F tidak dapat dilakukan">
          Dengan satu pengamatan per kombinasi, galat murni tidak dapat diestimasi. Efek utama dan interaksi tetap dihitung, tetapi <strong>tidak ada p-value dan tidak ada keputusan uji F</strong>. Tambahkan replikasi (n ≥ 2) untuk mendapatkan ANOVA.
        </Notice>
        {analysis.result.warning && <p style={{ marginTop: '0.6rem' }}>{analysis.result.warning}</p>}
      </>,
    },
    {
      title: 'Keputusan & tindak lanjut',
      content: hasAnova ? <>
        <p className="calc-step-conclusion">{analysis.result.anova!.conclusion}</p>
        <Notice tone="info" title="Tips pengajaran">
          Bandingkan efek utama dengan pola pada interaction plot. Interaksi yang kuat membuat interpretasi efek utama saja menyesatkan.
        </Notice>
      </> : <>
        <p className="calc-step-conclusion">Efek yang terbesar dapat dipakai sebagai petunjuk arah eksperimen lanjutan, namun belum dapat dinyatakan signifikan secara statistik.</p>
        <Notice tone="info" title="Langkah berikutnya">Ulangi tiap kombinasi minimal dua kali agar galat murni dapat diestimasi dan uji F berlaku.</Notice>
      </>,
    },
  ] : [{
    title: 'Menunggu data yang valid',
    content: <Notice tone="error" title="Perhitungan ditunda">Lengkapi seluruh {2 ** k} × {Number.isFinite(n) ? n : 'n'} sel data dengan angka.</Notice>,
  }];

  return (
    <CalculatorFrame
      title="Faktorial 2ᵏ · Yates"
      subtitle="Hitung efek utama dan interaksi dengan Algoritma Yates, susun persamaan regresi, dan baca interaction plot secara visual."
      moduleId="m4"
      presets={PRESETS}
      onPreset={applyPreset}
      actions={<CalcActions buildUrl={() => buildShareUrl({
        v: 1,
        module: 'factorial',
        inputs: {
          k, n, alpha,
          names: names.join('|'),
          data: flattenMatrix(grid.slice(0, 2 ** k).map((row) => row.slice(0, Number.isFinite(n) ? n : 0))),
        },
      })} onReset={reset} />}
    >
      <div className="bento">
        <section className="card calc-panel span-12">
          <div className="calc-toolbar">
            <div className="calc-field">
              <label htmlFor="fac-k">Jumlah faktor (k)</label>
              <select id="fac-k" className="calc-input" value={k} onChange={(e) => changeK(Number(e.target.value))}>
                <option value={2}>2 faktor — 2² (4 kombinasi)</option>
                <option value={3}>3 faktor — 2³ (8 kombinasi)</option>
              </select>
            </div>
            <NumberField id="fac-n" label="Replikasi per kombinasi (n)" value={n} onChange={changeN} min={1} max={5} step={1} hint="n = 1 → tanpa uji F." />
            <NumberField id="fac-alpha" label="Taraf signifikansi (α)" value={alpha}
              onChange={(v) => setAlpha(Number.isFinite(v) ? Math.min(0.2, Math.max(0.01, v)) : 0.05)} min={0.01} max={0.2} step={0.01} />
          </div>
          <div className="calc-toolbar">
            {LETTERS.slice(0, k).map((letter, i) => (
              <div className="calc-field" key={letter}>
                <label htmlFor={`fac-name-${i}`}>Nama faktor {letter}</label>
                <input id={`fac-name-${i}`} className="calc-input" type="text" maxLength={24}
                  value={names[i] ?? ''} onChange={(e) => changeName(i, e.target.value)} />
              </div>
            ))}
          </div>

          <h3>Data pengamatan menurut urutan Yates</h3>
          <p className="calc-hint" style={{ marginBottom: '0.5rem' }}>Baris = kombinasi level (−1/+1), kolom = replikasi.</p>
          <NumberMatrix
            idPrefix="fac-data"
            matrix={grid.slice(0, 2 ** k).map((row) => row.slice(0, Number.isFinite(n) ? n : 2))}
            onChange={changeCell}
            rowLabels={Array.from({ length: 2 ** k }, (_, i) => `${comboLabel(i, k)} (${signsFor(i, k).map((s) => s > 0 ? '+' : '−').join('')})`)}
            colLabels={Array.from({ length: Number.isFinite(n) ? n : 2 }, (_, j) => `Rep ${j + 1}`)}
            cornerLabel="Respons pengamatan"
            invalid={(r, c) => !Number.isFinite(grid[r]?.[c])}
          />
          {n === 1 && (
            <div style={{ marginTop: '0.9rem' }}>
              <Notice tone="warn" title="Galat murni tidak dapat diestimasi">
                Dengan n = 1, efek dan persamaan tetap ditampilkan tetapi uji F dan p-value tidak tersedia.
              </Notice>
            </div>
          )}
          {errors.length > 0 && (
            <div style={{ marginTop: '0.9rem' }}>
              <Notice tone="error" title={`Periksa kembali ${errors.length} input`}>
                <ul style={{ margin: '0.3rem 0 0 1.1rem', padding: 0 }}>
                  {errors.slice(0, 4).map((e, i) => <li key={i}>{e}</li>)}
                  {errors.length > 4 && <li>…dan {errors.length - 4} masalah lainnya.</li>}
                </ul>
              </Notice>
            </div>
          )}
        </section>

        {analysis && (
          <section className="card calc-panel span-12">
            <div className="calc-result-grid cols-3">
              <Kpi label="Kombinasi (2ᵏ)" value={String(2 ** k)} />
              <Kpi label="Total pengamatan" value={String(2 ** k * n)} />
              <Kpi label="Rata-rata besar" value={defaultFmt(analysis.grandMean)} />
              <Kpi label="Efek terbesar" value={analysis.result.effects.reduce((a, b) => Math.abs(b.effect) > Math.abs(a.effect) ? b : a).term} />
              <Kpi label="SS Total" value={defaultFmt(analysis.totalSs)} />
              <Kpi label="Status uji F" value={hasAnova ? 'Tersedia' : 'Tidak tersedia (n=1)'} />
            </div>
          </section>
        )}

        <section className="card calc-panel span-7"><RevealSteps id="faktorial-2k" steps={steps} /></section>

        <section className="card calc-panel span-5">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'baseline' }}>
            <h3>Interaction plot</h3>
            {k === 3 && (
              <label className="calc-suffix" htmlFor="fac-pair">Pasangan:
                <select id="fac-pair" className="calc-input" style={{ width: 'auto', display: 'inline-block', marginLeft: '0.35rem', padding: '0.3rem 0.5rem' }}
                  value={pair} onChange={(e) => setPair(e.target.value as PairKey)}>
                  <option value="AB">A × B</option><option value="AC">A × C</option><option value="BC">B × C</option>
                </select>
              </label>
            )}
          </div>
          <InteractionPlot
            xLabels={[`${names[cfg.x]} rendah (−)`, `${names[cfg.x]} tinggi (+)`]}
            series={series}
            xTitle={names[cfg.x]}
            yTitle="Rata-rata respons"
            caption={`Pasangan ${cfg.label}. Arah garis yang tidak sejajar mengindikasikan interaksi: ${cue.label.toLowerCase()}.`}
          />
        </section>

        <section className="card calc-panel span-12">
          <h3>Main effects plot</h3>
          <MainEffectsPlot
            effects={mainEffects}
            caption="Titik bulat = rata-rata pada level rendah (−1); kotak = rata-rata pada level tinggi (+1). Semakin jauh jarak keduanya, semakin besar efek utamanya."
          />
        </section>
      </div>
    </CalculatorFrame>
  );
}
