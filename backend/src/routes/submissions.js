const express = require('express');
const multer = require('multer');
const path = require('path');
const { authMiddleware, influencerOnly, companyOnly } = require('../middleware/auth');
const { notify } = require('../utils/notify');

const router = express.Router();

// Video upload sozlamalari
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'video-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const videoFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-matroska'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Faqat video formatlar qo\'llab-quvvatlanadi (MP4, MOV, WebM)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: videoFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
});

// Influenser video yuklash
router.post('/', authMiddleware, influencerOnly, upload.single('video'), async (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Video yuklanmadi' });
    }

    // Application ni tekshirish
    const influencer = await req.prisma.influencer.findUnique({
      where: { userId: req.user.userId },
    });

    const application = await req.prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        ad: { include: { company: { include: { user: true } } } },
        influencer: true,
      },
    });

    if (!application || application.influencerId !== influencer.id) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    if (application.status !== 'ACCEPTED') {
      return res.status(400).json({ error: 'Ariza qabul qilinmagan' });
    }

    const videoUrl = `/uploads/${req.file.filename}`;

    const submission = await req.prisma.submission.create({
      data: {
        applicationId,
        videoUrl,
      },
    });

    // Kompaniyaga notification
    if (application.ad?.company?.userId) {
      notify(application.ad.company.userId, {
        title: 'Yangi video keldi!',
        message: `${application.influencer.name} "${application.ad.title}" uchun video yukladi`,
        type: 'video',
        link: `/ad/${application.adId}/applications`,
        telegramMsg: `🎬 <b>Yangi video keldi!</b>\n\n📢 E'lon: <b>${application.ad.title}</b>\n👤 Influenser: <b>${application.influencer.name}</b>\n\nMini App ni ochib videoni ko'ring!`,
      });
    }

    res.status(201).json(submission);
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Video yuklashda xatolik' });
  }
});

// Barcha videolar (feed uchun)
router.get('/feed', async (req, res) => {
  try {
    const submissions = await req.prisma.submission.findMany({
      where: { status: 'APPROVED' },
      include: {
        application: {
          include: {
            influencer: {
              include: { user: { select: { photoUrl: true, username: true } } },
            },
            ad: { select: { title: true, company: { select: { name: true } } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(submissions);
  } catch (err) {
    console.error('Video feed error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Kompaniyaning tasdiqlagan videolari
router.get('/company/approved', authMiddleware, async (req, res) => {
  try {
    const company = await req.prisma.company.findUnique({ where: { userId: req.user.userId } });
    if (!company) return res.status(400).json({ error: 'Kompaniya topilmadi' });

    const submissions = await req.prisma.submission.findMany({
      where: {
        status: { in: ['APPROVED', 'HIDDEN'] },
        application: { ad: { companyId: company.id } },
      },
      include: {
        application: {
          include: {
            influencer: { include: { user: { select: { photoUrl: true, username: true } } } },
            ad: { select: { title: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(submissions);
  } catch (err) {
    console.error('Company approved videos error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Video faolligini o'zgartirish (APPROVED <-> HIDDEN)
router.patch('/:id/toggle', authMiddleware, async (req, res) => {
  try {
    const sub = await req.prisma.submission.findUnique({
      where: { id: req.params.id },
      include: { application: { include: { ad: true } } },
    });
    if (!sub) return res.status(404).json({ error: 'Topilmadi' });

    const company = await req.prisma.company.findUnique({ where: { userId: req.user.userId } });
    if (!company || sub.application.ad.companyId !== company.id) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const newStatus = sub.status === 'APPROVED' ? 'HIDDEN' : 'APPROVED';
    const updated = await req.prisma.submission.update({
      where: { id: req.params.id },
      data: { status: newStatus },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Application bo'yicha videolarni olish
router.get('/application/:applicationId', authMiddleware, async (req, res) => {
  try {
    const submissions = await req.prisma.submission.findMany({
      where: { applicationId: req.params.applicationId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(submissions);
  } catch (err) {
    console.error('Get submissions error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Kompaniya video ni tasdiqlash / rad etish
router.patch('/:id/status', authMiddleware, companyOnly, async (req, res) => {
  try {
    const { status, comment } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ error: 'Noto\'g\'ri status' });
    }

    const submission = await req.prisma.submission.findUnique({
      where: { id: req.params.id },
      include: {
        application: {
          include: {
            ad: { include: { company: true } },
            influencer: { include: { user: true } },
          },
        },
      },
    });

    if (!submission) {
      return res.status(404).json({ error: 'Video topilmadi' });
    }

    // Kompaniya ekanligini tekshirish
    const company = await req.prisma.company.findUnique({
      where: { userId: req.user.userId },
    });

    if (submission.application.ad.companyId !== company.id) {
      return res.status(403).json({ error: 'Ruxsat yo\'q' });
    }

    const updated = await req.prisma.submission.update({
      where: { id: req.params.id },
      data: { status, comment: comment || null },
    });

    // Influenserga notification
    if (submission.application.influencer?.userId) {
      const commentLine = comment ? `\n💬 Izoh: ${comment}` : '';
      const commentHtml = comment ? `\n💬 Izoh: <b>${comment}</b>` : '';
      if (status === 'APPROVED') {
        notify(submission.application.influencer.userId, {
          title: 'Video tasdiqlandi!',
          message: `"${submission.application.ad.title}" uchun videongiz tasdiqlandi.${commentLine}`,
          type: 'approved',
          link: '/my-applications',
          telegramMsg: `✅ <b>Videongiz tasdiqlandi!</b>\n\n📢 E'lon: <b>${submission.application.ad.title}</b>\n🏢 Kompaniya: <b>${submission.application.ad.company.name}</b>${commentHtml}\n\nAjoyib ish! 🎉`,
        });
      } else {
        notify(submission.application.influencer.userId, {
          title: 'Video rad etildi',
          message: `"${submission.application.ad.title}" uchun video rad etildi.${commentLine}`,
          type: 'rejected',
          link: '/my-applications',
          telegramMsg: `❌ <b>Video rad etildi</b>\n\n📢 E'lon: <b>${submission.application.ad.title}</b>\n🏢 Kompaniya: <b>${submission.application.ad.company.name}</b>${commentHtml}\n\nYangi video yuklashingiz mumkin.`,
        });
      }
    }

    res.json(updated);
  } catch (err) {
    console.error('Update submission error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

module.exports = router;
