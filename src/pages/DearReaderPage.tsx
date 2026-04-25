import { Link } from "react-router-dom";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

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
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="w-full px-6 py-2 flex items-center shrink-0">
        <img src="/logo.svg" alt="JF monogram" className="h-8 w-8 opacity-80" />
      </div>

      {/* Letter */}
      <div className="flex-1 flex justify-center px-6 pt-0 pb-4 overflow-hidden">
        <article
          className="max-w-lg w-full"
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "0.88rem",
            lineHeight: 1.75,
            color: "hsl(0 0% 100% / 0.55)",
            fontWeight: 400,
          }}
        >
          <h1
            className="mb-3"
            style={{
              fontFamily: "'Lora', serif",
              fontSize: "1.1rem",
              fontWeight: 400,
              fontStyle: "italic",
              color: "hsl(0 0% 100% / 0.7)",
            }}
          >
            Dear Reader,
          </h1>

          <p className="mb-2">
            Thank you for your curiosity. This site began as a 3d avatar world, then became a 3d museum, and now I've decided to leave
            it as simple as possible.
          </p>
          <p className="mb-2">
            My name is{" "}
            <HoverCard openDelay={0} closeDelay={100}>
              <HoverCardTrigger asChild>
                <span
                  className="cursor-default"
                  style={{ color: "hsl(0 0% 100% / 0.85)" }}
                >
                  James Floyd
                </span>
              </HoverCardTrigger>
              <HoverCardContent
                side="top"
                className="w-36 p-1 border-none bg-black/80 backdrop-blur-sm rounded-lg"
              >
                <img
                  src="/pictures/james-profile.jpeg"
                  alt="James Floyd"
                  className="w-full rounded-md"
                />
              </HoverCardContent>
            </HoverCard>
            . I am a curious man, and one of depth. My goals are focused only on the moment I am
            in, and that has led me down the path you can see on my <L to="/portfolio">newspaper page</L>.
          </p>

          <p className="mb-2">
            My foremost value is living with my heart out. Said differently, to bear my whole soul in every endeavor. If
            you'd like a small look into that soul here are a few <L to="/poems">poems</L> I have written.
          </p>

          <p className="mb-2">
            I find meaning in making the future easier. I am in search of creation that feels like play. I believe that businesses are the best way to do that while
            providing for one's life.
          </p>
          <p className="mb-2">
            I have realized what makes this exploration enjoyable is the people around me. On the
            <L to="/references"> references</L> page you can see what people say about me.
          </p>
          <p className="mb-2">
            If you're curious for some things I've worked on, take a look at my <L to="/projects">projects</L>, or <L to="/builds">builds</L>.
            If you want to get to know me virtually check out my<L to="/content"> content</L>, <L to="/network">socials</L>, or <L to="/pictures">pictures</L>.
          </p>

          <p className="mt-4" style={{ color: "hsl(0 0% 100% / 0.5)" }}>From my heart,</p>
          <HoverCard openDelay={0} closeDelay={100}>
            <HoverCardTrigger asChild>
              <p className="mb-6 cursor-default font-bold" style={{ color: "hsl(0 0% 100%)" }}>James Floyd</p>
            </HoverCardTrigger>
            <HoverCardContent
              side="top"
              className="w-44 p-1 border-none bg-black/80 backdrop-blur-sm rounded-lg"
            >
              <img
                src="/pictures/james-formal.jpeg"
                alt="James Floyd"
                className="w-full rounded-md"
              />
            </HoverCardContent>
          </HoverCard>
        </article>
      </div>

      {/* Preload hover images */}
      <div className="hidden">
        <img src="/pictures/james-profile.jpeg" alt="" />
        <img src="/pictures/james-formal.jpeg" alt="" />
      </div>
    </div>
  );
};

export default DearReaderPage;
