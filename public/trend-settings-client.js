// public/trend-settings-client.js
// トレンド判定しきい値設定用クライアントスクリプト

document.addEventListener("DOMContentLoaded", async () => {
  // ユーザーID取得 (user-info.jsで設定済み、なければ localStorage から)
  const storedUser = JSON.parse(localStorage.getItem("loggedInUser"));
  const userId = window.currentUserId || storedUser?.id;

  const form = document.getElementById("trendForm");
  const saveResult = document.getElementById("saveResult");

  // 初期しきい値の取得
  try {
    const res = await fetch(`/api/trend-settings/${userId}`);
    if (!res.ok) throw new Error(`設定の取得に失敗しました (HTTP ${res.status})`);
    const data = await res.json();
    ["threshold_rising", "threshold_falling"].forEach(key => {
      const el = document.getElementById(key);
      if (el && data[key] !== undefined) {
        el.value = data[key];
      }
    });
  } catch (err) {
    console.error(err);
    saveResult.textContent = err.message;
    saveResult.style.color = "red";
  }

  // フォーム送信時の処理
  form.addEventListener("submit", async e => {
    e.preventDefault();
    saveResult.textContent = "";
    saveResult.style.color = "";

    const payload = {
      threshold_rising:  Number(document.getElementById("threshold_rising").value),
      threshold_falling: Number(document.getElementById("threshold_falling").value)
    };

    try {
      const res = await fetch(`/api/trend-settings/${userId}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error(`保存に失敗しました (HTTP ${res.status})`);
      saveResult.textContent = "✅ 設定を保存しました！";
      saveResult.style.color = "green";
    } catch (err) {
      console.error(err);
      saveResult.textContent = err.message;
      saveResult.style.color = "red";
    }
  });
});

