// Single source of truth for the sitemap.
//
// The build (scripts/build-site.mjs) reads only `path`, `priority`, and
// `changefreq` from each route to write dist/sitemap.xml. Page content, titles,
// and meta descriptions live in the hand-authored HTML under site/ — this file
// no longer keeps a second copy of them (it used to, for a React-era prerender
// step that no longer exists).
//
// When you add a page under site/, add its path here so it gets sitemapped.

export const SITE_URL = 'https://jamesfloyds.world';

/**
 * @typedef {Object} RouteConfig
 * @property {string} path        URL path, e.g. "/sonder"
 * @property {number} priority    0.0 – 1.0, sitemap priority
 * @property {string} changefreq  sitemap.org changefreq
 */

/** @type {RouteConfig[]} */
export const ROUTES = [
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/sonder', priority: 0.9, changefreq: 'weekly' },
  { path: '/sonder/report', priority: 0.7, changefreq: 'monthly' },
  { path: '/projects', priority: 0.9, changefreq: 'weekly' },
  { path: '/portfolio', priority: 0.8, changefreq: 'monthly' },
  { path: '/builds', priority: 0.8, changefreq: 'weekly' },
  { path: '/36-questions', priority: 0.6, changefreq: 'monthly' },
  { path: '/writing', priority: 0.8, changefreq: 'daily' },
  { path: '/writing/rabbit-holes/history-of-education', priority: 0.6, changefreq: 'monthly' },
  { path: '/writing/rabbit-holes/social-classes-and-mobility', priority: 0.6, changefreq: 'monthly' },
  { path: '/writing/rabbit-holes/learning-science', priority: 0.6, changefreq: 'monthly' },
  { path: '/events', priority: 0.7, changefreq: 'monthly' },
  { path: '/events/sonder-potluck', priority: 0.6, changefreq: 'monthly' },
  { path: '/events/pithy-party', priority: 0.6, changefreq: 'monthly' },
  { path: '/events/nyc-field-day', priority: 0.6, changefreq: 'monthly' },
  { path: '/events/pickup-soccer', priority: 0.6, changefreq: 'monthly' },
  { path: '/content', priority: 0.7, changefreq: 'weekly' },
  { path: '/network', priority: 0.7, changefreq: 'monthly' },
  { path: '/blueprints', priority: 0.7, changefreq: 'monthly' },
  { path: '/blueprints/mental-models', priority: 0.6, changefreq: 'monthly' },
  { path: '/poems', priority: 0.6, changefreq: 'monthly' },
  { path: '/pictures', priority: 0.6, changefreq: 'monthly' },
  { path: '/resume', priority: 0.7, changefreq: 'monthly' },
  { path: '/references', priority: 0.6, changefreq: 'monthly' },
];
