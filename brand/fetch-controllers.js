/*
 * Downloads the 9 controller product photos used on bestcontrollers.netlify.app
 * into brand/controllers/ with the exact filenames build-videos.js expects.
 *
 * Run this on a normal (non-restricted) network, then rebuild the videos:
 *   node brand/fetch-controllers.js
 *   node brand/build-videos.js
 *
 * (Claude Code's web sandbox blocks outbound image hosts, so this can't run in
 * that environment — run it locally, or just drop the 9 jpgs in by hand using
 * the names in CONTROLLERS below.)
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const OUT = path.join(__dirname, 'controllers');
fs.mkdirSync(OUT, { recursive: true });

// name -> Amazon image id (same images the website uses)
const CONTROLLERS = {
  'xbox-core': '61RiSsDfveL',
  'xbox-elite3': '717XTm0moDL',
  'dualsense-edge': '614v99L42vL',
  'dualsense': '61GNEp3auhL',
  'victrix': '51ty7-7+CQL',
  'razer-wolverine': '71YOWPfmyfL',
  '8bitdo': '51Nc3du0DnL',
  'flydigi-vader5': '61ZGMiQSN9L',
  'gamesir-t4': '712aKuyZH6L',
};

function get(url, dest) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/*,*/*;q=0.8',
        'Referer': 'https://www.amazon.com/',
      },
    }, (res) => {
      if (res.statusCode !== 200) { res.resume(); return reject(new Error(`HTTP ${res.statusCode}`)); }
      const f = fs.createWriteStream(dest);
      res.pipe(f);
      f.on('finish', () => f.close(() => resolve()));
    });
    req.on('error', reject);
    req.setTimeout(25000, () => req.destroy(new Error('timeout')));
  });
}

(async () => {
  let ok = 0;
  for (const [name, id] of Object.entries(CONTROLLERS)) {
    const url = `https://m.media-amazon.com/images/I/${encodeURIComponent(id)}._AC_SL500_.jpg`;
    const dest = path.join(OUT, `${name}.jpg`);
    try { await get(url, dest); ok++; console.log(`ok   ${name}.jpg`); }
    catch (e) { console.log(`FAIL ${name}.jpg  (${e.message})  ${url}`); }
  }
  console.log(`\n${ok}/${Object.keys(CONTROLLERS).length} downloaded. Now run: node brand/build-videos.js`);
})();
