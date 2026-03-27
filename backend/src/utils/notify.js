const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Telegram + In-app notification yuborish
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
        const botToken = process.env.BOT_TOKEN;
        if (botToken) {
          fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: user.telegramId, text: telegramMsg, parse_mode: 'HTML' }),
          }).catch(() => {});
        }
      }
    }
  } catch (err) {
    console.error('Notify error:', err.message);
  }
}

module.exports = { notify };
