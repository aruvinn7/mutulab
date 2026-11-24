# Kontrak Perbaikan UI — Foto Background Penuh (dibaca semua agen)

## Kondisi baru (sudah diterapkan orkestrator)
- Foto lanskap adalah **SATU lapis `position: fixed`** di `src/components/brand/LandscapePhoto.astro`, dirender sekali oleh `src/layouts/BaseLayout.astro` lewat `.site-backdrop`.
- **Tidak ada veil putih.** `.site-backdrop-veil` sudah `display:none`.
- Hero tidak punya foto lokal lagi; tidak ada `hero-fade`, tidak ada gradient opak. Foto tampak terus dari atas sampai bawah halaman saat scroll.
- Kualitas foto dinaikkan: WebP q90, srcset 640/1280/1920/2048 + blur placeholder. **Jangan ubah optimizer atau aset img.**

## Aturan WAJIB
1. **Jangan edit** file ini: `src/styles/global.css`, `src/styles/tokens.css`, `src/layouts/BaseLayout.astro`, `src/components/brand/**`, `src/components/effects/**`, `scripts/optimize-image.mjs`, `public/img/**`, `package.json`, `astro.config.mjs`.
2. **Foto harus tetap terlihat.** Jangan menambah `background:#fff` atau gradient opak pada wrapper section/halaman. Bila perlu keterbacaan, pakai permukaan kartu kaca/solid di sekitar teks, bukan menutup seluruh foto.
3. Kontras: teks ≥4,5:1, teks besar ≥3:1. Gunakan token (`--ink`, `--ink-soft`, `--surface`, `--glass-bg-strong`, `--accent`). Jangan hardcode hex baru kecuali necessary.
4. **Mode Mengajar** (`html[data-teaching='true']`) harus tetap solid, kontras tinggi, tanpa foto/efek. Jangan merusak override yang sudah ada.
5. Jangan menambah dependency baru. Utamakan CSS.
6. Jangan menurunkan kualitas visual/konten yang sudah ada. Perbaikan bersifat aditif.
7. Jalankan `npm run build` sebelum selesai.

## Pembagian kepemilikan
- **Agen L:** `src/components/landing/**`
- **Agen P:** `src/pages/**` KECUALI `index.astro`; `src/components/module/**`, `src/components/teaching/**`, `src/components/practice/**`, `src/components/reference/**`
- **Agen K:** `src/components/calculators/**`, `src/components/charts/**`, `src/components/taguchi/**`, `src/components/sampling/**`, `src/components/sandbox/**`
- **Auditor Q:** read-only, tidak mengubah file apa pun.

## Masalah yang diketahui (prioritas)
- `FeatureGrid.astro` punya `.features { background: #fff; }` → menghilangkan foto. Harus transparan/kaca.
- `LearningMap.astro` punya gradient putih opak → foto hilang di seksi peta belajar.
- `FinalCta.astro` punya gradient opak → foto hilang di seksi penutup.
- Halaman dalam mungkin perlu permukaan kaca agar teks terbaca di atas foto tanpa menutup foto.
