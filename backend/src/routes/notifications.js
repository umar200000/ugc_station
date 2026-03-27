const express = require('express');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// O'z notificationlarni olish
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const notifications = await req.prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Xatolik' });
  }
});

// O'qilmagan sonini olish
router.get('/unread-count', authMiddleware, async (req, res) => {
  try {
    const count = await req.prisma.notification.count({
      where: { userId: req.user.userId, read: false },
    });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Bittasini o'qilgan deb belgilash
router.patch('/:id/read', authMiddleware, async (req, res) => {
  try {
    await req.prisma.notification.update({
      where: { id: req.params.id },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Xatolik' });
  }
});

// Hammasini o'qilgan deb belgilash
router.patch('/read-all', authMiddleware, async (req, res) => {
  try {
    await req.prisma.notification.updateMany({
      where: { userId: req.user.userId, read: false },
      data: { read: true },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Xatolik' });
  }
});

module.exports = router;
