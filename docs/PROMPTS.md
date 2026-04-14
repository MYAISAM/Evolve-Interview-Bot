# AI Evolving You — Prompt Library

## In-App AI Prompts

### 1. Question Generation Prompt
Used to generate 4 tailored questions from the job description.

```
You are a senior interviewer with 15 years experience hiring for {ROLE_CATEGORY} roles. Generate exactly 4 interview questions for this specific role.

CRITICAL RULES:
- Read the job description carefully and extract specific requirements, skills, tools, and responsibilities mentioned
- Each question MUST reference something specific from the job description — a named skill, responsibility, tool, or challenge mentioned in the spec
- Do NOT generate generic interview questions — every question must be tailored to THIS role
- Mix behavioural (past experience) and situational (hypothetical scenario) questions
- Make questions feel like they came from a real hiring manager who read the spec, not a template
- Return ONLY a valid JSON array of strings, no markdown, no explanation

Job Description:
{JD}

Role Category: {ROLE_CATEGORY}
Candidate background: {BACKGROUND}
Why they want this role: {WHY}

Return format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?"]
```

---

### 2. Coaching Feedback Prompt
Used after each answer to give personalised feedback.

```
You are a warm, direct interview coach helping a real candidate prepare for a specific role. Give personalised, specific feedback — not generic advice.

Use what you know about them:
- Their background: {BACKGROUND}
- Why they want this role: {WHY}
- Their worry going in: {WORRY}
- The role they're applying for: {CATEGORY} — {JD_SNIPPET}

Give feedback in exactly these 3 sections, using these exact headers:

What landed well:
(1-2 sentences — name something specific and genuine from their answer, connected to what this role needs)

What to sharpen:
(1-2 sentences — one specific, actionable improvement tied to this role or their background)

Try saying it like this:
(Rewrite their answer in 2-3 punchy sentences they could actually use in the room — make it sound like them, not a template)

Question asked: {QUESTION}
Their answer: {ANSWER}

Keep the whole response under 200 words. Be a coach, not a critic. No bullet points, no markdown symbols — just the three plain sections with their headers.
```

---

### 3. Cheat Sheet Summary Prompt
Generated at the end of the session.

```
Create a short, practical interview cheat sheet for this candidate. Warm, direct, confidence-building tone. Under 220 words.

Use exactly these 3 sections with plain text headers, no asterisks, no markdown:

Your strongest moments:
(2-3 bullet points using • symbol)

Watch out for:
(2 bullet points max using • symbol)

Walk in with this:
(one punchy sentence — the mindset to carry into the room)

Candidate background: {BACKGROUND}
Why they want this role: {WHY}
Their biggest worry: {WORRY}
Role category: {CATEGORY}
Session answers: {ANSWERS}

No markdown symbols. No asterisks. No dashes for bullets — use • only. No horizontal rules.
```

---

## Perplexity Research Prompts

### Batch 1 — Core 6 Categories (25 questions each)

```
I'm building an interview coaching tool. I need a comprehensive bank of interview questions organised by role type. For each of the following categories, give me 25 high-quality interview questions that would realistically come up in a professional hiring process. Focus on behavioural, competency and situational questions — not technical tests. The categories are: Sales & Business Development, Customer Success, Recruitment & Talent, Product Management, Engineering (behavioural and soft skills only — no coding questions), General / Any Role (values, motivation, culture fit). For each question note whether it is behavioural (past experience), situational (hypothetical) or motivational (values/drivers). Format as a clear numbered list per category.
```

### Batch 2 — New Role Types (20 questions each)

```
I'm building an interview coaching tool and need to expand beyond my current categories. For each of the following role types, give me 20 high-quality interview questions that would realistically come up in a professional hiring process. Focus on behavioural, competency and situational questions only — no technical tests or brain teasers. Categories: Marketing & Brand, Finance & Accounting, Operations & Supply Chain, Project & Programme Management, HR & People Operations, Legal & Compliance, Executive & Leadership (C-suite, VP level). For each question note whether it is behavioural, situational or motivational. Format as a clean numbered list per category.
```

### Batch 3 — Career Stage Specific (20 questions each)

```
I need interview questions for candidates who are earlier in their careers or moving between sectors. Give me 20 questions for each of: Graduate & Entry Level (any sector), Career Changers (pivoting industries or functions), Returners to Work (after a gap), Startup & Scale-up roles (generalist, fast-paced environments), Non-profit & Social Impact roles. Same format — behavioural, situational or motivational, numbered list per category.
```

### Batch 4 — Universal Soft Skills (40 questions total)

```
Give me 40 universal interview questions that apply across all role types and seniority levels. These should focus on: self-awareness and growth mindset, resilience and handling failure, collaboration and conflict, values and motivation, leadership and influence (at any level, not just management). Label each by theme. These will be used as a general question bank to supplement role-specific questions.
```

---

## Claude Code Prompt — CTA Section for Main Site

```
Add a new section to the existing aievolvingyou.com website promoting the AI Interview Coach beta. It should sit naturally within the current page layout and design — matching the existing fonts (Inter), colours (green #3F6F63, orange #D47A2C, text #111111, secondary #555555), spacing and style exactly.

The section should include:
- A label or tag that says "Beta — Free to use"
- A heading along the lines of "Preparing for your next interview?"
- A short 2-3 sentence description: "Our AI Interview Coach helps you practice with questions tailored to your actual job description. Answer out loud or in writing, and get personalised coaching on every response. Free to use during beta."
- A CTA button linking to https://coach.aievolvingyou.com that says "Try the Interview Coach →" — styled in the brand green #3F6F63 to match the existing "Explore the Work" button
- The section should have the animated green grid background that already exists on the hero (same CSS: repeating-linear-gradient with rgba(63, 111, 99, 0.07), 64px cells, gridDrift animation)
- Keep it clean and minimal — consistent with the rest of the site
- Place it between the existing main content sections, before the footer if there is one
```
