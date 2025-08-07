
import { InlineKeyboard } from "grammy";
import { MyContext } from "../types.js";

import {pool}  from "../database/connect.js";


export const start = async (ctx: MyContext) => {
  if (!ctx.from) {
    return ctx.reply("User info is not available");
  }

  const telegramChatId = ctx.from.id;
  const name = ctx.from.first_name;

  const keyboard = new InlineKeyboard().text("Меню", "menu");

  try {
    // Проверка, есть ли пользователь уже
    const [rows] = await pool.query("SELECT * FROM users WHERE telegram_chat_id = ?", [telegramChatId]);

    if ((rows as any[]).length > 0) {
      return ctx.reply("Вы уже зарегистрированы", {
        reply_markup: keyboard,
      });
    }

    // Вставка нового пользователя
    await pool.query(
      "INSERT INTO users (name, telegram_chat_id) VALUES (?, ?)",
      [name, telegramChatId]
    );

    return ctx.reply("Вы успешно зарегистрированы!", {
      reply_markup: keyboard,
    });
  } catch (error) {
    console.error("Ошибка при регистрации", error);
    return ctx.reply("Произошла ошибка при регистрации");
  }
};
