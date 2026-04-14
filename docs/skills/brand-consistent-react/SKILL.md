# Skill: Brand-Consistent React App (AI Evolving You)

## What This Solves
Taking the aievolvingyou.com brand guide and applying it consistently to any new React tool or page built for the platform.

## When To Use
- Building any new tool for aievolvingyou.com or coach.aievolvingyou.com
- Creating a new page or component that needs to match the main site
- When someone says "make it match the site"

---

## The Brand Guide

### Typography
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
```
Google Fonts import:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```
- Body line-height: 1.6
- Headings: weight 700, letter-spacing -0.02em
- Labels: weight 600, uppercase, letter-spacing 0.06em

### Colours
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
  accentPop: "#D47A2C",    // orange — beta badge, secondary CTAs
  accentGreen: "#3F6F63",  // green — primary buttons, logo, links
  tag: "#edf4f2",
  tagText: "#3F6F63",
};
```

### Key Measurements
- Max content width: 720px
- Nav height: 62px
- Border radius cards: 10-12px
- Border radius buttons: 6px
- Border radius tags/pills: 20px

---

## Standard Components

### Nav Header
```jsx
<header style={{
  borderBottom: "1px solid rgba(0,0,0,0.08)",
  background: "#ffffff",
  padding: "0 24px",
  position: "sticky", top: 0, zIndex: 10,
}}>
  <div style={{ maxWidth: 720, margin: "0 auto", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
    <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15, color: "#3F6F63" }}>
      AI Evolving You
    </span>
  </div>
</header>
```

### Primary Button (green)
```jsx
<button style={{
  background: "#3F6F63",
  color: "#ffffff",
  border: "none",
  borderRadius: 6,
  padding: "13px 26px",
  fontSize: 15,
  fontWeight: 500,
  fontFamily: "'Inter', sans-serif",
  cursor: "pointer",
}}>
  Do something →
</button>
```

### Beta Badge (orange)
```jsx
<span style={{
  background: "#D47A2C",
  color: "#fff",
  fontSize: 10,
  fontWeight: 700,
  padding: "3px 8px",
  borderRadius: 3,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
}}>
  BETA
</span>
```

### Card
```jsx
<div style={{
  background: "#f9f9f9",
  border: "1.5px solid rgba(0,0,0,0.07)",
  borderRadius: 12,
  padding: "20px 22px",
}}>
  content
</div>
```

### Tag / Pill
```jsx
<span style={{
  background: "#edf4f2",
  color: "#3F6F63",
  fontSize: 11,
  fontWeight: 600,
  padding: "3px 10px",
  borderRadius: 20,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
}}>
  Label
</span>
```

---

## Hero Grid Animation

The animated background grid from the main site hero.

```css
@keyframes gridDrift {
  from { background-position: 0 0; }
  to { background-position: 128px 0; }
}

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
```

Usage in React (with scroll fade):
```jsx
function HeroSection() {
  const gridRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!gridRef.current) return;
      const progress = window.scrollY / (window.innerHeight * 0.55);
      gridRef.current.style.opacity = Math.max(0, 1 - progress);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ position: "relative" }}>
      <div ref={gridRef} className="grid-bg" aria-hidden="true" />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* hero content */}
      </div>
    </div>
  );
}
```

---

## CSS Base (add to css template string)

```js
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 16px; }
  body { background: #ffffff; color: #111111; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; }
  textarea, input { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes gridDrift { from { background-position: 0 0; } to { background-position: 128px 0; } }
  .fade-up { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) forwards; }
  .fade-in { animation: fadeIn 0.4s ease forwards; }
  .hover-lift { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
  .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
  .grid-bg {
    position: absolute; inset: 0;
    background-image:
      linear-gradient(rgba(63, 111, 99, 0.07) 1px, transparent 1px),
      linear-gradient(90deg, rgba(63, 111, 99, 0.07) 1px, transparent 1px);
    background-size: 64px 64px;
    animation: gridDrift 40s linear infinite;
    pointer-events: none;
    will-change: background-position;
  }
`;
```
