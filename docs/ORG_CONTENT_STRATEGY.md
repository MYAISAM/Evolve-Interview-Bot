# AI Evolving You — Org Content Strategy Decisions

**Session date:** 20 April 2026
**Context:** Main site content planning — organisation track, product strategy, content ecosystem

---

## 1. Resources section restructured into two audience tracks

### Decision
Resources section split from a single list into two clearly labelled audience tracks:
- **For Candidates** — guided journey ending at the Interview Coach
- **For Organisations** — guided journey ending at paid framework products

### Journey labels (locked)
Start here → Next up → Then try this → Going deeper → [CTA]

### Why
Articles were sitting as isolated pieces with no connective logic. Two-track structure creates a journey, improves SEO through internal linking, and makes the CTA feel earned rather than forced.

---

## 2. Nav rename — Channels → Human Intelligence

### Decision
"Channels" in the desktop and mobile nav renamed to "Human Intelligence" — same dropdown, same links (YouTube + Substack), just the correct label.

### Why
"Channels" is a generic descriptor. "Human Intelligence" is the actual brand name of the content arm. Using two different names for the same thing (Channels in nav, Human Intelligence in the What's Here grid) created unnecessary confusion.

---

## 3. Four organisational content pillars defined

### Decision
The org track is built around four distinct content pillars, each with its own verb, product, and content job:

| Pillar | Verb | Linked product |
|--------|------|----------------|
| AI governance in hiring | Govern | AI Hiring Policy Framework — £79 |
| Bias and fairness in AI-enabled hiring | Audit | Bias Audit Checklist — £49 |
| Candidate transparency and trust | Communicate | Candidate Transparency Guide — £49 |
| Responsible procurement of AI hiring technology | Evaluate | AI Procurement Questions — £79 |

### Why
Without pillars, articles are random. With pillars, every piece of content has a job, a product destination, and a clear audience.

---

## 4. Four-verb framework locked

### Decision
Each product owns exactly one dominant verb. This prevents product blur and keeps the suite coherent.

- Governance → **govern**
- Bias/Fairness → **audit**
- Transparency/Trust → **communicate**
- Procurement → **evaluate**

### Implication
Every product page, article, and bundle description should orbit its pillar's verb.

---

## 5. Product boundary definitions locked

### Decision
Each product has a "what this is not" statement to prevent content from accidentally replacing the product:

**Governance framework**
Not a vendor questionnaire, not a legal policy, and not a generic template to paste into your handbook. It is an internal operating framework for how AI should be governed across the hiring process.

**Bias audit checklist**
Not a legal opinion, not a research paper, and not primarily a vendor assessment tool. It is an internal process review tool to help teams identify where bias risk may be entering or scaling in practice.

**Transparency guide**
Not a formal policy document, not legal advice, and not a broad employer brand manifesto. It is a communication and trust framework for explaining AI use in hiring clearly and credibly.

**Procurement toolkit**
Not internal governance, not a contract pack, and not a full risk register. It is a structured vendor evaluation tool to help teams question, compare, and assess AI hiring technology more effectively.

---

## 6. Pillar 3 reframed — the feedback loop argument

### Decision
Candidate transparency pillar reframed from "organisations should explain themselves better" to a systemic market problem with a mechanism:

1. Organisations use AI in hiring without explaining it
2. Candidates don't know what they're being evaluated against
3. Candidates use AI to navigate a process they don't understand
4. Application volume rises, quality signals degrade
5. Organisations add more automation to cope
6. Trust on both sides continues to erode
7. Loop repeats and tightens

**Transparency isn't a nicety. It's the circuit breaker.**

### Why
The original framing was soft — a polite ethics sidebar. This framing has a mechanism, a consequence, and a solution. It makes the product feel necessary rather than optional.

### Implication
This is the signature thought leadership argument for the org side of the platform. The Pillar 3 flagship article should be treated as a thesis piece — not just a resource but a public point of view to anchor LinkedIn, Substack, and YouTube content.

---

## 7. Org content ecosystem mapped — 12 articles across 3 layers

### Decision
Content structured in three layers per pillar:

**Layer 1 — Awareness** (what's changing)
- How AI is changing what employers look for
- The productivity expectation gap
- Why your workforce is anxious about AI — and what to do about it
- Why the traditional interview is no longer fit for purpose

**Layer 2 — Consequence** (what happens if you get it wrong)
- How AI bias enters the hiring process — and why most orgs don't see it
- What candidates now expect from employers using AI in hiring
- The AI vendor problem: why most hiring tools are a black box
- What a bad AI hiring policy looks like

**Layer 3 — Solution** (what good looks like — closest to product sale)
- What a responsible AI hiring policy actually covers
- How to audit your hiring process for AI bias
- How to talk to candidates about AI in your hiring process
- The questions every HR team should ask an AI hiring vendor

### Implication
Layer 3 articles sit closest to the product. Layer 1 and 2 build the case. Don't publish Layer 3 without Layer 1 and 2 supporting it — the reader needs to arrive already convinced they have a problem.

---

## 8. Content writing order locked

### Decision
First wave of content to produce (in this order):

1. Pillar 3 flagship — *AI in hiring has created a trust problem on both sides of the table* ✓ WRITTEN
2. Pillar 4 flagship — *What most organisations get wrong when buying AI hiring tools*
3. Pillar 2 opinion piece — *AI didn't remove bias from hiring. It gave it a uniform and a spreadsheet.*
4. Pillar 1 supporting article — *Who owns AI in your hiring process? Why most organisations don't have a clear answer*
5. Product pages for Governance and Procurement first

### Why
Leads with strongest point of view and most commercially sharp argument. Builds attention and gives it somewhere to land before adding supporting content.

---

## 9. Bundle logic — launch with two bundles

### Decision
Launch with two bundles only:

- **Starter** — Govern + Audit — £99
- **Full toolkit** — all four products — £149

Add a procurement-led bundle (Evaluate + Govern) only if vendor-buying content generates enough targeted traffic to warrant it.

### Why
Three bundles on a brand new offer creates decision paralysis. Two is enough to capture different buyer intents without overcomplicating the page.

---

## 10. Pricing — launch positions

### Decision
| Product | Launch price |
|---------|-------------|
| AI Hiring Policy Framework | £79 |
| Bias Audit Checklist | £49 |
| Candidate Transparency Guide | £49 |
| AI Procurement Questions for Hiring Teams | £79 |
| Starter bundle (Govern + Audit) | £99 |
| Full toolkit bundle (all four) | £149 |

### Why
Value and willingness to pay are not the same thing. Build conversion evidence at accessible prices first, then test higher on the two heavier products (Framework and Procurement) once there's traction. The naming and landing page framing will determine conversion more than the price point at this stage.

---

## 11. Phase 4 (naming and pricing polish) deferred

### Decision
Formal Phase 4 naming exercise skipped for now. Write the first articles and product pages first — naming will become obvious once real words exist on the page.

### Why
Naming forced before content exists tends to be abstract and gets changed anyway. Better to let the language emerge from the writing.

---

## Files produced this session

- `Nav.jsx` — Channels renamed to Human Intelligence
- `CONTENT_MAP.md` — full update with two-track structure
- `AIHiringTrustProblem.jsx` — Pillar 3 flagship article, ready to wire into site
- `article-ai-hiring-trust-problem.md` — same article in readable markdown
- `resources_structure_plan.svg` — two-track diagram (reference only, renders in Claude interface)

## Next session should start with

1. Review Pillar 3 article and approve or amend
2. Write Pillar 4 flagship — *What most organisations get wrong when buying AI hiring tools*
3. Wire both articles into the main site router and Resources section
4. Add org track section to Resources page UI