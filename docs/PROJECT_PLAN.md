# AI Evolving You — Project Plan

## Status: Beta live — coach.aievolvingyou.com + aievolvingyou.com rebuilt
**Last updated:** 15 April 2026

---

## What's Built (Done)

### Interview Coach — coach.aievolvingyou.com
- [x] Full React app — landing, category picker, about you, coaching session, summary
- [x] Question bank — 8 categories, 25 questions each
  - Sales & Business Development
  - Customer Success
  - Recruitment & Talent
  - Product Management
  - Engineering (Behavioural)
  - General / Any Role
  - Mindset & Leadership
  - Graduate & Early Careers
- [x] AI question generation from job description (4 questions per session)
- [x] AI coaching feedback per answer (3 sections: landed well, sharpen, try this)
- [x] Gibberish/junk input detection on About You fields and answers
- [x] Voice input via browser mic (Web Speech API)
- [x] Personalised cheat sheet summary at end of session
- [x] Markdown rendering fixed (RenderMarkdown component)
- [x] Back button and retry button navigation
- [x] Scroll to top on step changes
- [x] SVG icon system
- [x] AI disclaimer on feedback
- [x] Roadmap section on landing page
- [x] Feedback form (Netlify Forms) — 5 questions including before/after testimonial
- [x] Optional email capture field on feedback form
- [x] Live on Netlify with auto-deploy from GitHub main branch
- [x] Secure API backend (Netlify serverless function)
- [x] coach.aievolvingyou.com subdomain live
- [x] Brand-aligned design (Inter font, brand colours, hero grid)
- [x] Aleto beta launched 16 April 2026

### Main Site — aievolvingyou.com
- [x] Full site rebuild — new copy, new structure, new nav
- [x] Connected to GitHub (MYAISAM/aievolvingyou) with Netlify auto-deploy
- [x] Nav: Products (dropdown) · Resources · Channels (dropdown) · Connect
- [x] Mobile hamburger nav
- [x] Hero with locked headline and animated grid
- [x] Bridge section with locked copy
- [x] InterviewCoachCTA featured section
- [x] What's Here grid (Interview Coach / Displacement Report / Human Intelligence)
- [x] Resources section with 6 article cards
- [x] Currently Exploring section
- [x] Connect contact form (Netlify Forms)
- [x] React Router installed and configured
- [x] netlify.toml redirect rule for client-side routing
- [x] 6 live article pages:
  - /resources/star-method
  - /resources/weakness-question
  - /resources/four-types-of-interview-question
  - /resources/specificity-principle
  - /resources/ai-interview-prep
  - /resources/interviewing-after-long-gap

### Content
- [x] DECISIONS.md — 18 logged decisions
- [x] CONTENT_MAP.md — full content architecture with funnel logic
- [x] 6 Bucket A articles written and live (Interview Resources)
- [x] Skills-based hiring ebook ingested (CandidateX IP, owned by Man)

---

## Immediate — This Week

### Both sites
- [x] Favicons added to both sites (April 2026)
- [ ] Netlify Forms email notifications — configure on both sites so submissions land in inbox

### Interview Coach
- [ ] End-to-end test run with Aleto cohort user journey
- [ ] Send beta invite to Aleto cohort

---

## Phase 1 — Post Beta (week of 16 April)

### Payments
- [ ] Stripe Payment Links set up (£5 single / £12 three sessions)
- [ ] Paywall implementation at question 4 in coaching session
- [ ] Access token/code system: pay on Stripe, get code, enter in app
- [ ] Supabase anonymous session tracking connected

### Main site content — Bucket B (AI & Hiring)
- [ ] "How agentic AI is changing recruiting - and what it means for candidates"
- [ ] "How AI is changing what employers look for"
- [ ] "What hiring teams need to know about AI bias"
- [ ] "What candidates should know when AI is used in recruitment"

### Main site content — Bucket A (remaining)
- [ ] "How to prepare for a behavioural interview"
- [ ] "Interview tips for career changers"

---

## Phase 2 — Week of 23 April

### Org framework products
- [ ] AI Hiring Policy Framework — £79
- [ ] Bias Audit Checklist — £49
- [ ] Candidate Transparency Guide — £49
- [ ] AI Procurement Questions for Hiring Teams — £79
- [ ] Sales pages on main site for each
- [ ] Stripe Payment Links for each

### LinkedIn launch
- [ ] Post 1: "I've been quiet. Here's what I've been building."
- [ ] Post 2: Interview Coach launch - story of why + direct link
- [ ] Post 3: The bigger picture - full vision, platform, what's coming
- [ ] Google Form for beta access requests (captures email ahead of auth)

---

## Phase 3 — May onwards

### Bucket C content (Skills-based hiring)
- [ ] "What skills-based hiring actually means (and why it matters now)" — free article
- [ ] Further articles from ebook repositioned for main site
- [ ] Paid framework products from ebook content

### Interview Coach enhancements
- [ ] Cheat sheet PDF export / download
- [ ] Gift purchase option ("buy for someone else")
- [ ] Jina AI URL fetching for LinkedIn job specs on mobile

---

## Post-Launch Roadmap

### V2 — Export & Share
- Download cheat sheet as PDF
- Share session summary via email

### V3 — Session History (requires auth)
- Email magic link sign in (Supabase auth)
- Save past sessions
- Track improvement over time

### V4 — Voice Interview Mode
- ElevenLabs voice clone of Man's voice
- Questions read aloud, candidate speaks answers

### V5 — CV Upload
- Upload CV (PDF) for deeper personalisation
- Session-only, no storage (GDPR)

### V6 — Full Interview Simulation
- Back-to-back questions, timed
- Panel interview mode

---

## Tech Stack

| Layer | Decision |
|-------|----------|
| Interview Coach frontend | React (Vite), single file src/App.jsx |
| Main site frontend | React (Vite), component-based, React Router |
| Hosting | Netlify (both sites) |
| Version control | GitHub — MYAISAM org |
| API | Anthropic Claude (claude-sonnet-4-20250514) via Netlify function |
| Database | Supabase (to connect — Phase 1) |
| Payments | Stripe Payment Links |
| Forms | Netlify Forms |
| DNS | Netlify (transferred from GoDaddy) |

---

## Tech Debt

- Favicons needed on both sites
- Netlify Forms email notifications not yet configured
- Remove VITE_ANTHROPIC_API_KEY env var from coach (legacy)
- Add error boundary to coach app
- Mobile optimisation review on coach
- Article pages need meta descriptions for SEO