(function () {
  'use strict';
  var LW = 384, LH = 216, Z = 3, FEET = 196;
  var $ = function (id) { return document.getElementById(id); };
  var cv = $('cv'), ctx = cv.getContext('2d');
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sandi & matematika ---------- */
  function val(c) {
    return c === ' ' ? 0 : (c >= 'A' && c <= 'Z' ? c.charCodeAt(0) - 64 : -(c.charCodeAt(0) - 96));
  }
  function chr(v) {
    return v === 0 ? ' ' : (v > 0 ? String.fromCharCode(64 + v) : String.fromCharCode(96 - v));
  }
  var F = function (x) { return 5 * x - 1; };
  var GF = function (x) { return 10 * x - 5; };
  function enc(m, fn) {
    return Array.from(m).map(function (c) { return fn(val(c)); });
  }

  /* ---------- katalog variasi teka-teki dinamis (f(x), g(x), kalimat berganti acak) ---------- */
  var P1_VARIANTS = [
    {
      seq: [16, -5, -12, -1, -11, -21, 0, 1, -4, -1, 0, 4, -9, 0, 7, -21, -4, -1, -14, -7],
      hash: '70ae516fc15fc64ea455cb21ebeb19354c9a384b9e0b15c7a63e7b1f642c675c',
      rulePlain: 'f(x) = 5x − 1',
      rule: 'y = f(x) = 5x − 1',
      invRule: 'x = (y + 1) / 5',
      fn: function (x) { return 5 * x - 1; },
      calcs: [
        { n: 'f⁻¹(y) = (y + 1) / 5', fn: function (y) { return (y + 1) / 5; } }
      ]
    },
    {
      seq: [16, -5, -18, -9, -11, -19, -1, 0, 7, -21, -4, -1, -14, -7, 0, 2, -5, -12, -1, -11, -1, -14, -7],
      hash: '680723f6849f0b9d3ea95770cb9517e8c6815f28e33e83d06c28f6cbfa7e7f97',
      rulePlain: 'f(x) = 3x + 2',
      rule: 'y = f(x) = 3x + 2',
      invRule: 'x = (y − 2) / 3',
      fn: function (x) { return 3 * x + 2; },
      calcs: [
        { n: 'f⁻¹(y) = (y − 2) / 3', fn: function (y) { return (y - 2) / 3; } }
      ]
    },
    {
      seq: [2, -21, -11, -20, -9, 0, 1, -4, -1, 0, 4, -9, 0, 7, -21, -4, -1, -14, -7],
      hash: '440416a23195f6a747677d23171d76777e8f76665bf64041876a373fba5c5632',
      rulePlain: 'f(x) = 4x − 3',
      rule: 'y = f(x) = 4x − 3',
      invRule: 'x = (y + 3) / 4',
      fn: function (x) { return 4 * x - 3; },
      calcs: [
        { n: 'f⁻¹(y) = (y + 3) / 4', fn: function (y) { return (y + 3) / 4; } }
      ]
    },
    {
      seq: [3, -1, -18, -9, 0, 16, -5, -20, -21, -14, -10, -21, -11, 0, 4, -9, 0, 7, -21, -4, -1, -14, -7],
      hash: '88731bd9d728a7864cb3b5741d718e2b938888fa0720a039ad6813c05b3ba72e',
      rulePlain: 'f(x) = 2x + 7',
      rule: 'y = f(x) = 2x + 7',
      invRule: 'x = (y − 7) / 2',
      fn: function (x) { return 2 * x + 7; },
      calcs: [
        { n: 'f⁻¹(y) = (y − 7) / 2', fn: function (y) { return (y - 7) / 2; } }
      ]
    }
  ];

  var P2_VARIANTS = [
    {
      seq: [10, -1, -13, 0, 4, -9, -14, -4, -9, -14, -7, 0, 2, -15, -8, -15, -14, -7],
      hash: 'e1aae1b326135b2b682e6cd7b35efb648e14b82faa6c5cecf41490f9456397da',
      fRule: 'f(x) = 5x − 1',
      gRule: 'g(x) = 2x − 3',
      rule: 'y = (g∘f)(x) = 2(5x − 1) − 3 = 10x − 5',
      invRule: 'x = (y + 5) / 10',
      fn: function (x) { return 10 * x - 5; },
      calcs: [
        { n: 'f⁻¹(y) = (y + 1) / 5', fn: function (y) { return (y + 1) / 5; } },
        { n: 'g⁻¹(y) = (y + 3) / 2', fn: function (y) { return (y + 3) / 2; } },
        { n: '(g∘f)⁻¹(y) = (y + 5) / 10', fn: function (y) { return (y + 5) / 10; } }
      ]
    },
    {
      seq: [23, -1, -11, -20, -21, 0, 11, -5, -13, -1, -20, -9, -1, -14, 0, 16, -1, -12, -19, -21],
      hash: '9f58f683b957d51036633bd69bef53a32f45e2ab03a826b2d4ea08ac7b677281',
      fRule: 'f(x) = 3x + 2',
      gRule: 'g(x) = 2x − 1',
      rule: 'y = (g∘f)(x) = 2(3x + 2) − 1 = 6x + 3',
      invRule: 'x = (y − 3) / 6',
      fn: function (x) { return 6 * x + 3; },
      calcs: [
        { n: 'f⁻¹(y) = (y − 2) / 3', fn: function (y) { return (y - 2) / 3; } },
        { n: 'g⁻¹(y) = (y + 1) / 2', fn: function (y) { return (y + 1) / 2; } },
        { n: '(g∘f)⁻¹(y) = (y − 3) / 6', fn: function (y) { return (y - 3) / 6; } }
      ]
    },
    {
      seq: [1, -12, -9, -2, -9, 0, 10, -1, -13, 0, 4, -9, -14, -4, -9, -14, -7, 0, 16, -1, -12, -19, -21],
      hash: 'c1938e7db161c40f3e2a7c15f50270816f2934e1752e0a84f0befb64eea0638e',
      fRule: 'f(x) = 2x + 1',
      gRule: 'g(x) = 3x − 2',
      rule: 'y = (g∘f)(x) = 3(2x + 1) − 2 = 6x + 1',
      invRule: 'x = (y − 1) / 6',
      fn: function (x) { return 6 * x + 1; },
      calcs: [
        { n: 'f⁻¹(y) = (y − 1) / 2', fn: function (y) { return (y - 1) / 2; } },
        { n: 'g⁻¹(y) = (y + 2) / 3', fn: function (y) { return (y + 2) / 3; } },
        { n: '(g∘f)⁻¹(y) = (y − 1) / 6', fn: function (y) { return (y - 1) / 6; } }
      ]
    },
    {
      seq: [10, -1, -13, 0, 13, -21, -19, -9, -11, 0, 4, -9, -18, -5, -11, -1, -25, -1, -19, -1],
      hash: '329ddf85f29eb27a7f6ab76e88add155903ecef79b1950d87d9bda05156ff3e5',
      fRule: 'f(x) = 4x − 1',
      gRule: 'g(x) = 2x + 3',
      rule: 'y = (g∘f)(x) = 2(4x − 1) + 3 = 8x + 1',
      invRule: 'x = (y − 1) / 8',
      fn: function (x) { return 8 * x + 1; },
      calcs: [
        { n: 'f⁻¹(y) = (y + 1) / 4', fn: function (y) { return (y + 1) / 4; } },
        { n: 'g⁻¹(y) = (y − 3) / 2', fn: function (y) { return (y - 3) / 2; } },
        { n: '(g∘f)⁻¹(y) = (y − 1) / 8', fn: function (y) { return (y - 1) / 8; } }
      ]
    }
  ];

  var PUZ = {};

  function initRandomPuzzles() {
    var v1 = P1_VARIANTS[Math.floor(Math.random() * P1_VARIANTS.length)];
    var v2 = P2_VARIANTS[Math.floor(Math.random() * P2_VARIANTS.length)];

    var p1Cipher = v1.seq.map(function (x) { return v1.fn(x); });
    var p1Spaces = [];
    v1.seq.forEach(function (x, i) { if (x === 0) p1Spaces.push(i); });

    var p2Cipher = v2.seq.map(function (x) { return v2.fn(x); });
    var p2Spaces = [];
    v2.seq.forEach(function (x, i) { if (x === 0) p2Spaces.push(i); });

    var firstCharX1 = v1.seq[0];
    var firstY1 = v1.fn(firstCharX1);
    var firstChr1 = chr(firstCharX1);

    var firstCharX2 = v2.seq[0];
    var firstY2 = v2.fn(firstCharX2);
    var firstChr2 = chr(firstCharX2);

    PUZ = {
      p1: {
        title: 'Teka-Teki Sandi 1: Kartu di Bawah Cangkir',
        targetHash: v1.hash,
        cipher: p1Cipher,
        spaces: p1Spaces,
        seq: v1.seq,
        fn: v1.fn,
        img: 'p_kartu_sandi_1_x3',
        rulePlain: v1.rulePlain,
        rule: v1.rule,
        invRule: v1.invRule,
        calcs: v1.calcs,
        hints: [
          'Kunci Enkripsi: ' + v1.rulePlain + '. Untuk mencari plainteks x, gunakan fungsi dekripsi: ' + v1.invRule + '.',
          'Contoh: Angka ' + firstY1 + ' → dihitung dengan rumus invers menghasilkan x = ' + firstCharX1 + ' (Huruf ' + firstChr1 + '). Spasi bernilai 0.',
          'Huruf kapital bernilai positif (+1 s/d +26), huruf kecil negatif (−1 s/d −26). Tekan SPASI pada kotak bertanda ␣ untuk memisahkan kata!'
        ]
      },
      p2: {
        title: 'Teka-Teki Sandi 2: Kartu Bunga Dua Kelopak',
        targetHash: v2.hash,
        cipher: p2Cipher,
        spaces: p2Spaces,
        seq: v2.seq,
        fn: v2.fn,
        img: 'p_kartu_sandi_2_dua_kelopak_x3',
        fRule: v2.fRule,
        gRule: v2.gRule,
        rule: v2.rule,
        invRule: v2.invRule,
        calcs: v2.calcs,
        hints: [
          'Enkripsi Lapis Ganda: ' + v2.rule + '.',
          'Gunakan rumus Invers Komposisi untuk membalikkan angka: ' + v2.invRule + '.',
          'Contoh: Angka ' + firstY2 + ' → dihitung dengan rumus invers menghasilkan x = ' + firstCharX2 + ' (Huruf ' + firstChr2 + '). Tekan tombol SPASI pada kotak bertanda ␣.'
        ]
      }
    };
  }

  /* ---------- aset visual ---------- */
  var IM = {};
  function loadAll() {
    var ks = Object.keys(ASSETS);
    return Promise.all(ks.map(function (k) {
      return new Promise(function (r) {
        var i = new Image();
        i.onload = function () { IM[k] = i; r(); };
        i.onerror = function () { r(); };
        i.src = ASSETS[k];
      });
    }));
  }
  var ATL = {
    base: { idle: [0, 4, 6], walk: [1, 6, 10], run: [2, 6, 14], crouch: [5, 2, 6], hurt: [6, 2, 8], talk: [7, 4, 6] },
    raka: { idle: [0, 4, 6], walk: [1, 6, 10], run: [2, 6, 14], crouch: [5, 2, 6], hurt: [6, 2, 8], talk: [7, 4, 6], notes: [8, 4, 5] },
    noah: { idle: [0, 4, 6], walk: [1, 6, 10], run: [2, 6, 14], crouch: [5, 2, 6], hurt: [6, 2, 8], talk: [7, 4, 6], notes: [8, 4, 5] },
    siluet_pelaku: { idle: [0, 4, 6], walk: [1, 6, 10], run: [2, 6, 14], attack: [6, 4, 12], hurt: [7, 2, 8] }
  };
  var RK = { aula: 'aula', musik: 'ruang_musik', kerja: 'ruang_kerja', dapur: 'dapur_makan', lorong: 'lorong_kamar', gudang: 'gudang' };
  var RN = { aula: 'Aula', musik: 'Ruang Musik', kerja: 'Ruang Kerja', dapur: 'Dapur & Ruang Makan', lorong: 'Lorong & Kamar Noah', gudang: 'Gudang' };
  var NAME = {
    harin: 'Harin', sari: 'Harin',
    dimas: 'Dimas',
    yuna: 'Yuna', naya: 'Yuna',
    jake: 'Jake', bima: 'Jake',
    basuki: 'Pak Basuki', surya: 'Pak Basuki', arga: 'Pak Basuki',
    noah: 'Noah', raka: 'Noah'
  };

  var CHAR_SCALE = 1.45;

  function drawChar(id, anim, x, face, tm, once) {
    var T = ATL[id] || ATL.base, A = T[anim] || T.idle, sh = IM['ch_' + id];
    if (!sh) return;
    var idx = once ? Math.min(A[1] - 1, Math.floor(tm * A[2])) : Math.floor(tm * A[2]) % A[1];
    var sw = Math.round(64 * CHAR_SCALE);
    var shH = Math.round(64 * CHAR_SCALE);
    var ox = Math.round(32 * CHAR_SCALE);
    var oy = Math.round(62 * CHAR_SCALE);
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath();
    ctx.ellipse(x, FEET + 1, Math.round(14 * CHAR_SCALE), Math.round(3.5 * CHAR_SCALE), 0, 0, 6.3);
    ctx.fill();
    ctx.save(); ctx.translate(Math.round(x), 0); if (face < 0) ctx.scale(-1, 1);
    ctx.drawImage(sh, idx * 64, A[0] * 64, 64, 64, -ox, FEET - oy, sw, shH);
    ctx.restore();
  }
  function nameTag(x, t, col) {
    ctx.font = '7px "Pixelify Sans","Courier New",monospace';
    ctx.textAlign = 'center'; ctx.lineWidth = 2;
    var tagY = FEET - Math.round(52 * CHAR_SCALE) - 5;
    ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText(t, x, tagY);
    ctx.fillStyle = col; ctx.fillText(t, x, tagY);
  }

  /* ---------- modal helper ---------- */
  function isModalOpen() {
    return !$('mTitle').hidden ||
      !$('mHelp').hidden ||
      !$('mQR').hidden ||
      !$('mNote').hidden ||
      !$('mPuz').hidden ||
      !$('mAch').hidden ||
      !$('mCert').hidden ||
      !$('mEnd').hidden;
  }

  /* ---------- katalog variasi pelaku & motif dinamis ---------- */
  var CULPRITS = ['jake', 'dimas', 'yuna'];
  var CULPRIT_DATA = {
    jake: {
      name: 'Jake',
      role: 'Direktur Keuangan Mawar Karya',
      ashClueTitle: 'Arang laporan audit di gudang',
      ashClueDesc: 'Sisa kertas terbakar di drum minyak gudang memuat tulisan “Audit MJC”. Laporan keuangan sengaja dihanguskan.',
      ashNarrative: 'Di dalam drum minyak tua, terdapat abu sisa pembakaran kertas laporan audit keuangan MJC.',
      shoeClueTitle: 'Jejak pantofel lumpur merah',
      shoeClueDesc: 'Jejak sepatu bersol halus dengan lumpur tanah merah dari halaman belakang menuju gudang.',
      shoeNarrative: 'Lihat ini... Jejak sepatu pantofel basah bertanah merah mengarah ke kotak perkakas.',
      suspectClueTitle: 'Pantofel Jake bernoda merah',
      suspectClueDesc: 'Jake memakai sandal rumah, sedangkan sepatu pantofelnya disembunyikan dengan sol tanah merah.',
      memoClueTitle: 'Memo audit Pak Basuki',
      memoClueDesc: 'Pak Basuki mencatat adanya pengeluaran fiktif vendor MJC yang disetujui Jake.',
      confessionLines: [
        ['Noah', 'Pelakunya adalah Anda, Jake!'],
        ['Jake', 'Apa buktimu?! Aku berada di aula dan kamarku sepanjang malam!', 'terkejut'],
        ['Noah', 'Jam musik dimajukan ke 21.45 agar kau tampak punya alibi. Padahal saat Harin ke gudang pukul 21.15, kau sudah di sana membakar buku audit!'],
        ['Noah', 'Dan tanah merah di sol pantofel hitammu... hanya ada di halaman belakang dekat gudang tempat bukti dibakar!'],
        ['Jake', 'Cukup... Cukup! Basuki tahu soal dana fiktif vendor MJC dan hendak melaporkanku pagi ini... Aku tak punya pilihan!', 'terpejam']
      ],
      defenseLinesJake: [
        ['Noah', 'Pelakunya adalah Anda, Jake!'],
        ['Jake', 'Bukan aku! Periksa kembali jejak sol sepatu di gudang!']
      ],
      defenseLinesDimas: [
        ['Noah', 'Dimas, apa kau pelakunya?'],
        ['Dimas', 'Pak Detektif, kabel interkom membuktikan saya di pos saat 21.00 dan 21.14! Dan sol sepatu saya bot bergerigi, bukan sol pantofel halus!'],
        ['Noah', 'Tunggu... Dimas benar. Sol sepatu di gudang adalah pantofel halus milik Jake, dan orang yang punya motif audit keuangan adalah Jake!']
      ],
      defenseLinesYuna: [
        ['Noah', 'Yuna, apa kau membunuh pamanmu karena sengketa villa?'],
        ['Yuna', 'Saya memang marah soal villa, tapi saya tidak tahu menahu soal pembakaran kertas audit keuangan di gudang! Sepatu saya kets putih!', 'terkejut'],
        ['Noah', 'Benar... pembunuh sebenarnya berkepentingan menghilangkan audit keuangan MJC dan memakai pantofel hitam berlumur tanah merah: Jake!']
      ],
      winDesc: [
        'Dengan pemecahan Sandi Mawar (Fungsi Invers dan Komposisi), Noah membongkar rekayasa waktu jam dinding dan alibi palsu Jake.',
        'Jake ditangkap saat polisi tiba di pagi hari. Penggelapan dana fiktif MJC terungkap, dan Villa Mawar diselamatkan.',
        'Harin tersenyum lega. Pelajaran matematika dari Pak Basuki kini menjadi penyelamat kebenaran.'
      ],
      failDesc: 'Pelaku sebenarnya (Jake) memanfaatkan situasi untuk melarikan diri saat jalan dibuka.'
    },
    dimas: {
      name: 'Dimas',
      role: 'Penjaga Pos Jaga Villa',
      ashClueTitle: 'Arang surat pemecatan & utang',
      ashClueDesc: 'Sisa kertas terbakar di drum minyak memuat tulisan “Peringatan Kas & Tagihan Utang”. Bukti motif Dimas.',
      ashNarrative: 'Di dalam drum minyak tua, terdapat abu sisa kertas pemecatan Dimas dan surat tagihan utang rentenir.',
      shoeClueTitle: 'Jejak bot karet bergerigi lumpur',
      shoeClueDesc: 'Jejak sol sepatu bot karet bergerigi tebal berlumur tanah merah dari pos menuju gudang.',
      shoeNarrative: 'Lihat ini... Jejak sol sepatu bot karet bergerigi tebal berlumur lumpur merah mengarah ke kotak perkakas.',
      suspectClueTitle: 'Bot karet Dimas bernoda merah',
      suspectClueDesc: 'Sepatu bot bergerigi Dimas basah dan bernoda tanah merah, disembunyikan di balik karung genset.',
      memoClueTitle: 'Buku mutasi kas pos jaga',
      memoClueDesc: 'Pak Basuki mencatat pembongkaran brankas kas pos jaga dan ancaman pemecatan untuk Dimas.',
      confessionLines: [
        ['Noah', 'Pelakunya adalah Anda, Dimas!'],
        ['Dimas', 'Fitnah! Saya menelepon lewat interkom kabel dari pos jaga jam 21.00 dan 21.14!', 'terkejut'],
        ['Noah', 'Panggilan interkom itu hanya rekaman yang kau setel di kabel loop! Jam dinding kau majukan ke 21.45 untuk merekayasa alibi!'],
        ['Noah', 'Dan tapak bergerigi di gudang persis sol bot karetmu yang berlumur tanah merah di balik karung genset!'],
        ['Dimas', 'Pak Basuki mau memenjarakanku karena kas pos... dan menolak pinjaman utang rentenirku... Aku gelap mata!', 'terpejam']
      ],
      defenseLinesJake: [
        ['Noah', 'Jake, apa kau pelakunya?'],
        ['Jake', 'Detektif, pantofelku bersol halus dan bersih! Jejak di gudang adalah tapak bot karet bergerigi milik Dimas!'],
        ['Noah', 'Tunggu... Jake benar. Jejak sol sepatu di gudang adalah bot karet bergerigi milik penjaga pos: Dimas!']
      ],
      defenseLinesDimas: [
        ['Noah', 'Dimas, apa kau pelakunya?'],
        ['Dimas', 'Bukan saya!']
      ],
      defenseLinesYuna: [
        ['Noah', 'Yuna, apa kau membunuh pamanmu?'],
        ['Yuna', 'Detektif, sepatu saya kets putih wanita ukuran 37! Jejak tapak bot bergerigi di gudang itu ukuran 43 milik Dimas!'],
        ['Noah', 'Benar... jejak kaki di gudang berukuran besar dan bertapak bot bergerigi milik Dimas si penjaga pos!']
      ],
      winDesc: [
        'Dengan pemecahan Sandi Mawar (Fungsi Invers dan Komposisi), Noah membongkar alibi rekaman interkom dan rekayasa waktu Dimas.',
        'Dimas mengakui perbuatannya dan menyerahkan kunci brankas. Pembunuhan berhasil diungkap secara tuntas.',
        'Harin tersenyum lega. Pelajaran matematika dari Pak Basuki kini menjadi penyelamat kebenaran.'
      ],
      failDesc: 'Pelaku sebenarnya (Dimas) memanfaatkan kekeliruan tuduhan untuk kabur menyelinap lewat pagar belakang.'
    },
    yuna: {
      name: 'Yuna',
      role: 'Keponakan Korban',
      ashClueTitle: 'Arang draf revisi surat wasiat',
      ashClueDesc: 'Sisa kertas terbakar di drum minyak gudang memuat tulisan “Akta Hibah Yayasan”. Yuna dicoret dari ahli waris villa.',
      ashNarrative: 'Di dalam drum minyak tua, terdapat sisa lembaran draf akta hibah Villa Mawar ke yayasan yang sengaja dibakar.',
      shoeClueTitle: 'Jejak sepatu kets lumpur merah',
      shoeClueDesc: 'Jejak sol sepatu kets ramping wanita berukuran kecil dengan tanah merah dari halaman belakang menuju gudang.',
      shoeNarrative: 'Lihat ini... Jejak sol sepatu kets ramping wanita bertanah merah mengarah ke kotak perkakas.',
      suspectClueTitle: 'Sepatu kets Yuna bernoda merah',
      suspectClueDesc: 'Sepatu kets putih Yuna tersembunyi di bawah tempat tidur lorong kamar dengan noda tanah merah di tumitnya.',
      memoClueTitle: 'Draf surat wasiat Pak Basuki',
      memoClueDesc: 'Pak Basuki berencana mewakafkan seluruh aset Villa Mawar ke yayasan panti asuhan, mencoret nama Yuna.',
      confessionLines: [
        ['Noah', 'Pelakunya adalah Anda, Yuna!'],
        ['Yuna', 'Mustahil! Aku sudah tertidur di kamarku sejak jam 21.00 malam!', 'terkejut'],
        ['Noah', 'Kau merusak jam dinding ke 21.45 agar waktu kematian tampak saat kau punya alibi tidur! Padahal pamanmu kau bunuh sebelum jam sembilan!'],
        ['Noah', 'Lalu kau ke gudang membakar draf revisi wasiat! Dan sol kets putihmu bernoda tanah merah yang tak bisa kau sangkal!'],
        ['Yuna', 'Paman tidak berhak memberikan villa peninggalan ibuku kepada orang lain! Villa ini milik darah keluargaku!', 'terpejam']
      ],
      defenseLinesJake: [
        ['Noah', 'Jake, apa kau membunuh Basuki demi audit keuangan?'],
        ['Jake', 'Detektif, periksa abu kertas itu! Yang dibakar bukan auditku, tapi surat wasiat! Dan jejaknya kets ramping wanita, bukan pantofelku!'],
        ['Noah', 'Tunggu... Jake benar. Kertas yang terbakar adalah draf wasiat notaris dan jejaknya adalah kets wanita milik Yuna!']
      ],
      defenseLinesDimas: [
        ['Noah', 'Dimas, apa kau pelakunya?'],
        ['Dimas', 'Pak Detektif, ukuran jejak kets di gudang jauh lebih kecil dari bot saya! Dan yang dibakar adalah surat warisan villa!'],
        ['Noah', 'Benar... Dimas tidak ada sangkut paut dengan surat wasiat. Pelaku sebenarnya yang memakai kets wanita adalah Yuna!']
      ],
      defenseLinesYuna: [
        ['Noah', 'Yuna, apa kau pelakunya?'],
        ['Yuna', 'Bukan saya!']
      ],
      winDesc: [
        'Dengan pemecahan Sandi Mawar (Fungsi Invers dan Komposisi), Noah membongkar rekayasa waktu kematian dan motif sengketa warisan Yuna.',
        'Yuna ditahan polisi saat pagi tiba. Villa Mawar diserahkan ke yayasan sesuai wasiat mendiang Pak Basuki.',
        'Harin tersenyum lega. Pelajaran matematika dari Pak Basuki kini menjadi penyelamat kebenaran.'
      ],
      failDesc: 'Pelaku sebenarnya (Yuna) memanfaatkan tuduhan keliru detektif untuk menghapus jejak dan melarikan diri.'
    }
  };

  /* ---------- bukti & catatan ---------- */
  var EVD = {
    B1: ['Interkom dari pos jaga', 'Pukul 21.00 dan 21.14 Dimas menelepon lewat interkom kabel dari pos jaga.'],
    B2: ['Jam dinding Ruang Musik', 'Jam retak dan jarum berhenti di angka 21.45. Waktu ini dicurigai sebagai rekayasa pelaku.'],
    B3: ['Pecahan kaca di atas darah', 'Kaca jam berdiri pecah di atas genangan darah yang sudah mengental. Pembunuhan terjadi sebelum kaca dipecahkan.'],
    B5: ['Arang laporan audit di gudang', 'Sisa kertas terbakar di drum minyak gudang memuat tulisan “Audit MJC”. Laporan keuangan sengaja dihanguskan.'],
    B6: ['Memo audit Pak Basuki', 'Pak Basuki mencatat adanya pengeluaran fiktif vendor MJC yang disetujui Jake.'],
    B7: ['Jejak pantofel lumpur merah', 'Jejak sepatu bersol halus dengan lumpur tanah merah dari halaman belakang menuju gudang.'],
    B8: ['Pantofel Jake bernoda merah', 'Jake memakai sandal rumah, sedangkan sepatu pantofelnya disembunyikan dengan sol tanah merah.'],
    B10: ['Kartu Bunga Dua Kelopak', 'Kartu sandi fungsi komposisi tersembunyi di gudang: (g∘f)(x) = 10x − 5.']
  };

  function applyCulpritClues() {
    if (!EVD) return;
    var cKey = S && S.culprit ? S.culprit : 'jake';
    var cData = CULPRIT_DATA[cKey] || CULPRIT_DATA.jake;
    EVD.B5 = [cData.ashClueTitle, cData.ashClueDesc];
    EVD.B6 = [cData.memoClueTitle, cData.memoClueDesc];
    EVD.B7 = [cData.shoeClueTitle, cData.shoeClueDesc];
    EVD.B8 = [cData.suspectClueTitle, cData.suspectClueDesc];
  }

  /* ---------- state ---------- */
  var S;
  function newState() {
    var randomCulprit = CULPRITS[Math.floor(Math.random() * CULPRITS.length)];
    S = {
      room: 'aula', x: 110, face: 1, f: {}, ev: {}, time: '--.--',
      fade: 0, flash: 0, flashT: 5, t: 0, started: false,
      spk: null, noteT: 0, harin: null, sari: null, callOn: false,
      memory: false, dawn: false, ending: null, culprit: randomCulprit
    };
    initRandomPuzzles();
    applyCulpritClues();
    try {
      console.log('[Villa Mawar] Pelaku sesi ini:', S.culprit);
    } catch (e) {}
  }
  newState();
  var EVIMG = {
    B1: 'interkom_menyala', B2: 'jam_musik_retak_2145', B3: 'kaca_pecah_di_atas_darah',
    B5: 'arang_kertas_mjc', B6: 'map_audit_mjc', B7: 'jejak_pantofel_lumpur',
    B8: 'pantofel_jake_lumpur_merah', B10: 'kartu_sandi_2_dua_kelopak_x3'
  };
  function evSrc(id) { return ASSETS['p_' + (EVIMG[id] || 'kartu_sandi_1_x3')]; }
  function addEv(id) {
    if (S.ev[id]) return;
    S.ev[id] = true;
    S.noteT = 1.6;
    if (EVD[id]) toast('Petunjuk baru: ' + EVD[id][0], evSrc(id));
    updNote();
    if (typeof GameAudio !== 'undefined') GameAudio.clueFound();
    if (Object.keys(S.ev).length >= 8) {
      unlockAchievement('ach_all_clues');
    }
  }
  function updNote() { $('nEv').textContent = Object.keys(S.ev).length; }

  var tt;
  function toast(t, src) {
    var e = $('toast'); e.innerHTML = '';
    if (src) { var i = document.createElement('img'); i.src = src; i.alt = ''; e.appendChild(i); }
    var s = document.createElement('span'); s.textContent = t; e.appendChild(s);
    e.classList.add('on');
    clearTimeout(tt);
    tt = setTimeout(function () { e.classList.remove('on'); }, 2800);
  }

  /* ---------- sistem prestasi & lencana detektif (persistent) ---------- */
  var ACH_STORAGE_KEY = 'villa_achievements';
  var ACHIEVEMENTS = {
    ach_start: {
      id: 'ach_start',
      icon: '🕵️‍♂️',
      title: 'Langkah Pertama',
      desc: 'Memulai investigasi malam badai di Villa Mawar.',
      cat: 'Awal Kasus'
    },
    ach_sandi1: {
      id: 'ach_sandi1',
      icon: '🧮',
      title: 'Ahli Invers Linear',
      desc: 'Memecahkan Sandi 1: Fungsi Invers f⁻¹(y) = (y + 1) / 5.',
      cat: 'Kriptografi'
    },
    ach_calc: {
      id: 'ach_calc',
      icon: '🕰️',
      title: 'Pembongkar Brankas',
      desc: 'Membuka kalkulator invers rahasia jam dinding.',
      cat: 'Eksplorasi'
    },
    ach_all_clues: {
      id: 'ach_all_clues',
      icon: '🔍',
      title: 'Mata Elang',
      desc: 'Mengumpulkan seluruh bukti fisik dan catatan kasus.',
      cat: 'Deduksi'
    },
    ach_sandi2: {
      id: 'ach_sandi2',
      icon: '🔐',
      title: 'Pakar Komposisi',
      desc: 'Memecahkan Sandi 2: Invers Komposisi (g∘f)⁻¹(y) = (y + 5) / 10.',
      cat: 'Kriptografi'
    },
    ach_win: {
      id: 'ach_win',
      icon: '🏆',
      title: 'Detektif Mawar Sejati',
      desc: 'Menuntaskan kasus Villa Mawar dengan tuduhan yang tepat.',
      cat: 'Kemenangan'
    },
    ach_pure: {
      id: 'ach_pure',
      icon: '⭐',
      title: 'Deduksi Murni',
      desc: 'Menjatuhkan tuduhan yang benar tanpa pernah salah menuduh.',
      cat: 'Keahlian'
    },
    ach_win_jake: {
      id: 'ach_win_jake',
      icon: '🎭',
      title: 'Skandal Terbongkar',
      desc: 'Membongkar konspirasi penggelapan dana dan menangkap Jake.',
      cat: 'Penangkapan'
    },
    ach_win_dimas: {
      id: 'ach_win_dimas',
      icon: '⚡',
      title: 'Jeratan Kabel Interkom',
      desc: 'Membongkar alibi interkom dan menangkap Dimas si penjaga.',
      cat: 'Penangkapan'
    },
    ach_win_yuna: {
      id: 'ach_win_yuna',
      icon: '📜',
      title: 'Gugurnya Sengketa Wasiat',
      desc: 'Menghentikan rencana pemalsuan wasiat dan menangkap Yuna.',
      cat: 'Penangkapan'
    },
    ach_bad_wrong: {
      id: 'ach_bad_wrong',
      icon: '🥀',
      title: 'Mawar yang Salah',
      desc: 'Salah menuduh orang tak bersalah hingga pembunuh sebenarnya melarikan diri.',
      cat: 'Akhir Kelam'
    },
    ach_bad_weak: {
      id: 'ach_bad_weak',
      icon: '🌧️',
      title: 'Bukti yang Tipis',
      desc: 'Tuduhan dimentahkan karena bukti alibi jam dan gudang belum dianalisis cermat.',
      cat: 'Akhir Kelam'
    }
  };

  function getUnlockedAchievements() {
    try {
      var raw = localStorage.getItem(ACH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function saveUnlockedAchievements(data) {
    try {
      localStorage.setItem(ACH_STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
  }

  var _achToastTimer = null;
  function showAchToast(def) {
    var el = $('achToast');
    if (!el) return;
    var isBad = def.id && def.id.indexOf('ach_bad_') === 0;
    if (isBad) el.classList.add('bad-toast');
    else el.classList.remove('bad-toast');
    el.innerHTML =
      '<div class="ach-toast-icon">' + (def.icon || '🏆') + '</div>' +
      '<div class="ach-toast-body">' +
      '  <span class="ach-toast-kicker">' + (isBad ? 'AKHIR KELAM TERBUKA!' : 'PRESTASI TERBUKA!') + '</span>' +
      '  <div class="ach-toast-title">' + def.title + '</div>' +
      '  <div class="ach-toast-desc">' + def.desc + '</div>' +
      '</div>';
    el.hidden = false;
    el.classList.add('on');
    clearTimeout(_achToastTimer);
    _achToastTimer = setTimeout(function () {
      el.classList.remove('on');
      setTimeout(function () {
        if (!el.classList.contains('on')) el.hidden = true;
      }, 400);
    }, 4500);
  }

  function unlockAchievement(id) {
    var def = ACHIEVEMENTS[id];
    if (!def) return;
    var unlocked = getUnlockedAchievements();
    if (unlocked[id]) return;

    unlocked[id] = {
      unlockedAt: new Date().toISOString()
    };
    saveUnlockedAchievements(unlocked);
    updAchBadge();
    showAchToast(def);
    if (typeof GameAudio !== 'undefined') {
      if (id.indexOf('ach_bad_') === 0) {
        GameAudio.dramaticShock();
      } else {
        GameAudio.puzzleSolved();
      }
    }
  }

  function updAchBadge() {
    var unlocked = getUnlockedAchievements();
    var count = Object.keys(unlocked).length;
    var total = Object.keys(ACHIEVEMENTS).length;
    var el = $('nAch');
    if (el) el.textContent = count + '/' + total;
  }

  /* ---------- dialog visual novel ---------- */
  var dlg = { active: false, Q: [], done: null, opts: false, typing: false, full: '', pos: 0, k: null, ex: 'netral' };
  var typeT = null;

  function pkey(n) {
    if (!n) return null;
    if (/^(Noah|Raka)/i.test(n)) return 'noah';
    if (/^(Harin|Sari)/i.test(n)) return 'harin';
    if (/^Dimas/i.test(n)) return 'dimas';
    if (/^(Yuna|Naya)/i.test(n)) return 'yuna';
    if (/^(Jake|Bima)/i.test(n)) return 'jake';
    if (/^(Pak\s+Basuki|Basuki|Pak\s+Surya|Surya|Pak\s+Arga|Arga)/i.test(n)) return 'basuki';
    return null;
  }
  function setPor(k, ex) {
    var p = $('por');
    if (!k || !IM['por_' + k + '_' + ex]) { p.hidden = true; return; }
    p.hidden = false;
    p.src = ASSETS['por_' + k + '_' + ex];
    p.alt = NAME[k] || '';
  }
  function setDlgIdle() {
    S.spk = null; clearInterval(typeT);
    $('who').textContent = '';
    $('txt').textContent = 'Klik "Lanjut Dialog" atau tekan Spasi/Enter untuk melanjutkan cerita.';
    $('txt').className = ''; $('who').className = ''; $('opts').innerHTML = '';
    $('hint').textContent = ''; $('dlg').classList.remove('live'); $('por').hidden = true;
  }
  function say(lines, done) {
    dlg.Q = lines.slice();
    dlg.done = done || null;
    dlg.active = true;
    nextLine();
  }
  function nextLine() {
    if (!dlg.Q.length) {
      dlg.active = false; dlg.opts = false; dlg.typing = false;
      setDlgIdle();
      var d = dlg.done; dlg.done = null;
      if (d) d();
      return;
    }
    var l = dlg.Q.shift();
    if (typeof l === 'function') { l(); nextLine(); return; }
    if (l.ask) { showOpts(l.ask); return; }
    showLine(l);
  }
  function showLine(l) {
    var name = l[0], text = l[1], ex = l[2] || 'netral', k = pkey(name), nar = !name;
    S.spk = k; dlg.opts = false; $('opts').innerHTML = ''; $('dlg').classList.add('live');
    $('who').textContent = name; $('who').className = nar ? 'nar' : ''; $('txt').className = nar ? 'nar' : '';
    dlg.full = text; dlg.pos = 0; dlg.k = k; dlg.ex = ex; dlg.typing = true;
    setPor(k, ex); $('hint').textContent = '';
    clearInterval(typeT);

    // Mainkan sound effect emosi dramatis jika karakter terkejut/berteriak
    if (ex === 'terkejut' && typeof GameAudio !== 'undefined') {
      GameAudio.dramaticShock();
    }

    if (REDUCED) { finishType(); return; }
    $('txt').textContent = '';
    var stepCount = 0;
    typeT = setInterval(function () {
      dlg.pos++;
      $('txt').textContent = dlg.full.slice(0, dlg.pos);

      var currChar = dlg.full.charAt(dlg.pos - 1);
      // Bunyikan suara vokal karakter tiap 2 huruf (melewati spasi agar ritme bicara hidup & alami)
      if (typeof GameAudio !== 'undefined' && /[a-zA-Z0-9]/.test(currChar)) {
        stepCount++;
        if (stepCount % 2 === 1) {
          GameAudio.typeBeep(k);
        }
      }

      if (k && ex === 'netral') setPor(k, (Math.floor(dlg.pos / 3) % 2) ? 'bicara' : 'netral');
      if (dlg.pos >= dlg.full.length) finishType();
    }, 28);
  }
  function finishType() {
    clearInterval(typeT);
    $('txt').textContent = dlg.full;
    dlg.typing = false;
    setPor(dlg.k, dlg.ex);
    $('hint').textContent = 'Tekan Lanjut ▸';
  }
  function showOpts(a) {
    dlg.opts = true; dlg.typing = false; clearInterval(typeT);
    var k = pkey(a.who); S.spk = k; setPor(k, 'netral');
    $('who').textContent = a.who || ''; $('who').className = a.who ? '' : 'nar';
    $('txt').textContent = a.q || ''; $('txt').className = a.who ? '' : 'nar';
    var box = $('opts'); box.innerHTML = ''; $('hint').textContent = ''; $('dlg').classList.remove('live');
    a.opts.forEach(function (o, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = (i + 1) + '. ' + o.t;
      b.addEventListener('click', function () { choose(o); });
      box.appendChild(b);
    });
    dlg._cur = a;
  }
  function choose(o) {
    dlg.opts = false; $('opts').innerHTML = '';
    if (typeof GameAudio !== 'undefined') GameAudio.clickUI();
    if (o.fx) o.fx();
    var add = (o.lines || []).slice();
    dlg.Q = add.concat(dlg.Q);
    nextLine();
  }
  function advance() {
    if (!dlg.active || dlg.opts) return;
    if (typeof GameAudio !== 'undefined') GameAudio.dlgAdvance();
    if (dlg.typing) { finishType(); return; }
    nextLine();
  }
  $('dlg').addEventListener('click', advance);
  cv.addEventListener('click', act);

  /* ---------- interaksi tombol & keyboard ---------- */
  function act() {
    if (isModalOpen() && !dlg.active) return;
    if (dlg.active) { advance(); return; }
  }
  $('bAct').addEventListener('click', act);

  window.addEventListener('keydown', function (e) {
    var tg = e.target;
    if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'SELECT' || tg.tagName === 'TEXTAREA')) return;
    var k = e.key;
    if (k === 'e' || k === 'E' || k === ' ' || k === 'Enter') {
      if (tg && tg.tagName === 'BUTTON' && (k === ' ' || k === 'Enter')) return;
      e.preventDefault();
      act();
    } else if (k >= '1' && k <= '9' && dlg.opts && dlg._cur) {
      var o = dlg._cur.opts[+k - 1]; if (o) choose(o);
    } else if (k === 'n' || k === 'N') {
      if ($('mNote').hidden) openNote(); else closeNote();
    } else if (k === 'Escape') {
      if (!$('mNote').hidden) closeNote();
      else if (!$('mHelp').hidden) { $('mHelp').hidden = true; }
      else if (!$('mPuz').hidden) { $('mPuz').hidden = true; }
      else if (!$('mQR').hidden) { $('mQR').hidden = true; }
      else if (!$('mAch').hidden) { $('mAch').hidden = true; }
      else if (!$('mCert').hidden) { $('mCert').hidden = true; }
    }
  });

  /* ---------- modul verifikasi & kriptografi (Level 1 SHA-256 + Level 4 Serverless API) ---------- */
  async function hashText(str) {
    var norm = (str || '').trim().toUpperCase().replace(/\s+/g, ' ');
    if (!window.crypto || !window.crypto.subtle) return '';
    var buf = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(norm));
    return Array.from(new Uint8Array(buf))
      .map(function (b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  }

  async function verifyViaServer(targetId, data) {
    try {
      var payload = Object.assign({ type: targetId }, data);
      var resp = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (resp.ok) {
        var resJson = await resp.json();
        return resJson;
      }
    } catch (e) {
      // Fallback offline / local preview
    }
    return null;
  }

  /* ---------- brankas kriptografi kalkulator (AES-256-GCM + PBKDF2) ---------- */
  var CALC_VAULT = {
    salt: 'lIfbtqHQxMW0f85DhNqLTg==',
    iv: 'cPqRHsOUc0xGOpvS',
    data: 'mC63G6JUydFejjAENGtHlqXxUmFNnp7MS0/Jk7EDqjaV8aFOKnnQvF36MICDd8/VrwQw5w==',
    iter: 250000
  };

  var _vaultUnlocked = false; // Private lexical state (terisolasi dari console & window)
  var _failCount = 0;
  var _lockoutUntil = 0;
  var _lockoutTimer = null;

  try {
    sessionStorage.removeItem('villa_dev_auth');
    localStorage.removeItem('villa_dev_auth');
  } catch (e) {}

  function ensureDevAuth(cb) {
    var entered = window.prompt('🔐 Fitur Khusus Pembuat / Guru\nMasukkan password akses pembuat:');
    if (!entered) return;
    var norm = entered.trim().toLowerCase();
    var valids = ['guru123', 'admin', 'mawar', 'rahasia', 'villamawar', '1234'];
    if (valids.indexOf(norm) !== -1) {
      if (typeof GameAudio !== 'undefined') GameAudio.clueFound();
      toast('✅ Password benar! Memproses instan...');
      cb();
    } else {
      if (typeof GameAudio !== 'undefined') GameAudio.puzzleWrong();
      window.alert('❌ Password salah! Akses fitur instan ditolak.');
    }
  }

  function b64ToBuf(b64) {
    var bin = atob(b64), len = bin.length, bytes = new Uint8Array(len);
    for (var i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  async function verifyCalcPassword(pwd) {
    if (!window.crypto || !window.crypto.subtle) return false;
    try {
      var norm = (pwd || '').trim().toLowerCase().replace(/\s+/g, ' ');
      var enc = new TextEncoder();
      var pwKey = await window.crypto.subtle.importKey(
        'raw',
        enc.encode(norm),
        { name: 'PBKDF2' },
        false,
        ['deriveKey']
      );
      var key = await window.crypto.subtle.deriveKey(
        {
          name: 'PBKDF2',
          salt: b64ToBuf(CALC_VAULT.salt),
          iterations: CALC_VAULT.iter,
          hash: 'SHA-256'
        },
        pwKey,
        { name: 'AES-GCM', length: 256 },
        false,
        ['decrypt']
      );
      var dec = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: b64ToBuf(CALC_VAULT.iv),
          tagLength: 128
        },
        key,
        b64ToBuf(CALC_VAULT.data)
      );
      var json = JSON.parse(new TextDecoder().decode(dec));
      return json && json.unlocked === true;
    } catch (e) {
      return false;
    }
  }

  function renderCalc(calc, P) {
    calc.innerHTML = '';
    if (!_vaultUnlocked) {
      calc.className = 'calc locked';
      calc.innerHTML =
        '<div class="calc-lock-header">' +
        '  <b>🔒 Kalkulator</b>' +
        '  <button type="button" id="calcDevInstantBtn" class="dev-instant-btn" style="background:transparent;border:1px dashed var(--teal);color:var(--teal);padding:2px 8px;font-size:11px;cursor:pointer;margin-left:8px;border-radius:3px;" title="Khusus Pembuat: Perlu Password Akses">🔒 Buka Instan</button>' +
        '</div>' +
        '<div class="row calc-lock-row">' +
        '  <input id="calcPwd" type="password" placeholder="Masukkan password..." autocomplete="off" aria-label="Password kalkulator">' +
        '  <button type="button" id="calcUnlockBtn">Buka Kunci</button>' +
        '</div>' +
        '<div class="calc-lock-msg" id="calcLockMsg"></div>';

      var pwdInp = calc.querySelector('#calcPwd');
      var btn = calc.querySelector('#calcUnlockBtn');
      var msg = calc.querySelector('#calcLockMsg');
      var instantBtn = calc.querySelector('#calcDevInstantBtn');
      if (instantBtn) {
        instantBtn.addEventListener('click', function (e) {
          e.stopPropagation();
          ensureDevAuth(function () {
            _vaultUnlocked = true;
          _failCount = 0;
          _lockoutUntil = 0;
          unlockAchievement('ach_calc');
            clearInterval(_lockoutTimer);
            if (typeof GameAudio !== 'undefined') GameAudio.clueFound();
            toast('⚡ Password kalkulator terbuka!');
            renderCalc(calc, P);
          });
        });
      }
      if (pwdInp) {
        pwdInp.addEventListener('dblclick', function () {
          ensureDevAuth(function () {
            pwdInp.value = 'jam dinding';
            doUnlock();
          });
        });
      }

      var checkLockout = function () {
        var now = Date.now();
        if (now < _lockoutUntil) {
          var remaining = Math.ceil((_lockoutUntil - now) / 1000);
          btn.disabled = true;
          pwdInp.disabled = true;
          msg.className = 'calc-lock-msg error';
          msg.textContent = '❌ Terlalu banyak percobaan salah! Tunggu ' + remaining + ' detik.';
          clearInterval(_lockoutTimer);
          _lockoutTimer = setInterval(function () {
            var rem = Math.ceil((_lockoutUntil - Date.now()) / 1000);
            if (rem <= 0) {
              clearInterval(_lockoutTimer);
              _lockoutTimer = null;
              btn.disabled = false;
              pwdInp.disabled = false;
              msg.textContent = '';
              pwdInp.focus();
            } else {
              msg.textContent = '❌ Terlalu banyak percobaan salah! Tunggu ' + rem + ' detik.';
            }
          }, 1000);
          return true;
        }
        return false;
      };

      checkLockout();

      var doUnlock = async function () {
        if (checkLockout()) return;
        var pwd = pwdInp.value.trim();
        if (!pwd) {
          msg.className = 'calc-lock-msg error';
          msg.textContent = 'Silakan masukkan password.';
          return;
        }
        btn.disabled = true;
        btn.textContent = 'Memverifikasi...';
        msg.className = 'calc-lock-msg';
        msg.textContent = 'Memverifikasi...';

        var ok = false;
        var srv = await verifyViaServer('calc', { password: pwd });
        if (srv !== null) {
          ok = srv.success === true;
        } else {
          ok = await verifyCalcPassword(pwd);
        }
        if (ok) {
          _vaultUnlocked = true;
          _failCount = 0;
          _lockoutUntil = 0;
          unlockAchievement('ach_calc');
          clearInterval(_lockoutTimer);
          if (typeof GameAudio !== 'undefined') GameAudio.clueFound();
          toast('Kalkulator terbuka!');
          renderCalc(calc, P);
        } else {
          _failCount++;
          btn.disabled = false;
          btn.textContent = 'Buka Kunci';
          pwdInp.value = '';

          if (_failCount >= 5) {
            _lockoutUntil = Date.now() + 60000;
            checkLockout();
          } else if (_failCount >= 3) {
            _lockoutUntil = Date.now() + 30000;
            checkLockout();
          } else {
            msg.className = 'calc-lock-msg error';
            msg.textContent = '❌ Password salah.';
            if (typeof GameAudio !== 'undefined') GameAudio.puzzleWrong();
            pwdInp.focus();
          }
        }
      };

      btn.addEventListener('click', doUnlock);
      pwdInp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          doUnlock();
        }
      });
    } else {
      calc.className = 'calc unlocked';
      calc.innerHTML =
        '<div class="calc-lock-header">' +
        '  <div style="display:flex;justify-content:space-between;align-items:center;">' +
        '    <b>🔓 Kalkulator</b>' +
        '    <button type="button" id="calcRelockBtn" style="min-height:26px;padding:2px 8px;font-size:11px;">Kunci</button>' +
        '  </div>' +
        '</div>' +
        '<div class="row">' +
        '  <select id="cSel" aria-label="Fungsi"></select>' +
        '  <input id="cY" type="text" inputmode="numeric" placeholder="Masukkan angka y" aria-label="angka y">' +
        '  <button type="button" id="cGo">Hitung Invers</button>' +
        '</div>' +
        '<div class="res" id="cRes"></div>';

      var relock = calc.querySelector('#calcRelockBtn');
      if (relock) {
        relock.addEventListener('click', function () {
          _vaultUnlocked = false;
          if (typeof GameAudio !== 'undefined') GameAudio.clickUI();
          renderCalc(calc, P);
        });
      }

      P.calcs.forEach(function (k, i) {
        var o = document.createElement('option'); o.value = i; o.textContent = k.n; calc.querySelector('#cSel').appendChild(o);
      });
      calc.querySelector('#cGo').addEventListener('click', function () {
        var y = parseNum(calc.querySelector('#cY').value), r = calc.querySelector('#cRes');
        if (y === null) { r.textContent = 'Masukkan bilangan bulat angka kartu.'; return; }
        var v = P.calcs[calc.querySelector('#cSel').value].fn(y), vv = Math.round(v * 1e4) / 1e4;
        if (Number.isInteger(vv) && Math.abs(vv) <= 26) {
          r.textContent = 'x = ' + vv + (vv === 0 ? '  → Spasi' : '  → Huruf “' + chr(vv) + '”');
        } else if (Number.isInteger(vv)) {
          r.textContent = 'x = ' + vv + '. Di luar rentang abjad −26...26.';
        } else {
          r.textContent = 'x = ' + vv + '. Hasil pecahan: coba gunakan rumus invers komposisi (g∘f)⁻¹.';
        }
      });
    }
  }

  /* ---------- layar teka-teki sandi ---------- */
  var curP = null;
  function openPuz(id) {
    var P = PUZ[id];
    curP = { id: id, P: P, hint: 0, cipher: P.cipher, solved: false };
    var c = $('puzCard'); c.innerHTML = '';

    var h = document.createElement('h2');
    h.textContent = P.title;
    h.style.cursor = 'pointer';
    h.title = 'Klik 2x untuk Jawab Instan (Khusus Pembuat)';
    h.addEventListener('dblclick', devInstantSolve);
    c.appendChild(h);
    var im = document.createElement('img'); im.className = 'cardimg'; im.src = ASSETS[P.img]; im.alt = 'Kartu sandi matematika'; c.appendChild(im);

    var p = document.createElement('div'); p.className = 'formula-box';
    p.innerHTML =
      '<div class="formula-line">' +
      '  <span class="formula-item">Fungsi Enkripsi (Kunci): <b class="f-code">' + P.rule + '</b></span>' +
      '  <span class="formula-item">Fungsi Dekripsi (Invers): <b class="f-code highlight">' + P.invRule + '</b></span>' +
      '</div>' +
      '<div class="formula-sub">Gunakan fungsi invers untuk mendeskripsikan <b>cipherteks (y)</b> menjadi <b>plainteks (x)</b>, lalu susun pesannya!</div>';
    c.appendChild(p);

    var cip = document.createElement('div'); cip.className = 'cipher'; cip.id = 'cipher'; c.appendChild(cip);
    var wordEl = null;
    P.cipher.forEach(function (y, i) {
      var isSpace = P.spaces && P.spaces.indexOf(i) !== -1;
      if (!wordEl || isSpace) {
        wordEl = document.createElement('div');
        wordEl.className = 'word';
        cip.appendChild(wordEl);
      }
      var chip = document.createElement('div');
      chip.className = 'chip' + (isSpace ? ' sp' : '');
      chip.dataset.i = i;
      var ph = isSpace ? '␣' : '';
      chip.innerHTML = '<span class="y">' + y + '</span><input type="text" autocomplete="off" placeholder="' + ph + '" aria-label="' + (isSpace ? 'spasi (tekan spasi atau 0)' : 'nilai x untuk angka ' + y) + '"><span class="ch"></span><span class="vf"></span>';
      wordEl.appendChild(chip);
      if (isSpace) wordEl = null;

      var inp = chip.querySelector('input');
      inp.addEventListener('input', function () { chk(chip, i); });
      inp.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          inp.value = '␣';
          chk(chip, i);
          var nextChip = cip.querySelector('.chip[data-i="' + (i + 1) + '"] input');
          if (nextChip) nextChip.focus();
        } else if (e.key === 'Enter') {
          var nextInp = cip.querySelector('.chip[data-i="' + (i + 1) + '"] input');
          if (nextInp) {
            nextInp.focus();
          } else {
            verifyAllPuz();
          }
        }
      });
    });

    var act = document.createElement('div');
    act.className = 'puz-actions';
    act.innerHTML =
      '<button type="button" class="primary" id="btnCheckPuz">🔍 Periksa Pesan Sandi</button>' +
      '<button type="button" id="btnDevSolve" class="dev-instant-btn" style="background:transparent;border:1px dashed rgba(220,174,85,0.45);color:var(--amber);font-size:12px;padding:5px 12px;border-radius:4px;cursor:pointer;margin-top:2px;" title="Khusus Pembuat: Perlu Password Akses">🔒 Jawab Instan (Khusus Pembuat)</button>' +
      '<div class="puz-status" id="puzStatus"></div>';
    c.appendChild(act);
    act.querySelector('#btnCheckPuz').addEventListener('click', verifyAllPuz);
    act.querySelector('#btnDevSolve').addEventListener('click', devInstantSolve);

    var res = document.createElement('div'); res.id = 'puzRes'; c.appendChild(res);

    // Kalkulator Invers Otomatis (Dilindungi Enkripsi AES-256-GCM + PBKDF2)
    var calc = document.createElement('div'); calc.className = 'calc';
    c.appendChild(calc);
    renderCalc(calc, P);

    // Tabel Kuantifikasi Huruf (Sesuai Materi Kriptografi)
    var d = document.createElement('details'); d.innerHTML = '<summary>Buka Tabel Kuantifikasi Huruf (Acuan Konversi)</summary>';
    var tw = document.createElement('div'); tw.className = 'mapwrap';
    var tb = '<div style="font-weight:600;margin-bottom:4px;color:var(--amber)">Kuantifikasi Huruf Kapital (Positif):</div><table class="map"><tr>';
    for (var a = 1; a <= 26; a++) tb += '<td>' + String.fromCharCode(64 + a) + '<br>' + a + '</td>';
    tb += '</tr></table><div style="font-weight:600;margin:8px 0 4px;color:var(--teal)">Kuantifikasi Huruf Kecil (Negatif):</div><table class="map"><tr>';
    for (a = 1; a <= 26; a++) tb += '<td>' + String.fromCharCode(96 + a) + '<br>−' + a + '</td>';
    tb += '</tr></table><p class="muted" style="margin-top:6px">Kuantifikasi: Huruf Kapital = Positif (+1 s/d +26) · Huruf Kecil = Negatif (−1 s/d −26) · Spasi = 0</p>';
    tw.innerHTML = tb; d.appendChild(tw); c.appendChild(d);

    var hint = document.createElement('div'); hint.id = 'hintBox'; hint.className = 'muted';
    var row = document.createElement('div'); row.className = 'row';
    var hb = document.createElement('button'); hb.type = 'button'; hb.id = 'hintBtn'; hb.textContent = 'Petunjuk (0/3)';
    hb.addEventListener('click', function () {
      if (curP.hint >= 3) return;
      curP.hint++;
      hb.textContent = 'Petunjuk (' + curP.hint + '/3)';
      hint.innerHTML += '<p>' + curP.hint + '. ' + P.hints[curP.hint - 1] + '</p>';
    });
    var cl = document.createElement('button'); cl.type = 'button'; cl.textContent = 'Tutup Sementara';
    cl.addEventListener('click', function () { $('mPuz').hidden = true; });
    row.appendChild(hb); row.appendChild(cl); c.appendChild(row); c.appendChild(hint);

    $('mPuz').hidden = false;
  }

  function parseNum(raw) {
    if (raw == null) return null;
    var rawStr = String(raw).replace(/[−–—]/g, '-');
    if (rawStr === ' ' || rawStr === '_' || rawStr === '␣') {
      return 0; // Spasi bernilai 0
    }
    var s = rawStr.trim();
    if (s === '') return null;
    if (s === '0' || /^spasi$/i.test(s) || s === 'space') return 0;
    if (!/^-?\d+$/.test(s)) {
      if (s.length === 1 && ((s >= 'A' && s <= 'Z') || (s >= 'a' && s <= 'z'))) {
        return val(s);
      }
      return null;
    }
    return parseInt(s, 10);
  }

  function chk(chip, i) {
    var inp = chip.querySelector('input'), x = parseNum(inp.value), ch = chip.querySelector('.ch');
    chip.classList.remove('ok', 'bad');
    ch.textContent = '';
    if (x !== null && Math.abs(x) <= 26) {
      ch.textContent = x === 0 ? '␣' : chr(x);
    }
    var statusEl = $('puzStatus');
    if (statusEl && statusEl.classList.contains('error')) {
      statusEl.textContent = '';
      statusEl.className = 'puz-status';
    }
  }

  async function verifyAllPuz() {
    if (curP.solved) return;
    var chips = document.querySelectorAll('#cipher .chip');
    var statusEl = $('puzStatus');
    var emptyCount = 0;
    var allMathCorrect = true;

    var decodedArr = [];
    Array.prototype.forEach.call(chips, function (c, idx) {
      var inp = c.querySelector('input');
      var valX = parseNum(inp ? inp.value : '');
      if (valX === null) {
        emptyCount++;
      } else {
        if (curP.P.fn(valX) !== curP.cipher[idx]) {
          allMathCorrect = false;
        }
        decodedArr.push(valX === 0 ? ' ' : chr(valX));
      }
    });

    if (emptyCount > 0) {
      if (statusEl) {
        statusEl.className = 'puz-status warn';
        statusEl.textContent = '⚠️ Masih ada ' + emptyCount + ' kotak yang belum diisi. Lengkapi seluruh huruf!';
      }
      if (typeof GameAudio !== 'undefined') GameAudio.clickUI();
      return;
    }

    var decoded = decodedArr.join('');
    var btnCheck = $('btnCheckPuz');
    if (btnCheck) {
      btnCheck.disabled = true;
      btnCheck.textContent = 'Memverifikasi...';
    }

    var h = await hashText(decoded);
    var serverCheck = await verifyViaServer(curP.id, { answer: decoded });
    var isVerified = false;

    if (serverCheck !== null) {
      isVerified = serverCheck.success === true;
    } else {
      isVerified = (h === curP.P.targetHash) && allMathCorrect;
    }

    if (isVerified) {
      curP.solved = true;
      if (typeof GameAudio !== 'undefined') GameAudio.puzzleSolved();
      Array.prototype.forEach.call(chips, function (c) {
        c.classList.remove('bad');
        c.classList.add('ok');
      });
      if (statusEl) {
        statusEl.className = 'puz-status ok';
        statusEl.textContent = '✅ Pesan berhasil didekripsi dengan benar!';
      }
      if (btnCheck) btnCheck.style.display = 'none';
      var btnDev = $('btnDevSolve');
      if (btnDev) btnDev.style.display = 'none';

      var r = $('puzRes'); r.className = 'solved';
      var displayText = (serverCheck && serverCheck.text) ? serverCheck.text : decoded;
      r.innerHTML = '<div class="muted">Pesan Rahasia Berhasil Dipecahkan!</div><div class="msg">“' + displayText + '”</div>';
      var b = document.createElement('button'); b.type = 'button'; b.className = 'primary'; b.textContent = 'Lanjutkan Penyelidikan ▸'; b.style.marginTop = '10px';
      b.addEventListener('click', function () {
        $('mPuz').hidden = true;
        var id = curP.id;
        if (id === 'p1') afterP1(displayText);
        else afterP2(displayText);
      });
      r.appendChild(b);
    } else {
      if (btnCheck) {
        btnCheck.disabled = false;
        btnCheck.textContent = '🔍 Periksa Pesan Sandi';
      }
      if (typeof GameAudio !== 'undefined') GameAudio.puzzleWrong();
      if (statusEl) {
        statusEl.className = 'puz-status error';
        statusEl.textContent = '❌ Pesan belum tepat! Periksa kembali hasil perhitungan rumus invers Anda.';
      }
      var cip = $('cipher');
      if (cip) {
        cip.classList.remove('shake');
        void cip.offsetWidth;
        cip.classList.add('shake');
      }
    }
  }

  function devInstantSolve() {
    ensureDevAuth(function () {
      if (!curP || !curP.P) return;
      var seq = curP.P.seq;
      if (!seq) return;
      var chips = document.querySelectorAll('#cipher .chip');
      Array.prototype.forEach.call(chips, function (chip, idx) {
        var inp = chip.querySelector('input');
        var correctX = seq[idx];
        if (inp) {
          inp.value = correctX === 0 ? '␣' : chr(correctX);
          chk(chip, idx);
        }
      });

      _vaultUnlocked = true;
          _failCount = 0;
          _lockoutUntil = 0;
          unlockAchievement('ach_calc');
      clearInterval(_lockoutTimer);
      var calc = document.querySelector('.calc');
      if (calc && curP && curP.P) renderCalc(calc, curP.P);

      toast('⚡ Jawaban terisi otomatis & password kalkulator terbuka!');
      verifyAllPuz();
    });
  }

  // Pintasan instan pembuat (F2, Backtick `, atau Alt+J)
  window.addEventListener('keydown', function (e) {
    if (e.key === 'F2' || e.key === '`' || (e.altKey && (e.key === 'j' || e.key === 'J'))) {
      if ($('mPuz') && !$('mPuz').hidden) {
        e.preventDefault();
        devInstantSolve();
      } else {
        ensureDevAuth(function () {
          _vaultUnlocked = true;
          _failCount = 0;
          _lockoutUntil = 0;
          unlockAchievement('ach_calc');
          clearInterval(_lockoutTimer);
          var calc = document.querySelector('.calc');
          if (calc && curP && curP.P) renderCalc(calc, curP.P);
          toast('⚡ Password kalkulator terbuka!');
        });
      }
    }
  });

  window.devSolve = devInstantSolve;
  window.unlockCalc = function () {
    ensureDevAuth(function () {
      _vaultUnlocked = true;
          _failCount = 0;
          _lockoutUntil = 0;
          unlockAchievement('ach_calc');
      clearInterval(_lockoutTimer);
      var calc = document.querySelector('.calc');
      if (calc && curP && curP.P) renderCalc(calc, curP.P);
      toast('⚡ Kalkulator terbuka!');
    });
  };
  window.setCulprit = function (name) {
    if (CULPRIT_DATA[name]) {
      S.culprit = name;
      applyCulpritClues();
      toast('Pelaku diubah ke: ' + CULPRIT_DATA[name].name);
      return 'Pelaku aktif: ' + name;
    }
    return 'Pilihan: jake | dimas | yuna';
  };
  window.getCulprit = function () {
    return S ? S.culprit : null;
  };

  /* ---------- alur cerita bertingkat (visual novel MTK) ---------- */
  function setTime(t) { S.time = t; updHud(); }

  // Bab 1: Jam Sembilan Malam & Sandi Pertama
  function intro() {
    unlockAchievement('ach_start');
    showChapter(1, function () {
      S.started = true; S.room = 'dapur'; S.memory = true; setTime('19.00');
      say([
        ['', 'Villa Mawar, pukul 19.00. Badai menutup satu-satunya jalan menuju kota.'],
        ['Pak Basuki', 'Terima kasih sudah datang. Besok pagi ada keputusan penting soal laporan audit keuangan Mawar Karya.'],
        ['Yuna', 'Paman tidak boleh menjual villa ini! Itu rumah peninggalan Ibu!', 'terkejut'],
        ['Jake', 'Basuki, bicarakan nanti saja. Jangan di depan tamu.', 'bicara'],
        ['', 'Jake, direktur keuangan Mawar Karya, tampak gelisah sambil mengaduk kopinya.'],
        ['', 'Pukul 20.00, longsor kedua memutus kabel telepon. Detektif Noah terus mengamati situasi.'],
        function () {
          S.memory = false; S.room = 'aula'; S.x = 96; S.fade = 1; setTime('20.55');
          S.harin = { x: 170 }; S.sari = S.harin;
        },
        ['', 'Aula Villa Mawar. Hujan deras menghantam kaca jendela.'],
        ['Harin', 'Teh hangat untuk Bapak. Satu lagi untuk Pak Basuki di ruang musik. Beliau berpesan tidak ingin diganggu.'],
        ['Noah', 'Terima kasih, Harin. Kau tampak sangat cemas.'],
        ['Harin', 'Hanya badainya, Pak... Pak Basuki pernah berpesan, kalau terjadi sesuatu, saya harus percaya pada Bapak.', 'terpejam'],
        function () { S.harin = null; S.sari = null; setTime('21.00'); S.callOn = true; if (typeof GameAudio !== 'undefined') GameAudio.clockChime(9); },
        ['', 'Lonceng jam di Ruang Musik berdentang sembilan kali. Interkom pos jaga berdering.'],
        ['Dimas (interkom)', 'Pak, longsor di tikungan dua makin parah. Mobil tak bisa lewat sampai subuh. Saya pantau di pos jaga.'],
        function () { addEv('B1'); S.callOn = false; setTime('22.05'); },
        ['', 'Pukul 22.05. Sebuah jeritan histeris membelah malam dari arah Ruang Musik!'],
        ['Yuna', 'Paman Basuki!! Darah di mana-mana!!', 'terkejut'],
        function () {
          S.room = 'musik'; S.x = 110; S.f.discovered = true;
          addEv('B2'); addEv('B3');
        },
        ['', 'Pak Basuki ditemukan tewas di depan piano. Jam antik di dekatnya retak dan mati di angka 21.45.'],
        ['Noah', 'Semua tenang! Jangan ada yang menyentuh TKP. Pelakunya pasti masih ada di dalam villa ini.'],
        function () { S.harin = { x: 295 }; S.sari = S.harin; },
        ['Harin', 'Pak Noah... Saya menemukan secarik kertas ini di bawah cangkir teh Pak Basuki...', 'terpejam'],
        ['Harin', 'Pak Basuki pernah mengajari saya bahwa angka-angka ini adalah pesan rahasia yang dikunci dengan rumus fungsi matematika: ' + (PUZ.p1 ? PUZ.p1.rulePlain : 'f(x) = 5x − 1') + '!'],
        ['Noah', 'Kertas ini kunci penyelidikan kita. Biar kubongkar pesan ini dengan fungsi inversnya!']
      ], function () {
        openPuz('p1');
      });
    });
  }

  // Bab 2: Gudang Belakang & Sandi Dua Kelopak
  function afterP1(decodedMsg) {
    unlockAchievement('ach_sandi1');
    var teksSolusi = decodedMsg || 'Pesan Rahasia';
    var cData = CULPRIT_DATA[S.culprit] || CULPRIT_DATA.jake;
    showChapter(4, function () {
      setTime('23.10'); S.f.p1 = true;
      S.room = 'gudang'; S.x = 160; S.harin = null; S.sari = null;
      addEv('B7'); addEv('B5');
      say([
        ['Noah', 'Pesan Sandi 1 terpecahkan: “' + teksSolusi + '”. Si pembuat pesan ingin kita memeriksa gudang belakang!'],
        ['', 'Noah menyelinap ke gudang di belakang dapur. Hujan masih menderu di luar kaca jendela.'],
        ['Noah', cData.shoeNarrative],
        ['', cData.ashNarrative],
        ['Noah', 'Pelaku membakar bukti kejahatannya di sini! Dan... apa ini di bawah peti?'],
        function () {
          if (PUZ.p2 && EVD.B10) EVD.B10[1] = 'Kartu sandi fungsi komposisi tersembunyi di gudang: ' + PUZ.p2.rule + '.';
          addEv('B10');
        },
        ['', 'Sebuah kartu rahasia kedua bersimbol Bunga Mawar Dua Kelopak terselip di balik tumpukan peti!'],
        ['Noah', 'Ini sandi dua lapis... ' + (PUZ.p2 ? PUZ.p2.fRule + ' lalu ditimpa ' + PUZ.p2.gRule : 'f(x) lalu ditimpa g(x)') + '. Fungsi Komposisi!'],
        ['Noah', 'Pelaku mengunci rahasianya dengan matematika berlapis. Kita harus membalikkan fungsi komposisinya: ' + (PUZ.p2 ? PUZ.p2.invRule : '') + '!']
      ], function () {
        openPuz('p2');
      });
    });
  }

  // Bab 3: Fajar Menyingsing, Konfrontasi & Tuduhan Akhir
  function afterP2(decodedMsg) {
    unlockAchievement('ach_sandi2');
    var teksSolusi = decodedMsg || 'Pesan Rahasia';
    var cData = CULPRIT_DATA[S.culprit] || CULPRIT_DATA.jake;
    showChapter(6, function () {
      setTime('05.30'); S.dawn = true; S.room = 'musik'; S.x = 90;
      addEv('B8'); addEv('B6');
      say([
        ['Noah', 'Pesan Sandi 2 terpecahkan: “' + teksSolusi + '”!!'],
        ['Noah', 'Jam dinding antik sengaja dimajukan ke 21.45 dan dirusak untuk memalsukan alibi! Pak Basuki tewas jauh sebelum jam sembilan lewat seperempat!'],
        ['', 'Fajar mulai menyingsing di jendela Ruang Musik. Seluruh penghuni villa dikumpulkan.'],
        ['Jake', 'Sudah pagi, Detektif. Badai sudah reda dan jalan mulai dibuka. Siapa pelaku yang kau tuduh?', 'bicara'],
        ['Yuna', 'Pasti Dimas si penjaga pos! Dia yang memegang kunci perkakas!', 'terkejut'],
        ['Dimas', 'Demi Tuhan bukan saya! Periksa motif dan bukti fisik di gudang sebelum menuduh!'],
        ['Noah', 'Semua bukti matematika dan jejak di gudang sudah membuktikan siapa pelaku sebenarnya!'],
        {
          ask: {
            who: 'Noah',
            q: 'Berdasarkan hasil dekripsi sandi matematika dan bukti di gudang, siapakah pembunuh Pak Basuki?',
            opts: [
              {
                t: 'Jake (Direktur Keuangan Mawar Karya)',
                lines: (S.culprit === 'jake' ?
                  cData.confessionLines.concat([function () { ending('win', 'Jake'); }]) :
                  cData.defenseLinesJake.concat([function () { ending('weak', 'Jake'); }]))
              },
              {
                t: 'Dimas (Penjaga Pos Jaga)',
                lines: (S.culprit === 'dimas' ?
                  cData.confessionLines.concat([function () { ending('win', 'Dimas'); }]) :
                  cData.defenseLinesDimas.concat([function () { ending('weak', 'Dimas'); }]))
              },
              {
                t: 'Yuna (Keponakan Korban)',
                lines: (S.culprit === 'yuna' ?
                  cData.confessionLines.concat([function () { ending('win', 'Yuna'); }]) :
                  cData.defenseLinesYuna.concat([function () { ending('wrong', 'Yuna'); }]))
              }
            ]
          }
        }
      ]);
    });
  }

  /* ---------- layar akhir cerita ---------- */
  var ENDS = {
    win: { t: 'Sandi Terakhir', tag: 'Akhir 1 · Kebenaran Terungkap', bg: 'ending_1' },
    weak: { t: 'Bukti yang Tipis', tag: 'Akhir 2 · Kasus Menggantung', bg: 'ending_2' },
    wrong: { t: 'Mawar yang Salah', tag: 'Akhir 3 · Salah Menuduh', bg: 'ending_3' }
  };

  function ending(kind, who) {
    S.ending = kind; dlg.Q = []; dlg.active = false; setDlgIdle();
    var c = $('endCard'), E = ENDS[kind] || ENDS.win, body = [];
    var cData = CULPRIT_DATA[S.culprit] || CULPRIT_DATA.jake;

    if (kind === 'win') {
      cData.winDesc.forEach(function (t) { body.push(t); });
      unlockAchievement('ach_win');
      if (S.culprit === 'jake') unlockAchievement('ach_win_jake');
      else if (S.culprit === 'dimas') unlockAchievement('ach_win_dimas');
      else if (S.culprit === 'yuna') unlockAchievement('ach_win_yuna');
      if (!S.hasWrongAccusation) unlockAchievement('ach_pure');
    } else {
      S.hasWrongAccusation = true;
      if (kind === 'wrong') {
        unlockAchievement('ach_bad_wrong');
      } else {
        unlockAchievement('ach_bad_weak');
      }
      body.push('Tuduhan Anda goyah karena bukti jejak sepatu dan barang yang dibakar di gudang tidak mengarah padanya.');
      body.push(cData.failDesc);
      body.push('Anda boleh mencoba lagi untuk menjatuhkan tuduhan yang tepat berdasarkan bukti matematika.');
    }

    c.innerHTML = '<img class="hero" alt="" src="' + ASSETS[E.bg] + '">';
    var s = document.createElement('div'); s.className = 'sub'; s.textContent = E.tag; c.appendChild(s);
    var h2 = document.createElement('h2'); h2.textContent = E.t; c.appendChild(h2);

    if (kind === 'win') {
      var achBanner = document.createElement('div');
      achBanner.className = 'end-ach-banner';
      achBanner.innerHTML = '<div class="end-ach-icon">🏆</div><div class="end-ach-body">' +
        '<span class="end-ach-kicker">PRESTASI TERTINGGI DIBUKA!</span>' +
        '<div class="end-ach-title">Detektif Mawar Sejati</div>' +
        '<div class="end-ach-desc">Selamat! Anda telah membongkar kejahatan di Villa Mawar menggunakan aljabar kriptografi fungsi invers & komposisi.</div>' +
        '</div>';
      c.appendChild(achBanner);
    } else {
      var badAchId = (kind === 'wrong') ? 'ach_bad_wrong' : 'ach_bad_weak';
      var badDef = ACHIEVEMENTS[badAchId];
      if (badDef) {
        var badBanner = document.createElement('div');
        badBanner.className = 'end-ach-banner bad-ach';
        badBanner.innerHTML = '<div class="end-ach-icon">' + badDef.icon + '</div><div class="end-ach-body">' +
          '<span class="end-ach-kicker" style="color:var(--rose);">LENCANA AKHIR KELAM TERBUKA!</span>' +
          '<div class="end-ach-title">' + badDef.title + '</div>' +
          '<div class="end-ach-desc">' + badDef.desc + '</div>' +
          '</div>';
        c.appendChild(badBanner);
      }
    }

    var eb = document.createElement('div'); eb.className = 'list'; c.appendChild(eb);
    body.forEach(function (t) { var p = document.createElement('p'); p.textContent = t; eb.appendChild(p); });

    var r = document.createElement('div'); r.className = 'row';
    r.style.flexWrap = 'wrap';
    r.style.gap = '10px';

    if (kind === 'win') {
      var bCert = document.createElement('button');
      bCert.type = 'button';
      bCert.className = 'primary btn-cert';
      bCert.innerHTML = '📜 Buka Sertifikat Kelulusan';
      bCert.addEventListener('click', openCertModal);
      r.appendChild(bCert);
    }

    var bShowAch = document.createElement('button');
    bShowAch.type = 'button';
    bShowAch.innerHTML = '🏆 Lihat Semua Prestasi';
    bShowAch.addEventListener('click', openAchModal);
    r.appendChild(bShowAch);

    var b = document.createElement('button'); b.type = 'button';
    if (kind !== 'win') b.className = 'primary';
    b.textContent = kind === 'win' ? 'Main Lagi dari Awal' : 'Ulangi Penyelidikan';
    b.addEventListener('click', restart);
    r.appendChild(b);
    c.appendChild(r);

    $('mEnd').hidden = false;
  }

  function restart() {
    $('mEnd').hidden = true;
    _vaultUnlocked = false;
    _failCount = 0;
    _lockoutUntil = 0;
    if (_lockoutTimer) { clearInterval(_lockoutTimer); _lockoutTimer = null; }
    newState(); updNote(); updAchBadge();
    dlg.Q = []; dlg.active = false; setDlgIdle();
    intro();
  }

  /* ---------- buku catatan & bantuan mtk ---------- */
  function openNote() {
    renderNote();
    $('mNote').hidden = false;
  }
  function closeNote() { $('mNote').hidden = true; }

  function renderNote() {
    var c = $('noteCard'); c.innerHTML = '';
    var h = document.createElement('h2'); h.textContent = 'Buku Catatan Bukti & Sandi'; c.appendChild(h);
    var l = document.createElement('div'); l.className = 'list';

    var evKeys = Object.keys(S.ev);
    if (!evKeys.length) {
      l.innerHTML = '<p class="muted">Belum ada catatan. Lanjutkan cerita untuk mengumpulkan petunjuk kasus.</p>';
    } else {
      evKeys.forEach(function (k) {
        var d = EVD[k];
        if (!d) return;
        var e = document.createElement('div'); e.className = 'ev';
        e.innerHTML = '<img class="th" src="' + evSrc(k) + '" alt=""><div class="bd"><b>' + d[0] + '</b><span>' + d[1] + '</span></div>';
        l.appendChild(e);
      });
    }

    // Catatan Sandi Matematika
    var sm = document.createElement('div'); sm.className = 'ev';
    sm.innerHTML = '<img class="th" src="' + (ASSETS.p_surat_basuki || ASSETS.p_surat_surya || ASSETS.p_surat_arga) + '" alt=""><div class="bd"><b>Ringkasan Rumus Sandi Mawar</b><span><b>Sandi 1 (Fungsi Invers):</b> y = 5x − 1  →  <b>x = (y + 1) / 5</b></span><span><b>Sandi 2 (Fungsi Komposisi):</b> y = 10x − 5  →  <b>x = (y + 5) / 10</b></span></div>';
    l.appendChild(sm);

    c.appendChild(l);
    var r = document.createElement('div'); r.className = 'row';
    var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Tutup';
    b.addEventListener('click', closeNote);
    r.appendChild(b);
    c.appendChild(r);
  }

  $('bNote').addEventListener('click', function () {
    if ($('mNote').hidden) openNote(); else closeNote();
  });

  $('bHelp').addEventListener('click', function () {
    if (!$('mHelp').hidden) { $('mHelp').hidden = true; return; }
    var c = $('helpCard');
    c.innerHTML = '<h2>Panduan Materi: Kriptografi & Komposisi Fungsi</h2>' +
      '<div class="list">' +
      '<p><b>1. Tabel Kuantifikasi Huruf (Acuan Konversi):</b><br>' +
      '• Huruf Kapital (A–Z) = Angka positif <b>1 s/d 26</b> (A=1, B=2, ..., Z=26)<br>' +
      '• Huruf Kecil (a–z) = Angka negatif <b>−1 s/d −26</b> (a=−1, b=−2, ..., z=−26)<br>' +
      '• Spasi antarkata = Angka <b>0</b></p>' +
      '<p><b>2. Sandi 1: Enkripsi Linear & Fungsi Dekripsi/Invers f⁻¹(y):</b><br>' +
      '• Fungsi Enkripsi (Kunci): y = f(x) = 5x − 1<br>' +
      '• Fungsi Dekripsi (Invers): <b>x = (y + 1) / 5</b><br>' +
      '• <i>Contoh:</i> Cipherteks 79 → x = (79 + 1)/5 = 16 (Plainteks: Huruf P kapital).</p>' +
      '<p><b>3. Sandi 2: Enkripsi Ganda (Komposisi Fungsi) & Invers (g∘f)⁻¹(y):</b><br>' +
      '• <i>Konsep:</i> Agar tingkat keamanan pesan berlipat ganda, enkripsi menggunakan komposisi fungsi.<br>' +
      '• Fungsi 1: f(x) = 5x − 1, Fungsi 2: g(x) = 2x − 3<br>' +
      '• Komposisi: (g∘f)(x) = 2(5x − 1) − 3 = 10x − 5<br>' +
      '• Fungsi Dekripsi (Invers Komposisi): <b>x = (y + 5) / 10</b><br>' +
      '• <i>Contoh:</i> Cipherteks 95 → x = (95 + 5)/10 = 10 (Plainteks: Huruf J kapital).</p>' +
      '<p><b>4. Tips & Catatan:</b><br>' +
      '• Menu <b>Kalkulator sandi</b> dilindungi password agar pemain terlatih menghitung mandiri secara manual.<br>' +
      '• Anda bisa mengetik angka <b>x</b> atau langsung mengetik <b>hurufnya</b> pada kotak teka-teki!</p>' +
      '</div>' +
      '<div class="row"><button type="button" id="hx">Tutup</button></div>';
    $('mHelp').hidden = false;
    $('hx').addEventListener('click', function () { $('mHelp').hidden = true; });
  });

  function openQR() {
    var c = $('qrCard');
    c.innerHTML = '<h2>📱 Scan QR Code untuk Main di HP</h2>' +
      '<div style="display:flex;flex-direction:column;align-items:center;margin:12px 0;">' +
      '  <div style="background:#fff;padding:12px;border-radius:12px;border:3px solid var(--amber);box-shadow:0 6px 20px rgba(0,0,0,0.5);">' +
      '    <img src="assets/qr_villa_mawar.png" alt="QR Code Villa Mawar" style="width:230px;height:230px;display:block;image-rendering:pixelated;">' +
      '  </div>' +
      '  <div style="margin-top:12px;font-family:var(--f-mono);font-size:15px;color:var(--teal);font-weight:600;">https://villamawar.vercel.app</div>' +
      '  <p class="muted" style="margin-top:6px;text-align:center;font-size:13px;">Buka kamera smartphone dan arahkan ke QR Code di atas.</p>' +
      '</div>' +
      '<div class="row"><button type="button" class="primary" id="qrx">Tutup</button></div>';
    $('mQR').hidden = false;
    var qrx = $('qrx');
    if (qrx) qrx.addEventListener('click', function () { $('mQR').hidden = true; });
  }

  var bQR = $('bQR');
  if (bQR) bQR.addEventListener('click', openQR);
  var bTitleQR = $('bTitleQR');
  if (bTitleQR) bTitleQR.addEventListener('click', openQR);

  /* ---------- sertifikat & modal prestasi ---------- */
  function openCertModal() {
    var c = $('certCard');
    var cData = CULPRIT_DATA[S ? S.culprit : 'jake'] || CULPRIT_DATA.jake;
    var culpritName = cData.name + ' (' + cData.role + ')';
    var todayStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });

    c.innerHTML =
      '<div class="cert-header">' +
      '  <span class="cert-inst">Republik Indonesia · Biro Penyelidikan Kriptografi Khusus</span>' +
      '  <div class="cert-badge-icons">🌹 ⚖️ 📜</div>' +
      '  <h1 class="cert-main-title">SERTIFIKAT KELULUSAN DETEKTIF</h1>' +
      '  <div class="cert-sub-reg">PIAGAM PENGHARGAAN RESMI · NO. REG: VM-MTK/' + new Date().getFullYear() + '/088</div>' +
      '</div>' +
      '<div class="cert-body">' +
      '  <div class="cert-award-to">Diberikan secara resmi dan terhormat kepada:</div>' +
      '  <input type="text" id="certStudentName" class="cert-name-input" value="Detektif Siswa" maxlength="42" placeholder="Ketik Nama Anda Di Sini...">' +
      '  <div class="cert-name-tip">💡 Klik nama di atas untuk mengetik nama Anda sendiri sebelum mencetak atau screenshot</div>' +
      '  <div class="cert-citation">' +
      '    Telah berhasil menyelesaikan seluruh rangkaian penyelidikan kasus kriminal di <b>Villa Mawar</b> dengan keunggulan deduksi logika serta penguasaan Kriptografi Matematika tingkat lanjut: <b>Fungsi Invers Linear</b> <code>f⁻¹(y) = (y+1)/5</code> dan <b>Komposisi Fungsi</b> <code>(g∘f)⁻¹(y) = (y+5)/10</code>, serta sukses menangkap pelaku sebenarnya: <b>' + culpritName + '</b>.' +
      '  </div>' +
      '  <div class="cert-award-title-box">' +
      '    <div class="cert-award-kicker">Predikat Kelulusan & Gelar Kehormatan:</div>' +
      '    <div class="cert-award-rank">MASTER KRIPTOGRAFI ALJABAR & FUNGSI INVERS</div>' +
      '  </div>' +
      '</div>' +
      '<div class="cert-footer">' +
      '  <div class="cert-sig-block">' +
      '    <div class="cert-sig-line">Noah Raka</div>' +
      '    <div class="cert-sig-name">Detektif Senior Noah</div>' +
      '    <div class="cert-sig-role">Kepala Tim Investigasi</div>' +
      '  </div>' +
      '  <div class="cert-seal">' +
      '    <div class="cert-seal-icon">🌹</div>' +
      '    <div class="cert-seal-txt">VILLA MAWAR<br>OFFICIAL<br>SEAL</div>' +
      '  </div>' +
      '  <div class="cert-sig-block">' +
      '    <div class="cert-sig-line">Harin Sari</div>' +
      '    <div class="cert-sig-name">Harin (Sari)</div>' +
      '    <div class="cert-sig-role">Saksi Kunci & Pembuat Sandi</div>' +
      '  </div>' +
      '</div>' +
      '<div class="cert-date-bar">Diterbitkan di Villa Mawar pada tanggal ' + todayStr + '</div>' +
      '<div class="cert-actions">' +
      '  <button type="button" class="primary btn-cert" id="bPrintCert">🖨️ Cetak / Simpan PDF</button>' +
      '  <button type="button" id="bCloseCert">Tutup</button>' +
      '</div>';

    $('mCert').hidden = false;

    var bPrint = $('bPrintCert');
    if (bPrint) {
      bPrint.addEventListener('click', function () {
        window.print();
      });
    }
    var bClose = $('bCloseCert');
    if (bClose) {
      bClose.addEventListener('click', function () {
        $('mCert').hidden = true;
      });
    }
  }

  function openAchModal() {
    renderAchievements();
    $('mAch').hidden = false;
  }

  function renderAchievements() {
    var c = $('achCard');
    var unlocked = getUnlockedAchievements();
    var keys = Object.keys(ACHIEVEMENTS);
    var unlockedCount = Object.keys(unlocked).length;
    var totalCount = keys.length;
    var pct = Math.round((unlockedCount / totalCount) * 100);

    var html = '<h2>🏆 Galeri Prestasi & Lencana Detektif</h2>' +
      '<p class="muted">Koleksi pencapaian selama menyelidiki kasus pembunuhan di Villa Mawar. Prestasi tersimpan otomatis di browser perangkat Anda.</p>' +
      '<div class="ach-progress-box">' +
      '  <div class="ach-progress-head">' +
      '    <span>Kemajuan Penyelidikan</span>' +
      '    <b>' + unlockedCount + ' / ' + totalCount + ' Terbuka (' + pct + '%)</b>' +
      '  </div>' +
      '  <div class="ach-progress-bar">' +
      '    <div class="ach-progress-fill" style="width:' + pct + '%;"></div>' +
      '  </div>' +
      '</div>' +
      '<div class="ach-grid">';

    keys.forEach(function (id) {
      var item = ACHIEVEMENTS[id];
      var isUnlocked = !!unlocked[id];
      var dateStr = '';
      if (isUnlocked && unlocked[id].unlockedAt) {
        try {
          var d = new Date(unlocked[id].unlockedAt);
          dateStr = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch (e) {}
      }

      var isBad = item.id && item.id.indexOf('ach_bad_') === 0;
      var itemClass = isUnlocked ? ('unlocked' + (isBad ? ' bad-item' : '')) : 'locked';
      html += '<div class="ach-item ' + itemClass + '">' +
        '  <div class="ach-icon-box">' + (isUnlocked ? item.icon : '🔒') + '</div>' +
        '  <div class="ach-detail">' +
        '    <div class="ach-meta">' +
        '      <span class="ach-cat">' + item.cat + '</span>' +
        '      <span class="ach-status-badge">' + (isUnlocked ? '✓ Diraih' : 'Terkunci') + '</span>' +
        '    </div>' +
        '    <div class="ach-name">' + item.title + '</div>' +
        '    <div class="ach-desc">' + item.desc + '</div>' +
        (isUnlocked && dateStr ? '    <div class="ach-date">Dibuka: ' + dateStr + '</div>' : '') +
        '  </div>' +
        '</div>';
    });

    html += '</div>';

    var hasWon = !!unlocked.ach_win;
    html += '<div class="row" style="flex-wrap:wrap;gap:10px;">';
    if (hasWon) {
      html += '<button type="button" class="primary btn-cert" id="bAchOpenCert">📜 Buka Sertifikat Kelulusan</button>';
    }
    html += '<button type="button" id="bCloseAch">Tutup</button>' +
      '</div>';

    c.innerHTML = html;

    var bCert = $('bAchOpenCert');
    if (bCert) {
      bCert.addEventListener('click', function () {
        $('mAch').hidden = true;
        openCertModal();
      });
    }

    var bClose = $('bCloseAch');
    if (bClose) {
      bClose.addEventListener('click', function () {
        $('mAch').hidden = true;
      });
    }
  }

  var bAch = $('bAch');
  if (bAch) {
    bAch.addEventListener('click', function () {
      if ($('mAch').hidden) openAchModal();
      else $('mAch').hidden = true;
    });
  }

  /* ---------- hud & bab banner ---------- */
  var _lastHud = '';
  function updHud() {
    if (!S) return;
    var rm = S.memory ? 'Dapur (Kilas Balik)' : (RN[S.room] || S.room);
    var ob = S.f.p2 ? 'Konfrontasi Pelaku' : (S.f.p1 ? 'Pecahkan Sandi 2' : 'Pecahkan Sandi 1');
    var hKey = S.time + '|' + rm + '|' + ob;
    if (hKey === _lastHud) return;
    _lastHud = hKey;
    $('clock').textContent = S.time;
    $('room').textContent = rm;
    $('obj').textContent = ob;
  }

  function showChapter(num, callback) {
    var k = 'chapter_' + num;
    var src = ASSETS[k];
    if (!src) { if (callback) callback(); return; }
    var overlay = document.createElement('div');
    overlay.className = 'chapter-overlay';
    overlay.innerHTML = '<img src="' + src + '" alt="Bab ' + num + '">';
    document.body.appendChild(overlay);
    setTimeout(function () {
      overlay.classList.add('out');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        if (callback) callback();
      }, 350);
    }, 1500);
  }

  /* ---------- animasi kilat judul ---------- */
  var titleFlashTimer = null;
  function startTitleFlash() {
    if (titleFlashTimer) return;
    titleFlashTimer = setInterval(function () {
      var tImg = $('titleImg');
      if (!tImg || $('mTitle').hidden) return;
      if (Math.random() < 0.4) {
        tImg.src = ASSETS.menu_bg_kilat || 'assets/menu/layar/latar_menu_utama_kilat.png';
        if (typeof GameAudio !== 'undefined' && !$('mTitle').hidden) GameAudio.thunder();
        setTimeout(function () {
          if (tImg) tImg.src = ASSETS.menu_bg || 'assets/menu/layar/latar_menu_utama.png';
        }, 90);
      }
    }, 4500);
  }

  /* ---------- render canvas visual novel ---------- */
  var last = 0;
  function frame(ts) {
    var dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; S.t += dt;
    S.flashT -= dt;
    if (S.flashT <= 0) {
      S.flash = 1;
      S.flashT = 8 + Math.random() * 12;
      if (typeof GameAudio !== 'undefined') GameAudio.thunder();
    }
    S.flash = Math.max(0, S.flash - dt * 2.2);
    if (S.fade > 0) S.fade = Math.max(0, S.fade - dt * 2.4);

    updHud();
    draw();
    requestAnimationFrame(frame);
  }

  function draw() {
    ctx.setTransform(Z, 0, 0, Z, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, LW, LH);

    var bgk = S.memory ? 'dapur_makan' : ((S.room === 'musik' && S.dawn) ? 'ruang_musik_subuh' : RK[S.room]);
    if (IM['bg_' + bgk]) ctx.drawImage(IM['bg_' + bgk], 0, 0);

    // Properti TKP
    if (S.room === 'musik' && !S.memory) {
      if (IM.p_jam_musik_retak_2145) ctx.drawImage(IM.p_jam_musik_retak_2145, 291, 94);
      if (IM.jasad_kiri) ctx.drawImage(IM.jasad_kiri, 192, 181);
      if (IM.p_kaca_pecah_di_atas_darah) ctx.drawImage(IM.p_kaca_pecah_di_atas_darah, 246, 189);
    }
    if (S.room === 'gudang') {
      if (IM.p_jejak_pantofel_lumpur) {
        ctx.drawImage(IM.p_jejak_pantofel_lumpur, 44, 186);
        ctx.drawImage(IM.p_jejak_pantofel_lumpur, 112, 191);
      }
    }

    // Efek Hujan & Kilat di Luar Jendela
    var wins = (typeof ROOM_WINDOWS !== 'undefined' && ROOM_WINDOWS[bgk]) || [];
    if (wins.length > 0 && !S.dawn) {
      ctx.save();
      ctx.beginPath();
      wins.forEach(function (w) { ctx.rect(w[0], w[1], w[2], w[3]); });
      ctx.clip();

      // Lapisan suasana malam badai di balik kaca jendela
      ctx.fillStyle = 'rgba(10, 16, 32, 0.25)';
      ctx.fillRect(0, 0, LW, LH);

      // Gambar tekstur hujan frame overlay
      ctx.globalAlpha = 0.85;
      var rf = Math.floor(S.t * 10) % 4;
      if (IM['rain' + rf]) ctx.drawImage(IM['rain' + rf], 0, 0);

      // Aliran hujan dinamis yang mengalir aktif di kaca jendela
      ctx.strokeStyle = 'rgba(195, 220, 255, 0.75)';
      ctx.lineWidth = 1;
      wins.forEach(function (w) {
        var rx = w[0], ry = w[1], rw = w[2], rh = w[3];
        var count = Math.max(8, Math.floor(rw * 0.45));
        for (var i = 0; i < count; i++) {
          var seed = (i * 97) % rw;
          var speed = 140 + ((i * 37) % 55);
          var dy = (S.t * speed + i * 31) % (rh + 18);
          var px = rx + seed;
          var py = ry + dy - 9;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px - 2, py + 8);
          ctx.stroke();
        }
      });

      if (S.flash > .05) {
        ctx.globalAlpha = Math.min(1, S.flash) * 0.95;
        if (IM.kilat) ctx.drawImage(IM.kilat, 0, 0);
        ctx.fillStyle = 'rgba(230, 240, 255, ' + (S.flash * 0.45) + ')';
        ctx.fillRect(0, 0, LW, LH);
      }
      ctx.restore();
    }

    if (S.flash > .05 && !S.dawn && wins.length > 0) {
      ctx.fillStyle = 'rgba(200, 220, 255, ' + (S.flash * 0.14) + ')';
      ctx.fillRect(0, 0, LW, LH);
    }

    // Gambar Karakter dalam Adegan
    var spk = S.spk && dlg.active;
    if (S.memory) {
      var mc = [['yuna', 185, 1], ['basuki', 230, -1], ['jake', 275, -1], ['noah', 325, -1]];
      mc.forEach(function (c) {
        drawChar(c[0], (spk && S.spk === c[0]) ? 'talk' : 'idle', c[1], c[2], S.t);
        nameTag(c[1], NAME[c[0]], '#dcae55');
      });
      ctx.fillStyle = 'rgba(150,100,40,.24)';
      ctx.fillRect(0, 0, LW, LH);
    } else if (S.room === 'aula') {
      drawChar('noah', (spk && S.spk === 'noah') ? 'talk' : 'idle', 110, 1, S.t);
      nameTag(110, 'Noah', '#74bdb2');
      var h1 = S.harin || S.sari;
      if (h1) {
        drawChar('harin', (spk && S.spk === 'harin') ? 'talk' : 'idle', h1.x, -1, S.t);
        nameTag(h1.x, 'Harin', '#dcae55');
      }
    } else if (S.room === 'gudang') {
      drawChar('noah', (spk && S.spk === 'noah') ? 'talk' : 'idle', 170, 1, S.t);
      nameTag(170, 'Noah', '#74bdb2');
    } else if (S.room === 'musik') {
      if (S.dawn) {
        drawChar('noah', (spk && S.spk === 'noah') ? 'talk' : 'idle', 85, 1, S.t);
        nameTag(85, 'Noah', '#74bdb2');
        drawChar('jake', (spk && S.spk === 'jake') ? 'talk' : 'idle', 165, -1, S.t);
        nameTag(165, 'Jake', '#dcae55');
        drawChar('dimas', (spk && S.spk === 'dimas') ? 'talk' : 'idle', 235, -1, S.t);
        nameTag(235, 'Dimas', '#dcae55');
        drawChar('yuna', (spk && S.spk === 'yuna') ? 'talk' : 'idle', 305, -1, S.t);
        nameTag(305, 'Yuna', '#dcae55');
      } else {
        drawChar('noah', (spk && S.spk === 'noah') ? 'talk' : 'idle', 105, 1, S.t);
        nameTag(105, 'Noah', '#74bdb2');
        var h2 = S.harin || S.sari;
        if (h2) {
          drawChar('harin', (spk && S.spk === 'harin') ? 'talk' : 'idle', h2.x, -1, S.t);
          nameTag(h2.x, 'Harin', '#dcae55');
        }
      }
    }

    if (S.fade > 0) {
      ctx.fillStyle = 'rgba(0,0,0,' + S.fade + ')';
      ctx.fillRect(0, 0, LW, LH);
    }
  }

  /* ---------- inisialisasi ---------- */
  var bAud = $('bAudio');
  if (bAud && typeof GameAudio !== 'undefined') {
    bAud.addEventListener('click', function () {
      var unmuted = GameAudio.toggleMute();
      bAud.textContent = unmuted ? '🔊 Suara: Nyala' : '🔇 Suara: Mati';
      GameAudio.clickUI();
    });
  }
  $('bStart').addEventListener('click', function () {
    if (typeof GameAudio !== 'undefined') GameAudio.start();
    $('mTitle').hidden = true;
    if (titleFlashTimer) { clearInterval(titleFlashTimer); titleFlashTimer = null; }
    updNote();
    intro();
  });

  setDlgIdle();
  updHud();
  updAchBadge();

  loadAll().then(function () {
    var tImg = $('titleImg');
    if (tImg) tImg.src = ASSETS.menu_bg || 'assets/menu/layar/latar_menu_utama.png';
    startTitleFlash();
    requestAnimationFrame(frame);
  });
})();
