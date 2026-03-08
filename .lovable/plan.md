

## Blueprints Page — Refinements

### Changes to `src/pages/BlueprintsPage.tsx`

**1. Subtitle update**
Change "A personal operating system, allegedly." → "100% foolproof processes to be awesome"

**2. Titles above each icon (always visible)**
Move the title labels from the hover-only bottom position to a permanent label above each SVG illustration. Small uppercase tracking text, always visible (not just on hover).

**3. Detail popups as speech bubbles**
Replace the bottom detail panel with a small bubble that appears to the right or left of the clicked item. Use absolute positioning relative to each item, with a small triangle/arrow pointing at the icon. Alternate left/right based on item position to avoid overflow.

**4. Redraw Record Player — open-lid turntable with animated music notes**
- Top-down-ish view of an open turntable: rectangular base, circular platter with grooves, tonearm resting on the record, lid shown as an angled line behind
- On hover: animate 2-3 small music note paths (♪) floating upward from the platter using framer-motion or CSS keyframe animation

**5. Replace Mental Models icon — brain with connected nodes**
The blueprint scroll doesn't convey "mental models." Replace with a brain outline or a simple network/node diagram (3-4 circles connected by lines) — thin white line art, same style.

**6. Redraw Health bowl — bowl with apple, banana, broccoli**
Replace the abstract greens with recognizable line-art fruit:
- Bowl: same side-view arc
- Apple: small circle with a stem and leaf
- Banana: curved crescent shape
- Broccoli: small tree-like floret shape
All sitting above/in the bowl rim.

**7. Fix Piggy Bank baseline**
Adjust the PiggyBank SVG viewBox so the hooves touch the bottom edge (y=80), ensuring it sits flush on the shelf line. Currently hooves end at y=72 with viewBox height 80 — need to shift the whole drawing down or crop the viewBox.

