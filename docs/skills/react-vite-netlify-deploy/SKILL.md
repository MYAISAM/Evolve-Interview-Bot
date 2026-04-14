# Skill: React + Vite + Netlify + GitHub Deployment

## What This Solves
Full pipeline from a single React JSX file to a live production URL with auto-deploy on every git push. Includes SSH setup for Mac.

## When To Use
- Deploying any React/Vite app to Netlify
- Setting up GitHub version control for a new project
- First time connecting a local project to GitHub + Netlify

---

## Prerequisites
- GitHub account (note: your username is MetaMan, org is MYAISAM)
- Netlify account (connected to socialmetam's team)
- VS Code installed
- Node.js installed

---

## Step by Step

### 1. Set up project folder in VS Code terminal

```bash
mkdir "Your Project Name"
cd "Your Project Name"
npm create vite@latest . -- --template react
# When asked: choose "Ignore files and continue"
# Choose: Yes to install and start
# Ctrl+C to stop the dev server once it starts
```

### 2. Add your app file

```bash
rm -rf src
mkdir src
cp your-app-file.jsx src/App.jsx
cat > src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
EOF
```

### 3. Test locally

```bash
npm install
npm run dev
# Open http://localhost:5173
```

### 4. Set up SSH for GitHub (one time per machine)

```bash
ssh-keygen -t ed25519 -C "your-github-email@gmail.com"
# Hit Enter three times (accept defaults, no passphrase)
cat ~/.ssh/id_ed25519.pub
# Copy the entire output
```

Go to GitHub → Settings → SSH and GPG keys → New SSH key → paste → Save.

Test it:
```bash
ssh -T git@github.com
# Type "yes" when asked
# Should say: Hi MetaMan! You've successfully authenticated
```

### 5. Push to GitHub

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin git@github.com:MYAISAM/your-repo-name.git
git push -u origin main
```

Note: Use SSH URL (`git@github.com:...`) not HTTPS (`https://github.com/...`) — avoids token authentication issues.

### 6. Connect Netlify

1. netlify.com → Add new site → Import from GitHub
2. Find your repo
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions` (if using functions)
4. Deploy site

Netlify gives you a URL like `your-project.netlify.app` within ~60 seconds.

### 7. Add netlify.toml (if using functions or redirects)

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

### 8. Ongoing workflow

Every change:
```bash
git add .
git commit -m "describe what you changed"
git push
```
Netlify auto-rebuilds in ~60 seconds.

Force fresh build:
Netlify → Deploys → Trigger deploy → Clear cache and deploy site

---

## Subdomain Setup

To point `tool.aievolvingyou.com` at a Netlify site:

1. Netlify → Domain management → Add a domain → `tool.aievolvingyou.com`
2. Go to your DNS provider (where aievolvingyou.com is registered)
3. Add a CNAME record:
   - Name: `tool`
   - Value: `your-netlify-site.netlify.app`
4. Wait 10-30 mins to propagate

---

## Critical Gotchas

### Space in folder name
If your folder has a space (e.g. `Interview Bot`), wrap it in quotes always:
```bash
cd "Interview Bot"
```

### GitHub auth failures
Always use SSH not HTTPS for pushing. If you get 403 errors with HTTPS tokens, switch to SSH URL:
```bash
git remote set-url origin git@github.com:MYAISAM/repo-name.git
```

### Netlify not picking up changes
Check: Netlify → Deploys — is the latest commit hash showing? If not, trigger a manual deploy.

### Function not found
Make sure `netlify.toml` exists with the functions directory set AND the redirect rule. Without the redirect, `/api/anthropic` won't route to `/.netlify/functions/anthropic`.
