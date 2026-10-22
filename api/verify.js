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

  // Verifikasi Sandi Teka-Teki Matematika (p1 & p2)
  var normalized = (body.answer || '').trim().toUpperCase().replace(/\s+/g, ' ');
  var isCorrect = false;
  var solutionText = null;

  if (targetId === 'p1') {
    isCorrect = normalized === 'PELAKU ADA DI GUDANG';
    solutionText = 'Pelaku Ada Di Gudang';
  } else if (targetId === 'p2') {
    isCorrect = normalized === 'JAM DINDING BOHONG' || normalized === 'JAM MUSIK BOHONG' || normalized === 'JAM DINDING';
    solutionText = 'Jam Dinding Bohong';
  }

  return res.status(200).json({
    success: isCorrect,
    verified: isCorrect,
    text: isCorrect ? solutionText : null
  });
};
