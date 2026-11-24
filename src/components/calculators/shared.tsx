/** Helper UI bersama untuk kalkulator Agen D — tanpa dependensi baru. */
import { useState, type ReactNode } from 'react';
import type { Preset } from '../../lib/types';
import { buildShareUrl, type SharePayload } from '../../lib/share';
import * as PresetsModule from '../../data/presets';
import './calculators.css';

/** presets.ts dibuat Agen F. Baca beberapa nama ekspor yang mungkin, tetap aman bila kosong. */
const presetModule = PresetsModule as unknown as { PRESETS?: Preset[]; default?: Preset[] };
const ALL_PRESETS: Preset[] = Array.isArray(presetModule.PRESETS)
  ? presetModule.PRESETS
  : Array.isArray(presetModule.default)
    ? presetModule.default
    : [];

export function presetsFor(...keys: string[]): Preset[] {
  const wanted = keys.map((k) => k.toLowerCase());
  return ALL_PRESETS.filter((p) => {
    const modul = String(p?.modul ?? '').toLowerCase();
    const id = String(p?.id ?? '').toLowerCase();
    return wanted.some((k) => modul === k || modul.includes(k) || id.includes(k));
  });
}

export function parseNumber(raw: string): number {
  const trimmed = raw.trim();
  return trimmed === '' ? NaN : Number(trimmed);
}

export function clampInt(value: number, min: number, max: number, fallback: number): number {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function resizeRows<T>(rows: T[][], count: number, make: () => T[]): T[][] {
  return Array.from({ length: count }, (_, i) => rows[i] ? [...rows[i]] : make());
}

export function flattenMatrix(matrix: number[][]): number[] {
  return matrix.flatMap((row) => row.map((v) => (Number.isFinite(v) ? v : 0)));
}

export function chunkFlat(flat: number[], sizes: number[]): number[][] {
  let cursor = 0;
  return sizes.map((n) => {
    const row = flat.slice(cursor, cursor + n);
    cursor += n;
    return row;
  });
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* lanjut ke fallback */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.top = '-1000px';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------ */

interface NumberFieldProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  hint?: string;
  error?: string;
}

export function NumberField({ id, label, value, onChange, min, max, step = 1, suffix, hint, error }: NumberFieldProps) {
  return (
    <div className="calc-field">
      <label htmlFor={id}>{label}</label>
      <div className="calc-input-line">
        <input
          id={id}
          className="calc-input"
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : ''}
          data-invalid={error ? 'true' : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
          onChange={(e) => onChange(parseNumber(e.target.value))}
        />
        {suffix && <span className="calc-suffix">{suffix}</span>}
      </div>
      {error ? <small className="calc-error" id={`${id}-err`} role="alert">{error}</small>
        : hint ? <small className="calc-hint" id={`${id}-hint`}>{hint}</small> : null}
    </div>
  );
}

interface NumberMatrixProps {
  idPrefix: string;
  matrix: number[][];
  onChange: (row: number, col: number, value: number) => void;
  rowLabels: string[];
  colLabels: string[];
  cornerLabel?: string;
  invalid?: (row: number, col: number) => boolean;
}

export function NumberMatrix({ idPrefix, matrix, onChange, rowLabels, colLabels, cornerLabel = '', invalid }: NumberMatrixProps) {
  return (
    <div className="calc-matrix-wrap">
      <table className="calc-matrix">
        <caption className="sr-only">{cornerLabel || 'Matriks data numerik'}</caption>
        <thead>
          <tr>
            <th scope="col">{cornerLabel}</th>
            {colLabels.map((label, c) => <th scope="col" key={c}>{label}</th>)}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, r) => (
            <tr key={r}>
              <th scope="row">{rowLabels[r] ?? `Baris ${r + 1}`}</th>
              {row.map((value, c) => {
                const id = `${idPrefix}-${r}-${c}`;
                const bad = invalid ? invalid(r, c) : !Number.isFinite(value);
                return (
                  <td key={c}>
                    <label className="sr-only" htmlFor={id}>{rowLabels[r] ?? `Baris ${r + 1}`}, {colLabels[c] ?? `Kolom ${c + 1}`}</label>
                    <input
                      id={id}
                      type="number"
                      inputMode="decimal"
                      step="any"
                      value={Number.isFinite(value) ? value : ''}
                      data-invalid={bad ? 'true' : undefined}
                      aria-invalid={bad ? true : undefined}
                      onChange={(e) => onChange(r, c, parseNumber(e.target.value))}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Notice({ tone = 'info', title, children }: { tone?: 'info' | 'warn' | 'error'; title?: string; children: ReactNode }) {
  const icon = tone === 'error' ? '!' : tone === 'warn' ? '△' : 'i';
  return (
    <div className="calc-notice" data-tone={tone} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="calc-notice-icon" aria-hidden="true">{icon}</span>
      <div>{title && <strong>{title}</strong>}{children}</div>
    </div>
  );
}

export function CalcActions({ buildUrl, onReset }: { buildUrl: () => string; onReset: () => void }) {
  const [status, setStatus] = useState<'idle' | 'ok' | 'fail'>('idle');

  async function handleShare() {
    const ok = await copyText(buildUrl());
    setStatus(ok ? 'ok' : 'fail');
    window.setTimeout(() => setStatus('idle'), 2600);
  }

  return (
    <div className="calc-actions">
      <button type="button" className="calc-action-btn" onClick={handleShare} title="Salin tautan dengan data yang sudah terisi">
        <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M9 12h6M9 8H7a4 4 0 0 0 0 8h2m6-8h2a4 4 0 0 1 0 8h-2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
        Salin Tautan Skenario
      </button>
      <button type="button" className="calc-action-btn secondary" onClick={onReset}>Reset</button>
      {status !== 'idle' && (
        <span className="calc-action-status" data-tone={status} role="status">
          {status === 'ok' ? 'Tautan tersalin ✓' : 'Gagal menyalin — coba lagi'}
        </span>
      )}
    </div>
  );
}

/** KPI ringkas di atas langkah. */
export function Kpi({ label, value }: { label: string; value: string }) {
  return <div className="calc-kpi"><span>{label}</span><strong>{value}</strong></div>;
}

export function scenarioInputs(record: SharePayload['inputs']): SharePayload['inputs'] {
  return record && typeof record === 'object' ? record : {};
}
