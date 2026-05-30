# TrumpTrades

A single-page static website that tracks the **stocks and cryptocurrencies publicly
tied to Donald Trump** — assets he's *launched*, *owns*, or has *publicly promoted* —
in one sleek dashboard. **Crypto prices are live**, pulled straight from the free,
key-less [CoinGecko](https://www.coingecko.com) API in the browser.

Built with plain HTML, CSS and a little vanilla JavaScript — no frameworks, no build
step, no dependencies. Dark, gold-accented "presidential" aesthetic.

## ⚠️ Important — please read

- **Not financial advice.** Nothing here is a recommendation to buy, sell, or hold anything.
- **Informational only.** Entries describe *publicly reported* connections between assets and
  Donald Trump / the Trump family. They are **not** claims that he told anyone to buy them.
- **High risk.** Politically themed tokens and memecoins are extremely volatile and can go to zero.
- **Not affiliated.** This is an independent info project, not affiliated with or endorsed by
  Donald Trump, the Trump Organization, Trump Media, or any associated entity.

## View it locally

Open `index.html` in any browser, or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

> Live crypto prices need internet access (the page calls CoinGecko from your browser).
> If the feed can't be reached, the board still renders — just without live numbers.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | Page content and structure |
| `styles.css` | Dark/gold theme, responsive layout |
| `script.js` | The asset list, live CoinGecko fetch, filters, active-nav highlight |

## Adding or editing assets

Everything is driven by the `ASSETS` array at the top of `script.js`:

```js
{
  name: "Official Trump",
  symbol: "TRUMP",
  type: "crypto",                 // "crypto" or "stock"
  cgId: "official-trump",         // CoinGecko coin id (crypto only; null for stocks)
  tagline: "His own memecoin",
  connection: "Short description of the documented Trump connection.",
  link: "https://www.coingecko.com/en/coins/official-trump",
}
```

- **Crypto:** set `cgId` to the asset's CoinGecko id (find it in the coin's URL). Price and
  24h change then load automatically.
- **Stocks:** set `cgId: null` and point `link` at a live quote (e.g. Google Finance). Stocks
  don't show a live number because there's no free, key-less quote feed that works in the browser.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, pick your
   branch and the `/ (root)` folder, then **Save**.
4. The site goes live at `https://<user>.github.io/<repo>/` within a minute or two.
