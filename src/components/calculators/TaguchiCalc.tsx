import { useMemo, useState } from 'react';
import CalculatorFrame from '../ui/CalculatorFrame';
import RevealSteps from '../ui/RevealSteps';
import Formula from '../ui/Formula';
import { defaultFmt } from '../ui/StatTable';
import { taguchiAnalysis } from '../../lib/calc-core';
import type { Preset, SnCharacteristic } from '../../lib/types';
import { getArray, columnsOf, initialObservations, ORTHOGONAL_ARRAYS, type ArrayKey } from '../taguchi/arrays';
import MainEffectsChart from '../taguchi/MainEffectsChart';
import LossChart from '../taguchi/LossChart';
import '../taguchi/taguchi.css';

const CHARACTERISTICS: { key: SnCharacteristic; label: string; short: string }[] = [
  { key: 'smaller', label: 'Smaller-the-better', short: 'Semi kecil · minimum' },
  { key: 'larger', label: 'Larger-the-better', short: 'Semi besar · maksimum' },
  { key: 'nominal', label: 'Nominal-the-best', short: 'Mendekati target' },
];

const TEX: Record<SnCharacteristic, string> = {
  smaller: String.raw`\mathrm{S/N}=-10\log_{10}\!\left(\frac{1}{n}\sum_{i=1}^{n}y_i^{2}\right)`,
  larger: String.raw`\mathrm{S/N}=-10\log_{10}\!\left(\frac{1}{n}\sum_{i=1}^{n}\frac{1}{y_i^{2}}\right)`,
  nominal: String.raw`\mathrm{S/N}=10\log_{10}\!\left(\frac{\bar y^{2}}{s^{2}}\right)`,
};

const PRESETS: Preset[] = [
  {
    id: 'tg-cacat-lapisan',
    judul: 'Cacat lapisan cat (L4 · smaller)',
    modul: 'm5',
    kategori: 'dasar',
    parameter: { array: 'L4', characteristic: 'smaller', factorCount: 2, replicates: 2 },
    data: [[4.2, 4.6], [3.1, 3.4], [2.6, 2.9], [1.8, 2.0]],
    tujuan_ajar: 'Menentukan kombinasi suhu dan waktu pengeringan yang meminimalkan cacat.',
    pertanyaan_pemantik: ['Faktor mana yang paling curam grafik efek utamanya?', 'Mengapa S/N lebih aman daripada sekadar rata-rata cacat?'],
  },
  {
    id: 'tg-daya-tahan',
    judul: 'Daya tahan baterai (L8 · larger)',
    modul: 'm5',
    kategori: 'efek',
    parameter: { array: 'L8', characteristic: 'larger', factorCount: 3, replicates: 2 },
    data: [[120, 126], [134, 138], [141, 139], [128, 131], [150, 153], [145, 142], [133, 130], [148, 151]],
    tujuan_ajar: 'Membaca tabel respon L8 untuk memaksimalkan siklus pakai baterai.',
    pertanyaan_pemantik: ['Level berapa yang optimal untuk faktor Konsentrasi?', 'Apa bedanya Delta dan Rank pada tabel respon?'],
  },
  {
    id: 'tg-diameter-presisi',
    judul: 'Diameter busa presisi (L9 · nominal)',
    modul: 'm5',
    kategori: 'efek',
    parameter: { array: 'L9', characteristic: 'nominal', factorCount: 2, replicates: 2, target: 25 },
    data: [[25.1, 24.9], [25.3, 25.0], [24.7, 24.8], [25.2, 25.1], [24.9, 25.0], [25.4, 25.2], [24.8, 24.9], [25.0, 25.1], [25.3, 25.2]],
    tujuan_ajar: 'Mengoptimalkan parameter agar diameter mendekati target 25,0 mm dengan variansi kecil.',
    pertanyaan_pemantik: ['Mengapa target wajib diisi pada karakteristik nominal?', 'Apakah level dengan rata-rata terbaik selalu yang terbaik?'],
  },
];

function num(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function resizeObservations(old: number[][], rows: number, reps: number): number[][] {
  return Array.from({ length: rows }, (_, r) =>
    Array.from({ length: reps }, (_, c) => {
      const existing = old[r]?.[c];
      return Number.isFinite(existing) ? existing : Number((40 + ((r * 7 + c * 3) % 13)).toFixed(2));
    }),
  );
}

export default function TaguchiCalc() {
  const [arrayKey, setArrayKey] = useState<ArrayKey>('L4');
  const [characteristic, setCharacteristic] = useState<SnCharacteristic>('smaller');
  const [target, setTarget] = useState(50);
  const [factorCount, setFactorCount] = useState(2);
  const [replicates, setReplicates] = useState(2);
  const [factorNames, setFactorNames] = useState<string[]>(['A', 'B']);
  const [observations, setObservations] = useState<number[][]>(() => initialObservations(getArray('L4'), 2));
  const [k, setK] = useState(0.5);
  const [actualY, setActualY] = useState(50);

  const oa = getArray(arrayKey);
  const columns = useMemo(() => columnsOf(oa, factorCount), [oa, factorCount]);

  const targetValid = characteristic !== 'nominal' || (Number.isFinite(target) && target > 0);
  const dataValid = observations.length === oa.rows.length &&
    observations.every((row) => row.length === replicates && row.every((v) => Number.isFinite(v)));

  const result = useMemo(() => {
    if (!dataValid || !targetValid) return null;
    try {
      return taguchiAnalysis(columns, observations, characteristic, characteristic === 'nominal' ? target : undefined);
    } catch {
      return null;
    }
  }, [columns, observations, characteristic, target, dataValid, targetValid]);

  function switchArray(key: ArrayKey) {
    const next = getArray(key);
    const count = Math.min(factorCount, next.maxFactors);
    setArrayKey(key);
    setFactorCount(count);
    setFactorNames(next.defaultNames.slice(0, count));
    setObservations(initialObservations(next, replicates));
  }

  function changeReplicates(next: number) {
    setReplicates(next);
    setObservations((old) => resizeObservations(old, oa.rows.length, next));
  }

  function setObservation(r: number, c: number, raw: string) {
    setObservations((old) => old.map((row, ri) => row.map((v, ci) => (ri === r && ci === c ? (raw === '' ? NaN : Number(raw)) : v))));
  }

  function applyPreset(p: Preset) {
    const key = (String(p.parameter.array ?? 'L4') as ArrayKey);
    const next = getArray(key);
    const count = Math.min(num(p.parameter.factorCount, 2), next.maxFactors);
    const reps = Math.max(1, num(p.parameter.replicates, 2));
    const ch = (String(p.parameter.characteristic ?? 'smaller') as SnCharacteristic);
    const data = Array.isArray(p.data) ? (p.data as number[][]) : [];
    setArrayKey(key);
    setFactorCount(count);
    setReplicates(reps);
    setCharacteristic(ch);
    setTarget(num(p.parameter.target, 25));
    const presetNames = key === 'L4' ? ['Suhu', 'Waktu']
      : key === 'L8' ? ['Konsentrasi', 'Suhu', 'Waktu']
        : ['Tekanan', 'Kecepatan'];
    setFactorNames(presetNames.slice(0, count));
    setObservations(resizeObservations(data, next.rows.length, reps));
    setActualY(num(p.parameter.target, 25));
  }

  const ratios = result?.sn.ratios ?? [];
  const etaBar = ratios.length ? ratios.reduce((a, b) => a + b, 0) / ratios.length : 0;
  const gains = result?.response.map((r) => Math.max(...r.levels) - etaBar) ?? [];
  const optimalLabels = result?.response.map((r, i) => `${factorNames[i] ?? r.factor} L${r.optimalLevel}`).join(' · ') ?? '—';

  const steps = [
    {
      title: 'Pilih karakteristik mutu',
      content: (
        <div>
          <p>Karakteristik menentukan bentuk rasio S/N. Pilih sesuai tujuan respons:</p>
          <div className="tg-formula-box"><Formula tex={TEX[characteristic]} display /></div>
          <p className="tg-card-note">{CHARACTERISTICS.find((c) => c.key === characteristic)?.short}. S/N dinyatakan dalam desibel (dB); makin besar makin baik, apa pun karakteristiknya.</p>
        </div>
      ),
    },
    {
      title: 'Hitung S/N untuk setiap baris matriks',
      content: (
        <div>
          <p>
            Setiap baris orthogonal array (OA) diperlakukan sebagai satu kombinasi level. Nilai S/N menggabungkan
            seluruh <strong>{replicates} replikasi</strong> menjadi satu ukuran ketangguhan:
          </p>
          <div className="tg-formula-box">
            <Formula tex={String.raw`\eta_j=\mathrm{S/N}_j\quad (j=1,\ldots,${oa.rows.length})`} display />
          </div>
          <p className="tg-card-note">Rasio S/N membawa informasi rata-rata sekaligus variansi, sehingga mendekati target tanpa terlalu dipengaruhi gangguan.</p>
        </div>
      ),
    },
    {
      title: 'Susun tabel respon, Delta, dan Rank',
      content: (
        <div>
          <p>Untuk tiap faktor dan tiap level, rata-rata seluruh nilai S/N pada baris yang memakai level itu dihitung.</p>
          <div className="tg-formula-box">
            <Formula tex={String.raw`\bar\eta_{i,l}=\frac{1}{m}\sum_{j:\,\mathrm{OA}_{j,i}=l}\eta_j`} display />
          </div>
          <p><strong>Delta</strong> = level tertinggi − level terendah. <strong>Rank 1</strong> diberikan kepada Delta terbesar: itulah faktor paling berpengaruh.</p>
        </div>
      ),
    },
    {
      title: 'Tentukan level optimal dan prediksi',
      content: (
        <div>
          <p>Level optimal tiap faktor adalah level dengan rata-rata S/N tertinggi. Prediksi respon optimal:</p>
          <div className="tg-formula-box">
            <Formula tex={String.raw`\hat\eta_{\mathrm{opt}}=\bar\eta+\sum_i\left(\bar\eta_{i,\mathrm{opt}}-\bar\eta\right)`} display />
          </div>
          <p className="tg-card-note">
            η̄ = {defaultFmt(etaBar)} dB · jumlah perbaikan = {defaultFmt(gains.reduce((a, b) => a + b, 0))} dB ·
            prediksi η_opt = <strong>{result ? defaultFmt(result.predicted) : '—'} dB</strong>.
          </p>
        </div>
      ),
    },
    {
      title: 'Fungsi kerugian kualitas',
      content: (
        <div>
          <p>Taguchi menyatakan penyimpangan dari target tetap menimbulkan biaya, meski masih dalam spesifikasi:</p>
          <div className="tg-formula-box"><Formula tex={String.raw`L(y)=k\,(y-m)^{2}`} display /></div>
          <p className="tg-card-note">Geser slider k pada kartu fungsi kerugian untuk melihat bagaimana skala biaya mengubah bentuk kurva.</p>
        </div>
      ),
    },
  ];

  return (
    <CalculatorFrame
      title="Taguchi · Rasio S/N & Desain Tangguh"
      subtitle="Pilih orthogonal array, tentukan karakteristik mutu, lalu baca level optimal dari tabel respon S/N."
      moduleId="m5"
      presets={PRESETS}
      onPreset={applyPreset}
      actions={<span className="chip">Tabel Respon S/N</span>}
    >
      <div className="tg-grid">
        <section className="tg-card span-4" aria-labelledby="tg-design-title">
          <div className="tg-card-head"><h2 className="tg-card-title" id="tg-design-title">Rancangan eksperimen</h2></div>

          <p className="tg-label">Orthogonal Array</p>
          <div className="tg-seg" role="group" aria-label="Pilih orthogonal array">
            {ORTHOGONAL_ARRAYS.map((a) => (
              <button key={a.key} type="button" aria-pressed={arrayKey === a.key} onClick={() => switchArray(a.key)}>{a.label}</button>
            ))}
          </div>

          <div className="tg-controls" style={{ marginTop: '1rem' }}>
            <div className="tg-field">
              <label htmlFor="tg-factors">Jumlah faktor</label>
              <select id="tg-factors" value={factorCount} onChange={(e) => {
                const n = Math.min(Number(e.target.value), oa.maxFactors);
                setFactorCount(n);
                setFactorNames((old) => Array.from({ length: n }, (_, i) => old[i] ?? oa.defaultNames[i] ?? `Faktor ${i + 1}`));
              }}>
                {Array.from({ length: oa.maxFactors }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n} faktor</option>)}
              </select>
            </div>
            <div className="tg-field">
              <label htmlFor="tg-reps">Replikasi</label>
              <select id="tg-reps" value={replicates} onChange={(e) => changeReplicates(Math.max(1, Math.min(4, Number(e.target.value))))}>
                {[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n}× per baris</option>)}
              </select>
            </div>
            {characteristic === 'nominal' && (
              <div className="tg-field">
                <label htmlFor="tg-target">Target m</label>
                <input id="tg-target" type="number" step="any" value={target} onChange={(e) => setTarget(Number(e.target.value))} />
              </div>
            )}
          </div>

          <div className="tg-names">
            {factorNames.slice(0, factorCount).map((name, i) => (
              <div className="tg-field" key={i}>
                <label htmlFor={`tg-name-${i}`}>Nama faktor {String.fromCharCode(65 + i)}</label>
                <input id={`tg-name-${i}`} type="text" value={name} maxLength={18}
                  onChange={(e) => setFactorNames((old) => old.map((v, j) => (j === i ? e.target.value : v)))} />
              </div>
            ))}
          </div>

          <p className="tg-label" style={{ marginTop: '1rem' }}>Karakteristik S/N</p>
          <div className="tg-seg" role="group" aria-label="Pilih karakteristik signal-to-noise">
            {CHARACTERISTICS.map((c) => (
              <button key={c.key} type="button" aria-pressed={characteristic === c.key} onClick={() => setCharacteristic(c.key)}>{c.label}</button>
            ))}
          </div>
          <p className="tg-card-note">{CHARACTERISTICS.find((c) => c.key === characteristic)?.short} · {oa.rows.length} percobaan × {replicates} replikasi = {oa.rows.length * replicates} observasi.</p>
        </section>

        <section className="tg-card span-8" aria-labelledby="tg-matrix-title">
          <div className="tg-card-head">
            <h2 className="tg-card-title" id="tg-matrix-title">Matriks observasi &amp; rasio S/N</h2>
            <span className="tg-badge">OA {arrayKey}</span>
          </div>
          {!dataValid && <div className="tg-hint" data-tone="warn">Lengkapi seluruh sel observasi dengan angka valid sebelum hasil ditampilkan.</div>}
          {!targetValid && <div className="tg-hint" data-tone="warn">Target untuk karakteristik nominal harus lebih besar dari 0.</div>}
          <div className="tg-table-wrap">
            <table className="data-table">
              <caption className="sr-only">Matriks orthogonal array beserta nilai observasi dan rasio S/N per baris</caption>
              <thead>
                <tr>
                  <th scope="col">Baris</th>
                  {factorNames.slice(0, factorCount).map((name, i) => <th scope="col" key={i}>{name || `Faktor ${i + 1}`}</th>)}
                  {Array.from({ length: replicates }, (_, c) => <th scope="col" key={`r${c}`}>Rep {c + 1}</th>)}
                  <th scope="col">S/N (dB)</th>
                </tr>
              </thead>
              <tbody>
                {columns.map((row, ri) => (
                  <tr key={ri}>
                    <td>#{ri + 1}</td>
                    {row.map((lvl, ci) => <td key={ci}>L{lvl}</td>)}
                    {Array.from({ length: replicates }, (_, c) => (
                      <td key={c}>
                        <input className="tg-num-input" type="number" step="any" aria-label={`Observasi baris ${ri + 1} replikasi ${c + 1}`}
                          value={Number.isFinite(observations[ri]?.[c]) ? observations[ri][c] : ''}
                          onChange={(e) => setObservation(ri, c, e.target.value)} />
                      </td>
                    ))}
                    <td><strong className="mono">{ratios[ri] !== undefined && Number.isFinite(ratios[ri]) ? defaultFmt(ratios[ri]) : '—'}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="tg-card-note">Ubah angka pada tabel untuk menghitung ulang secara instan. Barisan dengan S/N tertinggi ditandai pada tabel respon di bawah.</p>
        </section>

        <section className="tg-card span-12" aria-label="Ringkasan hasil Taguchi">
          <div className="tg-kpis">
            <div className="tg-kpi"><span>Level optimal</span><strong style={{ fontSize: 'calc(0.95rem * var(--teach-scale))' }}>{optimalLabels}</strong></div>
            <div className="tg-kpi" data-tone="ok"><span>Prediksi η_opt</span><strong>{result ? defaultFmt(result.predicted) : '—'} dB</strong></div>
            <div className="tg-kpi"><span>Rata-rata η̄</span><strong>{defaultFmt(etaBar)} dB</strong></div>
            <div className="tg-kpi"><span>Total observasi</span><strong>{oa.rows.length * replicates}</strong></div>
          </div>
        </section>

        <section className="tg-card span-7" aria-labelledby="tg-response-title">
          <div className="tg-card-head">
            <h2 className="tg-card-title" id="tg-response-title">Tabel respon S/N</h2>
            <span className="tg-card-tag">Delta &amp; Rank</span>
          </div>
          {result ? (
            <div className="tg-table-wrap">
              <table className="data-table">
                <caption className="sr-only">Rata-rata rasio S/N per level, Delta, peringkat, dan level optimal</caption>
                <thead>
                  <tr>
                    <th scope="col">Faktor</th>
                    {Array.from({ length: oa.levels }, (_, i) => <th scope="col" key={i}>Level {i + 1}</th>)}
                    <th scope="col">Delta</th><th scope="col">Rank</th><th scope="col">Optimal</th>
                  </tr>
                </thead>
                <tbody>
                  {result.response.map((r, i) => (
                    <tr key={i}>
                      <td>{factorNames[i] ?? r.factor}</td>
                      {r.levels.map((v, li) => <td key={li}>{Number.isFinite(v) ? defaultFmt(v) : '—'}</td>)}
                      <td>{defaultFmt(r.delta)}</td>
                      <td><span className="tg-badge">{r.rank}</span></td>
                      <td><span className="tg-badge" data-tone="ok">L{r.optimalLevel}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="tg-card-note">Tabel respon akan muncul setelah seluruh observasi valid.</p>}
          <p className="tg-card-note">Delta besar berarti faktor itu sensitif terhadap gangguan: prioritaskan level optimalnya untuk membuat proses lebih tangguh.</p>
        </section>

        <section className="tg-card span-5" aria-labelledby="tg-opt-title">
          <div className="tg-card-head"><h2 className="tg-card-title" id="tg-opt-title">Interpretasi</h2></div>
          <div className="tg-callout">
            <div>
              <p className="tg-label">Kombinasi terbaik</p>
              <strong>{optimalLabels}</strong>
            </div>
          </div>
          <p className="tg-card-note" style={{ marginTop: '.9rem' }}>
            Prediksi <strong>η_opt = {result ? defaultFmt(result.predicted) : '—'} dB</strong> diperoleh dari η̄ ditambah
            keuntungan tiap faktor pada level terbaiknya. Nilai ini adalah estimasi pada kondisi tanpa interaksi
            yang signifikan—validasi dengan percobaan konfirmasi tetap disarankan.
          </p>
          <div className="tg-hint" style={{ marginTop: '.8rem' }}>
            Ingat: S/N tertinggi berarti paling tangguh, bukan selalu nilai respon tertinggi. Pada <em>smaller-the-better</em>,
            respon justru serendah mungkin.
          </div>
        </section>

        <section className="tg-card span-12" aria-labelledby="tg-effects-title">
          <div className="tg-card-head">
            <h2 className="tg-card-title" id="tg-effects-title">Visualisasi efek utama S/N</h2>
            <span className="tg-card-tag">Main effects plot</span>
          </div>
          {result ? <MainEffectsChart response={result.response} factorNames={factorNames} /> : <p className="tg-card-note">Grafik tersedia setelah perhitungan berhasil.</p>}
        </section>

        <section className="tg-card span-12" aria-labelledby="tg-loss-title">
          <div className="tg-card-head">
            <h2 className="tg-card-title" id="tg-loss-title">Fungsi kerugian kualitas</h2>
            <span className="tg-card-tag">L(y) = k(y − m)²</span>
          </div>
          <div className="tg-slider-row">
            <label htmlFor="tg-k">Konstanta biaya k <output>{defaultFmt(k)}</output></label>
            <input id="tg-k" className="tg-range" type="range" min="0.05" max="3" step="0.05" value={k} onChange={(e) => setK(Number(e.target.value))} />
          </div>
          <div className="tg-slider-row">
            <label htmlFor="tg-actual">Nilai aktual y <output>{defaultFmt(actualY)}</output></label>
            <input id="tg-actual" className="tg-range" type="range" min={target - Math.max(target * 0.35, 2)} max={target + Math.max(target * 0.35, 2)} step="0.1" value={Math.min(Math.max(actualY, target - Math.max(target * 0.35, 2)), target + Math.max(target * 0.35, 2))} onChange={(e) => setActualY(Number(e.target.value))} />
          </div>
          <LossChart k={k} target={target} actual={actualY} />
        </section>

        <section className="tg-card span-12" aria-labelledby="tg-steps-title">
          <div className="tg-card-head"><h2 className="tg-card-title" id="tg-steps-title">Langkah perhitungan</h2><span className="tg-card-tag">Buka bertahap</span></div>
          <RevealSteps id="taguchi-sn" steps={steps} />
        </section>
      </div>
    </CalculatorFrame>
  );
}
