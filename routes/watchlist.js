const express = require('express');
const pool    = require('../db');   // ← db.js のプールをインポート
const router  = express.Router();

// テスト用エンドポイント（残しておくとデバッグに便利）
router.get('/test', (req, res) => {
  return res.json({ ok: true });
});

// 実運用：ログインユーザーのお気に入り銘柄を返す
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;
  console.log('🍀 watchlist GET /:userId hit:', userId);

  try {
    const [rows] = await pool.execute(
      'SELECT symbol FROM watchlist WHERE user_id = ?',
      [userId]
    );
    console.log('🍀 DBから返す favorites:', rows);
    return res.json(rows);

  } catch (err) {
    console.error('🍀 watchlist fetch error:', err.stack || err);
    return res.status(500).json({ error: 'internal error' });
  }
});

// POST /api/watchlist/:userId お気に入り登録
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { symbol } = req.body;
  console.log('🍀 watchlist POST /:userId hit:', userId, symbol);

  try {
    const [result] = await pool.execute(
      'INSERT INTO watchlist (user_id, symbol) VALUES (?, ?)',
      [userId, symbol]
    );
    console.log('🍀 追加結果 insertId:', result.insertId);
    return res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('🍀 watchlist insert error:', err.stack);
    return res.status(500).json({ error: 'internal error' });
  }
});

// DELETE /api/watchlist/:userId/:symbol お気に入り解除
router.delete('/:userId/:symbol', async (req, res) => {
  const { userId, symbol } = req.params;
  console.log('🍀 watchlist DELETE /:userId/:symbol hit:', userId, symbol);

  try {
    const [result] = await pool.execute(
      'DELETE FROM watchlist WHERE user_id = ? AND symbol = ?',
      [userId, symbol]
    );
    console.log('🍀 削除結果 affectedRows:', result.affectedRows);
    return res.json({ success: true, deleted: result.affectedRows });
  } catch (err) {
    console.error('🍀 watchlist delete error:', err.stack);
    return res.status(500).json({ error: 'internal error' });
  }
});

module.exports = router;





