import type { ModuleContent } from './types';

const content: ModuleContent = {
  slug: 'faktorial-2k',
  id: 'm4',
  objectives: [
    'Menjelaskan keunggulan desain faktorial penuh dan pengkodean level −1/+1.',
    'Menghitung efek utama dan interaksi dengan kontras serta Algoritma Yates.',
    'Menyusun ANOVA faktorial 2ᵏ dan persamaan regresi respon.',
    'Membaca interaction plot untuk membedakan efek aditif dan interaksi.',
  ],
  stages: {
    kenapa: {
      paragraphs: [
        'Modul 1 menunjukkan bahwa OFAT bisa tersesat ketika dua faktor berinteraksi. Desain faktorial penuh 2ᵏ mengambil jalan lain: menguji seluruh kombinasi level dari k faktor. Untuk dua faktor dengan dua level, kita menjalankan empat kombinasi; untuk tiga faktor, delapan. Jumlah percobaan naik, tetapi setiap percobaan memberi informasi tentang semua efek sekaligus—termasuk interaksi yang tidak bisa dilihat OFAT.',
        'Efisiensi ini berkat ortogonalitas. Kolom tanda untuk setiap efek seimbang: jumlah +1 sama dengan jumlah −1, dan hasil kali dua kolom mana pun juga berjumlah nol. Akibatnya, estimasi efek A tidak "terkontaminasi" oleh efek B maupun AB—masing-masing dapat dihitung secara terpisah hanya dengan menjumlahkan data yang sudah diberi tanda.',
        'Dalam praktiknya, insinyur sering terkejut ketika interaksi lebih besar daripada efek utama. Itu bukan kesalahan: memang banyak proses kimia dan manufaktur yang responsnya tidak aditif. Modul ini memberi alat untuk melihatnya, mengukurnya, dan menyatakannya dalam persamaan regresi yang bisa dipakai untuk prediksi.',
      ],
      bullets: [
        '2ᵏ = k faktor, masing-masing dua level, semua kombinasi diuji.',
        'Ortogonalitas membuat efek dapat dipisahkan satu sama lain.',
        'Interaksi adalah pengaruh gabungan yang tidak bisa dijumlahkan dari efek tunggal.',
      ],
      callout: {
        tone: 'ok',
        title: 'Kode −1/+1',
        body: 'Level rendah diberi kode −1 dan level tinggi +1. Kode ini bukan sekadar label: ia membuat rata-rata kode sama dengan nol dan memungkinkan koefisien regresi dibaca langsung sebagai setengah dari efek.',
      },
    },

    konsep: {
      paragraphs: [
        'Dengan kode −1/+1, tanda untuk efek utama A adalah kolom x₁, untuk B kolom x₂, dan untuk interaksi AB kolom hasil kali x₁x₂. Kontras untuk suatu efek adalah jumlah observasi yang diberi tanda sesuai kolom itu. Efek diperoleh dengan membagi kontras atas n·2ᵏ⁻¹, di mana n adalah jumlah replikasi. Jumlah kuadrat efek adalah kontras²/(n·2ᵏ).',
        'Algoritma Yates adalah cara sistematis membentuk kontras tersebut. Tulis data dalam urutan standar (1), a, b, ab, …; pada kolom pertama, pasangkan dan jumlahkan dua nilai berturut-turut, lalu selisihkan; ulangi proses pada kolom berikutnya sampai dihasilkan satu baris total dan kontras untuk semua efek. Untuk 2ᵏ dengan n replikasi, baris pertama adalah grand total, sisanya kontras A, B, AB, dan seterusnya.',
        'Interaction plot menampilkan rata-rata respon pada sumbu vertikal dan level faktor A pada sumbu horizontal, dengan satu garis untuk setiap level B. Garis yang sejajar menandakan tidak ada interaksi—efek A sama pada kedua level B. Garis yang tidak sejajar atau berpotongan menandakan interaksi; semakin berbeda kemiringannya, semakin kuat interaksinya. Ingatlah bahwa garis yang sejajar tetapi berbeda ketinggian menunjukkan efek utama B, bukan interaksi.',
        'Model regresi yang sesuai adalah ŷ = β₀ + β₁x₁ + β₂x₂ + β₁₂x₁x₂. Karena kode sudah terpusat, β₀ sama dengan rata-rata umum dan setiap βᵢ sama dengan setengah efek yang bersangkutan. Uji F untuk tiap efek memakai MS galat dari replikasi; bila tidak ada replikasi (n = 1), galat murni tidak dapat diestimasi dan efek hanya bisa dinilai secara visual atau dengan asumsi efek urutan tinggi dapat diabaikan.',
      ],
      formulas: [
        {
          tex: '\\text{Efek}_j=\\frac{\\text{Kontras}_j}{n\\,2^{k-1}},\\qquad SS_j=\\frac{\\text{Kontras}_j^2}{n\\,2^k}',
          caption: 'Estimasi efek dan jumlah kuadrat dari kontras ortogonal.',
        },
        {
          tex: '\\hat{y}=\\beta_0+\\beta_1 x_1+\\beta_2 x_2+\\beta_{12}x_1x_2',
          caption: 'Model regresi faktorial 2²; β₀ = rata-rata umum, βⱼ = Efekⱼ/2.',
        },
        {
          tex: 'SS_{\\text{Total}}=\\sum_j SS_j+SS_{\\text{PureError}}',
          caption: 'Dekomposisi variasi pada desain faktorial dengan replikasi.',
        },
        {
          tex: 'F_j=\\frac{SS_j/1}{MS_{\\text{Error}}}',
          caption: 'Tiap efek memiliki df = 1 dan diuji terhadap MS galat.',
        },
      ],
      bullets: [
        'Urutan standar: (1), a, b, ab untuk k = 2.',
        'Kolom tanda interaksi AB = hasil kali kolom A dan B.',
        'Garis sejajar pada interaction plot = efek aditif; garis berpotongan = interaksi.',
        'Uji F mewajibkan replikasi; tanpa replikasi, tidak ada galat murni.',
      ],
      callout: {
        tone: 'warn',
        title: 'Jebakan umum',
        body: 'Efek utama yang besar belum tentu merupakan "pengaturan terbaik" bila interaksinya besar pula. Selalu baca efek utama dan interaksi bersama-sama, lalu cek interaction plot sebelum mengambil keputusan.',
      },
    },

    contoh: {
      paragraphs: [
        'Perlu diingat bahwa angka-angka di atas berasal dari dua replikasi per kombinasi. Tanpa replikasi, SS pure error tidak tersedia dan seluruh kolom F tidak bisa dihitung—efek tetap dapat dilaporkan, tetapi tanpa pernyataan signifikansi.',
        'Kasus fiktif: proses laminasi kayu memakai faktor A = suhu (rendah/tinggi) dan B = waktu tekan (pendek/panjang). Setiap kombinasi diulang dua kali, menghasilkan delapan observasi: (1) = 60, 62; a = 72, 74; b = 68, 70; ab = 90, 92. Kita hitung efek dengan Yates, susun ANOVA, lalu tuliskan model regresinya.',
      ],
      steps: [
        {
          title: 'Rekap total dan jalankan Algoritma Yates',
          formula: '\\text{Kolom 1}:\\ (1)+a,\\ b+ab,\\ a-(1),\\ ab-b',
          substitution: '(1)=60+62=122;\\quad a=72+74=146;\\quad b=68+70=138;\\quad ab=90+92=182',
          result: 'Kolom 1 = [268, 320, 24, 44]. Kolom 2 = [588, 68, 52, 20] → Total = 588, kontras A = 68, B = 52, AB = 20.',
        },
        {
          title: 'Hitung efek utama dan interaksi',
          formula: '\\text{Efek}=\\frac{\\text{Kontras}}{n\\,2^{k-1}}=\\frac{\\text{Kontras}}{2\\cdot 2}=\\frac{\\text{Kontras}}{4}',
          substitution: 'A=68/4;\\quad B=52/4;\\quad AB=20/4',
          result: 'Efek A = 17, efek B = 13, efek interaksi AB = 5 (satuan kekuatan).',
          detail: 'Interaksi AB bernilai 13/17 ≈ 0,29 dari efek A—cukup besar untuk dibicarakan.',
        },
        {
          title: 'Hitung jumlah kuadrat tiap efek',
          formula: 'SS_j=\\frac{\\text{Kontras}_j^2}{n\\,2^k}=\\frac{\\text{Kontras}_j^2}{8}',
          substitution: 'SS_A=68^2/8=578;\\quad SS_B=52^2/8=338;\\quad SS_{AB}=20^2/8=50',
          result: 'SSₐ = 578, SSᵦ = 338, SSₐᵦ = 50.',
        },
        {
          title: 'Galat murni dari replikasi',
          formula: 'SS_{\\text{PE}}=\\sum_{\\text{sel}}\\frac{(y_1-y_2)^2}{2}',
          substitution: '\\frac{(60-62)^2}{2}+\\frac{(72-74)^2}{2}+\\frac{(68-70)^2}{2}+\\frac{(90-92)^2}{2}=4\\times 2',
          result: 'SS galat murni = 8 dengan df = 4, sehingga MSₑ = 2.',
          detail: 'Pemeriksaan: 578 + 338 + 50 + 8 = 974 = SS total. Dekomposisi konsisten.',
        },
        {
          title: 'Tabel ANOVA dan keputusan',
          formula: 'F_A=\\frac{578}{2}=289,\\qquad F_B=\\frac{338}{2}=169,\\qquad F_{AB}=\\frac{50}{2}=25',
          substitution: 'F_{0{,}05;1;4}\\approx 7{,}71',
          result: 'Ketiganya melebihi 7,71 → suhu, waktu, dan interaksinya semuanya berpengaruh nyata.',
        },
        {
          title: 'Persamaan regresi',
          formula: '\\hat{y}=73{,}5+\\frac{17}{2}x_1+\\frac{13}{2}x_2+\\frac{5}{2}x_1x_2',
          substitution: '\\bar{y}=\\frac{588}{8}=73{,}5;\\quad \\beta_1=8{,}5,\\ \\beta_2=6{,}5,\\ \\beta_{12}=2{,}5',
          result: 'ŷ = 73,5 + 8,5x₁ + 6,5x₂ + 2,5x₁x₂.',
          detail: 'Cek: pada (−1,−1) → 73,5 − 8,5 − 6,5 + 2,5 = 61 (sesuai rata-rata sel); pada (+1,+1) → 91.',
        },
        {
          title: 'Baca interaction plot',
          detail: 'Pada B rendah, efek A = 73 − 61 = 12; pada B tinggi, efek A = 91 − 69 = 22. Kedua garis tidak sejajar (selisih kemiringan 10 = 2 × efek AB). Artinya, menaikkan suhu jauh lebih bermanfaat bila waktu tekan juga panjang—keputusan yang tidak akan terlihat dari efek utama saja.',
        },
      ],
      table: {
        caption: 'Tabel ANOVA faktorial 2² (α = 0,05)',
        head: ['Sumber', 'SS', 'df', 'MS', 'F'],
        rows: [
          ['A (suhu)', '578', '1', '578', '289'],
          ['B (waktu)', '338', '1', '338', '169'],
          ['AB', '50', '1', '50', '25'],
          ['Galat', '8', '4', '2', '—'],
          ['Total', '974', '7', '—', '—'],
        ],
      },
    },

    coba: {
      paragraphs: [
        'Perhatikan pula kontras AB pada kalkulator: tanda negatifnya saja sudah memberi tahu arah interaksi, sebelum Anda sempat menggambar plot.',
        'Buka kalkulator Faktorial 2ᵏ untuk mencoba data Anda. Kalkulator menunjukkan tanda Yates, efek, SS, dan ANOVA sekaligus, sehingga mudah memeriksa apakah kontras yang Anda hitung manual sudah benar. Sandbox Interaction Plot memungkinkan Anda menggeser besar efek interaksi dan langsung melihat perubahan kemiringan garis.',
      ],
      bullets: [
        'Set interaksi = 0: apakah dua garis menjadi sejajar?',
        'Perbesar efek A saja: bagaimana jarak antargaris berubah?',
        'Bandingkan output kalkulator dengan angka contoh di atas.',
      ],
      callout: {
        tone: 'info',
        title: 'Pertanyaan pemantik',
        body: 'Jika efek AB negatif, bagaimana bentuk interaction plotnya? Apakah garis-garisnya berpotongan?',
      },
    },

    latihan: {
      paragraphs: [
        'Tuliskan kolom tanda minus dan plus di kertas sebelum menjumlahkan data; kesalahan paling umum pada Yates adalah salah urutan atau salah tanda pada kolom interaksi.',
        'Latihan singkat untuk menguji pemahaman kontras dan kode −1/+1. Kunci jawaban di bawah.',
      ],
      prompts: [
        'Pada desain 2² dengan n = 2, berapa penyebut untuk menghitung efek dari kontras?',
        'Jika kontras A = 40 dan kontras AB = −12, berapa efek A dan efek AB?',
        'Apa artinya bila dua garis pada interaction plot sejajar?',
      ],
      cheat: [
        { label: 'Kunci 1', note: 'n·2ᵏ⁻¹ = 2 · 2 = 4.' },
        { label: 'Kunci 2', note: 'Efek A = 40/4 = 10; efek AB = −12/4 = −3.' },
        { label: 'Kunci 3', note: 'Tidak ada interaksi: efek A sama pada kedua level B (respon bersifat aditif).' },
      ],
    },

    ringkasan: {
      paragraphs: [
        'Kekuatan faktorial terletak pada keterpisahan informasi. Karena kolomnya ortogonal, menambah satu efek ke dalam model tidak mengubah estimasi efek lainnya—sifat yang tidak dimiliki eksperimen OFAT.',
        'Desain faktorial 2ᵏ mengubah k faktor menjadi semua kombinasi levelnya, dan ortogonalitasnya membuat tiap efek bisa dihitung secara mandiri. Algoritma Yates memberi kontras dengan cepat; efek adalah kontras dibagi n·2ᵏ⁻¹; SS adalah kontras² dibagi n·2ᵏ. Jangan berhenti di angka—bacalah interaction plot dan nyatakan hasilnya dalam persamaan regresi agar bisa dipakai memprediksi respon.',
      ],
    },

  },

  cheatSheet: [
      {
        label: 'Kode',
        note: 'Level rendah = −1, level tinggi = +1; kolom interaksi = hasil kali kolom faktor.',
      },
      {
        label: 'Efek',
        tex: '\\text{Efek}_j=\\frac{C_j}{n\\,2^{k-1}}',
        note: 'Cⱼ = kontras Yates untuk efek ke-j.',
      },
      {
        label: 'Jumlah kuadrat',
        tex: 'SS_j=\\frac{C_j^2}{n\\,2^k}',
        note: 'Tiap efek ber-df 1.',
      },
      {
        label: 'Regresi',
        tex: '\\hat{y}=\\bar{y}+\\sum_j \\frac{\\text{Efek}_j}{2}x_j',
        note: 'Koefisien = setengah efek karena kode terpusat.',
      },
      {
        label: 'Interaction plot',
        note: 'Sejajar = aditif; tidak sejajar/berpotongan = ada interaksi.',
      },
    ],

    related: [
      { label: 'Kalkulator Faktorial 2ᵏ · Yates', href: '/kalkulator/faktorial-2k/', kind: 'kalkulator' },
      { label: 'Sandbox Interaction Plot', href: '/simulator/', kind: 'simulator' },
      { label: 'Metode Taguchi & Robust Design', href: '/modul/metode-taguchi/', kind: 'modul' },
      { label: 'Bank Latihan Soal', href: '/latihan/', kind: 'latihan' },
    ],
};

export default content;
