import { Link } from "react-router-dom";

/** Inline link helper — keeps the letter prose clean */
const L = ({ to, children }: { to: string; children: React.ReactNode }) => (
  <Link
    to={to}
    className="underline underline-offset-4 decoration-[hsl(0_0%_100%_/_0.3)] transition-colors duration-300"
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Logo */}
      <div className="w-full px-6 py-5 flex items-center">
        <Link to="/">
          <img src="/logo.svg" alt="Logo" className="h-10 w-10 opacity-80" />
        </Link>
      </div>
      <div className="w-full" style={{ height: "1px", background: "hsl(0 0% 100% / 0.12)" }} />

      {/* Letter */}
      <div className="flex-1 flex justify-center px-6 py-16 md:py-24">
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
            Thank you for your curiosity. This site has gone through many iterations, kind of like myself. For now, I've
            decided to leave it as simple as possible. This is my story, my letter to you, and the links to other
            creative projects.
          </p>
          <p className="mb-6">
            My name is James Floyd. I am a curious man, and one of depth. My goals are focused only on the moment I am
            in, and that has led me down the path you can see on my <L to="/portfolio">newspaper</L>.
          </p>

          <p className="mb-6">
            My foremost value is living with my heart out. Said differently, to bear my whole soul in every endeavor. If
            you'd like a small look into that soul here are a few <L to="/poems">poems</L> I have written over the past
            years.
          </p>

          <p className="mb-6">
            I find meaning in preventing the problems I overcome for the people of the world, and future generations. I
            believe that businesses are the best way to do that while providing for one's life as you do that work.
          </p>
          <p className="mb-6">
            I have realized what makes this journey enjoyable is the people around me. On the
            <L to="/references"> references</L> page you can see what people say about me.
          </p>
          <p className="mb-6">
            For other <L to="/builds">builds</L>, <L to="/content">content,</L> or
            <L to="/network">socials</L> click on what strikes your fancy.
          </p>
          <p className="mb-6">
            Click here to <L to="/search">search</L> a database about me.
          </p>

          <p style={{ color: "hsl(0 0% 100% / 0.4)" }}>— James</p>

          {/* ── END LETTER BODY ── */}
        </article>
      </div>
    </div>
  );
};

export default DearReaderPage;
