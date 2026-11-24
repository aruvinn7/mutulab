import type { ModuleContent } from './types';

const content: ModuleContent = {
  slug: 'blocking-rcbd',
  id: 'm3',
  objectives: [
    'Mengenali sumber variasi pengganggu dan memutuskan kapan pemblokan diperlukan.',
    'Menyusun RCBD dan melakukan dekomposisi SSₜₒₜₐₗ = SSₜᵣ + SSᵦₗₒₖ + SSₑ.',
    'Menjelaskan mengapa blocking mengecilkan MSₑᵣᵣₒᵣ dan menaikkan sensitivitas uji F.',
    'Memahami konsep Latin Square untuk mengendalikan dua sumber pengganggu.',
  ],
  stages: {
    kenapa: {
      paragraphs: [
        'Sebuah laboratorium material akan membandingkan tiga jenis resin. Bahan baku datang dalam empat batch dengan mutu sedikit berbeda, dan pengujian harus memakai keempat batch itu. Bila penelitian memakai CRD, perbedaan antarbatch tidak tercatat sebagai apa pun—ia masuk ke galat. Akibatnya MSₑᵣᵣₒᵣ membengkak dan uji F menjadi kurang sensitif: efek resin yang nyata bisa saja gagal terdeteksi.',
        'Pemblokan (blocking) mengatasi ini dengan cara mengelompokkan unit eksperimen menurut sumber variasi yang sudah diketahui. Di dalam setiap blok—misalnya satu batch bahan—semua perlakuan diuji tepat satu kali, lalu urutannya diacak. Variasi antarblok kini dipisahkan dari galat, sehingga galat yang tersisa benar-benar mencerminkan kebisingan di dalam blok.',
        'Prinsipnya sederhana namun kuat: blok yang baik adalah sumber variasi yang diduga besar, dapat diidentifikasi sebelum eksperimen, dan tidak merupakan faktor yang sedang dipelajari. Modul ini menunjukkan secara numerik bagaimana keputusan statistik bisa berubah hanya karena kita "memberi nama" pada sumber variasi itu.',
      ],
      bullets: [
        'Blok = kelompok unit yang mirip satu sama lain, berbeda dari blok lain.',
        'Pemblokan mengisolasi variasi yang diketahui agar tidak menyamar sebagai galat.',
        'Blok bukan faktor perlakuan—kita tidak tertarik pada efeknya, hanya ingin mengeluarkannya.',
      ],
    },

    konsep: {
      paragraphs: [
        'Randomized Complete Block Design (RCBD) mensyaratkan setiap blok memuat semua perlakuan tepat satu kali (complete), dengan penugasan unit di dalam blok dilakukan secara acak. Modelnya ditulis Yᵢⱼ = μ + τᵢ + βⱼ + εᵢⱼ, di mana τᵢ adalah efek perlakuan ke-i, βⱼ efek blok ke-j, dan εᵢⱼ galat. Derajat kebebasan: perlakuan a − 1, blok b − 1, galat (a − 1)(b − 1), total ab − 1.',
        'Dekomposisi jumlah kuadrat kini memiliki tiga komponen. SS treatment dihitung dari rata-rata tiap perlakuan, SS block dari rata-rata tiap blok, dan sisanya adalah SS error. Karena SS block "diambil" dari apa yang tadinya galat pada CRD, MS error RCBD biasanya lebih kecil. Statistik uji perlakuan tetap F = MSₜᵣ/MSₑ, tetapi dengan denominator yang lebih kecil nilai F naik—uji menjadi lebih sensitif. Efek blok juga bisa diuji dengan F = MSᵦₗₒₖ/MSₑ, meskipun biasanya ini hanya sebagai diagnostik.',
        'Bila ada dua sumber pengganggu yang ingin dikendalikan sekaligus, RCBD tidak cukup. Latin Square Design menempatkan setiap perlakuan tepat satu kali pada setiap baris dan setiap kolom, sehingga variasi baris (misalnya operator) dan kolom (misalnya mesin) keduanya tersisih. Modelnya Yᵢⱼₖ = μ + τᵢ + ρⱼ + κₖ + ε. Untuk p perlakuan, df galatnya (p − 1)(p − 2)—lebih efisien daripada RCBD dengan dua blok terpisah, tetapi dengan syarat struktur baris–kolom benar-benar ada.',
        'Pemilihan antara CRD, RCBD, dan Latin Square bukan soal mana yang "paling canggih", melainkan apa yang diketahui tentang proses. CRD untuk unit homogen; RCBD untuk satu sumber pengganggu jelas; Latin Square untuk dua sumber yang saling orthogonal. Bila sumber pengganggu tidak diketahui, randomisasi tetap merupakan pertahanan terbaik.',
      ],
      formulas: [
        {
          tex: 'Y_{ij}=\\mu+\\tau_i+\\beta_j+\\varepsilon_{ij}',
          caption: 'Model RCBD: perlakuan + blok + galat.',
        },
        {
          tex: 'SS_T=SS_{\\text{Tr}}+SS_{\\text{Blok}}+SS_E',
          caption: 'Dekomposisi tiga komponen pada RCBD seimbang.',
        },
        {
          tex: 'df:\\ (ab-1)=(a-1)+(b-1)+(a-1)(b-1)',
          caption: 'Pembagian derajat kebebasan RCBD.',
        },
        {
          tex: 'F_{\\text{Tr}}=\\frac{MS_{\\text{Tr}}}{MS_E},\\qquad F_{\\text{Blok}}=\\frac{MS_{\\text{Blok}}}{MS_E}',
          caption: 'Uji F untuk perlakuan dan (opsional) untuk blok.',
        },
      ],
      bullets: [
        'Setiap blok memuat semua perlakuan tepat satu kali.',
        'SS blok dihitung dari rata-rata blok, dibagi jumlah perlakuan a.',
        'MS error RCBD lebih kecil daripada MS error CRD bila efek blok nyata.',
        'Latin Square mengendalikan dua sumber pengganggu, df error = (p−1)(p−2).',
      ],
      callout: {
        tone: 'info',
        title: 'Kapan blok tidak membantu?',
        body: 'Bila antarblok hampir tidak berbeda, SS blok kecil dan galat RCBD tidak jauh lebih kecil daripada CRD—bahkan satu df terpakai untuk blok. Itulah sebabnya blok harus dipilih berdasarkan pengetahuan proses, bukan sekadar kebiasaan.',
      },
    },

    contoh: {
      paragraphs: [
        'Bandingkan kedua nilai F tersebut dengan saksama: data yang sama, kesimpulan berbeda. Satu-satunya perubahan adalah kita memberi nama pada batch sebagai blok, sehingga variasi yang tadinya tersembunyi kini dihitung secara eksplisit.',
        'Studi kasus: tiga resin (T1, T2, T3) diuji pada empat batch bahan (B1–B4). Data kekuatan (MPa): T1 = 12, 15, 17, 21; T2 = 14, 18, 19, 22; T3 = 10, 13, 16, 18. Kita hitung ANOVA RCBD pada α = 0,05, lalu bandingkan dengan hasil bila blok diabaikan.',
      ],
      steps: [
        {
          title: 'Rekap total perlakuan dan blok',
          formula: 'T_i=\\sum_j y_{ij},\\qquad B_j=\\sum_i y_{ij},\\qquad T=\\sum_i T_i',
          substitution: 'T_1=12+15+17+21=65;\\quad T_2=14+18+19+22=73;\\quad T_3=10+13+16+18=57;\\quad T=195',
          result: 'Total blok: B₁ = 36, B₂ = 46, B₃ = 52, B₄ = 61. Jumlah kuadrat semua observasi = 3.313; T²/N = 195²/12 = 3.168,75.',
          detail: 'Blok B4 jelas lebih tinggi—ini sinyal bahwa batch memang berpengaruh.',
        },
        {
          title: 'Jumlah kuadrat total',
          formula: 'SS_T=\\sum y_{ij}^2-\\frac{T^2}{N}',
          substitution: 'SS_T=3313-3168{,}75',
          result: 'SSₜₒₜₐₗ = 144,2500.',
        },
        {
          title: 'Jumlah kuadrat perlakuan',
          formula: 'SS_{\\text{Tr}}=\\frac{\\sum_i T_i^2}{b}-\\frac{T^2}{N}',
          substitution: '\\frac{65^2+73^2+57^2}{4}=\\frac{12803}{4}=3200{,}75',
          result: 'SSₜᵣ = 3.200,75 − 3.168,75 = 32,0000.',
        },
        {
          title: 'Jumlah kuadrat blok',
          formula: 'SS_{\\text{Blok}}=\\frac{\\sum_j B_j^2}{a}-\\frac{T^2}{N}',
          substitution: '\\frac{36^2+46^2+52^2+61^2}{3}=\\frac{9837}{3}=3279',
          result: 'SSᵦₗₒₖ = 3.279 − 3.168,75 = 110,2500.',
        },
        {
          title: 'Galat dan tabel ANOVA',
          formula: 'SS_E=SS_T-SS_{\\text{Tr}}-SS_{\\text{Blok}}',
          substitution: 'SS_E=144{,}25-32-110{,}25=2{,}00;\\quad MS_E=\\frac{2}{(3-1)(4-1)}=\\frac{2}{6}=0{,}3333',
          result: 'MSₜᵣ = 32/2 = 16; Fₜᵣ = 16/0,3333 = 48,0000 (p ≈ 0,0002). Fᵦₗₒₖ = 36,75/0,3333 = 110,25.',
          detail: 'Fₜᵣ = 48 jauh melebihi Fₖᵣᵢₜ(2; 6) ≈ 5,14 → resin berpengaruh nyata.',
        },
        {
          title: 'Bandingkan bila blok diabaikan (CRD)',
          formula: 'SS_E^{*}=SS_T-SS_{\\text{Tr}},\\qquad MS_E^{*}=\\frac{SS_E^{*}}{N-a}',
          substitution: 'SS_E^{*}=144{,}25-32=112{,}25;\\quad MS_E^{*}=\\frac{112{,}25}{9}=12{,}4722',
          result: 'F* = 16/12,4722 = 1,2829 < Fₖᵣᵢₜ(2; 9) ≈ 4,26 → gagal tolak H₀.',
          detail: 'Kesimpulannya berbalik! Blocking menyelamatkan uji dari galat yang sebenarnya berasal dari perbedaan batch.',
        },
      ],
      table: {
        caption: 'Tabel ANOVA RCBD (α = 0,05)',
        head: ['Sumber', 'SS', 'df', 'MS', 'F'],
        rows: [
          ['Perlakuan (resin)', '32,0000', '2', '16,0000', '48,0000'],
          ['Blok (batch)', '110,2500', '3', '36,7500', '110,2500'],
          ['Galat', '2,0000', '6', '0,3333', '—'],
          ['Total', '144,2500', '11', '—', '—'],
        ],
      },
    },

    coba: {
      paragraphs: [
        'Coba pula membalik urutan blok: bila kesimpulan tetap sama, Anda melihat ciri khas RCBD yang seimbang—setiap perlakuan menghadapi semua kondisi blok.',
        'Gunakan kalkulator RCBD ANOVA untuk mencoba data Anda sendiri dan melihat secara langsung bagaimana SS blok "dikeluarkan" dari galat. Bandingkan hasilnya dengan kalkulator CRD pada data yang sama—perbedaan F sering kali mencolok. Untuk latihan konsep Latin Square, lihat contoh statis di cheat sheet; modul ini memang tidak menyediakan kalkulator Latin Square.',
      ],
      bullets: [
        'Hilangkan satu blok: bagaimana df error dan F berubah?',
        'Buat semua blok hampir identik: apakah RCBD masih menguntungkan?',
        'Untuk 3 perlakuan, berapa df error Latin Square? (Jawaban: (3−1)(3−2) = 2.)',
      ],
      callout: {
        tone: 'warn',
        title: 'Pertanyaan pemantik',
        body: 'Apa yang terjadi pada MS error jika blok diabaikan padahal efek blok besar? Jelaskan dengan kata-kata sebelum melihat angka.',
      },
    },

    latihan: {
      paragraphs: [
        'Sebelum menghitung, gambarlah tabel a kali b dan isi total baris serta total kolom; hampir semua kesalahan RCBD berawal dari salah total.',
        'Uji pemahaman Anda tentang dekomposisi RCBD dan kapan blocking diperlukan. Kunci di bawah.',
      ],
      prompts: [
        'RCBD dengan a = 4 perlakuan dan b = 3 blok: berapa df total, df perlakuan, df blok, dan df galat?',
        'Jika SSₜₒₜₐₗ = 200, SSₜᵣ = 80, SSᵦₗₒₖ = 100, berapa SSₑ?',
        'Sebutkan satu situasi di mana Latin Square lebih tepat daripada RCBD.',
      ],
      cheat: [
        { label: 'Kunci 1', note: 'N = 12; df total = 11; df perlakuan = 3; df blok = 2; df galat = 3 × 2 = 6.' },
        { label: 'Kunci 2', note: 'SS error = 200 − 80 − 100 = 20.' },
        { label: 'Kunci 3', note: 'Misalnya eksperimen yang dipengaruhi oleh operator (baris) sekaligus mesin (kolom), dan keduanya dapat diatur dalam kuadrat p × p.' },
      ],
    },

    ringkasan: {
      paragraphs: [
        'Pemblokan adalah contoh terbaik dari prinsip Fisher yang diterapkan: mengenali sumber variasi sebelum eksperimen, lalu merancang alokasi supaya variasi itu tidak mengganggu perbandingan utama.',
        'Blocking adalah cara memanfaatkan pengetahuan tentang proses untuk meningkatkan sensitivitas uji. RCBD memisahkan satu sumber pengganggu, Latin Square dua. Manfaatnya terlihat jelas pada contoh di atas: tanpa blok, efek resin yang nyata gagal terdeteksi; dengan blok, F naik menjadi 48. Selalu tanyakan "apa yang berubah antarunit sebelum saya memberi perlakuan?"—jawabannya adalah calon blok.',
      ],
    },

  },

  cheatSheet: [
      {
        label: 'Model RCBD',
        tex: 'Y_{ij}=\\mu+\\tau_i+\\beta_j+\\varepsilon_{ij}',
        note: 'τᵢ = perlakuan, βⱼ = blok.',
      },
      {
        label: 'Dekomposisi',
        tex: 'SS_T=SS_{\\text{Tr}}+SS_{\\text{Blok}}+SS_E',
        note: 'df: (ab−1) = (a−1) + (b−1) + (a−1)(b−1).',
      },
      {
        label: 'SS blok',
        tex: 'SS_{\\text{Blok}}=\\frac{\\sum_j B_j^2}{a}-\\frac{T^2}{N}',
        note: 'Bⱼ = total observasi pada blok j.',
      },
      {
        label: 'Latin Square',
        tex: 'df_E=(p-1)(p-2)',
        note: 'Mengendalikan dua sumber pengganggu (baris & kolom).',
      },
      {
        label: 'Intuisi',
        note: 'Blok mengecilkan MS error → F perlakuan naik → uji lebih sensitif.',
      },
    ],

    related: [
      { label: 'Kalkulator RCBD ANOVA', href: '/kalkulator/rcbd-anova/', kind: 'kalkulator' },
      { label: 'Kalkulator CRD ANOVA', href: '/kalkulator/crd-anova/', kind: 'kalkulator' },
      { label: 'Desain Faktorial 2ᵏ & Interaksi', href: '/modul/faktorial-2k/', kind: 'modul' },
      { label: 'Tabel Referensi', href: '/cheat-sheet/', kind: 'referensi' },
    ],
};

export default content;
