

## Add Left Accent Line to Explore Section

Currently the Explore section has a single vertical divider line at `left-1/2` (center). The goal is to add a matching vertical line on the left edge of the left column, creating symmetry — both columns flanked by an accent line on their inner/outer edge.

### Changes

**File: `src/pages/PortfolioPage.tsx`** (line 465)

Add a second absolute-positioned vertical line at `left-0` alongside the existing `left-1/2` line:

```
<div className="hidden md:block absolute top-0 bottom-0 left-0 w-px bg-black/10" />
<div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-black/10" />
```

This produces two thin vertical rules — one on the far left of the grid and one in the center — matching the visual in the reference screenshot.

