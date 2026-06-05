/*
 * DEADZONE Shorts generator.
 * Builds 10 vertical (1080x1920) branded motion-graphic MP4s from SVG slides,
 * crossfaded with ffmpeg. Silent by design (add trending audio in-app).
 * Run: node brand/build-videos.js
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const sharp = require('sharp');
const ffmpeg = require('ffmpeg-static');

const W = 1080, H = 1920, FPS = 30, XF = 0.45; // crossfade seconds
const OUT = path.join(__dirname, 'video');
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'dz-'));
const SITE = 'bestcontrollers.netlify.app';
const PHOTO_DIR = path.join(__dirname, 'controllers');
fs.mkdirSync(OUT, { recursive: true });

// returns a usable controller image path, or null (so slides fall back cleanly)
function photoPath(name) {
  if (!name) return null;
  for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
    const p = path.join(PHOTO_DIR, `${name}.${ext}`);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

const C = {
  bg0: '#0B0E14', bg1: '#121620', surface: '#161B27',
  magenta: '#FF2E63', cyan: '#16E0C0', white: '#F5F7FA',
  muted: '#8A93A6', amber: '#FFB020', good: '#39E991', bad: '#FF4D5E',
};
const FONT = 'DejaVu Sans, sans-serif';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---- shared defs ---------------------------------------------------------
const DEFS = `
<defs>
  <linearGradient id="neon" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${C.magenta}"/><stop offset="1" stop-color="${C.cyan}"/>
  </linearGradient>
  <radialGradient id="bgrad" cx="0.5" cy="0.36" r="0.9">
    <stop offset="0" stop-color="#1A2030"/><stop offset="0.55" stop-color="${C.bg0}"/><stop offset="1" stop-color="#05070B"/>
  </radialGradient>
  <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
    <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="${C.magenta}" flood-opacity="0.5"/>
    <feDropShadow dx="0" dy="0" stdDeviation="18" flood-color="${C.cyan}" flood-opacity="0.28"/>
  </filter>
  <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="70"/></filter>
</defs>`;

// controller emblem centered on (0,0); extents ~ x[-185,185] y[-110,90]
function emblem(scale = 1, glow = true, alpha = 1) {
  return `<g transform="scale(${scale})" opacity="${alpha}"${glow ? ' filter="url(#soft)"' : ''}>
    <rect x="-150" y="-108" width="78" height="30" rx="15" fill="${C.bg1}" stroke="${C.muted}" stroke-opacity=".35" stroke-width="3"/>
    <rect x="72" y="-108" width="78" height="30" rx="15" fill="${C.bg1}" stroke="${C.muted}" stroke-opacity=".35" stroke-width="3"/>
    <rect x="-185" y="-88" width="370" height="176" rx="84" fill="${C.surface}" stroke="${glow ? 'url(#neon)' : C.muted}" stroke-width="11"/>
    <rect x="-106" y="-31" width="22" height="62" rx="7" fill="${C.cyan}"/>
    <rect x="-126" y="-11" width="62" height="22" rx="7" fill="${C.cyan}"/>
    <circle cx="95" cy="-34" r="14" fill="${C.magenta}"/><circle cx="125" cy="0" r="14" fill="${C.cyan}"/>
    <circle cx="95" cy="34" r="14" fill="${C.white}"/><circle cx="65" cy="0" r="14" fill="${C.amber}"/>
    <circle cx="-52" cy="58" r="44" fill="none" stroke="${C.magenta}" stroke-width="4" stroke-opacity=".55" stroke-dasharray="6 9"/>
    <circle cx="-52" cy="58" r="30" fill="${C.bg0}" stroke="${C.magenta}" stroke-width="5"/><circle cx="-52" cy="58" r="13" fill="${C.magenta}"/>
    <circle cx="52" cy="58" r="30" fill="${C.bg0}" stroke="${C.cyan}" stroke-width="5"/><circle cx="52" cy="58" r="13" fill="${C.cyan}"/>
  </g>`;
}

function bgLayer() {
  const grid = [];
  for (let x = 0; x <= W; x += 90) grid.push(`<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`);
  for (let y = 0; y <= H; y += 90) grid.push(`<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`);
  return `<rect width="${W}" height="${H}" fill="url(#bgrad)"/>
    <circle cx="160" cy="320" r="240" fill="${C.magenta}" opacity=".16" filter="url(#blur)"/>
    <circle cx="940" cy="1500" r="280" fill="${C.cyan}" opacity=".14" filter="url(#blur)"/>
    <g stroke="${C.muted}" stroke-opacity=".05" stroke-width="2">${grid.join('')}</g>
    <g transform="translate(540,1640)">${emblem(1.7, false, 0.06)}</g>`;
}

// brand chip, top-center
function chip() {
  return `<g transform="translate(540,210)">
    <g transform="translate(-220,0) scale(0.32)">${emblem(1, true)}</g>
    <text x="-150" y="22" font-family="${FONT}" font-weight="bold" font-size="60" letter-spacing="3" fill="${C.white}">DEADZONE</text>
  </g>`;
}

// text block: lines = [ [ {t,color,weight} ... ] | "string" ]
function block(lines, { x = 540, y, size, gap, anchor = 'middle', weight = 'bold', spacing = 0 }) {
  const tspans = lines.map((line, i) => {
    const segs = (typeof line === 'string') ? [{ t: line }] : line;
    const inner = segs.map((s) => `<tspan fill="${s.color || C.white}"${s.weight ? ` font-weight="${s.weight}"` : ''}>${esc(s.t)}</tspan>`).join('');
    return `<tspan x="${x}" dy="${i === 0 ? 0 : gap}">${inner}</tspan>`;
  }).join('');
  return `<text xml:space="preserve" x="${x}" y="${y}" text-anchor="${anchor}" font-family="${FONT}" font-weight="${weight}" font-size="${size}" letter-spacing="${spacing}">${tspans}</text>`;
}

function wrap(svgInner) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${DEFS}${bgLayer()}${svgInner}</svg>`;
}

// ---------- slide types ----------
function kickerPill(text, atY, color = C.magenta) {
  return `<g transform="translate(540,${atY})"><rect x="-${text.length * 11 + 44}" y="-52" width="${text.length * 22 + 88}" height="80" rx="40" fill="${C.bg1}" stroke="url(#neon)" stroke-width="3"/>${block([[{ t: text, color }]], { x: 0, y: 8, size: 44, gap: 0, spacing: 3 })}</g>`;
}

function titleSlide({ kicker, lines, sub, kickerColor = C.magenta }) {
  const n = lines.length;
  const size = n >= 3 ? 118 : 132;
  const gap = size + 18;
  const startY = 960 - ((n - 1) * gap) / 2;
  let s = chip();
  if (kicker) s += kickerPill(kicker, 540, kickerColor);
  s += block(lines, { y: startY, size, gap });
  if (sub) s += block([[{ t: sub, color: C.muted }]], { y: 1500, size: 50, gap: 0, weight: 'normal', spacing: 1 });
  return wrap(s);
}

function vsSlide({ q, left, right }) {
  const card = (cx, color, top, bot, tag) => `
    <g transform="translate(${cx},0)">
      <rect x="-300" y="780" width="600" height="500" rx="40" fill="${C.surface}" stroke="${color}" stroke-width="5"/>
      <text x="0" y="940" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="150" fill="${color}">${esc(top)}</text>
      <text x="0" y="1070" text-anchor="middle" font-family="${FONT}" font-size="48" fill="${C.white}">${esc(bot)}</text>
      <rect x="-150" y="1150" width="300" height="74" rx="37" fill="${color}" opacity=".16"/>
      <text x="0" y="1200" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="40" fill="${color}">${esc(tag)}</text>
    </g>`;
  return wrap(chip()
    + block(q.map((l) => (typeof l === 'string' ? [{ t: l }] : l)), { y: 620, size: 104, gap: 122 })
    + card(280, C.cyan, left.top, left.bot, left.tag)
    + card(800, C.magenta, right.top, right.bot, right.tag)
    + `<circle cx="540" cy="1030" r="74" fill="${C.bg0}" stroke="url(#neon)" stroke-width="5"/>
       <text x="540" y="1056" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="56" fill="${C.white}">VS</text>`
    + block([[{ t: 'which is which?  ↓', color: C.muted }]], { y: 1480, size: 52, gap: 0 }));
}

function pointSlide({ n, total, title, desc, color = C.cyan }) {
  return wrap(chip()
    + `<g transform="translate(540,640)"><circle cx="0" cy="0" r="120" fill="${C.bg1}" stroke="${color}" stroke-width="6"/>
       <text x="0" y="46" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="150" fill="${color}">${n}</text></g>`
    + (total ? block([[{ t: `STEP ${n} / ${total}`, color: C.muted }]], { y: 850, size: 44, gap: 0, spacing: 4 }) : '')
    + block(title.map((l) => (typeof l === 'string' ? [{ t: l }] : l)), { y: 1010, size: 110, gap: 124 })
    + block([[{ t: desc, color: C.muted }]], { y: 1360, size: 56, gap: 0, weight: 'normal' }));
}

function factSlide({ top, big, bigColor = C.cyan, sub }) {
  const gap = 168, n = big.length, half = ((n - 1) * gap) / 2;
  const bigStartY = 980 - half;
  return wrap(chip()
    + block([[{ t: top, color: C.white }]], { y: bigStartY - 150, size: 70, gap: 0 })
    + block(big.map((l) => (typeof l === 'string' ? [{ t: l, color: bigColor }] : l)), { y: bigStartY, size: 150, gap })
    + block([[{ t: sub, color: C.muted }]], { y: 980 + half + 130, size: 56, gap: 0, weight: 'normal' }));
}

function tierSlide({ rows, foot = 'agree?  ↓' }) {
  const colors = { S: C.magenta, A: C.amber, B: C.cyan, C: C.muted, F: C.bad };
  let y = 600;
  let s = chip() + block([[{ t: 'CONTROLLER ', color: C.white }, { t: 'TIER LIST', color: C.magenta }]], { y: 470, size: 84, gap: 0 });
  for (const r of rows) {
    const col = colors[r.tier] || C.muted;
    s += `<g transform="translate(0,${y})">
      <rect x="90" y="0" width="150" height="150" rx="20" fill="${col}"/>
      <text x="165" y="108" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="110" fill="${C.bg0}">${r.tier}</text>
      <rect x="260" y="0" width="730" height="150" rx="20" fill="${C.surface}" stroke="${col}" stroke-opacity=".5" stroke-width="3"/>
      <text x="290" y="95" font-family="${FONT}" font-weight="bold" font-size="46" fill="${C.white}">${esc(r.items)}</text>
    </g>`;
    y += 172;
  }
  s += block([[{ t: foot, color: C.muted }]], { y: 1560, size: 56, gap: 0 });
  return wrap(s);
}

function endSlide() {
  return wrap(`<g transform="translate(540,640)">${emblem(1.5, true)}</g>
    <text x="540" y="930" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="128" letter-spacing="6" fill="${C.white}">DEADZONE</text>
    <rect x="486" y="978" width="108" height="9" rx="4" fill="url(#neon)"/>
    <text x="540" y="1108" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="54" fill="${C.cyan}">FULL 2026 CONTROLLER GUIDE</text>
    <g transform="translate(540,1230)">
      <rect x="-420" y="-58" width="840" height="116" rx="58" fill="${C.bg1}" stroke="url(#neon)" stroke-width="4"/>
      <text x="0" y="18" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="50" fill="${C.white}">LINK IN DESCRIPTION  &#8595;</text>
    </g>
    <text x="540" y="1380" text-anchor="middle" font-family="${FONT}" font-size="44" fill="${C.muted}">${esc(SITE)}</text>
    <text x="540" y="1520" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="48" fill="${C.magenta}">FOLLOW FOR MORE</text>`);
}

// ---------- photo slides (use real controller pics; fall back cleanly) ----------
// Each returns { svg, photos:[{file,x,y,w,h}] } so the renderer can composite
// the product images onto the white cards after rasterizing the SVG.

function showcaseSlide({ kicker, title, sub, product, kickerColor = C.magenta }) {
  const file = photoPath(product.name);
  if (!file) return { svg: titleSlide({ kicker, lines: title, sub, kickerColor }), photos: [] };
  const accent = product.accent || C.cyan;
  const cw = 540, ch = 470, cyTop = 510, pad = 44, cx = 540;
  const cardBot = cyTop + ch, tgap = 104;
  const titleY = cardBot + 168;
  const subY = titleY + (title.length - 1) * tgap + 92;
  let s = chip();
  if (kicker) s += kickerPill(kicker, 460, kickerColor);
  s += `<rect x="${cx - cw / 2}" y="${cyTop}" width="${cw}" height="${ch}" rx="38" fill="#F3F5FA" stroke="${accent}" stroke-width="6"/>`;
  s += `<text x="540" y="${cardBot + 66}" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="52" fill="${accent}">${esc(product.label)}</text>`;
  s += block(title.map((l) => (typeof l === 'string' ? [{ t: l }] : l)), { y: titleY, size: 86, gap: tgap });
  if (sub) s += block([[{ t: sub, color: C.muted }]], { y: subY, size: 48, gap: 0, weight: 'normal' });
  return { svg: wrap(s), photos: [{ file, x: cx - cw / 2 + pad, y: cyTop + pad, w: cw - pad * 2, h: ch - pad * 2 }] };
}

function vsPhotoSlide({ q, left, right }) {
  const lf = photoPath(left.name), rf = photoPath(right.name);
  if (!lf || !rf) return { svg: vsSlide({ q, left, right }), photos: [] };
  const photos = [];
  const card = (cx, color, top, bot, tag, file) => {
    const cw = 460, ch = 460, cyTop = 700, pad = 36;
    photos.push({ file, x: cx - cw / 2 + pad, y: cyTop + pad, w: cw - pad * 2, h: ch - pad * 2 });
    return `<rect x="${cx - cw / 2}" y="${cyTop}" width="${cw}" height="${ch}" rx="36" fill="#F3F5FA" stroke="${color}" stroke-width="6"/>
      <text x="${cx}" y="${cyTop + ch + 84}" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="84" fill="${color}">${esc(top)}</text>
      <text x="${cx}" y="${cyTop + ch + 140}" text-anchor="middle" font-family="${FONT}" font-size="40" fill="${C.white}">${esc(bot)}</text>
      <g transform="translate(${cx},${cyTop + ch + 202})"><rect x="-135" y="-40" width="270" height="66" rx="33" fill="${color}" opacity=".16"/><text x="0" y="8" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="36" fill="${color}">${esc(tag)}</text></g>`;
  };
  const svg = wrap(chip()
    + block(q.map((l) => (typeof l === 'string' ? [{ t: l }] : l)), { y: 600, size: 92, gap: 104 })
    + card(285, C.cyan, left.top, left.bot, left.tag, lf)
    + card(795, C.magenta, right.top, right.bot, right.tag, rf)
    + `<circle cx="540" cy="930" r="60" fill="${C.bg0}" stroke="url(#neon)" stroke-width="5"/>
       <text x="540" y="950" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="48" fill="${C.white}">VS</text>`
    + block([[{ t: 'which one?  ↓', color: C.muted }]], { y: 1560, size: 50, gap: 0 }));
  return { svg, photos };
}

function tierPhotoSlide({ rows, foot = 'agree?  ↓' }) {
  const colors = { S: C.magenta, A: C.amber, B: C.cyan, C: C.muted, F: C.bad };
  const photos = [];
  let y = 600;
  let s = chip() + block([[{ t: 'CONTROLLER ', color: C.white }, { t: 'TIER LIST', color: C.magenta }]], { y: 470, size: 84, gap: 0 });
  for (const r of rows) {
    const col = colors[r.tier] || C.muted;
    const file = photoPath(r.name);
    s += `<g transform="translate(0,${y})">
      <rect x="90" y="0" width="150" height="150" rx="20" fill="${col}"/>
      <text x="165" y="108" text-anchor="middle" font-family="${FONT}" font-weight="bold" font-size="110" fill="${C.bg0}">${r.tier}</text>
      <rect x="260" y="0" width="730" height="150" rx="20" fill="${C.surface}" stroke="${col}" stroke-opacity=".5" stroke-width="3"/>`;
    let textX = 290;
    if (file) { s += `<rect x="280" y="16" width="118" height="118" rx="14" fill="#F3F5FA"/>`; photos.push({ file, x: 286, y: y + 22, w: 106, h: 106 }); textX = 430; }
    s += `<text x="${textX}" y="95" font-family="${FONT}" font-weight="bold" font-size="${file ? 40 : 46}" fill="${C.white}">${esc(r.items)}</text></g>`;
    y += 172;
  }
  s += block([[{ t: foot, color: C.muted }]], { y: 1560, size: 56, gap: 0 });
  return { svg: wrap(s), photos };
}

// ---------- the 10 shorts ----------
const VIDEOS = [
  { file: '01-20-vs-200', slides: [
    { svg: titleSlide({ kicker: 'BLIND TEST', lines: [[{ t: '$20', color: C.cyan }, { t: ' vs ', color: C.white }, { t: '$200', color: C.magenta }], 'controller'], sub: 'can you feel the difference?' }), d: 3 },
    { ...vsPhotoSlide({ q: ['same game.', 'same hands.'], left: { top: '$20', bot: '8BitDo Pro 2', tag: 'CHEAP', name: '8bitdo' }, right: { top: '$200', bot: 'Xbox Elite 3', tag: 'PREMIUM', name: 'xbox-elite3' } }), d: 4 },
    { svg: factSlide({ top: 'honestly?', big: ['I COULD', 'BARELY', 'TELL.'], bigColor: C.white, sub: 'so where does the $180 go?  ↓' }), d: 4 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '02-deadzone-fix', slides: [
    { ...showcaseSlide({ kicker: 'AIM FIX', title: ['your DEAD ZONE', [{ t: 'is wrong', color: C.magenta }]], sub: 'free 20-second fix', product: { name: 'dualsense', label: 'DualSense', accent: C.cyan } }), d: 3.4 },
    { svg: pointSlide({ n: 1, title: ['open stick', 'SETTINGS'], desc: 'find "dead zone"', color: C.cyan }), d: 3 },
    { svg: pointSlide({ n: 2, title: ['lower it til', [{ t: 'drift STOPS', color: C.magenta }]], desc: 'not one click more', color: C.magenta }), d: 3.5 },
    { svg: factSlide({ top: 'result:', big: ['INSTANT', 'AIM'], bigColor: C.cyan, sub: 'try it tonight' }), d: 3 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '03-stick-drift', slides: [
    { ...showcaseSlide({ kicker: 'DON\'T TOSS IT', title: ['fix STICK DRIFT', [{ t: 'for FREE', color: C.cyan }]], sub: '60 seconds, no tools', product: { name: 'xbox-core', label: 'Xbox Wireless', accent: C.cyan } }), d: 3.4 },
    { svg: pointSlide({ n: 1, total: 3, title: ['lift the', 'rubber boot'], desc: 'around the stick base', color: C.cyan }), d: 3 },
    { svg: pointSlide({ n: 2, total: 3, title: ['blast air +', [{ t: '99% alcohol', color: C.magenta }]], desc: 'then work the stick', color: C.magenta }), d: 3 },
    { svg: pointSlide({ n: 3, total: 3, title: ['let it dry,', 'test it'], desc: '9/10 times… fixed', color: C.good }), d: 3 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '04-pro-settings', slides: [
    { ...showcaseSlide({ kicker: 'STEAL THESE', title: ['pros DON\'T use', [{ t: 'default settings', color: C.magenta }]], sub: 'change these 3', product: { name: 'razer-wolverine', label: 'Razer Wolverine V3', accent: C.magenta } }), d: 3.4 },
    { svg: pointSlide({ n: 1, title: ['response curve', [{ t: '→ LINEAR', color: C.cyan }]], desc: '1:1 stick control', color: C.cyan }), d: 3 },
    { svg: pointSlide({ n: 2, title: ['dead zone', [{ t: '→ LOW', color: C.magenta }]], desc: 'most never touch this', color: C.magenta }), d: 3.2 },
    { svg: pointSlide({ n: 3, title: ['trigger sens', [{ t: '→ MAX', color: C.amber }]], desc: 'faster shots', color: C.amber }), d: 3 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '05-pro-pad-reveal', slides: [
    { svg: titleSlide({ kicker: 'PLOT TWIST', lines: ['pros DON\'T use', [{ t: 'the Elite', color: C.magenta }]], sub: 'here\'s what they actually grab' }), d: 3.5 },
    { svg: factSlide({ top: 'they use', big: ['HALL', 'EFFECT', 'PADS'], bigColor: C.cyan, sub: 'no drift. ever.' }), d: 3.5 },
    { ...vsPhotoSlide({ q: ['same paddles.', 'half the price.'], left: { top: 'NOT THIS', bot: 'Xbox Elite 3', tag: '$$$', name: 'xbox-elite3' }, right: { top: 'THIS', bot: 'Flydigi Vader 5', tag: 'NO DRIFT', name: 'flydigi-vader5' } }), d: 4.5 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '06-tier-list', slides: [
    { svg: titleSlide({ kicker: 'YOU\'LL DISAGREE', lines: ['ranking EVERY', [{ t: 'controller', color: C.magenta }]], sub: 'trash → god' }), d: 3 },
    { ...tierPhotoSlide({ rows: [
      { tier: 'S', items: 'Hall-effect pro pads', name: 'gamesir-t4' },
      { tier: 'A', items: 'DualSense · Xbox Core', name: 'dualsense' },
      { tier: 'B', items: 'Switch Pro · 8BitDo', name: '8bitdo' },
      { tier: 'F', items: 'that drifting OEM stick' },
    ] }), d: 5 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '07-hall-effect', slides: [
    { ...showcaseSlide({ kicker: 'NEVER DRIFT AGAIN', title: ['why your NEXT pad', [{ t: 'needs hall effect', color: C.cyan }]], sub: '15-second explainer', product: { name: 'gamesir-t4', label: 'GameSir T4 Kaleid', accent: C.cyan } }), d: 3.8 },
    { svg: factSlide({ top: 'old sticks =', big: ['CONTACT', '→ WEAR', '→ DRIFT'], bigColor: C.bad, sub: 'they rub themselves to death' }), d: 4 },
    { svg: factSlide({ top: 'hall effect =', big: ['MAGNETS,', 'NO TOUCH'], bigColor: C.cyan, sub: '= zero drift, forever' }), d: 3.5 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '08-30-dollar-mod', slides: [
    { ...showcaseSlide({ kicker: 'PROJECT', title: [[{ t: '$30', color: C.cyan }, { t: ' pad vs', color: C.white }], [{ t: 'a $200 one', color: C.magenta }]], sub: 'can we mod it?', product: { name: '8bitdo', label: '8BitDo Pro 2 — $30 base', accent: C.cyan } }), d: 3.8 },
    { svg: pointSlide({ n: 1, total: 3, title: ['grip tape +', 'new sticks'], desc: 'instant pro feel', color: C.cyan }), d: 3 },
    { svg: pointSlide({ n: 2, total: 3, title: ['trigger stops', '+ paddles'], desc: 'snappier, faster', color: C.magenta }), d: 3 },
    { svg: factSlide({ top: 'head to head:', big: ['$30 IN', 'PARTS…', 'WORTH IT'], bigColor: C.good, sub: 'would you try it?  ↓' }), d: 3.5 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '09-claw-vs-paddles', slides: [
    { svg: titleSlide({ kicker: 'SETTLE THIS', lines: ['claw grip', [{ t: 'vs paddles', color: C.magenta }]], sub: 'one is better. fight.' }), d: 3 },
    { ...vsPhotoSlide({ q: ['which actually', 'wins?'], left: { top: 'CLAW', bot: 'DualSense', tag: 'FREE', name: 'dualsense' }, right: { top: 'PADDLES', bot: 'Xbox Elite 3', tag: 'PRO', name: 'xbox-elite3' } }), d: 4.5 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '10-stop-buying-elite', slides: [
    { svg: titleSlide({ kicker: 'BEFORE YOU BUY', lines: ['STOP buying', [{ t: 'the Elite', color: C.magenta }]], sub: 'get this instead' }), d: 3.5 },
    { svg: pointSlide({ n: 1, title: ['it still', [{ t: 'DRIFTS', color: C.bad }]], desc: 'premium price, same sticks', color: C.bad }), d: 3 },
    { ...vsPhotoSlide({ q: ['Elite?', 'or this?'], left: { top: 'DON\'T', bot: 'Xbox Elite 3', tag: '$$$', name: 'xbox-elite3' }, right: { top: 'GET THIS', bot: 'GameSir T4', tag: '½ PRICE', name: 'gamesir-t4' } }), d: 4 },
    { svg: endSlide(), d: 3.5 },
  ] },
];

// ---------- render + encode ----------
// rasterize a slide and composite any controller photos onto its white cards
async function renderSlide(slide, file) {
  const photos = slide.photos || [];
  const base = await sharp(Buffer.from(slide.svg)).png().toBuffer();
  if (!photos.length) { await sharp(base).toFile(file); return; }
  const comps = [];
  for (const ph of photos) {
    const buf = await sharp(ph.file)
      .resize({ width: Math.round(ph.w), height: Math.round(ph.h), fit: 'inside' })
      .toBuffer();
    const m = await sharp(buf).metadata();
    comps.push({
      input: buf,
      left: Math.round(ph.x + (ph.w - m.width) / 2),
      top: Math.round(ph.y + (ph.h - m.height) / 2),
    });
  }
  await sharp(base).composite(comps).png().toFile(file);
}

function encode(frames, outFile) {
  // inputs
  const args = [];
  frames.forEach((f) => { args.push('-loop', '1', '-t', String(f.d), '-i', f.png); });
  // normalize each input, then chain xfades
  const fc = [];
  frames.forEach((_, i) => fc.push(`[${i}:v]fps=${FPS},format=yuv420p,setsar=1,scale=${W}:${H}[s${i}]`));
  let prev = 's0';
  let acc = frames[0].d;
  for (let i = 1; i < frames.length; i++) {
    const out = (i === frames.length - 1) ? 'v' : `x${i}`;
    const off = (acc - XF).toFixed(3);
    fc.push(`[${prev}][s${i}]xfade=transition=fade:duration=${XF}:offset=${off}[${out}]`);
    acc = acc - XF + frames[i].d;
    prev = out;
  }
  args.push('-filter_complex', fc.join(';'), '-map', '[v]', '-r', String(FPS),
    '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
    '-preset', 'medium', '-crf', '20', '-y', outFile);
  execFileSync(ffmpeg, args, { stdio: 'ignore' });
}

async function main() {
  const only = process.argv[2]; // optional: build just one by file id
  for (const v of VIDEOS) {
    if (only && !v.file.includes(only)) continue;
    const frames = [];
    for (let i = 0; i < v.slides.length; i++) {
      const png = path.join(TMP, `${v.file}-${i}.png`);
      await renderSlide(v.slides[i], png);
      frames.push({ png, d: v.slides[i].d });
    }
    const out = path.join(OUT, `${v.file}.mp4`);
    encode(frames, out);
    const total = frames.reduce((a, b) => a + b.d, 0) - XF * (frames.length - 1);
    console.log(`built ${v.file}.mp4  (~${total.toFixed(1)}s, ${frames.length} scenes)`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
