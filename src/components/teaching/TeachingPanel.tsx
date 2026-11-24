import { useEffect, useState } from 'react';
import Formula from '../ui/Formula';
import RevealSteps from '../ui/RevealSteps';
import PresetHint from './PresetHint';
import TeachingBadge from './TeachingBadge';
import { PRESETS } from '../../data/presets';

const demoPreset = PRESETS.find((p) => p.id === 'm2-suhu-oven') ?? PRESETS[0];

/** Demo interaktif Mode Mengajar: toggle, efek skala +25%, board reveal, dan preset. */
export default function TeachingPanel() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () => setActive(document.documentElement.dataset.teaching === 'true');
    sync();
    window.addEventListener('mutulab:teaching', sync);
    window.addEventListener('mutulab:teaching:sync', sync);
    return () => {
      window.removeEventListener('mutulab:teaching', sync);
      window.removeEventListener('mutulab:teaching:sync', sync);
    };
  }, []);

  function apply(next: boolean) {
    document.documentElement.dataset.teaching = next ? 'true' : 'false';
    try {
      localStorage.setItem('mutulab.teaching', next ? '1' : '0');
      sessionStorage.setItem('mutulab.reveal.reset', '1');
    } catch {
      /* penyimpanan diblokir — tetap berlaku untuk sesi ini */
    }
    setActive(next);
    // Topbar menyinkronkan label tombolnya lewat event ini.
    window.dispatchEvent(new Event('mutulab:teaching:sync'));
  }

  const steps = [
    {
      title: 'Hipotesis',
      content: (
        <p>H₀: tidak ada perbedaan rata-rata kekuatan tarik antar level suhu oven; H₁: minimal satu level berbeda.</p>
      ),
    },
    {
      title: 'Dekomposisi variasi',
      content: (
        <>
          <p>Pisahkan total variasi menjadi komponen perlakuan dan galat.</p>
          <Formula tex={String.raw`SS_{\text{Total}} = SS_{\text{Perlakuan}} + SS_{\text{Error}}`} display />
        </>
      ),
    },
    {
      title: 'Statistik uji',
      content: (
        <>
          <p>Bagi tiap SS dengan derajat bebasnya, lalu ambil rasionya.</p>
          <Formula tex={String.raw`F = \frac{MS_{\text{Perlakuan}}}{MS_{\text{Error}}} = \frac{SS_{\text{Perlakuan}}/(a-1)}{SS_{\text{Error}}/(a(n-1))}`} display />
        </>
      ),
    },
    {
      title: 'Keputusan',
      content: <p>Tolak H₀ bila F-hitung &gt; F-kritis. Tombol <strong>Buka Semua</strong> menampilkan seluruh langkah sekaligus.</p>,
    },
  ];

  return (
    <div className="tp-demo">
      <div className="tp-toolbar glass-solid">
        <TeachingBadge />
        <button type="button" className="btn btn-primary" aria-pressed={active} onClick={() => apply(!active)}>
          {active ? 'Matikan Mode Mengajar' : 'Aktifkan Mode Mengajar'}
        </button>
        <span className="chip">Pintasan keyboard: <kbd>P</kbd></span>
      </div>

      <div className="tp-scale-demo card">
        <p className="eyebrow">Pratinjau skala tipografi</p>
        <p className="tp-sample">Pahami eksperimen. <em>Rancang kualitasnya.</em> — teks ini membesar 25% saat Mode Mengajar aktif.</p>
        <Formula tex={String.raw`\bar{y}_{i\cdot} = \frac{1}{n}\sum_{j=1}^{n} y_{ij}`} display />
        <p className="tp-note text-soft">
          Perubahannya langsung terlihat pada judul, isi, rumus, sel tabel, dan label grafik. Blur kaca dan animasi dimatikan agar kontras tetap tinggi di proyektor.
        </p>
      </div>

      <div className="tp-reveal">
        <p className="eyebrow">Board Reveal — coba keyboard → / Spasi / PageDown</p>
        <RevealSteps id="panduan-teaching-demo" steps={steps} />
      </div>

      <div className="tp-preset">
        <p className="eyebrow">Preset & pertanyaan pemantik</p>
        <PresetHint preset={demoPreset} defaultOpen />
      </div>
    </div>
  );
}
