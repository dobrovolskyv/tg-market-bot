import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { MyContext } from "../types.js";

import { pool } from "../database/connect.js";

export const productsCommand = async (ctx: CallbackQueryContext<MyContext>) => {
    ctx.answerCallbackQuery();

    if (!ctx.callbackQuery?.data) return;

    const keyboard = new InlineKeyboard().text("Назад", "backToMenu")

    try {
        const [rows] = await pool.query("SELECT * FROM products")

        const products = rows as any[];

        if (products.length === 0) {
            await ctx.callbackQuery.message?.editText('Товары не найдены',
                { reply_markup: keyboard }
            )
            return
        }

        const productsList = products.map((product) => {
            return `- ${product.name}\nЦена: ${product.price}руб.\nОписание: ${product.description}\n\n`
        })

        const btnProduct = new InlineKeyboard()
        products.forEach((btn) => {
            btnProduct.text(btn.name, `buyProduct-${btn.id}`).row()
        })

        await ctx.callbackQuery.message?.editText(`Все товары:\n${productsList}`, {
            reply_markup: btnProduct
        })
    } catch (error) {
        console.log(error)
        await ctx.callbackQuery.message?.editText('Произошла ошибка',
            { reply_markup: keyboard }
        )

    }

}