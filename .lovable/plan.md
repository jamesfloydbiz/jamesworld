
Checklist:
1. Fix blocked interactions first
2. Update icon hover descriptions to describe destination pages
3. Refine Content icon into a spiral notebook
4. Reposition Blueprints icon to align with its pole
5. Scale all landmark icons and labels up by 50%
6. Double and vary edge rips/wrinkles for less uniform paper wear

What I found:
- The `/map` page is a single inline SVG in `src/pages/MapPage.tsx`.
- Landmark labels/descriptions come from the `LANDMARKS` array and are currently object metaphors like “A worn paperback near the fire.”
- The click issue is not just the icon hitbox: the intro logo wrapper becomes full-screen and `pointer-events-auto` after the animation, so it can still sit above the map and block clicks in the center/top-left.
- The Story route itself is correct (`/story`), so this is an interaction-layer problem, not a routing problem.

Implementation plan:

1. Fix mouse interaction before anything else
- Keep the corner logo clickable, but remove fullscreen click interception after the intro.
- Restrict interactivity to the actual small logo element instead of the entire fullscreen wrapper.
- Ensure the map wrapper/SVG never has any overlay layer above landmark hit targets.
- Keep only the landmark hit areas clickable, with non-interactive terrain/sign/weathering layers explicitly ignoring pointer events.

2. Replace icon descriptions with page-based descriptions
- Update each `LANDMARKS.descriptor` so the hover text describes the actual destination page experience:
  - Story: biography/timeline page
  - Projects: active initiatives/work
  - Network: connect/contact page
  - Content: writing/media/archive page
  - Blueprints: systems/mental models/processes page
- Keep the tone understated and aligned with the site.

3. Refine the Content icon
- Keep the open notebook concept, but add a subtle spiral binding centered between the two pages.
- Make it feel field-journal / notebook, not playful or cartoonish.
- Preserve SVG simplicity for fast load.

4. Re-align Blueprints with its pole
- Move the paper drawing so it visually lines up with the tack/pole it’s supposed to be attached to.
- Adjust only the icon drawing or the landmark coordinates as needed, without disturbing the overall map composition.

5. Increase landmark scale by 50%
- Increase icon size from the current scaled state to the requested larger size.
- Increase label and tooltip sizing proportionally so hierarchy stays balanced.
- Revisit hitbox dimensions so the clickable area remains precise around the icon only.

6. Increase edge wear and paper realism
- Double the number of rips and wrinkles around the perimeter.
- Make them irregular: mixed angles, lengths, spacing, and severity.
- Add more non-uniform edge creases and fine grain so the paper feels older and less mechanically repeated.
- Keep it restrained and tactile, not distressed for effect.

Technical notes:
- Main file: `src/pages/MapPage.tsx`
- Likely key edits:
  - Intro logo wrapper pointer-events behavior
  - `LANDMARKS` descriptors and possibly positions
  - `LandmarkIcon` cases for `content` and `blueprints`
  - Landmark hitbox sizing near lines ~797–840
  - `CreaseLines` and `EdgeRips` components
- I would preserve the inline-SVG approach and avoid adding libraries so load remains fast.

Expected result:
- Story and other top-left/center landmarks become reliably clickable.
- Hover descriptions feel like page previews rather than object captions.
- Content reads as a spiral-bound notebook.
- Blueprints sits correctly on its pole.
- Icons are more legible.
- The map edge feels more naturally torn, wrinkled, and tactile while staying classy.
