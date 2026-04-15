import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { Link } from 'react-router-dom';
import { ExternalLink, Play } from 'lucide-react';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';
import { useMemo } from 'react';

/** LinkedIn streak start: April 15, 2026 = day 123. +1 each day after. */
const STREAK_START_DATE = new Date('2026-04-15');
const STREAK_START_COUNT = 123;

function getLinkedInStreak(): number {
  const now = new Date();
  const diffMs = now.getTime() - STREAK_START_DATE.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return STREAK_START_COUNT + Math.max(0, diffDays);
}

interface Project {
  title: string;
  description: string;
  status: string;
  cta: string;
  link: string;
  external: boolean;
}

const currentProjects: Project[] = [
  {
    title: 'Jets and Capital',
    description: 'Jets & Capital is an exclusive event series uniting family offices, investors, and UHNWI in private jet hangars across the country.',
    status: 'Freelance',
    cta: 'Sounds Fun!',
    link: 'https://jetsandcapital.com',
    external: true,
  },
  {
    title: 'Builds',
    description: 'AI Agents, vibe coding, and Ops',
    status: 'Active',
    cta: 'Explore Builds',
    link: '/builds',
    external: false,
  },
  {
    title: 'Resume',
    description: 'My process of mastering leverage. Code, Capital, Collaboration, and Content.',
    status: 'Active',
    cta: 'View Resume',
    link: '/resume',
    external: false,
  },
  {
    title: 'LinkedIn Daily Posts',
    description: '', // filled dynamically
    status: 'Active',
    cta: 'Follow Along',
    link: 'https://www.linkedin.com/in/jamesfloyd',
    external: true,
  },
];

const archivedProjects: Project[] = [
  {
    title: 'Deal-Making',
    description: 'Sports teams, and video games to med-tech and schools.',
    status: 'Archived',
    cta: 'Get Connected',
    link: '/network#connect',
    external: false,
  },
];

const otherProjects = [
  {
    title: 'A Third Door Education',
    period: '2018-Present',
    description: 'Cold emailed the Dalai Llama, sent ¢2 venmos, met people on islands and in jets',
    outcome: "I've got homies now",
  },
  {
    title: 'Sidequests',
    period: '2002-Present',
    description: 'Optimizing for incredible stories',
    outcome: 'XP gained',
  },
];

/* ── References data (mirrors ReferencesPage) ── */

type RefType = 'text' | 'image' | 'video';

interface Reference {
  type: RefType;
  name: string;
  relation: string;
  quote: string;
  rotation: string;
  link?: string;
  context?: string;
}

const references: Reference[] = [
  { type: 'text', name: 'Austin Moss', relation: 'Austinmoss.com · 2026', quote: '"I\'ve got to know James Floyd over the past year and can vouch for his talent, creativity, work ethic, and connecting skills plus many more. I hope one of my partners in NYC finds this and gets a chance to work with you."', rotation: '-1.2deg', context: 'Met through Jets and Capital, Friend' },
  { type: 'text', name: 'Jarom Christensen', relation: 'Family Office Advisor · Investor Relations at Jets & Capital', quote: '"James Floyd is your guy. The best by a wide margin at driving the intersection between function, execution, and relationship."', rotation: '1.4deg', context: 'Worked together on Jets and Capital + a few deals, Friend' },
  { type: 'text', name: 'Caleb Guilliams', relation: 'BetterWealth · Dec 2025', quote: '"James you have been a major blessing to me and to the team and I know I\'m not the only one who shares that."', rotation: '2deg', context: 'Worked for him at Betterwealth, Friend' },
  { type: 'text', name: 'Joel Robertson', relation: 'Content Manager at BetterWealth', quote: '"Can confirm that James Floyd should be your guy. He\'s made for this kind of job."', rotation: '-0.9deg', context: 'Worked with him at Betterwealth, Friend' },
  { type: 'text', name: 'Dom Rrufran', relation: 'President of BetterWealth · Ex-NFL Player', quote: '"I was like — this kid is different. This kid is special."', rotation: '-1.5deg', context: 'Worked for him at Betterwealth, Friend' },
  { type: 'text', name: 'Lane Spurlock', relation: 'Founder · PlayHouse · anata · Deal Partner', quote: '"Dude it was so good to finally meet you in person!!!! Your amazing dude and killing it."', rotation: '1.8deg', link: 'https://www.linkedin.com/in/jamesfloyd', context: 'Friend I met off the internet' },
  { type: 'text', name: 'Lauren Hansen', relation: '', quote: '"One of the coolest dudes in existence, cool to watch and learn from you and your pursuit of growth."', rotation: '0.7deg', context: 'Worked with her at Jets and Capital, Friend' },
  { type: 'text', name: 'Danielle Raskin', relation: 'Curating experiences, community & connection', quote: '"James, you are a superstar. Your hard work and willingness to go above and beyond will take you a LONG WAY. So great meeting you & see you in NY!"', rotation: '-0.6deg', link: 'https://www.linkedin.com/feed/update/urn:li:activity:7440506144126640128/', context: 'Worked for her at SXSW Secret Garden Party, Friend' },
  { type: 'text', name: 'Christian Davis', relation: '', quote: '"Honored to have a seat at your table sir!"', rotation: '1.1deg', context: 'Worked with him at Jets and Capital, Friend' },
  { type: 'text', name: 'Vitoria Okuyama', relation: 'Ex Pro Tennis Player · Ex IB @ Citi', quote: '"James killed it!! If anyone wants to learn how to stand out in a volunteer crowd, reach out to James Floyd."', rotation: '-1.3deg', link: 'https://www.linkedin.com/feed/update/urn:li:activity:7440506144126640128/', context: 'Worked for her at SXSW Secret Garden Party, Friend' },
  { type: 'text', name: 'Tim Nart', relation: '', quote: '"You\'re a Top bloke @jamesfloyd._ To many more."', rotation: '0.8deg', context: 'Worked with him at Jets and Capital, Friend' },
  { type: 'text', name: 'Andrew Yeung', relation: 'Gathering extraordinary people & angel investing · x-Google, Meta', quote: '"james - you were the mvp"', rotation: '-1.6deg', link: 'https://www.linkedin.com/feed/update/urn:li:activity:7440506144126640128/', context: 'Worked for him at SXSW Secret Garden Party, Friend' },
  { type: 'text', name: 'Dom Rrufran', relation: 'President of BetterWealth · Ex-NFL Player', quote: '"You just genuinely have that grit, and you\'re going to be special, you know that AND you\'re very coachable."', rotation: '1.2deg', context: 'Worked for him at Betterwealth, Friend' },
  { type: 'text', name: 'Caleb Guilliams', relation: 'BetterWealth · Dec 2025', quote: '"The growth that you\'ve had over the last year has been insane."', rotation: '-0.5deg', context: 'Worked for him at Betterwealth, Friend' },
  { type: 'text', name: 'Cooper Swanson', relation: '', quote: '"James Floyd you know ball bro."', rotation: '1.4deg', context: 'Friend' },
  { type: 'text', name: 'Jordan Hutchinson', relation: '', quote: '"Love what you\'re building dude."', rotation: '-0.9deg', context: 'Worked for him at Jets and Capital, Friend' },
  { type: 'text', name: 'Trinity Arl', relation: '', quote: '"James Floyd for president."', rotation: '1.8deg', context: 'Friend' },
  { type: 'text', name: 'Vanessa Dayana', relation: '', quote: '"Quedó cheverazo! Me encanta te admiro James, me inspiras a ser mejor persona."', rotation: '-1.6deg', context: 'Friend from Ecuador' },
  { type: 'text', name: 'Dom Rrufran', relation: 'President of BetterWealth · Ex-NFL Player', quote: '"You lowkey inspire me with how hard you work, how much you work."', rotation: '-1.3deg', context: 'Worked for him at Betterwealth, Friend' },
  { type: 'text', name: 'Lauren Hansen', relation: '', quote: '"James supports it → it\'s worth supporting!!"', rotation: '-0.5deg', context: 'Worked with her at Jets and Capital, Friend' },
];

function ProjectCard({ project, index, delay }: { project: Project; index: number; delay: number }) {
  return (
    <motion.div
      key={project.title}
      className="border border-border p-6 hover:border-foreground transition-colors"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay + index * 0.1, duration: 0.5 }}
    >
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-lg tracking-wide">{project.title}</h2>
        <span className="text-xs px-2 py-1 bg-secondary text-foreground">
          {project.status}
        </span>
      </div>
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        {project.description}
      </p>
      {project.external ? (
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm hover:underline underline-offset-4"
        >
          {project.cta} <ExternalLink className="w-3 h-3" />
        </a>
      ) : (
        <Link
          to={project.link}
          className="inline-flex items-center gap-2 text-sm hover:underline underline-offset-4"
        >
          {project.cta} →
        </Link>
      )}
    </motion.div>
  );
}

function ReferenceCard({ item, index }: { item: Reference; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{ transform: `rotate(${item.rotation})` }}
    >
      <div className="border border-foreground/10 bg-background p-6 md:p-8 shadow-[0_2px_20px_-8px_hsl(var(--foreground)/0.08)]">
        {item.context && (
          <p className="text-[10px] text-foreground/30 italic mb-2 tracking-wide">{item.context}</p>
        )}
        <p className="text-foreground/80 italic text-base md:text-lg leading-relaxed font-light">
          {item.quote}
        </p>
        <div className="mt-5 pt-3 border-t border-foreground/5 flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.15em] uppercase text-foreground/50">{item.name}</p>
            <p className="text-[10px] tracking-[0.1em] text-foreground/30 mt-0.5">{item.relation}</p>
          </div>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-foreground/25 hover:text-foreground/60 transition-colors"
            >
              <ExternalLink size={10} />
              <span>source</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const ProjectsPage = () => {
  useKeyboardScroll();
  const streak = useMemo(() => getLinkedInStreak(), []);

  // Inject dynamic description for LinkedIn card
  const projects = useMemo(() =>
    currentProjects.map(p =>
      p.title === 'LinkedIn Daily Posts'
        ? { ...p, description: `Posting every day. Current streak: ${streak} days.` }
        : p
    ), [streak]);

  return (
    <div className="min-h-screen bg-background">
      <WalkwayHeader title="Projects" />
      
      <main className="pt-16 px-6 md:px-8 pb-24">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-4xl tracking-widest uppercase mb-4">Projects</h1>
          <p className="text-muted-foreground mb-12 text-sm md:text-base">
            Current initiatives, and past work in building wealth, education, and systems
          </p>
          
          {/* Current Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {projects.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} delay={0.8} />
            ))}
          </div>

          {/* Archived Projects */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="mb-16"
          >
            <h2 className="text-xl tracking-widest uppercase mb-6">Archived Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {archivedProjects.map((project, index) => (
                <ProjectCard key={project.title} project={project} index={index} delay={1.3} />
              ))}
            </div>
          </motion.div>
          
          {/* Other Projects */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <h2 className="text-xl tracking-widest uppercase mb-6">Other Projects</h2>
            <div className="space-y-6">
              {otherProjects.map((project) => (
                <div key={project.title} className="border-l-2 border-border pl-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <h3 className="text-base">{project.title}</h3>
                    <span className="text-muted-foreground text-xs">{project.period}</span>
                  </div>
                  <p className="text-muted-foreground text-sm mb-1">{project.description}</p>
                  <p className="text-sm italic">→ {project.outcome}</p>
                </div>
              ))}
            </div>
          </motion.div>
          
          {/* CTAs */}
          <motion.div
            className="mt-16 flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            <Link
              to="/network#connect"
              className="px-6 py-3 bg-primary text-primary-foreground text-sm tracking-wide hover:opacity-90 transition-opacity text-center"
            >
              Get in touch about projects
            </Link>
            <Link
              to="/resume"
              className="px-6 py-3 border border-border text-sm tracking-wide hover:border-foreground transition-colors text-center"
            >
              View Full Resume
            </Link>
          </motion.div>

          {/* References Section */}
          <motion.div
            className="mt-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-light tracking-[0.2em] uppercase mb-4">
                References
              </h2>
              <p className="text-sm text-foreground/40 tracking-wide">
                Words from people who've been there.
              </p>
              <Link
                to="/references"
                className="inline-block mt-4 text-[11px] tracking-[0.2em] uppercase text-foreground/50 hover:text-foreground/80 transition-colors underline underline-offset-4"
              >
                View All References
              </Link>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
              {references.slice(0, 6).map((ref, i) => (
                <ReferenceCard key={i} item={ref} index={i} />
              ))}
            </div>

            <div className="text-center mt-10">
              <Link
                to="/references"
                className="px-6 py-3 border border-border text-sm tracking-wide hover:border-foreground transition-colors inline-block"
              >
                See All References →
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default ProjectsPage;
