## New Landing Page with Dual Entry Points

Replace the current Index page (which immediately loads the heavy 3D museum) with a lightweight landing page that gives visitors two clear paths: the immersive 3D museum or a quick portfolio view.

### What Changes

**1. New file: `src/pages/LandingPage.tsx**`

A standalone, lightweight page with:

- **SVG tree silhouette** as a faded background element -- stencil/screen-print style, built entirely in SVG (no image files)
- **Film grain overlay** using a CSS pseudo-element with a subtle noise pattern
- **Color palette**: dark bark brown (`#3D2817`), olive green (`#4A5D23`), light neutral background (`#F5F0E8`)
- **Welcome text**: brief, warm intro -- something like "James Floyd" as heading plus a short line
- **Two equal buttons**:
  - "Experience the Museum" -- navigates to `/museum` (the current 3D experience with the loading page)
  - "Quick Portfolio View" -- navigates to `/story` (or a dedicated portfolio route)
- **Fade-in animation** using framer-motion (already installed), subtle and paced
- **Mobile-responsive** via Tailwind breakpoints
- **Zero heavy dependencies** -- no Three.js, no lazy loading, no 3D. Just React + framer-motion + Tailwind + an inline SVG

**2. Move current Index to `/museum` route**

- Rename `src/pages/Index.tsx` logic to serve at `/museum` instead of `/`
- The 3D museum with its loading screen, joystick, etc. lives there unchanged

**3. Update `src/App.tsx` routing**

- `/` renders `LandingPage`
- `/museum` renders the current `Index` (3D museum experience)
- All other routes unchanged

### Landing Page Layout

```text
+------------------------------------------+
|                                          |
|          [faded tree SVG bg]             |
|                                          |
|           James Floyd                    |
|     Builder. Creator. Explorer.          |
|                                          |
|   [Experience the Museum]                |
|   [Quick Portfolio View]                 |
|                                          |
+------------------------------------------+
```

- Tree SVG is large, centered, very low opacity (~0.06-0.08), behind everything
- Grain overlay covers entire page at low opacity
- Content is vertically centered
- Buttons are stacked, same size, same visual weight
- Typography: Space Mono (already the project font)

### Technical Details

**LandingPage.tsx structure:**

- No state management needed (no zustand, no game store)
- Uses `useNavigate` from react-router-dom for button clicks
- SVG tree: a simple deciduous tree silhouette path, viewBox-based, scales naturally
- Grain effect: CSS `background-image` with a tiny repeating noise pattern using a data URI or CSS gradient trick
- Animations: `motion.div` wrappers with staggered `opacity` and `y` transitions, 0.4-0.6s duration
- Colors applied via inline styles or scoped classes (not touching the global theme since this page has its own warm palette)

**Routing changes in App.tsx:**

- Add `import LandingPage from "./pages/LandingPage"`
- Change `<Route path="/" element={<Index />} />` to `<Route path="/" element={<LandingPage />} />`
- Add `<Route path="/museum" element={<Index />} />`

**LoadingScreen.tsx** -- no changes needed, it still works within the museum route.

### What Stays the Same

- All existing pages and routes
- The 3D museum experience (just moved to `/museum`)
- Global styles, fonts, theme tokens
- Game store, all components  
  
delete nothing. the entire experience will just be behind the 3d experience button including the loading page. behind the quick snapshot experience right now - build a very simple landing page with black background and white , with compelling copywriting about reaching out to me.  
  
keep the brand guidelines as a black bacground with white accents and use the brown and green sparingly but enough to make it feel homey, cozey, and analog, and natural