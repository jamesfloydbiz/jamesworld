import { Link } from 'react-router-dom';

/** Inline link helper — keeps the letter prose clean */
const L = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="underline underline-offset-4 decoration-[hsl(0_0%_100%_/_0.3)] transition-colors duration-300"
    style={{ color: 'hsl(0 0% 100% / 0.85)' }}
    onMouseEnter={e => {
      e.currentTarget.style.color = 'hsl(0 0% 100%)';
      e.currentTarget.style.textDecorationColor = 'hsl(0 0% 100% / 0.6)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.color = 'hsl(0 0% 100% / 0.85)';
      e.currentTarget.style.textDecorationColor = 'hsl(0 0% 100% / 0.3)';
    }}
  >
    {children}
  </Link>
);

const DearReaderPage = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Logo */}
      <div className="w-full px-6 py-5 flex items-center">
        <Link to="/">
          <img src="/logo.svg" alt="Logo" className="h-10 w-10 opacity-80" />
        </Link>
      </div>
      <div className="w-full" style={{ height: '1px', background: 'hsl(0 0% 100% / 0.12)' }} />

      {/* Letter */}
      <div className="flex-1 flex justify-center px-6 py-16 md:py-24">
        <article
          className="max-w-lg w-full"
          style={{
            fontFamily: "'Lora', serif",
            fontSize: '0.95rem',
            lineHeight: 1.9,
            color: 'hsl(0 0% 100% / 0.55)',
            fontWeight: 400,
          }}
        >
          <h1
            className="mb-10"
            style={{
              fontFamily: "'Lora', serif",
              fontSize: '1.15rem',
              fontWeight: 400,
              fontStyle: 'italic',
              color: 'hsl(0 0% 100% / 0.7)',
            }}
          >
            Dear Reader,
          </h1>

          {/* ── LETTER BODY ── Edit the paragraphs below. Use <L to="/route"> to link words. ── */}

          <p className="mb-6">
            Thank you for being here. This place is less a website and more a
            window — into how I think, what I've built, and where I'm headed.
          </p>

          <p className="mb-6">
            If you're curious about the work, start with the{' '}
            <L to="/portfolio">portfolio</L>. It's the clearest view of what I
            do and why. If you'd rather read, there are{' '}
            <L to="/poems">poems</L> I've written over the years, and longer{' '}
            <L to="/content">essays</L> on things I care about.
          </p>

          <p className="mb-6">
            For the professional path — the roles, the skills, the trajectory —
            there's a <L to="/resume">resume</L>. And for the people who've
            shaped my work, <L to="/references">references</L> that speak to
            that.
          </p>

          <p className="mb-6">
            I think in <L to="/blueprints">systems</L>. I build{' '}
            <L to="/projects">projects</L> that compound. I value{' '}
            <L to="/network">relationships</L> that last. If any of that
            resonates, I'd love to <L to="/letter">hear from you</L>.
          </p>

          <p className="mb-6">
            Take your time. Explore. There's no rush here.
          </p>

          <p style={{ color: 'hsl(0 0% 100% / 0.4)' }}>
            — James
          </p>

          {/* ── END LETTER BODY ── */}
        </article>
      </div>
    </div>
  );
};

export default DearReaderPage;
