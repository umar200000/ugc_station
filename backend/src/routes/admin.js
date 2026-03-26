const express = require('express');
const jwt = require('jsonwebtoken');
const { authMiddleware, adminOnly } = require('../middleware/auth');

const router = express.Router();

// ========== ADMIN LOGIN (parol bilan) ==========
router.post('/login', async (req, res) => {
  try {
    const { password } = req.body;
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (password !== adminPassword) {
      return res.status(401).json({ error: 'Parol noto\'g\'ri' });
    }

    // Admin token yaratish
    const token = jwt.sign(
      { userId: 'super-admin', role: 'ADMIN' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// ========== HIMOYALANGAN ROUTELAR ==========
router.use(authMiddleware, adminOnly);

// Dashboard statistika
router.get('/stats', async (req, res) => {
  try {
    const [users, companies, influencers, ads, applications] = await Promise.all([
      req.prisma.user.count(),
      req.prisma.company.count(),
      req.prisma.influencer.count(),
      req.prisma.ad.count(),
      req.prisma.application.count(),
    ]);
    const activeAds = await req.prisma.ad.count({ where: { status: 'ACTIVE' } });
    const acceptedApps = await req.prisma.application.count({ where: { status: 'ACCEPTED' } });

    res.json({ users, companies, influencers, ads, activeAds, applications, acceptedApps });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Barcha foydalanuvchilar
router.get('/users', async (req, res) => {
  try {
    const users = await req.prisma.user.findMany({
      include: {
        company: { select: { name: true } },
        influencer: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ users });
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// User o'chirish
router.delete('/user/:id', async (req, res) => {
  try {
    await req.prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete user error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Barcha kompaniyalar
router.get('/companies', async (req, res) => {
  try {
    const companies = await req.prisma.company.findMany({
      include: {
        user: { select: { telegramId: true, username: true, phone: true, createdAt: true } },
        _count: { select: { ads: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ companies });
  } catch (err) {
    console.error('Admin get companies error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Barcha influenserlar
router.get('/influencers', async (req, res) => {
  try {
    const influencers = await req.prisma.influencer.findMany({
      include: {
        user: { select: { telegramId: true, username: true, phone: true, createdAt: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ influencers });
  } catch (err) {
    console.error('Admin get influencers error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Barcha e'lonlar
router.get('/ads', async (req, res) => {
  try {
    const ads = await req.prisma.ad.findMany({
      include: {
        company: { select: { name: true } },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({
      ads: ads.map((ad) => ({
        ...ad,
        images: (() => { try { return JSON.parse(ad.images || '[]'); } catch { return []; } })(),
        platforms: (() => { try { return JSON.parse(ad.platforms || '[]'); } catch { return []; } })(),
      })),
    });
  } catch (err) {
    console.error('Admin get ads error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Kompaniya o'chirish
router.delete('/company/:id', async (req, res) => {
  try {
    const company = await req.prisma.company.findUnique({ where: { id: req.params.id } });
    if (!company) return res.status(404).json({ error: 'Topilmadi' });
    await req.prisma.user.delete({ where: { id: company.userId } });
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete company error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Influenser o'chirish
router.delete('/influencer/:id', async (req, res) => {
  try {
    const influencer = await req.prisma.influencer.findUnique({ where: { id: req.params.id } });
    if (!influencer) return res.status(404).json({ error: 'Topilmadi' });
    await req.prisma.user.delete({ where: { id: influencer.userId } });
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete influencer error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// E'lon o'chirish
router.delete('/ad/:id', async (req, res) => {
  try {
    await req.prisma.ad.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete ad error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

module.exports = router;
