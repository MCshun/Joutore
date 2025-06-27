const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET: スコア設定取得
router.get("/:id", async (req, res) => {
  const userId = req.params.id;
  try {
    const [rows] = await pool.query(
      `SELECT
        tenkan_kijun_score, chikou_candle_score, price_above_kumo_score,
        golden_cross_score, dead_cross_score, price_above_ma_score, price_below_ma_score,
        bb_break_upper_score, bb_break_lower_score,
        rsi_over70_score, rsi_under30_score,
        macd_above_signal_score, macd_below_signal_score,
        total_score, stock_id
       FROM score_settings
       WHERE user_id = ? AND stock_id = 1`,
      [userId]
    );

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      // 初期設定（user_id = 0）を取得
      const [defaultRows] = await pool.query(
        `SELECT
          tenkan_kijun_score, chikou_candle_score, price_above_kumo_score,
          golden_cross_score, dead_cross_score, price_above_ma_score, price_below_ma_score,
          bb_break_upper_score, bb_break_lower_score,
          rsi_over70_score, rsi_under30_score,
          macd_above_signal_score, macd_below_signal_score,
          total_score, stock_id
         FROM score_settings
         WHERE user_id = 0 AND stock_id = 1`
      );

      if (defaultRows.length > 0) {
        res.json({ ...defaultRows[0], isDefault: true });
      } else {
        res.json({
          stock_id: 1,
          tenkan_kijun_score: 10,
          chikou_candle_score: 10,
          price_above_kumo_score: 10,
          golden_cross_score: 10,
          dead_cross_score: -10,
          price_above_ma_score: 10,
          price_below_ma_score: -10,
          bb_break_upper_score: 10,
          bb_break_lower_score: -10,
          rsi_over70_score: -5,
          rsi_under30_score: 5,
          macd_above_signal_score: 10,
          macd_below_signal_score: -10,
          total_score: 40,
          isDefault: true,
        });
      }
    }
  } catch (err) {
    console.error("初期設定取得エラー:", err);
    res.status(500).json({ error: "サーバーエラー" });
  }
});

// POST: スコア設定保存（INSERTまたはUPDATE）
router.post("/:id", async (req, res) => {
  const userId = req.params.id;
  const {
    stock_id,
    tenkan_kijun_score,
    chikou_candle_score,
    price_above_kumo_score,
    golden_cross_score,
    dead_cross_score,
    price_above_ma_score,
    price_below_ma_score,
    bb_break_upper_score,
    bb_break_lower_score,
    rsi_over70_score,
    rsi_under30_score,
    macd_above_signal_score,
    macd_below_signal_score,
    total_score
  } = req.body;

  try {
    // 既存データがあるか確認
    const [rows] = await pool.query(
      "SELECT * FROM score_settings WHERE user_id = ? AND stock_id = ?",
      [userId, stock_id]
    );

    if (rows.length > 0) {
      // 更新
      await pool.query(
        `UPDATE score_settings SET
          tenkan_kijun_score = ?, chikou_candle_score = ?, price_above_kumo_score = ?,
          golden_cross_score = ?, dead_cross_score = ?, price_above_ma_score = ?,
          price_below_ma_score = ?, bb_break_upper_score = ?, bb_break_lower_score = ?,
          rsi_over70_score = ?, rsi_under30_score = ?, macd_above_signal_score = ?,
          macd_below_signal_score = ?, total_score = ?
        WHERE user_id = ? AND stock_id = ?`,
        [
          tenkan_kijun_score, chikou_candle_score, price_above_kumo_score,
          golden_cross_score, dead_cross_score, price_above_ma_score,
          price_below_ma_score, bb_break_upper_score, bb_break_lower_score,
          rsi_over70_score, rsi_under30_score, macd_above_signal_score,
          macd_below_signal_score, total_score,
          userId, stock_id
        ]
      );
    } else {
      // 新規追加
      await pool.query(
        `INSERT INTO score_settings (
          user_id, stock_id,
          tenkan_kijun_score, chikou_candle_score, price_above_kumo_score,
          golden_cross_score, dead_cross_score, price_above_ma_score,
          price_below_ma_score, bb_break_upper_score, bb_break_lower_score,
          rsi_over70_score, rsi_under30_score, macd_above_signal_score,
          macd_below_signal_score, total_score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, stock_id,
          tenkan_kijun_score, chikou_candle_score, price_above_kumo_score,
          golden_cross_score, dead_cross_score, price_above_ma_score,
          price_below_ma_score, bb_break_upper_score, bb_break_lower_score,
          rsi_over70_score, rsi_under30_score, macd_above_signal_score,
          macd_below_signal_score, total_score
        ]
      );
    }

    res.status(200).json({ message: "保存成功" });
  } catch (err) {
    console.error("保存エラー:", err);
    res.status(500).json({ error: "保存処理に失敗しました" });
  }
});

module.exports = router;

