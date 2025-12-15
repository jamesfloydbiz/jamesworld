import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { ExternalLink } from 'lucide-react';

const automations = [
  {
    title: 'JamesFloyds.World V1',
    description: 'A 3D avatar-like world to explore James life, complete with an entrance sequence like no other.',
    status: 'Active',
    cta: 'Explore',
    link: 'https://james-world.lovable.app/',
    external: true,
  },
  {
    title: 'Top YT Videos By Topic',
    description: 'Get the top 15 YouTube videos by views based on any input, sorted by length and recency.',
    status: 'Active',
    cta: 'Pictures coming soon',
  },
  {
    title: 'Network Automation',
    description: 'Automated network monitoring and management system for infrastructure optimization.',
    status: 'Active',
    cta: 'Pictures coming soon',
  },
  {
    title: 'YT Video to Blog',
    description: "If it's on video, it might as well be a blog",
    status: 'Booming',
    cta: 'Pictures coming soon',
  },
  {
    title: 'Multi-Agent Blog Team',
    description: 'An experiment in multi-agent workflows that produces SEO designed blogs with QA',
    status: 'Active',
    cta: 'Pictures coming soon',
  },
  {
    title: 'Organic YouTube to Calls Booked Dashboard',
    description: 'A dashboard that shows what videos correlate to site views, calls booked, etc. Remember, measurement is the first step to improvement.',
    status: 'Active',
    cta: 'Pictures coming soon',
  },
  {
    title: 'AI Coded Calculators',
    description: 'Calculators coded with Claude Code for internal use at BetterWealth',
    status: 'Active',
    cta: 'Pictures coming soon',
  },
];

const OpsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <WalkwayHeader title="AI + Ops" />
      
      <main className="pt-[200px] px-6 md:px-8 pb-24">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-4xl tracking-widest uppercase mb-4">AI Automations</h1>
          <p className="text-muted-foreground mb-12 text-sm md:text-base">
            AI Agents, Vibe Coding, and Ops
          </p>
          
          <h2 className="text-xl tracking-widest uppercase mb-6">Active Automations</h2>
          
          {/* Automations Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {automations.map((automation, index) => (
              <motion.div
                key={automation.title}
                className="border border-border p-6 hover:border-foreground transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base">{automation.title}</h3>
                  <span className={`text-xs px-2 py-1 ${
                    automation.status === 'Booming' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-foreground'
                  }`}>
                    {automation.status}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {automation.description}
                </p>
                
                {'external' in automation && automation.external && automation.link && (
                  <a
                    href={automation.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm hover:underline underline-offset-4"
                  >
                    {automation.cta} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                
                {!('external' in automation && automation.external) && (
                  <span className="text-sm text-muted-foreground">
                    {automation.cta}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default OpsPage;
