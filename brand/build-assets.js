/*
 * DEADZONE brand asset generator.
 * Builds the channel avatar + banner as SVG, then rasterizes to PNG with sharp.
 * Run: node brand/build-assets.js
 */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const OUT = __dirname;

// ---- Palette -------------------------------------------------------------
const C = {
  bg0: '#0B0E14',
  bg1: '#121620',
  surface: '#161B27',
  magenta: '#FF2E63',
  cyan: '#16E0C0',
  white: '#F5F7FA',
  muted: '#8A93A6',
  amber: '#FFB020',
};

// ---- Reusable controller emblem -----------------------------------------
// Drawn centered on (0,0); extents ~ x:[-200,200]  y:[-120,120]
function emblem({ glow = true, bodyStroke = 'url(#neon)', alpha = 1 } = {}) {
  return `
  <g opacity="${alpha}"${glow ? ' filter="url(#soft)"' : ''}>
    <!-- shoulder bumpers -->
    <rect x="-150" y="-108" width="78" height="30" rx="15" fill="${C.bg1}" stroke="${C.muted}" stroke-opacity="0.35" stroke-width="3"/>
    <rect x="72"   y="-108" width="78" height="30" rx="15" fill="${C.bg1}" stroke="${C.muted}" stroke-opacity="0.35" stroke-width="3"/>
    <!-- body -->
    <rect x="-185" y="-88" width="370" height="176" rx="84" fill="${C.surface}" stroke="${bodyStroke}" stroke-width="11"/>
    <!-- d-pad (left) -->
    <g>
      <rect x="-106" y="-31" width="22" height="62" rx="7" fill="${C.cyan}"/>
      <rect x="-126" y="-11" width="62" height="22" rx="7" fill="${C.cyan}"/>
    </g>
    <!-- face buttons (right diamond) -->
    <g>
      <circle cx="95"  cy="-34" r="14" fill="${C.magenta}"/>
      <circle cx="125" cy="0"   r="14" fill="${C.cyan}"/>
      <circle cx="95"  cy="34"  r="14" fill="${C.white}"/>
      <circle cx="65"  cy="0"   r="14" fill="${C.amber}"/>
    </g>
    <!-- analog sticks: left stick is the "DEADZONE" ring -->
    <g>
      <circle cx="-52" cy="58" r="44" fill="none" stroke="${C.magenta}" stroke-width="4" stroke-opacity="0.55" stroke-dasharray="6 9"/>
      <circle cx="-52" cy="58" r="30" fill="${C.bg0}" stroke="${C.magenta}" stroke-width="5"/>
      <circle cx="-52" cy="58" r="13" fill="${C.magenta}"/>
      <circle cx="52"  cy="58" r="30" fill="${C.bg0}" stroke="${C.cyan}" stroke-width="5"/>
      <circle cx="52"  cy="58" r="13" fill="${C.cyan}"/>
    </g>
  </g>`;
}

const defs = `
  <defs>
    <linearGradient id="neon" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0"   stop-color="${C.magenta}"/>
      <stop offset="1"   stop-color="${C.cyan}"/>
    </linearGradient>
    <radialGradient id="bgrad" cx="0.5" cy="0.42" r="0.75">
      <stop offset="0"   stop-color="#1A2030"/>
      <stop offset="0.6" stop-color="${C.bg0}"/>
      <stop offset="1"   stop-color="#05070B"/>
    </radialGradient>
    <filter id="soft" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="0" stdDeviation="9" flood-color="${C.magenta}" flood-opacity="0.5"/>
      <feDropShadow dx="0" dy="0" stdDeviation="16" flood-color="${C.cyan}" flood-opacity="0.30"/>
    </filter>
    <filter id="blurbig" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="60"/>
    </filter>
  </defs>`;

// ---- Avatar (800x800, shown cropped to a circle) -------------------------
const avatar = `
<svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048" viewBox="0 0 800 800">
  ${defs}
  <rect width="800" height="800" fill="url(#bgrad)"/>
  <circle cx="400" cy="400" r="362" fill="none" stroke="url(#neon)" stroke-width="14" opacity="0.9"/>
  <circle cx="400" cy="400" r="344" fill="none" stroke="${C.bg1}" stroke-width="4"/>
  <g transform="translate(400,360) scale(1.16)">
    ${emblem({ glow: true })}
  </g>
  <text x="400" y="666" text-anchor="middle" font-family="DejaVu Sans, sans-serif"
        font-weight="bold" font-size="74" letter-spacing="4" fill="${C.white}">DEADZONE</text>
</svg>`;

// ---- Banner (2560x1440, safe area 1546x423 centered) ---------------------
const banner = `
<svg xmlns="http://www.w3.org/2000/svg" width="2560" height="1440" viewBox="0 0 2560 1440">
  ${defs}
  <rect width="2560" height="1440" fill="url(#bgrad)"/>

  <!-- corner neon glows -->
  <circle cx="320"  cy="300"  r="260" fill="${C.magenta}" opacity="0.20" filter="url(#blurbig)"/>
  <circle cx="2240" cy="1140" r="300" fill="${C.cyan}"    opacity="0.18" filter="url(#blurbig)"/>

  <!-- faint grid -->
  <g stroke="${C.muted}" stroke-opacity="0.06" stroke-width="2">
    ${Array.from({ length: 27 }, (_, i) => `<line x1="${i * 100}" y1="0" x2="${i * 100}" y2="1440"/>`).join('')}
    ${Array.from({ length: 15 }, (_, i) => `<line x1="0" y1="${i * 100}" x2="2560" y2="${i * 100}"/>`).join('')}
  </g>

  <!-- oversized watermark emblem bleeding off right -->
  <g transform="translate(2200,720) scale(3.0)">
    ${emblem({ glow: false, bodyStroke: C.muted, alpha: 0.10 })}
  </g>

  <!-- ===== SAFE AREA content (x 507..2053, y 508..931) ===== -->
  <!-- crisp emblem on the right of the safe zone -->
  <g transform="translate(1842,712) scale(1.0)">
    ${emblem({ glow: true })}
  </g>

  <!-- wordmark + tagline (left of safe zone) -->
  <text x="548" y="694" font-family="DejaVu Sans, sans-serif" font-weight="bold"
        font-size="165" letter-spacing="5" fill="${C.white}">DEADZONE</text>
  <rect x="552" y="734" width="110" height="9" rx="4.5" fill="url(#neon)"/>
  <text x="552" y="796" font-family="DejaVu Sans, sans-serif" font-size="44"
        letter-spacing="7" fill="${C.muted}">EVERYTHING CONTROLLERS</text>

  <!-- schedule pill -->
  <g transform="translate(552,840)">
    <rect x="0" y="0" width="470" height="60" rx="30" fill="${C.bg1}" stroke="url(#neon)" stroke-width="2.5"/>
    <circle cx="36" cy="30" r="9" fill="${C.magenta}"/>
    <text x="64" y="40" font-family="DejaVu Sans, sans-serif" font-weight="bold"
          font-size="28" letter-spacing="3" fill="${C.white}">NEW DROPS · MON · WED · FRI</text>
  </g>
</svg>`;

// ---- Write + rasterize ---------------------------------------------------
async function main() {
  const jobs = [
    { name: 'deadzone-avatar', svg: avatar, w: 800 },
    { name: 'deadzone-banner', svg: banner, w: 2560 },
  ];
  for (const j of jobs) {
    fs.writeFileSync(path.join(OUT, `${j.name}.svg`), j.svg);
    await sharp(Buffer.from(j.svg)).png().toFile(path.join(OUT, `${j.name}.png`));
    console.log(`built ${j.name}.svg + .png`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
