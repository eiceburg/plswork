# DEADZONE — 10 Shorts, Ready to Post

10 finished vertical videos live in **`brand/video/`** (1080×1920, H.264, ~10–15s
each). They're **silent on purpose** — open each in the YouTube app and add a
*trending* sound before posting (rising audio = free reach). You can also drop
gameplay clips on top of any scene if you want footage.

Every video ends on a card pointing to your site, and every description below
carries the link, so the channel funnels straight into your controller guide.

> **Your link:** `https://bestcontrollers.netlify.app/` (live on Netlify).

---

## How to post one (90 seconds)
1. YouTube app → **+** → **Create a Short** → **Upload** the `.mp4`.
2. **Add sound** → pick something trending (look for the ↗ arrow).
3. Paste the **title** and **description** below.
4. Post. Reply to every comment in the first hour.

---

## The 10 (paste title + description as-is)

### 01 · `01-20-vs-200.mp4`
**Title:** `$20 vs $200 Controller — Can You Even Tell? 🎮 #shorts`
**Description:**
```
$20 vs $200 controller, same game, same hands. Be honest — could you tell?
Full 2026 controller breakdown (every budget): https://bestcontrollers.netlify.app/
#controller #gaming #ps5 #xbox #shorts
```

### 02 · `02-deadzone-fix.mp4`
**Title:** `Your Controller Dead Zone Is WRONG (20-Sec Aim Fix) 🎯 #shorts`
**Description:**
```
The dead-zone setting nobody tells you about — lower it till the drift stops.
More controller tips + the best pads of 2026: https://bestcontrollers.netlify.app/
#deadzone #aimassist #controllersettings #fps #shorts
```

### 03 · `03-stick-drift.mp4`
**Title:** `Fix Stick Drift in 60 Seconds — FREE, No Tools 🛠️ #shorts`
**Description:**
```
Don't bin your drifting controller — try this first. Works 9 times out of 10.
Drift-proof controllers worth buying: https://bestcontrollers.netlify.app/
#stickdrift #controllerrepair #ps5 #xbox #shorts
```

### 04 · `04-pro-settings.mp4`
**Title:** `3 Controller Settings Pros Change First 🧠 #shorts`
**Description:**
```
Default settings are holding your aim back. Fix these 3 (most never touch #2).
Best controllers to run these on: https://bestcontrollers.netlify.app/
#controllersettings #fps #aim #gaming #shorts
```

### 05 · `05-pro-pad-reveal.mp4`
**Title:** `The Controller Pros Actually Use (It's NOT the Elite) 👀 #shorts`
**Description:**
```
Everyone thinks pros use the Elite. They don't — here's the hall-effect truth.
See the exact pads in our 2026 guide: https://bestcontrollers.netlify.app/
#procontroller #halleffect #xbox #gaming #shorts
```

### 06 · `06-tier-list.mp4`
**Title:** `Ranking EVERY Controller: Trash to GOD 🏆 #shorts`
**Description:**
```
Controller tier list — you're gonna disagree. Tell me I'm wrong 👇
Full ranked list with specs + prices: https://bestcontrollers.netlify.app/
#tierlist #controller #ps5 #xbox #shorts
```

### 07 · `07-hall-effect.mp4`
**Title:** `Why Your Next Controller Needs Hall-Effect Sticks 🧲 #shorts`
**Description:**
```
Magnets, not contact = zero drift, forever. Here's why it matters in 15 seconds.
Every hall-effect pick for 2026: https://bestcontrollers.netlify.app/
#halleffect #stickdrift #tech #gaming #shorts
```

### 08 · `08-30-dollar-mod.mp4`
**Title:** `I Modded a $30 Controller to Beat a $200 One 🔧 #shorts`
**Description:**
```
$30 in parts vs a $200 pro pad — worth it? You decide 👇
Skip the mod, see the best pads instead: https://bestcontrollers.netlify.app/
#controllermod #diy #budget #gaming #shorts
```

### 09 · `09-claw-vs-paddles.mp4`
**Title:** `Claw Grip vs Paddles — Which Actually Wins? #shorts`
**Description:**
```
Claw or paddles? One's objectively better. Settle it in the comments 👇
Controllers with the best paddles: https://bestcontrollers.netlify.app/
#clawgrip #paddles #fps #controller #shorts
```

### 10 · `10-stop-buying-elite.mp4`
**Title:** `STOP Buying the Elite Controller — Get This Instead 💸 #shorts`
**Description:**
```
Before you spend on the Elite… watch this. Same paddles, no drift, half the price.
The pad we'd buy instead: https://bestcontrollers.netlify.app/
#xboxelite #controller #buyingguide #gaming #shorts
```

---

## Posting order & cadence
Post **Mon / Wed / Fri** (it's on the banner). Suggested rollout — strongest
hooks first so the channel opens hot:

`10 → 03 → 01 → 06 → 05 → 02 → 07 → 04 → 08 → 09`

Cross-post each to **TikTok + Reels** same day. When one pops, make a Part 2 of
that format within 48h — tier lists and "$X vs $Y" are endlessly repeatable.

## Controller photos (real product pics in the videos)
Every video is wired to drop in the actual controller photos from your site —
the `$20 vs $200` cards, the "not the Elite" reveal, the tier-list thumbnails,
and the showcase shots all use them. They appear automatically once the 9 images
exist in **`brand/controllers/`** with these exact names:

```
xbox-core.jpg  xbox-elite3.jpg  dualsense.jpg  dualsense-edge.jpg
victrix.jpg  razer-wolverine.jpg  8bitdo.jpg  flydigi-vader5.jpg  gamesir-t4.jpg
```

Two ways to get them in:
1. **Auto:** on a normal network, run `node brand/fetch-controllers.js` — it pulls
   all 9 from the same source the website uses. (This can't run inside Claude
   Code's web sandbox, which blocks image hosts.)
2. **By hand:** right-click → save each controller image from
   `bestcontrollers.netlify.app`, rename to the list above, and drop them in
   `brand/controllers/`.

Then rebuild: `node brand/build-videos.js`. Missing an image? That video just
falls back to its clean text version — nothing breaks.

## Regenerate / edit
All videos are generated from code — tweak text/timing in
`brand/build-videos.js` and rebuild:
```bash
node brand/build-videos.js            # all 10
node brand/build-videos.js 06         # just the tier list
```

## The site now links back
The website nav has a **▶ DEADZONE** button pointing at
`youtube.com/@deadzonehq`, so traffic flows both ways. Update that handle in
`index.html` once you've claimed your real one.
```
