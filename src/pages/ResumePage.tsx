import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { Link } from 'react-router-dom';
import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';

const skills = {
  'AI Tools': ['AI Agents', 'Prompt Engineering', 'Automations', 'N8N'],
  'Operations and Strategy': ['Event Production', 'Scaling Sales Teams', 'Analytics'],
  'Marketing': ['Funnel Design', 'SEO', 'CRM', 'Sales', 'Partnerships'],
  'Tools': ['GSuite', 'HubSpot', 'Webflow', 'Typeform', 'Figma', 'N8N', 'ChatGpt', 'Gemini', 'Claude'],
};

const highlights = [
  {
    title: 'Sales Records',
    detail: 'Broke the record of products sold in one day multiple times.',
  },
  {
    title: 'Funnel Overhaul',
    detail: 'Led Website, Forms, Tracking, and SEO overhaul that resulted in a **64 points increase** in site health, **19.1%** site view to call conversion, and a google rank increase **from 57 to 21**, in **2 months**.',
  },
  {
    title: 'Deal-Flow',
    detail: 'I consistently facilitate connections for **$500M+** Deals, Startup Financing, etc.',
  },
];

const experience = [
  {
    title: 'Chief of Staff',
    company: 'BetterWealth',
    companyLink: 'https://youtube.com/betterwealth',
    period: 'Nov 2024 - Dec 2025',
    bullets: [
      'Brought ideas into reality and solved problems before and as they happened.',
      'Ran a successful overhaul of website, top of funnel, and search marketing and **doubled conversion rate**.',
      'Built a podcast studio and equipment setup → **100k+** views.',
      'Streamlined content production with AI agents that created **100k+** views and **30+ hrs/week** saved.',
    ],
  },
  {
    title: 'Operations',
    company: 'Jets and Capital',
    companyLink: 'https://jetsandcapital.com',
    companySuffix: ' | 4 times per year',
    period: 'Sep 2023 - Present',
    bullets: [
      'Ran or supported event production at high-profile venues including Trump Doral Miami, Caesars Palace, The Intrepid Aircraft Carrier, and private jet hangars.',
      'Delivered exceptional event quality resulting in cumulative AUM in the room of **$400B to $2+ trillion**.',
    ],
  },
  {
    title: 'Chief of Staff',
    company: 'Keiretsu Forum',
    companyLink: 'https://www.k4northwest.com/cpages/home',
    companySuffix: ' NW, Keiretsu Capital, NW Angel Fund',
    period: 'Nov 2023 - Jun 2024',
    bullets: [
      'Supported the largest, most active angel investor community in the world with **$1B+** deployed.',
      'Led teams in event operations → **900+** attendees.',
      'Analyzed and facilitated **1000+** startup pitches.',
      'Executed outbound and paid marketing campaigns → email, cold calls, Facebook and LinkedIn ads.',
    ],
  },
  {
    title: 'Account Executive',
    company: 'Royal Management',
    period: 'Jul 2021 - Jul 2022',
    companyLink: undefined,
    companySuffix: undefined,
    bullets: [
      'Led the nation in sales and broke records.',
      'Recruited, hired, managed, and coached a team of **5-30 members** repeatedly.',
      'Oversaw strategic and backend operations → customer segmentation, marketing strategy, payroll, taxes, inventory, and territory development.',
    ],
  },
];

const formatBold = (text: string) => {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) => 
    i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
  );
};

const ResumePage = () => {
  useKeyboardScroll();
  return (
    <div className="min-h-screen bg-background">
      <WalkwayHeader title="Resume" />
      
      <main className="pt-16 px-6 md:px-8 pb-24">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl tracking-widest uppercase mb-4">James Floyd</h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> United States
              </span>
              <a href="mailto:jamesfloydbiz@gmail.com" className="flex items-center gap-1 hover:text-foreground">
                <Mail className="w-3 h-3" /> jamesfloydbiz@gmail.com
              </a>
              <a href="https://www.linkedin.com/in/jamesfloydl" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-foreground">
                linkedin.com/in/jamesfloydl <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          
          {/* Summary */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <h2 className="text-xl tracking-widest uppercase mb-4 border-b border-border pb-2">Summary</h2>
            <p className="text-muted-foreground leading-relaxed">
              Intrapreneur with 7+ years building lean teams, high-performance sales orgs, and executing as Chief of Staff to industry leaders. James translates chaos into structure, scales brands through AI and systems, and drives dealflow. He builds outcomes, not overhead — from funnels to large-scale events. He moves fast, leads well, and delivers consistently.
            </p>
          </motion.section>
          
          {/* Skills */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.6 }}
          >
            <h2 className="text-xl tracking-widest uppercase mb-4 border-b border-border pb-2">Skills</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(skills).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-sm font-bold mb-2">{category}</h3>
                  <p className="text-muted-foreground text-sm">{items.join(', ')}</p>
                </div>
              ))}
            </div>
          </motion.section>
          
          {/* Highlights */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.6 }}
          >
            <h2 className="text-xl tracking-widest uppercase mb-4 border-b border-border pb-2">Highlights</h2>
            <div className="space-y-4">
              {highlights.map((highlight) => (
                <div key={highlight.title}>
                  <h3 className="text-sm font-bold mb-1">{highlight.title}</h3>
                  <p className="text-muted-foreground text-sm">{formatBold(highlight.detail)}</p>
                </div>
              ))}
            </div>
          </motion.section>
          
          {/* Experience */}
          <motion.section
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.6 }}
          >
            <h2 className="text-xl tracking-widest uppercase mb-6 border-b border-border pb-2">Work Experience</h2>
            <div className="space-y-8">
              {experience.map((job, index) => (
                <motion.div
                  key={`${job.company}-${job.period}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 + index * 0.1, duration: 0.5 }}
                >
                  <div className="flex flex-col md:flex-row md:items-baseline md:justify-between mb-2">
                    <h3 className="text-base">
                      {job.title}{' '}
                      <span className="text-muted-foreground">
                        at{' '}
                        {job.companyLink ? (
                          <a
                            href={job.companyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground hover:underline underline-offset-4"
                          >
                            {job.company}
                          </a>
                        ) : (
                          job.company
                        )}
                        {job.companySuffix}
                      </span>
                    </h3>
                    <span className="text-muted-foreground text-sm">{job.period}</span>
                  </div>
                  <ul className="space-y-2">
                    {job.bullets.map((bullet, i) => (
                      <li key={i} className="text-muted-foreground text-sm pl-4 relative before:content-['•'] before:absolute before:left-0">
                        {formatBold(bullet)}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </motion.section>
          
          {/* Notable Details */}
          <motion.section
            className="mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.6 }}
          >
            <h2 className="text-xl tracking-widest uppercase mb-4 border-b border-border pb-2">Notable Details</h2>
            <p className="text-muted-foreground text-sm">
              15+ Countries, Fluent in Spanish, 90+ Poems written, Ex-Professional Gamer
            </p>
          </motion.section>
          
          {/* Footer Links */}
          <motion.div
            className="flex flex-wrap gap-4 text-sm mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.7, duration: 0.6 }}
          >
            <Link to="/" className="hover:underline underline-offset-4">3D Portfolio</Link>
            <Link to="/portfolio" className="hover:underline underline-offset-4">Portfolio</Link>
            <Link to="/poems" className="hover:underline underline-offset-4">Poetry</Link>
            <Link to="/projects" className="hover:underline underline-offset-4">Projects</Link>
            <Link to="/builds" className="hover:underline underline-offset-4">Builds</Link>
            <Link to="/media" className="hover:underline underline-offset-4">Media</Link>
          </motion.div>
          
          {/* CTA Section */}
          <motion.div
            className="border border-border p-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.6 }}
          >
            <h3 className="text-xl mb-3">Ready for Liftoff?</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md mx-auto">
              Let's build something exceptional. Whether you need a Chief of Staff, operations strategist, or someone who turns chaos into outcomes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:jamesfloydbiz@gmail.com"
                className="px-6 py-3 bg-primary text-primary-foreground text-sm tracking-wide hover:opacity-90 transition-opacity"
              >
                Email Me
              </a>
              <a
                href="https://www.linkedin.com/in/jamesfloydl/"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 border border-border text-sm tracking-wide hover:border-foreground transition-colors inline-flex items-center justify-center gap-2"
              >
                Let's Connect on LinkedIn <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default ResumePage;
