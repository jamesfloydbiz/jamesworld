import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { ExternalLink, Mail } from 'lucide-react';

const philosophies = [
  {
    title: 'Givers Gain',
    description: 'I believe that generosity and kindness is the best strategy there is.',
  },
  {
    title: 'YOLO',
    description: 'Both where I grew up and the way I approach writing my story.',
  },
  {
    title: 'Be Graceful',
    description: 'Instead of avoiding the storm, dance in the rain.',
  },
];

const connectOptions = [
  {
    platform: 'Instagram',
    description: 'Follow to see what I\'m up to',
    cta: 'Follow @jamesfloydsworld',
    link: 'https://www.instagram.com/jamesfloydsworld',
    external: true,
  },
  {
    platform: 'Email',
    description: 'For collaboration opportunities and deeper discussions',
    cta: 'Send Email',
    link: 'mailto:jamesfloydbiz@gmail.com',
    external: false,
    isEmail: true,
  },
  {
    platform: 'LinkedIn',
    description: 'Professional networking and business connections',
    cta: 'Connect on LinkedIn',
    link: 'https://www.linkedin.com/in/jamesfloydl/',
    external: true,
  },
];

const NetworkPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <WalkwayHeader title="Network" />
      
      <main className="pt-[200px] px-6 md:px-8 pb-24">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-4xl tracking-widest uppercase mb-4">Network</h1>
          <p className="text-muted-foreground mb-12 text-sm md:text-base">
            Building is better together. Connect with me or my network below.
          </p>
          
          {/* Philosophy Section */}
          <motion.div
            className="mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <h2 className="text-xl tracking-widest uppercase mb-6">My Philosophy</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {philosophies.map((philosophy, index) => (
                <motion.div
                  key={philosophy.title}
                  className="border border-border p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                >
                  <h3 className="text-lg mb-3">{philosophy.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {philosophy.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Connect Section */}
          <motion.div
            id="connect"
            className="mb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            <h2 className="text-xl tracking-widest uppercase mb-6">Let's Connect</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {connectOptions.map((option, index) => (
                <motion.div
                  key={option.platform}
                  className="border border-border p-6 hover:border-foreground transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.4 + index * 0.1, duration: 0.5 }}
                >
                  <h3 className="text-lg mb-2">{option.platform}</h3>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                    {option.description}
                  </p>
                  <a
                    href={option.link}
                    target={option.external ? '_blank' : undefined}
                    rel={option.external ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-2 text-sm hover:underline underline-offset-4"
                  >
                    {option.isEmail && <Mail className="w-3 h-3" />}
                    {option.cta}
                    {option.external && <ExternalLink className="w-3 h-3" />}
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Footer Quote */}
          <motion.p
            className="text-center text-lg md:text-xl text-muted-foreground italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8, duration: 0.8 }}
          >
            "Relationships between extraordinary people produce non-linear returns."
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
};

export default NetworkPage;
