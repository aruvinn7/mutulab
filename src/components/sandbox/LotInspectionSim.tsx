import { useEffect, useId, useMemo, useState } from 'react';
import { seededRandom } from '../../lib/storage';
import { samplingPlan } from '../../lib/calc-core';
import OcCurve from '../sampling/OcCurve';
import { paAt, fmtPct } from '../sampling/sampling-utils';
import './sandbox.css';

/** Simulasi inspeksi lot: p cacat, n, c → animasi keputusan + kurva OC kecil. */
export default function LotInspectionSim() {
  const uid = useId().replace(/:/g, '');
  const [pPct, setPPct] = useState(5);
  const [n, setN] = useState(40);
  const [c, setC] = useState(2);
  const [seedBase, setSeedBase] = useState(1234);
  const [seen, setSeen] = useState(0);

  const p = pPct / 100;
  const effC = Math.min(c, n);

  const items = useMemo(() => {
    const rand = seededRandom(seedBase + Math.round(pPct * 10) * 7 + n * 3 + c * 11);
    return Array.from({ length: n }, () => rand() < p);
  }, [pPct, n, c, seedBase, p]);

  const plan = useMemo(() => {
    try { return samplingPlan({ n, c: effC, distribution: 'binomial' }); } catch { return null; }
  }, [n, effC]);

  const pa = plan ? paAt(plan.points, p) : NaN;
  const defects = items.slice(0, seen).filter(Boolean).length;
  const done = seen >= n;
  const finalDefects = items.filter(Boolean).length;
  const accepted = finalDefects <= effC;

  useEffect(() => {
    setSeen(0);
    const step = Math.max(1, Math.ceil(n / 26));
    const id = window.setInterval(() => {
      setSeen((s) => {
        if (s + step >= n) { window.clearInterval(id); return n; }
        return s + step;
      });
    }, 34);
    return () => window.clearInterval(id);
  }, [n, pPct, c, seedBase, items]);

  const progress = n > 0 ? (seen / n) * 100 : 0;

  return (
    <section className="sbx-card span-6" aria-labelledby={`${uid}-title`}>
      <div className="sbx-head">
        <h3 className="sbx-title" id={`${uid}-title`}>Simulator Inspeksi Lot</h3>
        <span className="sbx-tag">Modul 0 · sampling</span>
      </div>
      <p className="sbx-sub">Geser proporsi cacat, ukuran sampel, dan angka penerimaan. Setiap perubahan memeriksa lot baru secara animasi—tanpa tombol hitung.</p>

      <div className="sbx-body">
        <div className="sbx-control">
          <label htmlFor={`${uid}-p`}>Proporsi cacat lot p <output>{pPct.toFixed(1).replace('.', ',')}%</output></label>
          <input id={`${uid}-p`} className="sbx-range" type="range" min="0" max="30" step="0.5" value={pPct} onChange={(e) => setPPct(Number(e.target.value))} />
        </div>
        <div className="sbx-split">
          <div className="sbx-body">
            <div className="sbx-control">
              <label htmlFor={`${uid}-n`}>Ukuran sampel n <output>{n}</output></label>
              <input id={`${uid}-n`} className="sbx-range" type="range" min="10" max="100" step="5" value={n} onChange={(e) => setN(Number(e.target.value))} />
            </div>
            <div className="sbx-control">
              <label htmlFor={`${uid}-c`}>Angka penerimaan c <output>{c}</output></label>
              <input id={`${uid}-c`} className="sbx-range" type="range" min="0" max="10" step="1" value={c} onChange={(e) => setC(Number(e.target.value))} />
            </div>
            <button type="button" className="sbx-btn" onClick={() => setSeedBase((s) => s + 977)}>Undi lot baru ↻</button>
          </div>
          <div className="sbx-panel">
            <h4>Progres inspeksi</h4>
            <div className="sbx-scan" role="progressbar" aria-label="Progres inspeksi" aria-valuenow={seen} aria-valuemin={0} aria-valuemax={n}>
              <i style={{ width: `${progress}%` }} />
            </div>
            <div className="sbx-items" aria-hidden="true">
              {items.map((bad, i) => (
                <span key={i} className="sbx-item" data-bad={bad} data-seen={i < seen} style={{ opacity: i < seen ? 1 : 0.28 }} />
              ))}
            </div>
            <div className="sbx-note" data-tone={done ? (accepted ? 'ok' : 'danger') : 'warn'}>
              {done ? (
                <>Selesai: <strong>{finalDefects} cacat</strong> dari {n} unit. {accepted ? 'd ≤ c → lot DITERIMA.' : 'd &gt; c → lot DITOLAK.'}</>
              ) : (
                <>Memeriksa… {seen}/{n} unit · cacat ditemukan: <strong>{defects}</strong> (batas c = {effC}).</>
              )}
            </div>
            <p className="sbx-hint" style={{ marginTop: '.55rem' }}>Peluang terima teoritis pada p = {fmtPct(p, 1)}% adalah <strong>{fmtPct(pa, 1)}%</strong>.</p>
          </div>
        </div>

        <div className="sbx-panel">
          <h4>Kurva OC kecil</h4>
          {plan ? (
            <OcCurve compact points={plan.points} marker={{ p, pa, label: 'lot ini', color: '#f5a524' }} />
          ) : <p className="sbx-hint">Kurva belum tersedia.</p>}
          <div className="sbx-legend" aria-hidden="true">
            <span className="sbx-legend-item"><span className="sbx-swatch" style={{ background: '#2f6bff' }} /> Pa(p)</span>
            <span className="sbx-legend-item"><span className="sbx-swatch" style={{ background: '#f5a524', borderRadius: '50%' }} /> posisi lot saat ini</span>
            <span className="sbx-legend-item">merah = unit cacat</span>
          </div>
        </div>
      </div>
      <p className="sr-only">Simulasi inspeksi: {finalDefects} cacat dari {n} unit, batas c = {effC}. Lot {accepted ? 'diterima' : 'ditolak'}.</p>
    </section>
  );
}
