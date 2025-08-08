import { pool } from "../database/connect.js";
import { MyContext } from "../types.js";
import { CallbackQueryContext, InlineKeyboard } from "grammy";

export const status = async (ctx: CallbackQueryContext<MyContext>) => {
    await ctx.answerCallbackQuery()

    const telegramChatId = ctx.from?.id ?? ctx.chat?.id

    if (!telegramChatId) {
        return ctx.callbackQuery.message?.editText('Ваш профиль не найден')
    }

    try {
        const [userRows] = await pool.query("SELECT id FROM users WHERE telegram_chat_id = ?", [telegramChatId])

        const users = userRows as any[]
        if (users.length === 0) {
            return ctx.callbackQuery.message?.editText('Для доступа к профилю необходимо зарегистрироваться, используя команду /start')
        }

        const userId = users[0].id

        const [statusRows] = await pool.query("SELECT status FROM appointments WHERE user_id = ? ORDER BY id DESC LIMIT 1", [userId])

        const result = statusRows as any[];
        if (result.length === 0) {
            return ctx.callbackQuery.message?.editText('У вас пока нет записей.')
        }

        const status = result[0].status;

        const keyboard = new InlineKeyboard().text('Назад', 'backToMenu')

        await ctx.callbackQuery.message?.editText(`Статус заказа: ${status}`, {
            reply_markup: keyboard
        })


    } catch (error) {
        console.error("Ошибка при получении статуса заказа", error);
        await ctx.callbackQuery.message?.editText('Произошла ошибка при получении статуса заказа. Попробуйте снова.');
    }


}