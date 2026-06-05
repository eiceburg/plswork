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
const SITE = 'eiceburg.github.io/plswork';
fs.mkdirSync(OUT, { recursive: true });

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
function titleSlide({ kicker, lines, sub, kickerColor = C.magenta }) {
  const n = lines.length;
  const size = n >= 3 ? 118 : 132;
  const gap = size + 18;
  const startY = 960 - ((n - 1) * gap) / 2;
  let s = chip();
  if (kicker) s += `<g transform="translate(540,540)"><rect x="-${kicker.length * 11 + 44}" y="-52" width="${kicker.length * 22 + 88}" height="80" rx="40" fill="${C.bg1}" stroke="url(#neon)" stroke-width="3"/>${block([[{ t: kicker, color: kickerColor }]], { x: 0, y: 8, size: 44, gap: 0, spacing: 3 })}</g>`;
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

// ---------- the 10 shorts ----------
const VIDEOS = [
  { file: '01-20-vs-200', slides: [
    { svg: titleSlide({ kicker: 'BLIND TEST', lines: [[{ t: '$20', color: C.cyan }, { t: ' vs ', color: C.white }, { t: '$200', color: C.magenta }], 'controller'], sub: 'can you feel the difference?' }), d: 3 },
    { svg: vsSlide({ q: ['same game.', 'same hands.'], left: { top: '$20', bot: 'budget pad', tag: 'CHEAP' }, right: { top: '$200', bot: 'pro pad', tag: 'PREMIUM' } }), d: 4 },
    { svg: factSlide({ top: 'honestly?', big: ['I COULD', 'BARELY', 'TELL.'], bigColor: C.white, sub: 'so where does the $180 go?  ↓' }), d: 4 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '02-deadzone-fix', slides: [
    { svg: titleSlide({ kicker: 'AIM FIX', lines: ['your DEAD ZONE', [{ t: 'is wrong', color: C.magenta }]], sub: 'free 20-second fix' }), d: 3 },
    { svg: pointSlide({ n: 1, title: ['open stick', 'SETTINGS'], desc: 'find "dead zone"', color: C.cyan }), d: 3 },
    { svg: pointSlide({ n: 2, title: ['lower it til', [{ t: 'drift STOPS', color: C.magenta }]], desc: 'not one click more', color: C.magenta }), d: 3.5 },
    { svg: factSlide({ top: 'result:', big: ['INSTANT', 'AIM'], bigColor: C.cyan, sub: 'try it tonight' }), d: 3 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '03-stick-drift', slides: [
    { svg: titleSlide({ kicker: 'DON\'T TOSS IT', lines: ['fix STICK DRIFT', [{ t: 'for FREE', color: C.cyan }]], sub: '60 seconds, no tools' }), d: 3 },
    { svg: pointSlide({ n: 1, total: 3, title: ['lift the', 'rubber boot'], desc: 'around the stick base', color: C.cyan }), d: 3 },
    { svg: pointSlide({ n: 2, total: 3, title: ['blast air +', [{ t: '99% alcohol', color: C.magenta }]], desc: 'then work the stick', color: C.magenta }), d: 3 },
    { svg: pointSlide({ n: 3, total: 3, title: ['let it dry,', 'test it'], desc: '9/10 times… fixed', color: C.good }), d: 3 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '04-pro-settings', slides: [
    { svg: titleSlide({ kicker: 'STEAL THESE', lines: ['pros DON\'T use', [{ t: 'default settings', color: C.magenta }]], sub: 'change these 3' }), d: 3 },
    { svg: pointSlide({ n: 1, title: ['response curve', [{ t: '→ LINEAR', color: C.cyan }]], desc: '1:1 stick control', color: C.cyan }), d: 3 },
    { svg: pointSlide({ n: 2, title: ['dead zone', [{ t: '→ LOW', color: C.magenta }]], desc: 'most never touch this', color: C.magenta }), d: 3.2 },
    { svg: pointSlide({ n: 3, title: ['trigger sens', [{ t: '→ MAX', color: C.amber }]], desc: 'faster shots', color: C.amber }), d: 3 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '05-pro-pad-reveal', slides: [
    { svg: titleSlide({ kicker: 'PLOT TWIST', lines: ['pros DON\'T use', [{ t: 'the Elite', color: C.magenta }]], sub: 'here\'s what they actually grab' }), d: 3.5 },
    { svg: factSlide({ top: 'they use', big: ['HALL', 'EFFECT', 'PADS'], bigColor: C.cyan, sub: 'no drift. ever.' }), d: 3.5 },
    { svg: vsSlide({ q: ['same paddles.', 'half the price.'], left: { top: '½', bot: 'the price', tag: 'HALL FX' }, right: { top: '2×', bot: 'the lifespan', tag: 'NO DRIFT' } }), d: 4 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '06-tier-list', slides: [
    { svg: titleSlide({ kicker: 'YOU\'LL DISAGREE', lines: ['ranking EVERY', [{ t: 'controller', color: C.magenta }]], sub: 'trash → god' }), d: 3 },
    { svg: tierSlide({ rows: [
      { tier: 'S', items: 'Hall-effect pro pads' },
      { tier: 'A', items: 'DualSense · Xbox Core' },
      { tier: 'B', items: 'Switch Pro · 8BitDo' },
      { tier: 'F', items: 'that drifting OEM stick' },
    ] }), d: 5 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '07-hall-effect', slides: [
    { svg: titleSlide({ kicker: 'NEVER DRIFT AGAIN', lines: ['why your NEXT pad', [{ t: 'needs hall effect', color: C.cyan }]], sub: '15-second explainer' }), d: 3.5 },
    { svg: factSlide({ top: 'old sticks =', big: ['CONTACT', '→ WEAR', '→ DRIFT'], bigColor: C.bad, sub: 'they rub themselves to death' }), d: 4 },
    { svg: factSlide({ top: 'hall effect =', big: ['MAGNETS,', 'NO TOUCH'], bigColor: C.cyan, sub: '= zero drift, forever' }), d: 3.5 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '08-30-dollar-mod', slides: [
    { svg: titleSlide({ kicker: 'PROJECT', lines: [[{ t: '$30', color: C.cyan }, { t: ' pad to beat', color: C.white }], [{ t: 'a $200 one', color: C.magenta }]], sub: 'can we mod it?' }), d: 3.5 },
    { svg: pointSlide({ n: 1, total: 3, title: ['grip tape +', 'new sticks'], desc: 'instant pro feel', color: C.cyan }), d: 3 },
    { svg: pointSlide({ n: 2, total: 3, title: ['trigger stops', '+ paddles'], desc: 'snappier, faster', color: C.magenta }), d: 3 },
    { svg: factSlide({ top: 'head to head:', big: ['$30 IN', 'PARTS…', 'WORTH IT'], bigColor: C.good, sub: 'would you try it?  ↓' }), d: 3.5 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '09-claw-vs-paddles', slides: [
    { svg: titleSlide({ kicker: 'SETTLE THIS', lines: ['claw grip', [{ t: 'vs paddles', color: C.magenta }]], sub: 'one is better. fight.' }), d: 3 },
    { svg: vsSlide({ q: ['which actually', 'wins?'], left: { top: 'CLAW', bot: 'no extra gear', tag: 'FREE' }, right: { top: 'PADS', bot: 'never leave sticks', tag: 'PADDLES' } }), d: 4.5 },
    { svg: endSlide(), d: 3.5 },
  ] },
  { file: '10-stop-buying-elite', slides: [
    { svg: titleSlide({ kicker: 'BEFORE YOU BUY', lines: ['STOP buying', [{ t: 'the Elite', color: C.magenta }]], sub: 'get this instead' }), d: 3.5 },
    { svg: pointSlide({ n: 1, title: ['it still', [{ t: 'DRIFTS', color: C.bad }]], desc: 'premium price, same sticks', color: C.bad }), d: 3 },
    { svg: factSlide({ top: 'instead get', big: ['HALL FX', '½ PRICE'], bigColor: C.cyan, sub: 'same paddles, no drift' }), d: 3.5 },
    { svg: endSlide(), d: 3.5 },
  ] },
];

// ---------- render + encode ----------
async function renderPNG(svg, file) {
  await sharp(Buffer.from(svg)).png().toFile(file);
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
      await renderPNG(v.slides[i].svg, png);
      frames.push({ png, d: v.slides[i].d });
    }
    const out = path.join(OUT, `${v.file}.mp4`);
    encode(frames, out);
    const total = frames.reduce((a, b) => a + b.d, 0) - XF * (frames.length - 1);
    console.log(`built ${v.file}.mp4  (~${total.toFixed(1)}s, ${frames.length} scenes)`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
