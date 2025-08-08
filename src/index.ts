import 'dotenv/config';
import { Bot, GrammyError, HttpError, InlineKeyboard } from 'grammy';
import { hydrate } from '@grammyjs/hydrate';
// import mongoose from 'mongoose';
import { MyContext } from './types.js';
import { start, profile, productsCommand, status } from './commands/index.js'

import { appointment, handleDoctor, handleTime } from "./commands/appointment.js";

import { products } from './consts/products.js';


const BOT_API_KEY = process.env.BOT_TOKEN;

if (!BOT_API_KEY) {
    throw new Error('BOT_TOKEN не найден');
}

const bot = new Bot<MyContext>(BOT_API_KEY);
bot.use(hydrate());

// Ответ на команду /start
bot.command('start', start);

bot.callbackQuery('menu', (ctx) => {
    ctx.answerCallbackQuery();

    ctx.callbackQuery.message?.editText('Вы в главном меню магазина.\nОтсюда вы можете попасть в раздел с товарами и в свой профил. Для перехода нажмите на кнопку ниже:', {
        reply_markup: new InlineKeyboard()
            .text('Товары', 'products')
            .text('Профиль', 'profile')
            .text('Записаться', 'appointment').row()
            .text('Статус заказа', 'status')
    })
})

bot.callbackQuery('products', productsCommand)
bot.callbackQuery('profile', profile)


bot.callbackQuery('appointment', appointment);

// Выбор врача
bot.callbackQuery(/^choose_doctor:.+$/, handleDoctor);

// Выбор времени
bot.callbackQuery(/^choose_time:.+$/, handleTime);

//выбор товара
bot.callbackQuery(/^buyProduct-\d+$/,  (ctx) => {
    ctx.answerCallbackQuery();
    const productId = ctx.callbackQuery.data.split('-')[1];
    const product = products.find(
        (product) => product.id === parseInt(productId)
    )

    if (!product) {
        return ctx.callbackQuery.message?.editText('Товар не найден')
    }
    ctx.callbackQuery.message?.editText(`Вы выбрали товар: ${product.name}`)

    setTimeout( () => {
        const keyboard = new InlineKeyboard().text('Назад', 'backToMenu')

         ctx.reply(`Вернуться в главное меню`, {
            reply_markup: keyboard
        })
    }, 1000)

})

bot.callbackQuery('backToMenu', (ctx) => {
    ctx.answerCallbackQuery();

    ctx.callbackQuery.message?.editText('Вы в главном меню магазина.\nОтсюда вы можете попасть в раздел с товарами, в свой профил и записаться на прием к врачу. Для перехода нажмите на кнопку ниже:', {
        reply_markup: new InlineKeyboard()
            .text('Товары', 'products')
            .text('Профиль', 'profile')
            .text('Записаться', 'appointment').row()
            .text('Статус записи', 'status')
    })
})

//статус записи
bot.callbackQuery('status', status)
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
    try {
        bot.start();
        console.log('Bot started');
    } catch (error) {
        console.error('Error in startBot:', error);
    }
}

startBot();
