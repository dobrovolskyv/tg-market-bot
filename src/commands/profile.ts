import { CallbackQueryContext, InlineKeyboard } from "grammy";

import { MyContext } from "../types.js";
import { pool } from "../database/connect.js";


export const profile = async (ctx: CallbackQueryContext<MyContext>) => {
    await ctx.answerCallbackQuery();

    const telegramChatId = ctx.from?.id ?? ctx.chat?.id

    if (!telegramChatId) {
        return ctx.callbackQuery.message?.editText('Профиль не найден')
    }

    try {
        const [rows] = await pool.query("SELECT * FROM users WHERE telegram_chat_id = ?", [telegramChatId])

        if ((rows as any[]).length === 0) {
            return ctx.callbackQuery.message?.editText("Для доступа к профилю необходимо зарегистрироваться, используя команду /start")
        }

        const user = (rows as any[])[0]

        const registrationDate = new Date(user.created_At).toLocaleDateString("ru-RU", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })

        await ctx.callbackQuery.message?.editText(`Здравствуйте, ${ctx.from?.first_name}!\nДата регистрации: ${registrationDate}\nУ Вас еще нет заказов, перейдите во вкладку Товары для покупок.`,
            {
                reply_markup: new InlineKeyboard().text("Назад", "backToMenu"),
            })

    } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
        return ctx.callbackQuery.message?.editText("Произошла ошибка при загрузке профиля.");

    }
}