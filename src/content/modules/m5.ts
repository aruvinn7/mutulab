import type { ModuleContent } from './types';

const content: ModuleContent = {
  slug: 'metode-taguchi',
  id: 'm5',
  objectives: [
    'Menjelaskan fungsi kerugian kualitas Taguchi dan konsekuensinya bagi spesifikasi.',
    'Membedakan control factors (inner array) dan noise factors (outer array).',
    'Membaca orthogonal array L4, L8, dan L9 serta aturan derajat kebebasan.',
    'Menghitung rasio S/N tiga karakteristik, tabel respon, dan prediksi optimal.',
  ],
  stages: {
    kenapa: {
      paragraphs: [
        'Pendekatan konvensional memandang suatu produk "bermutu" selama ukurannya masih berada di dalam batas spesifikasi. Genichi Taguchi menantang anggapan itu. Bayangkan dua batch lapisan keramik dengan target ketebalan 100 μm dan batas toleransi ±10 μm. Batch A semua unitnya tepat 100 μm; Batch B rata-ratanya 100 μm tetapi sebagian unitnya 105 μm. Keduanya lolos inspeksi, namun Batch B lebih berisiko mengalami kegagalan fungsi dan menimbulkan biaya garansi. Bagi Taguchi, kerugian mulai muncul sejak respon menyimpang dari target—bukan saat ia melewati batas spesifikasi.',
        'Kedua, Taguchi melihat bahwa variasi sering kali disebabkan oleh faktor yang sulit atau mahal untuk dikendalikan—suhu lingkungan, kelembapan, fluktuasi tegangan, kebiasaan operator. Faktor-faktor ini disebut noise factors. Alih-alih menghilangkannya, Taguchi mengusulkan merancang nilai faktor kendali sedemikian rupa agar proses menjadi tangguh (robust) terhadap gangguan itu. Tujuannya bukan sekadar mencapai rata-rata target, melainkan meminimalkan variasi di sekitar target.',
        'Untuk mencapai itu secara efisien, Taguchi memakai orthogonal array—matriks percobaan yang menyeimbangkan kombinasi level sehingga banyak faktor bisa dipelajari dengan sedikit percobaan. Ditambah dengan rasio Signal-to-Noise (S/N), insinyur mendapat satu angka yang merangkum "sinyal yang diinginkan dibanding gangguan", lalu memilih level faktor yang membuat angka itu sebesar mungkin.',
      ],
      bullets: [
        'Mutu = kerugian kepada masyarakat, bukan sekadar lulus/tidak lulus spesifikasi.',
        'Kerugian paling kecil terjadi tepat di target, bukan di mana pun dalam batas spesifikasi.',
        'Robust design membuat kinerja kebal terhadap noise tanpa menghilangkan noise itu.',
      ],
      callout: {
        tone: 'ok',
        title: 'Pergeseran paradigma',
        body: 'DOE klasik bertanya "faktor mana yang berpengaruh?". Taguchi bertanya "kombinasi level apa yang membuat kinerja paling stabil menghadapi gangguan?". Keduanya saling melengkapi.',
      },
    },

    konsep: {
      paragraphs: [
        'Fungsi kerugian kualitas ditulis L(y) = k(y − m)², dengan m target dan k konstanta yang ditentukan dari biaya kegagalan pada batas spesifikasi. Bila kerugian pada batas Δ adalah A₀, maka k = A₀/Δ². Fungsi ini berbentuk parabola: dua unit dengan deviasi 5 μm dan 10 μm tidak sama mutunya, meskipun keduanya masih "dalam spesifikasi". Semakin jauh dari target, kerugian naik kuadratik.',
        'Dalam perencanaan Taguchi, faktor dibagi dua. Control factors (inner array) adalah variabel yang murah dan mudah diatur—suhu tungku, tekanan, komposisi. Noise factors (outer array) adalah variabel yang sulit atau mahal dikendalikan—suhu ruangan, kelembapan, variasi bahan. Setiap kombinasi control factors diuji pada beberapa kondisi noise. Dengan demikian, satu baris inner array menghasilkan beberapa pengukuran yang merefleksikan ketangguhan kombinasi itu.',
        'Orthogonal array yang umum dipakai: L4 (4 baris, hingga 3 faktor 2 level), L8 (8 baris, hingga 7 faktor 2 level), dan L9 (9 baris, hingga 4 faktor 3 level). Aturan derajat kebebasan: jumlah baris minimal 1 + Σ(df faktor), dengan df faktor = (jumlah level − 1). L9 misalnya menyediakan 8 df, cukup untuk empat faktor bertingkat tiga (4 × 2 = 8). Baris-barisnya seimbang: setiap level muncul sama sering, sehingga efek tiap faktor dapat dipisahkan.',
        'Ada tiga rumus S/N tergantung karakteristik mutu. Smaller-the-Better dipakai untuk cacat, waktu, atau pemakaian energi—semakin kecil semakin baik. Larger-the-Better untuk kekuatan, yield, atau umur pakai. Nominal-the-Best untuk respon yang harus mendekati target, memakai perbandingan rata-rata kuadrat terhadap variansi. Dalam ketiga kasus, nilai S/N yang lebih besar selalu lebih baik, sehingga optimasi selalu berarti "maksimalkan η".',
        'Analisis dilanjutkan dengan tabel respon: untuk setiap faktor dan level, hitung rata-rata S/N dari baris-baris yang memakai level itu. Delta = selisih nilai tertinggi dan terendah; Rank mengurutkan faktor berdasarkan Delta. Level dengan S/N rata-rata tertinggi adalah level optimal. Prediksi kinerja optimal dihitung η̂opt = η̄ + Σ(ηᵢ,opt − η̄), yaitu rata-rata keseluruhan ditambah kontribusi tiap faktor yang dipilih.',
      ],
      formulas: [
        {
          tex: 'L(y)=k(y-m)^2,\\qquad k=\\frac{A_0}{\\Delta^2}',
          caption: 'Fungsi kerugian Taguchi; A₀ = biaya kerugian pada batas spesifikasi Δ.',
        },
        {
          tex: '\\text{S/N}_{\\text{STB}}=-10\\log_{10}\\!\\left(\\frac{1}{n}\\sum_{i=1}^{n} y_i^2\\right)',
          caption: 'Smaller-the-Better: minimalkan besaran pengukuran.',
        },
        {
          tex: '\\text{S/N}_{\\text{LTB}}=-10\\log_{10}\\!\\left(\\frac{1}{n}\\sum_{i=1}^{n}\\frac{1}{y_i^2}\\right)',
          caption: 'Larger-the-Better: maksimalkan besaran pengukuran.',
        },
        {
          tex: '\\text{S/N}_{\\text{NTB}}=10\\log_{10}\\!\\left(\\frac{\\bar{y}^2}{s^2}\\right)',
          caption: 'Nominal-the-Best: rata-rata mendekati target dengan variansi kecil.',
        },
        {
          tex: '\\hat{\\eta}_{\\text{opt}}=\\bar{\\eta}+\\sum_i\\left(\\eta_{i,\\text{opt}}-\\bar{\\eta}\\right)',
          caption: 'Prediksi rasio S/N pada kombinasi level optimal.',
        },
      ],
      bullets: [
        'Inner array = faktor kendali; outer array = kondisi noise.',
        'L4: 3 faktor 2 level; L8: 7 faktor 2 level; L9: 4 faktor 3 level.',
        'Aturan df: baris ≥ 1 + Σ(level − 1).',
        'Delta besar → faktor berpengaruh; pilih level dengan S/N rata-rata tertinggi.',
      ],
      callout: {
        tone: 'warn',
        title: 'Satuan dB',
        body: 'Rasio S/N dinyatakan dalam desibel dan biasanya bernilai negatif untuk STB/LTB. Jangan terkecoh: −18 dB lebih baik daripada −23 dB. Makin mendekati nol (atau makin positif), makin baik.',
      },
    },

    contoh: {
      paragraphs: [
        'Perlu dicatat bahwa prediksi eta optimal bersifat aditif dan mengasumsikan tidak ada interaksi kuat antar faktor kendali. Bila interaksi dicurigai, lakukan percobaan konfirmasi pada kombinasi terpilih.',
        'Studi kasus fiktif: proses pelapisan keramik ingin meminimalkan kekasaran permukaan (Smaller-the-Better). Dua faktor kendali diuji pada L4: A = suhu tungku (A1 rendah, A2 tinggi) dan B = laju aliran (B1 rendah, B2 tinggi). Outer array terdiri dari tiga kondisi noise (N1, N2, N3), sehingga setiap baris inner array menghasilkan tiga pengukuran kekasaran (μm).',
      ],
      steps: [
        {
          title: 'Data hasil pengukuran (μm)',
          detail: 'Baris 1 (A1B1): 12, 14, 16 · Baris 2 (A1B2): 10, 12, 14 · Baris 3 (A2B1): 8, 10, 12 · Baris 4 (A2B2): 6, 8, 10. Karena kekasaran ingin kecil, gunakan Smaller-the-Better.',
        },
        {
          title: 'Hitung S/N setiap baris',
          formula: '\\eta=-10\\log_{10}\\!\\left(\\frac{y_1^2+y_2^2+y_3^2}{3}\\right)',
          substitution: '\\text{Baris 1}:\\ \\frac{144+196+256}{3}=198{,}6667;\\quad \\text{Baris 4}:\\ \\frac{36+64+100}{3}=66{,}6667',
          result: 'η₁ = −22,9813; η₂ = −21,6633; η₃ = −20,1143; η₄ = −18,2391 dB.',
          detail: 'Baris 4 (A2B2) memberikan S/N tertinggi, tetapi kita harus memeriksa konsistensi lewat tabel respon.',
        },
        {
          title: 'Rata-rata S/N per level faktor A',
          formula: '\\eta_{A1}=\\frac{\\eta_1+\\eta_2}{2},\\qquad \\eta_{A2}=\\frac{\\eta_3+\\eta_4}{2}',
          substitution: '\\eta_{A1}=\\frac{-22{,}9813-21{,}6633}{2}=-22{,}3223;\\quad \\eta_{A2}=\\frac{-20{,}1143-18{,}2391}{2}=-19{,}1767',
          result: 'ΔA = |−19,1767 − (−22,3223)| = 3,1456 dB → pilih A2.',
        },
        {
          title: 'Rata-rata S/N per level faktor B',
          formula: '\\eta_{B1}=\\frac{\\eta_1+\\eta_3}{2},\\qquad \\eta_{B2}=\\frac{\\eta_2+\\eta_4}{2}',
          substitution: '\\eta_{B1}=\\frac{-22{,}9813-20{,}1143}{2}=-21{,}5478;\\quad \\eta_{B2}=\\frac{-21{,}6633-18{,}2391}{2}=-19{,}9512',
          result: 'ΔB = 1,5966 dB → pilih B2. Ranking: A (Δ terbesar, rank 1), lalu B (rank 2).',
        },
        {
          title: 'Prediksi kinerja optimal',
          formula: '\\hat{\\eta}_{\\text{opt}}=\\bar{\\eta}+(\\eta_{A2}-\\bar{\\eta})+(\\eta_{B2}-\\bar{\\eta})',
          substitution: '\\bar{\\eta}=\\frac{-22{,}9813-21{,}6633-20{,}1143-18{,}2391}{4}=-20{,}7495',
          result: 'η̂opt = −20,7495 + 1,5728 + 0,7983 = −18,3784 dB.',
          detail: 'Prediksi ini sangat dekat dengan η baris 4 (−18,2391 dB), yang memang memakai A2B2—konsistensi yang meyakinkan.',
        },
        {
          title: 'Hubungkan dengan fungsi kerugian',
          detail: 'Misalkan target ketebalan 100 μm dengan batas ±10 μm dan biaya kerugian A₀ = Rp50.000 di batas. Maka k = 50.000/10² = 500 per μm². Unit dengan ketebalan 105 μm menyimpan kerugian L = 500 × (105 − 100)² = Rp12.500, meskipun masih dinyatakan "lulus spesifikasi". Inilah alasan mengapa mengurangi variasi di sekitar target bernilai ekonomi.',
        },
      ],
      table: {
        caption: 'Tabel respon S/N (Smaller-the-Better)',
        head: ['Faktor', 'Level 1', 'Level 2', 'Delta', 'Rank', 'Level optimal'],
        rows: [
          ['A — suhu tungku', '−22,3223', '−19,1767', '3,1456', '1', 'A2'],
          ['B — laju aliran', '−21,5478', '−19,9512', '1,5966', '2', 'B2'],
        ],
      },
    },

    coba: {
      paragraphs: [
        'Bandingkan pula S/N dengan rata-rata kekasaran mentah: kadang kombinasi dengan rata-rata terbaik bukan yang memiliki S/N tertinggi, dan S/N-lah yang lebih tepat untuk ketangguhan.',
        'Kalkulator Taguchi S/N menerima matriks L4, L8, atau L9 beserta data outer array, lalu menampilkan rasio S/N untuk tiga karakteristik, tabel respon dengan Delta dan Rank, serta prediksi η̂opt. Virtual Lab Taguchi di simulator memungkinkan Anda menyuntikkan noise dan melihat sendiri mengapa kombinasi level tertentu lebih tangguh.',
      ],
      bullets: [
        'Ganti karakteristik menjadi Larger-the-Better: apakah level optimal berubah?',
        'Tambah satu kondisi noise: bagaimana S/N tiap baris bergeser?',
        'Bandingkan prediksi η̂opt dengan S/N baris terbaik pada tabel.',
      ],
      callout: {
        tone: 'info',
        title: 'Pertanyaan pemantik',
        body: 'Faktor mana yang punya Delta terbesar? Mengapa faktor dengan Delta kecil tetap perlu dipertimbangkan bila biaya pengaturannya murah?',
      },
    },

    latihan: {
      paragraphs: [
        'Tentukan dulu karakteristik mutunya sebelum memilih rumus; kesalahan memilih Smaller-the-Better untuk data kekuatan akan membalik arah optimasi.',
        'Uji pemahaman Anda tentang fungsi kerugian, pemilihan rumus S/N, dan tabel respon. Kunci di bawah.',
      ],
      prompts: [
        'Dengan target m = 50 dan batas spesifikasi ±5 yang menimbulkan kerugian Rp20.000, berapa nilai k?',
        'Karakteristik apa yang paling tepat untuk data "jumlah cacat per unit"?',
        'Jika η_A1 = −15 dB dan η_A2 = −11 dB, level mana yang dipilih dan berapa Delta?',
      ],
      cheat: [
        { label: 'Kunci 1', note: 'k = A₀/Δ² = 20.000/25 = 800 per satuan².' },
        { label: 'Kunci 2', note: 'Smaller-the-Better, karena jumlah cacat ingin minimum.' },
        { label: 'Kunci 3', note: 'Pilih A2 (−11 dB lebih tinggi); Delta = |−11 − (−15)| = 4 dB.' },
      ],
    },

    ringkasan: {
      paragraphs: [
        'Alur Taguchi—target, noise, OA, S/N, tabel respon, prediksi—adalah cara berpikir, bukan sekadar tabel. Menguasainya membuat Anda mampu merancang proses yang tetap baik ketika kondisi di lapangan berubah.',
        'Taguchi menyatukan tiga gagasan: kerugian mulai dari target, desain harus tangguh terhadap noise, dan orthogonal array membuat eksperimen tetap efisien. Secara praktis, alurnya adalah pilih OA, tentukan inner/outer array, ukur respon, hitung S/N sesuai karakteristik, susun tabel respon, lalu prediksi kombinasi optimal. Ingat: S/N yang lebih besar selalu lebih baik, terlepas dari tanda desibelnya.',
      ],
    },

  },

  cheatSheet: [
      {
        label: 'Kerugian',
        tex: 'L(y)=k(y-m)^2,\\quad k=A_0/\\Delta^2',
        note: 'Minimum di target, naik kuadratik.',
      },
      {
        label: 'Smaller-the-Better',
        tex: '\\eta=-10\\log_{10}\\left(\\frac{1}{n}\\sum y_i^2\\right)',
        note: 'Cacat, waktu, energi—semakin kecil semakin baik.',
      },
      {
        label: 'Larger-the-Better',
        tex: '\\eta=-10\\log_{10}\\left(\\frac{1}{n}\\sum y_i^{-2}\\right)',
        note: 'Kekuatan, yield, umur pakai.',
      },
      {
        label: 'Nominal-the-Best',
        tex: '\\eta=10\\log_{10}\\left(\\bar{y}^2/s^2\\right)',
        note: 'Target tertentu dengan variansi kecil.',
      },
      {
        label: 'Orthogonal Array',
        note: 'L4 (3 faktor 2 level), L8 (7 faktor 2 level), L9 (4 faktor 3 level).',
      },
      {
        label: 'Prediksi',
        tex: '\\hat{\\eta}_{\\text{opt}}=\\bar{\\eta}+\\sum_i(\\eta_{i,\\text{opt}}-\\bar{\\eta})',
        note: 'Delta besar = faktor berpengaruh; Rank 1 diprioritaskan.',
      },
    ],

    related: [
      { label: 'Kalkulator Taguchi S/N', href: '/kalkulator/taguchi-sn/', kind: 'kalkulator' },
      { label: 'Virtual Lab Taguchi', href: '/simulator/', kind: 'simulator' },
      { label: 'Desain Faktorial 2ᵏ & Interaksi', href: '/modul/faktorial-2k/', kind: 'modul' },
      { label: 'Tabel Orthogonal Array', href: '/cheat-sheet/', kind: 'referensi' },
    ],
};

export default content;
