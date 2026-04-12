import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/store/gameStore";

interface WalkwayHeaderProps {
  title: string;
}

export function WalkwayHeader({ title }: WalkwayHeaderProps) {
  const navigate = useNavigate();
  const { restoreHubState, setIsTransitioning } = useGameStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleBackToHub = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      restoreHubState();
      setIsTransitioning(false);
      navigate("/");
    }, 300);
  };

  const menuItems = [
    { label: "Portfolio", path: "/portfolio" },
    { 
      label: "Projects", 
      path: "/projects",
      subItems: [
        { label: "Portfolio", path: "/portfolio" },
        { label: "Resume", path: "/resume" },
        { label: "References", path: "/references" }
      ]
    },
    { 
      label: "Content", 
      path: "/content",
      subItems: [
        { label: "Poems", path: "/poems" },
        { label: "Memories", path: "/pictures" }
      ]
    },
    { label: "Network", path: "/network" },
    { label: "Blueprints", path: "/blueprints" },
  ];

  return (
    <>
      <motion.header
        className="walkway-header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Persistent logo - top left corner */}
        <motion.button
          onClick={handleBackToHub}
          className="absolute top-4 left-6 w-8 h-8 opacity-60 hover:opacity-100 transition-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.3 }}
          aria-label="Return to gallery"
        >
          <img src="/logo.svg" alt="James Floyd logo - return to home" className="w-full h-full" />
        </motion.button>

        {/* Menu button - subtle positioning */}
        <motion.button
          className="absolute top-4 right-6 text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40 hover:text-foreground/80 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Menu
        </motion.button>
      </motion.header>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <nav className="text-center">
              <ul className="space-y-6">
                {menuItems.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="flex flex-col items-center"
                  >
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(item.path);
                      }}
                      className="text-2xl tracking-widest uppercase hover:text-muted-foreground transition-colors"
                    >
                      {item.label}
                    </button>
                    <AnimatePresence>
                      {item.subItems && hoveredItem === item.label && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="py-2 space-y-4 mt-2 flex flex-col items-center">
                            {item.subItems.map(sub => (
                              <button
                                key={sub.label}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpen(false);
                                  navigate(sub.path);
                                }}
                                className="text-[1.1rem] tracking-wider uppercase text-muted-foreground/60 hover:text-foreground transition-colors"
                              >
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: menuItems.length * 0.05 }}
                  className="pt-6"
                >
                  <button
                    onClick={handleBackToHub}
                    className="text-xl tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to Gallery
                  </button>
                </motion.li>
              </ul>
              <button
                onClick={() => setMenuOpen(false)}
                className="mt-12 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
export function WalkwayHeader({ title }: WalkwayHeaderProps) {
  const navigate = useNavigate();
  const { scrollProgress, setScrollProgress, restoreHubState, setIsTransitioning } = useGameStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Track scroll progress
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(1, scrollTop / docHeight) : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [setScrollProgress]);

  const handleBackToHub = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      restoreHubState();
      setIsTransitioning(false);
      navigate("/");
    }, 300);
  };

  const menuItems = [
    { label: "Portfolio", path: "/portfolio" },
    { 
      label: "Projects", 
      path: "/projects",
      subItems: [
        { label: "Portfolio", path: "/portfolio" },
        { label: "Resume", path: "/resume" },
        { label: "References", path: "/references" }
      ]
    },
    { 
      label: "Content", 
      path: "/content",
      subItems: [
        { label: "Poems", path: "/poems" },
        { label: "Memories", path: "/pictures" }
      ]
    },
    { label: "Network", path: "/network" },
    { label: "Blueprints", path: "/blueprints" },
  ];

  return (
    <>
      <motion.header
        className="walkway-header"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Persistent logo - top left corner */}
        <motion.button
          onClick={handleBackToHub}
          className="absolute top-4 left-6 w-8 h-8 opacity-60 hover:opacity-100 transition-opacity"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.3 }}
          aria-label="Return to gallery"
        >
          <img src="/logo.svg" alt="James Floyd logo - return to home" className="w-full h-full" />
        </motion.button>

        {/* Menu button - subtle positioning */}
        <motion.button
          className="absolute top-4 right-6 text-[10px] tracking-[0.2em] uppercase text-muted-foreground/40 hover:text-foreground/80 transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Menu
        </motion.button>

        {/* Two-line track zone */}
        <div className="absolute bottom-0 left-0 right-0">
          {/* Top boundary line */}
          <div className="walkway-rail-top" />
          
          {/* Track zone - character and doorway live here */}
          <div className="relative h-8">
            {/* Portal entrance arch - centered vertically between the two lines */}
            <motion.div
              className="absolute top-1/2 -translate-y-1/2 left-[2%] w-4 h-6 border border-foreground/15 rounded-t-full"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              style={{ transformOrigin: "center" }}
            />
            
            {/* Character on the track */}
            <WalkwayCharacter progress={scrollProgress} />
          </div>
          
          {/* Bottom rail */}
          <div className="walkway-rail" />
        </div>
      </motion.header>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/95 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <nav className="text-center">
              <ul className="space-y-6">
                {menuItems.map((item, i) => (
                  <motion.li
                    key={item.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onMouseEnter={() => setHoveredItem(item.label)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className="flex flex-col items-center"
                  >
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        navigate(item.path);
                      }}
                      className="text-2xl tracking-widest uppercase hover:text-muted-foreground transition-colors"
                    >
                      {item.label}
                    </button>
                    <AnimatePresence>
                      {item.subItems && hoveredItem === item.label && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="py-2 space-y-4 mt-2 flex flex-col items-center">
                            {item.subItems.map(sub => (
                              <button
                                key={sub.label}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMenuOpen(false);
                                  navigate(sub.path);
                                }}
                                className="text-[1.1rem] tracking-wider uppercase text-muted-foreground/60 hover:text-foreground transition-colors"
                              >
                                {sub.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                ))}
                <motion.li
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: menuItems.length * 0.05 }}
                  className="pt-6"
                >
                  <button
                    onClick={handleBackToHub}
                    className="text-xl tracking-widest uppercase text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Back to Gallery
                  </button>
                </motion.li>
              </ul>
              <button
                onClick={() => setMenuOpen(false)}
                className="mt-12 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Close
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}