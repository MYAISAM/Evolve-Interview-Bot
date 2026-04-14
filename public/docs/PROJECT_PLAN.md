# AI Evolving You — Interview Coach: Project Plan

## Status: Beta — Live at evolve-interview-coach.netlify.app
**Last updated:** 2 April 2026

---

## What's Built (Done)

- [x] Full React app — landing, category picker, about you, coaching session, summary
- [x] Question bank — 6 categories, 10 questions each
  - Sales & Business Development
  - Customer Success
  - Recruitment & Talent
  - Product Management
  - Engineering (Behavioural)
  - General / Any Role
- [x] AI question generation from job description (4 questions per session, tailored to JD)
- [x] AI coaching feedback per answer (3 sections: landed well, sharpen, try this)
- [x] Voice input via browser mic (Web Speech API)
- [x] Personalised cheat sheet summary at end of session
- [x] Roadmap tab showing what's coming
- [x] Feedback form (Netlify Forms)
- [x] On GitHub with version control
- [x] Live on Netlify with auto-deploy
- [x] Secure API backend (Netlify function)
- [x] Brand-aligned design (Inter font, brand colours, hero grid)

---

## Outstanding — Before Aleto Beta (by 16 April 2026)

### Week 1 (2–9 April) — Polish
- [ ] Fix cheat sheet markdown (asterisks showing as raw symbols)
- [ ] Add worry field to cheat sheet prompt
- [ ] Wire feedback form to send emails via Netlify Forms
- [ ] Expand question bank (10 → 20-25 per category)
- [ ] Add question bank from Perplexity research (4 prompt batches)

### Week 2 (9–16 April) — Launch prep
- [ ] Set up subdomain: coach.aievolvingyou.com
- [ ] Add CTA section on aievolvingyou.com pointing to coach
- [ ] Full end-to-end test run simulating Aleto user session
- [ ] Write Aleto beta invite message
- [ ] Ship to Aleto cohort

---

## Aleto Beta Plan

**Target date:** 16 April 2026
**Audience:** Aleto Foundation members (engineering-focused candidates)
**Access:** Free, no signup, direct link
**Goal:** Validate the core coaching experience, collect feedback, understand usage

**Key message to send:**
> "We've built an AI interview coaching tool and you're one of the first to try it. It's free, takes 15 minutes, and we genuinely want to know what you think. Here's the link: [coach.aievolvingyou.com]"

**What we're measuring:**
- Do they complete a full session?
- What feedback do they leave?
- Which role categories are most used?
- What questions do they ask that we don't answer well?

---

## Post-Beta Roadmap

### V2 — Voice Interview Mode
- ElevenLabs voice clone of Man's voice
- Questions read aloud in your voice
- Candidate speaks answers, AI coaches on delivery + content
- Timeline: post-beta feedback

### V3 — CV Upload + Deeper Personalisation
- Upload CV (PDF) — parsed and used to personalise questions
- LinkedIn import (manual paste — scraping not viable)
- GDPR note: session-only, no storage
- Timeline: Q2 2026

### V4 — Auth + Session History
- Email magic link sign in
- Save past sessions
- Track improvement over time
- Timeline: Q2-Q3 2026

### V5 — Industry Deep Dives
- Specialist question banks: medical, legal, finance, biotech
- Backed by real hiring data
- Timeline: Q3 2026

### V6 — Full Interview Simulation
- Back-to-back questions in real time
- Panel interview mode
- Timed responses
- Timeline: Q4 2026

---

## Question Bank Expansion Plan

Run these 4 Perplexity prompts to build out the question bank:

**Batch 1:** Core 6 categories (25 questions each)
Sales, CS, Recruitment, Product, Engineering (behavioural), General

**Batch 2:** New role types (20 questions each)
Marketing & Brand, Finance & Accounting, Operations & Supply Chain,
Project & Programme Management, HR & People Operations,
Legal & Compliance, Executive & Leadership

**Batch 3:** Career stage specific (20 questions each)
Graduate & Entry Level, Career Changers, Returners to Work,
Startup & Scale-up, Non-profit & Social Impact

**Batch 4:** Universal soft skills (40 questions total)
Self-awareness, resilience, collaboration, values, leadership at any level

**Total target:** ~300-400 questions across 20+ categories

---

## Pricing Strategy (Post-Beta)

To be determined based on beta feedback. Initial thinking:

| Tier | Price | What you get |
|------|-------|-------------|
| Free | £0 | 2 questions per session |
| Single session | £9 | Full session (7 questions) + cheat sheet |
| Bundle | £25 | 5 sessions |
| Monthly | £15/mo | Unlimited sessions |

**Payment:** Stripe or Gumroad
**Note:** Do not implement payments until post-beta feedback validates willingness to pay

---

## Launch Plan (Post-Beta)

1. Aleto beta feedback collected and acted on
2. CTA live on aievolvingyou.com
3. Payment gateway integrated
4. ElevenLabs voice clone set up
5. Announce on LinkedIn / Human Intelligence YouTube channel
6. Soft launch to wider audience

---

## Tech Debt & Future Improvements

- Move question bank from code to Supabase database (enables admin panel)
- Add Netlify Forms email notifications
- Remove VITE_ANTHROPIC_API_KEY env var (legacy, not needed)
- Add error boundary to catch API failures gracefully
- Add loading skeleton screens
- Mobile optimisation review
