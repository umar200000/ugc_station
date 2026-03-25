const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Influenserlar katalogi
router.get('/influencers', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query;

    const where = {
      user: { role: 'INFLUENCER', onboarded: true },
    };

    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { bio: { contains: search } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [influencers, total] = await Promise.all([
      req.prisma.influencer.findMany({
        where,
        include: {
          user: { select: { username: true, photoUrl: true } },
          reviews: { select: { rating: true } },
          _count: { select: { applications: { where: { status: 'ACCEPTED' } } } },
        },
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      req.prisma.influencer.count({ where }),
    ]);

    res.json({
      influencers: influencers.map((inf) => ({
        ...inf,
        avgRating: inf.reviews.length
          ? Math.round((inf.reviews.reduce((s, r) => s + r.rating, 0) / inf.reviews.length) * 10) / 10
          : 0,
        completedCollabs: inf._count.applications,
      })),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error('Get influencers error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Influenser profili (batafsil)
router.get('/influencer/:id', async (req, res) => {
  try {
    const influencer = await req.prisma.influencer.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { username: true, photoUrl: true, createdAt: true } },
        reviews: {
          include: { company: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { applications: { where: { status: 'ACCEPTED' } } } },
      },
    });

    if (!influencer) {
      return res.status(404).json({ error: 'Influenser topilmadi' });
    }

    const avgRating = influencer.reviews.length
      ? Math.round(
          (influencer.reviews.reduce((s, r) => s + r.rating, 0) / influencer.reviews.length) * 10
        ) / 10
      : 0;

    res.json({
      ...influencer,
      avgRating,
      completedCollabs: influencer._count.applications,
    });
  } catch (err) {
    console.error('Get influencer error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Profil yangilash
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (user.role === 'COMPANY') {
      const company = await req.prisma.company.update({
        where: { userId: user.id },
        data: {
          name: req.body.name,
          industry: req.body.industry,
          logo: req.body.logo,
          description: req.body.description,
        },
      });
      return res.json(company);
    }

    if (user.role === 'INFLUENCER') {
      const influencer = await req.prisma.influencer.update({
        where: { userId: user.id },
        data: {
          name: req.body.name,
          bio: req.body.bio,
          category: req.body.category,
          socialLinks: JSON.stringify(req.body.socialLinks || {}),
        },
      });
      return res.json(influencer);
    }

    res.status(400).json({ error: 'Rol aniqlanmagan' });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Profil yangilashda xatolik' });
  }
});

module.exports = router;
