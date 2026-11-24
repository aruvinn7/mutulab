import type { ModuleContent } from './types';

const content: ModuleContent = {
  slug: 'crd-anova',
  id: 'm2',
  objectives: [
    'Menyusun Rancangan Acak Lengkap (CRD) untuk membandingkan banyak perlakuan.',
    'Memahami dekomposisi SSₜₒₜₐₗ = SSₜᵣₑₐₜₘₑₙₜ + SSₑᵣᵣₒᵣ.',
    'Menyusun tabel ANOVA lengkap dan mengambil keputusan uji F.',
    'Melakukan uji lanjut Fisher LSD serta memeriksa asumsi residual.',
  ],
  stages: {
    kenapa: {
      paragraphs: [
        'Peneliti pupuk ingin membandingkan empat dosis terhadap hasil panen. Bila hanya ada dua perlakuan, uji-t dua sampel sudah cukup. Begitu perlakuannya menjadi tiga atau lebih, melakukan banyak uji-t secara terpisah menaikkan peluang kesimpulan salah: dengan α = 0,05 per uji dan tiga perbandingan, peluang melakukan sedikitnya satu kesalahan tipe I naik menjadi sekitar 1 − 0,95³ ≈ 14%. ANOVA mengatasi ini dengan satu uji simultan pada taraf α yang terkendali.',
        'Rancangan Acak Lengkap (Completely Randomized Design / CRD) adalah rancangan paling sederhana: unit-unit eksperimen yang dianggap homogen dialokasikan secara acak ke semua perlakuan. Kesederhanaannya justru menuntut kehati-hatian—bila unit tidak homogen, variasi antarunit masuk ke galat dan uji menjadi kurang sensitif. Itulah sebabnya randomisasi menjadi wajib, dan akan dibahas lebih lanjut pada modul blocking.',
        'Inti ANOVA bukan sekadar tabel angka, melainkan gagasan dekomposisi variasi: total keragaman data dibagi menjadi bagian yang dijelaskan oleh perlakuan dan bagian yang tersisa sebagai galat. Perbandingan keduanya—melalui statistik F—menjawab pertanyaan apakah perbedaan antarperlakuan lebih besar daripada kebisingan alami proses.',
      ],
      bullets: [
        'Uji-t berulang menggelembungkan familywise error rate.',
        'CRD cocok untuk unit eksperimen yang relatif homogen.',
        'ANOVA memisahkan sinyal perlakuan dari galat acak.',
      ],
    },

    konsep: {
      paragraphs: [
        'Model CRD ditulis Yᵢⱼ = μ + τᵢ + εᵢⱼ, dengan μ rata-rata umum, τᵢ efek perlakuan ke-i, dan εᵢⱼ galat acak yang diasumsikan berdistribusi normal dengan rata-rata 0 dan variansi σ². Hipotesis yang diuji adalah H₀: τ₁ = τ₂ = … = τₐ = 0 (semua perlakuan sama) melawan H₁: minimal satu τᵢ berbeda. Perhatikan bahwa ANOVA menguji "ada perbedaan", bukan langsung "perlakuan mana yang terbaik".',
        'Dekomposisi jumlah kuadrat mengikuti identitas aljabar. Jumlah kuadrat total dihitung dari seluruh observasi terhadap rata-rata umum; jumlah kuadrat perlakuan mengukur penyimpangan rata-rata tiap perlakuan terhadap rata-rata umum; sisanya adalah jumlah kuadrat galat. Setiap jumlah kuadrat dibagi derajat kebebasannya menghasilkan Mean Square (MS). Statistik uji adalah F = MSₜᵣₑₐₜₘₑₙₜ / MSₑᵣᵣₒᵣ, yang di bawah H₀ mengikuti distribusi F dengan df (a − 1, N − a).',
        'Jika H₀ ditolak, uji lanjut diperlukan untuk mengetahui pasangan mana yang berbeda. Fisher LSD menghitung ambang LSD = t_{α/2, N−a}·√(2MSₑ/n) dan membandingkannya dengan selisih dua rata-rata. Metode ini paling sensitif, tetapi hanya boleh dipakai setelah uji F signifikan; untuk banyak perbandingan, metode seperti Tukey lebih aman terhadap inflasi α.',
        'Kesimpulan ANOVA hanya valid bila asumsinya masuk akal: observasi independen, residual berdistribusi normal, dan variansi homogen antarperlakuan. Normalitas residual dibaca visual lewat Q-Q plot—titik-titik yang mengikuti garis lurus menandakan asumsi wajar. Homogenitas dapat diperiksa dengan uji Levene (varian Brown–Forsythe). Bila asumsi dilanggar, pertimbangkan transformasi data atau rancangan dengan blok.',
      ],
      formulas: [
        {
          tex: 'SS_{\\text{Total}}=\\sum_{i=1}^{a}\\sum_{j=1}^{n} y_{ij}^2-\\frac{y_{..}^2}{N}',
          caption: 'Jumlah kuadrat total; N = a × n.',
        },
        {
          tex: 'SS_{\\text{Treatment}}=\\sum_{i=1}^{a}\\frac{y_{i.}^2}{n}-\\frac{y_{..}^2}{N},\\qquad SS_{\\text{Error}}=SS_{\\text{Total}}-SS_{\\text{Treatment}}',
          caption: 'Dekomposisi variasi pada CRD seimbang.',
        },
        {
          tex: 'F=\\frac{MS_{\\text{Treatment}}}{MS_{\\text{Error}}}\\sim F_{a-1,\\,N-a}',
          caption: 'Statistik uji untuk H₀: semua efek perlakuan nol.',
        },
        {
          tex: 'LSD=t_{\\alpha/2,\\,N-a}\\sqrt{\\frac{2MS_{\\text{Error}}}{n}}',
          caption: 'Ambang beda nyata terkecil (Fisher LSD).',
        },
      ],
      bullets: [
        'df treatment = a − 1; df error = N − a; df total = N − 1.',
        'SS total = SS treatment + SS error (identitas, bukan aproksimasi).',
        'Tolak H₀ bila Fₕᵢₜᵤₙɡ > Fₖᵣᵢₜᵢₛ atau p-value < α.',
        'Cek Q-Q plot residual dan uji Levene sebelum mempercayai p-value.',
      ],
      callout: {
        tone: 'warn',
        title: 'Urutan yang benar',
        body: 'Uji F signifikan lebih dulu, baru uji lanjut. Fisher LSD yang dijalankan tanpa uji F pendahulu berisiko besar menghasilkan perbandingan palsu.',
      },
    },

    contoh: {
      paragraphs: [
        'Perhatikan bahwa SS error diperoleh sebagai sisa, bukan dihitung langsung per sel. Cara ini valid karena dekomposisi bersifat identitas algebra; selisih pembulatan kecil bisa muncul bila Anda menghitung dari rata-rata perlakuan.',
        'Kasus fiktif: tiga dosis pupuk (P0 kontrol, P1, P2) diuji pada empat petak setiap dosis dengan CRD. Responsnya adalah hasil panen (kg). Data: P0 = 42, 45, 41, 44; P1 = 50, 53, 49, 52; P2 = 47, 49, 46, 48. Kita hitung ANOVA lengkap pada taraf α = 0,05.',
      ],
      steps: [
        {
          title: 'Rekap data dan jumlah total',
          formula: 'T_i=\\sum_{j=1}^{n} y_{ij},\\qquad T=\\sum_i T_i,\\qquad N=a n',
          substitution: 'T_0=42+45+41+44=172;\\quad T_1=50+53+49+52=204;\\quad T_2=47+49+46+48=190;\\quad T=566,\\ N=12',
          result: 'Rata-rata perlakuan: P0 = 43,0; P1 = 51,0; P2 = 47,5. Rata-rata umum = 566/12 = 47,1667.',
        },
        {
          title: 'Jumlah kuadrat total',
          formula: 'SS_T=\\sum y_{ij}^2-\\frac{T^2}{N}',
          substitution: '\\sum y_{ij}^2=26850;\\qquad \\frac{T^2}{N}=\\frac{566^2}{12}=26696{,}3333',
          result: 'SSₜₒₜₐₗ = 26.850 − 26.696,3333 = 153,6667.',
        },
        {
          title: 'Jumlah kuadrat perlakuan',
          formula: 'SS_{\\text{Tr}}=\\sum_i \\frac{T_i^2}{n}-\\frac{T^2}{N}',
          substitution: '\\frac{172^2+204^2+190^2}{4}=\\frac{107300}{4}=26825',
          result: 'SSₜᵣₑₐₜₘₑₙₜ = 26.825 − 26.696,3333 = 128,6667.',
        },
        {
          title: 'Jumlah kuadrat galat',
          formula: 'SS_E=SS_T-SS_{\\text{Tr}}',
          substitution: 'SS_E=153{,}6667-128{,}6667',
          result: 'SSₑᵣᵣₒᵣ = 25,0000.',
        },
        {
          title: 'Tabel ANOVA dan uji F',
          formula: 'F=\\frac{MS_{\\text{Tr}}}{MS_E}=\\frac{128{,}6667/2}{25/9}',
          substitution: 'MS_{\\text{Tr}}=64{,}3333;\\quad MS_E=2{,}7778;\\quad F_{0{,}05;2;9}\\approx 4{,}256',
          result: 'Fₕᵢₜᵤₙɡ = 23,1600 > 4,256 → tolak H₀; p-value ≈ 0,0003.',
          detail: 'Ada bukti kuat bahwa minimal satu dosis pupuk menghasilkan rata-rata panen yang berbeda.',
        },
        {
          title: 'Uji lanjut Fisher LSD',
          formula: 'LSD=t_{0{,}025;9}\\sqrt{\\frac{2MS_E}{n}}=2{,}262\\sqrt{\\frac{2(2{,}7778)}{4}}',
          result: 'LSD ≈ 2,6658 kg. Selisih |51,0 − 43,0| = 8,0; |47,5 − 43,0| = 4,5; |51,0 − 47,5| = 3,5—semuanya melebihi LSD, sehingga ketiga pasangan berbeda nyata.',
          detail: 'Urutan hasil panen: P1 > P2 > P0. Pemilihan dosis akhir tetap mempertimbangkan biaya pupuk.',
        },
      ],
      table: {
        caption: 'Tabel ANOVA satu arah (α = 0,05)',
        head: ['Sumber', 'SS', 'df', 'MS', 'F', 'p'],
        rows: [
          ['Perlakuan', '128,6667', '2', '64,3333', '23,1600', '0,0003'],
          ['Galat', '25,0000', '9', '2,7778', '—', '—'],
          ['Total', '153,6667', '11', '—', '—', '—'],
        ],
      },
    },

    coba: {
      paragraphs: [
        'Bandingkan pula hasil kalkulator dengan tabel ANOVA pada langkah contoh; selisih yang lebih besar dari pembulatan menandakan ada data yang salah ketik.',
        'Buka kalkulator CRD ANOVA untuk memasukkan data Anda sendiri. Kalkulator menampilkan rumus, substitusi, tabel ANOVA, dan keputusan secara bertahap—cocok untuk memverifikasi hitungan manual laporan praktikum. Sandbox Variance Decomposition memungkinkan Anda menggeser besaran galat dan melihat bagaimana F berubah tanpa mengubah data.',
      ],
      bullets: [
        'Ubah satu nilai data: bagaimana SSₑᵣᵣₒᵣ dan F bergerak?',
        'Perbesar galat secara drastis: kapan F gagal melewati Fₖᵣᵢₜᵢₛ?',
        'Periksa Q-Q plot residual—apakah titik-titiknya masih mengikuti garis?',
      ],
      callout: {
        tone: 'info',
        title: 'Pertanyaan pemantik',
        body: 'Jika SS treatment tetap tetapi SS error membesar, apa yang terjadi pada kekuatan uji? Kaitkan dengan prinsip replikasi Fisher.',
      },
    },

    latihan: {
      paragraphs: [
        'Gunakan derajat kebebasan sebagai pemeriksa cepat: bila angkanya tidak konsisten dengan jumlah perlakuan dan replikasi, berhenti dan periksa kembali perhitungan.',
        'Coba hitung sendiri sebelum membuka kunci. Fokus pada logika dekomposisi, bukan hafalan angka contoh.',
      ],
      prompts: [
        'Sebuah CRD dengan a = 4 dan n = 5 memiliki N berapa? Berapa df treatment, df error, dan df total?',
        'Jika SSₜₒₜₐₗ = 200 dan SSₜᵣₑₐₜₘₑₙₜ = 140, berapa SSₑᵣᵣₒᵣ?',
        'Mengapa Fisher LSD sebaiknya hanya dipakai setelah uji F signifikan?',
      ],
      cheat: [
        { label: 'Kunci 1', note: 'N = 20; df treatment = 3; df error = 16; df total = 19.' },
        { label: 'Kunci 2', note: 'SS error = 200 − 140 = 60.' },
        { label: 'Kunci 3', note: 'Tanpa uji F pendahulu, banyak perbandingan menaikkan familywise error rate di atas α.' },
      ],
    },

    ringkasan: {
      paragraphs: [
        'Yang sering salah bukan rumus F, melainkan asumsi di baliknya. Luangkan waktu untuk melihat residual—grafik Q-Q yang baik memberi keyakinan lebih besar daripada p-value yang tampak meyakinkan.',
        'CRD dan ANOVA mengubah perbandingan banyak perlakuan menjadi satu uji yang terkendali. Kunci keberhasilannya adalah dekomposisi variasi yang benar, derajat kebebasan yang tepat, serta pemeriksaan asumsi residual. Setelah modul ini, Anda siap menangani situasi di mana unit eksperimen tidak homogen—itulah peran blocking pada modul berikutnya.',
      ],
    },

  },

  cheatSheet: [
      {
        label: 'Model',
        tex: 'Y_{ij}=\\mu+\\tau_i+\\varepsilon_{ij},\\qquad \\varepsilon_{ij}\\sim N(0,\\sigma^2)',
        note: 'H₀: τ₁ = … = τₐ = 0.',
      },
      {
        label: 'Dekomposisi',
        tex: 'SS_T=SS_{\\text{Tr}}+SS_E',
        note: 'df: (N−1) = (a−1) + (N−a).',
      },
      {
        label: 'Statistik uji',
        tex: 'F=MS_{\\text{Tr}}/MS_E\\sim F_{a-1,N-a}',
        note: 'Tolak H₀ bila F > Fₖᵣᵢₜ atau p < α.',
      },
      {
        label: 'Fisher LSD',
        tex: 'LSD=t_{\\alpha/2,N-a}\\sqrt{2MS_E/n}',
        note: 'Bandingkan |ȳᵢ − ȳⱼ| dengan LSD.',
      },
      {
        label: 'Diagnostik',
        note: 'Q-Q plot residual untuk normalitas; uji Levene untuk homogenitas variansi.',
      },
    ],

    related: [
      { label: 'Kalkulator CRD ANOVA', href: '/kalkulator/crd-anova/', kind: 'kalkulator' },
      { label: 'Sandbox Dekomposisi Variansi', href: '/simulator/', kind: 'simulator' },
      { label: 'Blocking, RCBD & Latin Square', href: '/modul/blocking-rcbd/', kind: 'modul' },
      { label: 'Tabel F & Referensi', href: '/cheat-sheet/', kind: 'referensi' },
    ],
};

export default content;
