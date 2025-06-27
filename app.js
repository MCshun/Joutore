const express = require('express');
const path    = require('path');
const app     = express();

require('dotenv').config();

const fetch = require("node-fetch");

// 🔽 JSON ボディ受け取り（必ず一番上）
app.use(express.json());

// ────────────────────────────
// 🔽 ① すべての API を先にマウント
// ────────────────────────────

// ユーザー管理
const usersRouter = require('./routes/users');
app.use('/api/users', usersRouter);

// 認証
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// スコア設定
const settingsRouter = require('./routes/settings');
app.use('/api/settings', settingsRouter);

// お気に入り（ウォッチリスト）
const watchlistRouter = require('./routes/watchlist');
app.use('/api/watchlist', watchlistRouter);

const trendSettingsRouter = require('./routes/trendSettings');
app.use('/api/trend-settings', trendSettingsRouter);

const chatRouter = require('./routes/chat');
app.use('/api/chat', chatRouter);

// ────────────────────────────
// 🔽 ② 静的ファイルは最後に
// ────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ルートで index.html も配信
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// ────────────────────────────
// 🔽 ③ サーバー起動
// ────────────────────────────
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 サーバー起動中: http://localhost:${PORT}`);
});
