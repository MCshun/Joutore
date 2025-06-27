// public/js/chat.js（ブラウザ向け）
// ────────────────────────────────────────
// ここには require() や APIキーの直接記述を一切入れない！
// サーバーの /api/chat エンドポイントに fetch するだけ。

// 送信間隔を制御するための変数
let lastSent = 0;            // 最後に送信したタイムスタンプ（ms）
const COOLDOWN = 60_000;     // 60秒

// ボタンと入力欄を取得
const sendBtn = document.getElementById("send-btn");
const input   = document.getElementById("user-input");

sendBtn.addEventListener("click", async () => {
  const now = Date.now();

  // 60秒経っていなければガード
  if (now - lastSent < COOLDOWN) {
    const wait = Math.ceil((COOLDOWN - (now - lastSent)) / 1000);
    alert(`少し待ってください：あと ${wait} 秒後に送信できます`);
    return;
  }

  const message = input.value.trim();
  if (!message) return;

  // 送信をロック
  lastSent = now;
  sendBtn.disabled = true;
  setTimeout(() => {
    sendBtn.disabled = false;
  }, COOLDOWN);

  // メッセージ追加＆入力クリア
  addMessage("あなた", message);
  input.value = "";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    const reply = Array.isArray(data)
      ? data[0]?.reply || "AIからの返答がありません。"
      : data.reply;
    addMessage("AI", reply);
  } catch (error) {
    addMessage("AI", "エラーが発生しました");
    console.error("チャット通信エラー:", error);
  }
});

function addMessage(sender, text) {
  const box = document.getElementById("chat-box");
  const msg = document.createElement("div");
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}




