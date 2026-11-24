/** F-04 — Kalkulator RCBD: dekomposisi SS Blok dan sensitivitas uji F. */
import { useEffect, useMemo, useState } from 'react';
import { rcbdAnova, fCritical, fSf, formatP } from '../../lib/calc-core';
import type { AnovaResult, Preset } from '../../lib/types';
import { buildShareUrl, readScenarioFromUrl, safeNumber } from '../../lib/share';
import CalculatorFrame from '../ui/CalculatorFrame';
import RevealSteps, { type RevealStep } from '../ui/RevealSteps';
import StatTable, { defaultFmt } from '../ui/StatTable';
import Formula from '../ui/Formula';
import BarChart from '../charts/BarChart';
import ResidualQQ from '../charts/ResidualQQ';
import {
  CalcActions, Kpi, Notice, NumberField, NumberMatrix,
  chunkFlat, clampInt, flattenMatrix, presetsFor, resizeRows, scenarioInputs,
} from './shared';

const DEFAULT_T = 4;
const DEFAULT_B = 3;
const DEFAULT_MATRIX = [
  [41.2, 43.0, 42.5],
  [44.1, 45.6, 44.8],
  [39.8, 40.9, 40.2],
  [46.5, 47.2, 46.9],
];

const PRESETS = presetsFor('m3', 'rcbd', 'blocking');

export default function RcbdCalc() {
  const [t, setT] = useState(DEFAULT_T);
  const [b, setB] = useState(DEFAULT_B);
  const [matrix, setMatrix] = useState<number[][]>(DEFAULT_MATRIX.map((r) => [...r]));
  const [alpha, setAlpha] = useState(0.05);

  useEffect(() => {
    const payload = readScenarioFromUrl();
    if (!payload || payload.module !== 'rcbd') return;
    const inputs = scenarioInputs(payload.inputs);
    const tt = clampInt(Number(inputs.t), 2, 6, DEFAULT_T);
    const bb = clampInt(Number(inputs.b), 2, 8, DEFAULT_B);
    const flat = Array.isArray(inputs.data) ? inputs.data.map((v) => safeNumber(v, 0)) : [];
    const rows = resizeRows<number>(chunkFlat(flat, Array.from({ length: tt }, () => bb)), tt, () => Array.from({ length: bb }, () => NaN));
    const aa = Number(inputs.alpha);
    setT(tt);
    setB(bb);
    setMatrix(rows);
    setAlpha(Number.isFinite(aa) && aa > 0 && aa < 0.5 ? aa : 0.05);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeT(next: number) {
    const n = clampInt(next, 2, 6, DEFAULT_T);
    setT(n);
    setMatrix((prev) => resizeRows<number>(prev, n, () => Array.from({ length: b }, () => NaN)));
  }

  function changeB(next: number) {
    const n = clampInt(next, 2, 8, DEFAULT_B);
    setB(n);
    setMatrix((prev) => prev.map((row) => Array.from({ length: n }, (_, j) => (j < row.length ? row[j] : NaN))));
  }

  function changeCell(r: number, c: number, value: number) {
    setMatrix((prev) => prev.map((row, i) => (i === r ? row.map((v, j) => (j === c ? value : v)) : row)));
  }

  function reset() {
    setT(DEFAULT_T);
    setB(DEFAULT_B);
    setMatrix(DEFAULT_MATRIX.map((r) => [...r]));
    setAlpha(0.05);
    try { sessionStorage.removeItem('mutulab.reveal.rcbd-anova'); } catch { /* abaikan */ }
  }

  function applyPreset(p: Preset) {
    const par = p.parameter as Record<string, unknown>;
    const fromData = Array.isArray(p.data) && Array.isArray(p.data[0]) ? p.data.length : Array.isArray(p.data) ? p.data.length : DEFAULT_T;
    const fromLevel = Array.isArray(par.level) ? par.level.length : NaN;
    const tt = clampInt(Number.isFinite(fromLevel) ? fromLevel : Number(par.t) || fromData, 2, 6, DEFAULT_T);
    const bb = clampInt(Number(par.blokCount ?? par.b), 2, 8, DEFAULT_B);
    const raw = p.data;
    let rows: number[][];
    if (Array.isArray(raw) && Array.isArray(raw[0])) {
      rows = (raw as number[][]).slice(0, tt).map((row) =>
        Array.from({ length: bb }, (_, j) => Number.isFinite(row[j]) ? row[j] : NaN));
    } else if (Array.isArray(raw)) {
      rows = resizeRows<number>(chunkFlat((raw as number[]).map(Number), Array.from({ length: tt }, () => bb)),
        tt, () => Array.from({ length: bb }, () => NaN));
    } else {
      rows = Array.from({ length: tt }, () => Array.from({ length: bb }, () => NaN));
    }
    const aa = Number(par.alpha);
    setT(tt);
    setB(bb);
    setMatrix(rows);
    setAlpha(Number.isFinite(aa) && aa > 0 && aa < 0.5 ? aa : 0.05);
  }

  const errors = useMemo(() => {
    const list: string[] = [];
    if (t < 2 || t > 6) list.push('Jumlah perlakuan (t) harus 2–6.');
    if (b < 2 || b > 8) list.push('Jumlah blok (b) harus 2–8.');
    matrix.slice(0, t).forEach((row, i) => row.slice(0, b).forEach((v, j) => {
      if (!Number.isFinite(v)) list.push(`Data P${i + 1} · blok ${j + 1} belum berisi angka.`);
    }));
    if ((t - 1) * (b - 1) < 1) list.push('df Error = (t−1)(b−1) harus ≥ 1 — tambahkan perlakuan atau blok.');
    return list;
  }, [t, b, matrix]);

  const stats = useMemo(() => {
    if (errors.length) return null;
    const cells = matrix.slice(0, t).map((row) => row.slice(0, b).map(Number));
    try {
      const result: AnovaResult = rcbdAnova(cells, alpha);
      const rows = Object.fromEntries(result.rows.map((r) => [r.source, r]));
      const flat = cells.flat();
      const N = t * b;
      const grand = flat.reduce((s, v) => s + v, 0) / N;
      const rowMeans = cells.map((row) => row.reduce((s, v) => s + v, 0) / b);
      const colMeans = Array.from({ length: b }, (_, j) => cells.reduce((s, row) => s + row[j], 0) / t);
      const ssTotal = flat.reduce((s, v) => s + (v - grand) ** 2, 0);
      const ssTr = b * rowMeans.reduce((s, m) => s + (m - grand) ** 2, 0);
      const ssBlock = t * colMeans.reduce((s, m) => s + (m - grand) ** 2, 0);
      // Tanpa pemblokan: SSE = SS_Total − SS_Treatment = SS_Block + SS_Error.
      const sseNo = ssTotal - ssTr;
      const dfNo = t * (b - 1);
      const mseNo = sseNo / dfNo;
      const mseWith = result.errorMs;
      const msTr = rows['Treatment']?.ms ?? NaN;
      const dfWith = (t - 1) * (b - 1);
      const fWith = msTr / mseWith;
      const fNo = msTr / mseNo;
      const pWith = Number.isFinite(fWith) ? fSf(fWith, t - 1, dfWith) : NaN;
      const pNo = Number.isFinite(fNo) ? fSf(fNo, t - 1, dfNo) : NaN;
      const reduction = mseNo > 0 ? ((mseNo - mseWith) / mseNo) * 100 : 0;
      const residuals = cells.flatMap((row, i) => row.map((v, j) => v - rowMeans[i] - colMeans[j] + grand));
      return { result, rows, ssTotal, ssTr, ssBlock, sseNo, dfNo, mseNo, mseWith, msTr, dfWith, fWith, fNo, pWith, pNo, reduction, grand, residuals };
    } catch {
      return null;
    }
  }, [t, b, matrix, alpha, errors.length]);

  const steps: RevealStep[] = stats ? [
    {
      title: 'Hipotesis & alasan pemblokan',
      content: <>
        <p>Perlakuan diuji di dalam {b} blok yang homogen (misalnya batch bahan baku atau shift mesin). Setiap perlakuan muncul sekali di tiap blok sehingga blok tidak mengganggu perbandingan.</p>
        <div className="calc-formula-line"><Formula tex={String.raw`H_0:\mu_1=\dots=\mu_${t}\qquad\text{vs}\qquad H_1:\exists\,i\ne j,\ \mu_i\ne\mu_j`} display /></div>
        <p>Model: <Formula tex={String.raw`y_{ij}=\mu+\tau_i+\beta_j+\varepsilon_{ij}`} /> dengan <Formula tex={String.raw`\beta_j`} /> sebagai efek blok.</p>
      </>,
    },
    {
      title: 'SS Total — variasi seluruh pengamatan',
      content: <>
        <div className="calc-formula-line"><Formula tex={String.raw`SS_{\text{Total}}=\sum_{i=1}^{t}\sum_{j=1}^{b}\left(y_{ij}-\bar{y}_{..}\right)^2`} display /></div>
        <div className="calc-substitution">N = {t} × {b} = {t * b} · ȳ = {defaultFmt(stats.grand)}</div>
        <p><strong>SS Total = {defaultFmt(stats.ssTotal)}</strong>, df = N − 1 = {t * b - 1}.</p>
      </>,
    },
    {
      title: 'SS Treatment — sinyal yang diuji',
      content: <>
        <div className="calc-formula-line"><Formula tex={String.raw`SS_{\text{Treatment}}=b\sum_{i=1}^{t}\left(\bar{y}_{i\cdot}-\bar{y}_{..}\right)^2`} display /></div>
        <p><strong>SS Treatment = {defaultFmt(stats.ssTr)}</strong>, df = t − 1 = {t - 1}, MS = {defaultFmt(stats.msTr)}.</p>
      </>,
    },
    {
      title: 'SS Block — variasi yang diisolasi',
      content: <>
        <p>Blok menyerap variasi yang diketahui (bahan baku, operator, waktu). Menyisihkannya dari galat inilah yang membuat uji lebih tajam.</p>
        <div className="calc-formula-line"><Formula tex={String.raw`SS_{\text{Block}}=t\sum_{j=1}^{b}\left(\bar{y}_{\cdot j}-\bar{y}_{..}\right)^2`} display /></div>
        <p><strong>SS Block = {defaultFmt(stats.ssBlock)}</strong>, df = b − 1 = {b - 1}, MS = {defaultFmt(stats.rows['Block']?.ms ?? NaN)}.</p>
      </>,
    },
    {
      title: 'SS Error — galat setelah pemblokan',
      content: <>
        <div className="calc-formula-line"><Formula tex={String.raw`SS_{\text{Error}}=SS_{\text{Total}}-SS_{\text{Treatment}}-SS_{\text{Block}}`} display /></div>
        <div className="calc-substitution">{defaultFmt(stats.ssTotal)} − {defaultFmt(stats.ssTr)} − {defaultFmt(stats.ssBlock)} = {defaultFmt(stats.rows['Error']?.ss ?? NaN)}</div>
        <p><strong>MS Error = {defaultFmt(stats.mseWith)}</strong> dengan df = (t−1)(b−1) = {stats.dfWith}.</p>
      </>,
    },
    {
      title: 'Tabel ANOVA RCBD',
      content: <>
        <StatTable
          rows={stats.result.rows}
          caption={`Tabel ANOVA RCBD — α = ${defaultFmt(alpha)}`}
          decision={{ label: stats.result.rejected ? 'Tolak H₀' : 'Gagal tolak H₀', accepted: !stats.result.rejected }}
        />
        <div className="calc-chip-row">
          <span className="chip">F-hitung = {defaultFmt(stats.fWith)}</span>
          <span className="chip">F-kritis = {defaultFmt(fCritical(alpha, t - 1, stats.dfWith))}</span>
          <span className="chip" data-tone={stats.pWith < alpha ? 'danger' : 'ok'}>p = {formatP(stats.pWith)}</span>
        </div>
      </>,
    },
    {
      title: 'Sensitivitas uji: dengan vs tanpa blok',
      content: <>
        <p>Jika blok diabaikan, komponen blok masuk ke galat:</p>
        <div className="calc-formula-line"><Formula tex={String.raw`SS_{E,\ \text{tanpa blok}}=SS_{\text{Block}}+SS_{\text{Error}}=${defaultFmt(stats.ssBlock)}+${defaultFmt(stats.rows['Error']?.ss ?? NaN)}=${defaultFmt(stats.sseNo)}`} display /></div>
        <BarChart
          bars={[
            { label: 'Tanpa blok', value: stats.mseNo, tone: 'warn' },
            { label: 'Dengan blok (RCBD)', value: stats.mseWith, tone: 'ok' },
          ]}
          yTitle="MS Error"
          caption={`Pemblokan menurunkan MS Error sebesar ${stats.reduction.toLocaleString('id-ID', { maximumFractionDigits: 1 })}% dibanding analisis yang mengabaikan blok.`}
        />
        <div className="calc-result-grid">
          <Kpi label="F tanpa blok" value={defaultFmt(stats.fNo)} />
          <Kpi label="p tanpa blok" value={formatP(stats.pNo)} />
          <Kpi label="F dengan blok" value={defaultFmt(stats.fWith)} />
          <Kpi label="p dengan blok" value={formatP(stats.pWith)} />
        </div>
        <Notice tone={stats.reduction > 0 ? 'info' : 'warn'} title={stats.reduction > 0 ? 'Uji menjadi lebih sensitif' : 'Blok kurang membantu'}>
          {stats.reduction > 0
            ? 'MS Error lebih kecil sehingga F-hitung lebih besar dan p-value lebih kecil untuk sinyal yang sama.'
            : 'Variasi antar blok ternyata kecil; manfaat pemblokan tidak besar pada data ini.'}
        </Notice>
      </>,
    },
    {
      title: 'Keputusan & interpretasi',
      content: <>
        <p className="calc-step-conclusion">{stats.result.conclusion}</p>
        <Notice tone="info" title="Catatan">
          Kesimpulan berlaku bila asumsi keterbagian (setiap perlakuan muncul di semua blok) dan residual normal terpenuhi. Q-Q plot di samping membantu pemeriksaan visual.
        </Notice>
      </>,
    },
  ] : [{
    title: 'Menunggu data yang valid',
    content: <Notice tone="error" title="Perhitungan ditunda">Lengkapi matriks t × b dengan angka sampai pesan validasi hilang.</Notice>,
  }];

  return (
    <CalculatorFrame
      title="RCBD · ANOVA Blok"
      subtitle="Isolasi variasi blok dari galat, lalu lihat langsung bagaimana pemblokan mempertajam uji F terhadap perlakuan."
      moduleId="m3"
      presets={PRESETS}
      onPreset={applyPreset}
      actions={<CalcActions buildUrl={() => buildShareUrl({
        v: 1,
        module: 'rcbd',
        inputs: { t, b, alpha, data: flattenMatrix(matrix.slice(0, t).map((row) => row.slice(0, b))) },
      })} onReset={reset} />}
    >
      <div className="bento">
        <section className="card calc-panel span-12">
          <div className="calc-toolbar">
            <NumberField id="rcbd-t" label="Jumlah perlakuan (t)" value={t} onChange={changeT} min={2} max={6} step={1} />
            <NumberField id="rcbd-b" label="Jumlah blok (b)" value={b} onChange={changeB} min={2} max={8} step={1} />
            <NumberField id="rcbd-alpha" label="Taraf signifikansi (α)" value={alpha}
              onChange={(v) => setAlpha(Number.isFinite(v) ? Math.min(0.2, Math.max(0.01, v)) : 0.05)} min={0.01} max={0.2} step={0.01} />
            <div className="calc-field" style={{ flex: '1 1 220px' }}>
              <label htmlFor="rcbd-alpha-range">Pengeser α</label>
              <input id="rcbd-alpha-range" className="calc-slider" type="range" min={0.01} max={0.2} step={0.01}
                value={Number.isFinite(alpha) ? alpha : 0.05} onChange={(e) => setAlpha(Number(e.target.value))}
                aria-valuetext={`Alfa ${defaultFmt(alpha)}`} />
              <div className="calc-slider-scale"><span>0,01</span><span>0,20</span></div>
            </div>
          </div>

          <h3>Matriks data (t × b)</h3>
          <p className="calc-hint" style={{ marginBottom: '0.5rem' }}>Baris = perlakuan, kolom = blok. Setiap sel adalah satu pengamatan.</p>
          <NumberMatrix
            idPrefix="rcbd-data"
            matrix={matrix.slice(0, t).map((row) => row.slice(0, b))}
            onChange={changeCell}
            rowLabels={Array.from({ length: t }, (_, i) => `P${i + 1}`)}
            colLabels={Array.from({ length: b }, (_, j) => `Blok ${j + 1}`)}
            cornerLabel="Kekuatan tarik (MPa)"
            invalid={(r, c) => !Number.isFinite(matrix[r]?.[c])}
          />
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

        {stats && (
          <section className="card calc-panel span-12">
            <div className="calc-result-grid cols-3">
              <Kpi label="MS Error (dengan blok)" value={defaultFmt(stats.mseWith)} />
              <Kpi label="MS Error (tanpa blok)" value={defaultFmt(stats.mseNo)} />
              <Kpi label="Penurunan galat" value={`${stats.reduction.toLocaleString('id-ID', { maximumFractionDigits: 1 })}%`} />
              <Kpi label="F-hitung (RCBD)" value={defaultFmt(stats.fWith)} />
              <Kpi label="p-value" value={formatP(stats.pWith)} />
              <Kpi label="Keputusan" value={stats.result.rejected ? 'Tolak H₀' : 'Gagal tolak H₀'} />
            </div>
          </section>
        )}

        <section className="card calc-panel span-8"><RevealSteps id="rcbd-anova" steps={steps} /></section>

        {stats && (
          <aside className="card calc-panel span-4">
            <h3>Residual RCBD</h3>
            <ResidualQQ
              residuals={stats.residuals}
              caption="Residual dihitung setelah efek perlakuan dan blok dikeluarkan. Pola acak di sekitar garis diharapkan."
            />
          </aside>
        )}
      </div>
    </CalculatorFrame>
  );
}
