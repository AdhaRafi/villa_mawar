(function () {
  'use strict';
  var LW = 384, LH = 216, Z = 3, FEET = 196;
  var $ = function (id) { return document.getElementById(id); };
  var cv = $('cv'), ctx = cv.getContext('2d');
  var REDUCED = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- sandi ---------- */
  function val(c) { return c === ' ' ? 0 : (c >= 'A' && c <= 'Z' ? c.charCodeAt(0) - 64 : -(c.charCodeAt(0) - 96)); }
  function chr(v) { return v === 0 ? ' ' : (v > 0 ? String.fromCharCode(64 + v) : String.fromCharCode(96 - v)); }
  var F = function (x) { return 5 * x - 1; }, GF = function (x) { return 10 * x - 5; };
  function enc(m, fn) { return Array.from(m).map(function (c) { return fn(val(c)); }); }
  var PUZ = {
    p1: {
      title: 'Kartu di Bawah Cangkir', msg: 'Pelaku Ada Di Gudang', fn: F, img: 'p_kartu_sandi_1_x3',
      rule: 'f(x) = 5x − 1',
      calcs: [{ n: 'f⁻¹(y) = (y + 1) / 5', fn: function (y) { return (y + 1) / 5; } }],
      hints: [
        'Kunci dari surat Arga: f(x) = 5x − 1. Untuk membuka sandi, balikkan: dari y = 5x − 1 didapat x = (y + 1) / 5.',
        'Contoh: 79 → (79 + 1) / 5 = 16, yaitu huruf ke-16 kapital: P. Spasi bernilai 0 dan terenkripsi menjadi −1.',
        'Kata pertama: P, e, l, a, k, u.'
      ]
    },
    p2: {
      title: 'Kartu Dua Kelopak', msg: 'Jam Musik Bohong', fn: GF, img: 'p_kartu_sandi_2_dua_kelopak_x3',
      rule: 'f(x) = 5x − 1, lalu g(x) = 2x − 3',
      calcs: [
        { n: 'f⁻¹(y) = (y + 1) / 5', fn: function (y) { return (y + 1) / 5; } },
        { n: 'g⁻¹(y) = (y + 3) / 2', fn: function (y) { return (y + 3) / 2; } },
        { n: '(g∘f)⁻¹(y) = (y + 5) / 10', fn: function (y) { return (y + 5) / 10; } }
      ],
      hints: [
        'Coba f⁻¹ di kalkulator. Kalau hasilnya pecahan, ada lapisan kedua: setelah f, angka ditimpa g(x) = 2x − 3.',
        'Gabungkan: (g∘f)(x) = g(f(x)) = 2(5x − 1) − 3 = 10x − 5. Inversnya: x = (y + 5) / 10. Atau buka dari luar: g⁻¹ dulu, baru f⁻¹.',
        '95 → (95 + 5) / 10 = 10, yaitu J. Atau g⁻¹(95) = 49, lalu f⁻¹(49) = 10.'
      ]
    }
  };

  /* ---------- aset ---------- */
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
    siluet_pelaku: { idle: [0, 4, 6], walk: [1, 6, 10], run: [2, 6, 14], attack: [6, 4, 12], hurt: [7, 2, 8] }
  };
  var RK = { aula: 'aula', musik: 'ruang_musik', kerja: 'ruang_kerja', dapur: 'dapur_makan', lorong: 'lorong_kamar', gudang: 'gudang' };
  var RN = { aula: 'Aula', musik: 'Ruang Musik', kerja: 'Ruang Kerja', dapur: 'Dapur & Ruang Makan', lorong: 'Lorong & Kamar Raka', gudang: 'Gudang' };
  var NAME = { sari: 'Sari', dimas: 'Dimas', naya: 'Naya', bima: 'Bima', arga: 'Arga', raka: 'Raka' };
  function drawChar(id, anim, x, face, tm, once) {
    var T = ATL[id] || ATL.base, A = T[anim] || T.idle, sh = IM['ch_' + id]; if (!sh) return;
    var idx = once ? Math.min(A[1] - 1, Math.floor(tm * A[2])) : Math.floor(tm * A[2]) % A[1];
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, FEET + 1, 13, 3, 0, 0, 6.3); ctx.fill();
    ctx.save(); ctx.translate(Math.round(x), 0); if (face < 0) ctx.scale(-1, 1);
    ctx.drawImage(sh, idx * 64, A[0] * 64, 64, 64, -32, FEET - 62, 64, 64); ctx.restore();
  }
  function nameTag(x, t, col) { ctx.font = '7px "Pixelify Sans","Courier New",monospace'; ctx.textAlign = 'center'; ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText(t, x, FEET - 60); ctx.fillStyle = col; ctx.fillText(t, x, FEET - 60); }

  /* ---------- modal helper ---------- */
  function isModalOpen() {
    return !$('mTitle').hidden ||
      !$('mHelp').hidden ||
      !$('mNote').hidden ||
      !$('mPuz').hidden ||
      !$('mBoard').hidden ||
      !$('mEnd').hidden;
  }

  /* ---------- state ---------- */
  var S;
  function newState() { S = { room: 'aula', x: 100, face: 1, f: {}, ev: {}, seen: {}, time: '--.--', fade: 0, flash: 0, flashT: 5, fb: null, t: 0, started: false, pose: null, spk: null, noteT: 0, sari: null, callOn: false, memory: false, dawn: false, ending: null }; }
  newState();
  var keys = { l: false, r: false };
  var dlg = { active: false, Q: [], done: null, opts: false, typing: false };

  /* ---------- bukti ---------- */
  var EVD = {
    B1: ['Interkom dari pos jaga', 'Pukul 21.00 dan 21.14 Dimas menelepon lewat interkom. Kabel interkom hanya menghubungkan pos jaga dan Aula. Jalan kaki pos–villa kira-kira 10 menit di lumpur.'],
    B2: ['Dentang jam Ruang Musik', 'Raka mendengar sembilan dentang pukul 21.00 dan satu dentang seperempat jam pukul 21.15.'],
    B3: ['Kaca pecah di atas darah', 'Pecahan kaca jam berdiri berserakan di atas genangan darah yang sudah mengental. Kaca baru pecah setelah Arga berdarah. Jarum diputar paksa ke 21.45 dan bandul dihentikan, jadi “waktu 21.45” adalah rekayasa.'],
    B4: ['Brankas terbuka tanpa paksa', 'Brankas di Ruang Kerja terbuka tanpa bekas dirusak dan buku besar hilang. Pelakunya tahu kodenya.'],
    B5: ['Arang kertas di drum gudang', 'Sisa kertas terbakar berisi kolom angka dan huruf “MJC”. Halaman buku besar dibakar di sini.'],
    B6: ['Map “Audit MJC” dan memo Arga', 'Memo: “MJC tak punya alamat. Semua pembayaran vendor disetujui bagian keuangan. Periksa besok bersama R.” Bagian keuangan Mawar Karya dipimpin Bima.'],
    B7: ['Jejak pantofel di gudang', 'Jejak sepatu bersol licin dengan tumit kiri aus dan lumpur tanah merah, dari pintu belakang ke kotak perkakas. Tidak ada jejak bot bergerigi (Dimas) atau sol kets (Naya).'],
    B8: ['Pantofel Bima di rak sepatu', 'Pantofel hitam Bima: tanah merah di sol dan tumit kiri aus. Bima kini bersandal. Ia berdalih sepatunya kotor karena ke mobil, padahal halaman depan berpaving dan tanah merah hanya ada di halaman belakang.'],
    B9: ['Pembuka surat di kotak Dimas', 'Pembuka surat perak milik Arga, berdarah, di kotak perkakas Dimas. Kotak tidak dikunci dan hanya ada jejak pantofel di sekitarnya, tak ada jejak bot Dimas. Senjata itu ditaruh orang lain.'],
    B10: ['Jas hujan TAMU berdarah', 'Jas hujan hitam berkerudung berlabel TAMU (jas hujan cadangan untuk tamu), berdarah di lengan, disembunyikan di balik peti. Dimas memakai jas hujan bernama miliknya sendiri. Pelaku memakainya agar bajunya bersih, tanda pembunuhan yang direncanakan.'],
    B11: ['Kesaksian Sari', 'Dari jendela dapur, tak lama setelah dentang 21.15, Sari melihat sosok berjas hujan berkerudung berlari ke gudang membawa sesuatu. Sepatunya mengilap kena kilat. Sekitar pukul 21.32 jaket Bima berbau asap dan ia sudah bersandal.']
  };
  var EVORDER = ['B1', 'B2', 'B3', 'B4', 'B5', 'B6', 'B7', 'B8', 'B9', 'B10', 'B11'];
  var EVIMG = { B1: 'interkom_menyala', B2: 'jam_musik_retak_2145', B3: 'kaca_pecah_di_atas_darah', B4: 'brankas_terbuka', B5: 'arang_kertas_mjc', B6: 'map_audit_mjc', B7: 'jejak_pantofel_lumpur', B8: 'pantofel_bima_lumpur_merah', B9: 'kotak_perkakas_pembuka_surat', B10: 'jas_hujan_tamu_berdarah', B11: 'asap_jaket_bima' };
  function evSrc(id) { return ASSETS['p_' + EVIMG[id]]; }
  function addEv(id) { if (S.ev[id]) return; S.ev[id] = []; S.noteT = 1.6; toast('Bukti baru: ' + EVD[id][0], evSrc(id)); updNote(); }
  function extra(id, t) { if (!S.ev[id]) return; if (S.ev[id].indexOf(t) < 0) S.ev[id].push(t); }
  function updNote() { $('nEv').textContent = Object.keys(S.ev).length; }
  var tt; function toast(t, src) { var e = $('toast'); e.innerHTML = ''; if (src) { var i = document.createElement('img'); i.src = src; i.alt = ''; e.appendChild(i); } var s = document.createElement('span'); s.textContent = t; e.appendChild(s); e.classList.add('on'); clearTimeout(tt); tt = setTimeout(function () { e.classList.remove('on'); }, 2800); }

  /* ---------- dialog ---------- */
  function pkey(n) { if (!n) return null; if (/^Raka/.test(n)) return 'raka'; if (/^Sari/.test(n)) return 'sari'; if (/^Dimas/.test(n)) return 'dimas'; if (/^Naya/.test(n)) return 'naya'; if (/^Bima/.test(n)) return 'bima'; if (/Arga/.test(n)) return 'arga'; return null; }
  function setPor(k, ex) { var p = $('por'); if (!k || !IM['por_' + k + '_' + ex]) { p.hidden = true; return; } p.hidden = false; p.src = ASSETS['por_' + k + '_' + ex]; p.alt = NAME[k] || ''; }
  function setDlgIdle() { S.spk = null; S.pose = null; clearInterval(typeT); $('who').textContent = ''; $('txt').textContent = 'Berjalan dan periksa sekitar. Dekati benda bertanda lup atau pintu lalu tekan Periksa.'; $('txt').className = ''; $('who').className = ''; $('opts').innerHTML = ''; $('hint').textContent = ''; $('dlg').classList.remove('live'); $('por').hidden = true; }
  function say(lines, done) { dlg.Q = lines.slice(); dlg.done = done || null; dlg.active = true; nextLine(); }
  function nextLine() {
    if (!dlg.Q.length) { dlg.active = false; dlg.opts = false; dlg.typing = false; setDlgIdle(); var d = dlg.done; dlg.done = null; if (d) d(); return; }
    var l = dlg.Q.shift();
    if (typeof l === 'function') { l(); nextLine(); return; }
    if (l.ask) { showOpts(l.ask); return; }
    showLine(l);
  }
  var typeT = null;
  function showLine(l) {
    var name = l[0], text = l[1], ex = l[2] || 'netral', k = pkey(name), nar = !name;
    S.spk = k; dlg.opts = false; $('opts').innerHTML = ''; $('dlg').classList.add('live');
    $('who').textContent = name; $('who').className = nar ? 'nar' : ''; $('txt').className = nar ? 'nar' : '';
    dlg.full = text; dlg.pos = 0; dlg.k = k; dlg.ex = ex; dlg.typing = true; setPor(k, ex); $('hint').textContent = '';
    clearInterval(typeT);
    if (REDUCED) { finishType(); return; }
    $('txt').textContent = '';
    typeT = setInterval(function () {
      dlg.pos += 2; $('txt').textContent = dlg.full.slice(0, dlg.pos);
      if (k && ex === 'netral') setPor(k, (Math.floor(dlg.pos / 6) % 2) ? 'bicara' : 'netral');
      if (dlg.pos >= dlg.full.length) finishType();
    }, 26);
  }
  function finishType() { clearInterval(typeT); $('txt').textContent = dlg.full; dlg.typing = false; setPor(dlg.k, dlg.ex); $('hint').textContent = 'Tekan Lanjut ▸'; }
  function showOpts(a) {
    dlg.opts = true; dlg.typing = false; clearInterval(typeT); var k = pkey(a.who); S.spk = k; setPor(k, 'netral');
    $('who').textContent = a.who || ''; $('who').className = a.who ? '' : 'nar'; $('txt').textContent = a.q || ''; $('txt').className = a.who ? '' : 'nar';
    var box = $('opts'); box.innerHTML = ''; $('hint').textContent = ''; $('dlg').classList.remove('live');
    a.opts.forEach(function (o, i) { var b = document.createElement('button'); b.type = 'button'; b.textContent = (i + 1) + '. ' + o.t; b.addEventListener('click', function () { choose(o); }); box.appendChild(b); });
    dlg._cur = a;
  }
  function choose(o) {
    dlg.opts = false; $('opts').innerHTML = '';
    if (o.fx) o.fx();
    var add = (o.lines || []).slice();
    if (o.back) add.push(o.back);
    dlg.Q = add.concat(dlg.Q);
    nextLine();
  }
  function advance() { if (!dlg.active || dlg.opts) return; if (dlg.typing) { finishType(); return; } nextLine(); }
  $('dlg').addEventListener('click', advance);
  cv.addEventListener('click', act);
  function say2(l) { dlg.Q = l.concat(dlg.Q); }

  /* ---------- peta ---------- */
  var HOT = [], EXIT = [];
  function R_(room, kind, key) { return ROOMJ[RK[room]][kind][key]; }
  function hs(room, key, label, run, show) { HOT.push({ room: room, id: room + '.' + key, key: key, r: R_(room, 'hotspots', key), label: label, run: run, show: show }); }
  function ex(room, key, label, to, cond) { EXIT.push({ room: room, key: key, r: R_(room, 'exits', key), label: label, to: to, cond: cond }); }
  function go(room, fromRoom) {
    var x = 60;
    if (fromRoom) { EXIT.forEach(function (e) { if (e.room === room && e.to === fromRoom) x = e.r[0] + e.r[2] / 2; }); }
    S.fade = 1; S.room = room; S.x = x; S.f['v_' + room] = true; S.face = 1; updHud();
  }
  // Aula
  ex('aula', 'lorong_kamar', 'Lorong & Kamar Raka', 'lorong');
  ex('aula', 'dapur_makan', 'Dapur', 'dapur');
  ex('aula', 'ruang_kerja', 'Ruang Kerja', 'kerja');
  ex('aula', 'ruang_musik', 'Ruang Musik', 'musik');
  hs('aula', 'interkom', 'Interkom', function () { say([['Raka', 'Interkom kabel ke pos jaga. Satu-satunya hubungan di villa ini sejak sinyal mati.']]); });
  hs('aula', 'sofa', 'Sofa', function () { say([['Raka', 'Sofa tempat para tamu menunggu hujan reda. Tidak ada apa-apa di sini.']]); });
  hs('aula', 'mantel', 'Rak perapian', function () { say([['Raka', 'Foto Pak Arga dan Bima di hari pendirian Mawar Karya. Keduanya tersenyum lebar. Dua puluh tahun lalu.']]); });
  // Musik
  ex('musik', 'aula', 'Aula', 'aula');
  hs('musik', 'jam_musik', 'Jam berdiri', function () {
    if (S.f.p2) {
      say([['Raka', 'Lup kupakai. Pecahan kaca ini jatuh di atas genangan darah yang sudah mengental, bukan di bawahnya. Kalau jam ini pecah saat Arga bertarung, kaca akan terendam darah.'],
      ['Raka', 'Jarum jam juga diputar paksa. Seseorang merusaknya setelah Arga lama berdarah. Waktu 21.45 itu panggung.'],
      function () { addEv('B3'); updHud(); }]);
    } else {
      say([['Raka', 'Jam berdiri ini retak dan bandulnya berhenti di 21.45. Semua orang menyimpulkan Arga tewas pada jam itu.'], ['Raka', 'Aneh. Rasanya masih ada yang mengganjal dengan dentang malam tadi...']]);
    }
  });
  hs('musik', 'tkp_lantai', 'Jenazah Pak Arga', function () {
    say([['', 'Pak Arga terbaring menelungkup di atas karpet. Darah menggenang di dekat kepalanya.'], ['Raka', 'Satu luka tusuk di sisi leher. Tak ada tanda perlawanan di tangannya.'], ['Raka', 'Pembuka surat perak miliknya, yang biasa di meja kerja, tidak ada di sini.']], function () { S.f.body = true; });
  });
  hs('musik', 'gramofon', 'Gramofon', function () { say([['Raka', 'Piringan hitam sudah sampai alur terakhir. Musik sekeras ini bisa menelan suara pertengkaran.']]); });
  hs('musik', 'piano', 'Piano besar', function () { say([['Raka', 'Teh di atas piano belum disentuh, sudah dingin. Sari mengantarnya sekitar pukul sembilan, saat Arga masih hidup.']]); });
  hs('musik', 'lemari', 'Lemari partitur', function () { say([['Raka', 'Partitur dan piringan hitam tersusun rapi. Tak ada yang bergeser.']]); });
  // Kerja
  ex('kerja', 'aula', 'Aula', 'aula');
  hs('kerja', 'tatakan', 'Tatakan pena', function () { say([['Raka', 'Tatakan di meja ini kosong, ada bekas lekuk memanjang. Di sinilah pembuka surat perak itu biasa diletakkan.']], function () { S.f.tatakan = true; }); });
  hs('kerja', 'map_audit', 'Map dan memo di meja', function () { say([['', 'Map krem bertulis “AUDIT MJC” dengan stempel merah. Di dalamnya ada memo tulisan tangan Arga.'], ['Arga (memo)', 'MJC tak punya alamat, tak punya karyawan. Semua pembayaran vendor disetujui bagian keuangan. Periksa besok bersama R.'], ['Raka', 'Bagian keuangan Mawar Karya dipimpin Bima. Arga sudah tahu sesuatu.'], function () { addEv('B6'); }]); });
  hs('kerja', 'brankas', 'Brankas dinding', function () { say([['Raka', 'Pintu brankas terbuka lebar. Engselnya utuh, tak ada bekas congkelan. Rak “Buku Besar” kosong.'], ['Raka', 'Pelaku membuka dengan kode, lalu membawa buku besar.'], function () { addEv('B4'); }]); });
  hs('kerja', 'arsip', 'Lemari arsip', function () { say([['Raka', 'Faktur lama Mawar Karya. Tidak ada yang diacak. Pelaku tahu persis apa yang dicarinya.']]); });
  hs('kerja', 'meja', 'Meja kerja', function () { say([['Raka', 'Agenda Arga masih terbuka: “Besok 08.00 — Raka, audit MJC.” Ia sudah menyiapkan semuanya.']]); });
  // Dapur
  ex('dapur', 'aula', 'Aula', 'aula');
  ex('dapur', 'gudang', 'Pintu belakang ke Gudang', 'gudang', function () { return !!S.f.p1; });
  hs('dapur', 'jendela_dapur', 'Jendela dapur', function () { say([['Raka', 'Jendela ini menghadap halaman belakang. Dari sini pintu gudang terlihat jelas, bahkan di tengah hujan.']]); });
  hs('dapur', 'kompor', 'Kompor', function () { say([['Raka', 'Panci cokelat panas di atas kompor. Sari menyiapkannya sekitar jam sembilan lewat.']]); });
  hs('dapur', 'kursi_naya', 'Kursi Naya', function () { say([['Raka', 'Kursi tempat Naya duduk tadi. Cangkirnya setengah penuh.']]); });
  hs('dapur', 'meja_makan', 'Meja makan', function () {
    if (card2Ready() && !S.f.p2) { say([['', 'Di bawah piring cokelat, ada kartu dengan gambar bunga bertangkai dua kelopak.']], function () { openPuz('p2'); }); }
    else if (S.f.p2) { say([['Raka', 'Kartu itu sudah kubuka: “Jam Musik Bohong”.']]); }
    else say([['Raka', 'Dua cangkir cokelat tersisa di meja. Bima dan Naya sempat duduk di sini.']]);
  });
  // Lorong
  ex('lorong', 'aula', 'Aula', 'aula');
  hs('lorong', 'rak_sepatu', 'Rak sepatu', function () {
    if (!S.ev.B7) { say([['Raka', 'Rak sepatu: bot karet berlumpur, sepatu kets, dan pantofel hitam. Belum ada alasan untuk memeriksanya.']]); return; }
    say([['Raka', 'Pantofel hitam Bima. Sol licin, tumit kiri aus, dan menempel tanah merah. Persis jejak di gudang.'], ['Raka', 'Padahal Bima kini bersandal. Sepatu ini dilepas dengan tergesa.'], function () { addEv('B8'); }]);
  });
  hs('lorong', 'pintu_naya', 'Pintu kamar Naya', function () { say([['Raka', 'Kamar Naya. Tak ada alasan untuk masuk.']]); });
  hs('lorong', 'pintu_bima', 'Pintu kamar Bima', function () { say([['Raka', 'Kamar Bima, terkunci. Tanpa surat perintah, aku tidak akan membukanya.']]); });
  hs('lorong', 'ranjang', 'Ranjang', function () { say([['Raka', 'Ranjangku. Buku catatan sudah di bantal.']]); });
  hs('lorong', 'koper', 'Koper Raka', function () {
    if (S.f.letter) { say([['Raka', 'Surat Arga sudah kubaca. Aturan Sandi Mawar ada di Catatan.']]); return; }
    say([['', 'Di balik pakaian, sebuah amplop dengan tulisan tangan Arga.'],
    ['Surat Arga', 'Raka, bila ada pesan angka dari orang di villa ini, pesan itu dari orang yang kupercaya. Kami menyebutnya Sandi Mawar.'],
    ['Surat Arga', 'Huruf kapital A–Z bernilai 1–26. Huruf kecil a–z bernilai −1 sampai −26. Spasi bernilai 0.'],
    ['Surat Arga', 'Lapisan pertama: tiap nilai x dikunci dengan f(x) = 5x − 1.'],
    ['Surat Arga', 'Bila kartu bergambar bunga bertangkai dua kelopak, ada lapisan kedua g(x) = 2x − 3 yang dikerjakan setelah f.'],
    ['Raka', 'Arga, kau sudah menyiapkan semuanya, tapi tidak sempat menyelamatkan dirimu sendiri.'],
    function () { S.f.letter = true; toast('Aturan sandi ditambahkan ke Catatan', ASSETS.p_surat_arga); }]);
  });
  hs('lorong', 'nampan_teh', 'Nampan teh', function () {
    if (!(S.f.v_musik && S.f.v_kerja)) { say([['Raka', 'Nampan teh kosong. Aku belum selesai memeriksa TKP.']]); return; }
    if (S.f.p1) { say([['Raka', 'Kartu pertama sudah kubuka: “Pelaku Ada Di Gudang”.']]); return; }
    if (!S.f.letter) { say([['', 'Di bawah cangkir ada kartu penuh angka. Tak ada nama.'], ['Raka', 'Angka-angka ini pasti sandi. Mungkin ada petunjuk di koperku.']]); return; }
    say([['', 'Di bawah cangkir ada kartu penuh angka, tulisan tangan perempuan.']], function () { openPuz('p1'); });
  });
  // Gudang
  ex('gudang', 'dapur_makan', 'Dapur', 'dapur');
  function gudangCheck() { if (S.ev.B5 && S.ev.B7 && S.ev.B9 && S.ev.B10 && !S.f.dimas_scene) dimasScene(); }
  hs('gudang', 'jejak_sepatu', 'Jejak di lantai', function () { say([['Raka', 'Jejak lumpur merah dari pintu belakang. Sol licin, tumit kiri aus, bukan bot dan bukan kets.'], function () { addEv('B7'); }], gudangCheck); });
  hs('gudang', 'drum', 'Drum sampah', function () { say([['Raka', 'Di dasar drum ada sisa kertas terbakar. Masih terbaca kolom angka dan tiga huruf: M J C.'], ['Raka', 'Halaman buku besar. Dibakar dengan buru-buru.'], function () { addEv('B5'); }], gudangCheck); });
  hs('gudang', 'kotak_perkakas', 'Kotak perkakas', function () { say([['', 'Kotak perkakas Dimas tidak dikunci. Di bawah gulungan kabel tergeletak pembuka surat perak, berdarah.'], ['Raka', 'Tak ada jejak bot di sekitar kotak ini. Hanya jejak sepatu licin tadi.'], function () { addEv('B9'); }], gudangCheck); });
  hs('gudang', 'balik_peti', 'Peti kayu', function () { say([['', 'Di balik peti tersembunyi jas hujan hitam berkerudung, basah dan berdarah di lengan. Labelnya: TAMU.'], ['Raka', 'Ini jas hujan cadangan untuk tamu, bukan milik Dimas. Pelaku memakainya agar bajunya tidak terkena darah.'], function () { addEv('B10'); }], gudangCheck); });
  hs('gudang', 'jendela_gudang', 'Jendela gudang', function () { say([['Raka', 'Dari jendela ini jendela dapur terlihat jelas. Siapa pun yang ke gudang bisa dilihat dari dapur.']]); });

  /* ---------- NPC ---------- */
  function npcList() {
    var r = S.room, f = S.f, o = [];
    if (!f.intro_done) return o;
    if (S.dawn && r === 'musik') { o.push({ id: 'sari', x: 84 }, { id: 'naya', x: 114 }, { id: 'dimas', x: 144 }, { id: 'bima', x: 174 }); return o; }
    if (r === 'dapur') o.push({ id: 'sari', x: 118 });
    if (f.discovered) {
      if (r === 'aula') { o.push({ id: 'naya', x: 132 }); o.push({ id: 'bima', x: 176 }); if (!f.locked) o.push({ id: 'dimas', x: 296 }); }
      if (r === 'gudang' && f.locked) o.push({ id: 'dimas', x: 140 });
    }
    return o;
  }
  var TOPICS = {
    sari: function () {
      var t = [];
      if (!S.f.p2) { return [{ t: 'Tanya soal malam ini', lines: [['Sari', 'Maaf, Pak, saya... banyak kerjaan. Saya tidak melihat apa-apa.', 'terpejam'], ['', 'Sari menghindari tatapan Raka. Tangannya gemetar.']] }]; }
      if (!S.ev.B11) t.push({
        t: '“Jam Musik Bohong.” Apa yang kau lihat?', lines: [
          ['Sari', 'Pak... saya tidak berani menyebut nama. Saya hanya melihat.'],
          function () { S.fb = { t: 0, dur: 3.2, kind: 'run' }; },
          ['Sari', 'Sehabis dentang seperempat jam sembilan, dari jendela dapur saya lihat orang berjas hujan hitam, kerudungnya menutup muka, berlari ke gudang membawa sesuatu. Sepatunya mengilap kena kilat.'],
          ['Sari', 'Setengah sepuluh lewat sedikit, saya sajikan cokelat untuk Mbak Naya dan Pak Bima. Jaket Pak Bima bau asap, dan dia sudah bersandal.'],
          ['Raka', 'Kenapa tidak langsung bilang?'],
          ['Sari', 'Saya takut dia tahu saya melihat. Dan saya sempat mengira Mas Dimas, dia suka jas hujan hitam. Saya tidak mau salah menuduh.', 'terkejut'],
          ['Raka', 'Dimas memakai jas hujan bernama dan sedang di pos jaga saat itu. Kartumu menyelamatkan banyak orang.'],
          function () { if (!S.f.protect) say2([['Sari', 'Tadi Pak Bima menatap saya lama sekali, Pak.', 'terpejam']]); },
          function () { addEv('B11'); updHud(); }]
      });
      else t.push({ t: 'Tanya lagi', lines: [['Sari', 'Saya sudah katakan semua yang saya lihat, Pak. Tolong selesaikan ini sebelum jalan dibuka.']] });
      return t;
    },
    dimas: function () {
      var f = S.f, t = [];
      t.push({ t: 'Tanya alibi', lines: [['Dimas', 'Saya di pos jaga sejak jam delapan, Pak, memantau longsor. Bapak sendiri yang terima telepon saya jam sembilan dan jam sembilan lewat empat belas.'], ['Raka', 'Benar. Interkom hanya tersambung ke pos. Setelah itu?'], ['Dimas', 'Tetap di pos sampai 21.35. Lalu jalan pulang. Tidak ada yang melihat.'], function () { f.t_dimas = true; addEv('B1'); extra('B1', 'Dimas masih di pos pukul 21.14. Tidak mungkin ia di Ruang Musik atau gudang sekitar 21.15–21.25.'); }] });
      t.push({ t: 'Tanya soal brankas', lines: [['Dimas', 'Kodenya cuma Pak Arga, Pak Bima, dan saya yang tahu. Saya pernah ambil dokumen waktu Pak Arga sakit. Sejak itu tidak pernah saya sentuh.'], function () { f.dimas_code = true; extra('B4', 'Kode brankas hanya diketahui Arga, Bima, dan Dimas (Naya mengaku tidak tahu).'); }] });
      if (f.dimas_scene) t.push({ t: 'Soal solar yang hilang', lines: [['Dimas', '...Maaf, Pak. Saya jual sedikit solar villa buat obat ibu. Pak Arga sudah menegur saya. Tapi saya tidak membunuhnya.', 'terpejam'], ['Raka', 'Aku percaya soal itu. Tapi jangan bohong lagi.'], function () { f.dimas_solar = true; }] });
      if (f.dimas_scene) t.push({ t: 'Soal jas hujan', lines: [['Dimas', 'Jas hujan saya ini ada nama saya di kantongnya, Pak. Yang TAMU, saya tidak pernah pakai.'], function () { extra('B10', 'Dimas memperlihatkan jas hujan miliknya yang bernama.'); }] });
      if (f.dimas_scene && !f.locked) t.push({ t: 'Tanya soal tangga belakang', lines: [['Dimas', 'Waktu pulang dari pos, tangga belakang sudah ada tanah merah. Bekasnya licin, bukan tapak bot. Saya kira tamu.'], function () { extra('B7', 'Dimas melihat jejak licin berlumpur merah di tangga belakang sebelum ia sampai.'); }] });
      return t;
    },
    naya: function () {
      var f = S.f, t = [];
      t.push({ t: 'Tanya alibi', lines: [['Naya', 'Aku di kamar atas sejak makan malam. Turun jam setengah sepuluh. Bima turun beberapa menit sesudahku, lalu kami minum cokelat.'], function () { f.t_naya = true; }] });
      t.push({ t: 'Tentang pertengkaran', lines: [['Naya', 'Paman mau menjual villa ini. Itu rumah Ibu! Aku bilang dia akan menyesal. Tapi bukan begitu maksudku, Raka.', 'terpejam']] });
      t.push({
        t: 'Tanya soal dentang jam', lines: [['Naya', 'Aku sering menghitung dentang jam itu kalau tak bisa tidur. Malam ini dentang terakhir yang kudengar seperempat lewat sembilan. Setelah itu sunyi.'], ['Raka', 'Tak ada dentang setengah sepuluh? Tak ada dentang 21.45?'], ['Naya', 'Tidak. Aku yakin.'], function () { addEv('B2'); extra('B2', 'Naya: setelah dentang 21.15 tak ada lagi dentang. Jam berhenti sebelum 21.30, bukan 21.45.'); f.naya_chime = true; }]
      });
      t.push({ t: 'Tanya soal brankas', lines: [['Naya', 'Brankas? Aku bahkan tidak tahu ada kodenya.'], function () { f.naya_code = true; extra('B4', 'Naya mengaku tidak tahu kode brankas.'); }] });
      if (S.ev.B6 && !f.naya_conf) t.push({ t: 'Tanya soal Ruang Kerja (tunjukkan map audit)', lines: [['Naya', 'Baik... aku masuk ke sana jam tujuh empat puluh lima. Mencari sertifikat villa. Brankasnya masih tertutup dan ada map “Audit MJC” di meja.', 'terkejut'], ['Naya', 'Aku takut dituduh, jadi aku bohong. Maaf.', 'terpejam'], function () { f.naya_conf = true; extra('B4', 'Naya melihat brankas masih tertutup pukul 19.45. Buku besar belum hilang saat itu.'); }] });
      else if (!S.ev.B6) t.push({ t: 'Tanya soal Ruang Kerja', lines: [['Naya', 'Aku tidak pernah masuk ke sana. Tidak malam ini.']] });
      return t;
    },
    bima: function () {
      var f = S.f, t = [];
      t.push({ t: 'Tanya alibi', lines: [['Bima', 'Aku di kamar sejak jam sembilan kurang, membaca laporan. Setengah sepuluh aku turun dan minum cokelat bersama Naya. Sari yang menyajikan. Jam musik berhenti 21.45, dan saat itu aku jelas bersama mereka.'], function () { f.t_bima = true; }] });
      t.push({ t: 'Tentang Pak Arga dan keuangan', lines: [['Bima', 'Kami berdua mendirikan Mawar Karya. Aku direktur keuangan. Kalau ada yang bilang uang hilang, itu salah paham.'], ['Raka', 'Aku belum bilang uang hilang.'], ['Bima', '...Arga sudah mengumumkan di meja makan. Semua tahu.', 'terkejut']] });
      t.push({ t: 'Tentang jam musik', lines: [['Bima', 'Jam itu patokan seluruh villa. Semua menyetel jam tangan padanya. Kalau berhenti 21.45, ya 21.45.']] });
      if (f.dimas_scene) t.push({ t: 'Tentang Dimas', lines: [['Bima', 'Aku tak mau menuduh. Tapi dia pegang kunci induk, pembuka surat itu di kotaknya, dan ia sendirian pukul 21.45.']] });
      if (S.ev.B8 && !f.bima_shoes) t.push({ t: 'Tanya soal pantofelnya', lines: [['Bima', 'Sepatuku kotor karena tadi sore aku ke mobil.'], ['Raka', 'Halaman depan berpaving beton. Tanah merah hanya di belakang, dekat gudang.'], ['Bima', '...Aku juga sempat ke belakang mencari sinyal.', 'terkejut'], ['Raka', 'Sinyal mati sejak jam delapan, Bima.'], function () { f.bima_shoes = true; }] });
      return t;
    }
  };
  function talk(id) {
    var nm = NAME[id];
    if (id === 'bima' && S.f.dimas_scene && !S.f.bima_card) {
      S.f.bima_card = true;
      say([['Bima', 'Raka, tadi kulihat Sari mondar-mandir ke kamarmu. Dia menyelipkan sesuatu?'],
      {
        ask: {
          q: 'Bagaimana Raka menjawab?', opts: [
            { t: '“Tidak ada apa-apa.” (lindungi Sari)', fx: function () { S.f.protect = true; }, lines: [['Raka', 'Tidak ada apa-apa. Kamarku bersih.'], ['Bima', 'Hm. Baiklah.']] },
            { t: '“Ada kartu dari Sari. Isinya sandi.”', fx: function () { S.f.protect = false; }, lines: [['Raka', 'Ada kartu dari Sari. Isinya sandi.'], ['Bima', 'Sandi? Menarik sekali.'], ['', 'Sorot mata Bima berpindah ke arah dapur.']] }]
        }
      }],
        function () { talk(id); });
      return;
    }
    menu(id, nm);
  }
  function menu(id, name) {
    var tp = TOPICS[id](), opts = [];
    tp.forEach(function (x) { opts.push({ t: x.t, lines: x.lines, back: function () { menu(id, name); } }); });
    opts.push({ t: 'Selesai', lines: [] });
    say([{ ask: { who: name, q: 'Mau bertanya apa?', opts: opts } }]);
  }

  /* ---------- cerita ---------- */
  function setTime(t) { S.time = t; updHud(); }
  function intro() {
    S.started = true; S.room = 'dapur'; S.memory = true; setTime('19.00'); S.f.v_dapur = true;
    say([['', 'Villa Mawar, 19.00. Makan malam. Hujan sudah turun sejak sore.'],
    ['Pak Arga', 'Terima kasih sudah datang. Besok pagi ada keputusan penting soal keuangan Mawar Karya, dan soal villa ini.'],
    ['Naya', 'Soal villa? Paman tidak berhak menjualnya! Itu rumah Ibu!', 'terkejut'],
    ['', 'Naya meninggalkan meja. Bima, direktur keuangan Mawar Karya, berhenti mengaduk kopinya. Pantofel hitamnya mengilap di bawah lampu.'],
    ['Bima', 'Arga, bicarakan nanti saja. Jangan di depan tamu.'],
    ['', 'Raka, yang diperkenalkan sebagai “teman lama”, hanya mengamati. Pukul 20.00 longsor menutup jalan. Sinyal telepon ikut lenyap.']
    ], function () {
      S.memory = false; S.room = 'aula'; S.x = 96; S.f.v_aula = true; S.fade = 1; setTime('20.55');
      S.sari = { x: 150 };
      say([['', 'Aula Villa Mawar. Hujan menghantam jendela. Sari datang membawa nampan.'],
      ['Sari', 'Teh hangat untuk Bapak. Satu lagi untuk Pak Arga di ruang musik. Beliau minta tidak diganggu.'],
      ['Raka', 'Terima kasih, Sari. Kau kelihatan pucat.'],
      ['Sari', 'Cuma hujannya, Pak. ... Bapak benar-benar hanya teman lama Pak Arga?'],
      ['Raka', 'Kenapa kau bertanya?'],
      ['Sari', 'Beliau pernah bilang, kalau ada apa-apa saya boleh percaya pada Bapak. Permisi.', 'terpejam'],
      function () { S.sari = null; setTime('21.00'); S.callOn = true; },
      ['', 'Jam di Ruang Musik berdentang sembilan kali. Interkom berdering.'],
      ['Dimas (interkom)', 'Dimas dari pos jaga, Pak. Longsor kedua di tikungan dua. Mobil tidak akan bisa lewat sampai subuh.'],
      ['Raka', 'Kau tetap di pos?'],
      ['Dimas (interkom)', 'Siap. Saya pantau sampai air surut. Nanti saya telepon lagi.'],
      function () { addEv('B1'); S.callOn = false; },
      function () { setTime('21.14'); S.callOn = true; },
      ['', 'Interkom berdering lagi.'],
      ['Dimas (interkom)', 'Pak, tikungan satu ikut longsor. Saya masih di pos.'],
      function () { S.callOn = false; },
      ['', 'Dari ruang sebelah, jam berdentang sekali. Seperempat lewat sembilan. Raka kembali ke kamarnya dan membaca.'],
      function () { addEv('B2'); setTime('22.05'); S.x = 96; },
      ['', '22.05. Sebuah teriakan memecah malam, dari arah Ruang Musik.'],
      ['Raka', 'Naya!', 'terkejut'],
      function () { S.f.discovered = true; S.f.intro_done = true; S.fade = 1; },
      ['', 'Satu per satu penghuni berkumpul di Aula. Raka mengungkap jati dirinya: seorang detektif, diundang Pak Arga. Tak seorang pun boleh meninggalkan villa.'],
      ['Raka', 'Aku akan memeriksa Ruang Musik. Jangan ada yang menyentuh apa pun.']
      ], function () { toast('Buka Catatan untuk melihat bukti dan aturan sandi'); updHud(); });
    });
  }
  S.f.intro_done = false;
  function card2Ready() { var f = S.f; return f.dimas_scene && f.t_bima && f.t_naya && f.t_dimas && S.ev.B8; }
  function afterP1() {
    setTime('23.10'); S.f.p1 = true;
    say([['Raka', '“Pelaku Ada Di Gudang.” Siapa pun yang menulis ini tahu Sandi Mawar. Hanya Arga yang mengajarkannya.'], ['Raka', 'Gudang ada di belakang dapur. Aku harus ke sana, tapi sebaiknya jangan bilang siapa-siapa.']], updHud);
  }
  function afterP2() {
    setTime('03.30'); S.f.p2 = true;
    say([['Raka', '“Jam Musik Bohong.” Jam yang berhenti di 21.45 itu... Aku harus memeriksanya ulang, dan Sari tahu sesuatu.']], updHud);
  }
  function dimasScene() {
    S.f.dimas_scene = true;
    say([['', 'Pintu gudang berderit. Dimas berdiri di ambang, basah kuyup.'],
    ['Dimas', 'Pak Raka? Gudang ini... ada apa, Pak?'],
    ['Raka', 'Pembuka surat perak milik Pak Arga, berdarah, di kotak perkakasmu.'],
    ['Dimas', 'Bukan saya, Pak! Demi Tuhan, saya tidak pernah menyentuhnya!', 'terkejut'],
    ['Bima', 'Sudah cukup jelas, Raka. Dia pegang kunci semua ruangan dan sendirian pukul 21.45. Kurung dia sampai badai reda.'],
    {
      ask: {
        q: 'Apa keputusan Raka?', opts: [
          { t: 'Kurung Dimas di gudang sampai badai reda.', fx: function () { S.f.locked = true; }, lines: [['Dimas', 'Saya tidak bersalah, Pak... tapi saya ikuti.', 'terpejam'], ['Bima', 'Bagus.']] },
          { t: 'Percayai Dimas dan selidiki lebih jauh.', fx: function () { S.f.trust = true; }, lines: [['Dimas', 'Terima kasih, Pak. Saya akan membantu apa saja.'], ['Raka', 'Tetap di dekat Aula. Jangan ke mana-mana.']] },
          { t: 'Tuduh Dimas sekarang.', lines: [function () { ending('rush'); }] }]
      }
    },
    function () { if (!S.ending) { setTime('23.40'); updHud(); } }
    ]);
  }
  function finale() {
    S.dawn = true; go('musik', 'aula'); S.x = 52; setTime('05.10');
    say([['', 'Hujan menipis. Di kejauhan terdengar alat berat membuka jalan. Semua penghuni berdiri di Ruang Musik.'],
    ['Raka', 'Aku tahu apa yang terjadi di ruangan ini. Dengarkan sampai selesai.'],
    function () { S.fb = { t: 0, dur: 7, kind: 'attack' }; },
    ['', 'Rekonstruksi. Pukul 21.08, sosok berjas hujan TAMU masuk dari lorong, saat piringan hitam masih berputar. Arga ditikam. Suara tertutup musik dan hujan.'],
    ['', 'Ia ke gudang, membakar buku besar, menaruh pembuka surat di kotak Dimas, lalu kembali pukul 21.27. Ia memecahkan kaca jam, menghentikan bandulnya, dan memutar jarum ke 21.45.'],
    ['', 'Lima menit kemudian ia tampil di ruang makan dengan sandal, bersama dua saksi yang tak tahu mereka sedang dipakai.'],
    {
      ask: {
        who: 'Raka', q: 'Pelakunya adalah...', opts: [
          { t: 'Dimas', lines: [function () { ending('wrong', 'Dimas'); }] },
          { t: 'Naya', lines: [function () { ending('wrong', 'Naya'); }] },
          { t: 'Bima', lines: [function () { openBoard(); }] }]
      }
    }
    ]);
  }

  /* ---------- puzzle UI ---------- */
  var curP = null;
  function openPuz(id) {
    var P = PUZ[id]; curP = { id: id, P: P, hint: 0, cipher: enc(P.msg, P.fn), solved: false };
    var c = $('puzCard'); c.innerHTML = '';
    var h = document.createElement('h2'); h.textContent = P.title; c.appendChild(h);
    var im = document.createElement('img'); im.className = 'cardimg'; im.src = ASSETS[P.img]; im.alt = 'Kartu sandi berisi deretan angka'; c.appendChild(im);
    var p = document.createElement('p'); p.className = 'muted'; p.innerHTML = 'Aturan: <span style="font-family:var(--f-mono);color:var(--amber)">' + P.rule + '</span>. Cari nilai asli <b>x</b> tiap angka, lalu baca hurufnya.'; c.appendChild(p);
    var cip = document.createElement('div'); cip.className = 'cipher'; cip.id = 'cipher'; c.appendChild(cip);
    var msg = Array.from(P.msg), wordEl = null;
    msg.forEach(function (ch, i) {
      var y = curP.cipher[i];
      if (!wordEl || ch === ' ') { wordEl = document.createElement('div'); wordEl.className = 'word'; cip.appendChild(wordEl); }
      var chip = document.createElement('div'); chip.className = 'chip' + (ch === ' ' ? ' sp' : ''); chip.dataset.i = i;
      chip.innerHTML = '<span class="y">' + y + '</span><input type="text" inputmode="numeric" autocomplete="off" aria-label="nilai x untuk angka ' + y + '"><span class="ch"></span><span class="vf"></span>';
      wordEl.appendChild(chip);
      if (ch === ' ') wordEl = null;
      chip.querySelector('input').addEventListener('input', function () { chk(chip, i); });
    });
    var res = document.createElement('div'); res.id = 'puzRes'; c.appendChild(res);
    var calc = document.createElement('div'); calc.className = 'calc';
    calc.innerHTML = '<b>Kalkulator sandi</b><div class="row"><select id="cSel" aria-label="Fungsi"></select><input id="cY" type="text" inputmode="numeric" placeholder="angka y" aria-label="angka y"><button type="button" id="cGo">Hitung</button></div><div class="res" id="cRes"></div>';
    c.appendChild(calc);
    P.calcs.forEach(function (k, i) { var o = document.createElement('option'); o.value = i; o.textContent = k.n; calc.querySelector('#cSel').appendChild(o); });
    calc.querySelector('#cGo').addEventListener('click', function () {
      var y = parseNum(calc.querySelector('#cY').value), r = calc.querySelector('#cRes');
      if (y === null) { r.textContent = 'Masukkan sebuah bilangan bulat.'; return; }
      var v = P.calcs[calc.querySelector('#cSel').value].fn(y), vv = Math.round(v * 1e4) / 1e4;
      if (Number.isInteger(vv) && Math.abs(vv) <= 26) r.textContent = 'x = ' + vv + (vv === 0 ? '  → spasi' : '  → huruf “' + chr(vv) + '”');
      else if (Number.isInteger(vv)) r.textContent = 'x = ' + vv + '. Bilangan bulat, tetapi di luar −26…26, bukan huruf.';
      else r.textContent = 'x = ' + vv + '. Pecahan: tidak mungkin sebuah huruf.' + (curP.id === 'p2' ? ' Mungkin ada lapisan kedua (bunga dua kelopak).' : '');
    });
    var d = document.createElement('details'); d.innerHTML = '<summary>Tabel Sandi Mawar</summary>';
    var tw = document.createElement('div'); tw.className = 'mapwrap'; var tb = '<table class="map"><tr>';
    for (var a = 1; a <= 26; a++)tb += '<td>' + String.fromCharCode(64 + a) + '<br>' + a + '</td>'; tb += '</tr><tr>';
    for (a = 1; a <= 26; a++)tb += '<td>' + String.fromCharCode(96 + a) + '<br>−' + a + '</td>'; tb += '</tr></table><p class="muted" style="margin-top:6px">Spasi = 0</p>';
    tw.innerHTML = tb; d.appendChild(tw); c.appendChild(d);
    var hint = document.createElement('div'); hint.id = 'hintBox'; hint.className = 'muted';
    var row = document.createElement('div'); row.className = 'row';
    var hb = document.createElement('button'); hb.type = 'button'; hb.id = 'hintBtn'; hb.textContent = 'Petunjuk (0/3)';
    hb.addEventListener('click', function () { if (curP.hint >= 3) return; curP.hint++; hb.textContent = 'Petunjuk (' + curP.hint + '/3)'; hint.innerHTML += '<p>' + curP.hint + '. ' + P.hints[curP.hint - 1] + '</p>'; if (curP.id === 'p2' && curP.hint >= 2) showVf(); });
    var cl = document.createElement('button'); cl.type = 'button'; cl.textContent = 'Simpan dan tutup'; cl.addEventListener('click', function () { $('mPuz').hidden = true; });
    row.appendChild(hb); row.appendChild(cl); c.appendChild(row); c.appendChild(hint);
    $('mPuz').hidden = false;
  }
  function parseNum(s) {
    s = String(s).replace(/[−–—]/g, '-').trim();
    if (!/^-?\d+$/.test(s)) {
      if (s.length === 1 && ((s >= 'A' && s <= 'Z') || (s >= 'a' && s <= 'z') || s === ' ')) {
        return val(s);
      }
      return null;
    }
    return parseInt(s, 10);
  }
  function showVf() { curP.vf = true; Array.prototype.forEach.call(document.querySelectorAll('#cipher .chip'), function (c) { var inp = c.querySelector('input'); if (inp.value) chk(c, +c.dataset.i); }); }
  function chk(chip, i) {
    var P = curP.P, inp = chip.querySelector('input'), x = parseNum(inp.value), ch = chip.querySelector('.ch'), vf = chip.querySelector('.vf');
    chip.classList.remove('ok', 'bad'); ch.textContent = ''; vf.textContent = '';
    if (x === null) { if (inp.value.trim()) chip.classList.add('bad'); finishCheck(); return; }
    var okv = P.fn(x) === curP.cipher[i];
    if (Math.abs(x) <= 26) ch.textContent = x === 0 ? '␣' : chr(x);
    chip.classList.add(okv ? 'ok' : 'bad');
    if (curP.id === 'p1' || curP.vf) vf.textContent = '→' + P.fn(x);
    finishCheck();
  }
  function finishCheck() {
    if (curP.solved) return;
    var chips = document.querySelectorAll('#cipher .chip'), all = true;
    Array.prototype.forEach.call(chips, function (c) { if (!c.classList.contains('ok')) all = false; });
    if (all) {
      curP.solved = true; var r = $('puzRes'); r.className = 'solved';
      r.innerHTML = '<div class="muted">Pesan terbuka</div><div class="msg"></div>'; r.querySelector('.msg').textContent = '“' + curP.P.msg + '”';
      var b = document.createElement('button'); b.type = 'button'; b.className = 'primary'; b.textContent = 'Lanjutkan'; b.style.marginTop = '10px';
      b.addEventListener('click', function () { $('mPuz').hidden = true; var id = curP.id; if (id === 'p1') afterP1(); else afterP2(); });
      r.appendChild(b);
    }
  }

  /* ---------- catatan ---------- */
  var tab = 'bukti';
  function renderNote() {
    var c = $('noteCard'); c.innerHTML = '';
    var h = document.createElement('h2'); h.textContent = 'Buku Catatan Raka'; c.appendChild(h);
    var tabs = document.createElement('div'); tabs.className = 'tabs'; tabs.setAttribute('role', 'tablist');
    [['bukti', 'Bukti (' + Object.keys(S.ev).length + '/11)'], ['tersangka', 'Tersangka'], ['sandi', 'Aturan sandi']].forEach(function (t) {
      var b = document.createElement('button'); b.type = 'button'; b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', tab === t[0]); b.textContent = t[1]; b.addEventListener('click', function () { tab = t[0]; renderNote(); }); tabs.appendChild(b);
    });
    c.appendChild(tabs);
    var l = document.createElement('div'); l.className = 'list';
    if (tab === 'bukti') {
      var any = false;
      EVORDER.forEach(function (id) {
        if (!S.ev[id]) return; any = true;
        var e = document.createElement('div'); e.className = 'ev';
        var im = document.createElement('img'); im.className = 'th'; im.src = evSrc(id); im.alt = ''; e.appendChild(im);
        var bd = document.createElement('div'); bd.className = 'bd';
        var t = document.createElement('div'); t.innerHTML = '<span class="id">' + id + '</span><b></b>'; t.querySelector('b').textContent = EVD[id][0]; bd.appendChild(t);
        var p = document.createElement('div'); p.textContent = EVD[id][1]; bd.appendChild(p);
        S.ev[id].forEach(function (x) { var s = document.createElement('small'); s.textContent = '＋ ' + x; bd.appendChild(s); });
        e.appendChild(bd); l.appendChild(e);
      });
      if (!any) { l.innerHTML = '<p class="muted">Belum ada bukti. Periksa benda bertanda lup dan bicara dengan penghuni.</p>'; }
    } else if (tab === 'tersangka') {
      [['dimas', 'Dimas', 'Penjaga villa. Memegang kunci induk. Pernah ditegur Arga. Mengaku di pos jaga sampai 21.35.'],
      ['naya', 'Naya', 'Keponakan korban. Bertengkar soal penjualan villa. Mengaku di kamar atas sampai 21.30.'],
      ['bima', 'Bima', 'Direktur keuangan Mawar Karya, rekan bisnis korban. Mengaku di kamar, lalu bersama Naya dan Sari 21.30–22.05.'],
      ['sari', 'Sari', 'Pelayan. Saksi yang takut bicara. Bukan tersangka.']].forEach(function (x) {
        var e = document.createElement('div'); e.className = 'ev'; var im = document.createElement('img'); im.className = 'th'; im.src = ASSETS['por_' + x[0] + '_netral']; im.alt = ''; e.appendChild(im);
        var bd = document.createElement('div'); bd.innerHTML = '<b></b><span></span>'; bd.querySelector('b').textContent = x[1]; bd.querySelector('span').textContent = x[2]; e.appendChild(bd); l.appendChild(e);
      });
    } else {
      if (!S.f.letter) l.innerHTML = '<p class="muted">Belum ada. Surat Arga ada di koper Raka (Lorong).</p>';
      else l.innerHTML = '<div class="ev"><img class="th" src="' + ASSETS.p_surat_arga + '" alt=""><div class="bd"><b>Sandi Mawar</b><span>A–Z = 1–26. a–z = −1 sampai −26. Spasi = 0.</span><span>Lapisan 1: f(x) = 5x − 1, balikannya f⁻¹(y) = (y + 1) / 5.</span><span>Lapisan 2 (bunga dua kelopak): g(x) = 2x − 3, dikerjakan setelah f. (g∘f)(x) = g(f(x)).</span><span class="muted">Untuk membuka, kerjakan kebalikannya dengan urutan terbalik.</span></div></div>';
    }
    c.appendChild(l);
    var r = document.createElement('div'); r.className = 'row'; var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Tutup'; b.addEventListener('click', closeNote); r.appendChild(b); c.appendChild(r);
  }
  function openNote() { if (!S.started) return; renderNote(); $('mNote').hidden = false; }
  function closeNote() { if ($('mNote').hidden) return; $('mNote').hidden = true; }
  $('bNote').addEventListener('click', function () { if ($('mNote').hidden) openNote(); else closeNote(); });
  $('bHelp').addEventListener('click', function () {
    if (!$('mHelp').hidden) { $('mHelp').hidden = true; return; }
    var c = $('helpCard'); c.innerHTML = '<h2>Cara bermain</h2><div class="list"><p>Berjalan ke kiri dan kanan. Dekati benda bertanda lup, pintu, atau orang, lalu tekan <b>Periksa</b>.</p><p>Bukti masuk otomatis ke <b>Catatan</b>. Bicaralah dengan semua orang, periksa semua ruangan, dan jangan percaya satu bukti saja.</p><p>Dua sandi akan muncul. Anda cukup membalik fungsi pada tiap angka. Kalkulator dan petunjuk disediakan.</p><p>Di akhir, Anda menyusun lima kesimpulan di Papan Bukti, masing-masing dengan dua bukti yang tepat. Semakin kuat, semakin baik akhir ceritanya.</p></div><div class="row"><button type="button" id="hx">Tutup</button></div>';
    $('mHelp').hidden = false;
    $('hx').addEventListener('click', function () { $('mHelp').hidden = true; });
  });

  /* ---------- papan bukti dan akhir ---------- */
  var PIL = [
    { t: 'Waktu 21.45 itu palsu. Arga tewas jauh lebih awal.', v: ['B2', 'B3'] },
    { t: 'Dimas tidak mungkin pelakunya.', v: ['B1', 'B7', 'B11'] },
    { t: 'Pelaku tahu isi brankas dan berkepentingan dengan buku besar (urusan keuangan).', v: ['B4', 'B5', 'B6'] },
    { t: 'Sepatu pelaku adalah sepatu Bima.', v: ['B7', 'B8'] },
    { t: 'Pelaku merencanakan, menjebak Dimas, dan membangun alibi.', v: ['B9', 'B10', 'B11'] }
  ];
  var BD = { sel: null, place: [] };
  function pct(v, t) { return (v / t * 100) + '%'; }
  function mkSlot(x, y, w, h, cls) { var b = document.createElement('button'); b.type = 'button'; b.className = 'slot ' + (cls || ''); b.style.left = pct(x, 384); b.style.top = pct(y, 216); b.style.width = pct(w, 384); b.style.height = pct(h, 216); return b; }
  function renderBoard() {
    var bd = $('bdBoard'); bd.innerHTML = '';
    EVORDER.forEach(function (id, i) {
      var p = BOARDJ.bukti_slots_xy_44x50[i], have = !!S.ev[id];
      var b = mkSlot(p[0] - 1, p[1] - 1, 46, 52, have ? '' : 'empty');
      if (have) {
        var fr = document.createElement('img'); fr.className = 'fr'; fr.alt = ''; fr.src = ASSETS[BD.sel === id ? 'ui_slot_bukti_terpilih' : 'ui_slot_bukti_terisi']; b.appendChild(fr);
        var pr = document.createElement('img'); pr.className = 'pr'; pr.alt = ''; pr.src = evSrc(id); b.appendChild(pr);
        b.setAttribute('aria-label', id + ' ' + EVD[id][0] + (BD.sel === id ? ' (dipilih)' : '')); b.title = id + ' · ' + EVD[id][0];
        b.addEventListener('click', function () { BD.sel = (BD.sel === id ? null : id); info(id); renderBoard(); });
      } else { b.disabled = true; b.setAttribute('aria-label', id + ' belum ditemukan'); }
      bd.appendChild(b);
    });
    BOARDJ.kesimpulan_evidence_slots_xywh.forEach(function (pair, i) {
      pair.forEach(function (r, j) {
        var cur = BD.place[i][j];
        var b = mkSlot(r[0], r[1], r[2], r[3], ''); b.style.background = cur ? 'rgba(232,218,180,.55)' : 'rgba(255,255,255,.0)'; b.style.outline = BD.sel && !cur ? '1px dashed #b4283f' : 'none';
        b.setAttribute('aria-label', 'Kesimpulan ' + (i + 1) + ', kotak ' + (j + 1) + (cur ? ': ' + cur : ': kosong'));
        if (cur) { var pr = document.createElement('img'); pr.className = 'pr'; pr.alt = ''; pr.src = evSrc(cur); b.appendChild(pr); b.title = cur + ' · ' + EVD[cur][0]; }
        b.addEventListener('click', function () {
          if (cur) { BD.place[i][j] = null; info(null); renderBoard(); return; }
          if (!BD.sel) { info(null, 'Pilih bukti di sisi kiri dulu.'); return; }
          if (BD.place[i][1 - j] === BD.sel) { info(null, 'Bukti yang sama tidak boleh dipakai dua kali untuk satu kesimpulan.'); return; }
          BD.place[i][j] = BD.sel; BD.sel = null; info(null); renderBoard();
        });
        bd.appendChild(b);
      });
    });
  }
  function info(id, msg) { $('bdInfo').textContent = id ? (id + ' · ' + EVD[id][0] + '. ' + EVD[id][1]) : (msg || ''); }
  function openBoard() {
    BD = { sel: null, place: PIL.map(function () { return [null, null]; }) };
    var c = $('boardCard'); c.innerHTML = '';
    var h = document.createElement('h2'); h.textContent = 'Papan Bukti'; c.appendChild(h);
    var p = document.createElement('p'); p.className = 'muted'; p.textContent = 'Tuduhan Anda: Bima. Klik satu bukti di sisi kiri, lalu klik salah satu kotak pada kartu kesimpulan di sisi kanan. Tiap kesimpulan butuh dua bukti yang berbeda dan tepat. Klik kotak yang terisi untuk mengosongkannya.'; c.appendChild(p);
    var bd = document.createElement('div'); bd.className = 'board'; bd.id = 'bdBoard'; bd.style.backgroundImage = 'url(' + ASSETS.ui_papan_bukti + ')'; c.appendChild(bd);
    var inf = document.createElement('div'); inf.id = 'bdInfo'; inf.setAttribute('aria-live', 'polite'); c.appendChild(inf);
    var kl = document.createElement('div'); kl.className = 'klist';
    PIL.forEach(function (pl, i) { var d = document.createElement('div'); d.innerHTML = '<b>K' + (i + 1) + '</b><span></span>'; d.querySelector('span').textContent = pl.t; kl.appendChild(d); });
    c.appendChild(kl);
    var r = document.createElement('div'); r.className = 'row';
    var go1 = document.createElement('button'); go1.type = 'button'; go1.className = 'primary'; go1.textContent = 'Ajukan tuduhan'; go1.addEventListener('click', submitBoard);
    var bk = document.createElement('button'); bk.type = 'button'; bk.textContent = 'Kembali menyelidiki'; bk.addEventListener('click', function () { $('mBoard').hidden = true; S.f.ready = true; });
    r.appendChild(go1); r.appendChild(bk); c.appendChild(r);
    renderBoard();
    $('mBoard').hidden = false;
  }
  function submitBoard() {
    var res = PIL.map(function (pl, i) { var a = BD.place[i][0], b = BD.place[i][1]; return !!(a && b && a !== b && pl.v.indexOf(a) >= 0 && pl.v.indexOf(b) >= 0); });
    var n = res.filter(Boolean).length;
    $('mBoard').hidden = true;
    ending(n >= 4 ? 'win' : (n >= 2 ? 'weak' : 'wrong'), 'Bima', res);
  }
  var ENDS = {
    win: { t: 'Sandi Terakhir', tag: 'Akhir 1 · Kebenaran terungkap', bg: 'bg_ruang_musik_subuh' },
    weak: { t: 'Bukti yang Tipis', tag: 'Akhir 2 · Kasus menggantung', bg: 'bg_ruang_musik_subuh' },
    wrong: { t: 'Mawar yang Salah', tag: 'Akhir 3 · Salah menuduh', bg: 'bg_ruang_musik_subuh' },
    rush: { t: 'Terlalu Cepat', tag: 'Akhir 3 · Salah menuduh', bg: 'bg_gudang' }
  };
  function ending(kind, who, res) {
    S.ending = kind; dlg.Q = []; dlg.active = false; setDlgIdle();
    var c = $('endCard'), E = ENDS[kind], body = [];
    if (kind === 'win') {
      body.push('Raka menaruh pantofel, pecahan kaca, dan arang buku besar di meja. Satu per satu kesimpulannya menutup semua jalan keluar Bima. Ia jatuh terduduk. “Aku hanya butuh waktu,” bisiknya.');
      body.push('Polisi tiba saat matahari terbit. Dimas bebas dan Naya meminta maaf kepadanya. Villa Mawar tidak jadi dijual.');
      body.push(S.f.protect ? 'Nama Sari tak pernah muncul di berita acara. Hanya Raka yang tahu siapa yang menyelamatkan kasus ini.' : 'Sari gemetar saat memberi kesaksian, tetapi Raka berdiri di sampingnya sampai selesai.');
      body.push('Di atas piano, Raka menemukan kartu terakhir dari Sari. Angka-angka itu tak lagi menakutkan.');
    } else if (kind === 'weak') {
      body.push('Bima bersandar tenang. “Dugaan, Raka. Bukan bukti.” Jam yang berhenti di 21.45 masih jadi patokan semua orang.');
      body.push('Polisi menahan Bima sehari, lalu melepasnya. Buku besar sudah jadi abu. Dimas tetap dicurigai dan kehilangan pekerjaannya. Villa dijual, dan Sari pulang ke kampung.');
      body.push('Raka masih menyimpan Buku Catatannya. Kasus ini belum tertutup, tetapi Anda boleh mencoba lagi dari Papan Bukti.');
    } else if (kind === 'rush') {
      body.push('Raka menuduh Dimas di gudang. Bima mengangguk puas. Dimas diborgol saat fajar, dan tak seorang pun menyelidiki jam di Ruang Musik.');
      body.push('Seminggu kemudian, sebuah kartu angka tiba untuk Raka, ditulis tangan Sari. Terlambat.');
    } else {
      body.push(who === 'Bima' ? 'Bima menangkis setiap kesimpulan Raka dengan tenang. Tanpa bukti yang saling mengunci, tuduhan itu runtuh di depan semua orang.' : who + ' ditahan, sementara pelaku sebenarnya tersenyum. Begitu jalan dibuka, Bima pergi.');
      body.push('Seminggu kemudian, sebuah kartu angka tiba untuk Raka, ditulis tangan Sari. Terlambat.');
    }
    c.innerHTML = '<img class="hero" alt="">'; c.querySelector('img').src = ASSETS[E.bg];
    var s = document.createElement('div'); s.className = 'sub'; s.textContent = E.tag; c.appendChild(s);
    var h2 = document.createElement('h2'); h2.textContent = E.t; c.appendChild(h2);
    var eb = document.createElement('div'); eb.className = 'list'; c.appendChild(eb);
    body.forEach(function (t) { var p = document.createElement('p'); p.textContent = t; eb.appendChild(p); });
    if (kind === 'wrong' || kind === 'rush') {
      var m = (who === 'Naya') ? 'Bukan Naya' : (kind === 'rush' || who === 'Dimas' ? 'Bukan Dimas' : 'Itu Bima');
      var q = document.createElement('div'); q.className = 'ev'; q.innerHTML = '<img class="th" alt="" src="' + ASSETS.p_kartu_sandi_1_x3 + '"><div class="bd"><b>Kartu terakhir Sari</b><span style="font-family:var(--f-mono);word-break:break-word"></span><small>Aturan: f(x) = 5x − 1. Bisa Anda baca?</small></div>';
      q.querySelector('span').textContent = enc(m, F).join(', '); eb.appendChild(q);
    }
    if (res) {
      var rl = document.createElement('div'); rl.className = 'list'; rl.innerHTML = '<h3>Kesimpulan Anda</h3>';
      res.forEach(function (ok, i) { var d = document.createElement('div'); d.className = 'res-line ' + (ok ? 'y' : 'n'); d.textContent = (ok ? '✓ ' : '✗ ') + PIL[i].t; rl.appendChild(d); }); eb.appendChild(rl);
    }
    var r = document.createElement('div'); r.className = 'row';
    if (kind === 'weak') { var b1 = document.createElement('button'); b1.type = 'button'; b1.textContent = 'Ulangi Papan Bukti'; b1.addEventListener('click', function () { $('mEnd').hidden = true; S.ending = null; openBoard(); }); r.appendChild(b1); }
    var b = document.createElement('button'); b.type = 'button'; b.className = 'primary'; b.textContent = 'Main lagi dari awal'; b.addEventListener('click', restart); r.appendChild(b);
    c.appendChild(r);
    $('mEnd').hidden = false;
  }
  function restart() { if (!$('mEnd').hidden) { $('mEnd').hidden = true; } newState(); updNote(); dlg.Q = []; dlg.active = false; setDlgIdle(); S.f.intro_done = false; intro(); }

  /* ---------- hud, input ---------- */
  function updHud() {
    $('clock').textContent = S.time; $('room').textContent = S.started ? '· ' + RN[S.room] : '';
    var f = S.f, o = '';
    if (!f.intro_done) o = '';
    else if (!f.v_musik) o = 'Periksa Ruang Musik (pintu paling kanan di Aula).';
    else if (!f.p1) { if (!f.v_kerja) o = 'Periksa Ruang Kerja dan tanyai para penghuni.'; else o = 'Ada yang menunggu di kamarmu: Aula → Lorong (kiri). Surat Arga ada di koper.'; }
    else if (!f.dimas_scene) o = 'Pesan terbuka. Pergi ke Gudang (Dapur → pintu belakang) dan periksa semuanya.';
    else if (!card2Ready()) o = 'Wawancarai Bima, Naya, dan Dimas, dan periksa rak sepatu di Lorong.';
    else if (!f.p2) o = 'Ada sesuatu di meja makan, Dapur.';
    else if (!(S.ev.B3 && S.ev.B11)) o = 'Periksa ulang jam di Ruang Musik dan bicara dengan Sari di Dapur.';
    else { o = 'Kumpulkan semua di Ruang Musik (pintu paling kanan di Aula) untuk konfrontasi akhir.'; f.ready = true; }
    $('obj').innerHTML = o ? '<b>Tujuan:</b> ' + o : '';
  }
  function busy() { return dlg.active || isModalOpen() || S.fade > .6 || !S.started || !!S.fb; }
  function near() {
    if (busy()) return null;
    var best = null, bd = 1e9;
    function chkR(r, o) { var l = r[0] - 6, rr = r[0] + r[2] + 6; if (S.x >= l && S.x <= rr) { var d = Math.abs(S.x - (r[0] + r[2] / 2)); if (d < bd) { bd = d; best = o; } } }
    HOT.forEach(function (h) { if (h.room !== S.room) return; if (h.show && !h.show()) return; chkR(h.r, { k: 'hs', h: h }); });
    EXIT.forEach(function (e) { if (e.room !== S.room) return; if (e.cond && !e.cond()) return; chkR(e.r, { k: 'ex', e: e }); });
    npcList().forEach(function (n) { var d = Math.abs(S.x - n.x); if (d <= 20 && d - 8 < bd) { bd = d - 8; best = { k: 'npc', n: n }; } });
    return best;
  }
  var POSE = ['musik.tkp_lantai', 'gudang.jejak_sepatu', 'lorong.rak_sepatu', 'gudang.kotak_perkakas'];
  function act() {
    if (isModalOpen() && !dlg.active) return;
    if (dlg.active) { advance(); return; }
    var t = near(); if (!t) return;
    if (t.k === 'hs') { var c = t.h.r[0] + t.h.r[2] / 2; S.face = c >= S.x ? 1 : -1; S.seen[t.h.id] = 1; S.pose = POSE.indexOf(t.h.id) >= 0 ? 'crouch' : null; t.h.run(); }
    else if (t.k === 'ex') {
      var e = t.e;
      if (e.to === 'musik' && S.f.discovered && S.f.ready) { finale(); return; }
      if (!S.f.discovered && e.to !== 'aula') return;
      var from = S.room; go(e.to, from);
    }
    else { S.face = t.n.x >= S.x ? 1 : -1; talk(t.n.id); }
  }
  $('bAct').addEventListener('click', act);
  function hold(btn, k) {
    var on = function (e) { e.preventDefault(); keys[k] = true; }; var off = function () { keys[k] = false; };
    btn.addEventListener('pointerdown', on); btn.addEventListener('pointerup', off); btn.addEventListener('pointerleave', off); btn.addEventListener('pointercancel', off);
  }
  hold($('bL'), 'l'); hold($('bR'), 'r');
  window.addEventListener('keydown', function (e) {
    var tg = e.target; if (tg && (tg.tagName === 'INPUT' || tg.tagName === 'SELECT' || tg.tagName === 'TEXTAREA')) return;
    var k = e.key;
    if (k === 'ArrowLeft' || k === 'a' || k === 'A') { keys.l = true; e.preventDefault(); }
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') { keys.r = true; e.preventDefault(); }
    else if (k === 'e' || k === 'E' || k === ' ' || k === 'Enter') { if (tg && tg.tagName === 'BUTTON' && (k === ' ' || k === 'Enter')) return; e.preventDefault(); act(); }
    else if (k >= '1' && k <= '9' && dlg.opts && dlg._cur) { var o = dlg._cur.opts[+k - 1]; if (o) choose(o); }
    else if (k === 'n' || k === 'N') { if ($('mNote').hidden) openNote(); else closeNote(); }
    else if (k === 'Escape') {
      if (!$('mNote').hidden) closeNote();
      else if (!$('mHelp').hidden) { $('mHelp').hidden = true; }
      else if (!$('mPuz').hidden) { $('mPuz').hidden = true; }
      else if (!$('mBoard').hidden) { $('mBoard').hidden = true; S.f.ready = true; }
    }
  });
  window.addEventListener('keyup', function (e) { var k = e.key; if (k === 'ArrowLeft' || k === 'a' || k === 'A') keys.l = false; if (k === 'ArrowRight' || k === 'd' || k === 'D') keys.r = false; });
  window.addEventListener('blur', function () { keys.l = keys.r = false; });

  /* ---------- loop ---------- */
  var last = 0, promptT = '';
  function frame(ts) {
    var dt = Math.min(.05, (ts - last) / 1000 || 0); last = ts; S.t += dt;
    S.flashT -= dt; if (S.flashT <= 0) { S.flash = 1; S.flashT = 7 + Math.random() * 10; } S.flash = Math.max(0, S.flash - dt * 2.2);
    if (S.fade > 0) S.fade = Math.max(0, S.fade - dt * 2.4);
    if (S.noteT > 0) S.noteT -= dt;
    var moving = false;
    if (!busy()) { var dx = (keys.r ? 1 : 0) - (keys.l ? 1 : 0); if (dx) { S.x = Math.max(14, Math.min(370, S.x + dx * 84 * dt)); S.face = dx; moving = true; S.pose = null; } }
    if (S.fb) { S.fb.t += dt; if (S.fb.t > S.fb.dur) S.fb = null; }
    draw(moving);
    requestAnimationFrame(frame);
  }
  function hotCenter(r) { return r[0] + r[2] / 2; }
  function draw(moving) {
    ctx.setTransform(Z, 0, 0, Z, 0, 0); ctx.imageSmoothingEnabled = false; ctx.clearRect(0, 0, LW, LH);
    var bgk = S.memory ? 'dapur_makan' : ((S.room === 'musik' && S.dawn) ? 'ruang_musik_subuh' : RK[S.room]);
    if (IM['bg_' + bgk]) ctx.drawImage(IM['bg_' + bgk], 0, 0);
    var r = S.room;
    // properti di latar
    if (r === 'musik' && !S.memory) {
      ctx.drawImage(IM.p_jam_musik_retak_2145, 291, 94);
      ctx.drawImage(IM.jasad_kiri, 192, 181);
      ctx.drawImage(IM.p_kaca_pecah_di_atas_darah, 246, 189);
    }
    if (r === 'kerja' && !S.memory && IM.p_brankas_terbuka) ctx.drawImage(S.f.discovered ? IM.p_brankas_terbuka : IM.p_brankas_tertutup, 56, 86);
    if (r === 'aula' && S.callOn && IM.p_interkom_menyala) ctx.drawImage(IM.p_interkom_menyala, 218, 100);
    if (r === 'gudang') { ctx.drawImage(IM.p_jejak_pantofel_lumpur, 44, 186); ctx.drawImage(IM.p_jejak_pantofel_lumpur, 112, 191); }

    // Hujan dan kilat di luar jendela (hanya di balik kaca jendela luar, bukan di dalam ruangan)
    var wins = (typeof ROOM_WINDOWS !== 'undefined' && ROOM_WINDOWS[bgk]) || [];
    if (wins.length > 0 && !S.dawn) {
      ctx.save();
      ctx.beginPath();
      wins.forEach(function (w) {
        ctx.rect(w[0], w[1], w[2], w[3]);
      });
      ctx.clip();

      // Hujan mengalir di luar jendela
      ctx.globalAlpha = 0.7;
      ctx.drawImage(IM['rain' + (Math.floor(S.t * 8) % 4)], 0, 0);

      // Kilat menyambar di langit luar
      if (S.flash > .05) {
        ctx.globalAlpha = Math.min(1, S.flash) * 0.9;
        ctx.drawImage(IM.kilat, 0, 0);
      }
      ctx.restore();
    }

    // Pantulan kilatan petir alami ke dalam ruangan
    if (S.flash > .05 && !S.dawn && wins.length > 0) {
      ctx.fillStyle = 'rgba(200, 220, 255, ' + (S.flash * 0.14) + ')';
      ctx.fillRect(0, 0, LW, LH);
    }

    // karakter
    var spk = S.spk && dlg.active;
    if (S.memory) {
      var mc = [['naya', 190, 1], ['arga', 236, -1], ['bima', 284, -1], ['raka', 326, -1]];
      mc.forEach(function (c) { drawChar(c[0], (spk && S.spk === c[0]) ? 'talk' : 'idle', c[1], c[2], S.t); });
    } else {
      npcList().forEach(function (n) { var face = S.x >= n.x ? 1 : -1; drawChar(n.id, (spk && S.spk === n.id) ? 'talk' : 'idle', n.x, face, S.t); nameTag(n.x, NAME[n.id], '#dcae55'); });
      if (S.sari && r === 'aula') { drawChar('sari', (spk && S.spk === 'sari') ? 'talk' : 'idle', S.sari.x, -1, S.t); nameTag(S.sari.x, 'Sari', '#dcae55'); }
      if (S.started) {
        var an = 'idle';
        if (moving) an = 'walk'; else if (S.pose === 'crouch') an = 'crouch'; else if (spk && S.spk === 'raka') an = 'talk'; else if (S.noteT > 0) an = 'notes';
        drawChar('raka', an, S.x, S.face, S.t); nameTag(S.x, 'Raka', '#74bdb2');
      }
    }
    if (S.memory) { ctx.fillStyle = 'rgba(150,100,40,.28)'; ctx.fillRect(0, 0, LW, LH); }
    // kilas balik
    if (S.fb) {
      ctx.fillStyle = 'rgba(4,3,8,.72)'; ctx.fillRect(0, 0, LW, LH);
      var f = S.fb, p = f.t / f.dur, sx, an2 = 'walk', once = false, tm = f.t;
      if (f.kind === 'run') { sx = -30 + p * (LW + 60); an2 = 'run'; }
      else {
        if (f.t < 2.2) { sx = -30 + (f.t / 2.2) * 170; an2 = 'walk'; }
        else if (f.t < 3.4) { sx = 140; an2 = 'attack'; tm = f.t - 2.2; once = true; }
        else { sx = 140 + ((f.t - 3.4) / (f.dur - 3.4)) * (LW); an2 = 'walk'; }
      }
      drawChar('siluet_pelaku', an2, sx, 1, tm, once);
      ctx.font = '8px "Pixelify Sans","Courier New",monospace'; ctx.textAlign = 'center'; ctx.fillStyle = '#d4506a'; ctx.fillText('KILAS BALIK', LW / 2, 18);
    }
    // penanda
    if (!busy() || dlg.active === false && S.started) {
      var bob = Math.sin(S.t * 3) * 1.5;
      if (S.started && !S.memory && !S.fb && !dlg.active && !isModalOpen()) {
        HOT.forEach(function (h) { if (h.room !== r || (h.show && !h.show())) return; if (h.r[1] > 190) return; var cx = hotCenter(h.r), yy = Math.max(4, h.r[1] - 17 + bob); ctx.globalAlpha = S.seen[h.id] ? .4 : 1; ctx.drawImage(IM.ui_ikon_periksa, Math.round(cx - 8), Math.round(yy)); ctx.globalAlpha = 1; });
        EXIT.forEach(function (e) { if (e.room !== r || (e.cond && !e.cond())) return; var cx = hotCenter(e.r), yy = Math.max(4, e.r[1] - 17 + bob); ctx.drawImage(IM.ui_ikon_pintu, Math.round(cx - 8), Math.round(yy)); });
        // lantai: penanda untuk hotspot rendah
        HOT.forEach(function (h) { if (h.room !== r || (h.show && !h.show())) return; if (h.r[1] <= 190) return; var cx = hotCenter(h.r); ctx.globalAlpha = S.seen[h.id] ? .4 : 1; ctx.drawImage(IM.ui_ikon_periksa, Math.round(cx - 8), Math.round(168 + bob)); ctx.globalAlpha = 1; });
      }
    }
    if (S.fade > 0) { ctx.fillStyle = 'rgba(0,0,0,' + S.fade + ')'; ctx.fillRect(0, 0, LW, LH); }
    // prompt
    var t = near(), lab = '';
    if (t) { lab = t.k === 'hs' ? 'Periksa: ' + t.h.label : (t.k === 'ex' ? 'Masuk: ' + t.e.label : 'Bicara dengan ' + NAME[t.n.id]); }
    if (lab !== promptT) { promptT = lab; var pe = $('prompt'); pe.textContent = lab; pe.hidden = !lab; }
  }

  /* ---------- mulai ---------- */
  $('bStart').addEventListener('click', function () { $('mTitle').hidden = true; updNote(); intro(); });
  setDlgIdle(); updHud();
  loadAll().then(function () { $('titleImg').src = ASSETS.bg_aula; requestAnimationFrame(frame); });
  window.__g = { S: function () { return S; }, say: say, go: go, addEv: addEv, openPuz: openPuz, finale: finale, openBoard: openBoard, ending: ending, PUZ: PUZ, enc: enc, IM: IM };
})();
