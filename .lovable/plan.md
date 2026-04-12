

# Delete /tree, Create /search Page

## Overview
Remove the `/tree` page and route. Create a new `/search` page: black background, logo top-left, thin white border aesthetic, a typing animation that reads "Welcome to James Floyd's World. Ask for what you're wondering here, or start with scrolling his portfolio", with "portfolio" linked to `/portfolio`. A simple search bar centered below.

## Steps

1. **Delete `src/pages/TreePage.tsx`** and remove the `/tree` route from `App.tsx`

2. **Add Lora font** import to `index.css`:
   `@import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&display=swap');`

3. **Create `src/pages/SearchPage.tsx`**
   - Full black background, no navbar/footer
   - Logo (`/logo.svg`) top-left, small (~40px)
   - Subtle thin white horizontal line below the logo area
   - Centered vertically: welcome text in Lora (light weight, small size) with a typewriter animation that types out the message character by character; "portfolio" is a Link to `/portfolio`
   - Below the text: a minimal search input — white thin border, black background, white text, centered
   - Clean, restrained aesthetic consistent with project philosophy

4. **Add route** `<Route path="/search" element={<SearchPage />} />` in `App.tsx`

## Technical Details
- Typewriter effect via `useState` + `useEffect` with `setInterval`, incrementing a character index
- Search bar is purely visual for now (no backend wired) — can be connected later
- Lora font from Google Fonts
- Input styled with thin white border (`border: 1px solid rgba(255,255,255,0.3)`), no shadow

