import { useEffect, useState } from 'react';

interface Props {
  /** Tampilkan hanya ikon saat tidak aktif (berguna di header padat). */
  compact?: boolean;
}

/** Indikator status Mode Mengajar (F-02), mengikuti toggle di Topbar. */
export default function TeachingBadge({ compact = false }: Props) {
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

  return (
    <span className={`chip teach-badge${compact ? ' is-compact' : ''}`} data-tone={active ? 'ok' : undefined} aria-live="polite">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <rect x="2.5" y="4" width="19" height="13" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 20h8M12 17v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      {active ? 'Mode Mengajar aktif' : 'Tampilan standar'}
    </span>
  );
}
