import { InlineKeyboard } from "grammy";
import { MyContext } from "../types.js";
import { pool } from "../database/connect.js";


export const start = async (ctx: MyContext) => {
  if (!ctx.from) {
    return ctx.reply("Пользователь не найден")
  }

  const telegramChatId = ctx.from.id
  const name = ctx.from.first_name

  const keyboard = new InlineKeyboard().text('Меню', 'menu')

  try {
    //  проверка пользвателя
    const [rows] = await pool.query("SELECT * FROM users WHERE telegram_chat_id = ?", [telegramChatId]);

    if ((rows as any[]).length > 0) {
      return ctx.reply('ВЫ уже зарегестрированы', {
        reply_markup: keyboard
      })
    }

    //вставка нового пользователя
    await pool.query("INSERT INTO users (name, telegram_chat_id) VALUES (?, ?)", [name, telegramChatId])

    return ctx.reply('Вы успешно зарегестрированы!', {
      reply_markup: keyboard
    })
  } catch (error) {
    console.error("Ошибка при регистрации", error);
    return ctx.reply("Произошла ошибка при регистрации");
  }

}