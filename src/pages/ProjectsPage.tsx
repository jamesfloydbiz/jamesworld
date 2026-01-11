import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';

const currentProjects = [
  {
    title: 'Jets and Capital',
    description: 'Jets & Capital is an exclusive event series uniting family offices, investors, and UHNWI in private jet hangars across the country.',
    status: 'Active',
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
    title: 'BetterWealth',
    description: 'We keep, grow, and transfer wealth. 60k+ on YT.',
    status: 'Active',
    cta: 'Check it out',
    link: 'https://www.youtube.com/c/BetterWealth',
    external: true,
  },
  {
    title: 'Deal-Making',
    description: 'Sports teams, and video games to med-tech and schools.',
    status: 'Active',
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

const ProjectsPage = () => {
  useKeyboardScroll();
  return (
    <div className="min-h-screen bg-background">
      <WalkwayHeader title="Projects" />
      
      <main className="pt-[140px] px-6 md:px-8 pb-24">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-4xl tracking-widest uppercase mb-4">Projects</h1>
          <p className="text-muted-foreground mb-12 text-sm md:text-base">
            Current initiatives and past work in building wealth education and systems
          </p>
          
          {/* Current Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {currentProjects.map((project, index) => (
              <motion.div
                key={project.title}
                className="border border-border p-6 hover:border-foreground transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
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
            ))}
          </div>
          
          {/* Other Projects */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
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
            transition={{ delay: 1.4, duration: 0.6 }}
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
        </motion.div>
      </main>
    </div>
  );
};

export default ProjectsPage;
