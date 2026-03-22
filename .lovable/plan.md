

## Add Context to All Reference Cards + Rename Dom

### Changes to `src/pages/ReferencesPage.tsx`

**1. Rename all "Dom" entries to "Dom Rrufran"** (3 occurrences: lines 51, 111, 153)

**2. Add/update `context` field on every card** with the relationship description + ", Friend" appended:

| Name | Context |
|---|---|
| Austin Moss | Met through Jets and Capital, Friend |
| Jarom Christensen | Worked together on Jets and Capital + a few deals, Friend |
| Caleb Guilliams (×2) | Worked for him at Betterwealth, Friend |
| Joel Robertson | Worked with him at Betterwealth, Friend |
| Dom Rrufran (×3) | Worked for him at Betterwealth, Friend |
| Lane Spurlock | Friend I met off the internet |
| Lauren Hansen (×2) | Worked with her at Jets and Capital, Friend |
| Danielle Raskin | Worked for her at SXSW Secret Garden Party, Friend |
| Christian Davis | Worked with him at Jets and Capital, Friend |
| Vitoria Okuyama | Worked for her at SXSW Secret Garden Party, Friend |
| Andrew Yeung | Worked for him at SXSW Secret Garden Party, Friend |
| Tim Nart | Worked with him at Jets and Capital, Friend |
| Cooper Swanson | Friend |
| Jordan Hutchinson | Worked for him at Jets and Capital, Friend |
| Trinity Arl | Friend |
| Vanessa Dayana | Friend from Ecuador |

**Note**: Jarom and Joel currently have `context: 'Commented organically on a job posting'` — this will be replaced with the new context above per the user's instructions.

### File
- `src/pages/ReferencesPage.tsx` — update all entries in the `references` array

