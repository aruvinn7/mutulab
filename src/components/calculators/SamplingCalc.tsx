import { useMemo, useState } from 'react';
import CalculatorFrame from '../ui/CalculatorFrame';
import RevealSteps from '../ui/RevealSteps';
import Formula from '../ui/Formula';
import { samplingPlan } from '../../lib/calc-core';
import type { Preset } from '../../lib/types';
import OcCurve from '../sampling/OcCurve';
import AoqCurve from '../sampling/AoqCurve';
import { paAt, fmtPct, fmtProb } from '../sampling/sampling-utils';
import '../sampling/sampling.css';

type Distribution = 'binomial' | 'poisson';

const PRESETS: Preset[] = [
  {
    id: 'sp-komponen-elektronik',
    judul: 'Komponen elektronik (n=50, c=2)',
    modul: 'm0',
    kategori: 'dasar',
    parameter: { n: 50, c: 2, N: 2000, aql: 2, ltpd: 8, distribution: 'binomial' },
    data: [],
    tujuan_ajar: 'Membaca risiko produsen α dan risiko konsumen β dari kurva OC.',
    pertanyaan_pemantik: ['Apa yang terjadi pada β bila c diperbesar?', 'Mengapa kurva OC turun saat p naik?'],
  },
  {
    id: 'sp-kemasan-makanan',
    judul: 'Kemasan makanan (n=80, c=3)',
    modul: 'm0',
    kategori: 'efek',
    parameter: { n: 80, c: 3, N: 5000, aql: 1.5, ltpd: 6, distribution: 'poisson' },
    data: [],
    tujuan_ajar: 'Membandingkan pendekatan Poisson dengan Binomial untuk lot besar.',
    pertanyaan_pemantik: ['Kapan Poisson menjadi pendekatan yang baik?', 'Bagaimana AOQL berubah bila n diperbesar?'],
  },
  {
    id: 'sp-baut-m8',
    judul: 'Baut M8 (n=30, c=1)',
    modul: 'm0',
    kategori: 'dasar',
    parameter: { n: 30, c: 1, N: 1000, aql: 4, ltpd: 12, distribution: 'binomial' },
    data: [],
    tujuan_ajar: 'Mengevaluasi rencana sampling yang ketat dengan penerimaan maksimal satu cacat.',
    pertanyaan_pemantik: ['Berapa ATI jika semua lot diterima?', 'Apakah c=1 terlalu ketat untuk pemasok ini?'],
  },
];

function num(v: unknown, fallback: number): number {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function SamplingCalc() {
  const [n, setN] = useState(50);
  const [c, setC] = useState(2);
  const [N, setLot] = useState(2000);
  const [aqlPct, setAqlPct] = useState(2);
  const [ltpdPct, setLtpdPct] = useState(8);
  const [distribution, setDistribution] = useState<Distribution>('binomial');
  const [d, setD] = useState(1);

  const aql = aqlPct / 100;
  const ltpd = ltpdPct / 100;

  const valid = Number.isInteger(n) && n >= 1 &&
    Number.isInteger(c) && c >= 0 && c <= n &&
    Number.isFinite(N) && N >= n &&
    Number.isFinite(aql) && aql > 0 && aql < 1 &&
    Number.isFinite(ltpd) && ltpd > aql && ltpd < 1;

  const plan = useMemo(() => {
    if (!valid) return null;
    try {
      return samplingPlan({ n, c, N, aql, ltpd, distribution });
    } catch {
      return null;
    }
  }, [n, c, N, aql, ltpd, distribution, valid]);

  const paAql = plan ? paAt(plan.points, aql) : NaN;
  const paLtpd = plan ? paAt(plan.points, ltpd) : NaN;
  const alpha = 1 - paAql;
  const beta = paLtpd;
  const accepted = d <= c;

  function applyPreset(p: Preset) {
    setN(Math.max(1, Math.round(num(p.parameter.n, 50))));
    setC(Math.max(0, Math.round(num(p.parameter.c, 2))));
    setLot(Math.max(1, Math.round(num(p.parameter.N, 2000))));
    setAqlPct(num(p.parameter.aql, 2));
    setLtpdPct(num(p.parameter.ltpd, 8));
    setDistribution(String(p.parameter.distribution ?? 'binomial') as Distribution);
    setD(1);
  }

  const steps = [
    {
      title: 'Tentukan aturan penerimaan',
      content: (
        <div>
          <p>Rencana sampling tunggal didefinisikan oleh ukuran sampel <strong>n</strong> dan angka penerimaan <strong>c</strong>.</p>
          <ul className="sp-note" style={{ paddingLeft: '1.2rem', listStyle: 'disc' }}>
            <li>Ambil {n} unit secara acak dari lot berisi {N} unit.</li>
            <li>Hitung cacat d. Terima lot bila d ≤ {c}; tolak bila d &gt; {c}.</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Hitung peluang terima Pa(p)',
      content: (
        <div>
          <p>Peluang mendapat paling banyak c cacat bergantung pada distribusi yang dipilih:</p>
          <div className="sp-formula-box">
            <Formula tex={distribution === 'binomial'
              ? String.raw`P_a(p)=\sum_{i=0}^{c}\binom{n}{i}p^{i}(1-p)^{n-i}`
              : String.raw`P_a(p)=\sum_{i=0}^{c}\frac{e^{-np}(np)^{i}}{i!}`} display />
          </div>
          <p className="sp-note">Kurva OC memetakan Pa untuk setiap proporsi cacat p—semakin besar p, semakin kecil Pa.</p>
        </div>
      ),
    },
    {
      title: 'Baca risiko pada AQL & LTPD',
      content: (
        <div>
          <p><strong>AQL</strong> adalah mutu yang masih dianggap dapat diterima, sehingga Pa di AQL sebesar {fmtPct(paAql, 1)}% memberi risiko produsen α = {fmtPct(alpha, 1)}%.</p>
          <p style={{ marginTop: '.5rem' }}><strong>LTPD</strong> adalah batas cacat yang masih dapat ditoleransi; Pa di LTPD sebesar {fmtPct(paLtpd, 1)}% adalah risiko konsumen β.</p>
          <div className="sp-hint" style={{ marginTop: '.7rem' }}>
            Rencana yang baik membuat α kecil di AQL dan β kecil di LTPD. Keduanya biasanya ditukar-off dengan ukuran sampel.
          </div>
        </div>
      ),
    },
    {
      title: 'AOQ, ASN, dan ATI',
      content: (
        <div>
          <p>AOQ memperkirakan mutu rata-rata keluaran setelah unit cacat ditemukan dan diganti:</p>
          <div className="sp-formula-box"><Formula tex={String.raw`AOQ(p)\approx p\,P_a(p)`} display /></div>
          <div className="sp-formula-box"><Formula tex={String.raw`ATI=n+(1-P_a)(N-n)`} display /></div>
          <p className="sp-note">AOQL adalah nilai AOQ maksimum. Untuk sampling tunggal, ASN = n (konstan), sedangkan ATI naik ketika lot sering ditolak dan perlu diperiksa 100%.</p>
        </div>
      ),
    },
  ];

  return (
    <CalculatorFrame
      title="Acceptance Sampling · Kurva OC"
      subtitle="Rancang rencana sampling tunggal, baca risiko α/β pada AQL–LTPD, dan evaluasi AOQ, ASN, serta ATI."
      moduleId="m0"
      presets={PRESETS}
      onPreset={applyPreset}
      actions={<span className="chip">Binomial · Poisson</span>}
    >
      <div className="sp-grid">
        <section className="sp-card span-4" aria-labelledby="sp-plan-title">
          <div className="sp-card-head"><h2 className="sp-card-title" id="sp-plan-title">Parameter rencana</h2></div>
          {!valid && (
            <div className="sp-warn">
              Periksa input: n ≥ 1, 0 ≤ c ≤ n, lot N ≥ n, dan 0 &lt; AQL &lt; LTPD &lt; 100%.
            </div>
          )}
          <div className="sp-controls">
            <div className="sp-field"><label htmlFor="sp-n">Ukuran sampel n</label><input id="sp-n" type="number" min="1" max="1000" step="1" value={n} onChange={(e) => setN(Number(e.target.value))} /></div>
            <div className="sp-field"><label htmlFor="sp-c">Angka penerimaan c</label><input id="sp-c" type="number" min="0" max="1000" step="1" value={c} onChange={(e) => setC(Number(e.target.value))} /></div>
            <div className="sp-field"><label htmlFor="sp-N">Ukuran lot N</label><input id="sp-N" type="number" min="1" step="1" value={N} onChange={(e) => setLot(Number(e.target.value))} /></div>
            <div className="sp-field"><label htmlFor="sp-d">Cacat ditemukan d</label><input id="sp-d" type="number" min="0" step="1" value={d} onChange={(e) => setD(Number(e.target.value))} /></div>
            <div className="sp-field"><label htmlFor="sp-aql">AQL (%)</label><input id="sp-aql" type="number" min="0.01" max="99" step="0.1" value={aqlPct} onChange={(e) => setAqlPct(Number(e.target.value))} /></div>
            <div className="sp-field"><label htmlFor="sp-ltpd">LTPD (%)</label><input id="sp-ltpd" type="number" min="0.01" max="100" step="0.1" value={ltpdPct} onChange={(e) => setLtpdPct(Number(e.target.value))} /></div>
          </div>
          <p className="sp-label" style={{ marginTop: '1rem' }}>Distribusi</p>
          <div className="sp-seg" role="group" aria-label="Pilih distribusi probabilitas">
            <button type="button" aria-pressed={distribution === 'binomial'} onClick={() => setDistribution('binomial')}>Binomial</button>
            <button type="button" aria-pressed={distribution === 'poisson'} onClick={() => setDistribution('poisson')}>Poisson</button>
          </div>
          <div className="sp-decision" data-tone={accepted ? 'accept' : 'reject'}>
            <div>
              <p className="sp-label">Keputusan lot</p>
              <strong>{accepted ? 'Terima lot' : 'Tolak lot'}</strong>
            </div>
            <p>d = {d} {accepted ? '≤' : '&gt;'} c = {c}</p>
          </div>
        </section>

        <section className="sp-card span-8" aria-labelledby="sp-oc-title">
          <div className="sp-card-head">
            <h2 className="sp-card-title" id="sp-oc-title">Kurva Operating Characteristic</h2>
            <span className="sp-tag">interaktif · arahkan/Tab</span>
          </div>
          {plan ? (
            <OcCurve points={plan.points} aql={aql} ltpd={ltpd} paAql={paAql} paLtpd={paLtpd} />
          ) : <p className="sp-note">Kurva OC akan tampil setelah parameter valid.</p>}
          <div className="sp-legend" aria-hidden="true">
            <span className="sp-legend-item"><span className="sp-swatch" style={{ background: '#2f6bff' }} /> kurva Pa</span>
            <span className="sp-legend-item"><span className="sp-swatch" style={{ background: '#1fa971', borderRadius: '50%' }} /> titik AQL (lingkaran)</span>
            <span className="sp-legend-item"><span className="sp-swatch" style={{ background: '#e5484d', transform: 'rotate(45deg)' }} /> titik LTPD (belah ketupat)</span>
          </div>
        </section>

        <section className="sp-card span-4" aria-labelledby="sp-risk-title">
          <div className="sp-card-head"><h2 className="sp-card-title" id="sp-risk-title">Risiko &amp; titik mutu</h2></div>
          <div className="sp-kpis">
            <div className="sp-kpi"><span>Pa di AQL</span><strong>{fmtPct(paAql, 1)}%</strong></div>
            <div className="sp-kpi" data-tone="warn"><span>α · risiko produsen</span><strong>{fmtPct(alpha, 1)}%</strong></div>
            <div className="sp-kpi" data-tone="danger"><span>Pa di LTPD = β</span><strong>{fmtPct(beta, 1)}%</strong></div>
            <div className="sp-kpi"><span>AQL / LTPD</span><strong style={{ fontSize: 'calc(0.95rem * var(--teach-scale))' }}>{fmtPct(aql, 1)}% / {fmtPct(ltpd, 1)}%</strong></div>
          </div>
          <p className="sp-note">α dilengkapi dari 1 − Pa(AQL); β adalah Pa(LTPD). Keduanya terbaca dari kurva OC dengan interpolasi titik.</p>
        </section>

        <section className="sp-card span-4" aria-labelledby="sp-aoq-title">
          <div className="sp-card-head"><h2 className="sp-card-title" id="sp-aoq-title">AOQ &amp; AOQL</h2><span className="sp-tag">outgoing quality</span></div>
          {plan ? <AoqCurve aoq={plan.aoq} aoql={plan.aoql} /> : <p className="sp-note">Data AOQ belum tersedia.</p>}
          <p className="sp-note">AOQL = <strong>{fmtProb(plan?.aoql ?? NaN)}</strong> — mutu keluaran terburuk yang masih mungkin terjadi setelah inspeksi.</p>
        </section>

        <section className="sp-card span-4" aria-labelledby="sp-ati-title">
          <div className="sp-card-head"><h2 className="sp-card-title" id="sp-ati-title">ASN &amp; ATI</h2></div>
          <div className="sp-kpis">
            <div className="sp-kpi"><span>ASN</span><strong>{plan ? plan.asn.toLocaleString('id-ID') : '—'} unit</strong></div>
            <div className="sp-kpi"><span>ATI</span><strong>{plan ? plan.ati.toLocaleString('id-ID') : '—'} unit</strong></div>
          </div>
          <p className="sp-note" style={{ marginTop: '.8rem' }}>
            Pada sampling tunggal, ASN selalu sama dengan n ({n}). ATI memperhitungkan kemungkinan lot ditolak lalu
            diperiksa 100%, sehingga rata-rata unit yang diperiksa bisa melebihi n. Untuk lot besar (N ≫ n),
            pendekatan N − n ≈ N dipakai oleh calc-core, sehingga angka ATI dapat sedikit lebih tinggi dari rumus eksaknya.
          </p>
        </section>

        <section className="sp-card span-12" aria-labelledby="sp-steps-title">
          <div className="sp-card-head"><h2 className="sp-card-title" id="sp-steps-title">Langkah perhitungan</h2><span className="sp-tag">Buka bertahap</span></div>
          <RevealSteps id="sampling-oc" steps={steps} />
        </section>
      </div>
    </CalculatorFrame>
  );
}
