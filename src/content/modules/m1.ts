import type { ModuleContent } from './types';

const content: ModuleContent = {
  slug: 'fondasi-berpikir-eksperimental',
  id: 'm1',
  objectives: [
    'Mengenali anatomi eksperimen: respon Y, faktor X, level, dan faktor pengganggu.',
    'Menjelaskan mengapa OFAT gagal menemukan optimum ketika terjadi interaksi.',
    'Menerapkan tiga prinsip Fisher: replikasi, randomisasi, dan blocking.',
    'Memilih rancangan awal dengan decision tree sederhana.',
  ],
  stages: {
    kenapa: {
      paragraphs: [
        'Sebuah tim R&D di pabrik kertas ingin menaikkan kekuatan tarik produk. Selama ini mereka bekerja dengan cara klasik: mengubah suhu pengeringan, melihat hasilnya, lalu mengubah kelembapan, dan seterusnya. Cara ini disebut OFAT (One-Factor-at-a-Time). Ia terasa logis dan hemat, tetapi menyimpan cacat fatal: OFAT hanya menjelajahi sepanjang sumbu faktor, bukan seluruh ruang kombinasi. Ketika dua faktor saling memengaruhi—saling berinteraksi—optimum sejati bisa berada di titik yang tidak pernah dikunjungi OFAT.',
        'Kasus nyata di lapangan sering lebih rumit: bahan baku datang dari dua pemasok, operator berganti shift, dan mesin memiliki gradient suhu. Faktor-faktor seperti ini disebut faktor pengganggu (nuisance factors). Bila tidak dikendalikan, efeknya menyamar sebagai galat dan membuat kesimpulan jadi tidak bisa dipercaya. Karena itu, sebelum menghitung ANOVA atau matriks Taguchi, mahasiswa perlu membangun intuisi tentang bagaimana eksperimen yang baik dirancang.',
        'Modul ini menjadi fondasi bagi seluruh kurikulum DOE. Di sini kita menjawab pertanyaan "mengapa" dan "bagaimana merancangnya", bukan "bagaimana menghitungnya". Setelah konsep replikasi, randomisasi, dan pemblokan kokoh, modul berikutnya tinggal menerapkan alat hitung yang sesuai.',
      ],
      bullets: [
        'Eksperimen yang buruk tidak bisa diselamatkan oleh analisis statistik yang rumit.',
        'OFAT menghemat jumlah percobaan, tetapi kehilangan informasi interaksi.',
        'Faktor pengganggu yang tidak dikendalikan menaikkan galat dan menurunkan sensitivitas uji.',
      ],
      callout: {
        tone: 'ok',
        title: 'Pesan kunci',
        body: 'Kualitas tidak diinspeksi masuk ke produk, melainkan dirancang masuk ke proses. Desain eksperimen adalah alat untuk memahami proses sebelum mengoptimalkannya.',
      },
    },

    konsep: {
      paragraphs: [
        'Setiap eksperimen memiliki anatomi yang sama. Variabel respon Y adalah hasil yang diukur—kekuatan tarik, yield, waktu siklus, atau cacat permukaan. Faktor kendali X adalah variabel yang sengaja diubah peneliti, misalnya suhu atau konsentrasi. Setiap faktor memiliki level, yaitu nilai-nilai spesifik yang diuji (misalnya 60 °C dan 80 °C). Sisanya disebut faktor pengganggu: variabel yang memengaruhi Y tetapi tidak diminati, seperti batch bahan baku atau operator. Mencampuradukkan ketiganya adalah sumber kebingungan paling umum.',
        'Interaksi terjadi ketika efek satu faktor bergantung pada level faktor lain. Bayangkan respon hipotetik Y = 10 + 2x₁ + 2x₂ + 3x₁x₂ dengan xᵢ berlevel −1 (+ rendah) atau +1 (+ tinggi). Kedua faktor terlihat "positif", tetapi karena ada suku interaksi, efek x₁ berubah arah tergantung x₂. Inilah sebabnya OFAT bisa terjebak: ia menyimpulkan arah efek dari satu titik saja, padahal arah itu tidak berlaku di seluruh ruang faktor.',
        'R.A. Fisher mengajukan tiga prinsip yang menjadi fondasi DOE modern. Replication (replikasi) berarti mengulang perlakuan; galat murni bisa diestimasi dan presisi meningkat menurut σ/√n. Randomization (randomisasi) berarti mengalokasikan unit eksperimen secara acak sehingga pengaruh variabel yang tidak diketahui tersebar merata, bukan menyatu dengan efek faktor. Blocking (pemblokan) berarti mengelompokkan unit berdasarkan sumber variasi yang sudah diketahui, sehingga variasi itu dipisahkan dari galat.',
        'Memilih rancangan bisa dimulai dari decision tree sederhana: ada berapa faktor yang akan dipelajari? Apakah ada sumber pengganggu yang jelas? Apakah tujuannya menyaring faktor penting atau mengoptimalkan kombinasi? Satu faktor dengan unit homogen → CRD. Satu faktor dengan blok jelas → RCBD. Beberapa faktor dan ingin melihat interaksi → faktorial 2ᵏ. Banyak faktor dengan anggaran terbatas dan fokus pada ketangguhan → Taguchi.',
      ],
      formulas: [
        {
          tex: 'Y=f(x_1,x_2,\\ldots,x_k)+\\varepsilon',
          caption: 'Model konseptual: respon = sinyal dari faktor + galat.',
        },
        {
          tex: 'SE(\\bar{y})=\\frac{\\sigma}{\\sqrt{n}}',
          caption: 'Replikasi menurunkan galat rata-rata; randomisasi melindungi estimasi ini dari bias.',
        },
        {
          tex: '\\text{Efek interaksi}=\\frac{\\left(\\bar{y}_{A+}-\\bar{y}_{A-}\\right)_{B+}-\\left(\\bar{y}_{A+}-\\bar{y}_{A-}\\right)_{B-}}{2}',
          caption: 'Interaksi adalah selisih efek A pada dua level B, dibagi dua.',
        },
      ],
      bullets: [
        'Replikasi → mengestimasi galat murni & menaikkan presisi.',
        'Randomisasi → menetralkan bias sistematis dari variabel tersembunyi.',
        'Blocking → mengisolasi variasi pengganggu yang sudah diketahui.',
        'Faktorial → menguji semua kombinasi level agar interaksi terlihat.',
      ],
      callout: {
        tone: 'warn',
        title: 'Jangan tertukar',
        body: 'Replikasi adalah pengulangan perlakuan yang identik; pengukuran berulang pada unit yang sama bukan replikasi sejati. Randomisasi bukan sekadar "acak asal", melainkan prosedur yang terdokumentasi dan dapat direproduksi.',
      },
    },

    contoh: {
      paragraphs: [
        'Angka 9 versus 17 bukan sekadar selisih hipotetis; dalam proses nyata selisih itu bisa berupa persentase yield atau rupiah per batch. Karena itu, biaya percobaan ekstra faktorial hampir selalu lebih rendah daripada biaya salah memilih level proses.',
        'Mari buktikan kegagalan OFAT dengan angka. Misalkan respon sebenarnya mengikuti Y = 10 + 2x₁ + 2x₂ + 3x₁x₂, dengan x₁ = suhu dan x₂ = kelembapan, masing-masing berlevel −1 dan +1. Kita akan membandingkan jalur OFAT yang berangkat dari titik (−1, −1) dengan eksperimen faktorial yang menguji keempat kombinasi.',
      ],
      steps: [
        {
          title: 'Hitung respon di semua kombinasi',
          formula: 'Y=10+2x_1+2x_2+3x_1x_2,\\qquad x_i\\in\\{-1,+1\\}',
          substitution: '(-1,-1):\\ 10-2-2+3=9;\\quad (+1,-1):\\ 10+2-2-3=7;\\quad (-1,+1):\\ 10-2+2-3=7;\\quad (+1,+1):\\ 10+2+2+3=17',
          result: 'Empat titik: (−1,−1)=9, (+1,−1)=7, (−1,+1)=7, (+1,+1)=17.',
          detail: 'Perhatikan bahwa titik tertinggi berada di sudut (+1,+1), bukan di titik awal.',
        },
        {
          title: 'Jalur OFAT dari titik awal',
          detail: 'Mulai di (−1,−1) dengan Y = 9. Ubah x₁ saja menjadi +1 → respon turun ke 7, jadi OFAT mempertahankan x₁ = −1. Kembali ke (−1,−1), ubah x₂ saja menjadi +1 → respon juga turun ke 7, jadi OFAT mempertahankan x₂ = −1. OFAT menyimpulkan "optimum" di (−1,−1) dengan Y = 9.',
        },
        {
          title: 'Jalur faktorial',
          detail: 'Eksperimen faktorial menguji keempat kombinasi sekaligus. Nilai 17 di (+1,+1) langsung terlihat. Selisih antara "optimum" OFAT (9) dan optimum sejati (17) adalah 8 satuan—kerugian besar akibat mengabaikan interaksi.',
        },
        {
          title: 'Ukur efek utama dan interaksi',
          formula: '\\text{Efek}_A=\\bar{y}_{A+}-\\bar{y}_{A-},\\qquad \\text{Efek}_{AB}=\\frac{(17+9)-(7+7)}{2}',
          substitution: '\\bar{y}_{A+}=\\frac{7+17}{2}=12,\\quad \\bar{y}_{A-}=\\frac{9+7}{2}=8;\\quad \\text{Efek}_{AB}=\\frac{26-14}{2}=6',
          result: 'Efek utama A = 4, efek utama B = 4, efek interaksi AB = 6.',
          detail: 'Efek interaksi (6) lebih besar daripada efek utama—situasi di mana OFAT paling menyesatkan.',
        },
        {
          title: 'Terjemahkan dalam prinsip Fisher',
          detail: 'Untuk mempercayai angka-angka ini, jalankan ulang setiap kombinasi beberapa kali (replikasi), tentukan urutan percobaan dengan undian (randomisasi), dan bila bahan baku datang dari dua batch, jadikan batch sebagai blok (blocking). Tanpa itu, angka 17 bisa saja muncul karena kebetulan batch yang lebih baik.',
        },
      ],
      table: {
        caption: 'Hasil respon hipotetik (kode −1 = rendah, +1 = tinggi)',
        head: ['x₁ (suhu)', 'x₂ (kelembapan)', 'Respon Y', 'Keterangan'],
        rows: [
          ['−1', '−1', '9', 'Titik awal OFAT'],
          ['+1', '−1', '7', 'OFAT: x₁ dinaikkan → turun'],
          ['−1', '+1', '7', 'OFAT: x₂ dinaikkan → turun'],
          ['+1', '+1', '17', 'Optimum sejati (faktorial)'],
        ],
      },
    },

    coba: {
      paragraphs: [
        'Amati pula apa yang terjadi saat efek utama dibuat berlawanan tanda dengan interaksi—kasus seperti ini paling sering membuat OFAT mengambil keputusan yang benar-benar keliru.',
        'Gunakan sandbox OFAT vs. Factorial untuk memanipulasi besar efek utama dan efek interaksi secara langsung. Perhatikan bagaimana jalur OFAT "tersendat" di satu sudut ketika interaksi diperbesar, sementara desain faktorial tetap menemukan titik optimum. Coba pula mengubah arah interaksi: apakah OFAT pernah beruntung?',
      ],
      bullets: [
        'Set efek interaksi = 0: apakah OFAT kini menemukan optimum?',
        'Perbesar efek interaksi: seberapa jauh jalur OFAT meleset?',
        'Hubungkan dengan tiga prinsip Fisher: faktor mana yang perlu diblok pada proses Anda?',
      ],
    },

    latihan: {
      paragraphs: [
        'Gambarlah ruang faktor dua dimensi sebelum menjawab; visualisasi membantu membedakan efek utama dari interaksi.',
        'Jawab pertanyaan berikut untuk menguji intuisi Anda sebelum memasuki modul ANOVA. Kunci jawaban tersedia di bawah.',
      ],
      prompts: [
        'Sebuah eksperimen menguji suhu (60/80 °C) dan waktu (10/20 menit). Sebutkan respon, faktor, level, dan satu calon faktor pengganggu.',
        'Mengapa mengulang percobaan tiga kali lebih baik daripada mengukur satu unit tiga kali?',
        'Dengan Y = 10 + 2x₁ + 2x₂ + 3x₁x₂, berapa efek interaksinya?',
      ],
      cheat: [
        { label: 'Kunci 1', note: 'Respon misalnya yield; faktor = suhu & waktu; level = 60/80 °C dan 10/20 menit; pengganggu misalnya operator atau batch bahan.' },
        { label: 'Kunci 2', note: 'Tiga perlakuan terpisah memberi galat murni dan menurunkan SE menjadi σ/√3; mengukur satu unit tiga kali hanya mengurangi error pengukuran.' },
        { label: 'Kunci 3', note: 'Interaksi AB = [(17 + 9) − (7 + 7)]/2 = 6.' },
      ],
    },

    ringkasan: {
      paragraphs: [
        'Pemahaman ini akan dipakai berulang: ANOVA menguji efek dengan bantuan replikasi, RCBD menerapkan blocking, dan faktorial memanfaatkan desain yang seimbang. Tanpa ketiga prinsip Fisher, seluruh teknik itu kehilangan landasan.',
        'Berpikir eksperimental berarti membedakan sinyal dari galat sejak tahap perencanaan. Anatomi eksperimen, kegagalan OFAT, dan tiga prinsip Fisher adalah fondasi yang dipakai semua teknik DOE berikutnya. Sebelum memilih rumus, tanyakan: faktor apa yang diubah, apa yang diukur, apa yang bisa mengganggu, dan bagaimana galatnya diestimasi.',
      ],
    },

  },

  cheatSheet: [
      {
        label: 'Anatomi',
        note: 'Y = respon; X = faktor kendali; level = nilai faktor; nuisance = faktor pengganggu.',
      },
      {
        label: 'Efek utama',
        tex: '\\text{Efek}_A=\\bar{y}_{A+}-\\bar{y}_{A-}',
        note: 'Selisih rata-rata respon pada dua level A.',
      },
      {
        label: 'Interaksi',
        tex: '\\text{Efek}_{AB}=\\frac{(ab+(1))-(a+b)}{2}',
        note: 'Beda efek A pada level B berbeda; bukan sekadar jumlah efek utama.',
      },
      {
        label: 'Replikasi',
        tex: 'SE(\\bar{y})=\\sigma/\\sqrt{n}',
        note: 'Galat murni bisa diestimasi, presisi naik.',
      },
      {
        label: 'Decision tree',
        note: '1 faktor → CRD/RCBD; banyak faktor → faktorial 2ᵏ; anggaran ketat & robust → Taguchi.',
      },
    ],

    related: [
      { label: 'Simulator OFAT vs. Faktorial', href: '/simulator/', kind: 'simulator' },
      { label: 'CRD · ANOVA Satu Arah', href: '/kalkulator/crd-anova/', kind: 'kalkulator' },
      { label: 'Eksperimen Satu Faktor & ANOVA', href: '/modul/crd-anova/', kind: 'modul' },
      { label: 'Panduan Memilih Desain', href: '/cheat-sheet/', kind: 'referensi' },
    ],
};

export default content;
