## Three Changes: /map Page, Landing Page Update, Museum Archive

### 1. New `/map` page — `src/pages/MapPage.tsx`

A full-viewport cartographic field map built entirely with inline SVG + CSS. No external libraries beyond framer-motion (already installed).

**Layout**: Black background, centered SVG rectangle at ~90% viewport with a thin border. CSS grain overlay (reuse the existing noise pattern from LandingPage).

**SVG map illustration**: Hand-drawn cartographic style using:

- Topographic contour lines (organic curved paths with varying stroke-width and opacity)
- Hatching patterns for terrain texture (diagonal line fills via `<pattern>`)
- Ink-style irregular borders and elevation marks
- Color palette: muted earth tones — `#3D2817` (bark), `#4A5D23` (olive), `#F5F0E8` (parchment) at low opacity on black

**Parallax effect**: Track mouse position via `onMouseMove` on the container. Apply a CSS `transform: translate(Xpx, Ypx)` to the SVG with dampened values (±8px max) using `lerp` in a `requestAnimationFrame` loop for smooth, slow movement. No spring physics needed — just eased interpolation.

**Five landmarks** — each is an SVG group (`<g>`) positioned on the map:


| Landmark                  | Icon sketch                          | Route       |
| ------------------------- | ------------------------------------ | ----------- |
| Worn paperback near fire  | Book shape + small flame strokes     | /story      |
| Pack against pine         | Backpack rectangle + tree trunk line | /projects   |
| Ridgeline lookout         | Mountain ridge silhouette            | /network    |
| Open journal on flat rock | Open rectangle on stone shape        | /content    |
| Blueprint pinned to bark  | Paper with pin + tree texture        | /blueprints |


Each landmark: hover shows a tooltip (CSS-only positioned `<text>` or a div overlay with descriptor), click navigates via `useNavigate`.

**Compass rose**: SVG compass in bottom-right corner. Uses `DeviceOrientationEvent` API to rotate the needle to true north when available (with permission request on iOS). Falls back to static decorative compass. Styled as engraved lines matching map aesthetic.

**Performance**: Pure SVG + CSS. No 3D. Grain via inline SVG `<feTurbulence>` filter. Sub-second load guaranteed.  
  
Maintain the same logo transition that exists in the transition to the museum currently.

### 2. Landing page update — `src/pages/LandingPage.tsx`

- Line 162: Change `navigate('/museum')` → `navigate('/map')`
- Line 178: Change `"Load 3D Experience"` → `"Explore the Map"`

Two-line edit. Everything else stays.

### 3. Archive the museum — `src/pages/BuildsPage.tsx`

Add a new entry to the `automations` array:

```
{
  title: 'JamesFloyds.World V2',
  description: 'The original interactive 3D museum experience — a navigable world built in WebGL with character movement and spatial sections.',
  status: 'Archive',
  cta: 'Explore',
  link: '/museum',
  external: false,
}
```

Update the status badge styling to handle `'Archive'` with a distinct dim style (e.g. `bg-secondary/50 text-foreground/50`). The link renders as an internal `<a>` or uses `onClick` with `navigate` since it's not external.

### 4. Routing — `src/App.tsx`

Add: `import MapPage from './pages/MapPage'` and `<Route path="/map" element={<MapPage />} />`.

### Files


| File                        | Action                                        |
| --------------------------- | --------------------------------------------- |
| `src/pages/MapPage.tsx`     | Create — full map page                        |
| `src/pages/LandingPage.tsx` | Edit 2 lines — button text + route            |
| `src/pages/BuildsPage.tsx`  | Edit — add archive card + archive badge style |
| `src/App.tsx`               | Edit — add /map route                         |
