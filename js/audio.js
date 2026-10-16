// Audio Engine untuk Villa Mawar menggunakan Web Audio API
// 100% procedural / synthesized - tanpa dependensi file eksternal
const GameAudio = (function () {
  'use strict';

  var actx = null;
  var masterGain = null;
  var rainGain = null;
  var musicGain = null;
  var isMuted = false;
  var isRunning = false;
  var stepTime = 0;

  function getContext() {
    if (!actx) {
      var AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return null;
      actx = new AudioCtx();
      masterGain = actx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.8, actx.currentTime);
      masterGain.connect(actx.destination);
    }
    if (actx.state === 'suspended') {
      actx.resume();
    }
    return actx;
  }

  // Buat buffer noise untuk efek hujan dan petir
  var noiseBuffer = null;
  function getNoiseBuffer(ctx) {
    if (noiseBuffer) return noiseBuffer;
    var bufferSize = ctx.sampleRate * 2;
    noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    var output = noiseBuffer.getChannelData(0);
    var lastOut = 0.0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02; // Pink-ish noise
      lastOut = output[i];
    }
    return noiseBuffer;
  }

  // Efek Hujan Luar Ruangan (Ambient)
  function startRain() {
    var ctx = getContext();
    if (!ctx) return;

    var noise = ctx.createBufferSource();
    noise.buffer = getNoiseBuffer(ctx);
    noise.loop = true;

    // Filter agar terdengar seperti hujan lebat di luar dinding
    var filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(550, ctx.currentTime);

    rainGain = ctx.createGain();
    rainGain.gain.setValueAtTime(0.18, ctx.currentTime);

    noise.connect(filter);
    filter.connect(rainGain);
    rainGain.connect(masterGain);

    noise.start();
  }

  // Musik Ambient Misteri (Akord drone noir lambat)
  var musicInterval = null;
  function startMysteryMusic() {
    var ctx = getContext();
    if (!ctx) return;

    musicGain = ctx.createGain();
    musicGain.gain.setValueAtTime(0.15, ctx.currentTime);
    musicGain.connect(masterGain);

    var chords = [
      [146.83, 220.00, 261.63], // Dm (D3, A3, C4)
      [130.81, 196.00, 233.08], // Bb (Bb2, G3, Bb3)
      [116.54, 174.61, 220.00], // Gm (G2, F3, A3)
      [110.00, 164.81, 220.00]  // A7 (A2, E3, A3)
    ];
    var chordIdx = 0;

    function playChord() {
      if (!ctx || isMuted) return;
      var now = ctx.currentTime;
      var notes = chords[chordIdx % chords.length];
      chordIdx++;

      notes.forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        var gain = ctx.createGain();
        osc.type = i === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.04, now + 2.5);
        gain.gain.linearRampToValueAtTime(0.0001, now + 7.5);

        osc.connect(gain);
        gain.connect(musicGain);

        osc.start(now);
        osc.stop(now + 8);
      });
    }

    playChord();
    musicInterval = setInterval(playChord, 8000);
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
    filter.frequency.setValueAtTime(140, now);
    filter.frequency.exponentialRampToValueAtTime(40, now + 3.2);

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.7, now + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.5);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start(now);
    noise.stop(now + 3.6);
  }

  // Dentang Lonceng Jam Kuno (Ruang Musik)
  function clockChime(times) {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    times = times || 1;
    var baseInterval = 1600;

    for (var k = 0; k < times; k++) {
      (function (idx) {
        setTimeout(function () {
          if (!actx || isMuted) return;
          var now = actx.currentTime;

          // Kombinasi 2 nada harmonis lonceng katedral
          [440, 659.25, 880].forEach(function (freq, i) {
            var osc = actx.createOscillator();
            var gain = actx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq * 0.75, now);

            var vol = i === 0 ? 0.35 : 0.15;
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

  // Suara Tekan Huruf Teks Dialog (Khas Persona / Retro Pixel)
  function typeBeep(speaker) {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    // Pitch berbeda untuk tiap karakter
    var freq = 280;
    if (speaker === 'sari') freq = 440;
    else if (speaker === 'naya') freq = 380;
    else if (speaker === 'dimas') freq = 200;
    else if (speaker === 'bima') freq = 160;
    else if (speaker === 'raka') freq = 260;

    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq + (Math.random() * 30 - 15), now);

    gain.gain.setValueAtTime(0.035, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
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
      osc.frequency.setValueAtTime(freq, now + i * 0.09);

      gain.gain.setValueAtTime(0.18, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.09 + 0.5);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.55);
    });
  }

  // SFX Pintu / Berpindah Ruangan
  function door() {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // SFX Input Sandi Benar
  function puzzleCorrect() {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.setValueAtTime(1174.66, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.28);
  }

  // SFX Input Sandi Salah
  function puzzleWrong() {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // SFX Teka-Teki Sandi Terpecahkan
  function puzzleSolved() {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var now = ctx.currentTime;
    var notes = [440, 554.37, 659.25, 880];
    notes.forEach(function (freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + i * 0.12);

      gain.gain.setValueAtTime(0.2, now + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.12 + 0.6);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now + i * 0.12);
      osc.stop(now + i * 0.12 + 0.65);
    });
  }

  // SFX Langkah Kaki Raka (Soft Footstep)
  function step() {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var now = ctx.currentTime;
    if (now - stepTime < 0.32) return;
    stepTime = now;

    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(70 + Math.random() * 20, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Klik UI
  function clickUI() {
    var ctx = getContext();
    if (!ctx || isMuted) return;

    var now = ctx.currentTime;
    var osc = ctx.createOscillator();
    var gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }

  // Mulai seluruh audio saat game dimulai
  function start() {
    if (isRunning) return;
    isRunning = true;
    getContext();
    startRain();
    startMysteryMusic();
  }

  // Toggle Mute / Unmute
  function toggleMute() {
    getContext();
    isMuted = !isMuted;
    if (masterGain && actx) {
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.8, actx.currentTime);
    }
    return !isMuted;
  }

  return {
    init: getContext,
    start: start,
    toggleMute: toggleMute,
    isMuted: function () { return isMuted; },
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
