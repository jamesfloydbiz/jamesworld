

## Add Rich Terrain to the Map — "Rained on once"

### What changes

**Single file**: `src/pages/MapPage.tsx`

All existing structure (landmarks, compass, parallax, logo transition, navigation) stays untouched. We're adding terrain density and atmosphere to the SVG.

### 1. SVG Filter Definitions — expand `<defs>`

Add three new filters/elements:

- **Paper grain filter** (`feTurbulence` + `feColorMatrix` + `feBlend`) — applied as a full-map overlay rect at ~0.06 opacity in sepia tones, not white. Gives the entire map rectangle a worn-paper feel.
- **Vignette** — radial gradient from transparent center to black edges, applied as a rect over the map interior. Subtle — `opacity: 0.4`. Makes the edges feel like they curl inward.
- **Additional hatching patterns** — a second cross-hatch pattern at a different angle for forest/terrain variation.

### 2. Contour Lines — dramatically expand `ContourLines`

Current: 3 ellipse clusters + 4 wandering paths at `opacity={0.12}` in `#4A5D23`.

Replace with: **8-10 contour clusters** spread across the full map, using `#2a2a1a` (dark olive-sepia) instead of `#4A5D23`. Varying stroke widths (0.4–0.8), varying opacities (0.08–0.18). Add irregularity — use `<path>` with organic curves instead of perfect ellipses for some clusters. More wandering cross-map contour lines (6-8 total) at different elevations.

### 3. Terrain Hatching — expand `TerrainHatching`

Current: 5 diagonal-line clusters at `opacity={0.06}`.

Replace with: **12-15 hatching clusters** in `#1a1a0e`, including:
- Hill marks (short curved strokes like `⌢` repeated in clusters — classic cartographic hill shading)
- Forest dot clusters (small circles, 1-2px, scattered in groups of 8-15 near the Projects/pine landmark area and scattered elsewhere)
- Ridge line marks (short parallel dashes along elevation lines)
- Cross-hatching in lower-elevation areas (two overlapping diagonal patterns)

### 4. Trail Paths — expand `TrailPaths`

Current: 1 dashed trail + 1 faint river.

Replace with: **Faint trail paths connecting all 5 landmarks** — dashed/dotted lines in `#2a2a1a` at low opacity (0.08-0.12). Trails should meander organically (cubic bezier curves), not straight lines. Keep the existing river but add a small tributary fork. Trail style: `strokeDasharray="3 5"` for a worn, intermittent path look.

### 5. Vignette overlay

A `<rect>` filled with a radial gradient: transparent at center, fading to `#000000` at edges. Positioned inside the map border. `opacity: 0.35`.

### 6. Paper texture overlay rect

A full-map `<rect>` with the `feTurbulence` paper-grain filter applied, using sepia-tinted noise (`#2a2a1a` color matrix) at very low opacity. Sits above terrain but below landmarks.

### 7. Color corrections

- Contour lines: `#4A5D23` → `#2a2a1a`
- Hatching strokes: `#3D2817` → `#1a1a0e`
- Trail paths: `#4A5D23` → `#2a2a1a`
- River keeps its blue-gray but drops to lower opacity
- All icons and labels stay exactly as they are

### Layer order (bottom to top)

1. Background hatching fill
2. Vignette radial gradient
3. Contour lines
4. Terrain hatching (hills, forests, ridges)
5. Trail paths
6. Paper grain texture overlay
7. Elevation marks
8. Map border
9. Title cartouche
10. Landmarks + tooltips
11. Compass rose

