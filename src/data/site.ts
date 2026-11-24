export type StageKey = 'kenapa' | 'konsep' | 'contoh' | 'coba' | 'latihan' | 'ringkasan';

export interface StageMeta {
  key: StageKey;
  label: string;
  short: string;
}

export const STAGES: StageMeta[] = [
  { key: 'kenapa', label: 'Kenapa Penting', short: 'Kenapa' },
  { key: 'konsep', label: 'Konsep Inti', short: 'Konsep' },
  { key: 'contoh', label: 'Contoh Dikerjakan', short: 'Contoh' },
  { key: 'coba', label: 'Coba Sendiri', short: 'Coba' },
  { key: 'latihan', label: 'Latihan Soal Acak', short: 'Latihan' },
  { key: 'ringkasan', label: 'Ringkasan & Cheat Sheet', short: 'Ringkasan' },
];

export interface ModuleMeta {
  id: string;
  number: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  minutes: number;
  difficulty: 'Pengantar' | 'Dasar' | 'Menengah' | 'Lanjutan';
  track: 'sampling' | 'fondasi' | 'doe' | 'taguchi';
  calculator?: string;
  sandbox?: string;
  keywords: string[];
}

export const MODULES: ModuleMeta[] = [
  {
    id: 'm0', number: '0', slug: 'pengantar-kualitas-sampling',
    title: 'Pengantar Kualitas & Acceptance Sampling',
    subtitle: 'Inspeksi lot, risiko produsen & konsumen',
    description: 'Pahami variasi proses, AQL/LTPD, dan mengapa inspeksi akhir hanya menyaring cacat—bukan mencegahnya.',
    icon: 'scan', minutes: 35, difficulty: 'Pengantar', track: 'sampling',
    calculator: 'sampling', sandbox: 'lot-inspection',
    keywords: ['sampling', 'aql', 'ltpd', 'oc', 'aoq', 'inspeksi', 'binomial', 'poisson'],
  },
  {
    id: 'm1', number: '1', slug: 'fondasi-berpikir-eksperimental',
    title: 'Fondasi Berpikir Eksperimental',
    subtitle: 'The Why & How of DOE',
    description: 'Anatomi eksperimen, kegagalan OFAT, dan Tiga Prinsip Fisher: replikasi, randomisasi, blocking.',
    icon: 'compass', minutes: 40, difficulty: 'Dasar', track: 'fondasi',
    sandbox: 'ofat', keywords: ['ofat', 'fisher', 'replikasi', 'randomisasi', 'blocking', 'fondasi', 'doe'],
  },
  {
    id: 'm2', number: '2', slug: 'crd-anova',
    title: 'Eksperimen Satu Faktor & ANOVA',
    subtitle: 'CRD · Dekomposisi variasi',
    description: 'Bandingkan lebih dari dua perlakuan dengan CRD, lalu susun tabel ANOVA lengkap dan uji lanjut.',
    icon: 'chart', minutes: 55, difficulty: 'Dasar', track: 'doe',
    calculator: 'crd', sandbox: 'variance',
    keywords: ['anova', 'crd', 'ss', 'df', 'ms', 'f', 'lsd', 'tukey', 'post hoc', 'residual'],
  },
  {
    id: 'm3', number: '3', slug: 'blocking-rcbd',
    title: 'Pengendalian Faktor Pengganggu',
    subtitle: 'Blocking · RCBD · Latin Square',
    description: 'Isolasi variasi bahan baku, operator, atau shift agar uji F lebih sensitif dengan RCBD.',
    icon: 'layers', minutes: 50, difficulty: 'Dasar', track: 'doe',
    calculator: 'rcbd',
    keywords: ['blocking', 'rcbd', 'blok', 'latin square', 'nuisance', 'anova'],
  },
  {
    id: 'm4', number: '4', slug: 'faktorial-2k',
    title: 'Desain Faktorial 2ᵏ & Interaksi',
    subtitle: 'Yates · Main effect · Interaction plot',
    description: 'Hitung efek utama dan interaksi dengan Algoritma Yates, lalu baca interaction plot dengan percaya diri.',
    icon: 'grid', minutes: 60, difficulty: 'Menengah', track: 'doe',
    calculator: 'factorial', sandbox: 'interaction',
    keywords: ['faktorial', 'yates', 'interaksi', '2^k', 'main effect', 'interaction plot', 'ortogonal'],
  },
  {
    id: 'm5', number: '5', slug: 'metode-taguchi',
    title: 'Metode Taguchi & Robust Design',
    subtitle: 'Orthogonal array · S/N Ratio',
    description: 'Fungsi kerugian kualitas, inner/outer array, dan optimasi parameter tangguh dengan rasio S/N.',
    icon: 'target', minutes: 65, difficulty: 'Lanjutan', track: 'taguchi',
    calculator: 'taguchi', sandbox: 'taguchi-lab',
    keywords: ['taguchi', 'sn', 's/n', 'l4', 'l8', 'l9', 'orthogonal', 'loss function', 'robust'],
  },
];

export interface CalculatorMeta {
  id: string;
  slug: string;
  title: string;
  module: string;
  description: string;
  icon: string;
}

export const CALCULATORS: CalculatorMeta[] = [
  { id: 'crd', slug: 'crd-anova', title: 'CRD · ANOVA Satu Arah', module: 'm2', description: 'SS, df, MS, F-hitung, p-value, Fisher LSD', icon: 'chart' },
  { id: 'rcbd', slug: 'rcbd-anova', title: 'RCBD · ANOVA Blok', module: 'm3', description: 'Dekomposisi SS Treatment + SS Block + SS Error', icon: 'layers' },
  { id: 'factorial', slug: 'faktorial-2k', title: 'Faktorial 2ᵏ · Yates', module: 'm4', description: 'Efek utama, interaksi, dan ANOVA faktorial', icon: 'grid' },
  { id: 'taguchi', slug: 'taguchi-sn', title: 'Taguchi · S/N Ratio', module: 'm5', description: 'L4/L8/L9, tiga karakteristik S/N, tabel respon', icon: 'target' },
  { id: 'sampling', slug: 'sampling-oc', title: 'Acceptance Sampling', module: 'm0', description: 'Kurva OC, AOQ, AOQL, ASN, ATI', icon: 'scan' },
];

export const NAV_LINKS = [
  { label: 'Modul', href: '/modul/' },
  { label: 'Kalkulator', href: '/kalkulator/' },
  { label: 'Latihan', href: '/latihan/' },
  { label: 'Cheat Sheet', href: '/cheat-sheet/' },
];

export const SEARCH_INDEX = [
  ...MODULES.map((m) => ({ label: m.title, href: `/modul/${m.slug}/`, kind: 'Modul', keywords: m.keywords })),
  ...CALCULATORS.map((c) => ({ label: c.title, href: `/kalkulator/${c.slug}/`, kind: 'Kalkulator', keywords: [c.id, c.title.toLowerCase()] })),
  { label: 'Bank Latihan Soal', href: '/latihan/', kind: 'Latihan', keywords: ['latihan', 'soal', 'quiz', 'acak'] },
  { label: 'Cheat Sheet & Tabel Referensi', href: '/cheat-sheet/', kind: 'Referensi', keywords: ['cheat', 'tabel f', 'l4', 'l8', 'l9', 'rumus'] },
];
