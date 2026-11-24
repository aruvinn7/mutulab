import { useState } from 'react';
import type { Preset } from '../../lib/types';

interface Props {
  preset: Preset;
  defaultOpen?: boolean;
}

/** Panel pertanyaan pemantik yang bisa dibuka/ditutup untuk satu preset (F-02). */
export default function PresetHint({ preset, defaultOpen = false }: Props) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `preset-hint-${preset.id}`;

  return (
    <section className="preset-hint card" aria-labelledby={`${panelId}-label`}>
      <button
        type="button"
        className="ph-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="ph-icon" aria-hidden="true">?</span>
        <span id={`${panelId}-label`}>
          Pertanyaan pemantik · <strong>{preset.judul}</strong>
        </span>
        <span className="ph-caret" aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="ph-body" id={panelId}>
          <p className="ph-goal"><strong>Tujuan ajar:</strong> {preset.tujuan_ajar}</p>
          <ol className="ph-list">
            {preset.pertanyaan_pemantik.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ol>
        </div>
      )}
    </section>
  );
}
