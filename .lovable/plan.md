

# Analytics-Driven Performance and Retention Improvements

## What the Data Shows

179 visitors over ~5 weeks with only 1.85 pages per visit. This means most visitors see the homepage and leave without exploring deeper. Two likely causes:

1. **Loading gate**: The 3D scene blocks entry until all 5 GLB models download. On slower connections or mobile, this wait causes abandonment before the experience even begins.
2. **Wayfinding**: Once inside, the museum's navigation relies on walking to pedestals. Visitors who don't understand the controls or don't have patience to explore never reach the inner pages.

## The Plan (3 Parts)

### Part 1: Progressive Loading (eliminate the bounce wall)

**Goal**: Let visitors enter the museum in ~2 seconds regardless of network speed.

- Remove the `useProgress`/`isFullyLoaded` dependency from the loading screen
- Convert the triangle animation to a fixed-duration (~1.8s) branded intro -- it traces at a consistent pace, reveals the logo, then fades
- Remove all `useGLTF.preload()` calls from `Pedestal.tsx` so models load on-demand
- Remove `ProgressTracker` from `MuseumScene.tsx` and the `onProgress` prop chain
- Models load in the background while the user is already walking around

**Files**: `LoadingScreen.tsx`, `Index.tsx`, `MuseumScene.tsx`, `Pedestal.tsx`

### Part 2: Themed Placeholders (make loading feel intentional)

**Goal**: Replace the generic dodecahedron with meaningful shapes that hint at each section.

| Section | Placeholder | Rationale |
|---|---|---|
| Story | Cylinder + sphere | Abstract tree (trunk and canopy) |
| Projects | Octahedron | Raw material being forged |
| Content | Cone | Upward gesture, torch-like |
| Blueprints | Box + small sphere | Abstract seated figure |
| Network | Low-poly sphere (8 segments) | Stillness, wholeness |

- Each placeholder slowly rotates on the Y axis (~0.3 rad/s)
- White material with slight metalness for a sculptural, museum-quality feel
- When the real model finishes loading, it fades in over ~400ms (opacity transition via `useFrame`)
- Placeholders become part of the experience rather than a sign of incompleteness

**Files**: `Pedestal.tsx`

### Part 3: Reduce friction to inner pages

**Goal**: Increase pages-per-visit from 1.85 toward 3+.

- After the loading screen fades, briefly show a subtle hint near the bottom of the screen: a small upward chevron with "Explore" that fades after 3 seconds. This nudges users to move forward without being heavy-handed.
- This is a lightweight addition to `MuseumUI.tsx` -- a one-time, auto-dismissing prompt.

**Files**: `MuseumUI.tsx`

---

## Technical Summary

### `src/components/ui/LoadingScreen.tsx`
- Remove `progress` and `isFullyLoaded` props
- Replace progress-driven `smoothProgress` with a fixed-duration timer (1.8s linear from 0 to 100)
- Triangle traces at constant speed, logo reveals, background fades -- same visual sequence, no waiting

### `src/pages/Index.tsx`
- Remove `progress` state, `handleProgress`, `isFullyLoaded` state
- Simplify `LoadingScreen` usage (no progress/loaded props)
- Keep `showTitles` and `showLoading` flow but trigger them from the loading screen's fixed-duration completion

### `src/components/museum/MuseumScene.tsx`
- Remove `ProgressTracker` component
- Remove `onProgress` prop

### `src/components/museum/Pedestal.tsx`
- Remove all `useGLTF.preload()` calls at bottom of file
- Replace `ModelPlaceholder` with `ThemedPlaceholder` that maps title to geometry
- Add fade-in transition to `LoadedModel` (opacity 0 to 1 over 400ms using `useFrame` and material traversal)
- Add slow Y-axis rotation to placeholders via `useFrame`

### `src/components/ui/MuseumUI.tsx`
- Add a one-time "Explore" hint with upward chevron, auto-dismisses after 3 seconds
- Uses framer-motion for fade-in/out

