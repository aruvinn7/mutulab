import { useEffect, useRef, useState, type FormEvent } from 'react';
import { MODULES } from '../../data/site';
import { generateQuestion, LATIHAN_MODULES } from '../../data/questions';
import { loadProgress, saveProgress, type ProgressState } from '../../lib/storage';
import type { PracticeQuestion } from '../../lib/types';
import Formula from '../ui/Formula';
import { defaultFmt } from '../ui/StatTable';

type DifficultyFilter = 'semua' | PracticeQuestion['difficulty'];

const DIFFICULTIES: { value: DifficultyFilter; label: string }[] = [
  { value: 'semua', label: 'Semua tingkat' },
  { value: 'dasar', label: 'Dasar' },
  { value: 'menengah', label: 'Menengah' },
  { value: 'ujian', label: 'Ujian' },
];

const FORMULAS: Record<string, string> = {
  m0: String.raw`P_a = \sum_{d=0}^{c}\binom{n}{d}\,p^{d}(1-p)^{n-d}`,
  m2: String.raw`F = \frac{MS_{\text{Perlakuan}}}{MS_{\text{Error}}}`,
  m3: String.raw`SS_{\text{Blok}} = \sum_{j}\frac{B_j^{2}}{a} - \frac{G^{2}}{ab}`,
  m4: String.raw`\text{Efek}_A = \frac{1}{2^{k-1}}\sum (\pm\bar{y})`,
  m5: String.raw`\eta = -10\log_{10}\!\left(\frac{1}{n}\sum_{i} y_i^{2}\right)`,
};

const DEFAULT_SEED = 20241124;
const randomSeed = (): number => Math.floor(Math.random() * 900000) + 100000;
const round3 = (n: number): number => Math.round((n + Number.EPSILON) * 1000) / 1000;
const idnum = (n: number): string => n.toLocaleString('id-ID', { maximumFractionDigits: 4 });

function seedFromUrl(): number {
  if (typeof window === 'undefined') return DEFAULT_SEED;
  const raw = new URLSearchParams(window.location.search).get('seed');
  if (raw === null) return DEFAULT_SEED;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : DEFAULT_SEED;
}

function modulFromUrl(): string {
  if (typeof window === 'undefined') return 'semua';
  const m = new URLSearchParams(window.location.search).get('modul');
  return m && LATIHAN_MODULES.includes(m) ? m : 'semua';
}

function difficultyFromUrl(): DifficultyFilter {
  if (typeof window === 'undefined') return 'semua';
  const d = new URLSearchParams(window.location.search).get('difficulty');
  return d && DIFFICULTIES.some((x) => x.value === d) ? (d as DifficultyFilter) : 'semua';
}

function labelFor(modul: string): string {
  return MODULES.find((m) => m.id === modul)?.title ?? modul;
}

/** Bank latihan soal acak (F-06): satu soal per layar, umpan balik bertahap, skor & riwayat lokal. */
export default function PracticeRunner() {
  // Render pertama memakai nilai default yang sama dengan SSR; URL dibaca setelah mount
  // agar tidak terjadi ketidakcocokan hydration pada halaman statis.
  const [seed, setSeed] = useState<number>(DEFAULT_SEED);
  const [modul, setModul] = useState('semua');
  const [difficulty, setDifficulty] = useState<DifficultyFilter>('semua');
  const [question, setQuestion] = useState<PracticeQuestion>(() => generateQuestion(DEFAULT_SEED));
  const urlRef = useRef<{ seed: number; modul: string; difficulty: DifficultyFilter; hasSeed: boolean } | null>(null);
  if (urlRef.current === null && typeof window !== 'undefined') {
    urlRef.current = {
      seed: seedFromUrl(),
      modul: modulFromUrl(),
      difficulty: difficultyFromUrl(),
      hasSeed: new URLSearchParams(window.location.search).has('seed'),
    };
  }
  const urlSyncFirst = useRef(true);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ correct: boolean; given: number } | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [history, setHistory] = useState<ProgressState['quizResults']>([]);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);

  // Terapkan nilai URL / seed acak setelah mount.
  useEffect(() => {
    const init = urlRef.current;
    if (init) {
      setSeed(init.hasSeed ? init.seed : randomSeed());
      setModul(init.modul);
      setDifficulty(init.difficulty);
    }
  }, []);

  useEffect(() => {
    setQuestion(generateQuestion(seed, modul === 'semua' ? undefined : modul, difficulty === 'semua' ? undefined : difficulty));
    setAnswer('');
    setSubmitted(false);
    setResult(null);
    setRevealed(0);
    setNotice('');
  }, [seed, modul, difficulty]);

  useEffect(() => {
    if (urlSyncFirst.current) { urlSyncFirst.current = false; return; }
    const url = new URL(window.location.href);
    url.searchParams.set('seed', String(seed));
    if (modul === 'semua') url.searchParams.delete('modul');
    else url.searchParams.set('modul', modul);
    if (difficulty === 'semua') url.searchParams.delete('difficulty');
    else url.searchParams.set('difficulty', difficulty);
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }, [seed, modul, difficulty]);

  useEffect(() => {
    setHistory(loadProgress().quizResults.slice(0, 8));
  }, []);

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const given = Number(answer.trim().replace(',', '.'));
    if (!answer.trim() || !Number.isFinite(given)) {
      setNotice('Masukkan jawaban berupa angka. Desimal boleh memakai koma atau titik.');
      return;
    }
    const correct = Math.abs(round3(given) - round3(question.answer)) <= question.tolerance;
    setNotice('');
    setGivenSafe(given, correct);
  }

  function setGivenSafe(given: number, correct: boolean) {
    setResult({ correct, given });
    setSubmitted(true);
    setRevealed(0);
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    const state = loadProgress();
    state.quizResults = [
      { id: question.id, seed: question.seed, correct, at: Date.now() },
      ...state.quizResults,
    ].slice(0, 60);
    saveProgress(state);
    setHistory(state.quizResults.slice(0, 8));
  }

  async function copyLink() {
    const params = new URLSearchParams({ seed: String(seed) });
    if (modul !== 'semua') params.set('modul', modul);
    if (difficulty !== 'semua') params.set('difficulty', difficulty);
    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const area = document.createElement('textarea');
      area.value = url;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try { document.execCommand('copy'); } catch { /* clipboard tidak tersedia */ }
      area.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2400);
  }

  const nextQuestion = () => setSeed(randomSeed());
  const retry = () => {
    setAnswer('');
    setSubmitted(false);
    setResult(null);
    setRevealed(0);
    setNotice('');
  };

  const moduleLabel = labelFor(question.modul);
  const pct = score.total ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="pr-runner">
      {/* --- Kontrol --- */}
      <section className="pr-controls glass-solid card" aria-label="Pengaturan latihan">
        <div className="pr-control-row">
          <label className="pr-field">
            <span className="eyebrow">Modul</span>
            <select value={modul} onChange={(e) => setModul(e.target.value)}>
              <option value="semua">Semua modul</option>
              {LATIHAN_MODULES.map((id) => (
                <option key={id} value={id}>{labelFor(id)}</option>
              ))}
            </select>
          </label>
          <label className="pr-field">
            <span className="eyebrow">Tingkat kesulitan</span>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as DifficultyFilter)}>
              {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
            </select>
          </label>
          <button type="button" className="btn btn-primary pr-new" onClick={nextQuestion}>Soal acak baru ↗</button>
        </div>
        <div className="pr-share">
          <span className="chip">Seed <span className="mono">{seed}</span></span>
          <button type="button" className="btn btn-ghost pr-copy" onClick={copyLink}>Salin tautan soal</button>
          {copied && <span className="chip" data-tone="ok" role="status">Tautan tersalin ✓</span>}
          <button type="button" className="btn btn-ghost pr-link" onClick={retry}>Ulangi seed ini</button>
        </div>
      </section>

      <div className="bento pr-grid">
        {/* --- Soal --- */}
        <section className="pr-question card span-8" aria-labelledby="pr-prompt">
          <div className="pr-question-head">
            <p className="eyebrow">{moduleLabel} · {QUESTION_TOPIC(question)}</p>
            <span className="chip" data-tone={question.difficulty === 'ujian' ? 'warn' : undefined}>{question.difficulty}</span>
          </div>
          <h2 id="pr-prompt">{question.prompt}</h2>

          <table className="data-table pr-data">
            <caption className="eyebrow">Data yang diberikan</caption>
            <thead>
              <tr><th scope="col">Variabel</th><th scope="col">Nilai</th></tr>
            </thead>
            <tbody>
              {Object.entries(question.data).map(([key, value]) => (
                <tr key={key}>
                  <th scope="row">{key}</th>
                  <td className="mono">{Array.isArray(value) ? `[${value.map(idnum).join(', ')}]` : idnum(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {FORMULAS[question.modul] && (
            <div className="pr-formula">
              <p className="eyebrow">Rumus terkait</p>
              <Formula tex={FORMULAS[question.modul]} display />
            </div>
          )}

          <form className="pr-answer-form" onSubmit={submit}>
            <label htmlFor="pr-jawaban">Jawaban kamu <span className="text-soft">(3 desimal, koma atau titik)</span></label>
            <div className="pr-input-row">
              <input
                id="pr-jawaban"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="contoh: 12,345"
                value={answer}
                disabled={submitted}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" disabled={submitted}>Periksa jawaban</button>
            </div>
            {notice && <p className="pr-notice" role="alert">{notice}</p>}
          </form>

          {submitted && result && (
            <div className="pr-feedback" aria-live="polite">
              <div className="pr-verdict">
                <span className="chip" data-tone={result.correct ? 'ok' : 'danger'}>
                  {result.correct ? 'Benar ✓' : 'Belum tepat'}
                </span>
                <span>
                  Jawaban benar: <strong className="mono">{defaultFmt(question.answer)}</strong>
                  {' · '}jawabanmu: <strong className="mono">{defaultFmt(result.given)}</strong>
                </span>
                <span className="text-soft">Toleransi ±{defaultFmt(question.tolerance)}</span>
              </div>

              <p className="eyebrow">Umpan balik per langkah</p>
              <ol className="pr-steps">
                {question.steps.slice(0, revealed).map((step, i) => (
                  <li key={i} className="pr-step">
                    <span className="pr-step-no">{String(i + 1).padStart(2, '0')}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              {revealed < question.steps.length ? (
                <button type="button" className="btn btn-ghost" onClick={() => setRevealed((r) => r + 1)}>
                  Langkah berikutnya ({revealed + 1}/{question.steps.length})
                </button>
              ) : (
                <div className="pr-explanation">
                  <p className="eyebrow">Pembahasan akhir</p>
                  <p>{question.explanation}</p>
                  <button type="button" className="btn btn-primary" onClick={nextQuestion}>Soal berikutnya →</button>
                </div>
              )}
            </div>
          )}
        </section>

        {/* --- Skor & riwayat --- */}
        <aside className="pr-side span-4">
          <section className="pr-score card" aria-label="Skor sesi ini" data-hide-when-teaching>
            <p className="eyebrow">Skor sesi ini</p>
            <p className="pr-score-big mono">{score.correct}<span>/{score.total}</span></p>
            <div className="pr-bar" role="img" aria-label={`${pct}% jawaban benar`}>
              <span style={{ width: `${pct}%` }} />
            </div>
            <p className="text-soft">{score.total ? `${pct}% jawaban benar` : 'Belum ada jawaban yang diperiksa.'}</p>
          </section>

          <section className="pr-history card" aria-labelledby="pr-history-title" data-hide-when-teaching>
            <p className="eyebrow" id="pr-history-title">Riwayat dari perangkat ini</p>
            {history.length === 0 ? (
              <p className="text-soft">Belum ada riwayat. Riwayat dicatat setelah jawaban diperiksa.</p>
            ) : (
              <div className="table-scroll">
                <table className="data-table pr-history-table">
                  <thead>
                    <tr><th scope="col">Seed</th><th scope="col">Hasil</th><th scope="col">Waktu</th></tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={`${h.id}-${h.at}-${i}`}>
                        <td className="mono">{h.seed}</td>
                        <td>{h.correct ? '✓ Benar' : '✗ Salah'}</td>
                        <td>{new Date(h.at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="pr-history-note">Riwayat menggunakan localStorage. Menghapus data browser akan menghilangkan riwayat ini.</p>
          </section>

          <section className="pr-tips card">
            <p className="eyebrow">Tips mengerjakan</p>
            <ul>
              <li>Baca satuan dan urutan data pada tabel soal.</li>
              <li>Bulatkan hanya di akhir; kunci dihitung dengan presisi penuh.</li>
              <li>Seed yang sama selalu memunculkan soal dan kunci yang sama—bagikan ke teman untuk diskusi.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function QUESTION_TOPIC(q: PracticeQuestion): string {
  // Topik diambil dari id template (bagian sebelum '-seed'), dibuat ramah dibaca.
  const id = q.id.replace(/-\d+$/, '');
  return id.split('-').slice(1).join(' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
