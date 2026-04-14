---
name: human-intelligence-notion-resource-page
description: "Use this skill when creating a Notion companion resource page for a HuMan Intelligence YouTube video. Triggers: any request to 'create the resource page', 'build the Notion page', 'set up the source page' for a HuMan Intelligence video. This skill tells Claude exactly where to create the page, how to structure it, what content standards to apply, and how to verify the output. Always read this before touching Notion for this channel."
compatibility: "claude.ai — requires Notion MCP integration to be active"
license: HuMan Intelligence channel use only
---

# HuMan Intelligence — Notion Resource Page

## Why this skill exists

Every HuMan Intelligence YouTube video has a companion Notion resource page that documents every claim, source, and quote used in the video. Viewers are directed here from the YouTube description. The page must be accurate, consistently structured, and match the established format exactly.

This skill tells you how to build it correctly every time without back-and-forth.

---

## Step 0 — Fetch the reference page first

Before doing anything, fetch this page to confirm current formatting conventions:

```
Fetch: https://www.notion.so/2fe2ee49f688816a99a9ef434375dfa9
```

This is the gold standard resource page ("No Jobs, No Customers, No Economy"). Match its structure exactly.

---

## Step 1 — Where to create the page

**Always** create under the Resource Hub parent. Never at workspace level.

```
Parent page: HuMan Intelligence — Resource Hub
Parent page ID: 2a72ee49-f688-81bd-acd2-cbe3721124b0
```

Use `Notion:notion-create-pages` with:
```json
{
  "parent": {
    "type": "page_id",
    "page_id": "2a72ee49-f688-81bd-acd2-cbe3721124b0"
  }
}
```

Page icon: 📊

---

## Step 2 — Page title format

```
"[EXACT YOUTUBE TITLE]" — Complete Research & Sources
```

Example:
```
"AI Isn't Killing Jobs Yet… So Why Are 4,000 People Gone?" — Complete Research & Sources
```

---

## Step 3 — Required sections (in order)

Every resource page must contain all eight sections in this order.

### Section 1: Video Header Block

```
📺 Watch the Video
[YouTube link — add when live]
**Video Published:** [Month Year]
**Length:** ~[X] minutes
**YouTube Title:** [exact title]
**Hook / Thumbnail line:** *"[hook line used on thumbnail]"*
**Topic:** [2-3 sentence plain English summary]
```

### Section 2: Table of Contents

Numbered list with anchor links to every section. Example:
```
1. [What Anthropic Actually Measured](#methodology)
2. [The Headline Finding](#finding)
...
```

### Section 3: Numbered Content Sections

One section per major video claim or topic.

**For research/data claims — required elements:**
- Section heading with anchor
- Direct quote in blockquote format with page reference
- Plain English explanation of what it means
- Verification status badge
- Source link

**For real-world events (layoffs, announcements) — required elements:**
- Confirmed facts only in the main body
- ⚠️ caveat block for anything unconfirmed
- Named sources with publication date and URL
- Verification status badge

**For editorial/analysis sections — required elements:**
- Summary of the argument made in the video
- Clear note that it is editorial analysis, not reported fact
- Verification status badge

### Section 4: Research Methodology

Always include. Must cover:
- How the script was fact-checked (Perplexity + direct source clicks)
- Man verifies sources himself — does not rely on Claude summaries
- Unverified stats removed entirely, not hedged
- Tentative findings flagged with appropriate caveats in the video

### Section 5: Categories of Claims Key

Always include this exact key:
```
✅ Fully Verified — numerical data with primary source confirmation
✅ Framework Verified — interpretation supported by sourced data
✅ Quote Verified — direct attribution confirmed via primary source
✅ Reported/Unconfirmed — clearly flagged where corporate confirmation is absent
❌ Removed — claims that could not be verified were cut entirely
```

### Section 6: Primary Source Index

Organised by category (e.g. Primary Research / Government Data / Company News / Broader Context). Every source as a named link. No bare URLs.

### Section 7: Usage Notes

Always include:
```
**For Video Description:**
Link to this Notion page as "Full Research & Sources — every claim verified, every source linked"

**For Comments/Discussion:**
If viewers question specific claims, direct them to the relevant numbered section above.

**For Future Videos:**
[Note any reusable analytical frameworks introduced in this video]
```

### Section 8: Footer

Always end with exactly this:
```
**Document Status:** Complete and verified as of [Month Year]
**Next Update:** [Condition that would trigger an update]
**Maintained by:** HuMan Intelligence YouTube Channel

---

*Stay human.*
```

---

## Formatting rules

### Quotes
Always blockquote format with source reference:
```
> *"Direct quote from source."*
— Source name, p.X
```

### Source links
Always named. Never bare URLs:
```
[Publication Name — Article Title (Date)](URL)
```

### Unconfirmed information
Always a ⚠️ warning block:
```
### ⚠️ Important Caveat
[What is unconfirmed and what the official response was]
```

### Verification badges
Use inline after every claim:
- `**Status:** ✅ Verified — primary source`
- `**Status:** ✅ Reported, unconfirmed by [company]`
- `**Status:** ✅ Editorial analysis — based on verified source reporting`

---

## Content standards (non-negotiable)

These are Man's editorial standards. Do not deviate.

- Every statistic must trace to a named source
- Unverified claims are removed entirely — never hedged in the page
- Tentative findings must be flagged (e.g. "just barely statistically significant")
- Corporate denials must be included if a company pushed back
- Always distinguish confirmed facts from reported/unconfirmed news
- Always cite page numbers for academic and research sources
- Man verifies sources himself by clicking them directly — do not rely on Claude summaries alone
- Never present analyst interpretation as corporate statement

---

## Step 4 — Verify the output

After creating the page, fetch it back and confirm:
- All eight sections are present
- All source links are named and working
- Unconfirmed items are clearly flagged with ⚠️ blocks
- Corporate denials are included where relevant
- Footer is present with "Stay human." sign-off

---

## Step 5 — Return the URL

Always return the live Notion page URL so Man can:
1. Add it to the YouTube description
2. Verify it himself before publishing

The URL goes in this block in the YouTube description:
```
📄 FULL SOURCE & FACT-CHECK PAGE
Every claim verified. All sources linked.
[NOTION PAGE URL HERE]
```

---

## Channel context

- **Channel:** HuMan Intelligence
- **Creator:** Man
- **Focus:** Grounded, data-driven analysis of AI's real-world impact on jobs, families, and the economy — from a parent's perspective
- **Audience:** Non-technical professionals and parents. Primarily UK but YouTube audience skews US
- **Voice:** Skeptical-curious, punchy, direct. No hype, no panic.
- **Fact-check process:** Perplexity + direct source clicks before recording. Man verifies himself.
- **Non-negotiable:** Accuracy above all. If it can't be verified, it gets cut.

---

## Common mistakes to avoid

- ❌ Creating at workspace level — always use Resource Hub parent ID
- ❌ Bare URLs — always name every link
- ❌ Presenting reported/unconfirmed news as confirmed fact
- ❌ Skipping the methodology section
- ❌ Skipping the footer and "Stay human." sign-off
- ❌ Omitting corporate denials or official pushback
- ❌ Summarising the video — document the claims and sources, don't narrate
- ❌ Missing page number references on academic/research sources
