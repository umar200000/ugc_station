const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Telegram xabar yuborish (telegramId bilan to'g'ridan-to'g'ri)
async function sendTelegram(telegramId, text) {
  try {
    const botToken = process.env.BOT_TOKEN;
    if (!botToken || !telegramId) return;
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: telegramId, text, parse_mode: 'HTML' }),
    }).catch(() => {});
  } catch {}
}

// Telegram + In-app notification yuborish (userId orqali)
async function notify(userId, { title, message, type = 'info', link = '', telegramMsg = '' }) {
  try {
    // In-app notification
    await prisma.notification.create({
      data: { userId, title, message, type, link },
    });

    // Telegram notification
    if (telegramMsg) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.telegramId) {
        await sendTelegram(user.telegramId, telegramMsg);
      }
    }
  } catch (err) {
    console.error('Notify error:', err.message);
  }
}

// Barcha userlarga Telegram + in-app xabar yuborish
async function broadcastAll({ title, message, type = 'info', link = '', telegramMsg = '' }) {
  try {
    const users = await prisma.user.findMany({
      where: { onboarded: true },
      select: { id: true, telegramId: true },
    });
    for (const user of users) {
      try {
        await prisma.notification.create({
          data: { userId: user.id, title, message, type, link },
        });
        if (telegramMsg && user.telegramId) {
          await sendTelegram(user.telegramId, telegramMsg);
        }
      } catch (e) {
        console.error('Broadcast single error:', e.message);
      }
    }
  } catch (err) {
    console.error('Broadcast error:', err.message);
  }
}

module.exports = { notify, sendTelegram, broadcastAll };
