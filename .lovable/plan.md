

## Reorganize References Page Layout

The current absolute-positioned clusters create too much empty space and feel scattered. The fix is to replace the cluster/absolute approach with a **CSS Grid layout** that packs items tightly in a two-column arrangement, matching the reference screenshots.

### Layout Structure

Based on the reference images (both your current page screenshots and the scrapbook photo):

- **Two-column grid** using `grid-template-columns` with items spanning 1 or 2 columns
- Items sit close together with small, consistent gaps (around 16-24px)
- No absolute positioning — use grid placement (`grid-column`, `grid-row`) for predictable, tight packing
- Keep the subtle rotations for scrapbook feel
- Items vary in size naturally based on content, not forced min-heights

### Proposed Grid Arrangement

```text
Row 1:  [Text A - left col]          [Image C - right col]
Row 2:  [Video B - spans center/right]
Row 3:  [Text D - left col]          [Text F - right col]
Row 4:  [Video E - left col]         [Text H - right col]
Row 5:  [Image G - left col]         [Text H2 - right col]
```

Items will naturally pack tight because grid handles sizing. Subtle rotations stay. No huge empty gaps.

### Technical Changes

**File: `src/pages/ReferencesPage.tsx`** — Full rewrite of data structure and layout:

- Remove `Cluster` type and absolute positioning
- Change to a flat array of references, each with a `gridArea` or `gridColumn`/`gridRow` assignment
- Replace the cluster container with a single `grid` container: `grid-cols-2`, `gap-4 md:gap-6`
- Each card uses `position: relative` (not absolute), placed via grid properties
- Keep `TextCard`, `ImageCard`, `VideoCard` components but remove absolute positioning from them
- Cards keep their rotation transforms and border styling

