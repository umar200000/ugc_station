const express = require('express');
const { authMiddleware, companyOnly } = require('../middleware/auth');
const { broadcastAll, notify } = require('../utils/notify');

const router = express.Router();

// JSON string → array helper
function parseJsonField(val) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val || '[]'); } catch { return []; }
}

// Ad ni frontend formatga o'tkazish
function formatAd(ad) {
  return {
    ...ad,
    images: parseJsonField(ad.images),
    platforms: parseJsonField(ad.platforms),
    acceptedCount: ad._count?.applications || 0,
    slotsLeft: ad.influencerCount - (ad._count?.applications || 0),
  };
}

// Public stats — user count for feed header
router.get('/public-stats', async (req, res) => {
  try {
    const users = await req.prisma.user.count();
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Barcha faol e'lonlar (influenserlar uchun lenta)
router.get('/', async (req, res) => {
  try {
    const { industry, adType, videoFormat, search, page = 1, limit = 20 } = req.query;

    const where = {};
    if (industry) where.industry = industry;
    if (adType) where.adType = adType;
    if (videoFormat) where.videoFormat = videoFormat;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [ads, total] = await Promise.all([
      req.prisma.ad.findMany({
        where,
        include: {
          company: { include: { user: { select: { photoUrl: true } } } },
          _count: { select: { applications: { where: { status: 'ACCEPTED' } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      req.prisma.ad.count({ where }),
    ]);

    // Platform filtri (SQLite da array qo'llab-quvvatlanmaydi)
    let filtered = ads;
    if (req.query.platform) {
      filtered = ads.filter((ad) => parseJsonField(ad.platforms).includes(req.query.platform));
    }

    res.json({
      ads: filtered.map(formatAd),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('Get ads error:', err);
    res.status(500).json({ error: "E'lonlarni olishda xatolik" });
  }
});

// ⚠️ /my/list dan oldin qo'yilishi kerak (/:id bilan conflict bo'lmasligi uchun)
router.get('/my/list', authMiddleware, companyOnly, async (req, res) => {
  try {
    const company = await req.prisma.company.findUnique({
      where: { userId: req.user.userId },
    });

    const ads = await req.prisma.ad.findMany({
      where: { companyId: company.id },
      include: { _count: { select: { applications: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(ads.map(formatAd));
  } catch (err) {
    console.error('My ads error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Bitta e'lon batafsil
router.get('/:id', async (req, res) => {
  try {
    const ad = await req.prisma.ad.findUnique({
      where: { id: req.params.id },
      include: {
        company: {
          include: {
            user: { select: { photoUrl: true, username: true } },
            reviews: { select: { rating: true } },
          },
        },
        _count: { select: { applications: { where: { status: 'ACCEPTED' } } } },
      },
    });

    if (!ad) {
      return res.status(404).json({ error: "E'lon topilmadi" });
    }

    const avgRating = ad.company.reviews.length
      ? ad.company.reviews.reduce((sum, r) => sum + r.rating, 0) / ad.company.reviews.length
      : 0;

    // Influencer ariza holatini tekshirish
    let myApplication = null;
    if (req.query.userId) {
      const influencer = await req.prisma.influencer.findUnique({
        where: { userId: req.query.userId },
      });
      if (influencer) {
        myApplication = await req.prisma.application.findFirst({
          where: { adId: ad.id, influencerId: influencer.id },
          select: { id: true, status: true },
        });
      }
    }

    res.json({
      ...formatAd(ad),
      companyRating: Math.round(avgRating * 10) / 10,
      myApplication,
    });
  } catch (err) {
    console.error('Get ad error:', err);
    res.status(500).json({ error: "E'lonni olishda xatolik" });
  }
});

// E'lon yaratish (faqat kompaniya)
router.post('/', authMiddleware, companyOnly, async (req, res) => {
  try {
    const company = await req.prisma.company.findUnique({
      where: { userId: req.user.userId },
    });

    if (!company) {
      return res.status(400).json({ error: 'Kompaniya profili topilmadi' });
    }

    const { title, description, images, videoFormat, faceType, platforms, influencerCount, adType, barterItem, payment } = req.body;
    const count = Number(influencerCount) || 1;
    const isBarter = adType === 'BARTER';

    // Token hisoblash: deposit = 1 per influencer, barter = 1-3→1, 4-5→2, 6+→3
    let tokenCost;
    if (isBarter) {
      tokenCost = Math.ceil(count / 3);
    } else {
      tokenCost = count;
    }

    if (company.tokens < tokenCost) {
      return res.status(400).json({ error: `Tokenlar yetarli emas. ${tokenCost} ta token kerak, sizda ${company.tokens} ta bor.` });
    }

    await req.prisma.company.update({
      where: { id: company.id },
      data: { tokens: { decrement: tokenCost } },
    });

    const ad = await req.prisma.ad.create({
      data: {
        companyId: company.id,
        title,
        description,
        images: JSON.stringify(images || []),
        videoFormat: videoFormat || 'ANY',
        faceType: faceType || 'ANY',
        platforms: JSON.stringify(platforms || []),
        influencerCount: count,
        adType: isBarter ? 'BARTER' : 'PAID',
        barterItem: isBarter ? (barterItem || '') : '',
        payment: isBarter ? (Number(payment) || 0) : 0,
        industry: company.industry,
      },
      include: { company: true },
    });

    res.status(201).json(formatAd(ad));

    // Token history
    await req.prisma.tokenHistory.create({
      data: { companyId: company.id, type: 'AD_CREATE', tokens: -tokenCost, note: `E'lon: ${title}` },
    });

    // Kompaniyaga Telegram SMS
    notify(company.userId, {
      title: 'E\'lon yaratildi',
      message: `"${title}" e'loni yaratildi. -${tokenCost} token sarflandi`,
      type: 'info',
      link: `/ad/${ad.id}`,
      telegramMsg: `📢 <b>E'lon yaratildi!</b>\n\n📌 <b>${title}</b>\n➖ Sarflangan: <b>${tokenCost} token</b>\n💰 Qolgan: <b>${company.tokens - tokenCost} token</b>`,
    });

    // Barcha userlarga yangi e'lon haqida xabar (Telegram + in-app)
    try {
      await broadcastAll({
        title: 'Yangi e\'lon!',
        message: `"${title}" — ${company.name}`,
        type: 'info',
        link: `/ad/${ad.id}`,
        telegramMsg: `📢 <b>Yangi e'lon!</b>\n\n📌 E'lon nomi: <b>${title}</b>\n🏢 E'lon beruvchi: <b>${company.name}</b>\n\nBatafsil ko'rish uchun mini app ni oching!`,
      });
    } catch (broadcastErr) {
      console.error('Broadcast error:', broadcastErr);
    }
  } catch (err) {
    console.error('Create ad error:', err);
    res.status(500).json({ error: "E'lon yaratishda xatolik" });
  }
});

// E'lonni tahrirlash
router.put('/:id', authMiddleware, companyOnly, async (req, res) => {
  try {
    const company = await req.prisma.company.findUnique({ where: { userId: req.user.userId } });
    const ad = await req.prisma.ad.findUnique({ where: { id: req.params.id } });

    if (!ad || ad.companyId !== company.id) {
      return res.status(403).json({ error: "Ruxsat yo'q" });
    }

    const { extraInfluencers, ...rest } = req.body;
    const data = { ...rest };
    if (data.images) data.images = JSON.stringify(data.images);
    if (data.platforms) data.platforms = JSON.stringify(data.platforms);
    // influencerCount ni o'zgartirishga ruxsat bermaslik
    delete data.influencerCount;

    // Qo'shimcha influencer qo'shish
    if (extraInfluencers && Number(extraInfluencers) > 0) {
      const extra = Number(extraInfluencers);
      const isBarter = ad.adType === 'BARTER';
      const oldCount = ad.influencerCount;
      const newCount = oldCount + extra;
      let tokenCost;
      if (isBarter) {
        tokenCost = Math.ceil(newCount / 3) - Math.ceil(oldCount / 3);
      } else {
        tokenCost = extra;
      }

      if (tokenCost > 0) {
        if (company.tokens < tokenCost) {
          return res.status(400).json({ error: `Tokenlar yetarli emas. ${tokenCost} ta token kerak.` });
        }
        await req.prisma.company.update({
          where: { id: company.id },
          data: { tokens: { decrement: tokenCost } },
        });
        await req.prisma.tokenHistory.create({
          data: { companyId: company.id, type: 'AD_CREATE', tokens: -tokenCost, note: `Qo'shimcha: ${ad.title}` },
        });
      }
      data.influencerCount = newCount;
    }

    const updated = await req.prisma.ad.update({
      where: { id: req.params.id },
      data,
      include: { company: true },
    });

    res.json(formatAd(updated));
  } catch (err) {
    console.error('Update ad error:', err);
    res.status(500).json({ error: "E'lonni yangilashda xatolik" });
  }
});

// E'lonni yopish
router.patch('/:id/close', authMiddleware, companyOnly, async (req, res) => {
  try {
    const company = await req.prisma.company.findUnique({ where: { userId: req.user.userId } });
    const ad = await req.prisma.ad.findUnique({ where: { id: req.params.id } });

    if (!ad || ad.companyId !== company.id) {
      return res.status(403).json({ error: "Ruxsat yo'q" });
    }

    const updated = await req.prisma.ad.update({
      where: { id: req.params.id },
      data: { status: 'CLOSED' },
    });

    res.json(formatAd(updated));
  } catch (err) {
    console.error('Close ad error:', err);
    res.status(500).json({ error: "E'lonni yopishda xatolik" });
  }
});

// E'lonni qayta ochish
router.patch('/:id/reactivate', authMiddleware, companyOnly, async (req, res) => {
  try {
    const company = await req.prisma.company.findUnique({ where: { userId: req.user.userId } });
    const ad = await req.prisma.ad.findUnique({ where: { id: req.params.id } });

    if (!ad || ad.companyId !== company.id) {
      return res.status(403).json({ error: "Ruxsat yo'q" });
    }

    const updated = await req.prisma.ad.update({
      where: { id: req.params.id },
      data: { status: 'ACTIVE' },
    });

    res.json(formatAd(updated));
  } catch (err) {
    console.error('Reactivate ad error:', err);
    res.status(500).json({ error: "E'lonni ochishda xatolik" });
  }
});

module.exports = router;
