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
  var SOLUTIONS = {
    p1: 'PELAKU ADA DI GUDANG',
    p2: 'JAM MUSIK BOHONG',
    calc: 'Jakee999!!'
  };

  if (!targetId || !SOLUTIONS[targetId]) {
    return res.status(400).json({ error: 'Target atau ID teka-teki tidak valid' });
  }

  // Verifikasi Kunci Kalkulator
  if (targetId === 'calc') {
    var inputPwd = (body.password !== undefined ? body.password : body.answer) || '';
    var isCalcOk = inputPwd === SOLUTIONS.calc;
    return res.status(200).json({
      success: isCalcOk,
      verified: isCalcOk
    });
  }

  // Verifikasi Sandi Teka-Teki Matematika (p1 & p2)
  var normalized = (body.answer || '').trim().toUpperCase().replace(/\s+/g, ' ');
  var isCorrect = normalized === SOLUTIONS[targetId];

  return res.status(200).json({
    success: isCorrect,
    verified: isCorrect,
    text: isCorrect ? (targetId === 'p1' ? 'Pelaku Ada Di Gudang' : 'Jam Musik Bohong') : null
  });
};
