const mysql = require('mysql2/promise'); // ← Promise対応のmysql2を使う

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '', // 必要に応じてパスワードを記入
  database: 'kabu_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ✅ 接続確認（オプション：起動時に1回だけ確認したい場合）
pool.getConnection()
  .then(() => {
    console.log('✅ MySQLに接続成功');
  })
  .catch((err) => {
    console.error('❌ MySQL接続失敗:', err);
  });

module.exports = pool;


