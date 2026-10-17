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

  var PUZ = {
    p1: {
      title: 'Teka-Teki Sandi 1: Kartu di Bawah Cangkir',
      msg: 'Pelaku Ada Di Gudang',
      fn: F,
      img: 'p_kartu_sandi_1_x3',
      rule: 'f(x) = 5x − 1',
      calcs: [
        { n: 'f⁻¹(y) = (y + 1) / 5', fn: function (y) { return (y + 1) / 5; } }
      ],
      hints: [
        'Kunci Sandi Mawar: f(x) = 5x − 1. Untuk mencari huruf asli x, balikkan rumusnya: x = (y + 1) / 5.',
        'Contoh: Angka 79 → (79 + 1) / 5 = 80 / 5 = 16 (Huruf ke-16 kapital: P). Spasi bernilai 0 (angka −1).',
        'Kata pertama adalah “Pelaku”. Anda juga bisa langsung mengetik hurufnya pada kotak input!'
      ]
    },
    p2: {
      title: 'Teka-Teki Sandi 2: Kartu Bunga Dua Kelopak',
      msg: 'Jam Musik Bohong',
      fn: GF,
      img: 'p_kartu_sandi_2_dua_kelopak_x3',
      rule: 'Lapisan 1: f(x) = 5x − 1  →  Lapisan 2: g(x) = 2x − 3',
      calcs: [
        { n: 'f⁻¹(y) = (y + 1) / 5', fn: function (y) { return (y + 1) / 5; } },
        { n: 'g⁻¹(y) = (y + 3) / 2', fn: function (y) { return (y + 3) / 2; } },
        { n: '(g∘f)⁻¹(y) = (y + 5) / 10', fn: function (y) { return (y + 5) / 10; } }
      ],
      hints: [
        'Ini adalah Fungsi Komposisi dua lapis: (g∘f)(x) = 2(5x − 1) − 3 = 10x − 5.',
        'Rumus Invers Komposisi untuk membalikkan angka: x = (y + 5) / 10.',
        'Contoh: Angka 95 → (95 + 5) / 10 = 10 (Huruf ke-10 kapital: J). Pesan dimulai dengan “Jam Musik...”.'
      ]
    }
  };

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

  function drawChar(id, anim, x, face, tm, once) {
    var T = ATL[id] || ATL.base, A = T[anim] || T.idle, sh = IM['ch_' + id];
    if (!sh) return;
    var idx = once ? Math.min(A[1] - 1, Math.floor(tm * A[2])) : Math.floor(tm * A[2]) % A[1];
    ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x, FEET + 1, 13, 3, 0, 0, 6.3); ctx.fill();
    ctx.save(); ctx.translate(Math.round(x), 0); if (face < 0) ctx.scale(-1, 1);
    ctx.drawImage(sh, idx * 64, A[0] * 64, 64, 64, -32, FEET - 62, 64, 64);
    ctx.restore();
  }
  function nameTag(x, t, col) {
    ctx.font = '7px "Pixelify Sans","Courier New",monospace';
    ctx.textAlign = 'center'; ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgba(0,0,0,.85)'; ctx.strokeText(t, x, FEET - 60);
    ctx.fillStyle = col; ctx.fillText(t, x, FEET - 60);
  }

  /* ---------- modal helper ---------- */
  function isModalOpen() {
    return !$('mTitle').hidden ||
      !$('mHelp').hidden ||
      !$('mNote').hidden ||
      !$('mPuz').hidden ||
      !$('mEnd').hidden;
  }

  /* ---------- state ---------- */
  var S;
  function newState() {
    S = {
      room: 'aula', x: 110, face: 1, f: {}, ev: {}, time: '--.--',
      fade: 0, flash: 0, flashT: 5, t: 0, started: false,
      spk: null, noteT: 0, harin: null, sari: null, callOn: false,
      memory: false, dawn: false, ending: null
    };
  }
  newState();

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
    if (REDUCED) { finishType(); return; }
    $('txt').textContent = '';
    typeT = setInterval(function () {
      dlg.pos += 2;
      $('txt').textContent = dlg.full.slice(0, dlg.pos);
      if (typeof GameAudio !== 'undefined' && dlg.pos % 4 === 0) GameAudio.typeBeep(k);
      if (k && ex === 'netral') setPor(k, (Math.floor(dlg.pos / 6) % 2) ? 'bicara' : 'netral');
      if (dlg.pos >= dlg.full.length) finishType();
    }, 24);
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
    if (o.fx) o.fx();
    var add = (o.lines || []).slice();
    dlg.Q = add.concat(dlg.Q);
    nextLine();
  }
  function advance() {
    if (!dlg.active || dlg.opts) return;
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
    }
  });

  /* ---------- layar teka-teki sandi ---------- */
  var curP = null;
  function openPuz(id) {
    var P = PUZ[id];
    curP = { id: id, P: P, hint: 0, cipher: enc(P.msg, P.fn), solved: false };
    var c = $('puzCard'); c.innerHTML = '';

    var h = document.createElement('h2'); h.textContent = P.title; c.appendChild(h);
    var im = document.createElement('img'); im.className = 'cardimg'; im.src = ASSETS[P.img]; im.alt = 'Kartu sandi matematika'; c.appendChild(im);

    var p = document.createElement('p'); p.className = 'muted';
    p.innerHTML = 'Aturan Enkripsi: <b style="font-family:var(--f-mono);color:var(--amber);font-size:15px">' + P.rule + '</b><br>Hitung nilai asli <b>x</b> untuk tiap angka hasil <b>y</b>, lalu susun pesan rahasianya!';
    c.appendChild(p);

    var cip = document.createElement('div'); cip.className = 'cipher'; cip.id = 'cipher'; c.appendChild(cip);
    var msg = Array.from(P.msg), wordEl = null;
    msg.forEach(function (ch, i) {
      var y = curP.cipher[i];
      if (!wordEl || ch === ' ') { wordEl = document.createElement('div'); wordEl.className = 'word'; cip.appendChild(wordEl); }
      var chip = document.createElement('div'); chip.className = 'chip' + (ch === ' ' ? ' sp' : ''); chip.dataset.i = i;
      chip.innerHTML = '<span class="y">' + y + '</span><input type="text" autocomplete="off" aria-label="nilai x untuk angka ' + y + '"><span class="ch"></span><span class="vf"></span>';
      wordEl.appendChild(chip);
      if (ch === ' ') wordEl = null;
      chip.querySelector('input').addEventListener('input', function () { chk(chip, i); });
    });

    var res = document.createElement('div'); res.id = 'puzRes'; c.appendChild(res);

    // Kalkulator Invers Otomatis
    var calc = document.createElement('div'); calc.className = 'calc';
    calc.innerHTML = '<b>Kalkulator Fungsi Invers (Bantuan Hitung)</b><div class="row"><select id="cSel" aria-label="Fungsi"></select><input id="cY" type="text" inputmode="numeric" placeholder="Masukkan angka y" aria-label="angka y"><button type="button" id="cGo">Hitung Invers</button></div><div class="res" id="cRes"></div>';
    c.appendChild(calc);
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

    // Tabel Abjad Sandi Mawar
    var d = document.createElement('details'); d.innerHTML = '<summary>Buka Tabel Sandi Mawar (Nilai Tiap Abjad)</summary>';
    var tw = document.createElement('div'); tw.className = 'mapwrap'; var tb = '<table class="map"><tr>';
    for (var a = 1; a <= 26; a++) tb += '<td>' + String.fromCharCode(64 + a) + '<br>' + a + '</td>';
    tb += '</tr><tr>';
    for (a = 1; a <= 26; a++) tb += '<td>' + String.fromCharCode(96 + a) + '<br>−' + a + '</td>';
    tb += '</tr></table><p class="muted" style="margin-top:6px">Huruf Kapital = Positif, Huruf Kecil = Negatif, Spasi = 0</p>';
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

  function chk(chip, i) {
    var P = curP.P, inp = chip.querySelector('input'), x = parseNum(inp.value), ch = chip.querySelector('.ch'), vf = chip.querySelector('.vf');
    chip.classList.remove('ok', 'bad'); ch.textContent = ''; vf.textContent = '';
    if (x === null) {
      if (inp.value.trim()) {
        chip.classList.add('bad');
        if (typeof GameAudio !== 'undefined') GameAudio.puzzleWrong();
      }
      finishCheck();
      return;
    }
    var okv = P.fn(x) === curP.cipher[i];
    if (Math.abs(x) <= 26) ch.textContent = x === 0 ? '␣' : chr(x);
    chip.classList.add(okv ? 'ok' : 'bad');
    if (typeof GameAudio !== 'undefined') {
      if (okv) GameAudio.puzzleCorrect();
      else GameAudio.puzzleWrong();
    }
    vf.textContent = '→' + P.fn(x);
    finishCheck();
  }

  function finishCheck() {
    if (curP.solved) return;
    var chips = document.querySelectorAll('#cipher .chip'), all = true;
    Array.prototype.forEach.call(chips, function (c) { if (!c.classList.contains('ok')) all = false; });
    if (all) {
      curP.solved = true;
      if (typeof GameAudio !== 'undefined') GameAudio.puzzleSolved();
      var r = $('puzRes'); r.className = 'solved';
      r.innerHTML = '<div class="muted">Pesan Rahasia Berhasil Dipecahkan!</div><div class="msg">“' + curP.P.msg + '”</div>';
      var b = document.createElement('button'); b.type = 'button'; b.className = 'primary'; b.textContent = 'Lanjutkan Penyelidikan ▸'; b.style.marginTop = '10px';
      b.addEventListener('click', function () {
        $('mPuz').hidden = true;
        var id = curP.id;
        if (id === 'p1') afterP1();
        else afterP2();
      });
      r.appendChild(b);
    }
  }

  /* ---------- alur cerita bertingkat (visual novel MTK) ---------- */
  function setTime(t) { S.time = t; updHud(); }

  // Bab 1: Jam Sembilan Malam & Sandi Pertama
  function intro() {
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
        function () { S.harin = { x: 280 }; S.sari = S.harin; },
        ['Harin', 'Pak Noah... Saya menemukan secarik kertas ini di bawah cangkir teh Pak Basuki...', 'terpejam'],
        ['Harin', 'Pak Basuki pernah mengajari saya bahwa angka-angka ini adalah pesan rahasia yang dikunci dengan rumus fungsi matematika: f(x) = 5x − 1!'],
        ['Noah', 'Kertas ini kunci penyelidikan kita. Biar kubongkar pesan ini dengan fungsi inversnya!']
      ], function () {
        openPuz('p1');
      });
    });
  }

  // Bab 2: Gudang Belakang & Sandi Dua Kelopak
  function afterP1() {
    showChapter(4, function () {
      setTime('23.10'); S.f.p1 = true;
      S.room = 'gudang'; S.x = 160; S.harin = null; S.sari = null;
      addEv('B7'); addEv('B5');
      say([
        ['Noah', 'Pesan Sandi 1 terpecahkan: “Pelaku Ada Di Gudang”. Si pembuat pesan ingin kita memeriksa gudang belakang!'],
        ['', 'Noah menyelinap ke gudang di belakang dapur. Hujan masih menderu di luar kaca jendela.'],
        ['Noah', 'Lihat ini... Jejak sepatu pantofel basah bertanah merah mengarah ke kotak perkakas.'],
        ['', 'Di dalam drum minyak tua, terdapat abu sisa pembakaran kertas laporan audit keuangan MJC.'],
        ['Noah', 'Pelaku membakar bukti kejahatan keuangannya di sini! Dan... apa ini di bawah peti?'],
        function () { addEv('B10'); },
        ['', 'Sebuah kartu rahasia kedua bersimbol Bunga Mawar Dua Kelopak terselip di balik tumpukan peti!'],
        ['Noah', 'Ini sandi dua lapis... f(x) = 5x − 1 lalu ditimpa g(x) = 2x − 3. Fungsi Komposisi!'],
        ['Noah', 'Pelaku mengunci rahasianya dengan matematika berlapis. Kita harus membalikkan fungsi komposisinya!']
      ], function () {
        openPuz('p2');
      });
    });
  }

  // Bab 3: Fajar Menyingsing, Konfrontasi & Tuduhan Akhir
  function afterP2() {
    showChapter(6, function () {
      setTime('05.30'); S.dawn = true; S.room = 'musik'; S.x = 90;
      addEv('B8'); addEv('B6');
      say([
        ['Noah', 'Pesan Sandi 2 terpecahkan: “Jam Musik Bohong”!!'],
        ['Noah', 'Jam dinding antik sengaja dimajukan ke 21.45 dan dirusak untuk memalsukan alibi! Pak Basuki tewas jauh sebelum jam sembilan lewat seperempat!'],
        ['', 'Fajar mulai menyingsing di jendela Ruang Musik. Seluruh penghuni villa dikumpulkan.'],
        ['Jake', 'Sudah pagi, Detektif. Badai sudah reda dan jalan mulai dibuka. Siapa pelaku yang kau tuduh?', 'bicara'],
        ['Yuna', 'Pasti Dimas si penjaga pos! Dia yang memegang kunci perkakas!', 'terkejut'],
        ['Dimas', 'Demi Tuhan bukan saya! Sepatu saya bot karet bergerigi, bukan pantofel mahal bertanah merah!'],
        ['Noah', 'Semua bukti matematika sudah membuktikan siapa pelaku sebenarnya!'],
        {
          ask: {
            who: 'Noah',
            q: 'Berdasarkan Sandi 1 (Pelaku di Gudang), Sandi 2 (Jam Musik Bohong), dan motif pembakaran audit MJC, siapakah pembunuh Pak Basuki?',
            opts: [
              {
                t: 'Jake (Direktur Keuangan Mawar Karya)',
                lines: [
                  ['Noah', 'Pelakunya adalah Anda, Jake!'],
                  ['Jake', 'Apa buktimu?! Aku berada di aula dan kamarku sepanjang malam!', 'terkejut'],
                  ['Noah', 'Jam musik dimajukan ke 21.45 agar kau tampak punya alibi. Padahal saat Harin ke gudang pukul 21.15, kau sudah di sana membakar buku audit!'],
                  ['Noah', 'Dan tanah merah di sol pantofel hitammu... hanya ada di halaman belakang dekat gudang tempat surat Pak Basuki ditemukan!'],
                  ['Jake', 'Cukup... Cukup! Basuki tahu soal dana fiktif vendor MJC dan hendak melaporkanku pagi ini... Aku tak punya pilihan!', 'terpejam'],
                  function () { ending('win', 'Jake'); }
                ]
              },
              {
                t: 'Dimas (Penjaga Pos Jaga)',
                lines: [
                  ['Noah', 'Dimas, apa kau pelakunya?'],
                  ['Dimas', 'Pak Detektif, kabel interkom membuktikan saya di pos saat 21.00 dan 21.14! Dan sol sepatu saya bot bergerigi, bukan sol pantofel halus!'],
                  ['Noah', 'Tunggu... Dimas benar. Sol sepatu di gudang adalah pantofel halus milik Jake, dan orang yang punya motif audit keuangan adalah Jake!'],
                  function () { ending('weak', 'Dimas'); }
                ]
              },
              {
                t: 'Yuna (Keponakan Korban)',
                lines: [
                  ['Noah', 'Yuna, apa kau membunuh pamanmu karena sengketa villa?'],
                  ['Yuna', 'Saya memang marah soal villa, tapi saya tidak tahu menahu soal pembakaran kertas audit keuangan di gudang! Sepatu saya kets putih!', 'terkejut'],
                  ['Noah', 'Benar... pembunuh sebenarnya berkepentingan menghilangkan audit keuangan MJC dan memakai pantofel hitam berlumur tanah merah: Jake!'],
                  function () { ending('wrong', 'Yuna'); }
                ]
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

    if (kind === 'win') {
      body.push('Dengan pemecahan Sandi Mawar (Fungsi Invers dan Komposisi), Noah membongkar rekayasa waktu jam dinding dan alibi palsu Jake.');
      body.push('Jake ditangkap saat polisi tiba di pagi hari. Penggelapan dana fiktif MJC terungkap, dan Villa Mawar diselamatkan.');
      body.push('Harin tersenyum lega. Pelajaran matematika dari Pak Basuki kini menjadi penyelamat kebenaran.');
    } else {
      body.push('Tuduhan Anda goyah karena mengabaikan jejak sol pantofel di gudang dan hasil dekripsi Sandi 2: “Jam Musik Bohong”.');
      body.push('Pelaku sebenarnya (Jake) memanfaatkan situasi untuk melarikan diri saat jalan dibuka.');
      body.push('Anda boleh mencoba lagi untuk menjatuhkan tuduhan yang tepat berdasarkan bukti matematika.');
    }

    c.innerHTML = '<img class="hero" alt="" src="' + ASSETS[E.bg] + '">';
    var s = document.createElement('div'); s.className = 'sub'; s.textContent = E.tag; c.appendChild(s);
    var h2 = document.createElement('h2'); h2.textContent = E.t; c.appendChild(h2);
    var eb = document.createElement('div'); eb.className = 'list'; c.appendChild(eb);
    body.forEach(function (t) { var p = document.createElement('p'); p.textContent = t; eb.appendChild(p); });

    var r = document.createElement('div'); r.className = 'row';
    var b = document.createElement('button'); b.type = 'button'; b.className = 'primary';
    b.textContent = kind === 'win' ? 'Main Lagi dari Awal' : 'Ulangi Penyelidikan';
    b.addEventListener('click', restart);
    r.appendChild(b);
    c.appendChild(r);

    $('mEnd').hidden = false;
  }

  function restart() {
    $('mEnd').hidden = true;
    newState(); updNote();
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
    c.innerHTML = '<h2>Panduan Matematika: Sandi Mawar</h2>' +
      '<div class="list">' +
      '<p><b>1. Konsep Huruf ke Angka (Sandi Mawar):</b><br>' +
      '• Huruf Kapital (A–Z) = Angka positif <b>1 s/d 26</b> (A=1, B=2, ..., Z=26)<br>' +
      '• Huruf Kecil (a–z) = Angka negatif <b>−1 s/d −26</b> (a=−1, b=−2, ..., z=−26)<br>' +
      '• Spasi antarkata = Angka <b>0</b></p>' +
      '<p><b>2. Sandi 1: Fungsi Invers f⁻¹(y):</b><br>' +
      '• Rumus Enkripsi: y = f(x) = 5x − 1<br>' +
      '• Rumus Pembalik (Invers): <b>x = (y + 1) / 5</b><br>' +
      '• <i>Contoh:</i> Angka 79 → (79 + 1)/5 = 16 (Huruf P kapital).</p>' +
      '<p><b>3. Sandi 2: Fungsi Komposisi & Invers (g∘f)⁻¹(y):</b><br>' +
      '• Lapis 1: f(x) = 5x − 1, Lapis 2: g(x) = 2x − 3<br>' +
      '• Digabung: (g∘f)(x) = 2(5x − 1) − 3 = 10x − 5<br>' +
      '• Rumus Pembalik (Invers): <b>x = (y + 5) / 10</b><br>' +
      '• <i>Contoh:</i> Angka 95 → (95 + 5)/10 = 10 (Huruf J kapital).</p>' +
      '<p><b>4. Tips Praktis:</b><br>' +
      '• Gunakan menu <b>Kalkulator sandi</b> di bawah kartu teka-teki untuk menghitung otomatis.<br>' +
      '• Anda juga bisa langsung mengetik <b>hurufnya langsung</b> pada kotak teka-teki!</p>' +
      '</div>' +
      '<div class="row"><button type="button" id="hx">Tutup</button></div>';
    $('mHelp').hidden = false;
    $('hx').addEventListener('click', function () { $('mHelp').hidden = true; });
  });

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
      var mc = [['yuna', 190, 1], ['basuki', 236, -1], ['jake', 284, -1], ['noah', 330, -1]];
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
        drawChar('jake', (spk && S.spk === 'jake') ? 'talk' : 'idle', 175, -1, S.t);
        nameTag(175, 'Jake', '#dcae55');
        drawChar('dimas', (spk && S.spk === 'dimas') ? 'talk' : 'idle', 245, -1, S.t);
        nameTag(245, 'Dimas', '#dcae55');
        drawChar('yuna', (spk && S.spk === 'yuna') ? 'talk' : 'idle', 310, -1, S.t);
        nameTag(310, 'Yuna', '#dcae55');
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

  loadAll().then(function () {
    var tImg = $('titleImg');
    if (tImg) tImg.src = ASSETS.menu_bg || 'assets/menu/layar/latar_menu_utama.png';
    startTitleFlash();
    requestAnimationFrame(frame);
  });

  window.__g = { S: function () { return S; }, say: say, openPuz: openPuz, ending: ending, PUZ: PUZ, enc: enc, IM: IM };
})();
