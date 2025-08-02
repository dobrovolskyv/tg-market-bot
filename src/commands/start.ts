import { InlineKeyboard } from "grammy";
import { User } from "../models/User.js";
import { MyContext } from "../types.js";

 
 
 export const start =  async (ctx: MyContext) => {
   if (!ctx.from) {
     return ctx.reply('User info is not aviable');
   }
 
   const { id, first_name, username } = ctx.from;
 
   try {
 
     const keyboard = new InlineKeyboard().text('Меню', 'menu')
     const existingUser = await User.findOne({ telegramId: id });
 
     if (existingUser) {
       return ctx.reply('Вы уже зарегестрированы', {
         reply_markup: keyboard
       });
     }
 
     const newUser = new User({
       telegramId: id,
       firstname: first_name,
       username,
     })
     newUser.save();
     return ctx.reply('Вы успешно зарегестрированы', {
       reply_markup: keyboard
     });
   } catch (error) {
     console.error('Ошибка при регистрации', error)
     ctx.reply('Произошла ошибка при регистрации');
   }
 
 }