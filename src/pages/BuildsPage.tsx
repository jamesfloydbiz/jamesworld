import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { ExternalLink } from 'lucide-react';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// For jsDelivr CDN, replace with: https://cdn.jsdelivr.net/gh/[username]/[repo]@main
const IMAGE_BASE_URL = '';

const automations = [
  {
    title: 'JamesFloyds.World V2',
    description: 'The original interactive 3D museum experience — a navigable world built in WebGL with character movement and spatial sections.',
    status: 'Archive',
    cta: 'Explore',
    link: '/museum',
    external: false,
  },
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
    images: [
      '/ops-images/youtube_most_viewed_vids_workflow.png',
      '/ops-images/most_viewed_yt_vids_sheets.png',
    ],
  },
  {
    title: 'Network Automation',
    description: 'An AI Agent that chats with someone, gets to know them, then saves their information to a spreadsheet database. After that there is a second Agent workflow triggered by new additions or changes to the database. That second agent emails me introduction suggestions based on the data points.\n\nTLDR: Boardy AI before it existed.',
    status: 'Active',
    images: [
      '/ops-images/AI_Auto_Intro_1.png',
      '/ops-images/AI_Auto_Intro2.png',
      '/ops-images/AI_Auto_Intro_3.png',
    ],
  },
  {
    title: 'YT Video to Blog',
    description: "If it's on video, it might as well be a blog",
    status: 'Booming',
    images: [
      '/ops-images/Video_to_Blog.png',
      '/ops-images/Video_to_Blog_2.png',
      '/ops-images/Video_to_Blog_3.png',
    ],
  },
  {
    title: 'Multi-Agent Blog Team',
    description: 'An experiment in multi-agent workflows that produces SEO designed blogs with QA',
    status: 'Active',
    images: [
      '/ops-images/Multi-Agent1.png',
      '/ops-images/MultiAgent2.png',
      '/ops-images/MultiAgent3.png',
      '/ops-images/MultiAgent4.png',
    ],
  },
  {
    title: 'Organic YouTube to Calls Booked Dashboard',
    description: 'A dashboard that shows what videos correlate to site views, calls booked, etc. Remember, measurement is the first step to improvement.',
    status: 'Active',
    images: [
      '/ops-images/YT_Video_Views_Dashboard2.png',
      '/ops-images/YT_Video_Views_Dashboard3.png',
      '/ops-images/YT_Video_Views_Dashboard4.png',
    ],
  },
  {
    title: 'AI Coded Calculators',
    description: 'Calculators coded with Claude Code for internal use at BetterWealth',
    status: 'Active',
    cta: 'View Calculators',
    link: 'https://jamesfloydl.github.io/BWCalculators/',
    external: true,
  },
];

const ImageGallery = ({ images, title }: { images: string[]; title: string }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-thin">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={`${IMAGE_BASE_URL}${img}`}
            alt={`${title} workflow screenshot ${idx + 1}`}
            className="h-20 w-auto rounded border border-border cursor-pointer hover:border-foreground transition-colors flex-shrink-0"
            loading="lazy"
            onClick={() => setSelectedImage(img)}
          />
        ))}
      </div>
      
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={`${IMAGE_BASE_URL}${selectedImage}`}
            alt={`${title} workflow detail view`}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </>
  );
};

const BuildsPage = () => {
  useKeyboardScroll();
  return (
    <div className="min-h-screen bg-background">
      <WalkwayHeader title="Builds" />
      
      <main className="pt-[140px] px-6 md:px-8 pb-24">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <h1 className="text-3xl md:text-4xl tracking-widest uppercase mb-4">Builds</h1>
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
                      : automation.status === 'Archive'
                      ? 'bg-secondary/50 text-foreground/50'
                      : 'bg-secondary text-foreground'
                  }`}>
                    {automation.status}
                  </span>
                </div>
                
                {'images' in automation && automation.images && (
                  <ImageGallery images={automation.images} title={automation.title} />
                )}
                
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed whitespace-pre-line">
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
                
                {'link' in automation && automation.link && !automation.external && (
                  <InternalLink to={automation.link} label={automation.cta || 'View'} />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default BuildsPage;
