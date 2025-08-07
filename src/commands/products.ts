import { CallbackQueryContext, InlineKeyboard } from "grammy";
import { MyContext } from "../types.js";
import { products } from "../consts/products.js";

export const productsCommand = (ctx: CallbackQueryContext<MyContext>) => {
    ctx.answerCallbackQuery();

    const productsList = products.reduce((acc, cur) => {
        return (
            acc + `- ${cur.name}\nЦена: ${cur.price}руб.\nОписание: ${cur.description}\n\n`
        )
    }, '')

    const messageText = `Все товары:\n${productsList}`

    const keyboardButtonRows = products.map((product) => {
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