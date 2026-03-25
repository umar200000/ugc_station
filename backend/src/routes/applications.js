const express = require('express');
const { authMiddleware, influencerOnly, companyOnly } = require('../middleware/auth');

const router = express.Router();

// Qiziqish bildirish (influenser)
router.post('/', authMiddleware, influencerOnly, async (req, res) => {
  try {
    const { adId } = req.body;

    const influencer = await req.prisma.influencer.findUnique({
      where: { userId: req.user.userId },
    });

    if (!influencer) {
      return res.status(400).json({ error: 'Influenser profili topilmadi' });
    }

    // E'lon mavjudligini tekshirish
    const ad = await req.prisma.ad.findUnique({
      where: { id: adId },
      include: { _count: { select: { applications: { where: { status: 'ACCEPTED' } } } } },
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

    const application = await req.prisma.application.create({
      data: {
        adId,
        influencerId: influencer.id,
      },
      include: { ad: { include: { company: true } }, influencer: true },
    });

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
            user: { select: { username: true, photoUrl: true } },
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

    // Agar ACCEPTED bo'lsa — slot tekshirish
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
      include: { influencer: { include: { user: true } }, ad: true },
    });

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
        ad: { include: { company: true } },
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
