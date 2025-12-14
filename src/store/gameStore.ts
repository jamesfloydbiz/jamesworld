import { create } from 'zustand';

export type Section = 'Story' | 'Media' | 'Projects' | 'Network' | 'Blueprints';

interface PortalData {
  id: string;
  title: string;
  section: Section;
  route: string;
  framePosition: [number, number, number];
  circlePosition: [number, number, number];
  order: number;
}

interface GameState {
  // Character position
  characterPosition: [number, number, number];
  characterRotation: number;
  setCharacterPosition: (pos: [number, number, number]) => void;
  setCharacterRotation: (rot: number) => void;

  // Camera state
  cameraLocked: boolean;
  lockedTargetPosition: [number, number, number] | null;
  setCameraLocked: (locked: boolean, target?: [number, number, number]) => void;

  // Active portal
  activePortal: PortalData | null;
  setActivePortal: (portal: PortalData | null) => void;

  // Transition state
  isTransitioning: boolean;
  setIsTransitioning: (transitioning: boolean) => void;

  // Menu state
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;

  // Hub state preservation
  lastHubPosition: [number, number, number];
  lastHubRotation: number;
  saveHubState: () => void;
  restoreHubState: () => void;

  // Portal data
  portals: PortalData[];

  // Scroll progress for walkway
  scrollProgress: number;
  setScrollProgress: (progress: number) => void;
}

const initialPortals: PortalData[] = [
  {
    id: 'story',
    title: 'Story',
    section: 'Story',
    route: '/story',
    framePosition: [-6.8, 2, -6],
    circlePosition: [-4, 0.01, -6],
    order: 1,
  },
  {
    id: 'media',
    title: 'Media',
    section: 'Media',
    route: '/media',
    framePosition: [6.8, 2, -6],
    circlePosition: [4, 0.01, -6],
    order: 2,
  },
  {
    id: 'projects',
    title: 'Projects',
    section: 'Projects',
    route: '/projects',
    framePosition: [-6.8, 2, -16],
    circlePosition: [-4, 0.01, -16],
    order: 3,
  },
  {
    id: 'network',
    title: 'Network',
    section: 'Network',
    route: '/network',
    framePosition: [6.8, 2, -16],
    circlePosition: [4, 0.01, -16],
    order: 4,
  },
  {
    id: 'blueprints',
    title: 'Blueprints',
    section: 'Blueprints',
    route: '/blueprints',
    framePosition: [0, 2, -31.8],
    circlePosition: [0, 0.01, -28],
    order: 5,
  },
];

export const useGameStore = create<GameState>((set, get) => ({
  characterPosition: [0, 0, 0],
  characterRotation: Math.PI,
  setCharacterPosition: (pos) => set({ characterPosition: pos }),
  setCharacterRotation: (rot) => set({ characterRotation: rot }),

  cameraLocked: false,
  lockedTargetPosition: null,
  setCameraLocked: (locked, target) => set({ 
    cameraLocked: locked, 
    lockedTargetPosition: target || null 
  }),

  activePortal: null,
  setActivePortal: (portal) => set({ activePortal: portal }),

  isTransitioning: false,
  setIsTransitioning: (transitioning) => set({ isTransitioning: transitioning }),

  menuOpen: false,
  setMenuOpen: (open) => set({ menuOpen: open }),

  lastHubPosition: [0, 0, 0],
  lastHubRotation: Math.PI,
  saveHubState: () => {
    const { characterPosition, characterRotation } = get();
    set({ 
      lastHubPosition: characterPosition, 
      lastHubRotation: characterRotation 
    });
  },
  restoreHubState: () => {
    const { lastHubPosition, lastHubRotation } = get();
    set({ 
      characterPosition: lastHubPosition, 
      characterRotation: lastHubRotation,
      cameraLocked: false,
      lockedTargetPosition: null,
      activePortal: null,
    });
  },

  portals: initialPortals,

  scrollProgress: 0,
  setScrollProgress: (progress) => set({ scrollProgress: progress }),
}));
