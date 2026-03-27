require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const authRoutes = require('./routes/auth');
const adRoutes = require('./routes/ads');
const applicationRoutes = require('./routes/applications');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const uploadRoutes = require('./routes/upload');
const submissionRoutes = require('./routes/submissions');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

const prisma = new PrismaClient();
const app = express();

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Frontend static files (production build)
const path = require('path');
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

// Request context — prisma instance
app.use((req, res, next) => {
  req.prisma = prisma;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/ads', adRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Admin web panel (alohida papkadan)
app.use('/admin-panel', express.static(path.join(__dirname, '../../admin')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback — barcha boshqa route'lar uchun index.html qaytarish
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Serverda xatolik yuz berdi' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT}-portda ishga tushdi`);
});

module.exports = app;
