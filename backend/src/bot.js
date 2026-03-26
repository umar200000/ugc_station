require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

const WEB_APP_URL = process.env.WEB_APP_URL || 'https://yourdomain.com';

bot.start((ctx) => {
  ctx.reply(
    '🎬 UGC Marketplace ga xush kelibsiz!\n\nBu yerda kompaniyalar va influenserlar bir-birini topadi.',
    Markup.inlineKeyboard([
      [Markup.button.webApp('📱 Mini App ni ochish', WEB_APP_URL)],
    ])
  );
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
