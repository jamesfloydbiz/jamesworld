import { motion } from 'framer-motion';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';
import { PageMeta } from '@/components/PageMeta';
import substackData from '@/data/substack-posts.json';
import { ExternalLink } from 'lucide-react';

type Post = {
  title: string;
  link: string;
  date: string;
  displayDate: string;
  subtitle: string;
  excerpt: string;
  coverImage: string | null;
};

const posts: Post[] = (substackData as { posts: Post[] }).posts || [];

const WritingPage = () => {
  useKeyboardScroll();

  return (
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Writing"
        description="James Floyd's essays, letters, and updates — mirrored from jamesfloyd.substack.com so every post is searchable here too."
        path="/writing"
      />
      <WalkwayHeader title="Writing" />

      <main className="pt-16 px-6 md:px-8 pb-24">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <div className="flex items-baseline gap-4 mb-4">
            <h1 className="text-3xl md:text-4xl tracking-widest uppercase">Writing</h1>
            <span className="px-3 py-1 bg-secondary text-sm">{posts.length} posts</span>
          </div>
          <p className="text-muted-foreground mb-12 text-sm md:text-base">
            Essays, letters, and updates. Originals live on{' '}
            <a
              href="https://jamesfloyd.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              jamesfloyd.substack.com
            </a>
            . Auto-mirrored daily.
          </p>

          <ul className="space-y-8">
            {posts.map((post, index) => (
              <motion.li
                key={post.link}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.05, duration: 0.5 }}
                className="border-b border-border pb-8 last:border-b-0"
              >
                <a
                  href={post.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <h2
                    className="text-xl md:text-2xl mb-2 group-hover:underline underline-offset-4"
                    style={{ fontFamily: "'EB Garamond', serif" }}
                  >
                    {post.title}
                  </h2>
                  <p
                    className="text-xs tracking-widest uppercase text-muted-foreground mb-3"
                    style={{ fontFamily: "'DM Mono', monospace" }}
                  >
                    {post.displayDate}
                    {post.subtitle ? ` · ${post.subtitle}` : ''}
                  </p>
                  <p
                    className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3"
                    style={{ fontFamily: "'EB Garamond', serif" }}
                  >
                    {post.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-muted-foreground group-hover:text-foreground transition-colors">
                    Read on Substack <ExternalLink className="w-3 h-3" />
                  </span>
                </a>
              </motion.li>
            ))}
          </ul>

          <div className="mt-16 text-center">
            <a
              href="https://jamesfloyd.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border text-sm tracking-wide hover:border-foreground transition-colors"
            >
              Subscribe on Substack <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default WritingPage;
