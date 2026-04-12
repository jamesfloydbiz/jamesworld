import { Link } from "react-router-dom";

/** Inline link helper — keeps the letter prose clean */
const L = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="underline underline-offset-4 decoration-[hsl(0_0%_100%_/_0.3)] transition-colors duration-300 italic"
    style={{ color: "hsl(0 0% 100% / 0.85)" }}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = "hsl(0 0% 100%)";
      e.currentTarget.style.textDecorationColor = "hsl(0 0% 100% / 0.6)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = "hsl(0 0% 100% / 0.85)";
      e.currentTarget.style.textDecorationColor = "hsl(0 0% 100% / 0.3)";
    }}
  >
    {children}
  </Link>
);

const DearReaderPage = () => {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="w-full px-6 py-3 flex items-center shrink-0">
        <Link to="/">
          <img src="/logo.svg" alt="Logo" className="h-8 w-8 opacity-80" />
        </Link>
      </div>

      {/* Letter */}
      <div className="flex-1 flex justify-center px-6 pt-0 pb-4 overflow-hidden">
        <article
          className="max-w-lg w-full"
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "0.95rem",
            lineHeight: 1.9,
            color: "hsl(0 0% 100% / 0.55)",
            fontWeight: 400,
          }}
        >
          <h1
            className="mb-10"
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "1.15rem",
              fontWeight: 400,
              fontStyle: "italic",
              color: "hsl(0 0% 100% / 0.7)",
            }}
          >
            Dear Reader,
          </h1>

          {/* ── LETTER BODY ── Edit the paragraphs below. Use <L to="/route"> to link words. ── */}

          <p className="mb-6">
            Thank you for your curiosity. This site has gone through many iterations, kind of like myself. I've decided
            to leave it for now, as simple as possible. This is my story, my letter to you, and the links to other
            creative projects.
          </p>

          <p className="mb-6">
            If you're just looking for a summary of me go to <L to="/portfolio">portfolio</L>. It's the clearest view of
            what I do and how I've gotten to now.
          </p>

          <p className="mb-6">
            If you'd like a small look into my heart here are a few <L to="/poems">poems</L> I've written over the past
            years.
          </p>

          <p className="mb-6">
            For my professional journey you can look at my <L to="/resume">resume</L>, and{" "}
            <L to="/references">references.</L>
          </p>

          <p className="mb-6">
            For other <L to="/builds">builds</L>, <L to="/content">content,</L> or
            <L to="/network">socials</L> click on what strikes your fancy.
          </p>
          <p className="mb-6">
            If you're not sure, click <L to="/search">here.</L>.
          </p>

          <p style={{ color: "hsl(0 0% 100% / 0.4)" }}>— James</p>

          {/* ── END LETTER BODY ── */}
        </article>
      </div>
    </div>
  );
};

export default DearReaderPage;
