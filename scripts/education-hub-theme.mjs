/**
 * Dress an education dashboard in the /education hub's look.
 *
 * The dashboards are built in other repos and copied into site/education/<slug>/
 * by sync-education-map.mjs, so anything edited in those copies is erased at the
 * next sync. The look therefore lives here, in one stylesheet
 * (site/education/hub-theme.css), and each page only gets two small patches:
 *
 *   1. the root element carries the scope the stylesheet is written under
 *      (class="hub-theme hub-<slug>") and data-theme="dark", which every
 *      dashboard already honours -- so its map ramps switch to the variants it
 *      tuned for a dark ground, and its canvas code (which reads colours off
 *      <html>) picks up the overridden tokens;
 *   2. right after the dashboard's own <style>, the hub fonts and the
 *      stylesheet, so equal-specificity rules resolve in the theme's favour.
 *
 * Idempotent, like the other patches in the sync: each step has a `done` marker
 * and is skipped once applied, and a missing anchor throws rather than writing a
 * half-themed page.
 *
 *   bun scripts/education-hub-theme.mjs                  # the three copies in site/
 *   bun scripts/education-hub-theme.mjs us-vs-world      # one of them
 *
 * sync-education-map.mjs calls applyHubTheme() on every page it syncs, so the
 * command above is only needed to re-apply the patch without a sync.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HUB_THEME_SLUGS = ['us-vs-world', 'school-outlook', 'frontier'];

const FONTS = 'https://fonts.googleapis.com/css2?family=Michroma&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Mono:wght@300;400;500&display=swap';

export function applyHubTheme(html, slug) {
  const swap = (find, replace, what, done) => {
    if (html.includes(done)) return;
    if (!html.includes(find)) throw new Error(`hub theme ${slug}: could not find ${what} — the dashboard's markup moved`);
    html = html.replace(find, () => replace);
  };
  const root = `<html lang="en" class="hub-theme hub-${slug}" data-theme="dark">`;

  /* 1. the scope. Two of the builds have no <html> tag at all (and no doctype --
     adding one would switch them out of quirks mode, so it is not added); the
     furniture block the sync puts at the top of them is the anchor instead. */
  if (/<html[\s>]/i.test(html)) {
    swap('<html lang="en">', root, 'the <html> tag', 'class="hub-theme');
  } else {
    swap('<meta charset="utf-8">\n<meta name="viewport"', `${root}\n<meta charset="utf-8">\n<meta name="viewport"`,
      'the top of the page', 'class="hub-theme');
  }

  /* 2. the stylesheet, after the dashboard's own */
  swap('</style>', `</style>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="/education/hub-theme.css">`, 'the stylesheet', 'href="/education/hub-theme.css"');

  return html;
}

// run directly: patch the copies already in site/
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
  const slugs = process.argv[2] ? [process.argv[2]] : HUB_THEME_SLUGS;
  for (const slug of slugs) {
    const page = join(ROOT, 'site/education', slug, 'index.html');
    const before = readFileSync(page, 'utf8'), after = applyHubTheme(before, slug);
    if (after !== before) { writeFileSync(page, after); console.log(`✓ ${slug} — hub theme applied`); }
    else console.log(`  ${slug} — already themed`);
  }
}
