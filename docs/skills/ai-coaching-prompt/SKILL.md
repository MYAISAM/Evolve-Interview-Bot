# Skill: AI Coaching Prompt Pattern

## What This Solves
A proven prompt structure for getting Claude to give warm, specific, actionable coaching feedback on a user's answer or response. Works for interview prep, writing feedback, presentation coaching, or any "review my answer" use case.

## When To Use
- Building any coaching or feedback tool
- When you want AI feedback that feels human, not robotic
- When feedback needs to reference personal context about the user

---

## The Core Pattern

Three sections, always the same structure:
1. **What landed well** — genuine strength, specific to their answer
2. **What to sharpen** — one actionable improvement
3. **Try saying it like this** — a rewritten version they can actually use

This structure works because it's balanced (not just criticism), specific (not generic), and practical (gives them something to walk away with).

---

## The Prompt

```
You are a warm, direct [ROLE] coach helping a real candidate prepare for [CONTEXT]. Give personalised, specific feedback — not generic advice.

Use what you know about them:
- Their background: {BACKGROUND}
- Why they want this: {MOTIVATION}
- Their worry: {WORRY}
- Context: {SPECIFIC_CONTEXT}

Give feedback in exactly these 3 sections, using these exact headers:

What landed well:
(1-2 sentences — name something specific and genuine from their answer)

What to sharpen:
(1-2 sentences — one specific, actionable improvement)

Try saying it like this:
(Rewrite their answer in 2-3 punchy sentences they could actually use — make it sound like them, not a template)

Their answer: {ANSWER}

Keep the whole response under 200 words. Be a coach, not a critic. No bullet points, no markdown symbols — just the three plain sections with their headers.
```

---

## Rendering the Response in React

The AI returns plain text with the headers as the first word(s) of a line. Parse and style them:

```jsx
function FeedbackDisplay({ feedback }) {
  return (
    <div style={{ fontSize: 14, lineHeight: 1.8, color: "#111111" }}>
      {feedback.split('\n').map((line, i) => {
        const isHeader =
          line.startsWith("What landed well:") ||
          line.startsWith("What to sharpen:") ||
          line.startsWith("Try saying it like this:");

        return isHeader
          ? <p key={i} style={{
              fontWeight: 700,
              color: "#D47A2C",
              marginTop: i > 0 ? 16 : 0,
              marginBottom: 4,
              fontSize: 13,
              textTransform: "uppercase",
              letterSpacing: "0.04em"
            }}>{line}</p>
          : line.trim()
            ? <p key={i} style={{ margin: "0 0 4px" }}>{line}</p>
            : null;
      })}
    </div>
  );
}
```

---

## Cheat Sheet / Summary Prompt

At the end of a session, generate a summary cheat sheet:

```
Create a short, practical cheat sheet for this candidate. Warm, direct, confidence-building tone. Under 220 words.

Use exactly these 3 sections with plain text headers, no asterisks, no markdown:

Your strongest moments:
(2-3 bullet points using • symbol)

Watch out for:
(2 bullet points max using • symbol)

Walk in with this:
(one punchy sentence — the mindset to carry into the room)

Candidate background: {BACKGROUND}
Why they want this: {MOTIVATION}
Their biggest worry: {WORRY}
Context: {CONTEXT}
Session answers: {ANSWERS}

No markdown symbols. No asterisks. No dashes for bullets — use • only.
```

Render the summary:
```jsx
function SummaryDisplay({ cheatSheet }) {
  return (
    <div style={{ fontSize: 15, lineHeight: 1.85 }}>
      {cheatSheet.split('\n').map((line, i) => {
        const isHeader =
          line.startsWith("Your strongest moments:") ||
          line.startsWith("Watch out for:") ||
          line.startsWith("Walk in with this:");
        const isBullet = line.trim().startsWith("•");

        if (isHeader) return (
          <p key={i} style={{
            fontWeight: 700, color: "#3F6F63",
            marginTop: i > 0 ? 20 : 0, marginBottom: 6,
            fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em"
          }}>{line}</p>
        );
        if (isBullet) return <p key={i} style={{ margin: "0 0 6px", paddingLeft: 4 }}>{line}</p>;
        return line.trim() ? <p key={i} style={{ margin: "0 0 4px" }}>{line}</p> : null;
      })}
    </div>
  );
}
```

---

## Key Rules for the AI Prompt

- **Never use `**bold**` in the response** — it renders as raw asterisks in plain text. Use plain headers instead.
- **Always inject personal context** — background, motivation, worry. Without it the feedback is generic.
- **Set a word limit** — "under 200 words" keeps it tight and readable.
- **Say "be a coach, not a critic"** — shifts the tone significantly.
- **One improvement only** in "What to sharpen" — multiple criticisms overwhelm the user.
