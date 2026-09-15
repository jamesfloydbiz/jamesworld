// Which monthly updates get a page of their own under /writing/updates/.
//
// Two scripts need to agree about this and they run at different points in the
// build, so the list lives here rather than being probed off the filesystem:
// bake-updates.mjs builds the pages, and fetch-substack.mjs links to them from
// the post list on /writing/. A slug probed off disk would be missing on the
// first build after a slug is added and present on the second, which is the
// kind of bug that only shows up in production.
//
// Slug = the last path segment of the Substack URL.
// Add a slug here, add the matching path to routes.config.mjs, rebuild.

export const UPDATE_PAGES = [
  'the-james-floyd-update-12',   // September 2026 — "One year of updates..."
];

export const UPDATE_BASE = '/writing/updates';

export function updatePath(slug) {
  return `${UPDATE_BASE}/${slug}/`;
}
