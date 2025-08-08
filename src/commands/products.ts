import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { MyContext } from "../types.js";
// import { products } from "../consts/products.js";
import { pool } from "../database/connect.js";

export const productsCommand =async (ctx: CallbackQueryContext<MyContext>) => {
    ctx.answerCallbackQuery();

    if (!ctx.callbackQuery?.data) return;

    const [products] = await pool.query("SELECT * FROM products")

    const prod = products as any[]

    const productsList = prod.reduce((acc, cur) => {
        return (
            acc + `- ${cur.name}\nЦена: ${cur.price}руб.\nОписание: ${cur.description}\n\n`
        )
    }, '')

    const messageText = `Все товары:\n${productsList}`

    const keyboardButtonRows = prod.map((product) => {
        return InlineKeyboard.text(product.name, `buyProduct-${product.id}`)
    })

    const keyboard = InlineKeyboard.from([
        keyboardButtonRows,
        [InlineKeyboard.text('Назад', 'backToMenu')]
    ])

    ctx.callbackQuery.message?.editText(messageText, {
        reply_markup: keyboard,
    })
}