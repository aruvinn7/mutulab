/** Penyimpanan progres & preferensi — 100% localStorage, tanpa server. */

const KEY = 'mutulab.v1';

export interface ProgressState {
  completedStages: Record<string, string[]>;
  completedModules: string[];
  quizResults: { id: string; seed: number; correct: boolean; at: number }[];
  bookmarks: string[];
  teachingMode: boolean;
  updatedAt: number;
}

const EMPTY: ProgressState = {
  completedStages: {},
  completedModules: [],
  quizResults: [],
  bookmarks: [],
  teachingMode: false,
  updatedAt: 0,
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadProgress(): ProgressState {
  if (!isBrowser()) return { ...EMPTY };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      completedStages: parsed.completedStages ?? {},
      completedModules: Array.isArray(parsed.completedModules) ? parsed.completedModules : [],
      quizResults: Array.isArray(parsed.quizResults) ? parsed.quizResults : [],
      bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      teachingMode: Boolean(parsed.teachingMode),
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0,
    };
  } catch {
    return { ...EMPTY };
  }
}

export function saveProgress(state: ProgressState): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...state, updatedAt: Date.now() }));
  } catch {
    /* kuota penuh — abaikan dengan senyap */
  }
}

export function markStage(moduleSlug: string, stage: string): ProgressState {
  const state = loadProgress();
  const list = state.completedStages[moduleSlug] ?? [];
  if (!list.includes(stage)) list.push(stage);
  state.completedStages[moduleSlug] = list;
  saveProgress(state);
  return state;
}

export function markModule(moduleSlug: string): ProgressState {
  const state = loadProgress();
  if (!state.completedModules.includes(moduleSlug)) state.completedModules.push(moduleSlug);
  saveProgress(state);
  return state;
}

export function toggleBookmark(href: string): ProgressState {
  const state = loadProgress();
  state.bookmarks = state.bookmarks.includes(href)
    ? state.bookmarks.filter((b) => b !== href)
    : [...state.bookmarks, href];
  saveProgress(state);
  return state;
}

export function exportBackup(): string {
  return JSON.stringify({ schema: 'mutulab.progress.v1', exportedAt: new Date().toISOString(), data: loadProgress() }, null, 2);
}

export function importBackup(raw: string): ProgressState | null {
  try {
    const parsed = JSON.parse(raw) as { schema?: string; data?: Partial<ProgressState> };
    if (parsed.schema !== 'mutulab.progress.v1' || !parsed.data) return null;
    const state: ProgressState = {
      completedStages: parsed.data.completedStages ?? {},
      completedModules: parsed.data.completedModules ?? [],
      quizResults: parsed.data.quizResults ?? [],
      bookmarks: parsed.data.bookmarks ?? [],
      teachingMode: Boolean(parsed.data.teachingMode),
      updatedAt: Date.now(),
    };
    saveProgress(state);
    return state;
  } catch {
    return null;
  }
}

/** PRNG ber-seed (mulberry32) — dipakai soal acak & simulator. */
export function seededRandom(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
