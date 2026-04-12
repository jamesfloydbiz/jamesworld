

# Tree Hero Page

## Overview
Create a new `/tree` route with a full-screen hero page built around the existing `tree_gn.glb` model. Two zones: above-ground (black, 3D tree, large "JAMES FLOYD" title) and below-ground (dark brown, SVG root branches terminating in nav nodes).

## Architecture

```text
/tree route
  └─ TreePage.tsx
       ├─ Above-ground zone (100vh, sticky)
       │    ├─ "JAMES FLOYD" — full-width serif headline
       │    └─ R3F Canvas (transparent bg)
       │         └─ tree_gn.glb with slow Y-axis rotation
       ├─ Transition zone (~100px gradient: black → forest green → brown)
       └─ Roots zone (dark brown bg)
            └─ SVG root branches → 6 nav nodes
               Writing, Work, Events, Thinking, Poetry, Contact
```

## Steps

1. **Create `src/pages/TreePage.tsx`**
   - Above-ground section: full viewport, black background, sticky/pinned on initial scroll
   - R3F `<Canvas>` with transparent background, loads `tree_gn.glb` via `useGLTF`, slow auto-rotation on Y-axis (~0.1 rad/s), centered with slight horizontal offset
   - "JAMES FLOYD" in large all-caps serif (Playfair Display already imported), letter-spaced to span viewport width, positioned at top
   - Transition band: CSS gradient from `#000000` → `#1a3a1a` → `#1a0f08` over ~100px
   - Roots zone: dark brown background, SVG with 6 organic root paths of varying thickness, each ending in a circular nav node (warm cream fill, small-caps label)
   - Hover: nodes glow amber with subtle scale-up via CSS transition
   - Scroll: above-ground zone uses `position: sticky` so tree lingers before roots scroll in

2. **Add route in `App.tsx`**
   - `<Route path="/tree" element={<TreePage />} />`

3. **Mobile handling**
   - Tree canvas scales down, "JAMES FLOYD" stays large but font-size reduces
   - Root SVG paths reflow more vertically on narrow screens

## Technical details
- Font: Playfair Display (already imported in index.css)
- 3D: `@react-three/fiber` + `@react-three/drei` (already installed), `useGLTF` + `useFrame` for rotation
- Model path: `/models/tree_gn.glb`
- No navbar, no footer — hero only
- SVG roots hand-drawn with cubic bezier paths, stroke-width tapering via individual path widths
- Nav nodes are `<Link>` elements from react-router positioned over SVG endpoints

