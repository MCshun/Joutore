// login.js
function initLoginPage() {
  // ■ 理由チェック＆メッセージ表示
  const params = new URLSearchParams(window.location.search);
  if (params.get("reason") === "watchlist") {
    const notice = document.getElementById("loginNotice");
    if (notice) notice.textContent = "⭐ お気に入り登録にはログインが必要です";
  }

  // ■ フォーム submit ハンドラ登録
  const form = document.getElementById("loginForm");
  const resultDiv = document.getElementById("loginResult");
  form.addEventListener("submit", async e => {
    e.preventDefault();
    resultDiv.textContent = "";

    const email    = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("loggedInUser", JSON.stringify(data.user));
        window.location.href = "index.html";
      } else {
        resultDiv.textContent = `❌ ${data.error || "ログインに失敗しました"}`;
      }
    } catch {
      resultDiv.textContent = "❌ サーバーに接続できません";
    }
  });
}

// もしまだ DOMContentLoaded 前なら待ち、済んでいれば即実行
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLoginPage);
} else {
  initLoginPage();
}
