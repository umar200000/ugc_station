require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const { PrismaClient } = require('@prisma/client');

const bot = new Telegraf(process.env.BOT_TOKEN);
const prisma = new PrismaClient();

const WEB_APP_URL = process.env.WEB_APP_URL || 'https://yourdomain.com';

bot.start(async (ctx) => {
  const telegramId = String(ctx.from.id);

  // Bazadan userni tekshirish — telefon raqami bormi
  const user = await prisma.user.findUnique({ where: { telegramId } });

  if (user && user.phone) {
    // Telefon bor — to'g'ridan-to'g'ri Mini App ko'rsatish
    ctx.reply(
      `Salom, ${ctx.from.first_name}! 🎬\n\nUGC Marketplace ga xush kelibsiz!`,
      Markup.inlineKeyboard([
        [Markup.button.webApp('📱 Mini App ni ochish', WEB_APP_URL)],
      ])
    );
  } else {
    // Birinchi marta — telefon raqamni so'rash
    ctx.reply(
      `Salom, ${ctx.from.first_name}! 🎬\n\nUGC Marketplace ga xush kelibsiz!\n\nDavom etish uchun telefon raqamingizni yuboring 👇`,
      Markup.keyboard([
        [Markup.button.contactRequest('📞 Telefon raqamni yuborish')],
      ]).oneTime().resize()
    );
  }
});

// Kontakt kelganda
bot.on('contact', async (ctx) => {
  const contact = ctx.message.contact;

  // Faqat o'z kontaktini qabul qilish
  if (contact.user_id !== ctx.from.id) {
    return ctx.reply('Iltimos, o\'zingizning telefon raqamingizni yuboring.');
  }

  const telegramId = String(ctx.from.id);
  const phone = contact.phone_number.startsWith('+') ? contact.phone_number : `+${contact.phone_number}`;

  try {
    // Userni topish yoki yaratish va telefon saqlash
    await prisma.user.upsert({
      where: { telegramId },
      update: { phone },
      create: {
        telegramId,
        firstName: ctx.from.first_name || '',
        lastName: ctx.from.last_name || '',
        username: ctx.from.username || '',
        phone,
      },
    });

    // Klaviaturani olib tashlash va Mini App tugmasini ko'rsatish
    await ctx.reply(
      `Rahmat! Telefon raqamingiz saqlandi ✅\n\nEndi Mini App ni ochishingiz mumkin 👇`,
      Markup.removeKeyboard()
    );

    ctx.reply(
      '🎬 UGC Marketplace',
      Markup.inlineKeyboard([
        [Markup.button.webApp('📱 Mini App ni ochish', WEB_APP_URL)],
      ])
    );
  } catch (err) {
    console.error('Contact save error:', err);
    ctx.reply('Xatolik yuz berdi. Qaytadan urinib ko\'ring: /start');
  }
});

bot.command('app', (ctx) => {
  ctx.reply(
    'Mini App ni ochish:',
    Markup.inlineKeyboard([
      [Markup.button.webApp('📱 Ochish', WEB_APP_URL)],
    ])
  );
});

bot.launch()
  .then(() => console.log('🤖 Bot ishga tushdi'))
  .catch((err) => console.error('Bot xatosi:', err));

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot };
