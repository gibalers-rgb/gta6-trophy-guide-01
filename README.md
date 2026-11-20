# Leonida Trophy Guide — GTA VI (PS5)

The complete Grand Theft Auto VI trophy guide: all 55 PlayStation 5 trophies
(1 platinum, 2 gold, 6 silver, 46 bronze; 28 hidden; 0 online) with a guide
in our own words for each one — what to do, where, how, difficulty, time
estimate, and when it can be missed — plus a platinum roadmap, a 100%
completion checklist, and a progress tracker.

## Run it

```sh
node serve.ts          # then open http://localhost:8080
```

No build step, no network: plain static files under `app/`. Your checklist
progress is saved in the browser (localStorage) and can be exported to a file
and imported back.

## What's in it

- **Checklist** — every trophy with its official name, description and grade
  exactly as PlayStation publishes them, a guide with steps and tips, and its
  sources named beside it. Filters by kind (story, missable, collectibles,
  activities, crime, strangers, exploration, misc) and grade, text search,
  "hide earned", and a spoiler setting that hides story-trophy names and
  descriptions until you earn them.
- **Platinum roadmap** — 3 stages: story (60–80h) → 100% completion
  (~100h) → cleanup (10–20h). About 200 hours total, difficulty 4/10.
- **100% completion** — the full "A Long Road" checklist with the required
  share of each category (15 of 18 card sets, 70 of 80 Challenges, and so on).
- **Sources & notes** — every fact cites its source; launch-week
  unconfirmed methods are marked unconfirmed instead of invented.

The one missable trophy: **Positive Mental Attitude** — meditate at all 18
spots. One spot, the balcony meditation with Lucia at Jason's house in
Chapter 1 (after "Down to Earth"), may not come back. Do it before leaving
Chapter 1 and keep a manual save.

## Deep links

The app reads its view from the URL, so any state can be linked:

- `?tab=roadmap` / `?tab=completion` / `?tab=sources` — open a section
- `?kind=missable` / `?kind=story` / … — filter by kind
- `?open=28` — open one trophy's guide
- `?spoilers=off` — show story trophies (spoilers on by default)

## Files

- `app/index.html`, `app/app.js`, `app/style.css` — the guide
- `app/data/trophies.json` — the 55 trophies, guides, sources, roadmap data
- `screenshots/` — 4 screenshots of the guide (see `shots.json` for views)
- `main.ts` — hands the guide in: copies `app/` + `screenshots/` to
  `/output` and writes `/output/dossier.json`
- `serve.ts` — tiny local static server for development

## Entry

Built for the make.fun bounty `gta6-trophy-guide-01` ("Build the best GTA 6
trophy guide"). An unofficial fan guide — not affiliated with or endorsed by
Rockstar Games. Trophy names and descriptions are reproduced as published by
PlayStation.
