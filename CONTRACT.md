# MutuLab — Kontrak Orkestrasi (dibaca SEMUA sub-agent)

## Tujuan
Bangun website **MutuLab** dari nol di `D:\app\project\doe`: platform belajar + media ajar interaktif DOE, Taguchi, Acceptance Sampling. Spesifikasi lengkap ada di `D:\Download\Installer\prd_mutulab_v1_4.md` (baca bagian 1, 4, 5, 6). Gaya visual **WAJIB** mengikuti gambar referensi = PRD §6: *Sky-Blue Frosted Glassmorphism × Mountain Landscape × Bento Command Center*, macOS-style landing page.

## Aturan umum (tidak bisa ditawar)
1. **Bahasa Indonesia** untuk semua UI dan konten. Istilah teknis Inggris boleh dipertahankan dengan padanan.
2. **100% client-side**. Tidak ada backend, login, database, atau API eksternal. Semua data di `localStorage` / `sessionStorage` / URL.
3. **Jangan mengubah file fondasi** yang sudah ada (lihat daftar di bawah). Jika butuh perubahan, tulis catatan di laporan akhir Anda — orkestrator yang akan mengubah.
4. **Jangan menimpa file milik agen lain** (lihat peta kepemilikan).
5. Gunakan **CSS variables** dari `src/styles/tokens.css`. Jangan hardcode warna baru kecuali untuk gradasi SVG.
6. Semua angka ditampilkan dengan pemisah desimal koma (Indonesia), 3–4 desimal; gunakan `defaultFmt` dari `src/components/ui/StatTable.tsx` bila perlu.
7. Rumus matematika dirender dengan `Formula` dari `src/components/ui/Formula.tsx` (KaTeX), atau `katex.renderToString` langsung di Astro.
8. Aksesibilitas: WCAG AA, label pada input, tabel semantik, grafik punya ringkasan teks, keyboard navigation.
9. Mode Mengajar: gunakan `html[data-teaching='true']` dan komponen `RevealSteps`. Jangan menimpa logika toggle di Topbar.
10. Konten preset/soal **orisinal fiktif realistis**, bukan salinan contoh buku.

## File fondasi (SUDAH ADA — jangan diedit)
```
package.json, astro.config.mjs, tsconfig.json, vitest.config.ts, CONTRACT.md
src/styles/tokens.css, src/styles/global.css
src/data/site.ts
src/lib/types.ts, src/lib/storage.ts, src/lib/share.ts
src/layouts/BaseLayout.astro
src/components/brand/Logo.astro, MountainScene.astro, Topbar.astro
src/components/ui/Formula.tsx, CalculatorFrame.tsx, RevealSteps.tsx, StatTable.tsx
public/favicon.svg
```

## Kontrak data bersama
- `src/data/site.ts`: `MODULES`, `CALCULATORS`, `STAGES`, `NAV_LINKS`, `SEARCH_INDEX`, tipe `ModuleMeta`, `StageKey`.
- `src/lib/types.ts`: `AnovaRow`, `AnovaResult`, `FactorialEffect`, `FactorialResult`, `SnCharacteristic`, `SnResult`, `TaguchiResponseRow`, `SamplingPlanResult`, `Preset`, `PracticeQuestion`, `CalcStep`, `CalcWarning`.
- `src/lib/storage.ts`: `loadProgress`, `saveProgress`, `markStage`, `markModule`, `toggleBookmark`, `exportBackup`, `importBackup`, `seededRandom(seed)`.
- `src/lib/share.ts`: `buildShareUrl`, `readScenarioFromUrl`, `encodeScenario`, `decodeScenario`, `safeNumber`.
- `src/components/ui/CalculatorFrame.tsx`: props `{title, subtitle?, moduleId?, presets?, onPreset?, actions?, children}`.
- `src/components/ui/RevealSteps.tsx`: props `{id, steps: {title, content: ReactNode}[]}`.
- `src/components/ui/StatTable.tsx`: props `{rows: AnovaRow[], caption?, decision?: {label, accepted}, fmt?}` + `defaultFmt`.
- `src/layouts/BaseLayout.astro`: props `{title?, description?, surface?: 'hero'|'page', wide?}`. Halaman hero harus `surface="hero"`.

## Peta kepemilikan file (JANGAN keluar dari sini)

### Agen A — Landing page & identitas visual
- `src/pages/index.astro`
- `src/components/landing/**` (bebas membuat komponen di sini)

### Agen B — `calc-core` (matematika & tes)
- `src/lib/calc-core/**` (termasuk `*.test.ts`)

### Agen C — Modul belajar 6 tahap
- `src/content/modules/**`
- `src/pages/modul/index.astro`
- `src/pages/modul/[slug].astro`
- `src/components/module/**`

### Agen D — Kalkulator DOE dasar & grafik
- `src/pages/kalkulator/index.astro`
- `src/pages/kalkulator/crd-anova.astro`
- `src/pages/kalkulator/rcbd-anova.astro`
- `src/pages/kalkulator/faktorial-2k.astro`
- `src/components/calculators/**` (kecuali TaguchiCalc & SamplingCalc)
- `src/components/charts/**`

### Agen E — Taguchi, Sampling & simulator
- `src/pages/kalkulator/taguchi-sn.astro`
- `src/pages/kalkulator/sampling-oc.astro`
- `src/pages/simulator/index.astro`
- `src/components/taguchi/**`
- `src/components/sampling/**`
- `src/components/sandbox/**`
- `src/components/calculators/TaguchiCalc.tsx`, `src/components/calculators/SamplingCalc.tsx`

### Agen F — Fitur pengajaran & latihan
- `src/pages/latihan/index.astro`
- `src/pages/cheat-sheet.astro`
- `src/pages/panduan.astro`
- `src/pages/privasi.astro`
- `src/data/presets.ts`
- `src/data/questions.ts`
- `src/components/teaching/**`
- `src/components/practice/**`
- `src/components/reference/**`

## API `calc-core` yang WAJIB diekspor (Agen B → dipakai D & E)
```ts
fCdf(x: number, df1: number, df2: number): number
fSf(x: number, df1: number, df2: number): number          // p-value = 1 - CDF
fCritical(alpha: number, df1: number, df2: number): number
crdAnova(groups: number[][], alpha?: number): AnovaResult
fisherLsd(groups: number[][], alpha?: number): { alpha: number; dfError: number; msError: number; pairs: {a:number;b:number;diff:number;lsd:number;significant:boolean}[] }
rcbdAnova(treatmentsXBlocks: number[][], alpha?: number): AnovaResult
yatesFactorial(observations: number[], k: number, replicates: number, names?: string[]): FactorialResult
snRatio(observations: number[], characteristic: SnCharacteristic, target?: number): number
taguchiAnalysis(oa: number[][], observations: number[][], characteristic: SnCharacteristic, target?: number): {
  sn: SnResult; response: TaguchiResponseRow[]; predicted: number;
}
samplingPlan(p: { n: number; c: number; N?: number; aql?: number; ltpd?: number; distribution?: 'binomial'|'poisson' }): SamplingPlanResult
normalSf(z: number): number
formatP(p: number): string
roundTo(n: number, digits?: number): number
```
 Catatan: `AnovaResult.rows` harus berisi baris Treatment/Blok/Error/Total dengan `source` persis: `'Treatment'`, `'Block'`, `'Error'`, `'Total'` (atau `'A'`, `'B'`, `'AB'`, `'Error'`, `'Total'` untuk faktorial).

## Rute final (pastikan tautan tidak mati)
```
/                         → Agen A
/modul/                   → Agen C
/modul/[slug]/            → Agen C (6 slug sesuai MODULES)
/kalkulator/              → Agen D
/kalkulator/crd-anova/    → Agen D
/kalkulator/rcbd-anova/   → Agen D
/kalkulator/faktorial-2k/ → Agen D
/kalkulator/taguchi-sn/   → Agen E
/kalkulator/sampling-oc/  → Agen E
/simulator/               → Agen E
/latihan/                 → Agen F
/cheat-sheet/             → Agen F
/panduan/                 → Agen F
/privasi/                 → Agen F
```

## Cara kerja
- Gunakan fondasi yang sudah ada; jalankan `npm run build` hanya di akhir jika sempat (dependensi sedang dipasang orkestrator).
- Kembalikan laporan singkat: file yang dibuat, API yang diekspor, tautan yang tersedia, dan catatan untuk orkestrator.
- Utamakan kualitas visual & konten yang benar-benar bisa dipakai, bukan placeholder.
