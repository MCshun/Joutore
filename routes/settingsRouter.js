const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/settings/:userId
router.get('/:userId', async (req, res) => {
  const userId = req.params.userId;

  try {
    const [rows] = await pool.query(
      'SELECT * FROM score_settings WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      const [defaultRows] = await pool.query(
        'SELECT * FROM score_settings WHERE user_id = 0 LIMIT 1'
      );
      if (defaultRows.length > 0) {
        res.json({ ...defaultRows[0], isDefault: true }); // 初期設定であることを明示
      } else {
        res.status(404).send('初期設定が存在しません');
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('スコア設定の取得中にエラーが発生しました');
  }
});

module.exports = router;
