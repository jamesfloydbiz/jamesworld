

# Checklist: Site Cleanup & Refinements

## Tasks (in order)

### 1. Remove SearchAssistant chat widget from all pages
- Delete `src/components/ui/SearchAssistant.tsx`
- Remove its import and `<SearchAssistant />` from `App.tsx`

### 2. Remove chat from Dear Reader page
- The Dear Reader page doesn't have its own chat — this is handled by task 1 (the global SearchAssistant widget)

### 3. Delete /ops redirect route
- Remove `<Route path="/ops" element={<Navigate to="/builds" replace />} />` from `App.tsx`
- The `/ops` route only exists as a redirect; no other files link to `/ops` (the image paths `/ops-images/` are asset paths, not routes)

### 4. Delete /story page and remove all references
- Delete `src/pages/StoryPage.tsx`
- Remove its import and route from `App.tsx`
- Remove "Story" entries from navigation menus in: `Index.tsx`, `WalkwayHeader.tsx`, `PortfolioPage.tsx`, `MainMenu.tsx`, `MapPage.tsx`, `ResumePage.tsx`

### 5. Replace landing page with Dear Reader page
- Change the `/` route to render `DearReaderPage` instead of `LandingPage`
- Remove `/dear-reader` route (now redundant)
- Remove `LandingPage` import from `App.tsx` (can delete `LandingPage.tsx` file too)
- Update the logo `<Link to="/">` on DearReaderPage — it already points to `/`, so it will refresh/return home correctly

### 6. Make logo link to `/` across all pages
- The logo already links to `/` on most pages. Since `/` is now the Dear Reader page, this is automatically correct. Verify `SearchPage.tsx` logo is a `<Link to="/">` (currently just an `<img>`, needs wrapping).

### 7. Add /letter as a card on BuildsPage
- Add a new entry to the `automations` array: title "Letter to James", description about the interactive AI letter, link `/letter`, internal

### 8. Italicize all links on Dear Reader page
- Add `fontStyle: "italic"` to the `<L>` component

### 9. Split typewriter text on /search into two paragraphs
- First paragraph: "Welcome to James Floyd's World."
- Second paragraph: "Ask for what you're wondering here, or start with scrolling his portfolio"

### 10. Add glow effects moving from page edges to search bar
- The glow orbs already exist but are local to the search bar container. Enhance them to originate from page edges (use `position: fixed` orbs that drift inward toward center)

## Technical Details
- ~10 files touched, mostly small edits
- No database or edge function changes
- No new dependencies

