# AI Evolving You — Interview Coach: Quick Reference

> Read this first when starting a new conversation about this project.

---

## What is this?

An AI-powered interview coaching tool built for aievolvingyou.com. Candidates paste a job description, pick a role category, answer questions (by voice or text), and receive personalised coaching feedback after each answer. Ends with a cheat sheet summary.

**Live URL:** https://evolve-interview-coach.netlify.app
**Target subdomain:** https://coach.aievolvingyou.com
**GitHub:** https://github.com/MYAISAM/Evolve-Interview-Bot
**Owner:** Man Wong (GitHub: MetaMan, org: MYAISAM)

---

## Key Files in This Docs Folder

| File | What's in it |
|------|-------------|
| `BRAND.md` | Colours, fonts, measurements, design tokens |
| `ARCHITECTURE.md` | Tech stack, repo structure, API setup, deployment |
| `PROJECT_PLAN.md` | What's done, what's outstanding, roadmap, pricing |
| `PROMPTS.md` | All AI prompts used in the app + Perplexity research prompts |
| `QUICK_REFERENCE.md` | This file — start here |

---

## The App in 60 Seconds

**Flow:**
1. Landing page → "Start your session"
2. Pick role category + paste job description
3. Answer 3 questions about yourself (background, why this role, biggest worry)
4. 7 questions — mix of curated (question bank) + AI-generated from JD
5. Answer each by voice or text → get coaching feedback
6. End with cheat sheet summary + roadmap + feedback form

**What makes it good:**
- Questions are tailored to the actual job description
- Coaching references the candidate's personal details
- Voice input works in Chrome/Safari
- Clean, on-brand design matching aievolvingyou.com

---

## Current Tech State

- Frontend: React (Vite), single file `src/App.jsx`
- API: Claude Sonnet via Netlify Function (secure, no exposed keys)
- Deployed: Netlify, auto-deploys from GitHub main branch
- API credits: $5 loaded (~500 sessions at ~1p each)

**To push a change:**
```bash
cd "Interview Bot"
# make your changes
git add .
git commit -m "what you changed"
git push
```
Netlify auto-rebuilds in ~60 seconds.

---

## Immediate To-Dos (Before 16 April)

1. Fix cheat sheet markdown (asterisks showing raw)
2. Expand question bank using Perplexity prompts (see PROMPTS.md)
3. Set up subdomain coach.aievolvingyou.com
4. Add CTA on main site (prompt in PROMPTS.md)
5. Send beta invite to Aleto cohort

---

## Naming

The tool doesn't have a confirmed name yet. Options discussed:
- **Reps** (favourite — "put your reps in before the big moment")
- **Sage** (warm, wise)
- **Frank** (honest feedback, human name)
- **The Room** (owning the room)

Currently shown in-app as "AI Evolving You" with BETA badge.

---

## Aleto Context

Aleto Foundation — supports underrepresented candidates, many looking for engineering roles. Beta cohort will be the first real users. Key insight: they need behavioural/competency coaching, not technical test prep. Engineering (Behavioural) category was built with them in mind.

Beta deadline: **16 April 2026**

---

## Post-Beta Plans

- Voice mode (ElevenLabs voice clone of Man's voice)
- CV upload for deeper personalisation
- Auth + session history
- Pricing: £9 single session, £15/mo unlimited
- Payment via Stripe or Gumroad
- Full launch announced via LinkedIn + Human Intelligence YouTube
