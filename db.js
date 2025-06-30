require('dotenv').config();
const mysql = require('mysql2/promise');

async function connectDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      ssl: { rejectUnauthorized: false }
    });

    console.log('MySQL に接続成功！');
    return connection;

  } catch (err) {
    console.error('DB接続エラー:', err);
    throw err;
  }
}

module.exports = connectDB;




