import { useEffect, useState, type ReactNode } from 'react';

export interface RevealStep {
  title: string;
  content: ReactNode;
}

interface Props {
  id: string;
  steps: RevealStep[];
}

/** Board Reveal (F-02): buka langkah satu per satu, dengan keyboard & sessionStorage. */
export default function RevealSteps({ id, steps }: Props) {
  const [shown, setShown] = useState(steps.length);

  useEffect(() => {
    const teaching = document.documentElement.dataset.teaching === 'true';
    let stored: number | null = null;
    try {
      const raw = sessionStorage.getItem(`mutulab.reveal.${id}`);
      if (raw !== null) stored = Number(raw);
    } catch {}
    if (sessionStorageReset()) stored = null;
    setShown(stored !== null && Number.isFinite(stored) ? Math.min(Math.max(stored, 0), steps.length) : teaching ? 0 : steps.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, steps.length]);

  function sessionStorageReset() {
    try {
      const flag = sessionStorage.getItem('mutulab.reveal.reset');
      if (flag === '1') { sessionStorage.removeItem('mutulab.reveal.reset'); return true; }
    } catch {}
    return false;
  }

  useEffect(() => {
    function onTeach(e: Event) {
      const active = Boolean((e as CustomEvent<{ active: boolean }>).detail?.active);
      setShown(active ? 0 : steps.length);
    }
    window.addEventListener('mutulab:teaching', onTeach);
    return () => window.removeEventListener('mutulab:teaching', onTeach);
  }, [steps.length]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault(); setShown((s) => Math.min(s + 1, steps.length));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault(); setShown((s) => Math.max(s - 1, 0));
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [steps.length]);

  function update(next: number) {
    const clamped = Math.min(Math.max(next, 0), steps.length);
    setShown(clamped);
    try { sessionStorage.setItem(`mutulab.reveal.${id}`, String(clamped)); } catch {}
  }

  return (
    <div className="reveal" data-reveal={id}>
      <div className="stepper pill glass-solid" role="group" aria-label="Buka langkah bertahap">
        <button type="button" onClick={() => update(shown - 1)} disabled={shown === 0} aria-label="Tutup langkah terakhir">←</button>
        <span className="step-count">{shown} / {steps.length} langkah</span>
        <button type="button" onClick={() => update(shown + 1)} disabled={shown === steps.length} aria-label="Buka langkah berikutnya">→</button>
        <span className="divider" />
        <button type="button" className="text-btn" onClick={() => update(steps.length)}>Buka Semua</button>
        <button type="button" className="text-btn" onClick={() => update(0)}>Reset</button>
      </div>
      <ol className="reveal-list">
        {steps.map((step, i) => (
          <li key={i} className={`reveal-step card ${i < shown ? 'is-visible' : 'is-hidden'}`} aria-hidden={i >= shown}>
            <div className="step-title"><span className="step-no">{String(i + 1).padStart(2, '0')}</span><h3>{step.title}</h3></div>
            <div className="step-content">{step.content}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
