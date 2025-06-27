document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  const userArea = document.getElementById("userArea");

  if (userArea) {
    if (user && user.username) {
      // ✅ グローバルに userId を保持（他JSで使える）
      window.currentUserId = user.id;

      // ユーザー表示部分
      userArea.innerHTML = `
        <div class="user-menu">
          <span id="userName" class="user-name">👤 ${user.username}</span>
          <div id="userDropdown" class="dropdown hidden">
            <button id="editBtn">ユーザー情報の編集</button>
            <button id="settings">スコア設定</button>
            <button id="trendSettingsBtn">トレンド設定</button>
            <button id="logoutBtn">ログアウト</button>
          </div>
        </div>
      `;

      // ドロップダウン切り替え処理
      const nameEl = document.getElementById("userName");
      const dropdown = document.getElementById("userDropdown");

      nameEl.addEventListener("click", () => {
        dropdown.classList.toggle("hidden");
      });

      // 各メニューの動作
      document.getElementById("editBtn").addEventListener("click", () => {
        window.location.href = "mypage.html";
      });

      document.getElementById("settings").addEventListener("click", () => {
        window.location.href = "settings.html";
      });

      document.getElementById("trendSettingsBtn").addEventListener("click", () => {
      window.location.href = "trend-settings.html";
      });

      document.getElementById("logoutBtn").addEventListener("click", () => {
        localStorage.removeItem("loggedInUser");
        window.location.href = "index.html";
      });

    } else {
      // 未ログインならログインリンク表示
      userArea.innerHTML = `<a href="Login.html" style="margin-left: 20px;">ログイン</a>`;
    }
  }

  // スコア設定ボタン（任意）の表示制御
  const btn = document.getElementById("settingsButtonArea");
  if (user && user.username && btn) {
    btn.style.display = "block";
  }
});




