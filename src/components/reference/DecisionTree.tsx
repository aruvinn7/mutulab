import { useState } from 'react';
import { MODULES } from '../../data/site';

interface Option {
  label: string;
  next?: string;
  result?: string;
}

interface Node {
  question: string;
  hint?: string;
  options: Option[];
}

const NODES: Record<string, Node> = {
  start: {
    question: 'Apa tujuan utama kegiatan Anda?',
    options: [
      { label: 'Membandingkan perlakuan / mencari pengaturan terbaik', next: 'bandingkan' },
      { label: 'Menentukan terima–tolak lot atau menilai risiko inspeksi', result: 'sampling' },
      { label: 'Membuat proses tangguh terhadap faktor lingkungan / noise', result: 'taguchi' },
    ],
  },
  bandingkan: {
    question: 'Apakah ada sumber variasi pengganggu yang bisa dikenali dan diblokir?',
    hint: 'Contoh: batch bahan baku, shift operator, mesin, atau lokasi ruang.',
    options: [
      { label: 'Ya — saya bisa mengelompokkan percobaan per blok', result: 'rcbd' },
      { label: 'Tidak — kondisi percobaan relatif seragam', next: 'faktor' },
    ],
  },
  faktor: {
    question: 'Berapa faktor yang diubah secara bersamaan?',
    options: [
      { label: 'Satu faktor dengan beberapa level', result: 'crd' },
      { label: 'Dua atau lebih faktor sekaligus', result: 'faktorial' },
    ],
  },
};

const RESULTS: Record<string, { modul: string; judul: string; alasan: string }> = {
  crd: {
    modul: 'm2', judul: 'RAL / CRD + ANOVA satu arah',
    alasan: 'Satu faktor, kondisi seragam, dan tiap perlakuan diulang → SS Error langsung tersedia untuk uji F.',
  },
  rcbd: {
    modul: 'm3', judul: 'RCBD (Rancangan Acak Kelompok Lengkap)',
    alasan: 'Blok menyerap variasi pengganggu sehingga MS Error lebih kecil dan uji F lebih sensitif.',
  },
  faktorial: {
    modul: 'm4', judul: 'Desain Faktorial 2ᵏ + Yates',
    alasan: 'Mengubah beberapa faktor sekaligus mengungkap efek utama dan interaksi secara efisien.',
  },
  taguchi: {
    modul: 'm5', judul: 'Metode Taguchi + Orthogonal Array',
    alasan: 'Fokus pada ketangguhan: rasio S/N menilai rata-rata sekaligus variasi akibat faktor noise.',
  },
  sampling: {
    modul: 'm0', judul: 'Acceptance Sampling + Kurva OC',
    alasan: 'Keputusan lot berbasis sampel; OC, AOQ, dan ATI mengukur risiko produsen serta konsumen.',
  },
};

/** Pohon keputusan sederhana untuk memilih desain eksperimen (F-10). */
export default function DecisionTree() {
  const [nodeId, setNodeId] = useState('start');
  const [trail, setTrail] = useState<string[]>([]);
  const [result, setResult] = useState<string | null>(null);
  const node = NODES[nodeId];

  function choose(option: Option) {
    if (option.result) {
      setTrail((t) => [...t, nodeId]);
      setResult(option.result!);
      return;
    }
    if (option.next) {
      setTrail((t) => [...t, nodeId]);
      setNodeId(option.next);
    }
  }

  function back() {
    if (result) {
      setResult(null);
      setNodeId(trail[trail.length - 1] ?? 'start');
      setTrail((t) => t.slice(0, -1));
      return;
    }
    const prev = trail[trail.length - 1];
    if (!prev) return;
    setNodeId(prev);
    setTrail((t) => t.slice(0, -1));
  }

  function reset() {
    setNodeId('start');
    setTrail([]);
    setResult(null);
  }

  const chosen = result ? RESULTS[result] : null;
  const module = chosen ? MODULES.find((m) => m.id === chosen.modul) : null;

  return (
    <div className="dt-card card">
      <div className="dt-head">
        <div>
          <p className="eyebrow">Panduan memilih desain</p>
          <h3 className="serif">Decision tree 4 pertanyaan</h3>
        </div>
        <div className="dt-actions">
          <button type="button" className="btn btn-ghost" onClick={back} disabled={!result && trail.length === 0}>← Kembali</button>
          <button type="button" className="btn btn-ghost" onClick={reset}>Reset</button>
        </div>
      </div>

      <ol className="dt-trail" aria-label="Jalur pilihan">
        {trail.length === 0 && <li className="dt-trail-empty">Mulai di sini</li>}
        {trail.map((id, i) => (
          <li key={`${id}-${i}`}>{NODES[id]?.question ?? id}</li>
        ))}
        {result && <li><strong>{chosen?.judul}</strong></li>}
      </ol>

      {!result ? (
        <div className="dt-question" aria-live="polite">
          <p className="dt-step">Langkah {trail.length + 1}</p>
          <h4 className="serif">{node.question}</h4>
          {node.hint && <p className="text-soft">{node.hint}</p>}
          <div className="dt-options">
            {node.options.map((option) => (
              <button type="button" key={option.label} className="dt-option" onClick={() => choose(option)}>
                {option.label}<span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="dt-result" aria-live="polite">
          <span className="chip" data-tone="ok">Rekomendasi</span>
          <h4 className="serif">{chosen?.judul}</h4>
          <p>{chosen?.alasan}</p>
          <div className="dt-links">
            <a className="btn btn-primary" href={`/modul/${module?.slug ?? ''}/`}>Buka modul</a>
            <a className="btn btn-ghost" href="/kalkulator/">Lihat kalkulator</a>
          </div>
        </div>
      )}
    </div>
  );
}
