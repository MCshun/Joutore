document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("loggedInUser"));

  if (!user || !user.id) {
    alert("ログインしてください");
    window.location.href = "Login.html";
    return;
  }

  const userId = user.id;
  const form = document.getElementById("scoreForm");
  const resultDiv = document.getElementById("saveResult");

  // ✅ 保存メッセージを消す関数
  function clearSaveMessage() {
    resultDiv.textContent = "";
    resultDiv.style.color = "";
  }

  // ✅ 入力項目に変更があったらメッセージを消す
  for (const input of form.querySelectorAll("input")) {
    input.addEventListener("input", clearSaveMessage);
  }

  // ✅ 初期設定を取得してフォームに反映
  try {
    const res = await fetch(`/api/settings/${userId}`);
    if (res.ok) {
      const data = await res.json();
      console.log("取得した設定:", data);

      for (const [key, value] of Object.entries(data)) {
        const input = form.elements[key];
        if (input) input.value = value;
      }
    } else {
      console.warn("初期設定の取得に失敗しました");
    }
  } catch (err) {
    console.error("初期設定の取得エラー:", err);
  }

  // ✅ スコア設定の保存
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const scoreSettings = {};
    let total = 0;

    for (let [key, value] of formData.entries()) {
      const numValue = Number(value);
      const val = Number.isNaN(numValue) ? 0 : numValue;

      // ✅ スコア項目のラベルマップ（変数名 → 日本語ラベル）
      const labelMap = {
        tenkan_kijun_score: "転換線 > 基準線",
        chikou_candle_score: "遅行線 > ローソク足",
        price_above_kumo_score: "現在値 > 雲（上限）",
        golden_cross_score: "ゴールデンクロス発生",
        dead_cross_score: "デッドクロス発生",
        price_above_ma_score: "ローソク足が移動平均線より上",
        price_below_ma_score: "ローソク足が移動平均線より下",
        bb_break_upper_score: "上限バンドを上抜け",
        bb_break_lower_score: "下限バンドを下抜け",
        rsi_over70_score: "RSI > 70",
        rsi_under30_score: "RSI < 30",
        macd_above_signal_score: "MACD > シグナルライン",
        macd_below_signal_score: "MACD < シグナルライン"
      };

      for (let [key, value] of formData.entries()) {
        const numValue = Number(value);
        const val = Number.isNaN(numValue) ? 0 : numValue;

        if (key !== "stock_id" && (val < -10 || val > 10)) {
          const label = labelMap[key] || key;
          resultDiv.textContent = `❌ 「${label}」の値は -10〜10 の範囲で入力してください`;
          resultDiv.style.color = "red";
          return;
        }

        scoreSettings[key] = val;
        if (key !== "stock_id") {
          total += val;
        }
      }



      scoreSettings[key] = val;

      if (key !== "stock_id") {
        total += val;
      }
    }

    scoreSettings.total_score = total;

    if (!scoreSettings.stock_id) {
      alert("stock_id が指定されていません。");
      return;
    }

    try {
      const res = await fetch(`/api/settings/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(scoreSettings),
      });

      if (res.ok) {
        resultDiv.textContent = "✅ 設定を保存しました！";
        resultDiv.style.color = "green";
      } else {
        const data = await res.json();
        resultDiv.textContent = `❌ 保存に失敗しました: ${data.error || "エラー"}`;
        resultDiv.style.color = "red";
      }
    } catch (err) {
      console.error("通信エラー:", err);
      resultDiv.textContent = "❌ 通信エラーが発生しました";
      resultDiv.style.color = "red";
    }
  });
});

const defaultSettings = {
    tenkan_kijun_score:     8,
    chikou_candle_score:    7,
    price_above_kumo_score: 9,
    golden_cross_score:     7,
    dead_cross_score:      -7,
    price_above_ma_score:   5,
    price_below_ma_score:  -5,
    bb_break_upper_score:   4,
    bb_break_lower_score:  -4,
    rsi_over70_score:      -3,
    rsi_under30_score:      3,
    macd_above_signal_score: 7,
    macd_below_signal_score:-7
};


// --- 追記部分 start ---
const presets = {
  // ① バランス型（Balanced）
  balanced: {
    tenkan_kijun_score:     8,
    chikou_candle_score:    7,
    price_above_kumo_score: 9,
    golden_cross_score:     7,
    dead_cross_score:      -7,
    price_above_ma_score:   5,
    price_below_ma_score:  -5,
    bb_break_upper_score:   4,
    bb_break_lower_score:  -4,
    rsi_over70_score:      -3,
    rsi_under30_score:      3,
    macd_above_signal_score: 7,
    macd_below_signal_score:-7
  },

  // ② トレンド重視型（Trend-Focused）
  trend: {
    tenkan_kijun_score:    10,  // 一目シグナルを最大限重視
    chikou_candle_score:    8,
    price_above_kumo_score:10,
    golden_cross_score:     9,
    dead_cross_score:      -4,
    price_above_ma_score:   7,
    price_below_ma_score:  -3,
    bb_break_upper_score:   6,
    bb_break_lower_score:  -2,
    rsi_over70_score:      -2,
    rsi_under30_score:      2,
    macd_above_signal_score: 8,
    macd_below_signal_score:-3
  },

  // ③ 逆張り型（Reversal）
  reversal: {
    tenkan_kijun_score:     4,
    chikou_candle_score:    3,
    price_above_kumo_score: 2,
    golden_cross_score:     2,
    dead_cross_score:      -2,
    price_above_ma_score:   1,
    price_below_ma_score:  -1,
    bb_break_upper_score:  -8,  // 上抜けは売りサイン
    bb_break_lower_score:   8,  // 下抜けは買いサイン
    rsi_over70_score:      -9,
    rsi_under30_score:      9,
    macd_above_signal_score: 2,
    macd_below_signal_score:-2
  },

  // ④ 中長期型（Long-Term）
  longterm: {
    tenkan_kijun_score:     6,
    chikou_candle_score:    7,
    price_above_kumo_score:10,
    golden_cross_score:     8,
    dead_cross_score:      -8,
    price_above_ma_score:  10,  // 長期MAブレイクを重視
    price_below_ma_score:  -10,
    bb_break_upper_score:    3,
    bb_break_lower_score:   -3,
    rsi_over70_score:      -4,
    rsi_under30_score:      4,
    macd_above_signal_score: 5,
    macd_below_signal_score:-5
  }
};


document.getElementById('presetSelect').addEventListener('change', e => {
  const key = e.target.value;
  const cfg = presets[key] || defaultSettings;  // defaultSettings は既存で定義済みのもの
  fillFields(cfg);  // 後述の「入力欄に値をセットする関数」を呼び出し
});

/**
 * 各入力フィールドにプリセット値をセットするヘルパー
 */
function fillFields(cfg) {
  document.getElementById('tenkan_kijun_score').value    = cfg.tenkan_kijun_score;
  document.getElementById('chikou_candle_score').value   = cfg.chikou_candle_score;
  document.getElementById('price_above_kumo_score').value= cfg.price_above_kumo_score;
  document.getElementById('golden_cross_score').value    = cfg.golden_cross_score;
  document.getElementById('dead_cross_score').value      = cfg.dead_cross_score;
  document.getElementById('price_above_ma_score').value  = cfg.price_above_ma_score;
  document.getElementById('price_below_ma_score').value  = cfg.price_below_ma_score;
  document.getElementById('bb_break_upper_score').value  = cfg.bb_break_upper_score;
  document.getElementById('bb_break_lower_score').value  = cfg.bb_break_lower_score;
  document.getElementById('rsi_over70_score').value      = cfg.tenkan_kijun_score;
  document.getElementById('rsi_under30_score').value     = cfg.chikou_candle_score;
  document.getElementById('macd_above_signal_score').value= cfg.macd_above_signal_score;
  document.getElementById('macd_below_signal_score').value= cfg.macd_below_signal_score;
  // …他のフィールドも同様にセット…
}
// --- 追記部分 end ---

