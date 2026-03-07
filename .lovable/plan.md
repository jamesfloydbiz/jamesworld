

## Blueprints Page — Black & White Side-View Shelf

### What changes

**1. Recolor all SVG illustrations to black and white only**
Strip all color (browns, pinks, greens, blues). Use only white, grays, and black — matching the site's museum palette. Strokes in white/light gray, fills in dark gray/black.

**2. Redraw illustrations from a horizontal side-view perspective**
Everything viewed straight-on as if you're standing in front of the shelf at eye level:

- **Record Player**: Side profile — you see the edge of the turntable, the platter as a thin horizontal line, the tonearm sticking up, the cabinet edge. Not a top-down view.
- **Books**: Already correct (spines facing out) — just recolor to grayscale.
- **Blueprint Scroll**: A rolled-up scroll lying on its side, viewed from the end so you see the circular cross-section, with the edge of the paper visible.
- **Health (bottles + bowl)**: Side-view silhouettes — bottles with labels as flat rectangles, bowl seen from the side (half-circle). All grayscale.
- **Piggy Bank**: Side profile silhouette — classic piggy shape in white/gray outline on black.

**3. Objects sit flush on the shelf**
Ensure every SVG's bottom edge aligns with the shelf plank. No floating. Objects have weight — items rest on the baseline of each SVG's viewBox.

**4. Shelf planks go grayscale**
Replace the brown wood gradient with a subtle gray gradient (consistent with the museum aesthetic).

### File changes
- `src/pages/BlueprintsPage.tsx` — rewrite all 5 SVG components + shelf plank styles

