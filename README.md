# Controller Tier 2026

A single-page static website rounding up **the best gaming controllers of 2026**,
sorted into categories (Best Overall, Best for PC, Best for PlayStation, Best Pro,
Best Multi-Platform, Best Value, Best Budget). Each pick includes specs, pros/cons
and a short verdict, plus a quick comparison table, a buying guide and an FAQ.

Built with plain HTML, CSS and a little vanilla JavaScript — no frameworks, no build
step, no dependencies. Modern dark "gamer" aesthetic with neon accents.

## View it locally

Just open `index.html` in any browser, or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Files

| File | Purpose |
| --- | --- |
| `index.html` | All page content and structure |
| `styles.css` | Dark/neon theme, responsive layout |
| `script.js` | Platform filter, click-to-jump table rows, active-nav highlight |

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In the repo, go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to *Deploy from a branch*, pick
   your branch and the `/ (root)` folder, then **Save**.
4. Your site goes live at `https://<user>.github.io/<repo>/` within a minute or two.

## Note

This is an informational roundup. Prices are approximate and as of 2026, and picks
are based on aggregated 2026 reviews and hands-on coverage.

The "Buy on Amazon" buttons are **Amazon Associates affiliate links** (search links
carrying the store tag `roller022-20`). As an Amazon Associate the site earns from
qualifying purchases, at no extra cost to the buyer. To change the tag, find-and-replace
`roller022-20` in `index.html`.
