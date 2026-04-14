# Skill: Netlify Forms Integration in React

## What This Solves
Capturing form submissions from a React app and having them emailed to you — without a backend, database, or third-party service. Netlify handles it all.

## When To Use
- Feedback forms in any Netlify-hosted React app
- Contact forms
- Beta feedback collection
- Any "submit and email me" use case

---

## The Pattern

Netlify Forms works by detecting a hidden HTML form at build time, then intercepting matching fetch submissions at runtime.

### Step 1 — Add hidden form to index.html

Netlify scans your HTML at build time. The hidden form tells it what fields to expect.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Your App</title>
  </head>
  <body>
    <!-- Netlify Forms detection -->
    <form name="your-form-name" netlify netlify-honeypot="bot-field" hidden>
      <input type="text" name="field-one" />
      <textarea name="field-two"></textarea>
      <input type="email" name="email" />
    </form>

    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### Step 2 — Submit from React via fetch

```jsx
async function handleSubmit() {
  const formData = new URLSearchParams();
  formData.append("form-name", "your-form-name"); // must match exactly
  formData.append("field-one", fieldOneValue);
  formData.append("field-two", fieldTwoValue);
  formData.append("email", emailValue);

  await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData.toString(),
  });

  // Show thank you state
  setSubmitted(true);
}
```

### Step 3 — Set up email notifications in Netlify

1. Netlify → Project configuration → Forms
2. Find your form name in the list
3. Click into it → set up email notifications
4. Add your email address
5. Every submission will now email you

---

## Full React Component Example

```jsx
function FeedbackForm({ onSent, context }) {
  const [q1, setQ1] = useState("");
  const [q2, setQ2] = useState("");
  const [q3, setQ3] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const formData = new URLSearchParams();
      formData.append("form-name", "beta-feedback");
      formData.append("context", context || "");
      formData.append("what-worked", q1);
      formData.append("what-to-improve", q2);
      formData.append("what-would-make-you-use-it", q3);
      formData.append("email", email);

      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });
      onSent();
    } catch {
      onSent(); // show thank you even if it fails silently
    }
    setSubmitting(false);
  }

  return (
    <div>
      {[
        { label: "What worked well?", value: q1, set: setQ1 },
        { label: "What could be better?", value: q2, set: setQ2 },
        { label: "What would make you use this again?", value: q3, set: setQ3 },
      ].map((f, i) => (
        <div key={i} style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
            {f.label}
          </label>
          <textarea
            value={f.value}
            onChange={e => f.set(e.target.value)}
            rows={3}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.1)", fontSize: 14, outline: "none" }}
          />
        </div>
      ))}
      <div style={{ marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
          Your email <span style={{ fontWeight: 400, color: "#999" }}>(optional)</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@email.com"
          style={{ width: "100%", padding: "12px 14px", borderRadius: 8, border: "1.5px solid rgba(0,0,0,0.1)", fontSize: 14, outline: "none" }}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={submitting || (!q1 && !q2 && !q3)}
        style={{ background: "#D47A2C", color: "#fff", border: "none", borderRadius: 6, padding: "13px 26px", fontSize: 15, fontWeight: 500, cursor: "pointer" }}
      >
        {submitting ? "Sending…" : "Send feedback →"}
      </button>
    </div>
  );
}
```

---

## Critical Gotchas

### form-name must match exactly
The `form-name` value in the fetch call must exactly match the `name` attribute on the hidden HTML form. Case sensitive.

### Hidden form must be in index.html, not in React
Netlify scans static HTML at build time — it won't find forms rendered by React. The hidden form MUST be in `index.html`.

### All field names must be in the hidden form
If you submit a field from React that isn't declared in the hidden HTML form, it'll be silently dropped.

### Check Netlify → Forms after deploy
After deploying, go to Netlify → your site → Forms. Your form should appear there. If it doesn't, the hidden form wasn't detected — check index.html.

### Set up email notifications manually
Netlify doesn't automatically email you. You have to go into the form in the dashboard and add an email notification.
