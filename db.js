require('dotenv').config();

const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: true }
});

connection.connect((err) => {
  if (err) {
    console.error('DB接続エラー:', err);
    return;
  }
  console.log('MySQL に接続成功！');
});

module.exports = connection;



