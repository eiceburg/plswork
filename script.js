// ===== TrumpTrades — vanilla JS, no build step =====
// Live crypto prices come straight from the public CoinGecko API (CORS-enabled,
// no API key). Stocks have no free key-less browser feed, so they link out to a
// live quote instead of showing a number that could silently go stale.

// --- The board data -------------------------------------------------------
// `cgId` = CoinGecko coin id (crypto only). `link` = where to see a live quote.
const ASSETS = [
  {
    name: "Official Trump",
    symbol: "TRUMP",
    type: "crypto",
    cgId: "official-trump",
    tagline: "His own memecoin",
    connection: "A Solana memecoin Trump personally launched and promoted on his own social accounts in Jan 2025.",
    link: "https://www.coingecko.com/en/coins/official-trump",
  },
  {
    name: "Melania Meme",
    symbol: "MELANIA",
    type: "crypto",
    cgId: "melania-meme",
    tagline: "The First Lady coin",
    connection: "Launched in Jan 2025 and tied to the Trump family / Melania Trump branding.",
    link: "https://www.coingecko.com/en/coins/melania-meme",
  },
  {
    name: "World Liberty Financial",
    symbol: "WLFI",
    type: "crypto",
    cgId: "world-liberty-financial",
    tagline: "Trump-family DeFi venture",
    connection: "A crypto / DeFi project publicly backed by and branded around the Trump family.",
    link: "https://www.coingecko.com/en/coins/world-liberty-financial",
  },
  {
    name: "USD1",
    symbol: "USD1",
    type: "crypto",
    cgId: "usd1-world-liberty-financial",
    tagline: "WLFI's stablecoin",
    connection: "The U.S.-dollar stablecoin issued by World Liberty Financial, the Trump-family venture.",
    link: "https://www.coingecko.com/en/coins/usd1-world-liberty-financial",
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    type: "crypto",
    cgId: "bitcoin",
    tagline: "Publicly endorsed",
    connection: "Trump has publicly championed Bitcoin and signed a 2025 executive order on a U.S. strategic Bitcoin reserve.",
    link: "https://www.coingecko.com/en/coins/bitcoin",
  },
  {
    name: "Ethereum",
    symbol: "ETH",
    type: "crypto",
    cgId: "ethereum",
    tagline: "Held by WLFI",
    connection: "World Liberty Financial, the Trump-family venture, has publicly accumulated ETH.",
    link: "https://www.coingecko.com/en/coins/ethereum",
  },
  {
    name: "Trump Media & Technology",
    symbol: "DJT",
    type: "stock",
    cgId: null,
    tagline: "He owns a big stake",
    connection: "Parent of Truth Social. Trump holds a large personal stake; the ticker is literally his initials.",
    link: "https://www.google.com/finance/quote/DJT:NASDAQ",
  },
];

// CoinGecko ids we need to fetch
const CG_IDS = [...new Set(ASSETS.filter(a => a.cgId).map(a => a.cgId))];

// --- Formatting helpers ---------------------------------------------------
function fmtPrice(v) {
  if (v == null || isNaN(v)) return "—";
  if (v >= 1000) return "$" + v.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (v >= 1)    return "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (v >= 0.01) return "$" + v.toFixed(4);
  return "$" + v.toPrecision(3);
}
function fmtChange(v) {
  if (v == null || isNaN(v)) return { text: "—", cls: "" };
  const sign = v > 0 ? "+" : "";
  return { text: sign + v.toFixed(2) + "%", cls: v >= 0 ? "up" : "down" };
}

// --- Rendering ------------------------------------------------------------
function renderMovers(prices) {
  const grid = document.getElementById("mover-grid");
  const cryptos = ASSETS.filter(a => a.type === "crypto");
  grid.innerHTML = cryptos.map(a => {
    const p = prices[a.cgId] || {};
    const price = fmtPrice(p.usd);
    const ch = fmtChange(p.usd_24h_change);
    return `
      <article class="mover-card">
        <div class="mc-top">
          <span class="mc-name">${a.name}</span>
          <span class="mc-sym">${a.symbol}</span>
        </div>
        <span class="mc-price">${price}</span>
        <span class="mc-change ${ch.cls}">${ch.text} <small class="muted">24h</small></span>
        <span class="mc-tag">${a.tagline}</span>
      </article>`;
  }).join("");
}

function renderBoard(prices) {
  const body = document.getElementById("board-body");
  body.innerHTML = ASSETS.map(a => {
    let priceHtml = '<span class="muted">see quote →</span>';
    let changeHtml = '<span class="muted">—</span>';
    if (a.type === "crypto") {
      const p = prices[a.cgId] || {};
      const ch = fmtChange(p.usd_24h_change);
      priceHtml = `<span>${fmtPrice(p.usd)}</span>`;
      changeHtml = `<span class="${ch.cls}">${ch.text}</span>`;
    }
    const typeClass = a.type === "crypto" ? "type-crypto" : "type-stock";
    return `
      <tr data-type="${a.type}">
        <td>
          <div class="asset-cell">
            <span class="asset-name">${a.name}</span>
            <span class="asset-sym">${a.symbol}</span>
          </div>
        </td>
        <td><span class="type-badge ${typeClass}">${a.type}</span></td>
        <td class="connection"><span class="tagline">${a.tagline}</span>${a.connection}</td>
        <td class="num price-cell">${priceHtml}</td>
        <td class="num change-cell">${changeHtml}</td>
        <td><a class="row-link" href="${a.link}" target="_blank" rel="noopener">Live ↗</a></td>
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
        tr.style.display = (f === "all" || tr.dataset.type === f) ? "" : "none";
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

async function loadPrices() {
  const url = "https://api.coingecko.com/api/v3/simple/price?ids=" +
    encodeURIComponent(CG_IDS.join(",")) +
    "&vs_currencies=usd&include_24hr_change=true";
  try {
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    renderMovers(data);
    renderBoard(data);
    const now = new Date();
    document.getElementById("last-updated").textContent = now.toLocaleString();
    setStatus("ok", "Live prices loaded · " + now.toLocaleTimeString());
  } catch (err) {
    // Graceful fallback: still render the board (without live numbers)
    renderMovers({});
    renderBoard({});
    document.getElementById("last-updated").textContent = "unavailable";
    setStatus("err", "Couldn't reach the price feed — showing the board without live numbers.");
    console.error("Price fetch failed:", err);
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
  // refresh every 60s
  setInterval(loadPrices, 60000);
});
