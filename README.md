# jamesfloyds.world

Plain HTML site. No framework, no build step for the pages themselves.

## Stack

- HTML files in `site/` — one `index.html` per route
- CSS custom properties in `site/css/site.css` (no Tailwind, no preprocessor)
- Vanilla JS in `site/js/site.js` and inline where needed
- Static assets in `public/` (images, favicons, logos, Substack JSON)
- Bun scripts in `scripts/` for the Substack fetch + dist assembly

A small Bun runtime is the only dependency, and only for the build/deploy
pipeline — the pages themselves are pure HTML/CSS/JS that any browser
from the last 10 years will render.

## Local development

```sh
bun run serve:site     # http://localhost:3000 — merges site/ + public/
```

Edit files in `site/`. Reload the browser. That's it.

## Build for deploy

```sh
bun run build:site
```

Outputs `dist/`:
1. Fetches latest Substack RSS → `public/data/substack-posts.json`
2. Copies `public/` + `site/` into `dist/`
3. Writes `dist/sitemap.xml` from `scripts/routes.config.mjs`

## Deployment

`.github/workflows/deploy.yml` runs `bun run build:site` and publishes
`dist/` to GitHub Pages. The workflow also re-runs daily (06:17 UTC) so
new Substack posts appear without a code push.

## Future work

- `ideas/ai-search.md` — spec for an AI chat over James's full corpus
- `supabase/` — prior search/chat Edge Functions, kept as a starting point
