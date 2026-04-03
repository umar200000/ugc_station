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
        tariff: true,
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
        user: { select: { telegramId: true, username: true, phone: true, photoUrl: true, createdAt: true } },
        _count: { select: { applications: true } },
        applications: {
          where: { status: 'ACCEPTED' },
          select: { _count: { select: { submissions: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Flatten data
    const result = influencers.map(i => ({
      ...i,
      acceptedCount: i.applications.length,
      videoCount: i.applications.reduce((sum, a) => sum + (a._count?.submissions || 0), 0),
      applications: undefined,
    }));
    res.json({ influencers: result });
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

// ========== TARIFLAR ==========

// Barcha tariflar
router.get('/tariffs', async (req, res) => {
  try {
    const tariffs = await req.prisma.tariff.findMany({
      include: { _count: { select: { companies: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ tariffs });
  } catch (err) {
    console.error('Admin get tariffs error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Tarif yaratish
router.post('/tariffs', async (req, res) => {
  try {
    const { name, price, tokens } = req.body;
    if (!name || price == null || tokens == null) return res.status(400).json({ error: 'Barcha maydonlar to\'ldirilishi shart' });
    const tariff = await req.prisma.tariff.create({ data: { name, price: Number(price), tokens: Number(tokens) } });
    res.json({ tariff });
  } catch (err) {
    console.error('Admin create tariff error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Tarif tahrirlash
router.put('/tariffs/:id', async (req, res) => {
  try {
    const { name, price, tokens } = req.body;
    const tariff = await req.prisma.tariff.update({
      where: { id: req.params.id },
      data: { name, price: Number(price), tokens: Number(tokens) },
    });
    res.json({ tariff });
  } catch (err) {
    console.error('Admin update tariff error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Tarif o'chirish
router.delete('/tariffs/:id', async (req, res) => {
  try {
    await req.prisma.tariff.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('Admin delete tariff error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Kompaniyaga tarif biriktirish va token berish
router.post('/companies/:id/assign-tariff', async (req, res) => {
  try {
    const { tariffId } = req.body;
    const tariff = await req.prisma.tariff.findUnique({ where: { id: tariffId } });
    if (!tariff) return res.status(404).json({ error: 'Tarif topilmadi' });

    const company = await req.prisma.company.update({
      where: { id: req.params.id },
      data: { tariffId, tokens: { increment: tariff.tokens } },
      include: { tariff: true, user: true },
    });

    await req.prisma.tokenHistory.create({
      data: { companyId: req.params.id, type: 'TARIFF', tokens: tariff.tokens, note: tariff.name },
    });

    notify(company.userId, {
      title: 'Token qo\'shildi!',
      message: `"${tariff.name}" tarifi orqali +${tariff.tokens} token qo'shildi`,
      type: 'info',
      link: '/profile',
      telegramMsg: `🎯 <b>Token qo'shildi!</b>\n\n📦 Tarif: <b>${tariff.name}</b>\n➕ Token: <b>+${tariff.tokens}</b>\n💰 Jami: <b>${company.tokens}</b> token`,
    });

    res.json({ company });
  } catch (err) {
    console.error('Admin assign tariff error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Kompaniyaga bonus token berish
router.post('/companies/:id/bonus-tokens', async (req, res) => {
  try {
    const { tokens } = req.body;
    if (!tokens || tokens < 1) return res.status(400).json({ error: 'Token soni noto\'g\'ri' });
    const company = await req.prisma.company.update({
      where: { id: req.params.id },
      data: { tokens: { increment: Number(tokens) } },
      include: { tariff: true, user: true },
    });

    await req.prisma.tokenHistory.create({
      data: { companyId: req.params.id, type: 'BONUS', tokens: Number(tokens), note: 'Bonus' },
    });

    notify(company.userId, {
      title: 'Bonus token!',
      message: `Admin tomonidan +${tokens} bonus token berildi`,
      type: 'info',
      link: '/profile',
      telegramMsg: `🎁 <b>Bonus token!</b>\n\n➕ Token: <b>+${tokens}</b>\n💰 Jami: <b>${company.tokens}</b> token`,
    });

    res.json({ company });
  } catch (err) {
    console.error('Admin bonus tokens error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Kompaniyadan token yechib olish
router.post('/companies/:id/revoke-tokens', async (req, res) => {
  try {
    const { tokens } = req.body;
    if (!tokens || tokens < 1) return res.status(400).json({ error: 'Token soni noto\'g\'ri' });

    const company = await req.prisma.company.findUnique({ where: { id: req.params.id } });
    if (!company) return res.status(404).json({ error: 'Kompaniya topilmadi' });

    const revokeAmount = Math.min(Number(tokens), company.tokens);

    const updated = await req.prisma.company.update({
      where: { id: req.params.id },
      data: { tokens: { decrement: revokeAmount } },
      include: { tariff: true },
    });

    await req.prisma.tokenHistory.create({
      data: { companyId: req.params.id, type: 'REVOKE', tokens: -revokeAmount, note: 'Admin tomonidan yechib olindi' },
    });

    res.json({ company: updated });
  } catch (err) {
    console.error('Admin revoke tokens error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Kompaniya token tarixi
router.get('/companies/:id/token-history', async (req, res) => {
  try {
    const history = await req.prisma.tokenHistory.findMany({
      where: { companyId: req.params.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ history });
  } catch (err) {
    console.error('Admin token history error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// ========== BROADCAST ==========
router.post('/broadcast', async (req, res) => {
  try {
    const { message, role } = req.body;
    if (!message || !role) return res.status(400).json({ error: 'Xabar va rol kerak' });

    const where = { onboarded: true };
    if (role === 'INFLUENCER') where.role = 'INFLUENCER';
    else if (role === 'COMPANY') where.role = 'COMPANY';

    const users = await req.prisma.user.findMany({ where, select: { id: true, telegramId: true } });

    let sent = 0;
    for (const user of users) {
      try {
        await notify(user.id, {
          title: 'Admin xabari',
          message,
          type: 'info',
          link: '/',
          telegramMsg: `📢 <b>Admin xabari</b>\n\n${message}`,
        });
        sent++;
      } catch {}
    }

    res.json({ sent, total: users.length });
  } catch (err) {
    console.error('Broadcast error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// ========== INFLUENCER LEVEL ==========

// Influencer levelini o'zgartirish
router.patch('/influencer/:id/level', async (req, res) => {
  try {
    const { level } = req.body;
    if (![1, 2, 3].includes(level)) return res.status(400).json({ error: 'Level 1, 2 yoki 3 bo\'lishi kerak' });
    const influencer = await req.prisma.influencer.update({
      where: { id: req.params.id },
      data: { level },
    });
    res.json({ influencer });
  } catch (err) {
    console.error('Admin change level error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// ========== LEVEL NARXLARI ==========

// Level narxlarini olish
router.get('/level-prices', async (req, res) => {
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
    console.error('Admin get level prices error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Level narxlarini yangilash
router.put('/level-prices', async (req, res) => {
  try {
    const { level1, level2, level3 } = req.body;
    if (level1 != null) await req.prisma.setting.upsert({ where: { key: 'level_1_price' }, update: { value: String(level1) }, create: { key: 'level_1_price', value: String(level1) } });
    if (level2 != null) await req.prisma.setting.upsert({ where: { key: 'level_2_price' }, update: { value: String(level2) }, create: { key: 'level_2_price', value: String(level2) } });
    if (level3 != null) await req.prisma.setting.upsert({ where: { key: 'level_3_price' }, update: { value: String(level3) }, create: { key: 'level_3_price', value: String(level3) } });
    res.json({ success: true });
  } catch (err) {
    console.error('Admin update level prices error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// ========== INFLUENCER TARIFLAR ==========

router.get('/influencer-tariffs', async (req, res) => {
  try {
    const tariffs = await req.prisma.influencerTariff.findMany({
      include: { _count: { select: { influencers: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ tariffs });
  } catch (err) { res.status(500).json({ error: 'Xatolik' }); }
});

router.post('/influencer-tariffs', async (req, res) => {
  try {
    const { name, price, dailyTokens, durationDays } = req.body;
    if (!name || !price || !dailyTokens) return res.status(400).json({ error: 'Barcha maydonlarni to\'ldiring' });
    const tariff = await req.prisma.influencerTariff.create({
      data: { name, price: Number(price), dailyTokens: Number(dailyTokens), durationDays: Number(durationDays) || 30 },
    });
    res.json({ tariff });
  } catch (err) { res.status(500).json({ error: 'Xatolik' }); }
});

router.put('/influencer-tariffs/:id', async (req, res) => {
  try {
    const { name, price, dailyTokens, durationDays } = req.body;
    const tariff = await req.prisma.influencerTariff.update({
      where: { id: req.params.id },
      data: { name, price: Number(price), dailyTokens: Number(dailyTokens), durationDays: Number(durationDays) || 30 },
    });
    res.json({ tariff });
  } catch (err) { res.status(500).json({ error: 'Xatolik' }); }
});

router.delete('/influencer-tariffs/:id', async (req, res) => {
  try {
    await req.prisma.influencerTariff.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { res.status(500).json({ error: 'Xatolik' }); }
});

// Influencerga tarif yoqish
router.post('/influencer/:id/assign-tariff', async (req, res) => {
  try {
    const { tariffId } = req.body;
    const tariff = await req.prisma.influencerTariff.findUnique({ where: { id: tariffId } });
    if (!tariff) return res.status(404).json({ error: 'Tarif topilmadi' });
    const now = new Date();
    const end = new Date(now.getTime() + tariff.durationDays * 24 * 60 * 60 * 1000);
    const influencer = await req.prisma.influencer.update({
      where: { id: req.params.id },
      data: {
        influencerTariffId: tariffId,
        tariffStartDate: now,
        tariffEndDate: end,
        tokens: tariff.dailyTokens,
        lastTokenRefresh: now,
      },
      include: { user: true },
    });

    await req.prisma.tokenHistory.create({
      data: { influencerId: req.params.id, type: 'TARIFF', tokens: tariff.dailyTokens, note: `${tariff.name} (${tariff.durationDays} kun)` },
    });

    notify(influencer.userId, {
      title: 'Tarif yoqildi!',
      message: `"${tariff.name}" tarifi yoqildi. Kuniga ${tariff.dailyTokens} token, ${tariff.durationDays} kun`,
      type: 'info',
      link: '/profile',
      telegramMsg: `🎯 <b>Tarif yoqildi!</b>\n\n📦 Tarif: <b>${tariff.name}</b>\n➕ Kunlik token: <b>${tariff.dailyTokens}</b>\n📅 Muddat: <b>${tariff.durationDays} kun</b>`,
    });

    res.json({ influencer });
  } catch (err) { res.status(500).json({ error: 'Xatolik' }); }
});

// Influencerga bonus token
router.post('/influencer/:id/bonus-tokens', async (req, res) => {
  try {
    const { tokens } = req.body;
    if (!tokens || tokens < 1) return res.status(400).json({ error: 'Token soni noto\'g\'ri' });
    const influencer = await req.prisma.influencer.update({
      where: { id: req.params.id },
      data: { tokens: { increment: Number(tokens) } },
      include: { user: true },
    });

    await req.prisma.tokenHistory.create({
      data: { influencerId: req.params.id, type: 'BONUS', tokens: Number(tokens), note: 'Bonus' },
    });

    notify(influencer.userId, {
      title: 'Bonus token!',
      message: `Admin tomonidan +${tokens} bonus token berildi`,
      type: 'info',
      link: '/profile',
      telegramMsg: `🎁 <b>Bonus token!</b>\n\n➕ Token: <b>+${tokens}</b>\n💰 Jami: <b>${influencer.tokens}</b> token`,
    });

    res.json({ influencer });
  } catch (err) { res.status(500).json({ error: 'Xatolik' }); }
});

module.exports = router;
