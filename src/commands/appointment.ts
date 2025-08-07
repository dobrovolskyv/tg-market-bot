import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { MyContext } from "../types.js";

// @ts-ignore
import { pool } from "../database/index.js";


/** Храним временные данные по chat_id */
const tempSessions = new Map()


/** Команда нажатия кнопки "Записаться" */
export const appointment = async (ctx: CallbackQueryContext<MyContext>) => {
    const keyboard = new InlineKeyboard()
        .text('👨‍⚕️ Doctor 1', 'choose_doctor:doctor1')
        .text('👩‍⚕️ Doctor 2', 'choose_doctor:doctor2')
        .text('👨‍⚕️ Doctor 3', 'choose_doctor:doctor3');
    await ctx.editMessageText("Выберите врача", {
        reply_markup: keyboard
    })
}

/** Обработка выбора врача */
export const handleDoctor = async (ctx: CallbackQueryContext<MyContext>) => {
    if (!ctx.callbackQuery?.data) return;
    const doctor = ctx.callbackQuery.data.split(':')[1]
    const chatId = ctx.chat?.id ?? ctx.from.id
    tempSessions.set(chatId, { doctor })

    const keyboard = new InlineKeyboard()
        .text('15:00', 'choose_time:15:00')
        .text('16:00', 'choose_time:16:00')
        .text('17:00', 'choose_time:17:00');

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(`Вы выбрали доктора${doctor}\nТеперь выберите время:`, {
        reply_markup: keyboard
    })
}


/** Обработка выбора времени */
export const handleTime = async (ctx: CallbackQueryContext<MyContext>) => {
    const time = ctx.callbackQuery.data.split(':')[1] + ':00'
    const chatId = ctx.chat?.id ?? ctx.from.id
    const session = tempSessions.get(chatId)

    if (!session || !session.doctor) {
        return ctx.reply("Ошибка: врач не выбран")
    }

    // Получаем user_id
    const [users] = await pool.query("SELECT id FROM users WHERE telegram_chat_id = ?", [chatId])
    if (!users.length) {
        return ctx.reply("❌ Пользователь не найден. Привяжите номер телефона.")
    }

    const userId = users[0].id
    const date = new Date().toISOString().slice(0, 10)
    const appointmentTime = `${date} ${time}`

    try {
        await pool.query("INSERT INTO appointments (user_id, appointment_time, doctor, status) VALUES (?,?,?, 'new')", [userId, appointmentTime, session.doctor])

        await ctx.answerCallbackQuery();
        await ctx.editMessageText(`✅ Вы записаны к ${session.doctor} на ${time}\nСтатус: ожидает подтверждения.`)

        const keyboard = new InlineKeyboard().text('Назад', 'backToMenu')

        await ctx.reply(`Вернуться в главное меню`, {
            reply_markup: keyboard
        })

        tempSessions.delete(chatId)
    } catch (error) {
        console.error("Ошибка при записи:", error);
        await ctx.reply("❌ Произошла ошибка при записи. Попробуйте снова.");
    }
}
