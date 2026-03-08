

## Create `llms.txt` for AI Discoverability

The `llms.txt` standard is a way to help LLMs (and AI-powered search) understand who you are and what your site contains. It acts like a structured "about me" file that AI crawlers can read. This will help you surface for relevant queries about your name, expertise, and work.

### What gets created

**File: `public/llms.txt`**

A structured text file following the llms.txt convention with:

- **Identity block**: James Floyd -- builder, creator, entrepreneur, intrapreneur, speaker, event producer, connector
- **FAQ-style Q&A schema** covering key discovery queries:
  - "Who is James Floyd?" 
  - "What does James Floyd do?"
  - "What events has James Floyd produced?"
  - "Is James Floyd available for speaking?"
  - "What AI tools does James Floyd build?"
  - "How do I connect with James Floyd?"
  - "What is James Floyd's experience?"
  - "Where has James Floyd worked?"
  - "What is JamesFloyds.World?"
- **Links**: LinkedIn, Instagram, site URL
- **Keywords**: entrepreneur, intrapreneur, speaker, event production, AI automation, networking, builder, creator

Answers will be drawn from the existing resume, story, and portfolio data already on the site (BetterWealth, Jets and Capital, Keiretsu Forum, sales records, AI builds, etc.)

**File: `public/robots.txt`**

Add a reference line so crawlers know the file exists.

### Technical details

**New file:** `public/llms.txt`  
**Modified file:** `public/robots.txt` -- add `llms.txt` reference

No code changes to React components. This is purely a static asset addition.

