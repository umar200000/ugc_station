const express = require('express');
const multer = require('multer');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Multer sozlamalari
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Faqat JPEG, PNG va WebP formatlar qo\'llab-quvvatlanadi'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Rasm yuklash (1-5 ta)
router.post('/images', authMiddleware, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Rasm yuklanmadi' });
    }

    const urls = req.files.map((file) => `/uploads/${file.filename}`);
    res.json({ urls });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Rasm yuklashda xatolik' });
  }
});

// Bitta rasm yuklash (profil uchun)
router.post('/avatar', authMiddleware, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Rasm yuklanmadi' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.json({ url });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Rasm yuklashda xatolik' });
  }
});

module.exports = router;
