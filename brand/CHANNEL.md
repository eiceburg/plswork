# DEADZONE — YouTube Channel Launch Kit

A complete, upload-ready identity + content plan for a gaming-controllers channel
built to grow fast on Shorts.

> Heads up on what's mine vs. yours: I can't log into YouTube and create the
> account for you — only you can do that. Everything you need to stand the
> channel up in ~10 minutes is in this folder: the name, handle, finished
> avatar + banner image files, the copy to paste in, and 10 ready-to-film
> Shorts. You bring the phone and the controllers.

---

## 1. Identity

| Field | Value |
|---|---|
| **Channel name** | **DEADZONE** |
| **Handle (primary)** | `@deadzonehq` |
| **Handle (backups)** | `@playdeadzone` · `@deadzonegg` · `@deadzonepad` |
| **Tagline** | Everything controllers. |
| **One-liner** | Reviews, mods, drift fixes & tier lists for every gamepad. |

**Why "DEADZONE":** it's a real controller term (the *dead zone* is the bit of
analog-stick travel the game ignores). It's short, it's insider-cool, it reads
clean at thumbnail size, and it gives the brand a built-in visual hook — the
dashed ring around the left stick in the logo *is* a dead zone.

### Handle availability
Handles are first-come, so I can't reserve one for you. When you create the
channel, try the primary first and fall back down the list. Grab the matching
name on TikTok + Instagram at the same time (cross-posting Shorts is half the
growth strategy — see §5).

---

## 2. Visual assets (in this folder)

| File | Use | Spec |
|---|---|---|
| `deadzone-avatar.png` | Profile picture | 800×800, displays cropped to a circle |
| `deadzone-banner.png` | Channel banner / art | 2560×1440, text kept inside the 1546×423 TV-safe area |
| `deadzone-avatar.svg` / `deadzone-banner.svg` | Editable vector source | — |
| `build-assets.js` | Regenerate both from code | `node brand/build-assets.js` |

**Palette:** near-black `#0B0E14` · neon magenta `#FF2E63` · electric cyan
`#16E0C0` · off-white `#F5F7FA`. Reuse these for thumbnails so the channel looks
like one brand in the subscriptions feed.

To re-render after editing the SVGs (e.g. swap the handle in once you've claimed
it): `node brand/build-assets.js`.

---

## 3. Channel "About" (paste this in)

```
DEADZONE is everything controllers.

Reviews, mods, stick-drift fixes, pro settings and brutally honest tier lists —
for Xbox, PlayStation, PC, Switch and every third-party pad in between. New
drops Mon / Wed / Fri.

Got a controller you want tested or a question? Drop it in the comments.

Business: [your email]
```

**Search keywords** (Settings → Channel → Keywords):
`gaming controllers, controller review, stick drift fix, best controller, hall
effect, controller mods, pro controller settings, deadzone, gamepad, Xbox
controller, PS5 DualSense, controller tier list`

---

## 4. The 10 Shorts (ready to film)

Each is built for the three things that drive Shorts views: a **hook in the
first second**, **high retention** (no dead air, fast cuts, a reason to watch to
the end), and a **comment trigger** (debate or a question). Shoot vertical
(9:16), 25–45s, phone is fine. Caption + hashtags are written for you.

> Filming note: most of these need nothing but your controllers, your hands, and
> a phone propped over a desk. Good top-down light = looks pro instantly.

---

### Short 1 — "$20 vs $200 controller — can you feel the difference?"
**Format:** blind test / comparison (the single most reliable viral format in
this niche).

- **Hook (0–2s):** *"This controller is twenty bucks. This one is two hundred.
  Watch."* — hold both up, magenta sticky note on cheap, cyan on pro.
- **Script:** Play the same 10-second gameplay clip with each. Call out 3 things:
  stick smoothness, trigger snap, button click. End on the twist: *"Honestly? In
  this game… I couldn't tell. Can you?"*
- **On-screen text beats:** `$20` / `$200` / `SAME GAME` / `which is which?`
- **Shot list:** top-down of both pads → hands gameplay (cheap) → hands gameplay
  (pro) → face reaction → freeze on both.
- **Caption:** `$20 vs $200 controller 😳 can you actually feel it? 👇`
- **Hashtags:** `#controller #gaming #ps5 #xbox #shorts`
- **Why it works:** price-shock hook + a question that *demands* a comment.

### Short 2 — "Your controller is killing your aim. Fix the dead zone."
**Format:** actionable tip (on-brand — this is literally the channel name).

- **Hook:** *"If your aim drifts when you let go of the stick, your dead zone is
  wrong. 20 seconds, free fix."*
- **Script:** Show the in-game settings menu, slide the dead zone down until the
  reticle stops drifting, then show before/after aim. *"Lower it till the drift
  stops — not a click more."*
- **On-screen text:** `SETTINGS → DEAD ZONE` / `lower = faster` / `too low = drift`
- **Shot list:** screen-record of settings + a side-by-side aim test.
- **Caption:** `the dead zone setting nobody tells you about 🎯`
- **Hashtags:** `#deadzone #aimassist #controllersettings #gaming #shorts`
- **Why it works:** evergreen search ("controller dead zone"), pure value =
  saves + shares.

### Short 3 — "Fix stick drift in 60 seconds — for FREE"
**Format:** repair / problem-solver (massive evergreen search volume).

- **Hook:** *"Don't throw out your drifting controller. Do this first."*
- **Script:** The compressed-air + isopropyl method: lift the rubber boot, blast
  around the stick base, work the stick, wipe. *"9 times out of 10, that's it."*
  End: *"Still drifting? That's a hardware fix — I'll show you next video."*
- **On-screen text:** `STICK DRIFT?` / `air + 99% alcohol` / `work the stick` / `done`
- **Shot list:** close macro of the drifting stick → the cleaning steps → a clean
  drift test at the end.
- **Caption:** `save your drifting controller before you buy a new one 🛠️`
- **Hashtags:** `#stickdrift #controllerrepair #ps5 #xbox #shorts`
- **Why it works:** people actively search this with a broken pad in hand =
  instant click intent. Cliffhanger ending feeds a sequel.

### Short 4 — "Pros don't use default settings. Steal these."
**Format:** insider / authority.

- **Hook:** *"Default controller settings are holding you back. Change these 3."*
- **Script:** Linear/Dynamic response curve, low dead zone, max trigger
  sensitivity — show each toggle and a one-line why. Fast.
- **On-screen text:** `1 RESPONSE CURVE` / `2 DEAD ZONE` / `3 TRIGGERS`
- **Shot list:** screen-record of each setting + a quick aim/turn demo.
- **Caption:** `the 3 settings pros change first 🧠 (most people never touch #2)`
- **Hashtags:** `#controllersettings #fps #aim #gaming #shorts`
- **Why it works:** numbered list = high retention; "most never touch #2" baits
  a rewatch and a comment.

### Short 5 — "The controller pros actually use (it's not the Elite)"
**Format:** curiosity reveal.

- **Hook:** *"Everyone thinks pros use the Elite. They don't."* (hold up a covered
  controller, reveal at 3s)
- **Script:** Reveal a hall-effect / pro third-party pad. 3 fast reasons: no
  drift, paddles, price. *"Half the cost. Twice the lifespan."*
- **On-screen text:** `NOT the Elite` / `hall effect` / `4 paddles` / `½ the price`
- **Caption:** `the controller pros don't want you to know about 👀`
- **Hashtags:** `#procontroller #halleffect #gaming #xbox #shorts`
- **Why it works:** contrarian + curiosity gap + a brand name people will debate
  in the comments.

### Short 6 — "Ranking every controller from TRASH to GOD"
**Format:** tier list (peak debate-bait, infinitely re-makeable as a series).

- **Hook:** *"Tier-listing every controller in 30 seconds. You're gonna disagree."*
- **Script:** Slap 6–8 controllers onto an on-screen S/A/B/F tier graphic, one
  brutal one-liner each. End on a deliberately spicy placement.
- **On-screen text:** the tier grid + each controller's name as it lands.
- **Shot list:** top-down of the tier card with hands placing each pad.
- **Caption:** `controller tier list 🏆 tell me I'm wrong (you will) 👇`
- **Hashtags:** `#tierlist #controller #gaming #ps5 #shorts`
- **Why it works:** disagreement = comments = reach. Easy to spin into "Part 2,"
  "budget edition," "viewers decide."

### Short 7 — "Hall effect sticks explained — never drift again"
**Format:** explainer on trending tech.

- **Hook:** *"This is why your next controller should have hall-effect sticks."*
- **Script:** 15-second why: magnets, no physical contact, no wear = no drift.
  Show the magnetic stick module vs a worn potentiometer.
- **On-screen text:** `HALL EFFECT` / `magnets, not contact` / `= zero drift`
- **Caption:** `the reason your next controller won't drift 🧲`
- **Hashtags:** `#halleffect #stickdrift #tech #gaming #shorts`
- **Why it works:** rides a real buying trend; educational = high saves.

### Short 8 — "I modded a $30 controller to beat a $200 one"
**Format:** transformation project (story arc = strong retention).

- **Hook:** *"Can a $30 controller beat a $200 one? Let's mod it and find out."*
- **Script:** Fast montage — add grip tape, swap thumbsticks, install trigger
  stops, paddle attachment. End with a head-to-head feel test. *"For $30 in
  parts… yeah."*
- **On-screen text:** `$30 BASE` / `+ grip` / `+ sticks` / `+ trigger stops` / `vs $200`
- **Shot list:** the build montage + a final side-by-side.
- **Caption:** `turning a $30 controller into a pro pad 🔧 worth it?`
- **Hashtags:** `#controllermod #diy #gaming #budget #shorts`
- **Why it works:** transformation arc keeps people to the reveal; "worth it?"
  invites verdicts.

### Short 9 — "Claw grip vs paddles — which actually wins?"
**Format:** technique debate.

- **Hook:** *"Claw grip or paddles? One of these is objectively better. Fight."*
- **Script:** Demo both doing a jump-shot. Pros/cons of each in 2 lines. Give your
  pick and tell people to argue.
- **On-screen text:** `CLAW` vs `PADDLES` / quick pros under each.
- **Caption:** `claw or paddles? settle this 👇`
- **Hashtags:** `#clawgrip #paddles #fps #controller #shorts`
- **Why it works:** identity-based debate (people defend how *they* play) = comment war.

### Short 10 — "Stop buying the Elite. Buy this instead."
**Format:** contrarian money-saver (strong, scroll-stopping hook).

- **Hook:** *"Stop buying the Elite controller. Here's what to get instead."*
- **Script:** 3 fast reasons the premium first-party pad is overpriced, then your
  cheaper hall-effect recommendation with the same paddles + no drift.
- **On-screen text:** `DON'T` / `drift warranty pain` / `$$$` → `GET THIS` / `½ price`
- **Caption:** `before you buy the Elite… watch this 💸`
- **Hashtags:** `#xboxelite #controller #gaming #buyingguide #shorts`
- **Why it works:** "stop buying X" is one of the highest CTR hook templates on
  Shorts; saves people money = shares.

---

## 5. Growth playbook (the part that actually gets views)

1. **Hook in 1 second.** Every Short above leads with the payoff or a question.
   If the first frame is boring, the Short is dead. Re-shoot the hook before you
   re-shoot anything else.
2. **Post Mon/Wed/Fri** (it's on the banner). Consistency > volume. 3 good Shorts
   a week beats 10 rushed ones.
3. **Cross-post everything** to TikTok + Instagram Reels with the same handle.
   Same effort, 3× the surface area. (Remove the YouTube watermark for TikTok.)
4. **Reply to every comment in the first hour** — it's the cheapest reach
   multiplier on Shorts, and these formats are engineered to spark comments.
5. **Run the formats as series.** Tier lists, "$X vs $Y," and "stop buying X"
   are endlessly repeatable. When one hits, make Part 2 within 48 hours.
6. **Pin your spiciest take** as a comment to seed the debate yourself.
7. **Funnel to long-form later.** Once a Short pops, a 6-minute "full controller
   review" gives the new subs something to binge — and this repo already has a
   controllers *website* you can link in the channel description.

---

## 6. Honest expectations
"Most views" isn't a button anyone can press — not me, not anyone. What these
formats do is stack the odds: proven hook templates, high-search evergreen
topics (drift, dead zone, settings), and built-in comment bait. Ship
consistently, lead with the hook, and lean hard into whatever the analytics say
is working. That's the whole game.
