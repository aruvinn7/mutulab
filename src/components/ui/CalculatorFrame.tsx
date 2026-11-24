import type { ReactNode } from 'react';
import type { Preset } from '../../lib/types';

interface Props {
  title: string;
  subtitle?: string;
  moduleId?: string;
  presets?: Preset[];
  onPreset?: (preset: Preset) => void;
  actions?: ReactNode;
  children: ReactNode;
}

export default function CalculatorFrame({ title, subtitle, presets = [], onPreset, actions, children }: Props) {
  return (
    <section className="calc-window glass">
      <header className="calc-head">
        <div>
          <p className="eyebrow">Kalkulator bertahap</p>
          <h1>{title}</h1>
          {subtitle && <p className="subtitle">{subtitle}</p>}
        </div>
        <div className="head-actions">
          {actions}
          {presets.length > 0 && (
            <label className="preset-select">
              <span className="sr-only">Pilih preset studi kasus</span>
              <select defaultValue="" onChange={(e) => {
                const p = presets.find((x) => x.id === e.target.value);
                if (p) onPreset?.(p);
              }}>
                <option value="" disabled>Preset studi kasus ▾</option>
                {presets.map((p) => <option key={p.id} value={p.id}>{p.judul}</option>)}
              </select>
            </label>
          )}
        </div>
      </header>
      <div className="calc-body">{children}</div>
    </section>
  );
}
