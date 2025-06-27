// trend-script.js

// ————————————————————————
// ここからユーティリティ関数
// ————————————————————————

/** 単純移動平均 */
function avg(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

/** EMA 計算 */
function ema(values, period) {
  const k = 2 / (period + 1);
  let emaPrev = values[0];
  return values.map((price, i) => {
    emaPrev = i === 0 ? price : price * k + emaPrev * (1 - k);
    return emaPrev;
  });
}

/** 一目均衡表＋MA＋BB＋RSI＋MACD のスコア計算 */
function trendScore(data, settings) {
  let score = 0, maxScore = 0;
  const len = data.length;
  const closes = data.map(d => d.close);

  // ——— MA のゴールデンクロス・デッドクロス ———
  if (len >= 26) {
    const shortMA     = avg(closes.slice(-5));
    const longMA      = avg(closes.slice(-25));
    const prevShortMA = avg(closes.slice(-6, -1));
    const prevLongMA  = avg(closes.slice(-26, -1));

    if (prevShortMA < prevLongMA && shortMA > longMA)
      score += settings.golden_cross_score;
    maxScore += Math.abs(settings.golden_cross_score);

    if (prevShortMA > prevLongMA && shortMA < longMA)
      score += settings.dead_cross_score;
    maxScore += Math.abs(settings.dead_cross_score);

    // 現在値 vs 長期MA
    score += closes[len - 1] > longMA
      ? settings.price_above_ma_score
      : settings.price_below_ma_score;
    maxScore += Math.max(
      Math.abs(settings.price_above_ma_score),
      Math.abs(settings.price_below_ma_score)
    );
  }

  // ——— 一目均衡表 ———
  if (len >= 52) {
    const latest      = data[len - 1];
    const high9       = Math.max(...data.slice(-9).map(d => d.high));
    const low9        = Math.min(...data.slice(-9).map(d => d.low));
    const tenkan      = (high9 + low9) / 2;
    const high26      = Math.max(...data.slice(-26).map(d => d.high));
    const low26       = Math.min(...data.slice(-26).map(d => d.low));
    const kijun       = (high26 + low26) / 2;
    const senkouA     = (tenkan + kijun) / 2;
    const chikouClose = data[len - 26].close;

    score += tenkan > kijun
      ? settings.tenkan_kijun_score
      : -settings.tenkan_kijun_score;
    maxScore += Math.abs(settings.tenkan_kijun_score);

    score += latest.close > chikouClose
      ? settings.chikou_candle_score
      : -settings.chikou_candle_score;
    maxScore += Math.abs(settings.chikou_candle_score);

    score += latest.close > senkouA
      ? settings.price_above_kumo_score
      : -settings.price_above_kumo_score;
    maxScore += Math.abs(settings.price_above_kumo_score);
  }

  // ——— ボリンジャーバンド ———
  if (len >= 20) {
    const slice20 = data.slice(-20).map(d => d.close);
    const sma20   = avg(slice20);
    const stdDev  = Math.sqrt(
      slice20.reduce((sum, v) => sum + (v - sma20) ** 2, 0) /
      slice20.length
    );
    const upper = sma20 + 2 * stdDev;
    const lower = sma20 - 2 * stdDev;
    const last  = closes[len - 1];

    if (last > upper) score += settings.bb_break_upper_score;
    maxScore += Math.abs(settings.bb_break_upper_score);

    if (last < lower) score += settings.bb_break_lower_score;
    maxScore += Math.abs(settings.bb_break_lower_score);
  }

  // ——— RSI ———
  if (len >= 15) {
    let gains = 0, losses = 0;
    for (let i = len - 14; i < len; i++) {
      const diff = closes[i] - closes[i - 1];
      if (diff > 0) gains += diff;
      else losses -= diff;
    }
    const avgGain = gains / 14;
    const avgLoss = losses / 14 || 1;
    const rs      = avgGain / avgLoss;
    const rsi     = 100 - (100 / (1 + rs));

    if (rsi > 70) score += settings.rsi_over70_score;
    maxScore += Math.abs(settings.rsi_over70_score);

    if (rsi < 30) score += settings.rsi_under30_score;
    maxScore += Math.abs(settings.rsi_under30_score);
  }

  // ——— MACD ———
  if (len >= 35) {
    const ema12   = ema(closes, 12);
    const ema26   = ema(closes, 26);
    const macd    = ema12.map((v, i) => v - ema26[i]);
    const signal  = ema(macd.slice(-26), 9).slice(-1)[0];
    const macdVal = macd.slice(-1)[0];

    if (macdVal > signal) score += settings.macd_above_signal_score;
    else               score += settings.macd_below_signal_score;

    maxScore += Math.max(
      Math.abs(settings.macd_above_signal_score),
      Math.abs(settings.macd_below_signal_score)
    );
  }

  return { score, maxScore };
}


// ————————————————————————
// ここから main() 以下
// ————————————————————————

let favorites = [];
let trendResults = [];
let sortDescending = true;
let userId = 0;

async function main() {
  console.log("▶ main start");
  const files = [
    { name: "仮天堂", path: "json/仮天堂_mock_data.json" },
    { name: "カリタ", path: "json/カリタ_mock_data.json" },
    { name: "仮菱UFJ", path: "json/仮菱UFJ_mock_data.json" },
    { name: "カリー", path: "json/カリー_mock_data.json" },
    { name: "仮立", path: "json/仮立_mock_data.json" }
  ];

  // 1) ユーザーID
  const user = JSON.parse(localStorage.getItem("loggedInUser"));
  userId = user?.id || 0;
  console.log("   userId =", userId);

  // 2) お気に入りセクション表示制御
  const favSection = document.getElementById('favoritesSection');
  if (favSection) {
    favSection.style.display = userId ? 'block' : 'none';
  }

  // 3) スコア設定取得
  let userScoreSettings = {};
  if (userId) {
    try {
      const res = await fetch(`/api/settings/${userId}`);
      userScoreSettings = await res.json();
      console.log("   settings from server:", userScoreSettings);
    } catch (err) {
      console.error("   スコア設定取得失敗:", err);
    }
  }
  // 4) default のフォールバック
  const defaultSettings = {
    golden_cross_score: 10,
    dead_cross_score: -10,
    price_above_ma_score: 10,
    price_below_ma_score: -10,
    bb_break_upper_score: 10,
    bb_break_lower_score: -10,
    rsi_over70_score: -5,
    rsi_under30_score: 5,
    tenkan_kijun_score: 10,
    chikou_candle_score: 10,
    price_above_kumo_score: 10,
    macd_above_signal_score: 10,
    macd_below_signal_score: -10
  };
  userScoreSettings = { ...defaultSettings, ...userScoreSettings };
  console.log("   使用するsettings:", userScoreSettings);

  // 5) トレンドしきい値取得
  let thresholdSettings = { threshold_rising: 60, threshold_falling: 30 };
  if (userId) {
    try {
      const res = await fetch(`/api/trend-settings/${userId}`);
      if (res.ok) thresholdSettings = await res.json();
      console.log("   しきい値:", thresholdSettings);
    } catch (err) {
      console.error("   しきい値取得失敗:", err);
    }
  }
  const { threshold_rising, threshold_falling } = thresholdSettings;

  // 6) トレンド計算
  try {
    await Promise.all(files.map(async file => {
      const data = await fetch(file.path).then(r => r.json());
      const latest = data[data.length - 1];
      const { score, maxScore } = trendScore(data, userScoreSettings);
      const percent = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
      trendResults.push({
        name: file.name,
        symbol: file.name,
        price: latest.close,
        percent,
        cellClass: percent >= threshold_rising ? 'high'
                  : percent <= threshold_falling ? 'low'
                  : 'neutral',
        trendIcon: percent >= threshold_rising ? '🔺 上昇'
                  : percent <= threshold_falling ? '🔻 下降'
                  : '⏸ 横ばい'
      });
    }));

    localStorage.setItem('trendResults', JSON.stringify(trendResults));
    console.log('▶ trendResults を localStorage に書き込みました', trendResults);
  } catch (e) {
    console.error("   trendScore周りでエラー:", e);
  }

  // 7) お気に入り取得
  if (userId) {
    try {
      const favRes = await fetch(`/api/watchlist/${userId}`);
      favorites = favRes.ok ? await favRes.json() : [];
      console.log("   favorites:", favorites);
    } catch (e) {
      console.error("   お気に入り取得失敗:", e);
      favorites = [];
    }
  }

  // 8) ランキング描画
  const rankingBody = document.getElementById('rankingTable');
  if (rankingBody) {
    renderRanking(trendResults);
  }

  // 9) 一覧描画
  const tbody = document.getElementById('trendTable');
  if (tbody) {
    renderTable(trendResults, sortDescending);
    setupControls();
  } else {
    console.warn("   trendTable 用の要素が見つかりません");
  }
}

function renderTable(results, sortDesc) {
  const tbody = document.getElementById('trendTable');
  tbody.innerHTML = "";

  const searchValue = document.getElementById('searchInput')?.value.trim() || "";
  const trendFilter = document.getElementById('trendSelect')?.value || "all";
  const sorted = results
    .filter(item => {
      const matchName = item.name.includes(searchValue);
      const matchTrend =
        trendFilter === "all" ||
        (trendFilter === "up" && item.percent >= threshold_rising) ||
        (trendFilter === "down" && item.percent <= threshold_falling) ||
        (trendFilter === "flat" && item.percent > threshold_falling && item.percent < threshold_rising);
      return matchName && matchTrend;
    })
    .sort((a, b) => sortDesc ? b.percent - a.percent : a.percent - b.percent);

  sorted.forEach(result => {
    const isFav = favorites.some(f => f.symbol === result.name);
    const btnClass = isFav ? "favorite-btn favorited" : "favorite-btn";
    const btnText  = isFav ? "✔ 登録済み" : "★ 登録";
    const needsLoginAttr = userId === 0 ? ' data-needs-login' : '';

    tbody.innerHTML += `
    <tr>
      <td>
        <a href="chart.html?symbol=${encodeURIComponent(result.name)}"
          class="link-underline">
          ${result.name}
        </a>
      </td>
      <td>${result.price.toFixed(2)}</td>
      <td class="score-cell ${result.cellClass}">${result.percent}点</td>
      <td>${result.trendIcon}</td>
      <td>
        <button
          class="${btnClass}"
          data-symbol="${result.name}"
          ${needsLoginAttr}
        >
          ${btnText}
        </button>
      </td>
    </tr>`;
  });

  const sortBtn = document.getElementById('sortToggle');
  if (sortBtn) {
    sortBtn.textContent = `スコア順に並び替え：${sortDesc ? "⬇ 降順" : "⬆ 昇順"}`;
  }
}

function renderRanking(results) {
  const top3 = [...results].sort((a, b) => b.percent - a.percent).slice(0, 3);
  const tb = document.getElementById('rankingTable');
  tb.innerHTML = "";
  top3.forEach((item, i) => {
    tb.innerHTML += `
      <tr>
        <td>${i+1}位</td>
        <td>${item.name}</td>
        <td>${item.percent}点</td>
      </tr>`;
  });
}

function setupControls() {
  document.getElementById('sortToggle')?.addEventListener('click', () => {
    sortDescending = !sortDescending;
    renderTable(trendResults, sortDescending);
  });
  document.getElementById('searchInput')?.addEventListener('input', () => {
    renderTable(trendResults, sortDescending);
  });
  document.getElementById('trendSelect')?.addEventListener('change', () => {
    renderTable(trendResults, sortDescending);
  });

  document.addEventListener("click", async e => {
    const btn = e.target.closest(".favorite-btn");
    if (!btn) return;
    if (btn.dataset.needsLogin !== undefined) {
      window.location.href = "Login.html?reason=watchlist";
      return;
    }
    const symbol = btn.dataset.symbol;
    const isFav  = btn.classList.contains("favorited");
    try {
      let res;
      if (isFav) {
        res = await fetch(`/api/watchlist/${userId}/${symbol}`, { method: "DELETE" });
      } else {
        res = await fetch(`/api/watchlist/${userId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, symbol })
        });
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      if (isFav) favorites = favorites.filter(f => f.symbol !== symbol);
      else favorites.push({ symbol });
      renderTable(trendResults, sortDescending);
    } catch (err) {
      console.error(err);
      alert(isFav ? "解除に失敗しました" : "登録に失敗しました");
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main);
} else {
  main();
}




