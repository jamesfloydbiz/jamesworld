# Site Cleanup & Simplification

After reviewing the codebase, here are the issues I found:

## Dead Files (not imported anywhere, safe to delete)

1. `**src/pages/LandingPage.tsx**` — The old landing page. No longer imported or routed; `/` now serves `DearReaderPage`. Dead code.
2. `**src/pages/MapPage.tsx**` — ~900 lines, not imported or routed anywhere. Dead code.
3. `**src/components/ui/SearchAssistant.tsx**` — The floating chat widget. Not imported in `App.tsx` or any other file. Dead code (per the earlier plan to remove it).

## Minor Improvements

4. `**/dear-reader` redirect** — Still in `App.tsx` (line 47). Same situation — redirects to `/`. Can be removed unless there are known external links.
5. **Dear Reader logo links to `/**` — Since it *is* `/`, clicking the logo just reloads the page. Minor, but could be removed or made non-interactive on the home page to avoid a pointless navigation.

## What's Working Well

- Routing is clean and consistent
- Dear Reader page content and spacing look solid
- Projects page structure with archived section and dynamic streak is well-organized
- No console errors or broken imports in the active routes

## Implementation

- Delete 3 unused files (`LandingPage.tsx`, `MapPage.tsx`, `SearchAssistant.tsx`)
- Optionally remove the 2 legacy redirect routes from `App.tsx`
- All changes are deletions — no new code needed  
  
Also change in /builds the calculator to status archived and   
the description to show that there was calculators to show 

  |                                                                                                                    |                      |                                                                                           |        |        |        |        |
  | ------------------------------------------------------------------------------------------------------------------ | -------------------- | ----------------------------------------------------------------------------------------- | ------ | ------ | ------ | ------ |
  | &nbsp;                                                                                                             | whole life insurance | [Internal-Value](https://github.com/BetterWealth1/BWCalculators/tree/main/Internal-Value) | &nbsp; | &nbsp; | &nbsp; | &nbsp; |
  | [Passive-Income-Equivalent](https://github.com/BetterWealth1/BWCalculators/tree/main/Passive-Income-Equivalent)    | &nbsp;               | &nbsp;                                                                                    | &nbsp; | &nbsp; | &nbsp; | &nbsp; |
  | [asset-allocation](https://github.com/BetterWealth1/BWCalculators/tree/main/asset-allo)                            | &nbsp;               | &nbsp;                                                                                    | &nbsp; | &nbsp; | &nbsp; | &nbsp; |
  | [bwassessment](https://github.com/BetterWealth1/BWCalculators/tree/main/bwassessment)                              | &nbsp;               | assess peoples financial state                                                            | &nbsp; | &nbsp; | &nbsp; | &nbsp; |
  | [external-value for whole life insurance](https://github.com/BetterWealth1/BWCalculators/tree/main/external-value) | &nbsp;               | &nbsp;                                                                                    | &nbsp; | &nbsp; | &nbsp; | &nbsp; |
  | &nbsp;                                                                                                             | &nbsp;               | &nbsp;                                                                                    | &nbsp; | &nbsp; | &nbsp; | &nbsp; |
  | &nbsp;                                                                                                             | &nbsp;               | &nbsp;                                                                                    | &nbsp; | &nbsp; | &nbsp; | &nbsp; |
