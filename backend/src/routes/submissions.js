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

// Influenser video yuklash — admin tekshiruviga ketadi
router.post('/', authMiddleware, influencerOnly, upload.single('video'), async (req, res) => {
  try {
    const { applicationId } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Video yuklanmadi' });
    }

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

    // Influenserga tasdiq — video admin tekshiruviga yuborildi
    notify(application.influencer.userId, {
      title: 'Video yuborildi!',
      message: `"${application.ad.title}" uchun videongiz admin tekshiruviga yuborildi.`,
      type: 'video',
      link: '/my-applications',
      telegramMsg: `📤 <b>Video yuborildi!</b>\n\n📢 E'lon: <b>${application.ad.title}</b>\n\nVideongiz admin tekshiruvida. Natija tez orada ma'lum bo'ladi.`,
    });

    res.status(201).json(submission);
  } catch (err) {
    console.error('Submission error:', err);
    res.status(500).json({ error: 'Video yuklashda xatolik' });
  }
});

// Barcha tasdiqlangan videolar (feed uchun)
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

// Kompaniyaning tasdiqlagan videolari (faqat admin tasdiqlagan)
router.get('/company/approved', authMiddleware, async (req, res) => {
  try {
    const company = await req.prisma.company.findUnique({ where: { userId: req.user.userId } });
    if (!company) return res.status(400).json({ error: 'Kompaniya topilmadi' });

    const submissions = await req.prisma.submission.findMany({
      where: {
        status: 'APPROVED',
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

module.exports = router;
