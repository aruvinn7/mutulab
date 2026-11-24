import type { ModuleContent } from './types';

const content: ModuleContent = {
  slug: 'pengantar-kualitas-sampling',
  id: 'm0',
  objectives: [
    'Membedakan variasi umum (common cause) dan variasi khusus (assignable cause).',
    'Menghitung peluang penerimaan lot dengan distribusi Binomial dan Poisson.',
    'Membaca kurva OC serta menafsirkan AQL, LTPD, α, β, AOQ, dan ATI.',
    'Menjelaskan mengapa inspeksi akhir tidak menggantikan perancangan kualitas (jembatan ke DOE).',
  ],
  stages: {
    kenapa: {
      paragraphs: [
        'Dalam rantai pasok manufaktur, keputusan menerima atau menolak lot hampir selalu diambil dari hasil inspeksi. Seorang quality engineer di pabrik komponen elektronik, misalnya, menerima kiriman 1.000 resistor dari pemasok. Memeriksa satu per satu—inspeksi 100%—memakan waktu dan biaya; pada pengujian destruktif seperti uji tarik atau uji umur pakai, inspeksi penuh bahkan merusak seluruh lot. Di sinilah acceptance sampling hadir: ambil sampel acak berukuran n, hitung jumlah unit cacat d, lalu putuskan berdasarkan aturan yang sudah disepakati.',
        'Keputusan itu tidak pernah bebas risiko. Produsen bisa saja mengirim lot yang sebenarnya baik, tetapi sampelnya kebetulan memuat cukup banyak cacat sehingga lot ditolak—itulah risiko produsen α, yang melekat pada AQL (Acceptable Quality Level). Sebaliknya, lot buruk bisa lolos karena sampelnya kebetulan bersih—itulah risiko konsumen β, yang melekat pada LTPD (Lot Tolerance Percent Defective). Merancang rencana sampling berarti menyeimbangkan kedua risiko ini secara sadar, bukan menebak.',
        'Ada alasan yang lebih mendasar lagi: inspeksi hanya menyaring cacat yang sudah terjadi. Ia tidak mengubah proses yang menyebabkan cacat itu muncul. Variasi proses—baik yang wajar maupun yang tidak wajar—akan terus menghasilkan cacat selama sumbernya tidak disentuh. Modul ini ditutup dengan jembatan konseptual menuju Design of Experiments (DOE): mencegah cacat dengan memahami hubungan sebab-akibat proses, bukan sekadar memisahkannya di akhir lini.',
      ],
      bullets: [
        'Common cause variation: fluktuasi alami yang stabil dan dapat diprediksi secara statistik.',
        'Assignable (special) cause variation: berasal dari sumber spesifik—mesin aus, operator baru, bahan baku berganti—dan wajib dicari akarnya.',
        'Inspeksi 100% tidak menjamin nol cacat, terutama bila pengukurannya sendiri memiliki error.',
      ],
      callout: {
        tone: 'warn',
        title: 'Kesalahan umum',
        body: 'AQL bukanlah "persentase cacat yang boleh ada". AQL adalah proporsi cacat yang masih dianggap memuaskan, sehingga lot pada taraf itu seharusnya diterima dengan peluang tinggi, yaitu 1 − α.',
      },
    },

    konsep: {
      paragraphs: [
        'Rencana sampling tunggal (single sampling plan) dinyatakan dengan dua bilangan: ukuran sampel n dan bilangan penerimaan c. Ambil n unit secara acak dari lot, hitung d unit cacat; terima lot bila d ≤ c dan tolak bila d > c. Bila setiap unit cacat secara independen dengan probabilitas p, maka jumlah cacat d mengikuti distribusi Binomial(n, p), sehingga peluang penerimaan adalah jumlah probabilitas untuk d = 0, 1, …, c.',
        'Kurva Operating Characteristic (OC) memetakan peluang penerimaan Pa(p) terhadap proporsi cacat p. Bentuknya menurun: makin buruk mutu lot, makin kecil peluangnya lolos. Dua titik pada kurva menjadi patokan kontrak: pada p = AQL diinginkan Pa = 1 − α, sedangkan pada p = LTPD diinginkan Pa = β. Nilai yang lazim dipakai adalah α = 0,05 dan β = 0,10. Makin besar n, makin curam kurva OC—artinya rencana makin mampu membedakan lot baik dari lot buruk.',
        'Dari kurva OC dapat diturunkan ukuran kinerja lain. Average Outgoing Quality (AOQ) memperkirakan proporsi cacat yang masih ikut terkirim setelah lot yang ditolak disortir 100%; nilai maksimumnya disebut AOQL. Average Total Inspection (ATI) menghitung total unit yang diperiksa per lot: bila lot ditolak, seluruh sisa lot (N − n) ikut diperiksa. Pada rencana ganda (double sampling), sampel pertama n1 dapat langsung memutuskan terima bila d1 ≤ c1 atau tolak bila d1 > c2; bila hasilnya di antaranya, diambil sampel kedua n2. Rata-rata jumlah sampel (ASN) biasanya lebih kecil daripada rencana tunggal dengan daya diskriminasi yang sama.',
        'Jembatan ke DOE: sampling memperlakukan proses sebagai kotak hitam—kita hanya melihat hasil akhirnya. DOE membuka kotak itu dengan sengaja mengubah faktor proses (X) dan mengamati responnya (Y). Inspeksi bertujuan detection; DOE dan Taguchi bertujuan prevention. Keduanya saling melengkapi, tetapi hanya DOE yang menurunkan variasi di sumbernya.',
      ],
      formulas: [
        {
          tex: 'P_a(p)=P(d\\le c)=\\sum_{d=0}^{c}\\binom{n}{d}\\,p^{d}(1-p)^{n-d}',
          caption: 'Peluang menerima lot berdasarkan distribusi Binomial.',
        },
        {
          tex: 'P_a(p)\\approx\\sum_{d=0}^{c}\\frac{(np)^d e^{-np}}{d!}',
          caption: 'Pendekatan Poisson untuk n besar dan p kecil (np tetap moderat).',
        },
        {
          tex: 'ATI=n+(1-P_a)(N-n),\\qquad AOQ\\approx p\\,P_a\\,\\frac{N-n}{N}',
          caption: 'Ukuran kinerja rencana sampling: total inspeksi dan mutu keluaran rata-rata.',
        },
      ],
      bullets: [
        'α (risiko produsen): peluang menolak lot yang mutunya berada di AQL.',
        'β (risiko konsumen): peluang menerima lot yang mutunya berada di LTPD.',
        'Kurva OC makin curam bila n makin besar—diskriminasi mutu makin tajam dengan biaya inspeksi makin tinggi.',
      ],
      callout: {
        tone: 'info',
        title: 'Kenapa binomial, bukan hipergeometrik?',
        body: 'Bila lot berukuran besar relatif terhadap sampel (N ≥ 10n), penarikan tanpa penggantian hampir setara dengan penarikan independen, sehingga Binomial (atau Poisson) sudah cukup akurat. Distribusi hipergeometrik berada di luar cakapan modul ini.',
      },
    },

    contoh: {
      paragraphs: [
        'Perhitungan di atas sengaja memakai binomial penuh agar Anda melihat asal setiap suku. Pipeline produksi sebenarnya bisa langsung memakai kalkulator, tetapi memahami substitusinya membantu ketika hasil kalkulator terasa aneh—misalnya ketika beta tidak turun walaupun n sudah diperbesar.',
        'Berikut studi kasus fiktif: pemasok mengirim N = 1.000 unit, dan kontrak menetapkan rencana sampling n = 50, c = 2 dengan AQL = 2% serta LTPD = 6%. Kita akan menguji apakah rencana itu benar-benar melindungi produsen dan konsumen. Buka langkah satu per satu—dalam Mode Mengajar, Board Reveal akan menyembunyikan langkah berikutnya sampai Anda menekan tombol panah.',
      ],
      steps: [
        {
          title: 'Tetapkan rencana dan titik acuan',
          detail: 'Diketahui N = 1.000, n = 50, c = 2, AQL = 0,02, LTPD = 0,06. Kita hitung Pₐ pada dua nilai p tersebut, lalu bandingkan dengan sasaran α ≤ 0,05 dan β ≤ 0,10.',
        },
        {
          title: 'Peluang diterima pada AQL (p = 0,02)',
          formula: 'P_a(0{,}02)=\\sum_{d=0}^{2}\\binom{50}{d}(0{,}02)^d(0{,}98)^{50-d}',
          substitution: 'd=0:\\ 0{,}98^{50}=0{,}3642;\\qquad d=1:\\ 50(0{,}02)0{,}98^{49}=0{,}3716;\\qquad d=2:\\ 1225(0{,}02)^2 0{,}98^{48}=0{,}1858',
          result: 'Pₐ(0,02) = 0,3642 + 0,3716 + 0,1858 = 0,9216, sehingga α = 1 − 0,9216 = 0,0784 (7,84%).',
          detail: 'Lot yang memang baik masih diterima sekitar 92%. Risiko produsen 7,84% sedikit di atas 5%, jadi kontrak masih bisa dinegosiasi.',
        },
        {
          title: 'Peluang diterima pada LTPD (p = 0,06)',
          formula: 'P_a(0{,}06)=\\sum_{d=0}^{2}\\binom{50}{d}(0{,}06)^d(0{,}94)^{50-d}',
          substitution: 'd=0:\\ 0{,}94^{50}=0{,}0453;\\qquad d=1:\\ 50(0{,}06)0{,}94^{49}=0{,}1447;\\qquad d=2:\\ 1225(0{,}06)^2 0{,}94^{48}=0{,}2262',
          result: 'Pₐ(0,06) = 0,0453 + 0,1447 + 0,2262 = 0,4162, sehingga β ≈ 41,62%.',
          detail: 'Ini masalah serius: hampir 4 dari 10 lot dengan 6% cacat tetap lolos.',
        },
        {
          title: 'Ambil keputusan',
          detail: 'α = 7,84% masih borderline, tetapi β = 41,62% jauh melebihi sasaran 10%. Rencana n = 50, c = 2 gagal melindungi konsumen. Untuk menurunkan β, ukuran sampel harus diperbesar—misalnya n = 100 dengan c yang disesuaikan—atau gunakan rencana ganda.',
        },
        {
          title: 'Hitung AOQ',
          formula: 'AOQ\\approx p\\,P_a\\,\\frac{N-n}{N}',
          substitution: 'p=0{,}02,\\quad P_a=0{,}9216,\\quad \\frac{N-n}{N}=\\frac{950}{1000}=0{,}95',
          result: 'AOQ ≈ 0,02 × 0,9216 × 0,95 = 0,0175 → sekitar 1,75% cacat masih ikut terkirim.',
          detail: 'AOQ selalu lebih kecil daripada p karena lot buruk sebagian besar tersaring. Nilai AOQ paling besar disebut AOQL.',
        },
      ],
      table: {
        caption: 'Ringkasan titik kurva OC',
        head: ['Titik', 'Proporsi cacat p', 'Pₐ', 'Risiko'],
        rows: [
          ['AQL', '2%', '0,9216', 'α = 7,84%'],
          ['LTPD', '6%', '0,4162', 'β = 41,62%'],
        ],
      },
    },

    coba: {
      paragraphs: [
        'Catat nilai alfa dan beta sebelum serta sesudah setiap perubahan. Mencatat angka membuat hubungan antara ukuran sampel, kurva OC, dan biaya inspeksi jauh lebih mudah diingat daripada sekadar menggeser slider.',
        'Buka kalkulator Acceptance Sampling untuk menggambar kurva OC sendiri. Geser n dan c, lalu amati bagaimana kurva menjadi lebih curam dan β turun. Di simulator Inspeksi Lot Anda dapat "mengirim" lot dengan proporsi cacat acak ber-seed dan melihat keputusan berulang kali—cara cepat membangun intuisi bahwa keputusan sampling selalu bersifat probabilistik.',
      ],
      bullets: [
        'Coba n = 100, c = 2: bandingkan α dan β dengan contoh di atas.',
        'Perhatikan bentuk kurva OC saat n diperkecil: penurunannya menjadi landai.',
        'Bandingkan ASN rencana tunggal dan rencana ganda pada daya diskriminasi yang mirip.',
      ],
      callout: {
        tone: 'info',
        title: 'Pertanyaan pemantik untuk diskusi kelas',
        body: 'Mengapa AOQ tidak pernah sama dengan p? Apa yang terjadi pada AOQL jika ukuran sampel diperbesar?',
      },
    },

    latihan: {
      paragraphs: [
        'Kerjakan dengan kertas terlebih dahulu; kunci jawaban hanya untuk memeriksa, bukan untuk dihafal.',
        'Kerjakan tiga pertanyaan berikut tanpa melihat kunci dulu. Tujuannya bukan menghafal rumus, melainkan membaca perilaku kurva OC dan makna kedua risiko. Kunci jawaban tersembunyi di bawah.',
      ],
      prompts: [
        'Dengan rencana n = 100, c = 1 dan p = 1%, hitung Pₐ memakai pendekatan Poisson. (Petunjuk: np = 1.)',
        'Sebuah rencana direncanakan dengan α = 0,05 pada AQL = 1%. Apa artinya bagi produsen?',
        'Mengapa inspeksi akhir tidak dapat menggantikan perancangan eksperimen?',
      ],
      cheat: [
        { label: 'Kunci 1', note: 'Pₐ = e⁻¹(1 + 1) = 0,7358. Lot pada taraf 1% cacat diterima sekitar 73,6%.' },
        { label: 'Kunci 2', note: 'Lot yang mutunya sudah pada AQL masih punya 5% peluang ditolak—itulah risiko produsen.' },
        { label: 'Kunci 3', note: 'Inspeksi hanya memisahkan cacat yang sudah terbentuk; DOE mengubah faktor proses agar cacat tidak muncul.' },
      ],
    },

    ringkasan: {
      paragraphs: [
        'Secara konseptual, rencana sampling yang baik bukan yang paling murah, melainkan yang menyeimbangkan risiko kedua belah pihak. Pemahaman ini menjadi modal saat Anda memutuskan apakah masalah mutu sebaiknya diselesaikan dengan inspeksi tambahan atau dengan eksperimen proses.',
        'Acceptance sampling mengubah keputusan mutu menjadi keputusan probabilitas. Rencana (n, c) sepenuhnya ditentukan oleh seberapa tajam kurva OC memisahkan AQL dari LTPD. Makin besar n, makin curam kurva, makin kecil α dan β—dengan konsekuensi biaya inspeksi yang makin tinggi. Ingatlah bahwa sampling mengendalikan pengambilan keputusan, bukan mutu proses itu sendiri.',
      ],
    },

    // Lembar contekan dipakai ulang oleh panel ringkasan di halaman modul.
  },

  cheatSheet: [
      {
        label: 'Peluang terima',
        tex: 'P_a=\\sum_{d=0}^{c}\\binom{n}{d}p^d(1-p)^{n-d}',
        note: 'Binomial; pakai Poisson bila n besar dan p kecil.',
      },
      {
        label: 'Dua risiko',
        tex: 'P_a(\\mathrm{AQL})=1-\\alpha,\\qquad P_a(\\mathrm{LTPD})=\\beta',
        note: 'α = risiko produsen; β = risiko konsumen.',
      },
      {
        label: 'Total inspeksi',
        tex: 'ATI=n+(1-P_a)(N-n)',
        note: 'Rata-rata unit diperiksa per lot.',
      },
      {
        label: 'Mutu keluaran',
        tex: 'AOQ\\approx p\\,P_a\\,\\frac{N-n}{N}',
        note: 'AOQL adalah nilai maksimum AOQ.',
      },
      {
        label: 'Jembatan ke DOE',
        note: 'Inspeksi = detection; DOE & Taguchi = prevention.',
      },
    ],

    related: [
      { label: 'Kalkulator Acceptance Sampling', href: '/kalkulator/sampling-oc/', kind: 'kalkulator' },
      { label: 'Simulator Inspeksi Lot', href: '/simulator/', kind: 'simulator' },
      { label: 'Fondasi Berpikir Eksperimental', href: '/modul/fondasi-berpikir-eksperimental/', kind: 'modul' },
      { label: 'Bank Latihan Soal', href: '/latihan/', kind: 'latihan' },
    ],
};

export default content;
