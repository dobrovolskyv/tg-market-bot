import 'dotenv/config';
import { Bot, GrammyError, HttpError, InlineKeyboard } from 'grammy';
import { hydrate } from '@grammyjs/hydrate';
import mongoose from 'mongoose';
import { MyContext } from './types.js';
import { start } from './commands/index.js'
import { User } from './models/User.js';



const BOT_API_KEY = process.env.BOT_TOKEN;

if (!BOT_API_KEY) {
  throw new Error('BOT_TOKEN is not defined');
}

const bot = new Bot<MyContext>(BOT_API_KEY);
bot.use(hydrate());

// Ответ на команду /start
bot.command('start', start);

bot.callbackQuery('menu', (ctx) => {
  ctx.answerCallbackQuery();

  ctx.callbackQuery.message?.editText('Вы в главном меню мазазина.\nОтсюда вы можете попасть в раздел с товарами и в свой профил. Для перехода нажмите на кнопку ниже:', {
    reply_markup: new InlineKeyboard()
      .text('Товары', 'products')
      .text('Профиль', 'profile')
  })
})

bot.callbackQuery('products', (ctx) => {
  ctx.answerCallbackQuery();

  ctx.callbackQuery.message?.editText('Вы в разделе с товарами', {
    reply_markup: new InlineKeyboard()
      .text('Назад', 'backToMenu')
  })
})
bot.callbackQuery('profile', async (ctx) => {
  ctx.answerCallbackQuery();

  const user = await User.findOne({ telegramId: ctx.from?.id });
  if (!user) {
    return ctx.callbackQuery.message?.editText('Для доступа к профилю необходимо зарегестрироваться, используя команду /start');
  }

  const registrationDate = user.createdAt.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });

  ctx.callbackQuery.message?.editText(`Здравствуйте, ${ctx.from?.first_name} !\nДата регистрации: ${registrationDate}\nУ Вас еще нет заказов, перейдите во вкладку Товары для покупок.`, {
    reply_markup: new InlineKeyboard()
      .text('Назад', 'backToMenu')
  })
})
bot.callbackQuery('backToMenu', (ctx) => {
  ctx.answerCallbackQuery();

  ctx.callbackQuery.message?.editText('Вы в главном меню мазазина.\nОтсюда вы можете попасть в раздел с товарами и в свой профил. Для перехода нажмите на кнопку ниже:', {
    reply_markup: new InlineKeyboard()
      .text('Товары', 'products')
      .text('Профиль', 'profile')
  })
})

// Ответ на любое сообщение
bot.on('message:text', (ctx) => {
  ctx.reply(ctx.message.text);
});

// Обработка ошибок согласно документации
bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error('Error in request:', e.description);
  } else if (e instanceof HttpError) {
    console.error('Could not contact Telegram:', e);
  } else {
    console.error('Unknown error:', e);
  }
});

// Функция запуска бота
async function startBot() {
  const MONGDODB_URI = process.env.MONGDODB_URI;
  if (!MONGDODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    await mongoose.connect(MONGDODB_URI);
    bot.start();
    console.log('Bot started');
  } catch (error) {
    console.error('Error in startBot:', error);
  }
}

startBot();
