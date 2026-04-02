const express = require('express');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { validateInitData, parseInitData } = require('../utils/telegram');
const { authMiddleware } = require('../middleware/auth');
const { refreshInfluencerTokens } = require('../utils/tokenRefresh');

const router = express.Router();

// Telegram dan profil rasmini yuklab olish
async function downloadTelegramPhoto(telegramId) {
  try {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) return '';

    const fetchWithTimeout = (url, ms = 5000) =>
      fetch(url, { signal: AbortSignal.timeout(ms) });

    // Get user profile photos
    const res = await fetchWithTimeout(`https://api.telegram.org/bot${botToken}/getUserProfilePhotos?user_id=${telegramId}&limit=1`);
    const data = await res.json();
    if (!data.ok || !data.result.photos?.length) return '';

    const fileId = data.result.photos[0][data.result.photos[0].length - 1].file_id;

    // Get file path
    const fileRes = await fetchWithTimeout(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
    const fileData = await fileRes.json();
    if (!fileData.ok) return '';

    // Download file
    const fileUrl = `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
    const imgRes = await fetchWithTimeout(fileUrl, 10000);
    const buffer = Buffer.from(await imgRes.arrayBuffer());

    // Save to uploads
    const filename = `avatar-${telegramId}-${Date.now()}.jpg`;
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    fs.writeFileSync(path.join(uploadDir, filename), buffer);

    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Download telegram photo error:', err.message);
    return '';
  }
}

// Telegram orqali login / ro'yxatdan o'tish
router.post('/telegram', async (req, res) => {
  try {
    const { initData } = req.body;

    // Telegram initData bilan yoki dev mode da ishlash
    let telegramUser;
    if (initData && initData.length > 0) {
      // Haqiqiy Telegram dan kelgan
      if (!validateInitData(initData, process.env.BOT_TOKEN)) {
        return res.status(401).json({ error: 'Telegram ma\'lumotlari yaroqsiz' });
      }
      telegramUser = parseInitData(initData);
    } else if (req.body.devUser) {
      // Dev/test mode — devUser bilan kirish
      telegramUser = req.body.devUser;
    }

    if (!telegramUser) {
      return res.status(400).json({ error: 'Foydalanuvchi ma\'lumotlari topilmadi' });
    }

    // Foydalanuvchini topish yoki yaratish
    let user = await req.prisma.user.findUnique({
      where: { telegramId: String(telegramUser.id) },
      include: { company: true, influencer: true },
    });

    const isNew = !user;

    // Admin IDs ro'yxati
    const adminIds = (process.env.ADMIN_TELEGRAM_IDS || '99900').split(',').map(id => id.trim());
    const isAdmin = adminIds.includes(String(telegramUser.id));

    if (!user) {
      // Telegram dan profil rasmini yuklab olish
      let photoUrl = telegramUser.photo_url || '';
      const downloaded = await downloadTelegramPhoto(telegramUser.id);
      if (downloaded) photoUrl = downloaded;

      user = await req.prisma.user.create({
        data: {
          telegramId: String(telegramUser.id),
          firstName: telegramUser.first_name || '',
          lastName: telegramUser.last_name || '',
          username: telegramUser.username || '',
          photoUrl,
          phone: telegramUser.phone || null,
          role: isAdmin ? 'ADMIN' : null,
          onboarded: isAdmin ? true : false,
        },
        include: { company: true, influencer: true },
      });
    } else if (!user.photoUrl || user.photoUrl.startsWith('http')) {
      // Mavjud user — rasmni yangilash (agar hali yuklanmagan bo'lsa)
      const downloaded = await downloadTelegramPhoto(telegramUser.id);
      if (downloaded) {
        user = await req.prisma.user.update({
          where: { id: user.id },
          data: { photoUrl: downloaded },
          include: { company: true, influencer: true },
        });
      }
    }

    if (isAdmin && user.role !== 'ADMIN') {
      // Mavjud user admin bo'lishi kerak
      user = await req.prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN', onboarded: true },
        include: { company: true, influencer: true },
      });
    }

    // JWT token yaratish (telefonsiz ham login qiladi — mini app ichida so'raladi)
    const token = jwt.sign(
      {
        userId: user.id,
        telegramId: user.telegramId,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user, isNew });
  } catch (err) {
    console.error('Auth error:', err);
    res.status(500).json({ error: 'Autentifikatsiya xatosi' });
  }
});

// Telefon raqam saqlash
router.post('/save-phone', authMiddleware, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 9) {
      return res.status(400).json({ error: 'Telefon raqam noto\'g\'ri' });
    }

    // Raqam boshqa userda bormi tekshirish
    const existing = await req.prisma.user.findUnique({
      where: { phone },
    });

    if (existing && existing.id !== req.user.userId) {
      return res.status(409).json({ error: 'Bu raqam allaqachon ro\'yxatdan o\'tgan' });
    }

    const user = await req.prisma.user.update({
      where: { id: req.user.userId },
      data: { phone },
      include: { company: true, influencer: true },
    });

    res.json({ user });
  } catch (err) {
    console.error('Save phone error:', err);
    res.status(500).json({ error: 'Telefon saqlashda xatolik' });
  }
});

// Rol tanlash (onboarding)
router.post('/select-role', authMiddleware, async (req, res) => {
  try {
    const { role } = req.body;

    if (!['COMPANY', 'INFLUENCER'].includes(role)) {
      return res.status(400).json({ error: 'Noto\'g\'ri rol' });
    }

    const user = await req.prisma.user.update({
      where: { id: req.user.userId },
      data: { role },
    });

    // Yangi token (role yangilangan)
    const token = jwt.sign(
      {
        userId: user.id,
        telegramId: user.telegramId,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user });
  } catch (err) {
    console.error('Role select error:', err);
    res.status(500).json({ error: 'Rol tanlashda xatolik' });
  }
});

// Kompaniya profil yaratish
router.post('/onboarding/company', authMiddleware, async (req, res) => {
  try {
    const { name, industry } = req.body;

    const company = await req.prisma.company.create({
      data: {
        userId: req.user.userId,
        name,
        industry,
      },
    });

    await req.prisma.user.update({
      where: { id: req.user.userId },
      data: { onboarded: true },
    });

    res.json({ company });
  } catch (err) {
    console.error('Company onboarding error:', err);
    res.status(500).json({ error: 'Kompaniya yaratishda xatolik' });
  }
});

// Influenser profil yaratish
router.post('/onboarding/influencer', authMiddleware, async (req, res) => {
  try {
    const { name, bio, category, socialLinks } = req.body;

    const influencer = await req.prisma.influencer.create({
      data: {
        userId: req.user.userId,
        name,
        bio: bio || '',
        category: category || '',
        socialLinks: JSON.stringify(socialLinks || {}),
      },
    });

    await req.prisma.user.update({
      where: { id: req.user.userId },
      data: { onboarded: true },
    });

    res.json({ influencer });
  } catch (err) {
    console.error('Influencer onboarding error:', err);
    res.status(500).json({ error: 'Influenser yaratishda xatolik' });
  }
});

// Joriy foydalanuvchi ma'lumotlari
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await req.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { company: { include: { tariff: true } }, influencer: { include: { influencerTariff: true } } },
    });

    if (!user) {
      return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
    }

    // Influencer token refresh
    if (user.influencer?.influencerTariffId) {
      user.influencer = await refreshInfluencerTokens(req.prisma, user.influencer);
    }

    res.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Logout — foydalanuvchi rolini tozalash (dev uchun)
router.post('/logout', authMiddleware, async (req, res) => {
  try {
    // Company va Influencer profillarni o'chirish
    await req.prisma.company.deleteMany({ where: { userId: req.user.userId } });
    await req.prisma.influencer.deleteMany({ where: { userId: req.user.userId } });

    // User rolini va onboarded ni tozalash
    const user = await req.prisma.user.update({
      where: { id: req.user.userId },
      data: { role: null, onboarded: false },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ error: 'Logout xatosi' });
  }
});

module.exports = router;
