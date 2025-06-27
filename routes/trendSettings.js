// routes/trendSettings.js
const express = require('express');
const pool    = require('../db');
const router  = express.Router();

// GET: ユーザーのトレンド判定しきい値取得
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    // threshold_rising 以上 ⇒ 上昇, threshold_falling 以下 ⇒ 下降, それ以外 ⇒ 横ばい
    const [rows] = await pool.query(
      'SELECT threshold_rising, threshold_falling FROM `trend-settings` WHERE user_id = ?',
      [userId]
    );
    if (rows.length) {
      return res.json(rows[0]);
    }
    // 初回はデフォルト値を挿入して返却
    const defaults = { threshold_rising: 60, threshold_falling: 30 };
    await pool.query(
      'INSERT INTO `trend-settings` (user_id, threshold_rising, threshold_falling) VALUES (?, ?, ?)',
      [userId, defaults.threshold_rising, defaults.threshold_falling]
    );
    res.json(defaults);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'トレンドしきい値の取得に失敗しました' });
  }
});

// POST: ユーザーのトレンド判定しきい値保存
router.post('/:userId', async (req, res) => {
  const { userId } = req.params;
  const { threshold_rising, threshold_falling } = req.body;
  try {
    await pool.query(
      'UPDATE `trend-settings` SET threshold_rising = ?, threshold_falling = ? WHERE user_id = ?',
      [threshold_rising, threshold_falling, userId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'トレンドしきい値の保存に失敗しました' });
  }
});

module.exports = router;

