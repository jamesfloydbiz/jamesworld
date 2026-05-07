import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';
import { useMemo } from 'react';
import { PageMeta } from "@/components/PageMeta";

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
    title: 'The Sonder Series',
    description: '100 interviews with people in New York.',
    status: 'Active',
    cta: 'Watch the Series',
    link: '/sonder',
    external: false,
  },
  {
    title: 'LinkedIn Daily Posts',
    description: '', // filled dynamically
    status: 'Active',
    cta: 'Follow Along',
    link: 'https://www.linkedin.com/in/jamesfloydl/',
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
      <PageMeta
        title="Projects"
        description="Active and archived projects from James Floyd — Jets and Capital, AI builds, The Sonder Series, and more."
        path="/projects"
      />
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
            <Link
              to="/references"
              className="px-6 py-3 border border-border text-sm tracking-wide hover:border-foreground transition-colors text-center"
            >
              View References
            </Link>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
};

export default ProjectsPage;
