# Skill: Netlify API Proxy Function

## What This Solves
When you call an external API (like Anthropic, OpenAI, etc.) from a React frontend, the API key is exposed in the browser. This skill secures it behind a Netlify serverless function.

## When To Use
- Any React/Vite app deployed on Netlify that calls a paid external API
- When you see CORS errors calling an API directly from the browser
- When Anthropic or other providers block direct browser requests

---

## The Pattern

### 1. Create the function file
`netlify/functions/anthropic.js`

```js
exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "",
    };
  }

  try {
    const body = JSON.parse(event.body);
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
```

### 2. Add redirect in netlify.toml
```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### 3. Set the API key in Netlify
Netlify dashboard → Project configuration → Environment variables → Add:
- Key: `ANTHROPIC_API_KEY`
- Value: your API key from console.anthropic.com

### 4. Call it from React
```js
const API = "/api/anthropic"; // NOT the direct Anthropic URL

const res = await fetch(API, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role: "user", content: "Your prompt here" }],
  }),
});
const data = await res.json();
```

---

## Critical Gotchas

### Use CommonJS format, NOT ES modules
❌ This will fail silently:
```js
export default async (req) => { ... }
export const config = { path: "/api/anthropic" };
```

✅ This works:
```js
exports.handler = async (event) => { ... }
```

### VITE_ prefix doesn't work in functions
- `VITE_ANTHROPIC_API_KEY` is only available to the frontend build
- Netlify functions need `ANTHROPIC_API_KEY` (no VITE_ prefix)
- You can have both — they serve different purposes

### Test the function directly
```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/anthropic \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":100,"messages":[{"role":"user","content":"Say hello"}]}'
```

If you get `{"error":"Unexpected end of JSON input"}` — the function IS running, it just needs a POST body. That's a good sign.

If you get a credit/auth error — the function is working but API key has issues.

### Check Netlify function logs
Netlify → Logs & metrics → Functions → click function name → View function log

---

## Cost Reference (Anthropic)
- claude-sonnet-4-20250514: $3/million input tokens, $15/million output tokens
- Typical session (questions + feedback + summary): ~$0.01
- $5 credit ≈ 500 sessions
