# MutuLab

Platform belajar & media ajar interaktif untuk **Design of Experiments (DOE), Metode Taguchi, dan Acceptance Sampling**.

Berdasarkan PRD v1.4 — 100% statis, tanpa login, tanpa database, berjalan penuh di browser.

## Gaya visual

*Sky-Blue Frosted Glassmorphism × Mountain Landscape × Bento Command Center* — langit biru jenuh, pegunungan SVG berlapis, panel kaca melayang, topbar kapsul gelap, tombol pil hitam, judul serif dengan penekanan italic.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # output ke dist/
npm run preview
npm test         # unit test calc-core (Vitest)
```

## Struktur

| Folder | Isi |
| --- | --- |
| `src/data/` | Metadata modul, navigasi, preset studi kasus, bank soal |
| `src/lib/calc-core/` | Mesin komputasi statistik murni (F, ANOVA, Yates, Taguchi, Sampling) + tes |
| `src/content/modules/` | Konten 6 modul, masing-masing 6 tahap pembelajaran |
| `src/components/brand/` | Topbar kapsul, logo, lanskap pegunungan SVG |
| `src/components/ui/` | Kerangka kalkulator, KaTeX, Board Reveal, tabel statistik |
| `src/components/calculators/` | Kalkulator CRD, RCBD, faktorial 2ᵏ, Taguchi, Sampling |
| `src/components/charts/` | Grafik SVG kustom (interaction plot, main effects, Q-Q) |
| `src/components/sandbox/` | Simulator OFAT vs faktorial, variansi, interaksi, inspeksi lot |
| `src/components/teaching/` | Mode Mengajar & panel preset |
| `src/styles/` | Design tokens & gaya global |

## Rute

`/` · `/modul/` · `/modul/[slug]/` · `/kalkulator/` · `/kalkulator/{crd-anova,rcbd-anova,faktorial-2k,taguchi-sn,sampling-oc}/` · `/simulator/` · `/latihan/` · `/cheat-sheet/` · `/panduan/` · `/privasi/`

## Prinsip teknis

- Astro 5 + React islands, TypeScript strict, Vitest.
- `calc-core` bebas dari UI; pembulatan hanya saat tampil.
- Progres di `localStorage`, langkah Board Reveal di `sessionStorage`, skenario dibagikan via parameter URL.
- Self-hosted font (Instrument Serif untuk judul, Manrope untuk seluruh UI & angka) + KaTeX agar offline tetap berfungsi. Tidak ada font monospace terpisah; angka memakai Manrope dengan `tabular-nums`.
- Service worker menyimpan cangkang aplikasi.
- Tanpa cookie, tanpa data pribadi, tanpa `eval`.

## Background foto & efek UI

Foto lanskap yang diberikan dioptimalkan oleh `scripts/optimize-image.mjs` menjadi WebP responsif (480/960/1440/1920 px) plus placeholder blur 28 px: **3,65 MB → 289 KB** total. Jalankan ulang dengan:

```bash
node scripts/optimize-image.mjs path/ke/gambar.jpg
```

Foto dipakai sebagai background penuh di hero dan background halus (dengan veil 88%) di halaman lain. Di Mode Mengajar foto dan semua efek dekoratif dimatikan demi kontras ≥7:1.

Efek UI diadaptasi dari Aceternity UI dan React Bits (MIT). Rincian dan atribusi ada di `src/components/effects/CREDITS.md`:

- `TextReveal` (stagger kata pada headline), `Spotlight` (sorotan hero)
- `FloatingNav` (topbar menyembunyikan diri saat scroll turun)
- `SpotlightCard` (cahaya mengikuti pointer pada jendela pratinjau)
- `ClickSpark` (percikan halus saat klik, nonaktif pada Mode Mengajar)

Semua efek memakai CSS/keyframes atau canvas mandiri, tanpa menambah dependency runtime baru, dan menghormati `prefers-reduced-motion`.
