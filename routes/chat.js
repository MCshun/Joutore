// routes/chat.js
const express = require("express");
const fetch   = require("node-fetch");
const router  = express.Router();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

router.post("/", async (req, res) => {
  try {
    const userMessage = req.body.message;

    // → ここを必ず gemini-1.5-pro に変更
   const response = await fetch(
     `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // このままでOK
          contents: [
            { parts: [ { text: userMessage } ] }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("🔍 Gemini API response:", JSON.stringify(data, null, 2));

    // 正しいパスを参照してテキストを取り出す
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "返答が取得できませんでした。";

    return res.json({ reply });
  } catch (error) {
    console.error("💥 /api/chat error:", error);
    return res.status(500).json({ reply: "サーバーエラーが発生しました。" });
  }
});

module.exports = router;



