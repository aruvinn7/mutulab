/**
 * Preset studi kasus kuliah (F-02) — seluruh data bersifat orisinal fiktif realistis.
 * Skema mengikuti `Preset` di src/lib/types.ts.
 *
 * Bentuk `data` per modul:
 *  - m0: number[]   → jumlah unit cacat yang ditemukan pada beberapa lot sampel
 *  - m2: number[][] → grup perlakuan (baris) × ulangan (kolom)
 *  - m3: number[][] → perlakuan (baris) × blok (kolom)
 *  - m4: number[]   → pengamatan 2^k berurutan, tiap sel berisi `replicates` angka,
 *                     urutan standar (1), a, b, ab, …
 *  - m5: number[][] → baris orthogonal array × replikasi pengamatan (noise)
 *
 * Catatan: karena `Preset.parameter` hanya menerima number | string | number[],
 * daftar nama faktor (`names`, `factors`) ditulis sebagai string yang dipisah "; ".
 */

import type { Preset } from '../lib/types';

export const PRESETS: Preset[] = [
  // ---------------------------------------------------------------- m0
  {
    id: 'm0-katup-kompresor',
    judul: 'Inspeksi katup kompresor',
    modul: 'm0',
    kategori: 'dasar',
    parameter: { n: 20, c: 1, N: 500, aql: 0.02, ltpd: 0.08, distribution: 'binomial', satuan: 'unit cacat per sampel' },
    data: [0, 1, 0, 2, 0, 1, 0, 0, 1, 2],
    tujuan_ajar: 'Membaca peluang penerimaan lot (Pa) dari kurva OC dan membedakan risiko produsen (α) dengan risiko konsumen (β).',
    pertanyaan_pemantik: [
      'Pada p = 2%, berapa peluang lot diterima? Apakah angka itu sudah sesuai AQL?',
      'Lot ke-3 memiliki 2 cacat sementara c = 1. Keputusan apa yang diambil dan siapa yang menanggung risikonya?',
      'Mengapa inspeksi akhir tidak mencegah cacat, melainkan hanya menyaringnya?',
    ],
  },
  {
    id: 'm0-kabel-optik',
    judul: 'Penerimaan batch kabel optik',
    modul: 'm0',
    kategori: 'efek',
    parameter: { n: 50, c: 2, N: 1000, aql: 0.01, ltpd: 0.06, distribution: 'binomial', satuan: 'putus serat per rol' },
    data: [1, 0, 2, 3, 0, 1, 2, 0, 1, 4],
    tujuan_ajar: 'Mengamati bagaimana ukuran sampel yang lebih besar menajamkan kurva OC dan menurunkan AOQL.',
    pertanyaan_pemantik: [
      'Bandingkan kurva OC preset ini dengan preset katup: mana yang lebih curam? Mengapa?',
      'Jika c dinaikkan menjadi 3, bagaimana perubahan Pa pada LTPD?',
      'Apa konsekuensi biaya inspeksi jika n diperbesar?',
    ],
  },
  {
    id: 'm0-lot-kecil-presisi',
    judul: 'Lot kecil komponen presisi',
    modul: 'm0',
    kategori: 'pelanggaran',
    parameter: { n: 30, c: 0, N: 60, aql: 0.01, ltpd: 0.1, distribution: 'binomial', catatan: 'Lot kecil: pendekatan binomial mulai menyimpang dari hipergeometrik' },
    data: [0, 0, 1, 0, 0, 0, 2, 0, 0, 1],
    tujuan_ajar: 'Mendiskusikan batas validitas pendekatan binomial ketika fraksi sampel terhadap lot besar (n/N = 0,5).',
    pertanyaan_pemantik: [
      'Mengapa model binomial kurang tepat ketika n mendekati N?',
      'Apakah c = 0 terlalu ketat untuk proses dengan AQL 1%?',
      'Bagaimana cara mengomunikasikan keterbatasan ini kepada konsumen?',
    ],
  },

  // ---------------------------------------------------------------- m2
  {
    id: 'm2-suhu-oven',
    judul: 'Suhu oven & kekuatan tarik',
    modul: 'm2',
    kategori: 'dasar',
    parameter: { alpha: 0.05, faktor: 'Suhu oven (°C)', level: [160, 180, 200], respons: 'Kekuatan tarik (MPa)', ulangan: 4 },
    data: [[42, 39, 41, 40], [47, 45, 46, 48], [44, 43, 45, 42]],
    tujuan_ajar: 'Menyusun tabel ANOVA satu arah dari data RAL seimbang dan membaca keputusan uji F pada taraf 5%.',
    pertanyaan_pemantik: [
      'Level mana yang memiliki rata-rata tertinggi? Apakah selisihnya cukup besar dibanding MS Error?',
      'Bagaimana jika ulangan di level 180 °C hanya 2 kali—apa yang terjadi pada df Error?',
      'Apa arti pernyataan "Tolak H₀" bagi proses pengecatan ini?',
    ],
  },
  {
    id: 'm2-dosis-aditif',
    judul: 'Dosis aditif & daya tutup cat',
    modul: 'm2',
    kategori: 'efek',
    parameter: { alpha: 0.05, faktor: 'Dosis aditif (%)', level: [1, 2, 3, 4], respons: 'Daya tutup (µm)', ulangan: 3 },
    data: [[12, 13, 12], [16, 15, 17], [19, 18, 20], [22, 21, 23]],
    tujuan_ajar: 'Mengenali efek nyata (monoton) dan membandingkan SS Perlakuan terhadap SS Error ketika galat kecil.',
    pertanyaan_pemantik: [
      'Perkiraan besarnya F-hitung sebelum menghitung—apakah akan jauh di atas 1?',
      'Apakah hubungan dosis–daya tutup linier? Uji apa yang bisa menjawabnya?',
      'Jika biaya aditif mahal, level mana yang paling masuk akal?',
    ],
  },
  {
    id: 'm2-variansi-tidak-sama',
    judul: 'Kecepatan mixer & viskositas',
    modul: 'm2',
    kategori: 'pelanggaran',
    parameter: { alpha: 0.05, faktor: 'Kecepatan mixer (rpm)', level: [400, 600, 800], respons: 'Viskositas (cP)', ulangan: 4, catatan: 'Variansi antar level sangat tidak homogen' },
    data: [[30, 31, 30, 29], [40, 25, 55, 30], [50, 48, 52, 49]],
    tujuan_ajar: 'Menunjukkan bahwa F-hitung bisa menyesatkan ketika asumsi homogenitas variansi (homoskedastisitas) dilanggar.',
    pertanyaan_pemantik: [
      'Level mana yang variansinya jauh lebih besar dari yang lain?',
      'Apakah MS Error masih representatif untuk semua level?',
      'Transformasi apa yang mungkin menstabilkan variansi data ini?',
    ],
  },

  // ---------------------------------------------------------------- m3
  {
    id: 'm3-shift-cutter',
    judul: 'Jenis cutter antar shift',
    modul: 'm3',
    kategori: 'dasar',
    parameter: { alpha: 0.05, perlakuan: 'Jenis cutter', level: [1, 2, 3, 4], blok: 'Shift kerja', blokCount: 3 },
    data: [[78, 80, 79], [82, 84, 83], [85, 86, 84], [81, 83, 82]],
    tujuan_ajar: 'Memisahkan SS Blok dari SS Error agar uji F terhadap jenis cutter lebih sensitif.',
    pertanyaan_pemantik: [
      'Berapa SS Blok? Apakah shift memberi kontribusi yang tidak kecil?',
      'Jika blok diabaikan dan dianalisis sebagai RAL, ke mana SS Blok akan masuk?',
      'Mana yang lebih kecil: MS Error RCBD atau MS Error RAL pada data ini?',
    ],
  },
  {
    id: 'm3-batch-bahan',
    judul: 'Katalis & batch bahan baku',
    modul: 'm3',
    kategori: 'efek',
    parameter: { alpha: 0.05, perlakuan: 'Konsentrasi katalis (%)', level: [2, 4, 6], blok: 'Batch bahan baku', blokCount: 4 },
    data: [[52, 54, 53, 55], [60, 61, 59, 62], [57, 58, 56, 59]],
    tujuan_ajar: 'Menghitung dekomposisi SS Treatment + SS Block + SS Error pada RCBD dengan 3 perlakuan dan 4 blok.',
    pertanyaan_pemantik: [
      'Apakah kenaikan konsentrasi 4% → 6% masih menaikkan viskositas?',
      'Berapa df Error pada rancangan ini?',
      'Apakah urutan perlakuan di dalam setiap blok perlu diacak?',
    ],
  },
  {
    id: 'm3-blok-interaksi',
    judul: 'Metode pengeringan & lokasi ruang',
    modul: 'm3',
    kategori: 'pelanggaran',
    parameter: { alpha: 0.05, perlakuan: 'Metode pengeringan', level: [1, 2, 3], blok: 'Lokasi ruang', blokCount: 4, catatan: 'Efek blok tidak aditif — ada interaksi blok × perlakuan' },
    data: [[10, 12, 20, 25], [15, 18, 30, 36], [11, 14, 22, 28]],
    tujuan_ajar: 'Memperlihatkan konsekuensi pelanggaran model aditif RCBD: interaksi blok × perlakuan masuk ke SS Error.',
    pertanyaan_pemantik: [
      'Apakah perbedaan antar blok sama untuk semua metode?',
      'Mengapa MS Error membengkak pada data seperti ini?',
      'Alternatif rancangan apa yang bisa mengatasi gradien lokasi yang tidak seragam?',
    ],
  },

  // ---------------------------------------------------------------- m4
  {
    id: 'm4-pengeringan-2x2',
    judul: 'Pengeringan 2² & daya rekat',
    modul: 'm4',
    kategori: 'dasar',
    parameter: { k: 2, replicates: 2, alpha: 0.05, names: 'Suhu pengeringan; Waktu pengeringan', order: '(1), a, b, ab' },
    data: [58, 60, 63, 65, 61, 62, 70, 71],
    tujuan_ajar: 'Menghitung efek utama A dan B dari kontras Yates pada faktorial 2² dengan dua replikasi.',
    pertanyaan_pemantik: [
      'Efek mana yang lebih besar: suhu atau waktu?',
      'Apakah kombinasi ab selalu paling baik? Bagaimana jika biaya energi dipertimbangkan?',
      'Mengapa replikasi diperlukan sebelum membicarakan signifikansi?',
    ],
  },
  {
    id: 'm4-tekanan-cetak',
    judul: 'Tekanan cetak & kecepatan conveyor',
    modul: 'm4',
    kategori: 'efek',
    parameter: { k: 2, replicates: 2, alpha: 0.05, names: 'Tekanan cetak; Kecepatan conveyor' },
    data: [20, 21, 35, 36, 22, 21, 37, 36],
    tujuan_ajar: 'Membedakan efek utama yang besar dengan interaksi yang hampir nol menggunakan kontras Yates.',
    pertanyaan_pemantik: [
      'Berapa efek utama tekanan cetak? Apakah mirip di kedua level kecepatan?',
      'Jika grafik interaksinya sejajar, apa kesimpulannya?',
      'Faktor mana yang sebaiknya dikunci dulu pada proses produksi?',
    ],
  },
  {
    id: 'm4-interaksi-crossover',
    judul: 'Interaksi silang suhu–perekat',
    modul: 'm4',
    kategori: 'interaksi',
    parameter: { k: 2, replicates: 2, alpha: 0.05, names: 'Suhu oven; Jenis perekat' },
    data: [30, 31, 45, 46, 44, 45, 31, 32],
    tujuan_ajar: 'Mengenali interaksi silang (crossover): efek suhu berbalik arah tergantung jenis perekat.',
    pertanyaan_pemantik: [
      'Mengapa efek utama A bisa menyesatkan pada kasus ini?',
      'Kombinasi mana yang memberi daya rekat tertinggi? Apakah sama dengan kombinasi terbaik tiap faktor secara terpisah?',
      'Bagaimana bentuk interaction plot untuk data ini?',
    ],
  },
  {
    id: 'm4-tanpa-replikasi',
    judul: 'Faktorial tanpa replikasi',
    modul: 'm4',
    kategori: 'pelanggaran',
    parameter: { k: 2, replicates: 1, alpha: 0.05, names: 'Suhu; Waktu', catatan: 'n = 1: galat murni tidak dapat diestimasi' },
    data: [30, 32, 28, 40],
    tujuan_ajar: 'Menunjukkan batas faktorial 2² tanpa replikasi: efek tetap dihitung, tetapi uji F tidak sah.',
    pertanyaan_pemantik: [
      'Mengapa tidak ada p-value untuk efek pada desain ini?',
      'Interaksi yang diasumsikan sebagai galat—apakah aman?',
      'Tambahan replikasi di titik mana yang paling menguntungkan?',
    ],
  },

  // ---------------------------------------------------------------- m5
  {
    id: 'm5-l4-goresan',
    judul: 'L4 & goresan permukaan',
    modul: 'm5',
    kategori: 'dasar',
    parameter: { oa: 'L4', characteristic: 'smaller', factors: 'Suhu oven; Waktu pengeringan; Jenis pelapis', target: 0, replicates: 2 },
    data: [[3, 4], [2, 3], [5, 4], [2, 2]],
    tujuan_ajar: 'Menghitung rasio S/N smaller-the-better per baris L4 dan menyusun tabel respon (Delta & Rank).',
    pertanyaan_pemantik: [
      'Baris mana yang memiliki S/N paling tinggi (paling baik)?',
      'Mengapa rasio S/N lebih informatif daripada sekadar rata-rata goresan?',
      'Pada level berapa tiap faktor sebaiknya diatur?',
    ],
  },
  {
    id: 'm5-l9-kekuatan',
    judul: 'L9 & kekuatan tarik serat',
    modul: 'm5',
    kategori: 'efek',
    parameter: { oa: 'L9', characteristic: 'larger', factors: 'Suhu; Waktu; Tekanan; Konsentrasi', replicates: 2 },
    data: [[42, 44], [48, 50], [45, 46], [51, 53], [47, 49], [55, 54], [44, 46], [52, 51], [49, 50]],
    tujuan_ajar: 'Memakai S/N larger-the-better pada L9 dengan empat faktor tiga level dan menentukan level optimal.',
    pertanyaan_pemantik: [
      'Faktor mana yang memiliki Delta S/N terbesar?',
      'Apakah prediksi S/N optimum bisa langsung dipercaya tanpa percobaan konfirmasi?',
      'Bagaimana jika target pelanggan adalah kekuatan minimal 50 MPa?',
    ],
  },
  {
    id: 'm5-l8-nominal',
    judul: 'L8 & ketebalan nominal 25 mm',
    modul: 'm5',
    kategori: 'interaksi',
    parameter: { oa: 'L8', characteristic: 'nominal', factors: 'Suhu; Waktu; Aliran udara; Jenis cetakan', target: 25, replicates: 3 },
    data: [[24, 25, 26], [25, 26, 24], [23, 25, 25], [26, 27, 25], [24, 24, 25], [25, 26, 27], [23, 24, 24], [26, 25, 26]],
    tujuan_ajar: 'Menerapkan S/N nominal-the-better dan mendiskusikan peran faktor yang memengaruhi variasi, bukan hanya rata-rata.',
    pertanyaan_pemantik: [
      'Baris mana yang rata-ratanya paling dekat 25 mm tetapi variansinya besar?',
      'Mengapa S/N nominal memuat variansi s²?',
      'Faktor mana yang sebaiknya dipilih untuk menekan penyebaran ketebalan?',
    ],
  },
  {
    id: 'm5-tanpa-noise-factor',
    judul: 'L4 tanpa replikasi noise',
    modul: 'm5',
    kategori: 'pelanggaran',
    parameter: { oa: 'L4', characteristic: 'smaller', factors: 'Suhu; Waktu; Pelapis', replicates: 1, catatan: 'Tanpa replikasi noise, estimasi S/N tidak stabil' },
    data: [[3], [2], [5], [2]],
    tujuan_ajar: 'Menunjukkan mengapa Taguchi memerlukan arranger replikasi/noise: satu pengamatan per baris tidak cukup untuk mengukur ketangguhan.',
    pertanyaan_pemantik: [
      'Apakah S/N masih bisa dihitung secara matematis pada data ini? Apakah bermakna?',
      'Apa yang terjadi pada variasi yang tidak teramati?',
      'Bagaimana merancang outer array sederhana untuk kasus ini?',
    ],
  },
];

/** Preset untuk satu modul (m0, m2, m3, m4, m5). */
export function presetsFor(modul: string): Preset[] {
  return PRESETS.filter((p) => p.modul === modul);
}

export function presetById(id: string): Preset | undefined {
  return PRESETS.find((p) => p.id === id);
}
