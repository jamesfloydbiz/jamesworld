# Backlog

A running list. The other files in `ideas/` are long-form specs for one thing
each; this is the short list of everything waiting. Newest at the top of each
section. Delete a line when it ships.

## Waiting on a trigger

- **Make `/alpha` public — once the Founders School pitch is done.**
  James's call, Aug 24 2026: the Alpha page should stop being unlisted and get a
  card on `/projects`. Three edits:
  1. `site/alpha/index.html:9` — drop `<meta name="robots" content="noindex, nofollow">`
     (and the same line in `site/alpha/workshop/index.html:9`)
  2. `scripts/routes.config.mjs` — add `{ path: '/alpha', priority: 0.7, changefreq: 'monthly' }`
  3. `site/projects/index.html` — hand-add an `<article class="card">` to the grid;
     cards on that page are written by hand, there is no array
  Then request indexing in Search Console, same as `/references` and `/blueprints`.
  Leave `/founderschool` and `/builds/tpc/` unlisted — those are live pitch material.

## Site

- **90 MB of print masters are untracked** at `public/books/climbing-machine/print/`
  (`spread-*.jpg`, `cover.jpg`, fonts). The site does not need them — the reader
  loads `read/`, not `print/` — so committing them would bloat a public repo
  permanently and slow every Pages deploy. Decide: gitignore, or move out of the
  repo into iCloud proper. `print.html` / `print-cover.html` are also untracked
  and only work with those files present.
- **iCloud `* 2` duplicate directories in `dist/`** (`alpha 2`, `builds 2`,
  `founderschool 2`, …). `dist/` is gitignored build output and a fresh build
  wipes them, but they are a sign iCloud is racing the build.
- **Simplification, from the earlier pass**: `brand/` is dead, `images/` holds
  duplicate logos, `models/` is 51 MB and referenced by nothing.
- **`/builds` vs `/projects` naming** — two index pages that overlap. Pick one
  story.
- **Untracked and unreviewed**: `site/builds/the-shelf/`, `public/vendor/three/`,
  and two dead prototypes `site/builds/climbing-machine/_drag.html` / `_peel.html`.
- **`CLAUDE.md` has two stale claims**: it says `package.json` lists zero
  dependencies (it lists three) and describes `routes.config.mjs` dead code that
  is already gone.

## TPC

- **Objection handling** as a sixth lesson — deliberately left out of v1 so the
  five-step frame is learned first.
- **A service worker**, so the tracker genuinely works with no signal on a pier.
  Right now it works offline only once the browser has cached it.
- **A `/builds/` card for TPC**, once it stops being pitch material.

## Outreach and print

- Book shipping progress; the print order itself.
- Drafts to MacKenzie and Joe — still need their emails.
- Trojan Horse video.
