require('dotenv').config({ path: '../.env' });
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

const BASE_URL = process.env.WEBAPP_URL || process.env.FRONTEND_URL || 'http://localhost:5173';
const WEBAPP_URL = `${BASE_URL}?v=${Date.now()}`;

// /start komandasi
bot.start(async (ctx) => {
  const userName = ctx.from.first_name || 'Foydalanuvchi';

  await ctx.reply(
    `Assalomu alaykum, ${userName}! 👋\n\nUGC Marketplace ga xush kelibsiz!\n\nBu yerda kompaniyalar va influenserlar bir-birini topib, hamkorlik qilishadi.\n\nBoshlash uchun quyidagi tugmani bosing:`,
    Markup.inlineKeyboard([
      [Markup.button.webApp('🚀 Marketplace ni ochish', WEBAPP_URL)],
    ])
  );
});

// /help komandasi
bot.help(async (ctx) => {
  await ctx.reply(
    `UGC Marketplace Bot yordam:\n\n` +
    `/start — Botni ishga tushirish\n` +
    `/help — Yordam\n` +
    `/profile — Profilim\n\n` +
    `Marketplace ni ochish uchun /start bosing.`
  );
});

// /profile komandasi
bot.command('profile', async (ctx) => {
  await ctx.reply(
    'Profilingizni ko\'rish va tahrirlash uchun:',
    Markup.inlineKeyboard([
      [Markup.button.webApp('👤 Profilim', `${WEBAPP_URL}/profile`)],
    ])
  );
});

// Bildirishnoma yuborish funksiyasi (backend dan chaqiriladi)
async function sendNotification(chatId, message, options = {}) {
  try {
    if (options.webAppUrl) {
      await bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        ...Markup.inlineKeyboard([
          [Markup.button.webApp('📋 Ko\'rish', options.webAppUrl)],
        ]),
      });
    } else {
      await bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      });
    }
  } catch (err) {
    console.error(`Xabar yuborib bo'lmadi (chatId: ${chatId}):`, err.message);
  }
}

// Bot ishga tushirish
bot.launch()
  .then(() => console.log('Bot ishga tushdi'))
  .catch((err) => console.error('Bot xatosi:', err));

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = { bot, sendNotification };
