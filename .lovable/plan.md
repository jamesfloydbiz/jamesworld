

## Blueprints Page — Thin Line Art + Shelf Fix

### Changes

**1. Redraw all SVG illustrations as thin white line art**
Replace every filled shape with `fill="none" stroke="white" strokeWidth` outlines — matching the Tree of Life SVG style on the landing page. Pure wireframe/line-drawing aesthetic. No fills, no grays, just thin white strokes on black.

- **Record Player**: Outline of cabinet edge, platter line, tonearm — all `stroke="white"` or `stroke="hsl(0 0% 60%)"`, no fills
- **Book Spines**: Rectangles as outlines only, text labels in white
- **Blueprint Scroll**: Cylinder outline, paper curl lines only
- **Health Items**: Bottle and bowl outlines, no filled shapes
- **Piggy Bank**: Side profile as a single continuous path outline

**2. Fix vertical alignment — objects sit ON the shelf**
Remove `whileHover={{ y: -4 }}` float and ensure SVG viewBoxes are designed so the bottom edge of every object touches the shelf plank. Use `items-end` with precise viewBox coordinates so objects rest flush against the baseline.

**3. Restore the joke subtitle**
Replace current subtitle ("The inputs and frameworks. Click to explore.") with the original joke. Since the exact text was lost in rewrites and you left the field blank — could you type it here? If it was something like "A personal operating system for the barely functional" or similar, let me know and I'll use it verbatim.

**4. Keep shelf planks as thin white lines**
Replace the gradient shelf planks with a single thin white horizontal line — consistent with the line-art approach.

### File
- `src/pages/BlueprintsPage.tsx` — rewrite SVG components + shelf styling

