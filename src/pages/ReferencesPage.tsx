import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';
import { Play, ExternalLink } from 'lucide-react';

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
  {
    type: 'text',
    name: 'Austin Moss',
    relation: 'Austinmoss.com · 2026',
    quote: '"I\'ve got to know James Floyd over the past year and can vouch for his talent, creativity, work ethic, and connecting skills plus many more. I hope one of my partners in NYC finds this and gets a chance to work with you."',
    rotation: '-1.2deg',
    context: 'Met through Jets and Capital, Friend',
  },
  {
    type: 'text',
    name: 'Jarom Christensen',
    relation: 'Family Office Advisor · Investor Relations at Jets & Capital',
    quote: '"James Floyd is your guy. The best by a wide margin at driving the intersection between function, execution, and relationship."',
    rotation: '1.4deg',
    context: 'Worked together on Jets and Capital + a few deals, Friend',
  },
  {
    type: 'text',
    name: 'Caleb Guilliams',
    relation: 'BetterWealth · Dec 2025',
    quote: '"James you have been a major blessing to me and to the team and I know I\'m not the only one who shares that."',
    rotation: '2deg',
    context: 'Worked for him at Betterwealth, Friend',
  },
  {
    type: 'text',
    name: 'Joel Robertson',
    relation: 'Content Manager at BetterWealth',
    quote: '"Can confirm that James Floyd should be your guy. He\'s made for this kind of job."',
    rotation: '-0.9deg',
    context: 'Worked with him at Betterwealth, Friend',
  },
  {
    type: 'text',
    name: 'Dom Rrufran',
    relation: 'President of BetterWealth · Ex-NFL Player',
    quote: '"I was like — this kid is different. This kid is special."',
    rotation: '-1.5deg',
    context: 'Worked for him at Betterwealth, Friend',
  },
  {
    type: 'text',
    name: 'Lane Spurlock',
    relation: 'Founder · PlayHouse · anata · Deal Partner',
    quote: '"Dude it was so good to finally meet you in person!!!! Your amazing dude and killing it."',
    rotation: '1.8deg',
    link: 'https://www.linkedin.com/in/jamesfloyd',
    context: 'Friend I met off the internet',
  },
  {
    type: 'text',
    name: 'Lauren Hansen',
    relation: '',
    quote: '"One of the coolest dudes in existence, cool to watch and learn from you and your pursuit of growth."',
    rotation: '0.7deg',
    context: 'Worked with her at Jets and Capital, Friend',
  },
  {
    type: 'text',
    name: 'Danielle Raskin',
    relation: 'Curating experiences, community & connection',
    quote: '"James, you are a superstar. Your hard work and willingness to go above and beyond will take you a LONG WAY. So great meeting you & see you in NY!"',
    rotation: '-0.6deg',
    link: 'https://www.linkedin.com/feed/update/urn:li:activity:7440506144126640128/?dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287440769299981451264%2Curn%3Ali%3AugcPost%3A7440441841042415616%29',
    context: 'Worked for her at SXSW Secret Garden Party, Friend',
  },
  {
    type: 'text',
    name: 'Christian Davis',
    relation: '',
    quote: '"Honored to have a seat at your table sir!"',
    rotation: '1.1deg',
    context: 'Worked with him at Jets and Capital, Friend',
  },
  {
    type: 'text',
    name: 'Vitoria Okuyama',
    relation: 'Ex Pro Tennis Player · Ex IB @ Citi',
    quote: '"James killed it!! If anyone wants to learn how to stand out in a volunteer crowd, reach out to James Floyd."',
    rotation: '-1.3deg',
    link: 'https://www.linkedin.com/feed/update/urn:li:activity:7440506144126640128/?dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287440769299981451264%2Curn%3Ali%3AugcPost%3A7440441841042415616%29',
    context: 'Worked for her at SXSW Secret Garden Party, Friend',
  },
  {
    type: 'text',
    name: 'Tim Nart',
    relation: '',
    quote: '"You\'re a Top bloke @jamesfloyd._ To many more."',
    rotation: '0.8deg',
    context: 'Worked with him at Jets and Capital, Friend',
  },
  {
    type: 'text',
    name: 'Andrew Yeung',
    relation: 'Gathering extraordinary people & angel investing · x-Google, Meta',
    quote: '"james - you were the mvp"',
    rotation: '-1.6deg',
    link: 'https://www.linkedin.com/feed/update/urn:li:activity:7440506144126640128/?dashCommentUrn=urn%3Ali%3Afsd_comment%3A%287440769299981451264%2Curn%3Ali%3AugcPost%3A7440441841042415616%29',
    context: 'Worked for him at SXSW Secret Garden Party, Friend',
  },
  {
    type: 'text',
    name: 'Dom Rrufran',
    relation: 'President of BetterWealth · Ex-NFL Player',
    quote: '"You just genuinely have that grit, and you\'re going to be special, you know that AND you\'re very coachable."',
    rotation: '1.2deg',
    context: 'Worked for him at Betterwealth, Friend',
  },
  {
    type: 'text',
    name: 'Caleb Guilliams',
    relation: 'BetterWealth · Dec 2025',
    quote: '"The growth that you\'ve had over the last year has been insane."',
    rotation: '-0.5deg',
    context: 'Worked for him at Betterwealth, Friend',
  },
  {
    type: 'text',
    name: 'Cooper Swanson',
    relation: '',
    quote: '"James Floyd you know ball bro."',
    rotation: '1.4deg',
    context: 'Friend',
  },
  {
    type: 'text',
    name: 'Jordan Hutchinson',
    relation: '',
    quote: '"Love what you\'re building dude."',
    rotation: '-0.9deg',
    context: 'Worked for him at Jets and Capital, Friend',
  },
  {
    type: 'text',
    name: 'Trinity Arl',
    relation: '',
    quote: '"James Floyd for president."',
    rotation: '1.8deg',
    context: 'Friend',
  },
  {
    type: 'text',
    name: 'Vanessa Dayana',
    relation: '',
    quote: '"Quedó cheverazo! Me encanta te admiro James, me inspiras a ser mejor persona."',
    rotation: '-1.6deg',
    context: 'Friend from Ecuador',
  },
  {
    type: 'text',
    name: 'Dom Rrufran',
    relation: 'President of BetterWealth · Ex-NFL Player',
    quote: '"You lowkey inspire me with how hard you work, how much you work."',
    rotation: '-1.3deg',
    context: 'Worked for him at Betterwealth, Friend',
  },
  {
    type: 'text',
    name: 'Lauren Hansen',
    relation: '',
    quote: '"James supports it → it\'s worth supporting!!"',
    rotation: '-0.5deg',
    context: 'Worked with her at Jets and Capital, Friend',
  },
];

function TextCard({ item, index }: { item: Reference; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{
        transform: `rotate(${item.rotation})`,
      }}
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

function ImageCard({ item, index }: { item: Reference; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{
        transform: `rotate(${item.rotation})`,
      }}
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
      transition={{ duration: 0.5, delay: index * 0.08 }}
      style={{
        transform: `rotate(${item.rotation})`,
      }}
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
          <button
            data-tally-open="b5rlk0"
            data-tally-layout="modal"
            data-tally-overlay="1"
            data-tally-auto-close="0"
            className="mt-6 px-5 py-2 text-[11px] tracking-[0.2em] uppercase border border-foreground/15 text-foreground/50 hover:text-foreground/80 hover:border-foreground/30 transition-all duration-300"
          >
            Vouch for James
          </button>
        </motion.div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {references.map((ref, i) => renderCard(ref, i))}
        </div>
      </main>
    </div>
  );
}
