// Single source of truth for every public route on the site.
// Used at build time to:
//   1. Prerender per-route HTML files (scripts/prerender.mjs)
//   2. Generate sitemap.xml (scripts/generate-sitemap.mjs)
//
// Add a new route here when you add a <Route> in App.tsx.

export const SITE_URL = 'https://jamesfloyds.world';
export const SITE_AUTHOR = 'James Floyd';
export const DEFAULT_OG_IMAGE = '/pictures/Jets_&_Capital_Miami_BTS_Day_0-58.jpeg';

/**
 * @typedef {Object} RouteConfig
 * @property {string} path     URL path, e.g. "/sonder"
 * @property {string} title    Page-specific title (will be suffixed " | James Floyd")
 * @property {string} description  ~155-char meta description
 * @property {string} [image]  Optional path under /public for og:image (overrides default)
 * @property {number} priority   0.0 – 1.0, sitemap relative priority
 * @property {string} changefreq sitemap.org changefreq
 */

/** @type {RouteConfig[]} */
export const ROUTES = [
  {
    path: '/',
    title: 'Builder, Creator, Explorer',
    description: 'James Floyd — builder, creator, and explorer connecting people, ideas, and conviction. Discover projects, AI builds, content, and a life lived without limits.',
    priority: 1.0,
    changefreq: 'weekly',
  },
  {
    path: '/sonder',
    title: 'The Sonder Series',
    description: '100 conversations with strangers in New York City. James Floyd asks every person their story, the problem in the world that means the most to them, and the most impressive person they\'ve ever met.',
    priority: 0.9,
    changefreq: 'weekly',
  },
  {
    path: '/projects',
    title: 'Projects',
    description: 'Active and archived projects from James Floyd — Jets and Capital, AI builds, The Sonder Series, and more.',
    priority: 0.9,
    changefreq: 'weekly',
  },
  {
    path: '/portfolio',
    title: 'Portfolio',
    description: 'James Floyd\'s portfolio — events produced, deals closed, and operations led across Jets and Capital, BetterWealth, Keiretsu Forum, and more.',
    priority: 0.8,
    changefreq: 'monthly',
  },
  {
    path: '/builds',
    title: 'Builds',
    description: 'AI agents, automation tools, and software experiments from James Floyd — from network agents to multi-agent blog teams.',
    priority: 0.8,
    changefreq: 'weekly',
  },
  {
    path: '/content',
    title: 'Content',
    description: 'Writing, talks, and creative output from James Floyd — poems, blueprints, builds, and reflections on entrepreneurship and intentional living.',
    priority: 0.7,
    changefreq: 'weekly',
  },
  {
    path: '/network',
    title: 'Network',
    description: 'Connect with James Floyd — for collaborations, deals, speaking engagements, and meaningful conversation.',
    priority: 0.7,
    changefreq: 'monthly',
  },
  {
    path: '/blueprints',
    title: 'Blueprints',
    description: 'Frameworks and mental models James Floyd uses to translate chaos into structure across teams, deals, and life.',
    priority: 0.7,
    changefreq: 'monthly',
  },
  {
    path: '/blueprints/mental-models',
    title: 'Mental Models',
    description: 'James Floyd\'s working library of mental models — frameworks for thinking clearly about people, decisions, and systems.',
    priority: 0.6,
    changefreq: 'monthly',
  },
  {
    path: '/poems',
    title: 'Poems',
    description: '90+ poems by James Floyd. Wisdom, struggle, love, manhood, and the small honest observations of a life paying attention.',
    priority: 0.6,
    changefreq: 'monthly',
  },
  {
    path: '/pictures',
    title: 'Memories',
    description: 'A photographic memoir of James Floyd\'s life — events, travel, friends, and small moments captured for the long run.',
    priority: 0.6,
    changefreq: 'monthly',
  },
  {
    path: '/resume',
    title: 'Resume',
    description: 'James Floyd\'s resume — Chief of Staff, sales leader, event operator, and entrepreneurial builder. 7+ years across BetterWealth, Keiretsu Forum, and Jets and Capital.',
    priority: 0.7,
    changefreq: 'monthly',
  },
  {
    path: '/references',
    title: 'References',
    description: 'What people say about working with James Floyd — written and video references from leaders across finance, sports, and entrepreneurship.',
    priority: 0.6,
    changefreq: 'monthly',
  },
  {
    path: '/museum',
    title: 'Museum',
    description: 'James Floyd\'s interactive 3D museum — explore portfolio, blueprints, content, and projects in a navigable gallery.',
    priority: 0.6,
    changefreq: 'monthly',
  },
];
