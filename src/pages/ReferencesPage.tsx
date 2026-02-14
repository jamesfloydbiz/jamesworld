import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';
import { Play } from 'lucide-react';

type RefType = 'text' | 'image' | 'video';

interface Reference {
  type: RefType;
  name: string;
  relation: string;
  quote: string;
  maxWidth: string;
  align: string;
  rotation: string;
}

const references: Reference[] = [
  {
    type: 'text',
    name: 'Placeholder A',
    relation: 'Former Colleague',
    quote: '"James is the kind of person who makes everyone around him better. His ability to see the whole picture while caring about the details is rare."',
    maxWidth: 'max-w-md',
    align: 'mr-auto',
    rotation: '-1.2deg',
  },
  {
    type: 'video',
    name: 'Placeholder B',
    relation: 'Manager',
    quote: 'Video testimonial',
    maxWidth: 'max-w-lg',
    align: 'mx-auto',
    rotation: '0.6deg',
  },
  {
    type: 'image',
    name: 'Placeholder C',
    relation: 'Friend',
    quote: '"He showed up when it mattered most. That says everything."',
    maxWidth: 'max-w-sm',
    align: 'ml-auto',
    rotation: '1.5deg',
  },
  {
    type: 'text',
    name: 'Placeholder D',
    relation: 'Collaborator',
    quote: '"Working with James taught me that ambition and generosity aren\'t opposites — they\'re the same thing when done right."',
    maxWidth: 'max-w-md',
    align: 'mx-auto',
    rotation: '-0.5deg',
  },
  {
    type: 'video',
    name: 'Placeholder E',
    relation: 'Mentor',
    quote: 'Video testimonial',
    maxWidth: 'max-w-md',
    align: 'mr-auto',
    rotation: '0.8deg',
  },
  {
    type: 'text',
    name: 'Placeholder F',
    relation: 'Client',
    quote: '"He brought clarity to a situation that felt impossible. Calm, direct, and always a step ahead."',
    maxWidth: 'max-w-sm',
    align: 'ml-auto',
    rotation: '-1.8deg',
  },
  {
    type: 'image',
    name: 'Placeholder G',
    relation: 'Partner',
    quote: '"Trust is earned. James earned it faster than anyone I\'ve worked with."',
    maxWidth: 'max-w-md',
    align: 'mr-auto',
    rotation: '1.1deg',
  },
  {
    type: 'text',
    name: 'Placeholder H',
    relation: 'Team Lead',
    quote: '"What stands out about James is how quietly effective he is. No noise, just results — and the kind that compound over time."',
    maxWidth: 'max-w-lg',
    align: 'mx-auto',
    rotation: '-0.3deg',
  },
];

function TextCard({ item, index }: { item: Reference; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      className={`${item.maxWidth} ${item.align} w-full`}
      style={{ transform: `rotate(${item.rotation})` }}
    >
      <div className="border border-foreground/10 p-8 md:p-10">
        <p className="text-foreground/80 italic text-lg md:text-xl leading-relaxed font-light">
          {item.quote}
        </p>
        <div className="mt-6 pt-4 border-t border-foreground/5">
          <p className="text-sm tracking-[0.15em] uppercase text-foreground/50">{item.name}</p>
          <p className="text-xs tracking-[0.1em] text-foreground/30 mt-1">{item.relation}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ImageCard({ item, index }: { item: Reference; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      className={`${item.maxWidth} ${item.align} w-full`}
      style={{ transform: `rotate(${item.rotation})` }}
    >
      <div className="border border-foreground/10">
        <div className="aspect-[4/3] bg-foreground/5 flex items-center justify-center">
          <span className="text-xs tracking-[0.2em] uppercase text-foreground/20">Image</span>
        </div>
        <div className="p-6 md:p-8">
          <p className="text-foreground/70 italic leading-relaxed">{item.quote}</p>
          <div className="mt-4 pt-3 border-t border-foreground/5">
            <p className="text-sm tracking-[0.15em] uppercase text-foreground/50">{item.name}</p>
            <p className="text-xs tracking-[0.1em] text-foreground/30 mt-1">{item.relation}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function VideoCard({ item, index }: { item: Reference; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.05 }}
      className={`${item.maxWidth} ${item.align} w-full`}
      style={{ transform: `rotate(${item.rotation})` }}
    >
      <div className="border border-foreground/10">
        <div className="aspect-video bg-foreground/[0.03] flex items-center justify-center relative">
          <div className="w-12 h-12 rounded-full border border-foreground/20 flex items-center justify-center">
            <Play className="w-5 h-5 text-foreground/30 ml-0.5" />
          </div>
        </div>
        <div className="p-5">
          <p className="text-sm tracking-[0.15em] uppercase text-foreground/50">{item.name}</p>
          <p className="text-xs tracking-[0.1em] text-foreground/30 mt-1">{item.relation}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default function ReferencesPage() {
  useKeyboardScroll();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WalkwayHeader title="References" />

      <main className="pt-32 pb-24 px-6 md:px-12 lg:px-20">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="max-w-2xl mx-auto text-center mb-20"
        >
          <h1 className="text-3xl md:text-4xl font-light tracking-[0.2em] uppercase mb-4">
            References
          </h1>
          <p className="text-sm text-foreground/40 tracking-wide">
            Words from people who've been there.
          </p>
        </motion.div>

        {/* Scrapbook items */}
        <div className="max-w-4xl mx-auto flex flex-col gap-12 md:gap-16">
          {references.map((item, index) => {
            switch (item.type) {
              case 'text':
                return <TextCard key={index} item={item} index={index} />;
              case 'image':
                return <ImageCard key={index} item={item} index={index} />;
              case 'video':
                return <VideoCard key={index} item={item} index={index} />;
            }
          })}
        </div>
      </main>
    </div>
  );
}
