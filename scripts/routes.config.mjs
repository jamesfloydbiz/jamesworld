// Single source of truth for every public route on the site.
// Used at build time to:
//   1. Prerender per-route HTML files (scripts/prerender.mjs) — head meta
//      AND a rich, crawler-readable body summary that React replaces on mount.
//   2. Generate sitemap.xml (scripts/generate-sitemap.mjs)
//
// When you add a <Route> in App.tsx, add an entry here so the new URL
// gets prerendered, sitemapped, and crawler-readable on day one.

export const SITE_URL = 'https://jamesfloyds.world';
export const SITE_AUTHOR = 'James Floyd';
export const DEFAULT_OG_IMAGE = '/pictures/Jets_&_Capital_Miami_BTS_Day_0-58.jpeg';

/**
 * @typedef {Object} RouteConfig
 * @property {string} path        URL path, e.g. "/sonder"
 * @property {string} title       Page-specific title (will be suffixed " | James Floyd")
 * @property {string} description ~155-char meta description
 * @property {string} [image]     Optional path under /public for og:image
 * @property {string} [body]      Optional crawler-readable HTML to inject inside <div id="root">
 *                                (React replaces this on mount, so users never see it on a normal load).
 * @property {number} priority    0.0 – 1.0, sitemap priority
 * @property {string} changefreq  sitemap.org changefreq
 */

// Inline style applied to every route's prerendered body. Plain readable
// type, neutral colors, max width. Visible only briefly (or not at all) for
// users with JS — but always visible to crawlers that don't run JS.
const FALLBACK_STYLE = `
  position: relative;
  max-width: 720px;
  margin: 0 auto;
  padding: 3rem 1.5rem 6rem;
  font-family: ui-serif, Georgia, "Times New Roman", serif;
  font-size: 1rem;
  line-height: 1.7;
  color: #1a1a1a;
  background: #ffffff;
`;

/**
 * Wrap raw HTML in the standard fallback container.
 * @param {string} html
 */
const wrap = (html) =>
  `<div role="main" style="${FALLBACK_STYLE.replace(/\n\s*/g, ' ').trim()}">${html}</div>`;

/** @type {RouteConfig[]} */
export const ROUTES = [
  {
    path: '/',
    title: 'Builder, Creator, Explorer',
    description:
      'James Floyd — builder, creator, and explorer connecting people, ideas, and conviction. Discover projects, AI builds, content, and a life lived without limits.',
    priority: 1.0,
    changefreq: 'weekly',
    body: wrap(`
      <h1>James Floyd</h1>
      <p><em>Builder, creator, entrepreneur, intrapreneur, speaker, event producer, connector.</em></p>
      <p>I'm James Floyd. I build teams, produce events, create AI automations, and connect people. Over the past seven years I've worked as Chief of Staff at <strong>BetterWealth</strong> and <strong>Keiretsu Forum</strong>, run operations for <strong>Jets and Capital</strong> events, and built AI agents for sales, content, and dealflow.</p>
      <p>This site is a small museum of how I think and what I make.</p>
      <h2>What you'll find here</h2>
      <ul>
        <li><a href="/sonder">The Sonder Series</a> — 100 conversations with strangers in New York.</li>
        <li><a href="/projects">Projects</a> — Jets and Capital, AI builds, content systems.</li>
        <li><a href="/portfolio">Portfolio</a> — events produced, deals closed, operations led.</li>
        <li><a href="/builds">Builds</a> — AI agents and automation experiments.</li>
        <li><a href="/blueprints">Blueprints</a> — frameworks and mental models I use.</li>
        <li><a href="/poems">Poems</a> — 90+ short pieces written over a decade.</li>
        <li><a href="/pictures">Memories</a> — photographic record of a life paying attention.</li>
        <li><a href="/resume">Resume</a> and <a href="/references">References</a>.</li>
      </ul>
      <p>Get in touch on <a href="https://linkedin.com/in/jamesfloydl">LinkedIn</a>, <a href="https://instagram.com/jamesfloydscontent">Instagram</a>, or <a href="https://youtube.com/@jamesfloydsworld">YouTube</a>.</p>
    `),
  },

  {
    path: '/sonder',
    title: 'The Sonder Series',
    description:
      "100 conversations with strangers in New York City. James Floyd asks every person their story, the problem in the world that means the most to them, and the most impressive person they've ever met.",
    priority: 0.9,
    changefreq: 'weekly',
    body: wrap(`
      <h1>The Sonder Series</h1>
      <p><em>by James Floyd</em></p>
      <h2>Sonder</h2>
      <p><strong>/ˈsɒn.dər/</strong> <em>noun</em></p>
      <blockquote>The realization that each random passerby is living a life as vivid and complex as your own — populated with their own ambitions, friends, routines, worries, and inherited craziness.</blockquote>
      <h2>About the project</h2>
      <p>100 interviews with people in New York City. That's my goal. I just moved to the city and I want to meet my neighbors. As an entrepreneurial guy I figured I might as well film it. Train stations, stoops, benches, and couches — I'm taking to the streets to have some good ol' fashioned chats. My hope is that through this experiment I'll learn and share about three core questions:</p>
      <ol>
        <li>What's your story? <em>(hence Sonder.)</em></li>
        <li>What problem in the world means the most to you?</li>
        <li>Who's the most impressive person you've ever met, and what made them impressive to you?</li>
      </ol>
      <p>Currently 35 of 100 people interviewed across 27 episodes.</p>
      <h2>Episodes (1 – 27)</h2>
      <p>Episodes 1 through 27 are published. Episodes 28 through 100 are upcoming. Visit the page to see thumbnails and watch the conversations.</p>
      <h2>Follow along</h2>
      <ul>
        <li><a href="https://www.youtube.com/@jamesfloydsworld">YouTube — full conversations</a></li>
        <li><a href="https://instagram.com/jamesfloydscontent">Instagram — clips and behind the scenes</a></li>
        <li><a href="https://linkedin.com/in/jamesfloydl">LinkedIn</a></li>
      </ul>
      <p><em>— Your world comes from you.</em></p>
    `),
  },

  {
    path: '/projects',
    title: 'Projects',
    description:
      'Active and archived projects from James Floyd — Jets and Capital, AI builds, The Sonder Series, and more.',
    priority: 0.9,
    changefreq: 'weekly',
    body: wrap(`
      <h1>Projects</h1>
      <p>Current initiatives and past work in building wealth, education, and systems.</p>
      <h2>Active</h2>
      <ul>
        <li><strong>Jets and Capital</strong> — exclusive event series uniting family offices, investors, and ultra-high-net-worth individuals in private jet hangars across the country. <em><a href="https://jetsandcapital.com">jetsandcapital.com</a></em></li>
        <li><strong><a href="/builds">Builds</a></strong> — AI agents, vibe coding, and operations experiments.</li>
        <li><strong><a href="/sonder">The Sonder Series</a></strong> — 100 interviews with people in New York.</li>
        <li><strong>LinkedIn Daily Posts</strong> — posting every day, building a public archive of thinking. <em><a href="https://www.linkedin.com/in/jamesfloydl">linkedin.com/in/jamesfloydl</a></em></li>
      </ul>
      <h2>Archived</h2>
      <ul>
        <li><strong>Deal-Making</strong> — sports teams, video games, med-tech, schools.</li>
      </ul>
      <h2>Other / ongoing</h2>
      <ul>
        <li><strong>A Third Door Education (2018–present)</strong> — cold-emailed the Dalai Lama, sent two-cent Venmos, met people on islands and in jets. I've got homies now.</li>
        <li><strong>Sidequests (2002–present)</strong> — optimizing for incredible stories.</li>
      </ul>
      <p>For working with me: <a href="/network">/network</a>, <a href="/resume">/resume</a>, <a href="/references">/references</a>.</p>
    `),
  },

  {
    path: '/portfolio',
    title: 'Portfolio',
    description:
      "James Floyd's portfolio — events produced, deals closed, and operations led across Jets and Capital, BetterWealth, Keiretsu Forum, and more.",
    priority: 0.8,
    changefreq: 'monthly',
    body: wrap(`
      <h1>Portfolio</h1>
      <p>Events produced, deals closed, and operations led.</p>
      <h2>Events</h2>
      <ul>
        <li><strong>Jets and Capital</strong> — Trump Doral Miami, Caesars Palace, The Intrepid Aircraft Carrier, private jet hangars. Ultra-high-net-worth investors, family offices, founders. Cumulative AUM in the room: $400B – $2+T.</li>
        <li><strong>Keiretsu Forum</strong> — global investment network with 900+ attendees per major event.</li>
        <li><strong>SXSW Secret Garden Party</strong> — operations support for Andrew Yeung's gathering of extraordinary people.</li>
      </ul>
      <h2>Operations + leadership</h2>
      <ul>
        <li><strong>Chief of Staff at BetterWealth</strong> — translating chaos into structure for a fast-moving brand.</li>
        <li><strong>Sales leadership</strong> — high-performance sales orgs.</li>
        <li><strong>Loeb NYC, Blue Devil Capital, others</strong> — supporting roles across investing and operations.</li>
      </ul>
      <h2>Public-facing</h2>
      <p>I've spoken on entrepreneurship, intrapreneurship, AI automation, and building from nothing. Available for speaking, advisory, or operational engagements: <a href="https://linkedin.com/in/jamesfloydl">linkedin.com/in/jamesfloydl</a>.</p>
    `),
  },

  {
    path: '/builds',
    title: 'Builds',
    description:
      'AI agents, automation tools, and software experiments from James Floyd — from network agents to multi-agent blog teams.',
    priority: 0.8,
    changefreq: 'weekly',
    body: wrap(`
      <h1>Builds</h1>
      <p>AI agents, automation workflows, and software experiments.</p>
      <h2>What I've built</h2>
      <ul>
        <li><strong>Network Automation Agent</strong> — chats with my contacts, saves their info, suggests intros over email.</li>
        <li><strong>Multi-Agent Blog Team</strong> — coordinates research, drafting, editing, and SEO into one workflow.</li>
        <li><strong>YouTube → Blog Converter</strong> — turns long-form video into structured written content.</li>
        <li><strong>Top YouTube Videos research tool</strong> — fast competitive scan for any niche.</li>
        <li><strong>Organic YouTube → Calls-Booked dashboard</strong> — funnel analytics across content + calendar.</li>
        <li><strong>AI-coded calculators</strong> — bespoke tools for clients and internal use.</li>
        <li><strong>JamesFloyds.World</strong> — this site. A 3D interactive portfolio environment built with React, Three.js, and Vite.</li>
        <li><strong>The Block</strong> — lawn mowing tycoon prototype.</li>
      </ul>
      <h2>Stack</h2>
      <p>N8N, ChatGPT, Gemini, Claude, Cursor, Lovable, custom Python, TypeScript, React. I move fast and prefer working ugly things over polished ideas.</p>
    `),
  },

  {
    path: '/content',
    title: 'Content',
    description:
      'Writing, talks, and creative output from James Floyd — poems, blueprints, builds, and reflections on entrepreneurship and intentional living.',
    priority: 0.7,
    changefreq: 'weekly',
    body: wrap(`
      <h1>Content</h1>
      <p>What I publish, write, and share.</p>
      <ul>
        <li><a href="/poems">Poems</a> — 90+ short pieces.</li>
        <li><a href="/pictures">Memories</a> — photo archive of life so far.</li>
        <li><a href="/blueprints">Blueprints</a> — frameworks and mental models.</li>
        <li><a href="/sonder">The Sonder Series</a> — interviews with strangers.</li>
        <li><a href="https://jamesfloyd.substack.com">Substack</a> — long-form writing.</li>
        <li><a href="https://www.linkedin.com/in/jamesfloydl">LinkedIn</a> — daily posts.</li>
        <li><a href="https://www.youtube.com/@jamesfloydsworld">YouTube</a> — interviews and stories.</li>
        <li><a href="https://instagram.com/jamesfloydsworld">Instagram</a> — life captured for my future kids.</li>
      </ul>
    `),
  },

  {
    path: '/network',
    title: 'Network',
    description:
      'Connect with James Floyd — for collaborations, deals, speaking engagements, and meaningful conversation.',
    priority: 0.7,
    changefreq: 'monthly',
    body: wrap(`
      <h1>Network</h1>
      <p>I love meeting people. If any of these reasons apply, please reach out:</p>
      <ul>
        <li>You're working on something interesting and want a collaborator or operator.</li>
        <li>You have a deal that needs a quarterback.</li>
        <li>You want me to speak at your event.</li>
        <li>You think we should know each other.</li>
      </ul>
      <h2>Where to find me</h2>
      <ul>
        <li><a href="https://www.linkedin.com/in/jamesfloydl">LinkedIn</a> — primary.</li>
        <li><a href="https://instagram.com/jamesfloydscontent">Instagram (content)</a></li>
        <li><a href="https://instagram.com/jamesfloydsworld">Instagram (personal/life)</a></li>
        <li><a href="https://www.youtube.com/@jamesfloydsworld">YouTube</a></li>
        <li><a href="https://twitter.com/jamesfloydsworld">Twitter / X</a></li>
        <li>Email: <a href="mailto:jamesfloydbiz@gmail.com">jamesfloydbiz@gmail.com</a></li>
      </ul>
    `),
  },

  {
    path: '/blueprints',
    title: 'Blueprints',
    description:
      'Frameworks and mental models James Floyd uses to translate chaos into structure across teams, deals, and life.',
    priority: 0.7,
    changefreq: 'monthly',
    body: wrap(`
      <h1>Blueprints</h1>
      <p>The frameworks I keep coming back to. Used for thinking about people, deals, decisions, and time.</p>
      <ul>
        <li><a href="/blueprints/mental-models">Mental Models</a> — a working library of decision-making heuristics.</li>
        <li>Health frameworks — sleep, training, food, recovery.</li>
        <li>Operating systems — how I run my week and my year.</li>
        <li>People playbooks — how I meet people, follow up, and build relationships at scale.</li>
      </ul>
    `),
  },

  {
    path: '/blueprints/mental-models',
    title: 'Mental Models',
    description:
      "James Floyd's working library of mental models — frameworks for thinking clearly about people, decisions, and systems.",
    priority: 0.6,
    changefreq: 'monthly',
    body: wrap(`
      <h1>Mental Models</h1>
      <p>A working library of decision-making heuristics. Two modes: <strong>Decide</strong> (use the model now) and <strong>Spot It</strong> (recognize the pattern in the wild).</p>
      <p>Every entry is a short framework I apply to people, deals, and trade-offs. Visit the page for the full collection — or browse <a href="/blueprints">all blueprints</a>.</p>
    `),
  },

  {
    path: '/poems',
    title: 'Poems',
    description:
      '90+ poems by James Floyd. Wisdom, struggle, love, manhood, and the small honest observations of a life paying attention.',
    priority: 0.6,
    changefreq: 'monthly',
    body: wrap(`
      <h1>Poems</h1>
      <p>Short pieces written over the past decade. Themes: love, manhood, fight, peace, energy, sleep, contradictions, possibility, eyes, home, abundance, death, and the small things in between.</p>
      <h2>Selected titles</h2>
      <ul>
        <li>Weary Woman</li>
        <li>The Wanderer</li>
        <li>Madman</li>
        <li>Abundance</li>
        <li>Alone Again</li>
        <li>Contradictions</li>
        <li>Energy</li>
        <li>Eyes</li>
        <li>Flow</li>
        <li>Hi I'm James</li>
        <li>Home</li>
        <li>Into the Darkness</li>
        <li>Love Begets Love</li>
        <li>Manhood</li>
        <li>No Sleep</li>
        <li>Ode to Forever</li>
        <li>Off</li>
        <li>Peace</li>
        <li>Possibility</li>
        <li>Sleep</li>
        <li>The Dance with Death</li>
        <li>The Fight</li>
        <li>The Trials of Danger</li>
        <li>To Her</li>
        <li>To the Strivers</li>
        <li>Wisdom is Pain</li>
      </ul>
    `),
  },

  {
    path: '/pictures',
    title: 'Memories',
    description:
      "A photographic memoir of James Floyd's life — events, travel, friends, and small moments captured for the long run.",
    priority: 0.6,
    changefreq: 'monthly',
    body: wrap(`
      <h1>Hall of Memories</h1>
      <p>A photographic memoir — events, travel, friends, and small moments. Where I publish the stories of my life for my kids.</p>
      <p>Includes images from Jets and Capital Miami, campfires with friends, Byron Donald private security, Brooklyn, the Sonder Series interviews, and 30+ other moments.</p>
      <p>Follow along on <a href="https://instagram.com/jamesfloydsworld">Instagram (@jamesfloydsworld)</a>.</p>
    `),
  },

  {
    path: '/resume',
    title: 'Resume',
    description:
      "James Floyd's resume — Chief of Staff, sales leader, event operator, and entrepreneurial builder. 7+ years across BetterWealth, Keiretsu Forum, and Jets and Capital.",
    priority: 0.7,
    changefreq: 'monthly',
    body: wrap(`
      <h1>Resume — James Floyd</h1>
      <p>7+ years building lean teams, high-performance sales orgs, and executing as Chief of Staff to industry leaders.</p>
      <h2>Highlights</h2>
      <ul>
        <li><strong>Chief of Staff at BetterWealth</strong> — translated chaos into structure across operations, content, and revenue.</li>
        <li><strong>Sales + Operations at Keiretsu Forum</strong> — 900+ attendee global investment events.</li>
        <li><strong>Operations at Jets and Capital</strong> — exclusive UHNWI events at Trump Doral, Caesars Palace, The Intrepid, private jet hangars.</li>
        <li><strong>Builder of AI agents and automation</strong> — see <a href="/builds">Builds</a>.</li>
      </ul>
      <h2>Skills</h2>
      <ul>
        <li>Operations &amp; Chief of Staff work</li>
        <li>Sales leadership and revenue ops</li>
        <li>Event production at scale</li>
        <li>AI / automation engineering (N8N, GPT, Claude, Gemini)</li>
        <li>Public speaking, networking, deal flow</li>
        <li>Spanish fluency</li>
      </ul>
      <h2>Background</h2>
      <p>Traveled to 15+ countries. Speaks fluent Spanish. Has written 90+ poems. Known for translating chaos into structure, scaling brands through AI and systems, and driving deal flow.</p>
      <p>Contact: <a href="mailto:jamesfloydbiz@gmail.com">jamesfloydbiz@gmail.com</a> · <a href="https://linkedin.com/in/jamesfloydl">LinkedIn</a></p>
    `),
  },

  {
    path: '/references',
    title: 'References',
    description:
      'What people say about working with James Floyd — written and video references from leaders across finance, sports, and entrepreneurship.',
    priority: 0.6,
    changefreq: 'monthly',
    body: wrap(`
      <h1>References</h1>
      <p>What people say about working with me, in their own words.</p>
      <ul>
        <li><strong>Caleb Guilliams</strong>, BetterWealth: "James you have been a major blessing to me and to the team."</li>
        <li><strong>Dom Rufran</strong>, President of BetterWealth, ex-NFL: "I was like — this kid is different. This kid is special. You just genuinely have that grit and you're going to be special, and you're very coachable."</li>
        <li><strong>Joel Robertson</strong>, Content Manager at BetterWealth: "Can confirm that James Floyd should be your guy. He's made for this kind of job."</li>
        <li><strong>Jarom Christensen</strong>, Family Office Advisor: "James is your guy. The best by a wide margin at driving the intersection between function, execution, and relationship."</li>
        <li><strong>Andrew Yeung</strong>, gathering extraordinary people, ex-Google &amp; Meta: "James — you were the MVP."</li>
        <li><strong>Vitoria Okuyama</strong>, ex pro tennis player, ex-IB at Citi: "If anyone wants to learn how to stand out in a volunteer crowd, reach out to James."</li>
        <li><strong>Danielle Raskin</strong>, experiences &amp; community: "You are a superstar. Your hard work and willingness to go above and beyond will take you a LONG WAY."</li>
        <li><strong>Lane Spurlock</strong>, founder of PlayHouse / anata: "Your amazing dude and killing it."</li>
        <li><strong>Lauren Hansen</strong>, Jets and Capital: "One of the coolest dudes in existence."</li>
        <li><strong>Austin Moss</strong>, austinmoss.com: "Can vouch for his talent, creativity, work ethic, and connecting skills plus many more."</li>
      </ul>
      <p>Plus 10+ more text and video references on the page.</p>
    `),
  },

  {
    path: '/museum',
    title: 'Museum',
    description:
      "James Floyd's interactive 3D museum — explore portfolio, blueprints, content, and projects in a navigable gallery.",
    priority: 0.6,
    changefreq: 'monthly',
    body: wrap(`
      <h1>The Museum</h1>
      <p>An interactive 3D environment showcasing my portfolio, blueprints, content, and projects as a navigable gallery. Built with React, Three.js, and Vite.</p>
      <p>Best experienced in a desktop browser with WebGL. If you'd prefer text navigation, use the menu items: <a href="/portfolio">Portfolio</a>, <a href="/projects">Projects</a>, <a href="/content">Content</a>, <a href="/blueprints">Blueprints</a>, <a href="/network">Network</a>.</p>
    `),
  },
];
