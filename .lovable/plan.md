

## SEO Overhaul and Social Link Consistency

### 1. Standardize all social links

Currently the site has mixed LinkedIn and Instagram URLs:
- LinkedIn: some pages use `/in/jamesfloyd02/`, others use `/in/jamesfloydl/`
- Instagram: some pages use `/jamesfloyd02/`, others use `/jamesfloydsworld`

All links will be unified to:
- LinkedIn: `https://www.linkedin.com/in/jamesfloydl/`
- Instagram: `https://www.instagram.com/jamesfloydsworld`

**Files affected:**
- `src/pages/PortfolioPage.tsx` (4 links: 2 LinkedIn, 2 Instagram)
- `src/pages/StoryPage.tsx` (1 LinkedIn link)

### 2. Descriptive alt text for all images

Replace generic alt text with keyword-rich, descriptive alternatives:

**PortfolioPage.tsx:**
- Hero image: `"James Floyd"` becomes `"James Floyd at Jets and Capital Miami networking event"`
- Nav logo: `"JF"` becomes `"James Floyd logo"`
- Footer logo: same
- In the Field photos: already use captions as alt (good)
- Logos bar: already has org names (good)

**PicturesPage.tsx:**
- `"Memory ${index + 1}"` becomes descriptive text per image (e.g., filename-based context or a descriptive map)

**BuildsPage.tsx:**
- `"Screenshot ${idx + 1}"` becomes `"{automation title} workflow screenshot {idx + 1}"`
- `"Full size"` becomes `"{automation title} workflow detail view"`

**StoryPage.tsx:**
- `alt={event.title}` is acceptable but will be expanded to `"James Floyd - {event.title}"`

**ContentPage.tsx:**
- `alt={content.title}` is fine

**LandingPage.tsx:**
- No images needing alt text (SVG is `aria-hidden`)

**WalkwayHeader.tsx:**
- `"Logo"` becomes `"James Floyd logo - return to home"`

### 3. Improve `index.html` meta tags

Add missing SEO essentials:
- Update `<title>` to `"James Floyd | Builder, Creator, Explorer"`
- Update `<meta name="description">` to a keyword-rich summary matching LinkedIn/Instagram bio tone
- Add `<meta property="og:url">` pointing to `https://jamesworld.lovable.app`
- Add `<meta property="og:image">` using the hero image or logo
- Add `<link rel="canonical">` tag
- Add `<meta name="author">` and `<meta name="keywords">`
- Update OG and Twitter titles/descriptions to match

### 4. Add `robots.txt` sitemap reference

Add a `Sitemap:` directive to `public/robots.txt` pointing to a future sitemap URL.

---

### Technical details

**Files to modify:**
- `index.html` -- meta tags overhaul
- `src/pages/PortfolioPage.tsx` -- 4 social link fixes, 3 alt text improvements
- `src/pages/StoryPage.tsx` -- 1 LinkedIn link fix, alt text improvement
- `src/pages/PicturesPage.tsx` -- descriptive alt text map for ~35 images
- `src/pages/BuildsPage.tsx` -- contextual alt text for screenshots
- `src/components/walkway/WalkwayHeader.tsx` -- logo alt text
- `public/robots.txt` -- sitemap directive

