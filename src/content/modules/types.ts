/** Skema konten modul MutuLab (Agen C). Konten dipisahkan dari tampilan. */

export interface TexBlock {
  /** Sumber KaTeX (tanpa tanda $). */
  tex: string;
  caption?: string;
}

export interface ExampleStep {
  title: string;
  /** Rumus KaTeX (render display) pada langkah ini. */
  formula?: string;
  /** Substitusi angka, ditulis sebagai KaTeX inline. */
  substitution?: string;
  /** Hasil akhir langkah (teks biasa, sudah memakai koma desimal). */
  result?: string;
  /** Penjelasan tambahan di bawah langkah. */
  detail?: string;
}

export interface CheatItem {
  label: string;
  tex?: string;
  note: string;
}

export interface Callout {
  tone: 'info' | 'warn' | 'ok' | 'danger';
  title: string;
  body: string;
}

export interface DataTable {
  caption?: string;
  head: string[];
  rows: string[][];
}

export interface StageContent {
  /** 2–4 paragraf isi substansial. */
  paragraphs: string[];
  bullets?: string[];
  formulas?: TexBlock[];
  callout?: Callout;
  /** Khusus tahap "contoh": hitungan bertahap untuk Board Reveal. */
  steps?: ExampleStep[];
  table?: DataTable;
  /** Lembar contekan, dipakai pada tahap ringkasan. */
  cheat?: CheatItem[];
  /** Pertanyaan pemantik / kunci jawaban singkat pada tahap latihan. */
  prompts?: string[];
}

export interface RelatedLink {
  label: string;
  href: string;
  kind: 'kalkulator' | 'simulator' | 'modul' | 'referensi' | 'latihan';
}

export interface ModuleContent {
  slug: string;
  id: string;
  objectives: string[];
  stages: Record<'kenapa' | 'konsep' | 'contoh' | 'coba' | 'latihan' | 'ringkasan', StageContent>;
  cheatSheet: CheatItem[];
  related: RelatedLink[];
}
