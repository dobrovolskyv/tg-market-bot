//структура бд
CREATE TABLE orders (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('new','pending_payment','paid','cancelled') NOT NULL DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  qty INT UNSIGNED NOT NULL DEFAULT 1,
  sum DECIMAL(10,2) GENERATED ALWAYS AS (price * qty) STORED,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (product_id) REFERENCES products(id)
);

//логика в боте

const chatId = ctx.from?.id;
const [u] = await pool.query("SELECT id FROM users WHERE telegram_chat_id=?", [chatId]);
const userId = (u as any[])[0].id;

// Берём товар из БД
const [p] = await pool.query("SELECT price FROM products WHERE id=?", [productId]);
const price = (p as any[])[0].price;

// Создаём заказ
const [res] = await pool.query("INSERT INTO orders (user_id, total, status) VALUES (?, ?, 'pending_payment')", [userId, price]);
const orderId = (res as any).insertId;

// Добавляем строку
await pool.query("INSERT INTO order_items (order_id, product_id, price, qty) VALUES (?, ?, ?, 1)", [orderId, productId, price]);

//3 создание платежа в юкасса
import fetch from "node-fetch";
import crypto from "crypto";

async function createPayment(orderId, amount, description) {
  const shopId = process.env.YK_SHOP_ID;
  const secret = process.env.YK_SECRET;
  const auth = Buffer.from(`${shopId}:${secret}`).toString("base64");

  const response = await fetch("https://api.yookassa.ru/v3/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotence-Key": crypto.randomUUID(),
      "Authorization": `Basic ${auth}`,
    },
    body: JSON.stringify({
      amount: { value: amount.toFixed(2), currency: "RUB" },
      capture: true,
      description,
      confirmation: {
        type: "redirect",
        return_url: "https://t.me/YourBot",
      },
      metadata: {
        order_id: orderId
      }
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`YooKassa error: ${response.status} ${text}`);
  }

  return response.json(); // { id, status, confirmation:{confirmation_url}, ... }
}

//Отправка ссылки на оплату пользователю
const payment = await createPayment(orderId, price, `Оплата заказа #${orderId}`);
await ctx.reply(`Оплатите по ссылке: ${payment.confirmation.confirmation_url}`);
