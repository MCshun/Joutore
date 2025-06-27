const express = require('express');
const router = express.Router();
const pool = require('../db'); // ← db → pool に変更（Promise対応）
const bcrypt = require('bcrypt');

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // emailでユーザー検索
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'メールアドレスが存在しません' });
    }

    const user = rows[0];

    // パスワード照合（bcryptで比較）
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: 'パスワードが間違っています' });
    }

    // 成功
    res.json({
      message: '✅ ログイン成功',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    console.error('❌ ログイン処理エラー:', err);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

module.exports = router;

