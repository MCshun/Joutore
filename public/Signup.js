document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signupForm");
  const resultDiv = document.getElementById("signupResult");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const email    = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();

      if (res.ok) {
        // 成功時処理
        resultDiv.className = "success";
        resultDiv.innerText = "✅ 登録に成功しました！ログインページに移動します。";

        // ここでだけリダイレクト
        setTimeout(() => {
          window.location.href = "Login.html";
        }, 1500);

      } else {
        // エラー時は画面遷移なしでメッセージ表示のみ
        resultDiv.className = "error";
        resultDiv.innerText = `❌ ${data.error || '登録に失敗しました。'}`;
        return;  // これで以降の処理を止める
      }

    } catch (err) {
      // 通信エラー時も画面遷移なし
      console.error("登録エラー:", err);
      resultDiv.className = "error";
      resultDiv.innerText = "❌ 通信エラーが発生しました";
      return;
    }
  });
});



