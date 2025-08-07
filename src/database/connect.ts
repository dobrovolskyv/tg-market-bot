import mysql from 'mysql2/promise'

// export const pool = mysql.createPool({
//     host: 'mysql',
//     port: 3307,
//     user: 'root',
//     password: 'root',
//     database: 'tg_chatbot'
// })
export const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'tg_chatbot',
  port: 8889, 
});

