// Shared character state for smooth camera following
// This avoids the jitter from throttled Zustand updates

export const characterState = {
  position: [0, 0, 0] as [number, number, number],
  rotation: 0,
};
