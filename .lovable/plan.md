

## Add 6 New LinkedIn Testimonials to /references

### Data changes — add `link` field + 6 new entries

Extend `Reference` interface with optional `link?: string` and optional `context?: string` (for a small italic note above the quote explaining the situation).

**Jarom & Joel entries get context**: These two commented organically on a job post to vouch for James — the context line will read something like *"Commented unprompted on a job posting"* so visitors understand these weren't solicited.

New entries interspersed with existing ones:

| Name | Quote (abbreviated) | Context | Link |
|---|---|---|---|
| Jarom Christensen | "James Floyd is your guy. The best by a wide margin..." | *Commented organically on a job posting* | LinkedIn |
| Joel Robertson | "Can confirm that James Floyd should be your guy..." | *Commented organically on a job posting* | LinkedIn |
| Lane Spurlock | "Dude it was so good to finally meet you in person!!!" | — | LinkedIn |
| Danielle Raskin | "James, you are a superstar..." | — | LinkedIn |
| Vitoria Okuyama | "James killed it!! If anyone wants to learn how to stand out..." | — | LinkedIn |
| Andrew Yeung | "james - you were the mvp" | — | LinkedIn |

### UI changes to TextCard

1. If `context` exists, render a small italic line above the quote: `text-[10px] text-foreground/30 italic`
2. If `link` exists, render a subtle `ExternalLink` icon + "source" text at bottom-right of the card, low opacity, hover reveals. Opens new tab.

### File
- `src/pages/ReferencesPage.tsx` — extend interface, add 6 entries, update TextCard

