// Audio Engine untuk Villa Mawar menggunakan Web Audio API
// 100% procedural / synthesized - tanpa dependensi file eksternal
// Dioptimalkan untuk speaker laptop, headphone, dan smartphone
const GameAudio = (function () {
  'use strict';

  var actx = null;
  var masterGain = null;
  var rainGain = null;
  var rainSource = null;
  var rainFilter1 = null;
  var rainFilter2 = null;
  var musicGain = null;
  var isMuted = false;
  var isRunning = false;
  var stepTime = 0;
  var musicInterval = null;
  var rainPatterInterval = null;

  // Dapatkan atau buat AudioContext
  function getContext() {
    if (!actx) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      actx = new AudioCtx();
      masterGain = actx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 1.0, actx.currentTime);
      masterGain.connect(actx.destination);
    }
    if (actx.state === 'suspended') {
      actx.resume().catch(function () {});
    }
    return actx;
  }

  // Buka suspensi Web Audio pada interaksi pengguna pertama apapun
  function unlockAudio() {
    var ctx = getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(function () {});
    }
  }
  if (typeof window !== 'undefined') {
    window.addEventListener('click', unlockAudio, true);
    window.addEventListener('keydown', unlockAudio, true);
    window.addEventListener('touchstart', unlockAudio, true);
  }

  // Buffer noise berkualitas untuk hujan dan petir
  var noiseBuffer = null;
  function getNoiseBuffer(ctx) {
    if (noiseBuffer) return noiseBuffer;
    var bufferSize = ctx.sampleRate * 2;
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var output = noiseBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      // White noise dengan amplitudo optimal
      output[i] = (Math.random() * 2 - 1) * 0.75;
    }
    return noiseBuffer;
  }

  // Efek Hujan Luar Ruangan (Dual-Band + Random Droplet Patter)
  // Menghasilkan suara hujan yang jelas terdengar di speaker laptop
  function startRain() {
    var ctx = getContext();
    if (!ctx || rainSource) return;

    var buf = getNoiseBuffer(ctx);

    // Sumber noise kontinu
    rainSource = ctx.createBufferSource();
    rainSource.buffer = buf;
    rainSource.loop = true;

    // Filter 1: Bandpass mid-high untuk suara desis rintik hujan di kaca (1800 Hz)
    rainFilter1 = ctx.createBiquadFilter();
    rainFilter1.type = 'bandpass';
    rainFilter1.frequency.setValueAtTime(1800, ctx.currentTime);
    rainFilter1.Q.setValueAtTime(1.0, ctx.currentTime);

    // Filter 2: Lowpass untuk gemuruh air di luar (900 Hz)
    rainFilter2 = ctx.createBiquadFilter();
    rainFilter2.type = 'lowpass';
    rainFilter2.frequency.setValueAtTime(900, ctx.currentTime);
    rainFilter2.Q.setValueAtTime(0.8, ctx.currentTime);

    rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.42, ctx.currentTime);

    rainSource.connect(rainFilter1);
    rainSource.connect(rainFilter2);
    rainFilter1.connect(rainGain);
    rainFilter2.connect(rainGain);
    rainGain.connect(masterGain);

    rainSource.start();

    // Rintik acak tetesan air di jendela (patter)
    if (rainPatterInterval) clearInterval(rainPatterInterval);
    rainPatterInterval = setInterval(function () {
      if (!actx || isMuted || !isRunning) return;
      if (Math.random() > 0.45) return;
      var now = actx.currentTime;
      var osc = actx.createOscillator();
      var g = actx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2200 + Math.random() * 1200, now);
      g.gain.setValueAtTime(0.04, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.025);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.03);
    }, 120);
  }

  // Musik Ambient Misteri Noir
  // Progresi akord Am9 -> Fmaj7 -> Dm7 -> E7 dengan melodi piano/music-box
  function startMysteryMusic() {
    var ctx = getContext();
    if (!ctx) return;
    if (musicInterval) clearInterval(musicInterval);

    musicGain = ctx.createGain();
    musicGain.gain.setValueAtTime(0.38, ctx.currentTime);
    musicGain.connect(masterGain);

    var progressions = [
      {
        chord: [220.00, 261.63, 329.63, 493.88], // Am9 (A3, C4, E4, B4)
        melody: [523.25, 493.88, 392.00]          // C5 -> B4 -> G4
      },
      {
        chord: [174.61, 220.00, 261.63, 329.63], // Fmaj7 (F3, A3, C4, E4)
        melody: [440.00, 392.00, 329.63]          // A4 -> G4 -> E4
      },
      {
        chord: [146.83, 220.00, 261.63, 349.23], // Dm7 (D3, A3, C4, F4)
        melody: [349.23, 329.63, 293.66]          // F4 -> E4 -> D4
      },
      {
        chord: [164.81, 207.65, 246.94, 293.66], // E7 (E3, G#3, B3, D4)
        melody: [415.30, 329.63, 246.94]          // G#4 -> E4 -> B3
      }
    ];

    var stepIdx = 0;

    function playProgression() {
      if (!actx || isMuted) return;
      var now = actx.currentTime;
      var cur = progressions[stepIdx % progressions.length];
      stepIdx++;

      // 1. Akord Pad Misterius
      cur.chord.forEach(function (freq, i) {
        var osc = actx.createOscillator();
        var gain = actx.createGain();
        osc.type = i === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        osc.detune.setValueAtTime((i - 1.5) * 5, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 1.2);
        gain.gain.linearRampToValueAtTime(0.0001, now + 5.8);

        osc.connect(gain);
        gain.connect(musicGain);

        osc.start(now);
        osc.stop(now + 6.0);
      });

      // 2. Melodi Piano / Bell Noir yang Jernih
      cur.melody.forEach(function (mFreq, mi) {
        var noteTime = now + 1.2 + mi * 1.35;
        var mOsc = actx.createOscillator();
        var mGain = actx.createGain();
        mOsc.type = 'triangle';
        mOsc.frequency.setValueAtTime(mFreq, noteTime);

        mGain.gain.setValueAtTime(0.0001, noteTime);
        mGain.gain.linearRampToValueAtTime(0.22, noteTime + 0.04);
        mGain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.6);

        mOsc.connect(mGain);
        mGain.connect(musicGain);

        mOsc.start(noteTime);
        mOsc.stop(noteTime + 1.7);
      });
    }

    playProgression();
    musicInterval = setInterval(playProgression, 6200);
  }

  // Gemuruh Petir saat Kilatan Muncul
  function thunder() {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var now = ctx.currentTime;
    var noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);

    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, now);
    filter.frequency.exponentialRampToValueAtTime(70, now + 2.8);

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.9, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.0);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start(now);
    noise.stop(now + 3.2);
  }

  // Dentang Lonceng Jam Kuno (Ruang Musik)
  function clockChime(times) {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    times = times || 1;
    var baseInterval = 1300;

    for (var k = 0; k < times; k++) {
      (function (idx) {
        setTimeout(function () {
          if (!actx || isMuted) return;
          var now = actx.currentTime;

          // Kombinasi nada harmonis lonceng katedral kuno
          [329.63, 440.00, 659.25, 880.00].forEach(function (freq, i) {
            var osc = actx.createOscillator();
            var gain = actx.createGain();
            osc.type = i === 0 ? 'sine' : 'triangle';
            osc.frequency.setValueAtTime(freq, now);

            var vol = i === 0 ? 0.55 : (i === 1 ? 0.35 : 0.20);
            gain.gain.setValueAtTime(vol, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(now);
            osc.stop(now + 2.5);
          });
        }, idx * baseInterval);
      })(k);
    }
  }

  // Suara Tekan Huruf Teks Dialog (Khas Retro Pixel)
  function typeBeep(speaker) {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var freq = 320;
    if (speaker === 'sari') freq = 520;
    else if (speaker === 'naya') freq = 440;
    else if (speaker === 'dimas') freq = 220;
    else if (speaker === 'bima') freq = 175;
    else if (speaker === 'raka') freq = 300;

    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq + (Math.random() * 20 - 10), now);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.045);
  }

  // SFX Penemuan Bukti Baru (Sparkle Clue Jingle)
  function clueFound() {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var now = ctx.currentTime;
    var notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.42, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.5);
    });
  }

  // SFX Pintu / Berpindah Ruangan
  function door() {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.16);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // SFX Input Sandi Benar
  function puzzleCorrect() {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now);       // E5
    osc.frequency.setValueAtTime(1046.50, now + 0.08); // C6

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  // SFX Input Sandi Salah / Gagal
  function puzzleWrong() {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.setValueAtTime(120, now + 0.08);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.24);
  }

  // SFX Teka-Teki Sandi Terpecahkan (Fanfare Kemenangan)
  function puzzleSolved() {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var now = ctx.currentTime;
    var notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);

      gain.gain.setValueAtTime(0.38, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.1 + 0.55);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.6);
    });
  }

  // SFX Langkah Kaki Raka (Soft Footstep di lantai kayu)
  function step() {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var now = ctx.currentTime;
    if (now - stepTime < 0.28) return;
    stepTime = now;

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220 + Math.random() * 30, now);
    osc.frequency.exponentialRampToValueAtTime(70, now + 0.06);

    gain.gain.setValueAtTime(0.24, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // SFX Klik UI / Tombol
  function clickUI() {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Nada konfirmasi / tes suara saat tombol suara ditekan
  function testChime() {
    var ctx = getContext();
    if (!ctx) return;
    var now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.07);
      gain.gain.setValueAtTime(0.35, now + i * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.07 + 0.4);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + i * 0.07);
      osc.stop(now + i * 0.07 + 0.45);
    });
  }

  // Chime pembuka saat memulai game
  function introChime() {
    var ctx = getContext();
    if (!ctx || isMuted) return;
    var now = ctx.currentTime;
    [220.00, 261.63, 329.63, 440.00, 523.25].forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);
      gain.gain.setValueAtTime(0.40, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 1.8);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 1.9);
    });
  }

  // Mulai seluruh audio saat game dimulai
  function start() {
    var ctx = getContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().then(function () {
        if (!isRunning) {
          isRunning = true;
          startRain();
          startMysteryMusic();
          introChime();
        }
      });
    } else if (!isRunning) {
      isRunning = true;
      startRain();
      startMysteryMusic();
      introChime();
    }
  }

  // Toggle Mute / Unmute
  function toggleMute() {
    var ctx = getContext();
    if (!isRunning) {
      // Jika game belum mulai atau audio belum jalan, langsung nyalakan
      isMuted = false;
      if (masterGain && ctx) {
        masterGain.gain.setValueAtTime(1.0, ctx.currentTime);
      }
      start();
      testChime();
      return true;
    }

    isMuted = !isMuted;
    if (masterGain && ctx) {
      masterGain.gain.setValueAtTime(isMuted ? 0 : 1.0, ctx.currentTime);
    }
    if (!isMuted) {
      testChime();
    }
    return !isMuted;
  }

  return {
    init: getContext,
    start: start,
    toggleMute: toggleMute,
    isMuted: function () { return isMuted; },
    testChime: testChime,
    thunder: thunder,
    clockChime: clockChime,
    typeBeep: typeBeep,
    clueFound: clueFound,
    door: door,
    puzzleCorrect: puzzleCorrect,
    puzzleWrong: puzzleWrong,
    puzzleSolved: puzzleSolved,
    step: step,
    clickUI: clickUI
  };
})();
