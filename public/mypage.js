const currentUser = JSON.parse(localStorage.getItem("loggedInUser"));

if (currentUser && currentUser.username) {
  // 初期表示
  document.getElementById("usernameDisplay").textContent = currentUser.username || "ユーザー";
  document.getElementById("username").value = currentUser.username || "";
  document.getElementById("email").value = currentUser.email || "";

  // フォーム送信処理
  document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const updatedData = {
    username: document.getElementById("username").value,
    email: document.getElementById("email").value
  };

  const newPassword = document.getElementById("password").value;
  const passwordConfirm = document.getElementById("passwordConfirm").value;

  if (newPassword.trim() !== "" && newPassword !== passwordConfirm) {
    const resultDiv = document.getElementById("updateResult");
    resultDiv.textContent = "❌ パスワードが一致しません";
    resultDiv.style.color = "red";
    return;
  }

  if (newPassword.trim() !== "") {
    updatedData.password = newPassword;
  }
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updatedData)
      });

      const resultDiv = document.getElementById("updateResult");

      if (res.ok) {
        const result = await res.json();

        if (result.passwordChanged) {
          // パスワード変更された → ログアウト
          alert("パスワードが変更されたため、再度ログインしてください。");
          localStorage.removeItem("loggedInUser");
          window.location.href = "Login.html";
        } else {
          // 通常の更新
          resultDiv.textContent = "✅ 更新しました！";
          resultDiv.style.color = "green";

          // localStorage 更新
          localStorage.setItem("loggedInUser", JSON.stringify({
            ...currentUser,
            username: updatedData.username,
            email: updatedData.email
          }));

          document.getElementById("usernameDisplay").textContent = updatedData.username;
        }
      } else {
        const data = await res.json();
        resultDiv.textContent = `❌ エラー: ${data.error || "更新に失敗しました"}`;
        resultDiv.style.color = "red";
      }
    } catch (err) {
      console.error("更新エラー:", err);
      const resultDiv = document.getElementById("updateResult");
      resultDiv.textContent = "❌ 通信エラーが発生しました";
      resultDiv.style.color = "red";
    }
  });
} else {
  // 未ログインならログインページに強制リダイレクト
  window.location.href = "Login.html";
}




