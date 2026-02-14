

## References Page — `/references`

A scrapbook-style testimonials page: clean, spatial, museum-consistent. Placeholder content throughout, ready to swap in real quotes, videos, and images later.

### Layout Concept

A single-column flow with items scattered at varying widths and alignments, evoking a curated scrapbook pinned to a dark wall. Each item has a subtle border and generous whitespace. Items alternate between left-aligned, centered, and right-aligned to break the grid feeling while staying orderly.

Three reference types:
- **Text quote** — name, role/relationship, and quote text
- **Image quote** — placeholder image with overlaid or adjacent quote
- **Video clip** — placeholder video embed area with attribution

### Placeholder Data (~8-10 items)

| Type | Name | Relation | Quote snippet |
|------|------|----------|---------------|
| Text | Placeholder A | Former colleague | "James is the kind of person who..." |
| Video | Placeholder B | Manager | Video testimonial placeholder |
| Image | Placeholder C | Friend | Image with quote overlay |
| Text | Placeholder D | Collaborator | "Working with James taught me..." |
| Video | Placeholder E | Mentor | Video testimonial placeholder |
| Text | Placeholder F | Client | "He brought clarity to..." |
| Image | Placeholder G | Partner | Image with quote |
| Text | Placeholder H | Team lead | "What stands out about James..." |

### File Changes

**1. Create `src/pages/ReferencesPage.tsx`**
- Uses `WalkwayHeader` with title "References"
- Uses `useKeyboardScroll` hook
- Framer Motion staggered entry animations
- Scrapbook layout: items at varying max-widths (`max-w-sm`, `max-w-md`, `max-w-lg`) with alternating alignment (`ml-auto`, `mr-auto`, `mx-auto`)
- Each item wrapped in a bordered container with slight rotation via inline `transform: rotate(Xdeg)` for subtle scrapbook tilt (small values like -1deg to 2deg)
- Text items: quote in italic, name and relation below
- Image items: gray placeholder box (aspect-square or aspect-video) with quote text adjacent
- Video items: dark placeholder box with play icon and attribution

**2. Update `src/App.tsx`**
- Import `ReferencesPage`
- Add route: `<Route path="/references" element={<ReferencesPage />} />`

**3. Update `src/components/walkway/WalkwayHeader.tsx`**
- Add "References" to the `menuItems` array

**4. Update `src/components/ui/MainMenu.tsx`**
- Add "References" menu item

**5. Update `src/pages/Index.tsx`**
- Add "References" to mobile menu if present

### Technical Notes
- No new dependencies needed
- Follows existing page patterns (WalkwayHeader, motion animations, keyboard scroll)
- All content is placeholder — text quotes use generic attribution, image/video slots are styled empty containers
- Subtle CSS rotations on items (alternating -1deg, 0.5deg, 1.5deg, -0.8deg) give the scrapbook feel without clutter
- Monochrome palette consistent with museum theme

