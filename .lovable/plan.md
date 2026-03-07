

## Update Blueprints Page Content

Two content changes to the `frameworks` array in `src/pages/BlueprintsPage.tsx`:

**1. Books (step 2)** — Add "The Lessons of History by Ariel and Will Durant" to the book list.

**2. Replace Tech (step 4) with Health** — Rename to "Health", update short/long text:
- **Title**: Health
- **Short**: No excuses.
- **Long**: Structured content covering:
  - **Move**: Pushups, pullups, farmer's carries, rucking, walking, Russian twists, pike pushups, pistol squats.
  - **Eat**: High protein, enough fiber. Tip — put spinach in a lot of things.
  - **Sleep**: Sleep early, wake early.

Single file change: `src/pages/BlueprintsPage.tsx`, lines 15–33 in the `frameworks` array.

