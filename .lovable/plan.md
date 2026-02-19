## Portfolio Page Restructure

This plan reorganizes the portfolio page with seven coordinated changes to strengthen the newspaper aesthetic and add two new editorial sections.

---

### 1. Consolidate Photos Under the Story

- Remove the current mini gallery (4 small thumbnails under the story columns)
- Remove the standalone "In the Field" photo grid section (section 6)
- Place the four "In the Field" photos (IMG_0647, IMG_1311, IMG_1978_Original, IMG_4347) directly under the story in a 1x4 / 4-column grid with the "In the Field" label
- Photos will use `object-contain` or auto height so they display fully without cropping

### 2. Delete the Numbers Section

- Remove the entire "By the Numbers" section (2,000 / $2T+ / 12+ / infinity stats grid) and its trailing divider

### 3. Reverse the Cities Ticker Direction

- The cities ticker currently scrolls left-to-right. Change it to scroll right-to-left by toggling the `reverse` prop to `true`

### 4. Replace "Rooms I've Been In" With a Logos Bar

- Remove the text-based ticker
- Copy the 9 uploaded logo images into `public/logos/`
- Create a horizontally auto-scrolling logo strip with small logos (approx 40-50px height), grayscale, with transparent backgrounds
- Logos: Loeb NYC, Blue Devil, Jacob Green Charity Golf, Jets & Capital, Keiretsu Forum, BetterWealth, Champions of Change, Seattle Sounders, Seahawks
- Keep the "Rooms I've Been In" label above it
- Ensure the photos have transparent backgrounds so the logos are 'flush' against the background

### 5. Add "Notable Dispatches" Section

- Insert a new section after the logos bar
- Label: "Notable Dispatches" or "Field Notes"
- 3-column newspaper-style grid (stacks on mobile)
- Each column contains one short, punchy one-paragraph story
- Placeholder content will be added for James to replace with real dispatches
- Styled with EB Garamond body text, Playfair Display sub-headlines, consistent with the broadsheet aesthetic

### 6. Add "Message from James" Section

- Insert after Notable Dispatches, before the Get in Touch CTA
- Styled like a publisher's letter / editor's note
- Warm, direct tone with a personal message
- Placeholder text for James to customize
- Slightly indented, italic lead-in, distinguished from the rest of the page with subtle typographic treatment  


7. Change the style of the CTA to be more like an old timey news paper ad

---

### Resulting Page Order

1. Nav + Walking Character
2. Masthead / Hero
3. Cities Ticker (now right-to-left)
4. The Story (3 columns) + In the Field photos underneath
5. Logos Bar ("Rooms I've Been In")
6. Notable Dispatches (3-column grid)
7. Message from James (publisher's letter)
8. Get in Touch CTA
9. Explore (site directory)
10. Footer

### Technical Details

- 9 logo images copied from user-uploads to `public/logos/`
- Logos bar uses CSS animation (duplicate content for seamless loop) similar to existing Ticker pattern but with images instead of text
- No new dependencies required
- All new sections use existing Reveal animation wrapper and established typography classes