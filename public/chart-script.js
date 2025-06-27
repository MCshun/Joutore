// --- グローバル変数 ---
let symbol;
let originalData = [];
let stockBalanceData = [];
let volumeChart, shortChart, marginChart;
let rsiChart;
let macdChart;
let trendResults = [];


async function ensureTrendResults() {
  const stored = localStorage.getItem("trendResults");
  let shouldFetch = false;

  if (!stored) {
    shouldFetch = true;
  } else {
    try {
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        shouldFetch = true;
      }
    } catch {
      shouldFetch = true;
    }
  }

  if (!shouldFetch) {
    console.log("✅ trendResults は既に保存されています");
    return;
  }

  // --- ここからデータ取得 ---
  try {
    const files = [
      { name: "仮天堂", path: "json/仮天堂_mock_data.json" },
      { name: "カリタ", path: "json/カリタ_mock_data.json" },
      { name: "仮菱UFJ", path: "json/仮菱UFJ_mock_data.json" },
      { name: "カリー", path: "json/カリー_mock_data.json" },
      { name: "仮立", path: "json/仮立_mock_data.json" }
    ];


    await Promise.all(
      files.map(file =>
        fetch(file.path)
          .then(res => {
            if (!res.ok) throw new Error(`${file.name} 読み込み失敗`);
            return res.json();
          })
          .then(data => {
            const latest = data[data.length - 1];
            trendResults.push({
              name: file.name,
              price: latest.close,
              percent: Math.floor(Math.random() * 100)
            });
          })
          .catch(err => {
            console.error(`❌ ${file.name} エラー:`, err);
          })
      )
    );

    console.log("🔥 trendResults 初期化成功:", trendResults);
    localStorage.setItem("trendResults", JSON.stringify(trendResults));

  } catch (e) {
    alert("銘柄リストの取得に失敗しました");
  }
}

// --- symbolチェックと自動リダイレクト ---
/**
 * URL の ?symbol= を読み取り、
 * なければ localStorage の trendResults から
 * あいうえお順で最初の銘柄を symbol にセットする。
 */
function checkSymbol() {
  const params = new URLSearchParams(window.location.search);
  let sym = params.get("symbol");

  if (!sym || sym.trim() === "") {
    const stored = localStorage.getItem("trendResults");
    if (stored) {
      const arr = JSON.parse(stored);
      if (Array.isArray(arr) && arr.length > 0) {
        // --- ここをあいうえお順（日本語ロケール）にソート ---
        arr.sort((a, b) =>
          a.name.localeCompare(b.name, 'ja')
        );
        sym = arr[0].name;
      }
    }
  }

  symbol = sym;  // グローバル変数にセット
}

// オートコンプリート処理（DOMContentLoaded内）
document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("autocompleteInput");
  const suggestionList = document.getElementById("suggestionList");
  const storedResults = localStorage.getItem("trendResults");

  if (!input || !suggestionList || !storedResults) return;

  const results = JSON.parse(storedResults);
  const candidateSymbols = results.map(item => item.name);
  let suggestions = []; // 👈 ここを外に出す

  function showSuggestions() {
    const value = input.value.trim().toLowerCase();
    suggestionList.innerHTML = "";

    if (value === "") {
      suggestionList.classList.remove("show");
      suggestions = [];
      return;
    }

    suggestions = candidateSymbols.filter(name =>
      name.toLowerCase().includes(value)
    );

    if (suggestions.length === 0) {
      const div = document.createElement("div");
      div.textContent = "一致する銘柄がありません";
      div.style.color = "#888";
      suggestionList.appendChild(div);
    } else {
      suggestions.forEach(name => {
        const div = document.createElement("div");
        div.textContent = name;
        div.classList.add("suggestion-item");
        div.addEventListener("click", () => {
          input.value = name;
          location.href = `chart.html?symbol=${encodeURIComponent(name)}`;
        });
        suggestionList.appendChild(div);
      });
    }

    suggestionList.classList.add("show");
  }

  input.addEventListener("input", showSuggestions);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      if (suggestions.length > 0) {
        const selected = suggestions[0];
        input.value = selected; // 👈 入力欄も更新しておく
        location.href = `chart.html?symbol=${encodeURIComponent(selected)}`;
      } else {
        alert("該当する銘柄が見つかりません。");
      }
    }
  });


  input.addEventListener("blur", () => {
    setTimeout(() => {
      suggestionList.innerHTML = "";
      suggestionList.classList.remove("show");
    }, 150);
  });
});

// 以下に drawChartsForMonths や calculate系関数などを続けて定義..." // 省略可

// --- テクニカル指標の計算 ---
function calculateSMA(data, period = 3) {
  const sma = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const avg = slice.reduce((sum, d) => sum + d.c, 0) / period;
    sma.push({ x: data[i].x, y: avg });
  }
  return sma;
}

function calculateEMA(data, period) {
  const k = 2 / (period + 1);
  const ema = [];
  const getValue = d => (d && d.y !== undefined ? d.y : d?.c ?? null);

  let emaPrev = getValue(data[0]);
  if (emaPrev === null) return [];

  for (let i = 0; i < data.length; i++) {
    const price = getValue(data[i]);
    if (price === null) continue; // 無効データはスキップ

    emaPrev = i === 0 ? price : price * k + emaPrev * (1 - k);
    ema.push({ x: data[i].x, y: emaPrev });
  }

  return ema;
}


function calculateMACD(data) {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);

  const macdLine = [];
  const minLength = Math.min(ema12.length, ema26.length);
  const ema12Start = ema12.length - minLength;
  const ema26Start = ema26.length - minLength;

  for (let i = 0; i < minLength; i++) {
    const macdVal = ema12[i + ema12Start].y - ema26[i + ema26Start].y;
    macdLine.push({ x: ema26[i + ema26Start].x, y: macdVal });
  }

  const signalLine = calculateEMA(macdLine, 9);
  const histogram = [];

  const signalStart = macdLine.length - signalLine.length;
  for (let i = 0; i < signalLine.length; i++) {
    histogram.push({
      x: signalLine[i].x,
      y: macdLine[i + signalStart].y - signalLine[i].y
    });
  }

  return { macdLine, signalLine, histogram };
}


function renderMACDChart(macd) {
  new Chart(document.getElementById('macdChart'), {
    type: 'bar',
    data: {
      datasets: [
        {
          label: 'MACD Histogram',
          type: 'bar',
          data: macd.histogram.filter(d => !isNaN(d.y)),
          backgroundColor: 'rgba(0, 150, 200, 0.5)',
          yAxisID: 'y'
        },
        {
          label: 'MACD Line',
          type: 'line',
          data: macd.macdLine.filter(d => !isNaN(d.y)),
          borderColor: 'blue',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          yAxisID: 'y'
        },
        {
          label: 'Signal Line',
          type: 'line',
          data: macd.signalLine.filter(d => !isNaN(d.y)),
          borderColor: 'red',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.3,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: true } },
      scales: {
        x: {
          type: 'timeseries',
          time: { unit: 'day' },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        y: {
          title: { display: true, text: 'MACD' },
          grid: { color: 'rgba(0,0,0,0.05)' }
        }
      }
    }
  });
}


function calculateRSI(data, period = 14) {
  const rsi = [];
  let gains = 0, losses = 0;

  for (let i = 1; i < period; i++) {
    if (!data[i] || !data[i - 1]) continue;
    const change = data[i].c - data[i - 1].c;
    if (change > 0) gains += change; else losses -= change;
  }

  for (let i = period; i < data.length; i++) {
    if (!data[i] || !data[i - 1]) continue;
    const change = data[i].c - data[i - 1].c;
    const gain = Math.max(change, 0);
    const loss = Math.max(-change, 0);
    gains = (gains * (period - 1) + gain) / period;
    losses = (losses * (period - 1) + loss) / period;
    const rs = gains / (losses || 1);
    rsi.push({ x: data[i].x, y: 100 - (100 / (1 + rs)) });
  }

  return rsi;
}


function calculateIchimoku(data) {
  const conversionLine = [], baseLine = [], leadingSpanA = [], leadingSpanB = [], laggingSpan = [];
  for (let i = 0; i < data.length; i++) {
    if (i >= 8) {
      const high9 = Math.max(...data.slice(i - 8, i + 1).map(d => d.h));
      const low9 = Math.min(...data.slice(i - 8, i + 1).map(d => d.l));
      conversionLine.push({ x: data[i].x, y: (high9 + low9) / 2 });
    }
    if (i >= 25) {
      const high26 = Math.max(...data.slice(i - 25, i + 1).map(d => d.h));
      const low26 = Math.min(...data.slice(i - 25, i + 1).map(d => d.l));
      baseLine.push({ x: data[i].x, y: (high26 + low26) / 2 });
      if (i >= 51) {
        const high52 = Math.max(...data.slice(i - 51, i + 1).map(d => d.h));
        const low52 = Math.min(...data.slice(i - 51, i + 1).map(d => d.l));
        const date26Ahead = new Date(data[i].x);
        date26Ahead.setDate(date26Ahead.getDate() + 26);
        leadingSpanB.push({ x: date26Ahead, y: (high52 + low52) / 2 });
      }
    }
    if (conversionLine.length > 0 && baseLine.length > 0) {
      const spanA = (conversionLine[conversionLine.length - 1].y + baseLine[baseLine.length - 1].y) / 2;
      const date26Ahead = new Date(data[i].x);
      date26Ahead.setDate(date26Ahead.getDate() + 26);
      leadingSpanA.push({ x: date26Ahead, y: spanA });
    }
    if (i >= 26) {
      const date26Ago = new Date(data[i].x);
      date26Ago.setDate(date26Ago.getDate() - 26);
      laggingSpan.push({ x: date26Ago, y: data[i].c });
    }
  }
  return { conversionLine, baseLine, leadingSpanA, leadingSpanB, laggingSpan };
}

function calculateBollingerBands(data, period = 20) {
  const basis = [], upper = [], lower = [];
  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const closes = slice.map(d => d.c);
    const avg = closes.reduce((sum, val) => sum + val, 0) / period;
    const stdDev = Math.sqrt(closes.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / period);
    const date = data[i].x;
    basis.push({ x: date, y: avg });
    upper.push({ x: date, y: avg + 2 * stdDev });
    lower.push({ x: date, y: avg - 2 * stdDev });
  }
  return { basis, upper, lower };
}

// --- メインチャート ---
const chart = new Chart(document.getElementById('candlestickChart'), {
  type: 'candlestick',
  data: { datasets: [] },
  options: {
    responsive: true,
    plugins: { legend: { position: 'top', labels: { boxWidth: 12 } } },
    scales: {
      x: { type: 'timeseries', time: { unit: 'day' }, grid: { color: 'rgba(0, 0, 0, 0.05)' } },
      y: { beginAtZero: false, title: { display: true, text: '株価' }, grid: { color: 'rgba(0, 0, 0, 0.05)' } }
    }
  }
});

function initAutocomplete() {
  const input = document.getElementById("autocompleteInput");
  const suggestionList = document.getElementById("suggestionList");
  const storedResults = localStorage.getItem("trendResults");

  if (!input || !suggestionList || !storedResults) {
    console.warn("オートコンプリート初期化失敗");
    return;
  }

  const results = JSON.parse(storedResults);
  const candidateSymbols = results.map(item => item.name);

  input.addEventListener("input", () => {
    const value = input.value.trim().toLowerCase();
    suggestionList.innerHTML = "";

    const suggestions = candidateSymbols.filter(name =>
      name.toLowerCase().includes(value)
    );

    if (suggestions.length === 0) {
      const div = document.createElement("div");
      div.textContent = "一致する銘柄がありません";
      div.style.color = "#888";
      suggestionList.appendChild(div);
      return;
    }

    suggestions.forEach(name => {
      const div = document.createElement("div");
      div.textContent = name;
      div.addEventListener("click", () => {
        location.href = `chart.html?symbol=${encodeURIComponent(name)}`;
      });
      suggestionList.appendChild(div);
    });
  });

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const exactMatch = candidateSymbols.find(name =>
        name.toLowerCase() === input.value.trim().toLowerCase()
      );
      if (exactMatch) {
        location.href = `chart.html?symbol=${encodeURIComponent(exactMatch)}`;
      } else {
        alert("該当する銘柄が見つかりません。");
      }
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(() => {
      suggestionList.innerHTML = "";
    }, 150);
  });
}

// --- データ取得と描画 ---
// --- 株価チャートデータ取得と同時に、残高系データも取得する ---

// --- チェックボックス制御 ---
document.getElementById('smaToggle').addEventListener('change', function () {
  const checked = this.checked;
  chart.data.datasets.forEach(ds => {
    if (ds.label === 'SMA(3)') ds.hidden = !checked;
  });
  chart.update();
});

document.getElementById('ichimokuToggle').addEventListener('change', function () {
  const checked = this.checked;
  const ichimokuLabels = [ '転換線', '基準線', '雲（上限）', '雲（下限）', '遅行線' ];
  chart.data.datasets.forEach(ds => {
    if (ichimokuLabels.includes(ds.label)) ds.hidden = !checked;
  });
  chart.update();
});

document.getElementById('bbToggle').addEventListener('change', function () {
  const checked = this.checked;
  const bbLabels = [ 'BB Basis', 'BB Upper', 'BB Lower' ];
  chart.data.datasets.forEach(ds => {
    if (bbLabels.includes(ds.label)) ds.hidden = !checked;
  });
  chart.update();
});

document.getElementById('rsiToggle').addEventListener('change', function () {
  const checked = this.checked;
  const rsiCanvas = document.getElementById('rsiChart');
  if (rsiCanvas) {
    rsiCanvas.style.display = checked ? 'block' : 'none';
  }
});

document.getElementById('macdToggle').addEventListener('change', function () {
  const checked = this.checked;
  const macdChart = Chart.getChart('macdChart');
  const macdCanvas = document.getElementById('macdChart');
  if (macdChart && macdCanvas) {
    macdChart.data.datasets.forEach(ds => {
      ds.hidden = !checked;
    });
    macdCanvas.style.display = checked ? 'block' : 'none';
    macdChart.update();
  }
});

document.getElementById('volumeToggle').addEventListener('change', function () {
  const canvas = document.getElementById('volumeChart');
  canvas.style.display = this.checked ? 'block' : 'none';
});

document.getElementById('shortToggle').addEventListener('change', function () {
  const canvas = document.getElementById('shortSellingChart');
  canvas.style.display = this.checked ? 'block' : 'none';
});

document.getElementById('marginToggle').addEventListener('change', function () {
  const canvas = document.getElementById('marginBalanceChart');
  canvas.style.display = this.checked ? 'block' : 'none';
});

// --- 表示期間ラジオボタン ---
document.querySelectorAll('input[name="range"]').forEach(radio => {
  radio.addEventListener('change', e => {
    const months = parseInt(e.target.value, 10);
    drawChartsForMonths(months);
  });
});

document.getElementById("chartTitle").textContent = `チャート分析（${symbol}）`;

function drawChartsForMonths(months) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - months);

  const filtered = originalData.filter(d => d && d.x && d.c !== undefined && d.x >= startDate && d.x <= endDate);
  if (filtered.length === 0) {
    alert("データが不足しているため表示できません。");
    return;
  }

  const sma = calculateSMA(filtered);
  const ichimoku = calculateIchimoku(filtered);
  const rsi = calculateRSI(filtered);
  const bb = calculateBollingerBands(filtered);
  const macd = calculateMACD(filtered);

  // チェックボックス状態取得
  const showSMA = document.getElementById('smaToggle').checked;
  const showIchimoku = document.getElementById('ichimokuToggle').checked;
  const showBB = document.getElementById('bbToggle').checked;

  // メインチャート更新
  const datasets = [
    { label: '株価', data: filtered, yAxisID: 'y', barThickness: 6 }
  ];

  // SMA
  datasets.push({
    label: 'SMA(3)',
    type: 'line',
    data: sma,
    borderColor: 'steelblue',
    borderWidth: 2,
    pointRadius: 0,
    tension: 0.3,
    yAxisID: 'y',
    hidden: !showSMA
  });

  // 一目均衡表
  const ichimokuLabels = [
    { label: '転換線', data: ichimoku.conversionLine, color: 'orange' },
    { label: '基準線', data: ichimoku.baseLine, color: 'red' },
    { label: '雲（上限）', data: ichimoku.leadingSpanA, color: 'rgba(0, 200, 200, 0.5)', background: 'rgba(0, 200, 200, 0.2)', fill: '-1' },
    { label: '雲（下限）', data: ichimoku.leadingSpanB, color: 'rgba(255, 100, 100, 0.5)', background: 'rgba(255, 100, 100, 0.2)' },
    { label: '遅行線', data: ichimoku.laggingSpan, color: 'purple' }
  ];
  ichimokuLabels.forEach(item => {
    datasets.push({
      label: item.label,
      type: 'line',
      data: item.data,
      borderColor: item.color,
      backgroundColor: item.background || undefined,
      fill: item.fill || false,
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.3,
      yAxisID: 'y',
      hidden: !showIchimoku
    });
  });

  // ボリンジャーバンド
  const bbLabels = [
    { label: 'BB Basis', data: bb.basis, color: 'gray' },
    { label: 'BB Upper', data: bb.upper, color: 'blue', dash: [4, 4] },
    { label: 'BB Lower', data: bb.lower, color: 'blue', dash: [4, 4] }
  ];
  bbLabels.forEach(item => {
    datasets.push({
      label: item.label,
      type: 'line',
      data: item.data,
      borderColor: item.color,
      borderWidth: 1,
      borderDash: item.dash || undefined,
      pointRadius: 0,
      tension: 0.2,
      yAxisID: 'y',
      hidden: !showBB
    });
  });

  chart.data.datasets = datasets;
  chart.options.scales.x = {
    type: 'time',
    time: { unit: 'day' },
    min: startDate,
    max: endDate,
    grid: { color: 'rgba(0, 0, 0, 0.05)' }
  };
  chart.update();


  // RSI 更新
  if (!rsiChart) {
    rsiChart = new Chart(document.getElementById('rsiChart'), {
      type: 'line',
      data: {
        datasets: [
          { label: 'RSI(14)', data: rsi, borderColor: 'darkgreen', borderWidth: 2, pointRadius: 0, tension: 0.2 },
          { label: '70ライン', data: rsi.map(d => ({ x: d.x, y: 70 })), borderColor: 'red', borderWidth: 1, borderDash: [4, 4], pointRadius: 0 },
          { label: '30ライン', data: rsi.map(d => ({ x: d.x, y: 30 })), borderColor: 'blue', borderWidth: 1, borderDash: [4, 4], pointRadius: 0 }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          x: { type: 'timeseries', time: { unit: 'day' }, min: startDate, max: endDate, grid: { color: 'rgba(0,0,0,0.05)' } },
          y: { min: 0, max: 100, ticks: { stepSize: 20 }, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
      }
    });
  } else {
    rsiChart.data.datasets[0].data = rsi;
    rsiChart.data.datasets[1].data = rsi.map(d => ({ x: d.x, y: 70 }));
    rsiChart.data.datasets[2].data = rsi.map(d => ({ x: d.x, y: 30 }));
    rsiChart.options.scales.x.min = new Date(startDate);
    rsiChart.options.scales.x.max = new Date(endDate);
    rsiChart.update();
  }

  // MACD 更新
  if (!macdChart) {
    macdChart = new Chart(document.getElementById('macdChart'), {
      type: 'bar',
      data: {
        datasets: [
          { label: 'MACD Histogram', type: 'bar', data: macd.histogram, backgroundColor: 'rgba(0,150,200,0.5)', yAxisID: 'y' },
          { label: 'MACD Line', type: 'line', data: macd.macdLine, borderColor: 'blue', borderWidth: 2, pointRadius: 0, tension: 0.3, yAxisID: 'y' },
          { label: 'Signal Line', type: 'line', data: macd.signalLine, borderColor: 'red', borderWidth: 2, pointRadius: 0, tension: 0.3, yAxisID: 'y' }
        ]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: true } },
        scales: {
          x: { type: 'timeseries', time: { unit: 'day' }, min: startDate, max: endDate, grid: { color: 'rgba(0,0,0,0.05)' } },
          y: { title: { display: true, text: 'MACD' }, grid: { color: 'rgba(0,0,0,0.05)' } }
        }
      }
    });
  } else {
    macdChart.data.datasets[0].data = macd.histogram;
    macdChart.data.datasets[1].data = macd.macdLine;
    macdChart.data.datasets[2].data = macd.signalLine;
    macdChart.options.scales.x.min = new Date(startDate);
    macdChart.options.scales.x.max = new Date(endDate);
    macdChart.update();
  }

  // --- 出来高・空売り残・信用残 チャート描画 ---
const stockFiltered = stockBalanceData.filter(d => d.x >= startDate && d.x <= endDate);
const labelDates = stockFiltered.map(d => d.x.toISOString().slice(0, 10)); // YYYY-MM-DD

const volumes = stockFiltered.map(d => d.volume);
const shorts = stockFiltered.map(d => d.short);
const margins = stockFiltered.map(d => d.margin);

// 出来高
if (!volumeChart) {
  volumeChart = new Chart(document.getElementById('volumeChart'), {
    type: 'bar',
    data: {
      labels: labelDates,
      datasets: [{
        label: '出来高',
        data: volumes,
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: '日付' } },
        y: { title: { display: true, text: '出来高' }, beginAtZero: true }
      }
    }
  });
} else {
  volumeChart.data.labels = labelDates;
  volumeChart.data.datasets[0].data = volumes;
  volumeChart.update();
}

// 空売り残高
if (!shortChart) {
  shortChart = new Chart(document.getElementById('shortSellingChart'), {
    type: 'bar',
    data: {
      labels: labelDates,
      datasets: [{
        label: '空売り残高',
        data: shorts,
        backgroundColor: 'rgba(255, 99, 132, 0.6)'
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: '日付' } },
        y: { title: { display: true, text: '空売り残高' }, beginAtZero: true }
      }
    }
  });
} else {
  shortChart.data.labels = labelDates;
  shortChart.data.datasets[0].data = shorts;
  shortChart.update();
}

// 信用残高
if (!marginChart) {
  marginChart = new Chart(document.getElementById('marginBalanceChart'), {
    type: 'bar',
    data: {
      labels: labelDates,
      datasets: [{
        label: '信用残高',
        data: margins,
        backgroundColor: 'rgba(54, 162, 235, 0.6)'
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: '日付' } },
        y: { title: { display: true, text: '信用残高' }, beginAtZero: true }
      }
    }
  });
  } else {
    marginChart.data.labels = labelDates;
    marginChart.data.datasets[0].data = margins;
    marginChart.update();
  }
}

const searchButton = document.getElementById("chartSearchButton");
const searchBox = document.getElementById("chartSearchBox");

if (searchButton && searchBox) {
  searchButton.addEventListener("click", () => {
    const input = searchBox.value.trim();
    if (input) {
      location.href = `chart.html?symbol=${encodeURIComponent(input)}`;
    } else {
      alert("銘柄名を入力してください。");
    }
  });
}

(async () => {
  await ensureTrendResults();
  checkSymbol();  // ここで symbol が入る

  if (!symbol) {
    alert("チャート銘柄が見つかりませんでした。");
    location.href = "index.html";
    return;
  }

  // symbol が決まったらタイトルも更新
  document.getElementById("chartTitle").textContent = `チャート分析（${symbol}）`;

  const apiUrl   = `json/${encodeURIComponent(symbol)}_mock_data.json`;
  const stockUrl = `json/${encodeURIComponent(symbol)}_stock_data_90days.json`;

  Promise.all([
    fetch(apiUrl).then(res => {
      if (!res.ok) throw new Error(`価格データの取得に失敗しました (${res.status})`);
      return res.json();
    }),
    fetch(stockUrl).then(res => {
      if (!res.ok) throw new Error(`残高データの取得に失敗しました (${res.status})`);
      return res.json();
    })
  ])
  .then(([priceData, balanceData]) => {
    // 空チェック
    if (!priceData.length)  return alert("価格データが空です。");
    if (!balanceData.length) return alert("残高データが空です。");

    // データ整形
    originalData = priceData.map(d => ({
      x: new Date(d.date), o: d.open, h: d.high, l: d.low, c: d.close
    }));
    stockBalanceData = balanceData.map(d => ({
      x: new Date(d.date),
      volume: d.volume,
      short: d.short_selling_balance,
      margin: d.margin_balance
    }));

    // 初期期間で描画
    drawChartsForMonths(1);
  })
  .catch(err => {
    alert("データの読み込み中にエラーが発生しました：" + err.message);
  });
})();





