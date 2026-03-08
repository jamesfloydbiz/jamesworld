

## Blueprints Page — Three Illustration Redesigns + Shelf Fix

### Changes to `src/pages/BlueprintsPage.tsx`

**1. Record Player → Gramophone (ref: image-19)**
Replace the flat turntable with a gramophone line drawing: rectangular base, horn/bell curving upward, tonearm connecting base to horn. Same thin white stroke style. Keep the hover music note animation (♪ floating up from the horn).

**2. Health → Fruit Basket (ref: image-20)**
Replace bottles + bowl with a woven basket outline containing recognizable line-art produce: apple (circle + stem + leaf), banana (crescent), broccoli (floret tree shape), plus a few round shapes for variety. Basket has a handle arc and cross-hatched weave lines. All resting on the shelf baseline.

**3. Mental Models → Swinging Sticks Perpetual Motion Machine (ref: image-21)**
Replace the node network with a kinetic sculpture: a flat rectangular base, two thin stick/arm elements pivoting from a central point, swinging in opposite arcs. Use CSS keyframe animation to continuously rotate both arms in a smooth perpetual loop — one arm swings clockwise while the other swings counter-clockwise, creating the mesmerizing pendulum effect. No hover trigger needed — runs automatically on load.

**4. Piggy Bank baseline fix**
Ensure viewBox and leg coordinates place hooves flush at the very bottom of the SVG so the piggy sits directly on the shelf line.

**5. Verify all items rest on shelf**
After implementation, take screenshots to confirm every object touches the shelf plank.

### Files
- `src/pages/BlueprintsPage.tsx` — rewrite RecordPlayer, HealthItems, NodeNetwork SVGs
- `src/index.css` — add swinging-sticks keyframe animation

