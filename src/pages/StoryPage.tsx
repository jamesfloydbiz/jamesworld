import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';

const timelineEvents = [
  {
    year: '2020',
    title: 'Emancipation',
    quote: 'Sometimes healing means walking away from the ones who won\'t meet you there.',
  },
  {
    year: '2021',
    title: 'The Awakening',
    quote: 'I failed out of college, then found a pursuit that paid me to learn. Building a sales team on the streets.',
  },
  {
    year: '2022',
    title: 'Go Big',
    quote: 'Traveled the world, stood in front of a private airport with a sign, met the best.',
    hasImage: true,
    imageSrc: '/pictures/airport-sign-pic (1)',
  },
  {
    year: '2023',
    title: 'No Limits',
    quote: 'No more idols. No more excuses. Just me versus my mind — and I started having fun.',
  },
  {
    year: '2024',
    title: 'Strategic Goodness',
    quote: 'When the front door was crowded and the back door was locked, I built my own entrance — and left the door open behind me.',
  },
  {
    year: '2025',
    title: 'To The Moon',
    quote: 'Creation, kindness, and infinite games.',
  },
  {
    year: '2026',
    title: 'Being Written',
    quote: 'The next chapter is unfolding.',
    hasButton: true,
  },
];

const StoryPage = () => {
  useKeyboardScroll();
  return (
    <div className="min-h-screen bg-background">
      <WalkwayHeader title="Story" />
      
      <main className="pt-[140px] px-6 md:px-8 pb-24">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-4xl tracking-widest uppercase mb-4">James Floyd's Journey</h1>
          <p className="text-muted-foreground mb-16 text-sm md:text-base">
            A timeline of bets placed on myself — from emancipation to creative freedom.
          </p>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-border" />
            
            <div className="space-y-16">
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={event.year}
                  className="relative pl-12 md:pl-20"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.15, duration: 0.6 }}
                >
                  {/* Year marker */}
                  <div className="absolute left-0 md:left-4 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    {event.year.slice(2)}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-4">
                      <span className="text-muted-foreground text-sm">{event.year}</span>
                      <h2 className="text-xl md:text-2xl tracking-wide">{event.title}</h2>
                    </div>
                    
                    <p className="text-muted-foreground italic leading-relaxed">
                      "{event.quote}"
                    </p>
                    
                    {event.hasImage && event.imageSrc && (
                      <div className="mt-4 max-w-md overflow-hidden rounded border border-border">
                        <img 
                          src={event.imageSrc} 
                          alt={`James Floyd - ${event.title}`}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                    {(event as any).hasButton && (
                      <a
                        href="https://www.linkedin.com/in/jamesfloydl/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block mt-4 font-mono text-sm tracking-widest uppercase px-6 py-3 border border-border text-foreground hover:bg-accent transition-colors duration-300"
                      >
                        Join the Journey →
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          
          <motion.p
            className="mt-24 text-center text-lg md:text-xl text-muted-foreground italic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.8 }}
          >
            "Freedom here we come."
          </motion.p>
        </motion.div>
      </main>
    </div>
  );
};

export default StoryPage;
