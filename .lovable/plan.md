

# Museum Loading Optimization Plan

## Current State
- 5 GLB models loaded eagerly via `useGLTF.preload()` at module level (tree, vulcan, apollo, thinker, buddha)
- No compression applied — raw GLB files served as-is
- No Draco or meshopt decompression configured
- FCP is ~8.5s (dev mode, but still slow)
- All 5 models start downloading simultaneously on page load

## Optimizations

### 1. Compress GLB files with Draco (biggest win)
- Use `gltf-transform` CLI to Draco-compress all 5 models offline, reducing file sizes by 50-80%
- Run: `npx @gltf-transform/cli optimize input.glb output.glb --compress draco`
- Replace original files in `/public/models/`
- Add `DRACOLoader` to the `useGLTF` calls via drei's built-in Draco support

### 2. Enable Draco decoding in code
- Import and configure `useGLTF` with Draco decoder path (Google's CDN-hosted decoder)
- One-line change: `useGLTF.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/')`
- This tells three.js to decompress the Draco-encoded models on the client

### 3. Prioritized / staggered loading
- Remove all `useGLTF.preload()` calls from module level
- Instead, preload only the 2 nearest models first (Story + Projects, which the user sees immediately)
- Defer the remaining 3 models to load after the scene is interactive
- This gets the user into the museum faster

### 4. Add caching headers via Vite config
- Configure Vite's static asset serving to set long `Cache-Control` headers for `/models/*.glb`
- After first visit, models load from browser cache instantly

## Implementation Steps
1. Run `gltf-transform` to Draco-compress all 5 GLB files (replacing originals)
2. Add `useGLTF.setDecoderPath(...)` call in `Pedestal.tsx`
3. Replace bulk `useGLTF.preload()` with prioritized loading — preload 2 nearest models immediately, defer remaining 3 via `setTimeout` or `requestIdleCallback`
4. Verify models still render correctly after compression

## Expected Impact
- **50-80% smaller model downloads** (Draco compression)
- **Faster time-to-interactive** (staggered loading)
- **Instant repeat visits** (cache headers)

