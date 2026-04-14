# AI Evolving You — Brand & Design Guide

## Site
- Main site: https://aievolvingyou.com
- Interview Coach: https://evolve-interview-coach.netlify.app
- Target subdomain: https://coach.aievolvingyou.com

---

## Typography

- **Font:** Inter (Google Fonts)
- **URL:** https://fonts.google.com/specimen/Inter
- **Weights in use:** 300, 400, 500, 600, 700
- **Fallback stack:** `-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif`
- **Body line-height:** 1.6

### Usage
- Headings: Inter 700, letter-spacing -0.02em
- Body: Inter 400
- Labels/caps: Inter 600, uppercase, letter-spacing 0.06em
- Supporting text: Inter 300

---

## Colour Palette

| Name | Hex | Usage |
|------|-----|-------|
| Green accent | `#3F6F63` | Nav logo, CTAs, primary buttons, section labels, links |
| Orange accent | `#D47A2C` | Hover states, beta badge, exploring section borders, secondary CTAs |
| Text primary | `#111111` | Headlines, body copy |
| Text secondary | `#555555` | Nav links, supporting text |
| Background | `#FFFFFF` | Page background |
| Surface | `#f9f9f9` | Card backgrounds |
| Surface alt | `#f2f2f2` | Tag backgrounds, hover states |
| UI border | `rgba(0,0,0,0.07)` | Nav underline, form inputs, card borders |
| Divider | `rgba(0,0,0,0.08)` | Section-to-section lines |

---

## Key Measurements

- Max content width: `720px`
- Nav height: `62px`
- Body line-height: `1.6`
- Border radius (cards): `10-12px`
- Border radius (buttons): `6px`
- Border radius (tags): `20px` (pill)

---

## Hero Grid

The animated background grid used on the landing page hero.

```css
.grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(63, 111, 99, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(63, 111, 99, 0.07) 1px, transparent 1px);
  background-size: 64px 64px;
  animation: gridDrift 40s linear infinite;
  pointer-events: none;
  will-change: background-position;
}

@keyframes gridDrift {
  from { background-position: 0 0; }
  to { background-position: 128px 0; }
}
```

- Colour: `#3F6F63` at 7% opacity
- Cell size: 64px × 64px
- Animation: 40s loop, drifts right
- Scroll fade: opacity reduces as user scrolls past 55% of viewport height

---

## Button Styles

```js
// Primary (green)
{ background: "#3F6F63", color: "#ffffff", borderRadius: 6, fontWeight: 500 }

// Outline
{ background: "transparent", border: "1px solid rgba(0,0,0,0.15)", color: "#111111" }

// Pop (orange) — secondary actions
{ background: "#D47A2C", color: "#ffffff" }
```

---

## Design Tokens (React)

```js
const t = {
  bg: "#ffffff",
  surface: "#f9f9f9",
  surfaceAlt: "#f2f2f2",
  border: "rgba(0,0,0,0.07)",
  borderDivider: "rgba(0,0,0,0.08)",
  ink: "#111111",
  inkMid: "#555555",
  inkLight: "#999999",
  accentPop: "#D47A2C",
  accentGreen: "#3F6F63",
  tag: "#edf4f2",
  tagText: "#3F6F63",
};
```
