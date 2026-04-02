const express = require('express');
const { authMiddleware, influencerOnly, companyOnly } = require('../middleware/auth');
const { notify } = require('../utils/notify');

const router = express.Router();

// Qiziqish bildirish (influenser)
router.post('/', authMiddleware, influencerOnly, async (req, res) => {
  try {
    const { adId } = req.body;

    const influencer = await req.prisma.influencer.findUnique({
      where: { userId: req.user.userId },
      include: { user: true },
    });

    if (!influencer) {
      return res.status(400).json({ error: 'Influenser profili topilmadi' });
    }

    // E'lon mavjudligini tekshirish
    const ad = await req.prisma.ad.findUnique({
      where: { id: adId },
      include: {
        company: { include: { user: true } },
        _count: { select: { applications: { where: { status: 'ACCEPTED' } } } },
      },
    });

    if (!ad || ad.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'E\'lon faol emas' });
    }

    // Slot tekshirish
    if (ad._count.applications >= ad.influencerCount) {
      return res.status(400).json({ error: 'E\'londa bo\'sh joy qolmagan' });
    }

    // Avval ariza berganmi tekshirish
    const existing = await req.prisma.application.findFirst({
      where: { adId, influencerId: influencer.id },
    });

    if (existing) {
      return res.status(400).json({ error: 'Siz allaqachon ariza bergansiz' });
    }

    // Influencer token tekshirish
    if (influencer.tokens <= 0) {
      return res.status(400).json({ error: 'Tokenlar yetarli emas. Tarif sotib oling.' });
    }

    // Token kamaytirish
    const updatedInf = await req.prisma.influencer.update({
      where: { id: influencer.id },
      data: { tokens: { decrement: 1 } },
    });

    // Token history
    await req.prisma.tokenHistory.create({
      data: { influencerId: influencer.id, type: 'APPLICATION', tokens: -1, note: `Ariza: ${ad.title}` },
    });

    // Telegram SMS
    const { sendTelegram } = require('../utils/notify');
    sendTelegram(influencer.user.telegramId, `📩 <b>Ariza yuborildi</b>\n\n📢 E'lon: <b>${ad.title}</b>\n➖ Sarflangan: <b>1 token</b>\n💰 Qolgan: <b>${updatedInf.tokens} token</b>`);

    const application = await req.prisma.application.create({
      data: {
        adId,
        influencerId: influencer.id,
      },
      include: { ad: { include: { company: true } }, influencer: true },
    });

    // Kompaniyaga notification
    if (ad.company?.userId) {
      notify(ad.company.userId, {
        title: 'Yangi ariza!',
        message: `${influencer.name} "${ad.title}" e'loniga ariza yubordi`,
        type: 'application',
        link: `/ad/${ad.id}/applications`,
        telegramMsg: `📩 <b>Yangi ariza!</b>\n\n📢 E'lon: <b>${ad.title}</b>\n👤 Influenser: <b>${influencer.name}</b>\n\nMini App ni ochib arizani ko'ring!`,
      });
    }

    res.status(201).json(application);
  } catch (err) {
    console.error('Apply error:', err);
    res.status(500).json({ error: 'Ariza yuborishda xatolik' });
  }
});

// Kompaniya — e'loniga kelgan arizalar
router.get('/ad/:adId', authMiddleware, companyOnly, async (req, res) => {
  try {
    const company = await req.prisma.company.findUnique({
      where: { userId: req.user.userId },
    });

    const ad = await req.prisma.ad.findUnique({ where: { id: req.params.adId } });

    if (!ad || ad.companyId !== company.id) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const applications = await req.prisma.application.findMany({
      where: { adId: req.params.adId },
      include: {
        influencer: {
          include: {
            user: { select: { username: true, photoUrl: true, phone: true } },
            reviews: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  } catch (err) {
    console.error('Get applications error:', err);
    res.status(500).json({ error: 'Arizalarni olishda xatolik' });
  }
});

// Tasdiqlash / Rad etish
router.patch('/:id/status', authMiddleware, companyOnly, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Noto\'g\'ri status' });
    }

    const application = await req.prisma.application.findUnique({
      where: { id: req.params.id },
      include: { ad: true },
    });

    if (!application) {
      return res.status(404).json({ error: 'Ariza topilmadi' });
    }

    const company = await req.prisma.company.findUnique({
      where: { userId: req.user.userId },
    });

    if (application.ad.companyId !== company.id) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    // Agar ACCEPTED bo'lsa — slot tekshirish + token kamaytirish
    if (status === 'ACCEPTED') {
      const acceptedCount = await req.prisma.application.count({
        where: { adId: application.adId, status: 'ACCEPTED' },
      });

      if (acceptedCount >= application.ad.influencerCount) {
        return res.status(400).json({ error: 'Barcha slotlar to\'lgan' });
      }

    }

    const updated = await req.prisma.application.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        influencer: { include: { user: true } },
        ad: { include: { company: { include: { user: true } } } },
      },
    });

    // Influenserga notification
    if (updated.influencer?.userId) {
      const companyPhone = updated.ad?.company?.user?.phone || '';
      if (status === 'ACCEPTED') {
        notify(updated.influencer.userId, {
          title: 'Ariza qabul qilindi!',
          message: `"${updated.ad.title}" e'loniga arizangiz qabul qilindi. Kompaniya: ${updated.ad.company.name}`,
          type: 'accepted',
          link: '/my-applications',
          telegramMsg: `✅ <b>Arizangiz qabul qilindi!</b>\n\n📢 E'lon: <b>${updated.ad.title}</b>\n🏢 Kompaniya: <b>${updated.ad.company.name}</b>\n📞 Telefon: <b>${companyPhone || 'Belgilanmagan'}</b>\n\nKompaniya bilan bog'laning!`,
        });
      } else {
        notify(updated.influencer.userId, {
          title: 'Ariza rad etildi',
          message: `"${updated.ad.title}" e'loniga arizangiz rad etildi`,
          type: 'rejected',
          link: '/my-applications',
          telegramMsg: `❌ <b>Arizangiz rad etildi</b>\n\n📢 E'lon: <b>${updated.ad.title}</b>\n🏢 Kompaniya: <b>${updated.ad.company.name}</b>\n\nBoshqa e'lonlarga ariza berishingiz mumkin!`,
        });
      }
    }

    res.json(updated);
  } catch (err) {
    console.error('Update application error:', err);
    res.status(500).json({ error: 'Ariza statusini yangilashda xatolik' });
  }
});

// Influenserning o'z arizalari
router.get('/my', authMiddleware, influencerOnly, async (req, res) => {
  try {
    const influencer = await req.prisma.influencer.findUnique({
      where: { userId: req.user.userId },
    });

    const applications = await req.prisma.application.findMany({
      where: { influencerId: influencer.id },
      include: {
        ad: { include: { company: { include: { user: { select: { phone: true } } } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(applications);
  } catch (err) {
    console.error('My applications error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

module.exports = router;
