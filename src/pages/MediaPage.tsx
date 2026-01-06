import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';

const stats = [
  { label: 'Instagram Videos', value: '100+' },
  { label: 'Crib Podcasts', value: '1' },
  { label: 'Late night writings', value: '25+' },
];

const featuredContent = [
  {
    type: 'Instagram',
    title: 'A peek into my life',
    description: 'Place to place, lesson on top of lesson, saved for my future',
    duration: '20+',
    stats: '42T views',
    link: 'https://www.instagram.com/jamesfloydsworld',
    external: true,
  },
  {
    type: 'Podcast',
    title: 'The best crib podcast in town',
    description: 'Me and my boy, in a baby crib...',
    duration: '35:30',
    stats: 'Helped 1 person laugh',
    link: 'https://youtu.be/8Wm_p2j7ius',
    external: true,
  },
  {
    type: 'Poem',
    title: 'Dear Darkness',
    description: 'Hello again Mr. Darkness, its good to see you',
    duration: '1 min read',
    stats: 'The scars make the man',
    hasImage: true,
    imagePlaceholder: 'Dear Darkness poem',
  },
  {
    type: 'Instagram',
    title: 'Philosophies and Poems',
    description: 'Brain Food',
    duration: '80+',
    stats: '26B views',
    link: 'https://www.instagram.com/jamesfloydsstuff',
    external: true,
  },
  {
    type: 'Podcast',
    title: 'A conversation with Angie Parker',
    description: 'A great, and a friend',
    duration: '52:10',
    stats: 'A real one',
    link: 'https://youtu.be/N_SEwMZsg6U',
    external: true,
  },
  {
    type: 'Poem',
    title: 'No Sleep',
    description: 'Evidence for confidence',
    duration: '1 min read',
    stats: 'Walk on, walk on...',
    hasImage: true,
    imagePlaceholder: 'No Sleep poem',
  },
];

const MediaPage = () => {
  useKeyboardScroll();
  return (
    <div className="min-h-screen bg-background">
      <WalkwayHeader title="Media" />
      
      <main className="pt-[140px] px-6 md:px-8 pb-24">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-4xl tracking-widest uppercase mb-4">Media</h1>
          <p className="text-muted-foreground mb-8 text-sm md:text-base">
            Explore the content I've created!
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-4 mb-8">
            {stats.map((stat) => (
              <div key={stat.label} className="px-4 py-2 bg-secondary text-sm">
                <span className="text-foreground font-bold">{stat.value}</span>
                <span className="text-muted-foreground ml-2">{stat.label}</span>
              </div>
            ))}
          </div>
          
          {/* Link to poems */}
          <Link
            to="/poems"
            className="inline-block mb-12 text-sm hover:underline underline-offset-4"
          >
            See Poems →
          </Link>
          
          {/* Featured Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {featuredContent.map((content, index) => (
              <motion.div
                key={content.title}
                className="border border-border p-5 hover:border-foreground transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
              >
                <span className="text-xs text-muted-foreground uppercase tracking-wider">
                  {content.type}
                </span>
                <h2 className="text-base mt-2 mb-2">{content.title}</h2>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  {content.description}
                </p>
                
                {content.hasImage && (
                  <div className="mb-4 bg-secondary aspect-video flex items-center justify-center text-muted-foreground text-xs border border-border">
                    [Image: {content.imagePlaceholder}]
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{content.duration}</span>
                  <span>{content.stats}</span>
                </div>
                
                {content.external && content.link && (
                  <a
                    href={content.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-4 text-xs hover:underline underline-offset-4"
                  >
                    View <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </motion.div>
            ))}
          </div>
          
          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
          >
            <Link
              to="/network#connect"
              className="inline-block px-6 py-3 bg-primary text-primary-foreground text-sm tracking-wide hover:opacity-90 transition-opacity"
            >
              Let's make content!
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default MediaPage;
