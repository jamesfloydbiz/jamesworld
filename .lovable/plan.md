

## Make the Map Feel Like Weathered Paper — Tactile & 3D

### The Vision

The reference images show warm parchment tones, ink staining, crease marks, and edge wear. The current map is dark SVG on black. The core shift: give the map rectangle a **warm parchment base fill** so terrain marks read as ink-on-paper rather than faint marks on void. Then add aging artifacts (stains, creases, edge darkening) and replace the flat parallax with a **CSS perspective tilt** that makes the map lean away from the cursor like paper held in hand.

### Changes — `src/pages/MapPage.tsx`

**1. Parchment base fill**

Replace the black void inside the map border with a warm parchment rectangle: `#d4c5a0` at full opacity (or a linear gradient from `#d4c5a0` to `#c4b48a` for slight unevenness). This single change transforms everything — all existing terrain marks, contour lines, hatching, and trails will now read as dark ink on aged paper.

**2. Stain & aging overlays (SVG, no images)**

Add inside `<defs>`:
- A second `feTurbulence` filter (`id="stain"`) with lower `baseFrequency` (~0.008) and high contrast via `feColorMatrix` — produces organic splotch shapes. Apply as a rect overlay in sepia (`#8b7355`) at ~0.15 opacity to simulate water/coffee stains.
- 2-3 radial gradients simulating ring stains (circular, off-center, very faint).
- A few `<path>` crease lines — long, subtle, slightly irregular strokes across the map in `#9e8e6e` at low opacity, as if the paper was folded.

**3. Edge darkening (burn effect)**

Replace the current simple radial vignette with a **rectangular vignette** — four linear gradients (top, bottom, left, right) fading from `#6b5a3a` to transparent, creating darkened edges like aged paper that's browned at the margins. More authentic than radial.

**4. Boost terrain contrast**

With a light parchment background, the existing terrain strokes (`#2a2a1a`, `#1a1a0e`) will naturally pop much harder. Reduce some opacities slightly (contour lines from 0.28 → 0.2, hatching from 0.12 → 0.1) so they feel like faded ink rather than fresh marker. The river stroke shifts to a deeper blue-brown (`#3a4a4a`).

**5. 3D perspective tilt (paper-in-hand effect)**

Replace the current flat `translate(Xpx, Ypx)` parallax with a **CSS `perspective` + `rotateX/rotateY` transform**. The map tilts *away* from the mouse (inverted — mouse goes right, map tilts left). Implementation:

```
container: perspective: 1200px
SVG wrapper: transform: rotateX(Ydeg) rotateY(Xdeg)
```

Where X/Y are ±3° max, derived from mouse position. Keep the existing `requestAnimationFrame` lerp loop — just change the output from `translate` to `rotateX/rotateY`. This creates a subtle 3D paper-held-by-someone effect with zero performance cost.

**6. Adjust icon/text colors for parchment**

Landmark icons, labels, border, title, compass, and elevation marks shift from `#F5F0E8` (light cream on black) to `#2a2218` (dark ink on parchment). The golden accent `#B8860B` stays. Tooltip backgrounds shift to `rgba(42,34,24,0.85)` with light text.

**7. Grain overlay tuning**

The existing HTML grain overlay (z-30 div) gets a `mixBlendMode: 'multiply'` instead of `'overlay'` to work with the light parchment. Opacity bumped to 0.12 for visible paper texture.

### Layer order (bottom to top)

1. Parchment fill rect
2. Edge-darkening gradient rects (4 sides)
3. Stain overlay rect (feTurbulence splotches)
4. Ring stain circles (2-3)
5. Background hatching fill
6. Contour lines
7. Terrain hatching (hills, forests, ridges)
8. Trail paths + river
9. Crease lines (2-3)
10. Paper grain filter rect
11. Elevation marks
12. Map border
13. Title cartouche
14. Landmarks + tooltips
15. Compass rose

### File

| File | Action |
|---|---|
| `src/pages/MapPage.tsx` | Major edit — parchment base, stain filters, crease marks, 3D tilt, color inversion |

