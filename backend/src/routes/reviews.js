const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Reyting qo'yish (hamkorlik tugagandan keyin)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { applicationId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Reyting 1 dan 5 gacha bo\'lishi kerak' });
    }

    const application = await req.prisma.application.findUnique({
      where: { id: applicationId },
      include: { ad: true, influencer: true },
    });

    if (!application || application.status !== 'ACCEPTED') {
      return res.status(400).json({ error: 'Faqat tasdiqlangan hamkorlik uchun reyting qo\'yiladi' });
    }

    const user = await req.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { company: true, influencer: true },
    });

    let reviewData = {
      applicationId,
      rating: Number(rating),
      comment: comment || '',
    };

    // Kompaniya influenserni baholaydi
    if (user.role === 'COMPANY' && user.company) {
      reviewData.companyId = user.company.id;
      reviewData.influencerId = application.influencerId;
      reviewData.type = 'COMPANY_TO_INFLUENCER';
    }
    // Influenser kompaniyani baholaydi
    else if (user.role === 'INFLUENCER' && user.influencer) {
      reviewData.influencerId = user.influencer.id;
      reviewData.companyId = application.ad.companyId;
      reviewData.type = 'INFLUENCER_TO_COMPANY';
    } else {
      return res.status(400).json({ error: 'Reyting qo\'yish mumkin emas' });
    }

    // Avval reyting qo'yganmi tekshirish
    const existing = await req.prisma.review.findFirst({
      where: {
        applicationId,
        type: reviewData.type,
        ...(reviewData.type === 'COMPANY_TO_INFLUENCER'
          ? { companyId: reviewData.companyId }
          : { influencerId: reviewData.influencerId }),
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Siz allaqachon reyting qo\'ygansiz' });
    }

    const review = await req.prisma.review.create({ data: reviewData });

    res.status(201).json(review);
  } catch (err) {
    console.error('Create review error:', err);
    res.status(500).json({ error: 'Reyting yaratishda xatolik' });
  }
});

// Influenserning reytinglari
router.get('/influencer/:id', async (req, res) => {
  try {
    const reviews = await req.prisma.review.findMany({
      where: { influencerId: req.params.id, type: 'COMPANY_TO_INFLUENCER' },
      include: { company: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Kompaniyaning reytinglari
router.get('/company/:id', async (req, res) => {
  try {
    const reviews = await req.prisma.review.findMany({
      where: { companyId: req.params.id, type: 'INFLUENCER_TO_COMPANY' },
      include: { influencer: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(reviews);
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

module.exports = router;
