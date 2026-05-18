import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, X } from 'lucide-react';
import { WalkwayHeader } from '@/components/walkway/WalkwayHeader';
import { useKeyboardScroll } from '@/hooks/useKeyboardScroll';
import { PageMeta } from '@/components/PageMeta';
import substackData from '@/data/substack-posts.json';

type Post = {
  title: string;
  link: string;
  date: string;
  displayDate: string;
  subtitle: string;
  excerpt: string;
  bodyHtml: string;
  coverImage: string | null;
};

const posts: Post[] = (substackData as { posts: Post[] }).posts || [];

const WritingPage = () => {
  useKeyboardScroll();
  const [openPost, setOpenPost] = useState<Post | null>(null);

  // ESC to close, and lock page scroll while the modal is open.
  useEffect(() => {
    if (!openPost) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenPost(null);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openPost]);

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
            Essays, letters, and updates. Click any post to read here, or open the original on{' '}
            <a
              href="https://jamesfloyd.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-4 hover:text-foreground transition-colors"
            >
              Substack
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
                <button
                  type="button"
                  onClick={() => setOpenPost(post)}
                  className="group block w-full text-left"
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
                    Read full post →
                  </span>
                </button>
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

      {/* ── Full-post reader modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {openPost && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpenPost(null)}
          >
            {/* Close button — fixed top-right */}
            <button
              type="button"
              onClick={() => setOpenPost(null)}
              aria-label="Close post"
              className="fixed top-6 right-6 z-10 p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.article
              role="dialog"
              aria-modal="true"
              aria-labelledby="post-title"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="post-modal mx-auto px-6 md:px-8 py-16 md:py-24 max-w-[720px] text-foreground"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="mb-10">
                <p
                  className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-3"
                  style={{ fontFamily: "'DM Mono', monospace" }}
                >
                  {openPost.displayDate}
                </p>
                <h1
                  id="post-title"
                  className="text-3xl md:text-5xl leading-tight mb-3"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {openPost.title}
                </h1>
                {openPost.subtitle && (
                  <p
                    className="text-lg md:text-xl italic text-muted-foreground"
                    style={{ fontFamily: "'EB Garamond', serif" }}
                  >
                    {openPost.subtitle}
                  </p>
                )}
              </header>

              {/* Substack body. Rendered with dangerouslySetInnerHTML because
                  the source is our own RSS pull (Substack escapes its HTML
                  and we sanitize at build time). post-body class scopes the
                  typography in src/index.css. */}
              <div
                className="post-body"
                style={{ fontFamily: "'EB Garamond', serif" }}
                dangerouslySetInnerHTML={{ __html: openPost.bodyHtml }}
              />

              <footer className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <a
                  href={openPost.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 border border-border text-sm tracking-wide hover:border-foreground transition-colors"
                >
                  Read on Substack <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={() => setOpenPost(null)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close
                </button>
              </footer>
            </motion.article>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WritingPage;
