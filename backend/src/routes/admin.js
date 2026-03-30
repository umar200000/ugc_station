const express = require('express');
const jwt = require('jsonwebtoken');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { notify } = require('../utils/notify');

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
    const [users, companies, influencers, ads, applications, submissions] = await Promise.all([
      req.prisma.user.count(),
      req.prisma.company.count(),
      req.prisma.influencer.count(),
      req.prisma.ad.count(),
      req.prisma.application.count(),
      req.prisma.submission.count(),
    ]);
    const activeAds = await req.prisma.ad.count({ where: { status: 'ACTIVE' } });
    const acceptedApps = await req.prisma.application.count({ where: { status: 'ACCEPTED' } });
    const approvedVideos = await req.prisma.submission.count({ where: { status: 'APPROVED' } });
    const pendingApps = await req.prisma.application.count({ where: { status: 'PENDING' } });
    const pendingVideos = await req.prisma.submission.count({ where: { status: 'PENDING' } });

    res.json({ users, companies, influencers, ads, activeAds, applications, acceptedApps, submissions, approvedVideos, pendingApps, pendingVideos });
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

// Barcha arizalar
router.get('/applications', async (req, res) => {
  try {
    const applications = await req.prisma.application.findMany({
      include: {
        influencer: { include: { user: { select: { username: true, phone: true, photoUrl: true } } } },
        ad: { include: { company: { select: { name: true } } } },
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ applications });
  } catch (err) {
    console.error('Admin get applications error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Barcha videolar
router.get('/submissions', async (req, res) => {
  try {
    const submissions = await req.prisma.submission.findMany({
      include: {
        application: {
          include: {
            influencer: { include: { user: { select: { username: true, photoUrl: true } } } },
            ad: { select: { title: true, company: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ submissions });
  } catch (err) {
    console.error('Admin get submissions error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Ariza statusini o'zgartirish
router.patch('/application/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['PENDING', 'ACCEPTED', 'REJECTED'].includes(status)) return res.status(400).json({ error: 'Noto\'g\'ri status' });
    const app = await req.prisma.application.update({ where: { id: req.params.id }, data: { status } });
    res.json(app);
  } catch (err) { res.status(500).json({ error: 'Xatolik' }); }
});

// Video statusini o'zgartirish (Admin tekshiruvi)
router.patch('/submission/:id/status', async (req, res) => {
  try {
    const { status, comment } = req.body;
    if (!['PENDING', 'APPROVED', 'REJECTED'].includes(status)) return res.status(400).json({ error: 'Noto\'g\'ri status' });

    const submission = await req.prisma.submission.findUnique({
      where: { id: req.params.id },
      include: {
        application: {
          include: {
            influencer: { include: { user: true } },
            ad: { include: { company: { include: { user: true } } } },
          },
        },
      },
    });
    if (!submission) return res.status(404).json({ error: 'Topilmadi' });

    const updated = await req.prisma.submission.update({
      where: { id: req.params.id },
      data: { status, comment: comment || null, reviewedBy: 'ADMIN' },
    });

    const adTitle = submission.application.ad.title;
    const companyName = submission.application.ad.company.name;
    const influencerName = submission.application.influencer.name;
    const commentLine = comment ? `\n💬 Izoh: ${comment}` : '';
    const commentHtml = comment ? `\n💬 Izoh: <b>${comment}</b>` : '';

    if (status === 'APPROVED') {
      // Kompaniyaga xabar — yangi video tayyor
      notify(submission.application.ad.company.userId, {
        title: 'Video tasdiqlandi (Admin)',
        message: `"${adTitle}" uchun ${influencerName} dan video admin tomonidan tasdiqlandi.${commentLine}`,
        type: 'video',
        link: `/ad/${submission.application.adId}/applications`,
        telegramMsg: `✅ <b>Video tasdiqlandi — Admin</b>\n\n📢 E'lon: <b>${adTitle}</b>\n👤 Influenser: <b>${influencerName}</b>\n🏢 Kompaniya: <b>${companyName}</b>${commentHtml}\n\nAdmin tomonidan tasdiqlangan video mini app da ko'rishingiz mumkin.`,
      });

      // Influenserga xabar — video tasdiqlandi
      notify(submission.application.influencer.userId, {
        title: 'Video tasdiqlandi!',
        message: `"${adTitle}" uchun videongiz admin tomonidan tasdiqlandi.${commentLine}`,
        type: 'approved',
        link: '/my-applications',
        telegramMsg: `✅ <b>Videongiz tasdiqlandi!</b>\n\n📢 E'lon: <b>${adTitle}</b>\n🏢 Kompaniya: <b>${companyName}</b>${commentHtml}\n\nAdmin tomonidan tasdiqlandi! 🎉`,
      });
    } else if (status === 'REJECTED') {
      // Influenserga xabar — admin rad etdi
      notify(submission.application.influencer.userId, {
        title: 'Video rad etildi (Admin)',
        message: `"${adTitle}" uchun video admin tomonidan rad etildi.${commentLine}`,
        type: 'rejected',
        link: '/my-applications',
        telegramMsg: `❌ <b>Video rad etildi (Admin)</b>\n\n📢 E'lon: <b>${adTitle}</b>\n🏢 Kompaniya: <b>${companyName}</b>${commentHtml}\n\nYangi video yuklashingiz mumkin.`,
      });
    }

    res.json(updated);
  } catch (err) {
    console.error('Admin submission status error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// E'lon statusini o'zgartirish
router.patch('/ad/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['ACTIVE', 'CLOSED'].includes(status)) return res.status(400).json({ error: 'Noto\'g\'ri status' });
    const ad = await req.prisma.ad.update({ where: { id: req.params.id }, data: { status } });
    res.json(ad);
  } catch (err) { res.status(500).json({ error: 'Xatolik' }); }
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

// Video o'chirish
router.delete('/submission/:id', async (req, res) => {
  try {
    await req.prisma.submission.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete submission error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

module.exports = router;
