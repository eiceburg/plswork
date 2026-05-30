# TrumpTrades

A single-page static website that tracks the **stocks Donald Trump has recently bought
and publicly talked about** — Dell, Apple, Palantir, Nvidia, Oracle and more — in one
sleek dashboard. **Prices, today's % change and a mini graph are live** for every stock,
pulled from a public market-data feed in the browser (no API key required).

Built with plain HTML, CSS and a little vanilla JavaScript — no frameworks, no build
step, no dependencies. Dark, gold-accented "presidential" aesthetic.

## ⚠️ Important — please read

- **Not financial advice.** Nothing here is a recommendation to buy, sell, or hold anything.
- **Informational only.** Entries describe *publicly reported* stock purchases and public
  statements (with a source link each). They are **not** claims that Trump told anyone to buy them.
- **Context.** Reporting notes these trades have raised conflict-of-interest questions; the
  Trump Organization says advisers manage the holdings. The site takes no position.
- **Not affiliated.** Independent info project, not affiliated with or endorsed by Donald
  Trump, the Trump Organization, or any associated entity.

## View it locally

Open `index.html` in any browser, or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

> Live data needs internet access. Prices come from Yahoo Finance's public chart endpoint,
> fetched through a free CORS proxy (`api.allorigins.win`) so it works from the browser with
> no key. If the feed can't be reached, the board still renders — just without live numbers.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page content and structure |
| `styles.css` | Dark/gold theme, mini-graph + responsive styles |
| `script.js` | The stock list, live price/graph fetch, filters, active-nav highlight |

## Adding or editing stocks

Everything is driven by the `ASSETS` array at the top of `script.js`:

```js
{
  name: "Dell Technologies",
  symbol: "DELL",                 // ticker — used to fetch the live price + graph
  status: "praised",              // "praised" (he talked it up) or "portfolio" (he bought it)
  tagline: "“Go out and buy a Dell”",
  connection: "Short description of the documented Trump connection.",
  source: "https://www.cnbc.com/...",   // link to the news source
  sourceName: "CNBC",
}
```

Add an entry and it automatically gets a live price, today's % change, an intraday mini
graph in the movers strip, and a row in the board table. The `status` value drives both the
badge and the **Publicly talked up / In his portfolio** filters.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, pick your
   branch and the `/ (root)` folder, then **Save**.
4. The site goes live at `https://<user>.github.io/<repo>/` within a minute or two.
