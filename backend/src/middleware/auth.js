const jwt = require('jsonwebtoken');

// Telegram WebApp initData tekshirish va JWT token yaratish/tekshirish
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token topilmadi' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token yaroqsiz' });
  }
}

// Faqat kompaniya uchun
function companyOnly(req, res, next) {
  if (req.user.role !== 'COMPANY') {
    return res.status(403).json({ error: 'Faqat kompaniya uchun' });
  }
  next();
}

// Faqat influenser uchun
function influencerOnly(req, res, next) {
  if (req.user.role !== 'INFLUENCER') {
    return res.status(403).json({ error: 'Faqat influenser uchun' });
  }
  next();
}

// Admin uchun
function adminOnly(req, res, next) {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Faqat admin uchun' });
  }
  next();
}

module.exports = { authMiddleware, companyOnly, influencerOnly, adminOnly };
