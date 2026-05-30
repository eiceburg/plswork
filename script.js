// ===== TrumpTrades — vanilla JS, no build step =====
// Tracks stocks Donald Trump has recently bought (per public disclosures) and/or
// publicly talked up. Live price, today's % change and an intraday series for the
// mini graphs come from Yahoo Finance's public chart endpoint, fetched through a
// free CORS proxy so it works straight from the browser with no API key.

// --- The board data -------------------------------------------------------
// status: "praised" = he publicly talked it up | "portfolio" = appears in his buys
const ASSETS = [
  {
    name: "Dell Technologies", symbol: "DELL", status: "praised",
    tagline: "“Go out and buy a Dell”",
    connection: "Disclosed buying $1M–$5M on Feb 10, 2026, then repeatedly urged people to “go out and buy a Dell.” Shares jumped ~40% after a $9.7B Pentagon software contract.",
    source: "https://www.cnbc.com/2026/05/27/dell-dod-pentagon-software-deal-digital-infrastructure-trump.html",
    sourceName: "CNBC",
  },
  {
    name: "Apple", symbol: "AAPL", status: "praised",
    tagline: "Praised the “$650 billion” pledge",
    connection: "Accumulated as much as ~$7.2M of Apple in March 2026 and publicly praised it — “Apple spending $650 billion on new plants all over the United States.”",
    source: "https://www.washingtonexaminer.com/news/white-house/4583562/trump-praised-companies-within-days-of-buying-their-stock/",
    sourceName: "Washington Examiner",
  },
  {
    name: "Palantir", symbol: "PLTR", status: "praised",
    tagline: "Touted on Truth Social",
    connection: "Bought shares weeks before publicly touting the AI-software maker on Truth Social, disclosures show.",
    source: "https://www.cnbc.com/2026/05/15/trump-palantir-stock-truth-social.html",
    sourceName: "CNBC",
  },
  {
    name: "NVIDIA", symbol: "NVDA", status: "portfolio",
    tagline: "Added in Q1 2026",
    connection: "Bought $1M–$5M of the AI-chip leader in February 2026 as he revamped his portfolio toward AI names.",
    source: "https://www.investing.com/news/stock-market-news/trump-revamps-stock-portfolio-adding-nvidia-and-other-ai-names-4689461",
    sourceName: "Investing.com",
  },
  {
    name: "Oracle", symbol: "ORCL", status: "portfolio",
    tagline: "Q1 2026 buy",
    connection: "Among the tech names Trump bought in Q1 2026; Oracle is central to the Trump-backed “Stargate” AI infrastructure push.",
    source: "https://www.cnbc.com/2026/05/15/trump-stock-trade-tech-oge.html",
    sourceName: "CNBC",
  },
  {
    name: "Advanced Micro Devices", symbol: "AMD", status: "portfolio",
    tagline: "Reportedly 100%+ in profit",
    connection: "Held in Trump's disclosed portfolio; reporting on the filings notes he's more than 100% in profit on AMD.",
    source: "https://www.cnbc.com/2026/05/15/trump-stock-trade-tech-oge.html",
    sourceName: "CNBC",
  },
  {
    name: "Intel", symbol: "INTC", status: "portfolio",
    tagline: "Reportedly 100%+ in profit",
    connection: "Appears among Trump's disclosed holdings; reporting notes he's more than 100% in profit on Intel.",
    source: "https://www.cnbc.com/2026/05/15/trump-stock-trade-tech-oge.html",
    sourceName: "CNBC",
  },
  {
    name: "Trump Media & Technology", symbol: "DJT", status: "praised",
    tagline: "His own company",
    connection: "Parent of Truth Social. Trump holds a large personal stake — the ticker is literally his initials.",
    source: "https://www.google.com/finance/quote/DJT:NASDAQ",
    sourceName: "Google Finance",
  },
];

const STATUS_LABEL = { praised: "Talked it up", portfolio: "In portfolio" };

// --- Formatting helpers ---------------------------------------------------
function fmtPrice(v) {
  if (v == null || isNaN(v)) return "—";
  return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtChange(v) {
  if (v == null || isNaN(v)) return { text: "—", cls: "" };
  const sign = v > 0 ? "+" : "";
  return { text: sign + v.toFixed(2) + "%", cls: v >= 0 ? "up" : "down" };
}

// Build a tiny SVG sparkline from an array of numbers.
function sparkline(series, up, w = 200, h = 48) {
  if (!series || series.length < 2) {
    return `<svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"></svg>`;
  }
  const min = Math.min(...series), max = Math.max(...series);
  const range = max - min || 1;
  const stepX = w / (series.length - 1);
  const pts = series.map((v, i) => {
    const x = i * stepX;
    const y = h - 4 - ((v - min) / range) * (h - 8); // 4px padding top/bottom
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const stroke = up ? "var(--green)" : "var(--red)";
  const fill = up ? "rgba(63,185,107,.16)" : "rgba(229,72,77,.16)";
  const area = `0,${h} ${pts.join(" ")} ${w},${h}`;
  return `
    <svg class="spark" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true">
      <polygon points="${area}" fill="${fill}" stroke="none" />
      <polyline points="${pts.join(" ")}" fill="none" stroke="${stroke}" stroke-width="2"
        stroke-linejoin="round" stroke-linecap="round" />
    </svg>`;
}

// --- Rendering ------------------------------------------------------------
function renderMovers(quotes) {
  const grid = document.getElementById("mover-grid");
  grid.innerHTML = ASSETS.map(a => {
    const q = quotes[a.symbol] || {};
    const ch = fmtChange(q.changePct);
    const up = (q.changePct ?? 0) >= 0;
    return `
      <article class="mover-card">
        <div class="mc-top">
          <span class="mc-name">${a.name}</span>
          <span class="mc-sym">${a.symbol}</span>
        </div>
        <span class="mc-price">${fmtPrice(q.price)}</span>
        <span class="mc-change ${ch.cls}">${ch.text} <small class="muted">today</small></span>
        <div class="mc-graph">${sparkline(q.series, up)}</div>
        <span class="mc-tag">${a.tagline}</span>
      </article>`;
  }).join("");
}

function renderBoard(quotes) {
  const body = document.getElementById("board-body");
  body.innerHTML = ASSETS.map(a => {
    const q = quotes[a.symbol] || {};
    const ch = fmtChange(q.changePct);
    return `
      <tr data-status="${a.status}">
        <td>
          <div class="asset-cell">
            <span class="asset-name">${a.name}</span>
            <span class="asset-sym">${a.symbol} · <span class="status-badge status-${a.status}">${STATUS_LABEL[a.status]}</span></span>
          </div>
        </td>
        <td class="connection"><span class="tagline">${a.tagline}</span>${a.connection}</td>
        <td class="num price-cell">${fmtPrice(q.price)}</td>
        <td class="num change-cell ${ch.cls}">${ch.text}</td>
        <td><a class="row-link" href="${a.source}" target="_blank" rel="noopener">${a.sourceName} ↗</a></td>
      </tr>`;
  }).join("");
}

// --- Filters --------------------------------------------------------------
function setupFilters() {
  const chips = document.querySelectorAll("#filters .chip");
  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("is-active"));
      chip.classList.add("is-active");
      const f = chip.dataset.filter;
      document.querySelectorAll("#board-body tr").forEach(tr => {
        tr.style.display = (f === "all" || tr.dataset.status === f) ? "" : "none";
      });
    });
  });
}

// --- Live data ------------------------------------------------------------
function setStatus(state, msg) {
  const el = document.getElementById("hero-status");
  el.className = "hero-status" + (state ? " " + state : "");
  el.innerHTML = `<span class="dot"></span> ${msg}`;
}

// Fetch one symbol's quote + intraday series from Yahoo via a CORS proxy.
async function fetchQuote(symbol) {
  const yahoo = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=15m`;
  const url = "https://api.allorigins.win/raw?url=" + encodeURIComponent(yahoo);
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  const r = data?.chart?.result?.[0];
  if (!r) throw new Error("no result");
  const meta = r.meta || {};
  const price = meta.regularMarketPrice;
  const prev = meta.chartPreviousClose ?? meta.previousClose;
  const closes = (r.indicators?.quote?.[0]?.close || []).filter(v => v != null);
  const changePct = (price != null && prev) ? ((price - prev) / prev) * 100 : null;
  return { symbol, price, changePct, series: closes };
}

async function loadPrices() {
  const results = await Promise.allSettled(ASSETS.map(a => fetchQuote(a.symbol)));
  const quotes = {};
  let ok = 0;
  results.forEach((r, i) => {
    if (r.status === "fulfilled") { quotes[ASSETS[i].symbol] = r.value; ok++; }
  });

  renderMovers(quotes);
  renderBoard(quotes);

  const now = new Date();
  if (ok > 0) {
    document.getElementById("last-updated").textContent = now.toLocaleString();
    setStatus("ok", `Live prices loaded (${ok}/${ASSETS.length}) · ${now.toLocaleTimeString()}`);
  } else {
    document.getElementById("last-updated").textContent = "unavailable";
    setStatus("err", "Couldn't reach the price feed — showing the board without live numbers.");
  }
}

// --- Active nav highlight -------------------------------------------------
function setupNavHighlight() {
  const links = [...document.querySelectorAll(".nav a")];
  const map = links.map(a => ({ a, el: document.querySelector(a.getAttribute("href")) })).filter(x => x.el);
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = "#" + e.target.id;
        links.forEach(l => l.classList.toggle("active", l.getAttribute("href") === id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  map.forEach(x => obs.observe(x.el));
}

// --- Boot -----------------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  setupFilters();
  setupNavHighlight();
  loadPrices();
  setInterval(loadPrices, 60000); // refresh every 60s
});
