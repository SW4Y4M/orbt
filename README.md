# Orbit 🛰️

Helping students who've just moved to **London** settle in fast, save money,
and make the most of the city.

Orbit does the thinking for you. Tell it how much energy you have today and it
builds a **ready-made day plan** — an ordered, mapped route of where to go and
what to get, with **student discounts surfaced right at each stop**. Or open
**Explore** and browse curated spots by category on the map.

> See [`ABOUT.md`](./ABOUT.md) for the friendly, shareable product overview, and
> [`.kiro/specs/orbit/`](../.kiro/specs/orbit/) for the full requirements,
> design, and task breakdown.

## Features (MVP)

- **Plan my day** — one question ("how much do you have in you today?") →
  a 2 / 3–4 / 5–6 stop itinerary, essentials first, always with a food stop and
  an "explore" reward, routed sensibly on the map. Skip / swap / mark-done any
  stop; running est. spend + est. savings.
- **Explore** — category tabs (phone, transport, room & bedding, kitchen & food,
  money, explore London), budget-tier filter, synced map pins + cards.
- **Discounts inline** — each place can carry a student offer (UNiDAYS /
  StudentBeans / direct) shown at the point of decision, with a "verify on the
  retailer's site" note and a `lastChecked` date.
- **No sign-up** — area, budget tier, plan, and done-items persist in
  `localStorage`.
- **Mobile-first**, clean, map-forward UI.

## Tech (dependency-free)

Plain **HTML + CSS + vanilla JS (ES modules)** — no framework, no bundler, no
`npm install`. **Leaflet + OpenStreetMap** tiles load from the CDN in the
browser at runtime. See the design doc for why this stack was chosen for the MVP.

```
index.html            # shell: loads Leaflet (CDN) + the ES module entry
styles/app.css        # all styles
src/
  main.js             # entry
  router.js           # hash-based view switching
  state.js            # localStorage-backed state + pub/sub
  views/              # home, plan, explore
  components/         # map, cards, tabs, toggles, discount badge, dom helper
  lib/                # geo (routing) + planner (day-plan generation)
  data/               # areas, categories, places (+ discounts), types
tests/                # Node test runner: planner, geo, and DOM render smoke tests
```

## Run it locally

It's a static site — serve the folder with anything:

```bash
# Python
python3 -m http.server 8000
# then open http://localhost:8000

# or Node (if you have it)
npx serve .
```

Open `http://localhost:8000`. (Opening `index.html` directly via `file://` may
block ES modules in some browsers — prefer serving it.)

## Tests

```bash
node --test tests/planner.test.mjs tests/render.test.mjs
```

Covers planner sizing by energy, guaranteed food/reward stops, done-exclusion,
totals, skip/swap, geo ordering, and component rendering.

## Deploy

Any static host — GitHub Pages, Netlify, Vercel, S3. No build step.

## Note on discounts

Discounts in `src/data/places.js` are **illustrative sample data** for the MVP.
Student offers change frequently — verify every offer on the retailer's site
before any public launch.
