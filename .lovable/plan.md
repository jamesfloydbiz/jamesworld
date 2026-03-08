

## Blueprints Page — Gramophone, Basket & Swinging Sticks Fixes

### 1. Gramophone — horn closer to cabinet, pipe-like neck, shift down

Redraw the horn assembly: replace the curved `Q` path neck with a straighter pipe/tube connecting directly from the top of the cabinet to the horn bell. Shorten the gap between cabinet and horn opening. Shift the whole gramophone down ~4px so it sits more grounded on the shelf.

### 2. Fruit Basket — smaller overall, clearer fruit shapes

- Shrink the basket by tightening the viewBox or scaling coordinates inward (~20% smaller)
- Redraw apple with a more distinct round shape + visible stem/leaf
- Redraw banana as a cleaner crescent arc
- Redraw broccoli with a more recognizable stalk + floret cluster
- Keep all produce peeking above the basket rim

### 3. Swinging Sticks — connect short stick to end of long stick

The real kinetic sculpture has the short arm pivoting from the tip of the long arm (not from the same center). Change the structure so:
- Long arm pivots at the post top (cx=50, cy=40) and rotates 360°
- Short arm pivots from the **end** of the long arm (the tip at the weighted end)
- Nest the short arm's `<g>` transform group **inside** the long arm's `<g>` so it inherits the parent rotation, then applies its own counter-rotation
- This creates the authentic double-pendulum effect where the short stick swings relative to the long stick's endpoint

### Files
- `src/pages/BlueprintsPage.tsx` — update `Gramophone`, `FruitBasket`, `SwingingSticks` SVG components

