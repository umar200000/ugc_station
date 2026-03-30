const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Telegram xabar yuborish
function sendTelegram(telegramId, text) {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken || !telegramId) return;
  fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: telegramId, text, parse_mode: 'HTML' }),
  }).then(r => {
    if (!r.ok) r.json().then(d => console.error('Telegram send error:', d.description)).catch(() => {});
  }).catch(err => console.error('Telegram fetch error:', err.message));
}

// Bitta userga Telegram + In-app notification
async function notify(userId, { title, message, type = 'info', link = '', telegramMsg = '' }) {
  try {
    await prisma.notification.create({
      data: { userId, title, message, type, link },
    });
    if (telegramMsg) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user?.telegramId) {
        sendTelegram(user.telegramId, telegramMsg);
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
    console.log(`Broadcasting to ${users.length} users: "${title}"`);
    for (const user of users) {
      try {
        await prisma.notification.create({
          data: { userId: user.id, title, message, type, link },
        });
        if (telegramMsg && user.telegramId) {
          sendTelegram(user.telegramId, telegramMsg);
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
