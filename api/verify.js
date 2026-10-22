// api/verify.js - Vercel Serverless Function
// Memvalidasi jawaban teka-teki sandi dan password kalkulator di sisi server

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  var body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      return res.status(400).json({ error: 'Format JSON tidak valid' });
    }
  }
  body = body || {};

  var targetId = body.puzzleId || body.type;

  // Database solusi rahasia di server (Aman dari inspect browser/F12)
  if (targetId !== 'calc' && targetId !== 'p1' && targetId !== 'p2') {
    return res.status(400).json({ error: 'Target atau ID teka-teki tidak valid' });
  }

  // Verifikasi Kunci Kalkulator
  if (targetId === 'calc') {
    var inputPwd = (body.password !== undefined ? body.password : body.answer) || '';
    var normPwd = inputPwd.trim().toLowerCase().replace(/\s+/g, ' ');
    var isCalcOk = normPwd === 'jam dinding' || normPwd === 'jamdinding' || inputPwd === 'Jakee999!!';
    return res.status(200).json({
      success: isCalcOk,
      verified: isCalcOk
    });
  }

  // Verifikasi Sandi Teka-Teki Matematika (p1 & p2) - Multi-varian dinamis
  var normalized = (body.answer || '').trim().toUpperCase().replace(/\s+/g, ' ');
  var isCorrect = false;
  var solutionText = null;

  var P1_SOLUTIONS = {
    'PELAKU ADA DI GUDANG': 'Pelaku Ada Di Gudang',
    'PERIKSA GUDANG BELAKANG': 'Periksa Gudang Belakang',
    'BUKTI ADA DI GUDANG': 'Bukti Ada Di Gudang',
    'CARI PETUNJUK DI GUDANG': 'Cari Petunjuk Di Gudang'
  };

  var P2_SOLUTIONS = {
    'JAM DINDING BOHONG': 'Jam Dinding Bohong',
    'WAKTU KEMATIAN PALSU': 'Waktu Kematian Palsu',
    'ALIBI JAM DINDING PALSU': 'Alibi Jam Dinding Palsu',
    'JAM MUSIK DIREKAYASA': 'Jam Musik Direkayasa',
    'JAM MUSIK BOHONG': 'Jam Dinding Bohong',
    'JAM DINDING': 'Jam Dinding Bohong'
  };

  if (targetId === 'p1') {
    if (P1_SOLUTIONS[normalized]) {
      isCorrect = true;
      solutionText = P1_SOLUTIONS[normalized];
    }
  } else if (targetId === 'p2') {
    if (P2_SOLUTIONS[normalized]) {
      isCorrect = true;
      solutionText = P2_SOLUTIONS[normalized];
    }
  }

  return res.status(200).json({
    success: isCorrect,
    verified: isCorrect,
    text: isCorrect ? solutionText : null
  });
};
