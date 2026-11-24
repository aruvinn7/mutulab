# Kredit komponen efek

Komponen di folder ini diadaptasi dari proyek open-source berikut. Kode aslinya diperoleh dari registry publik masing-masing, lalu disederhanakan agar tidak memerlukan Tailwind, GSAP, `motion`, atau `three.js`, serta disesuaikan dengan design token MutuLab dan Mode Mengajar.

| Komponen MutuLab | Sumber | Lisensi |
| --- | --- | --- |
| `TextReveal.tsx` | Aceternity UI, *Text Generate Effect* (Manu Arora) | MIT |
| `Spotlight.astro` | Aceternity UI, *Spotlight* (Manu Arora) | MIT |
| `FloatingNav` (logika di `brand/Topbar.astro`) | Aceternity UI, *Floating Navbar* (Manu Arora) | MIT |
| `ClickSpark.tsx` | React Bits, *ClickSpark* (David Haz) | MIT |
| `SpotlightCard.tsx` | React Bits, *SpotlightCard* (David Haz) | MIT |

Referensi:
- https://ui.aceternity.com/components/text-generate-effect
- https://ui.aceternity.com/components/spotlight
- https://ui.aceternity.com/components/floating-navbar
- https://reactbits.dev/backgrounds/click-spark
- https://reactbits.dev/cards/spotlight-card

Perubahan utama: animasi berbasis CSS/stagger tanpa dependency berat, penghormatan `prefers-reduced-motion`, dan penonaktifan otomatis seluruh efek dekoratif saat `html[data-teaching='true']` sesuai PRD §6.8.
