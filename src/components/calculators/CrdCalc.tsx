/** F-04 — Kalkulator CRD ANOVA satu arah dengan Fisher LSD dan Board Reveal. */
import { useEffect, useMemo, useState } from 'react';
import { crdAnova, fisherLsd, fCritical, fSf, formatP } from '../../lib/calc-core';
import type { AnovaResult, Preset } from '../../lib/types';
import { buildShareUrl, readScenarioFromUrl, safeNumber } from '../../lib/share';
import CalculatorFrame from '../ui/CalculatorFrame';
import RevealSteps, { type RevealStep } from '../ui/RevealSteps';
import StatTable, { defaultFmt } from '../ui/StatTable';
import Formula from '../ui/Formula';
import ResidualQQ from '../charts/ResidualQQ';
import {
  CalcActions, Kpi, Notice, NumberField, NumberMatrix,
  chunkFlat, clampInt, flattenMatrix, presetsFor, resizeRows, scenarioInputs,
} from './shared';

const DEFAULT_REPS = [4, 4, 4];
const DEFAULT_DATA = [
  [12.4, 13.1, 12.8, 12.2],
  [11.2, 11.8, 10.9, 11.5],
  [10.1, 9.8, 10.6, 9.4],
];

const PRESETS = presetsFor('m2', 'crd');

export default function CrdCalc() {
  const [t, setT] = useState(3);
  const [reps, setReps] = useState<number[]>([...DEFAULT_REPS]);
  const [data, setData] = useState<number[][]>(DEFAULT_DATA.map((r) => [...r]));
  const [alpha, setAlpha] = useState(0.05);

  /* --- Skenario dari URL (F-07) --- */
  useEffect(() => {
    const payload = readScenarioFromUrl();
    if (!payload || payload.module !== 'crd') return;
    const inputs = scenarioInputs(payload.inputs);
    const tt = clampInt(Number(inputs.t), 2, 6, 3);
    const rr = Array.isArray(inputs.reps) && inputs.reps.length === tt
      ? inputs.reps.map((v) => clampInt(safeNumber(v, 4), 1, 20, 4))
      : Array.from({ length: tt }, () => 4);
    const flat = Array.isArray(inputs.data) ? inputs.data.map((v) => safeNumber(v, 0)) : [];
    const dd = resizeRows<number>(chunkFlat(flat, rr), tt, () => [NaN]);
    const aa = Number(inputs.alpha);
    setT(tt);
    setReps(rr);
    setData(dd);
    setAlpha(Number.isFinite(aa) && aa > 0 && aa < 0.5 ? aa : 0.05);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changeT(next: number) {
    const n = clampInt(next, 2, 6, 3);
    setT(n);
    setReps((prev) => Array.from({ length: n }, (_, i) => (Number.isFinite(prev[i]) ? prev[i] : 4)));
    setData((prev) => resizeRows<number>(prev, n, () => [NaN]));
  }

  function changeRep(i: number, next: number) {
    const n = Number.isFinite(next) ? clampInt(next, 1, 20, 4) : NaN;
    setReps((prev) => prev.map((v, idx) => (idx === i ? n : v)));
    setData((prev) => prev.map((row, idx) => idx === i
      ? Array.from({ length: Number.isFinite(n) ? n : 4 }, (_, j) => (j < row.length ? row[j] : NaN))
      : row));
  }

  function changeCell(r: number, c: number, value: number) {
    setData((prev) => prev.map((row, i) => (i === r ? row.map((v, j) => (j === c ? value : v)) : row)));
  }

  function reset() {
    setT(3);
    setReps([...DEFAULT_REPS]);
    setData(DEFAULT_DATA.map((r) => [...r]));
    setAlpha(0.05);
    try { sessionStorage.removeItem('mutulab.reveal.crd-anova'); } catch { /* abaikan */ }
  }

  function applyPreset(p: Preset) {
    const par = p.parameter as Record<string, unknown>;
    const tt = clampInt(Number(par.t ?? (Array.isArray(p.data) ? p.data.length : 3)), 2, 6, 3);
    const rawReps = par.reps ?? (Array.isArray(par.ulangan) ? par.ulangan : Array.from({ length: tt }, () => Number(par.ulangan)));
    const rr = Array.isArray(rawReps) && rawReps.length === tt
      ? rawReps.map((v) => clampInt(Number(v), 1, 20, 4))
      : Array.from({ length: tt }, () => 4);
    const raw = p.data;
    let dd: number[][];
    if (Array.isArray(raw) && Array.isArray(raw[0])) {
      dd = (raw as number[][]).slice(0, tt).map((row, i) =>
        Array.from({ length: rr[i] ?? row.length }, (_, j) => Number.isFinite(row[j]) ? row[j] : NaN));
    } else if (Array.isArray(raw)) {
      dd = resizeRows<number>(chunkFlat((raw as number[]).map(Number), rr), tt, () => [NaN]);
    } else {
      dd = Array.from({ length: tt }, () => Array.from({ length: 4 }, () => NaN));
    }
    const aa = Number(par.alpha);
    setT(tt);
    setReps(rr);
    setData(dd);
    setAlpha(Number.isFinite(aa) && aa > 0 && aa < 0.5 ? aa : 0.05);
  }

  /* --- Validasi --- */
  const errors = useMemo(() => {
    const list: string[] = [];
    if (!Number.isInteger(t) || t < 2 || t > 6) list.push('Jumlah perlakuan harus bilangan bulat 2–6.');
    reps.slice(0, t).forEach((n, i) => {
      if (!Number.isInteger(n) || n < 1 || n > 20) list.push(`Replikasi perlakuan ${i + 1} harus bilangan bulat 1–20.`);
    });
    data.slice(0, t).forEach((row, i) => row.slice(0, Number.isFinite(reps[i]) ? reps[i] : 0).forEach((v, j) => {
      if (!Number.isFinite(v)) list.push(`Data perlakuan ${i + 1} · replikasi ${j + 1} belum berisi angka.`);
    }));
    const total = reps.slice(0, t).reduce<number>((s, n) => s + (Number.isFinite(n) ? n : 0), 0);
    if (total - t < 1) list.push('Galat murni tidak dapat diestimasi: df Error = N − t harus ≥ 1 (tambahkan replikasi).');
    return list;
  }, [t, reps, data]);

  const computed = useMemo<{ result: AnovaResult; lsd: ReturnType<typeof fisherLsd> } | null>(() => {
    if (errors.length) return null;
    const groups = data.slice(0, t).map((row, i) => row.slice(0, reps[i]).map(Number));
    try {
      return { result: crdAnova(groups, alpha), lsd: fisherLsd(groups, alpha) };
    } catch {
      return null;
    }
  }, [t, reps, data, alpha, errors.length]);

  const residuals = useMemo(() => {
    if (!computed) return [];
    return data.slice(0, t).flatMap((row, i) => {
      const vals = row.slice(0, reps[i]).filter(Number.isFinite);
      const mean = vals.reduce((s, v) => s + v, 0) / Math.max(vals.length, 1);
      return vals.map((v) => v - mean);
    });
  }, [computed, data, reps, t]);

  const rowOf = (source: string) => computed?.result.rows.find((r) => r.source === source);
  const totalN = reps.slice(0, t).reduce<number>((s, n) => s + (Number.isFinite(n) ? n : 0), 0);
  const grandMean = computed?.result.grandMean ?? NaN;
  const ssTotal = rowOf('Total')?.ss ?? NaN;
  const ssTr = rowOf('Treatment')?.ss ?? NaN;
  const ssErr = rowOf('Error')?.ss ?? NaN;
  const dfTr = rowOf('Treatment')?.df ?? t - 1;
  const dfErr = rowOf('Error')?.df ?? totalN - t;
  const fStat = rowOf('Treatment')?.f ?? NaN;
  const pVal = rowOf('Treatment')?.p ?? (Number.isFinite(fStat) ? fSf(fStat, dfTr, dfErr) : NaN);
  const crit = fCritical(alpha, dfTr, dfErr);
  const fCrit = Number.isFinite(crit) ? crit : computed?.result.fCritical ?? NaN;

  const steps: RevealStep[] = computed ? [
    {
      title: 'Hipotesis & taraf signifikansi',
      content: <>
        <p>Uji apakah rata-rata ke-{t} perlakuan berbeda secara nyata, dengan asumsi pengacakan lengkap (<em>completely randomized design</em>).</p>
        <div className="calc-formula-line"><Formula tex={String.raw`H_0:\mu_1=\mu_2=\dots=\mu_${t}\qquad H_1:\exists\,i\ne j,\ \mu_i\ne\mu_j`} display /></div>
        <p>Taraf signifikansi <strong>α = {defaultFmt(alpha)}</strong>. Keputusan: tolak H₀ bila p-value &lt; α atau F-hitung &gt; F-kritis.</p>
      </>,
    },
    {
      title: 'SS Total — seluruh variasi',
      content: <>
        <p>Total kuadrat mengukur penyebaran semua {totalN} pengamatan terhadap rata-rata besar (<em>grand mean</em>).</p>
        <div className="calc-formula-line"><Formula tex={String.raw`SS_{\text{Total}}=\sum_{i=1}^{t}\sum_{j=1}^{n_i}\left(y_{ij}-\bar{y}_{..}\right)^2`} display /></div>
        <div className="calc-substitution">Σ(yᵢⱼ − ȳ)² · ȳ = {defaultFmt(grandMean)} · N = {totalN}</div>
        <p><strong>SS Total = {defaultFmt(ssTotal)}</strong> dengan df = N − 1 = {totalN - 1}.</p>
      </>,
    },
    {
      title: 'SS Treatment — variasi antar perlakuan',
      content: <>
        <p>Kuadrat perlakuan menangkap seberapa jauh rata-rata tiap grup menyimpang dari rata-rata besar, dibobot oleh ukuran grup.</p>
        <div className="calc-formula-line"><Formula tex={String.raw`SS_{\text{Treatment}}=\sum_{i=1}^{t} n_i\left(\bar{y}_{i\cdot}-\bar{y}_{..}\right)^2`} display /></div>
        <div className="calc-substitution">t = {t} · ȳ = {defaultFmt(grandMean)} · nᵢ = [{reps.slice(0, t).join(', ')}]</div>
        <p><strong>SS Treatment = {defaultFmt(ssTr)}</strong>, df = t − 1 = {dfTr}, MS = {defaultFmt(rowOf('Treatment')?.ms ?? NaN)}.</p>
      </>,
    },
    {
      title: 'SS Error — galat murni',
      content: <>
        <p>Sisa variasi di dalam grup adalah galat murni, diperoleh dari identitas dekomposisi variasi.</p>
        <div className="calc-formula-line"><Formula tex={String.raw`SS_{\text{Error}}=SS_{\text{Total}}-SS_{\text{Treatment}}`} display /></div>
        <div className="calc-substitution">{defaultFmt(ssTotal)} − {defaultFmt(ssTr)} = {defaultFmt(ssErr)}</div>
        <p><strong>SS Error = {defaultFmt(ssErr)}</strong>, df = N − t = {dfErr}, MS Error = {defaultFmt(computed.result.errorMs)}.</p>
        <span className="chip" data-tone="ok">Identitas terpenuhi: SS Total = SS Treatment + SS Error</span>
      </>,
    },
    {
      title: 'Tabel ANOVA & uji F',
      content: <>
        <StatTable
          rows={computed.result.rows}
          caption={`Tabel ANOVA CRD — α = ${defaultFmt(alpha)}`}
          decision={{ label: computed.result.rejected ? 'Tolak H₀' : 'Gagal tolak H₀', accepted: !computed.result.rejected }}
        />
        <div className="calc-chip-row">
          <span className="chip">F-hitung = {defaultFmt(fStat)}</span>
          <span className="chip">F-kritis({dfTr}, {dfErr}) = {defaultFmt(fCrit)}</span>
          <span className="chip" data-tone={pVal < alpha ? 'danger' : 'ok'}>p = {formatP(pVal)}</span>
        </div>
      </>,
    },
    {
      title: 'Uji lanjut Fisher LSD',
      content: <>
        <p>Bila H₀ ditolak, LSD membandingkan pasangan rata-rata satu per satu. Nilai LSD dihitung ulang untuk tiap pasangan bila replikasi tidak sama.</p>
        <div className="calc-formula-line"><Formula tex={String.raw`LSD_{ab}=t_{\alpha/2,\nu}\sqrt{MS_E\left(\frac{1}{n_a}+\frac{1}{n_b}\right)}`} display /></div>
        <div className="calc-result-grid">
          <Kpi label="df Error" value={String(computed.lsd.dfError)} />
          <Kpi label="MS Error" value={defaultFmt(computed.lsd.msError)} />
        </div>
        <div className="calc-scroll">
          <table className="calc-tight-table">
            <caption>Pasangan perlakuan · α = {defaultFmt(computed.lsd.alpha)}</caption>
            <thead><tr><th scope="col">Pasangan</th><th scope="col">Selisih</th><th scope="col">LSD</th><th scope="col">Kesimpulan</th></tr></thead>
            <tbody>
              {computed.lsd.pairs.map((pair, i) => (
                <tr key={i} className={pair.significant ? 'significant' : undefined}>
                  <td>P{pair.a + 1} vs P{pair.b + 1}</td>
                  <td>{defaultFmt(pair.diff)}</td>
                  <td>{defaultFmt(pair.lsd)}</td>
                  <td>{pair.significant ? 'Berdifferensi nyata' : 'Tidak nyata'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>,
    },
    {
      title: 'Keputusan & interpretasi',
      content: <>
        <p className="calc-step-conclusion">{computed.result.conclusion}</p>
        <Notice tone="info" title="Sebelum dipakai untuk kesimpulan">
          Periksa asumsi: residual berdistribusi mendekati normal dan variansi homogen antar perlakuan. Q-Q plot di samping memberi gambaran visual normalitas.
        </Notice>
      </>,
    },
  ] : [{
    title: 'Menunggu data yang valid',
    content: <Notice tone="error" title="Perhitungan ditunda">Lengkapi semua input sampai pesan validasi hilang. Angka yang belum diisi ditandai merah.</Notice>,
  }];

  return (
    <CalculatorFrame
      title="CRD · ANOVA Satu Arah"
      subtitle="Bandingkan beberapa perlakuan secara bersamaan, lalu telusuri setiap langkah dekomposisi variasi hingga uji lanjut Fisher LSD."
      moduleId="m2"
      presets={PRESETS}
      onPreset={applyPreset}
      actions={<CalcActions buildUrl={() => buildShareUrl({
        v: 1,
        module: 'crd',
        inputs: {
          t,
          reps,
          alpha,
          data: flattenMatrix(data.slice(0, t).map((row, i) => row.slice(0, Number.isFinite(reps[i]) ? reps[i] : 0))),
        },
      })} onReset={reset} />}
    >
      <div className="bento">
        <section className="card calc-panel span-12">
          <div className="calc-toolbar">
            <NumberField id="crd-t" label="Jumlah perlakuan (t)" value={t} onChange={changeT} min={2} max={6} step={1} hint="Antara 2 sampai 6 perlakuan." />
            <NumberField id="crd-alpha" label="Taraf signifikansi (α)" value={alpha} onChange={(v) => setAlpha(Number.isFinite(v) ? Math.min(0.2, Math.max(0.01, v)) : 0.05)} min={0.01} max={0.2} step={0.01} />
            <div className="calc-field" style={{ flex: '1 1 220px' }}>
              <label htmlFor="crd-alpha-range">Pengeser α</label>
              <input id="crd-alpha-range" className="calc-slider" type="range" min={0.01} max={0.2} step={0.01}
                value={Number.isFinite(alpha) ? alpha : 0.05}
                onChange={(e) => setAlpha(Number(e.target.value))}
                aria-valuetext={`Alfa ${defaultFmt(alpha)}`} />
              <div className="calc-slider-scale"><span>0,01</span><span>0,20</span></div>
            </div>
          </div>

          <div className="calc-toolbar" aria-label="Replikasi tiap perlakuan">
            {Array.from({ length: t }, (_, i) => (
              <NumberField key={i} id={`crd-rep-${i}`} label={`Replikasi P${i + 1}`} value={reps[i] ?? NaN}
                onChange={(v) => changeRep(i, v)} min={1} max={20} step={1} suffix="ulangan" />
            ))}
          </div>

          <h3>Data pengamatan</h3>
          <p className="calc-hint" style={{ marginBottom: '0.5rem' }}>Ketik langsung ke sel. Baris = perlakuan, kolom = replikasi.</p>
          <NumberMatrix
            idPrefix="crd-data"
            matrix={data.slice(0, t).map((row, i) => row.slice(0, Number.isFinite(reps[i]) ? reps[i] : 4))}
            onChange={changeCell}
            rowLabels={Array.from({ length: t }, (_, i) => `P${i + 1}`)}
            colLabels={Array.from({ length: Math.max(...reps.slice(0, t).map((v) => Number.isFinite(v) ? v : 4)) }, (_, j) => `R${j + 1}`)}
            cornerLabel="Data waktu pengeringan (menit)"
            invalid={(r, c) => !Number.isFinite(data[r]?.[c])}
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

        {computed && (
          <section className="card calc-panel span-12">
            <div className="calc-result-grid cols-3">
              <Kpi label="Total pengamatan (N)" value={String(totalN)} />
              <Kpi label="Rata-rata besar (ȳ)" value={defaultFmt(grandMean)} />
              <Kpi label="F-hitung" value={defaultFmt(fStat)} />
              <Kpi label="F-kritis" value={defaultFmt(fCrit)} />
              <Kpi label="p-value" value={formatP(pVal)} />
              <Kpi label="Keputusan" value={computed.result.rejected ? 'Tolak H₀' : 'Gagal tolak H₀'} />
            </div>
          </section>
        )}

        <section className="card calc-panel span-8"><RevealSteps id="crd-anova" steps={steps} /></section>

        {computed && (
          <aside className="card calc-panel span-4">
            <h3>Diagnostik residual</h3>
            <ResidualQQ
              residuals={residuals}
              caption="Titik yang rapat mengikuti garis putus-putus mendukung asumsi normalitas residual. Penyimpangan sistematis di ujung dapat menandakan outlier."
            />
            <Notice tone="info">Residual dihitung sebagai selisih pengamatan terhadap rata-rata perlakuan masing-masing.</Notice>
          </aside>
        )}
      </div>
    </CalculatorFrame>
  );
}
