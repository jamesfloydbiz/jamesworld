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
  rotation: string;
  /** CSS positioning within the cluster */
  style: React.CSSProperties;
  /** Width class */
  width: string;
}

// Each cluster is a group of overlapping items positioned together
interface Cluster {
  /** Min-height for the cluster container */
  minHeight: string;
  items: Reference[];
}

const clusters: Cluster[] = [
  {
    minHeight: '420px',
    items: [
      {
        type: 'text',
        name: 'Placeholder A',
        relation: 'Former Colleague',
        quote: '"James is the kind of person who makes everyone around him better. His ability to see the whole picture while caring about the details is rare."',
        rotation: '-1.2deg',
        width: 'w-[340px] md:w-[400px]',
        style: { top: '0', left: '0' },
      },
      {
        type: 'image',
        name: 'Placeholder C',
        relation: 'Friend',
        quote: '"He showed up when it mattered most."',
        rotation: '2deg',
        width: 'w-[260px] md:w-[300px]',
        style: { top: '60px', right: '0' },
      },
    ],
  },
  {
    minHeight: '380px',
    items: [
      {
        type: 'video',
        name: 'Placeholder B',
        relation: 'Manager',
        quote: 'Video testimonial',
        rotation: '0.8deg',
        width: 'w-[320px] md:w-[420px]',
        style: { top: '0', left: '50%', transform: 'translateX(-50%)' },
      },
      {
        type: 'text',
        name: 'Placeholder D',
        relation: 'Collaborator',
        quote: '"Working with James taught me that ambition and generosity aren\'t opposites."',
        rotation: '-1.5deg',
        width: 'w-[280px] md:w-[320px]',
        style: { top: '140px', left: '0' },
      },
    ],
  },
  {
    minHeight: '440px',
    items: [
      {
        type: 'text',
        name: 'Placeholder F',
        relation: 'Client',
        quote: '"He brought clarity to a situation that felt impossible. Calm, direct, and always a step ahead."',
        rotation: '1.1deg',
        width: 'w-[300px] md:w-[360px]',
        style: { top: '0', right: '5%' },
      },
      {
        type: 'video',
        name: 'Placeholder E',
        relation: 'Mentor',
        quote: 'Video testimonial',
        rotation: '-0.6deg',
        width: 'w-[280px] md:w-[360px]',
        style: { top: '100px', left: '0' },
      },
      {
        type: 'text',
        name: 'Placeholder H',
        relation: 'Team Lead',
        quote: '"No noise, just results."',
        rotation: '2.2deg',
        width: 'w-[220px] md:w-[260px]',
        style: { bottom: '0', right: '10%' },
      },
    ],
  },
  {
    minHeight: '360px',
    items: [
      {
        type: 'image',
        name: 'Placeholder G',
        relation: 'Partner',
        quote: '"Trust is earned. James earned it faster than anyone I\'ve worked with."',
        rotation: '-1.8deg',
        width: 'w-[280px] md:w-[340px]',
        style: { top: '0', left: '10%' },
      },
      {
        type: 'text',
        name: 'Placeholder H',
        relation: 'Team Lead',
        quote: '"What stands out about James is how quietly effective he is — the kind of results that compound over time."',
        rotation: '0.5deg',
        width: 'w-[300px] md:w-[380px]',
        style: { top: '80px', right: '0' },
      },
    ],
  },
];

function TextCard({ item, index }: { item: Reference; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`absolute ${item.width}`}
      style={{ ...item.style, transform: `${item.style.transform || ''} rotate(${item.rotation})`.trim() }}
    >
      <div className="border border-foreground/10 bg-background p-6 md:p-8 shadow-[0_2px_20px_-8px_hsl(var(--foreground)/0.08)]">
        <p className="text-foreground/80 italic text-base md:text-lg leading-relaxed font-light">
          {item.quote}
        </p>
        <div className="mt-5 pt-3 border-t border-foreground/5">
          <p className="text-xs tracking-[0.15em] uppercase text-foreground/50">{item.name}</p>
          <p className="text-[10px] tracking-[0.1em] text-foreground/30 mt-0.5">{item.relation}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ImageCard({ item, index }: { item: Reference; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`absolute ${item.width}`}
      style={{ ...item.style, transform: `${item.style.transform || ''} rotate(${item.rotation})`.trim() }}
    >
      <div className="border border-foreground/10 bg-background shadow-[0_2px_20px_-8px_hsl(var(--foreground)/0.08)]">
        <div className="aspect-[4/3] bg-foreground/5 flex items-center justify-center">
          <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/15">Image</span>
        </div>
        <div className="p-4 md:p-5">
          <p className="text-foreground/60 italic text-sm leading-relaxed">{item.quote}</p>
          <div className="mt-3 pt-2 border-t border-foreground/5">
            <p className="text-xs tracking-[0.15em] uppercase text-foreground/50">{item.name}</p>
            <p className="text-[10px] tracking-[0.1em] text-foreground/30 mt-0.5">{item.relation}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function VideoCard({ item, index }: { item: Reference; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`absolute ${item.width}`}
      style={{ ...item.style, transform: `${item.style.transform || ''} rotate(${item.rotation})`.trim() }}
    >
      <div className="border border-foreground/10 bg-background shadow-[0_2px_20px_-8px_hsl(var(--foreground)/0.08)]">
        <div className="aspect-video bg-foreground/[0.03] flex items-center justify-center">
          <div className="w-10 h-10 rounded-full border border-foreground/15 flex items-center justify-center">
            <Play className="w-4 h-4 text-foreground/25 ml-0.5" />
          </div>
        </div>
        <div className="p-4">
          <p className="text-xs tracking-[0.15em] uppercase text-foreground/50">{item.name}</p>
          <p className="text-[10px] tracking-[0.1em] text-foreground/30 mt-0.5">{item.relation}</p>
        </div>
      </div>
    </motion.div>
  );
}

function renderCard(item: Reference, index: number) {
  switch (item.type) {
    case 'text':
      return <TextCard key={index} item={item} index={index} />;
    case 'image':
      return <ImageCard key={index} item={item} index={index} />;
    case 'video':
      return <VideoCard key={index} item={item} index={index} />;
  }
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
          className="max-w-2xl mx-auto text-center mb-16"
        >
          <h1 className="text-3xl md:text-4xl font-light tracking-[0.2em] uppercase mb-4">
            References
          </h1>
          <p className="text-sm text-foreground/40 tracking-wide">
            Words from people who've been there.
          </p>
        </motion.div>

        {/* Scrapbook clusters */}
        <div className="max-w-5xl mx-auto flex flex-col gap-8 md:gap-4">
          {clusters.map((cluster, ci) => (
            <div
              key={ci}
              className="relative w-full"
              style={{ minHeight: cluster.minHeight }}
            >
              {cluster.items.map((item, ii) => renderCard(item, ci * 3 + ii))}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
