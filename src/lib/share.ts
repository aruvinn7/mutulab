/** Berbagi skenario via URL (F-07). Kompresi ringan base64url + validasi skema. */

export interface SharePayload {
  v: 1;
  module: string;
  inputs: Record<string, number | string | boolean | number[]>;
}

export function encodeScenario(payload: SharePayload): string {
  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  const encoded = btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  return encoded;
}

export function decodeScenario(token: string | null): SharePayload | null {
  if (!token) return null;
  try {
    const normalized = token.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Partial<SharePayload>;
    if (parsed.v !== 1 || typeof parsed.module !== 'string' || typeof parsed.inputs !== 'object' || parsed.inputs === null) {
      return null;
    }
    return { v: 1, module: parsed.module, inputs: parsed.inputs as SharePayload['inputs'] };
  } catch {
    return null;
  }
}

export function buildShareUrl(payload: SharePayload): string {
  const token = encodeScenario(payload);
  const base = typeof window !== 'undefined' ? window.location.href.split('?')[0] : '/';
  return `${base}?s=${token}`;
}

export function readScenarioFromUrl(): SharePayload | null {
  if (typeof window === 'undefined') return null;
  return decodeScenario(new URLSearchParams(window.location.search).get('s'));
}

export function safeNumber(value: unknown, fallback: number, min = -1e12, max = 1e12): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
}
