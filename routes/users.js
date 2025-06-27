const express = require('express');
const router = express.Router();
const pool = require('../db'); // ✅ pool をインポート
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

router.post('/', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // ① 重複メールチェック
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: 'このメールアドレスはすでに使用されています。' });
    }

    // ② パスワードハッシュ化
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // ③ INSERT
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // ④ 成功
    return res
      .status(201)
      .json({ message: '✅ ユーザー登録成功', userId: result.insertId });

  } catch (err) {
    console.error('❌ ユーザー登録エラー:', err);

    // ⑤ ER_DUP_ENTRY（もし重複INSERTで飛んできたらここでもキャッチして 400）
    if (err.code === 'ER_DUP_ENTRY') {
      return res
        .status(400)
        .json({ error: 'このメールアドレスはすでに使用されています。' });
    }

    // ⑥ それ以外はサーバーエラー
    return res
      .status(500)
      .json({ error: 'サーバーエラーが発生しました。' });
  }
});



// ✅ ユーザー情報の更新（PUT）
router.post('/', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // ── ① 重複メールチェック
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    console.log(`◆ 重複チェック: email="${email}"  件数=${existing.length}`);
    if (existing.length > 0) {
      return res
        .status(400)
        .json({ error: 'このメールアドレスはすでに使用されています。' });
    }

    // ✅ 更新クエリの準備
    let sql, values;
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      sql = 'UPDATE users SET username = ?, email = ?, password_hash = ? WHERE id = ?';
      values = [username, email, hashedPassword, userId];
    } else {
      sql = 'UPDATE users SET username = ?, email = ? WHERE id = ?';
      values = [username, email, userId];
    }

    await pool.query(sql, values);
    res.json({ message: '更新完了', passwordChanged: !!password });

  } catch (err) {
    console.error('❌ ユーザー更新エラー:', err);
    res.status(500).json({ error: 'サーバーエラー' });
  }
});

module.exports = router;





