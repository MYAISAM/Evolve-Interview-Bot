# AI Evolving You — Interview Coach: Technical Architecture

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) — single JSX file `src/App.jsx` |
| Hosting | Netlify |
| Version control | GitHub — https://github.com/MYAISAM/Evolve-Interview-Bot |
| API | Anthropic Claude API (claude-sonnet-4-20250514) |
| Backend function | Netlify Function — `netlify/functions/anthropic.js` |
| Forms | Netlify Forms — `beta-feedback` |
| DNS | TBC — coach.aievolvingyou.com subdomain pending |

---

## Repository Structure

```
Interview Bot/
├── src/
│   ├── App.jsx          # Entire frontend application
│   └── main.jsx         # React entry point
├── netlify/
│   └── functions/
│       └── anthropic.js # API proxy function
├── public/
│   └── favicon.svg
├── index.html           # Includes Netlify form definition
├── netlify.toml         # Build config + redirect rules
├── package.json
└── vite.config.js
```

---

## API Architecture

The app calls the Anthropic API via a Netlify serverless function — never directly from the browser. This keeps the API key secure.

```
Browser → /api/anthropic
       → Netlify redirect → /.netlify/functions/anthropic
       → Netlify Function → api.anthropic.com
       → Response back to browser
```

### netlify.toml
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

---

## Environment Variables

| Key | Where | Purpose |
|-----|-------|---------|
| `ANTHROPIC_API_KEY` | Netlify → Project config → Environment variables | Used by the Netlify function to call Claude |
| `VITE_ANTHROPIC_API_KEY` | Netlify (legacy) | Not used — can be removed |

---

## API Costs

- Model: claude-sonnet-4-20250514
- Cost: ~$0.01 per full session (question generation + coaching feedback + summary)
- $5 credit ≈ 500 sessions
- Monthly spend limit set to $100 (safety cap)
- Billing: console.anthropic.com

---

## Deployment

Auto-deploys on every push to `main` branch on GitHub.

**Manual deploy:**
Netlify dashboard → Deploys → Trigger deploy → Clear cache and deploy site

**Local development:**
```bash
cd "Interview Bot"
npm run dev
# Opens at http://localhost:5173
```

**Push changes:**
```bash
git add .
git commit -m "description of change"
git push
```

---

## Voice Input

Uses browser Web Speech API (`window.SpeechRecognition`).
- Works: Chrome, Edge, Safari (partial)
- Doesn't work: Firefox
- Language: en-GB
- Continuous + interim results enabled
- Fills the text box as user speaks — user can edit before submitting
