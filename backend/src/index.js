require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth');
const adRoutes = require('./routes/ads');
const applicationRoutes = require('./routes/applications');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const uploadRoutes = require('./routes/upload');
const submissionRoutes = require('./routes/submissions');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));
app.use('/uploads', express.static('uploads'));

// Frontend static files (production build)
const path = require('path');
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Request context — prisma instance
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Admin web panel (alohida papkadan)
app.use('/admin-panel', express.static(path.join(__dirname, '../../admin')));

// Public tariflar
app.get('/api/tariffs', async (req, res) => {
  try {
    const tariffs = await req.prisma.tariff.findMany({ orderBy: { price: 'asc' } });
    res.json({ tariffs });
  } catch (err) {
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Public influencer tariffs
app.get('/api/influencer-tariffs', async (req, res) => {
  try {
    const tariffs = await req.prisma.influencerTariff.findMany({ orderBy: { price: 'asc' } });
    res.json({ tariffs });
  } catch (err) {
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Public level narxlari
app.get('/api/level-prices', async (req, res) => {
  try {
    const settings = await req.prisma.setting.findMany({
      where: { key: { in: ['level_1_price', 'level_2_price', 'level_3_price'] } },
    });
    const prices = {};
    settings.forEach(s => { prices[s.key] = Number(s.value); });
    res.json({
      level1: prices.level_1_price || 50000,
      level2: prices.level_2_price || 100000,
      level3: prices.level_3_price || 150000,
    });
  } catch (err) {
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Influencer earnings
const { authMiddleware: earningsAuth } = require('./middleware/auth');
app.get('/api/my-earnings', earningsAuth, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { influencer: true },
    });
    if (!user?.influencer) return res.json({ total: 0, paid: 0, barter: 0, history: [] });

    // Level narxlarini olish
    const settings = await req.prisma.setting.findMany({
      where: { key: { in: ['level_1_price', 'level_2_price', 'level_3_price'] } },
    });
    const prices = {};
    settings.forEach(s => { prices[s.key] = Number(s.value); });
    const levelPrice = prices[`level_${user.influencer.level || 1}_price`] || 50000;

    // Qabul qilingan arizalar
    const accepted = await req.prisma.application.findMany({
      where: { influencerId: user.influencer.id, status: 'ACCEPTED' },
      include: { ad: { select: { adType: true, payment: true, title: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });

    let total = 0, paid = 0, barter = 0;
    const history = accepted.map(app => {
      const isBarter = app.ad.adType === 'BARTER';
      const amount = isBarter ? (app.ad.payment || 0) : levelPrice;
      total += amount;
      if (isBarter) barter += amount; else paid += amount;
      return { id: app.id, title: app.ad.title, amount, type: isBarter ? 'BARTER' : 'PAID', date: app.createdAt };
    });

    const bonus = user.influencer.bonusEarnings || 0;
    res.json({ total: total + bonus, paid, barter, bonus, history });
  } catch (err) {
    console.error('Earnings error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Token history (auth required)
const { authMiddleware: authMw } = require('./middleware/auth');
app.get('/api/my-token-history', authMw, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { company: true, influencer: true },
    });
    if (!user) return res.status(404).json({ error: 'Topilmadi' });

    let history = [];
    if (user.company) {
      history = await req.prisma.tokenHistory.findMany({
        where: { companyId: user.company.id },
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.influencer) {
      history = await req.prisma.tokenHistory.findMany({
        where: { influencerId: user.influencer.id },
        orderBy: { createdAt: 'desc' },
      });
    }
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback — barcha boshqa route'lar uchun index.html qaytarish
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi`);
});

module.exports = app;
