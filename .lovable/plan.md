

## Blueprints Page — 2D Bookshelf Redesign

Transform the current list-based layout into an illustrated 2D bookshelf scene using SVG/CSS illustrations. Each category becomes a clickable object on the shelf.

### Visual Concept

A dark wooden bookshelf (2-3 shelves) rendered with CSS/SVG against the black background. Objects sit on the shelves:

1. **Music** — A record player with a vinyl disc. Hover lifts the tonearm slightly. Click opens Spotify link.
2. **Books** — A row of book spines with varied heights/widths, labeled with short titles. Click expands the reading list.
3. **Mental Models** — A rolled-up blueprint with a visible edge, pinned/clipped. Click opens X link.
4. **Health** — Small supplement bottles + a bowl of greens. Click expands the health philosophy.
5. **Money** — A piggy bank. Click expands the money roadmap.

### Interaction

- Clicking an object opens a detail panel below the shelf (or as an overlay card) with the existing content — same data, just new presentation.
- Objects have subtle hover states (slight scale, glow, or label appear).
- On mobile, the shelf scrolls horizontally or stacks into two rows.

### Implementation

- All illustrations built with inline SVG + Tailwind styling (no external assets needed).
- Each shelf item is a component with hover/click animations via framer-motion.
- The shelf structure is CSS (wood-grain gradient borders, horizontal lines for shelves).
- Keep WalkwayHeader, remove the joke CTA/modal.
- Detail panel uses the same AnimatePresence expand pattern.

### Structure

```
BlueprintsPage.tsx
├── WalkwayHeader
├── Shelf Scene (CSS/SVG)
│   ├── Top Shelf: Record Player + Books
│   ├── Bottom Shelf: Blueprint scroll + Health items + Piggy Bank
│   └── Each item = clickable SVG group
├── Detail Panel (expands below shelf on click)
│   └── Title, description, optional link
└── Subtle closing line (no joke CTA)
```

### File Changes

- `src/pages/BlueprintsPage.tsx` — full rewrite with shelf layout and SVG illustrations

