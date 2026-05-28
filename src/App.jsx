import { useState, useEffect, useRef } from "react";

const API = "/api/anthropic";
const AUTH_API = "/api/auth";
let currentUser = null;
let currentAccessToken = null;

// ── Supabase helpers (routed via Netlify function) ────────────────
async function supabaseInsert(sessionData) {
  if (!currentAccessToken) return null;
  try {
    const res = await fetch(AUTH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "insertSession", sessionData: { ...sessionData, user_id: currentUser?.id }, accessToken: currentAccessToken }),
    });
    const data = await res.json();
    return data.success ? data.session : null;
  } catch (e) { console.error("Session insert error:", e); return null; }
}

async function supabaseUpdate(sessionId, updates) {
  if (!currentAccessToken || !sessionId) return;
  try {
    await fetch(AUTH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateSession", sessionId, updates, accessToken: currentAccessToken }),
    });
  } catch (e) { console.error("Session update error:", e); }
}

async function saveSessionState(sessionState) {
  if (!currentAccessToken) return null;
  try {
    const res = await fetch(AUTH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "saveSessionState", sessionState, accessToken: currentAccessToken }),
    });
    const data = await res.json();
    return data.success ? data.sessionId : null;
  } catch (e) { console.error("Save session state error:", e); return null; }
}

async function restoreSessionState(sessionId) {
  if (!currentAccessToken || !sessionId) return null;
  try {
    const res = await fetch(AUTH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "restoreSessionState", sessionId, accessToken: currentAccessToken }),
    });
    const data = await res.json();
    return data.success ? data.session : null;
  } catch (e) { console.error("Restore session state error:", e); return null; }
}

async function addCreditsAfterPayment(tier) {
  const token = currentAccessToken || sessionStorage.getItem("aey_token");
  const user = currentUser || (() => { try { return JSON.parse(sessionStorage.getItem("aey_user")); } catch(e) { return null; } })();
  if (!token || !user) return;
  try {
    await fetch(AUTH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "addCredits", tier, userId: user.id, accessToken: token }),
    });
  } catch (e) { console.error("Add credits error:", e); }
}

async function getCredits() {
  const token = currentAccessToken || sessionStorage.getItem("aey_token");
  if (!token) return null;
  try {
    const res = await fetch(AUTH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getCredits", accessToken: token }),
    });
    const data = await res.json();
    return data.success ? data.credits : null;
  } catch (e) { console.error("Get credits error:", e); return null; }
}

async function getUserSessions() {
  const token = currentAccessToken || sessionStorage.getItem("aey_token");
  if (!token) return [];
  try {
    const res = await fetch(AUTH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getSessionHistory", accessToken: token }),
    });
    const data = await res.json();
    return data.success ? (data.sessions || []) : [];
  } catch (e) { console.error("Get sessions error:", e); return []; }
}

async function updateSessionOutcome(sessionId, outcome, notes, interviewDate) {
  if (!currentAccessToken || !sessionId) return;
  try {
    await fetch(AUTH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "updateInterviewOutcome", sessionId, outcome, notes, interviewDate: interviewDate || null, accessToken: currentAccessToken }),
    });
  } catch (e) { console.error("Update outcome error:", e); }
}

async function getProfile() {
  if (!currentAccessToken) return null;
  try {
    const res = await fetch(AUTH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "getProfile", accessToken: currentAccessToken }),
    });
    const data = await res.json();
    return data.success ? data.profile : null;
  } catch (e) { console.error("Get profile error:", e); return null; }
}

async function saveProfile(background, worry) {
  if (!currentAccessToken) return;
  try {
    await fetch(AUTH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "saveProfile", background, worry, accessToken: currentAccessToken }),
    });
  } catch (e) { console.error("Save profile error:", e); }
}

function generateToken() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}


// ── Design tokens ─────────────────────────────────────────────────
const t = {
  bg: "#ffffff",
  surface: "#f9f9f9",
  surfaceAlt: "#f2f2f2",
  border: "rgba(0,0,0,0.07)",
  borderDivider: "rgba(0,0,0,0.08)",
  ink: "#111111",
  inkMid: "#555555",
  inkLight: "#999999",
  accent: "#111111",
  accentPop: "#D47A2C",
  accentGreen: "#3F6F63",
  tag: "#edf4f2",
  tagText: "#3F6F63",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 16px; }
  body { background: #ffffff; color: #111111; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.6; }
  textarea, input { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.12); border-radius: 2px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:.3;} }
  @keyframes shimmer { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
  @keyframes gridDrift { from { background-position: 0 0; } to { background-position: 128px 0; } }
  @keyframes dotBounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4;} 40%{transform:scale(1);opacity:1;} }
  .fade-up { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) forwards; }
  .fade-in { animation: fadeIn 0.4s ease forwards; }
  .dot1{animation:dotBounce 1.4s infinite ease-in-out;} 
  .dot2{animation:dotBounce 1.4s 0.2s infinite ease-in-out;} 
  .dot3{animation:dotBounce 1.4s 0.4s infinite ease-in-out;}
  .hover-lift { transition: transform 0.2s, box-shadow 0.2s; cursor:pointer; }
  .hover-lift:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.08); }
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
  @media print {
    header,
    .no-print,
    main > div > *:not(#pdf-content) {
      display: none !important;
    }

    html,
    body {
      background: white !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    main,
    main > div {
      display: block !important;
      max-width: none !important;
      width: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    #pdf-content {
      display: block !important;
      position: static !important;
      width: auto !important;
      max-width: none !important;
      height: auto !important;
      min-height: 0 !important;
      overflow: visible !important;
      padding: 0 !important;
      margin: 0 !important;
      font-family: 'Inter', sans-serif;
      color: #111111;
      background: white;
  }

#pdf-content > * {
  overflow: visible !important;
}

    .cheat-sheet-print h1 {
      font-size: 22px;
      font-weight: 700;
      color: #3F6F63;
      margin-bottom: 4px;
    }

    .cheat-sheet-print h2 {
      font-size: 13px;
      font-weight: 700;
      color: #D47A2C;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      margin: 20px 0 6px;
    }

    .cheat-sheet-print p,
    .cheat-sheet-print li {
      font-size: 13px;
      line-height: 1.7;
      color: #111111;
    }

    .cheat-sheet-print .qa-block {
      border-left: 3px solid #3F6F63;
      padding-left: 12px;
      margin-bottom: 16px;
      break-inside: auto;
      page-break-inside: auto;
    }

    .cheat-sheet-print .qa-q {
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 4px;
    }

    .cheat-sheet-print .qa-a {
      font-size: 12px;
      color: #555555;
      font-style: italic;
    }

    .cheat-sheet-print .qa-coaching {
      font-size: 12px;
      color: #D47A2C;
      margin-top: 4px;
    }

    .cheat-sheet-print .divider {
      border: none;
      border-top: 1px solid #eeeeee;
      margin: 20px 0;
    }

    @page {
      margin: 20mm;
    }
  }

  .print-only {
    display: none;
  }

`;

// ── SVG Icon System ───────────────────────────────────────────────
function Icon({ name, size = 20, colour = t.accentGreen }) {
  const paths = {
    sales: "M3 17l4-8 4 3 4-6 4 8M3 21h18",
    cs: "M17 20h5v-1a4 4 0 00-5.5-3.7M9 20H4v-1a4 4 0 015.5-3.7M13 8a4 4 0 11-8 0 4 4 0 018 0zm6 4a3 3 0 11-6 0 3 3 0 016 0z",
    recruitment: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    product: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM17 14l-3 6h6l-3-6z",
    engineering: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
    general: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
    mic: "M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2M12 19v4M8 23h8",
    check: "M20 6L9 17l-5-5",
    arrow: "M5 12h14M12 5l7 7-7 7",
    arrowLeft: "M19 12H5M12 19l-7-7 7-7",
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    book: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 004 17V4h16v13H6.5M4 19.5V21",
    film: "M7 4v16M17 4v16M3 8h4M17 8h4M3 12h18M3 16h4M17 16h4M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z",
    target: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z",
    sparkle: "M12 3v1M12 20v1M4.22 4.22l.7.7M19.08 19.08l.7.7M3 12h1M20 12h1M4.22 19.78l.7-.7M19.08 4.92l.7-.7M12 7a5 5 0 100 10A5 5 0 0012 7z",
    warning: "M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
    refresh: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colour} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

// ── Question Bank ─────────────────────────────────────────────────
const ROLE_FAMILIES = ["commercial", "people_talent", "product_tech", "marketing", "finance_ops", "hr_people", "project_programme", "general"];
const CAREER_STAGES = ["graduate", "experienced", "career_changer", "returner", "mindset", "tough_questions"];

const QUESTION_BANK = {

  commercial: {
    label: "Commercial & Revenue",
    sublabel: "Sales, Account Management, Customer Success",
    icon: "sales",
    colour: "#e8f0fe",
    borderColour: "#1d4e89",
    questions: [
      "Walk me through a deal or account win you're most proud of — what made it work?",
      "Tell me about a time you lost a deal or a customer you thought you'd keep. What did you learn?",
      "How do you build rapport with a prospect or client who is initially cold or resistant?",
      "Describe your process for managing a complex, multi-stakeholder relationship.",
      "How do you handle objections — whether around price, timing, or fit?",
      "Tell me about a time you exceeded your targets. What specifically drove that performance?",
      "How do you stay motivated during a slow pipeline or a difficult quarter?",
      "Describe a time you had to adapt your approach for a new market, product, or buyer type.",
      "Tell me about a time you turned a customer around from being at risk of churning.",
      "How do you identify growth or expansion opportunities without being pushy?",
      "Walk me through how you prepare for a high-stakes client meeting or renewal conversation.",
      "Describe a time you collaborated with another team — marketing, product, or ops — to win or retain a customer.",
      "How do you use data to manage your accounts or pipeline day to day?",
      "Tell me about a time you had to deliver difficult news to a client. How did you handle it?",
      "How do you prioritise your time when you have multiple accounts or opportunities competing for attention?",
      "Tell me about the toughest negotiation you've been part of — what happened?",
      "Describe a situation where you identified an upsell or cross-sell opportunity and acted on it.",
      "How do you measure the health of an account or relationship beyond surface-level metrics?",
      "Tell me about a time you had to rebuild trust with a client after something went wrong.",
      "How would you manage a renewal where usage has been low and the client seems disengaged?",
      "Describe a time you challenged a client's assumptions — what was the outcome?",
      "Tell me about a time you used data or insight to change a client's thinking.",
      "What does your process look like for onboarding a new client or account?",
      "How would you handle being significantly behind on your number halfway through the quarter?",
      "Describe your proudest commercial accomplishment and why it matters to you.",
    ],
  },

  people_talent: {
    label: "People & Talent",
    sublabel: "Recruitment, Talent Acquisition, Sourcing",
    icon: "recruitment",
    colour: "#fff8e8",
    borderColour: "#b8860b",
    questions: [
      "Tell me about a hard-to-fill role you successfully closed. What was your approach?",
      "How do you build a talent pipeline for roles before they're open?",
      "Describe a time you pushed back on a hiring manager's brief. What happened?",
      "How do you ensure your hiring process is inclusive and actively reduces bias?",
      "Tell me about a hire you made that didn't work out. What did you learn?",
      "How do you assess cultural contribution without it becoming a proxy for bias?",
      "Walk me through how you manage candidate experience across a long or complex process.",
      "Describe a time you had to fill multiple roles simultaneously under pressure.",
      "How do you use data to improve your recruitment process or results?",
      "Tell me about a time you had to sell a role to a highly passive candidate.",
      "How would you handle a hiring manager who consistently disagrees with your recommendations?",
      "Describe a sourcing strategy you've used creatively to reach hard-to-find talent.",
      "What drew you to a career in recruitment or talent acquisition?",
      "How would you improve time-to-hire without compromising on quality?",
      "Tell me about a time a candidate withdrew late in the process — how did you handle it?",
      "How would you approach hiring in a new market where your employer brand is unknown?",
      "Describe a time you navigated a salary negotiation that was outside your approved budget.",
      "Tell me about a time you implemented a new process or tool that improved hiring outcomes.",
      "How do you maintain relationships with candidates who weren't selected for future opportunities?",
      "Describe a time you had to manage a hiring freeze or sudden change in headcount plans.",
      "How would you handle a situation where a finalist candidate receives a counter-offer?",
      "Tell me about a time you influenced a senior stakeholder to change their approach to hiring.",
      "How do you keep candidates engaged across a lengthy or multi-stage process?",
      "Describe a time you contributed to improving diversity outcomes in a hiring process.",
      "What does great talent partnership with the business look like to you?",
    ],
  },

  product_tech: {
    label: "Product & Technology",
    sublabel: "Product Management, Engineering, UX",
    icon: "product",
    colour: "#fce8f0",
    borderColour: "#8b1a4a",
    questions: [
      "Walk me through a product decision or build you're most proud of — from insight to outcome.",
      "Tell me about a time you had to say no to a feature request or stakeholder ask. How did you handle it?",
      "How do you decide what to prioritise when everything feels urgent?",
      "Describe a time something you shipped didn't land as expected. What did you do?",
      "How do you balance short-term fixes with long-term strategic work?",
      "Tell me about how you build alignment between technical, design, and commercial teams.",
      "How do you validate an idea before committing to building it?",
      "Describe your approach to writing a spec, brief, or technical requirement.",
      "Tell me about a time you used data to challenge an assumption about users or behaviour.",
      "How do you stay connected to what customers or users actually need?",
      "Describe a time you had to make a significant technical or product call with incomplete information.",
      "Tell me about a time you worked across teams to resolve a complex technical or product problem.",
      "How do you approach code reviews, design critiques, or product feedback sessions?",
      "Describe a situation where technical debt significantly influenced your product decisions.",
      "Tell me about a time you dealt with a production incident or critical bug — what did you do?",
      "How do you communicate technical complexity to non-technical stakeholders?",
      "Describe a time you advocated for the user or customer when business pressure pushed in a different direction.",
      "Tell me about a time you had to learn a new technology, tool, or domain quickly.",
      "How do you think about quality — and how do you maintain it under tight deadlines?",
      "Describe a time you worked in an unfamiliar codebase or product area. How did you approach it?",
      "Tell me about a time you proactively identified and prevented a problem before it escalated.",
      "How do you make sure the team stays focused and unblocked during a complex build?",
      "Describe a situation where you had to change direction mid-build. How did you manage it?",
      "Tell me about a time you contributed to improving how your team works, not just what it builds.",
      "What does good product or engineering culture look like to you?",
    ],
  },

  marketing: {
    label: "Marketing & Brand",
    sublabel: "Marketing, Content, Growth, Brand Strategy",
    icon: "target",
    colour: "#e8fef0",
    borderColour: "#1a7a4a",
    questions: [
      "Walk me through a campaign or piece of work you're most proud of — from brief to result.",
      "Tell me about a time a campaign or strategy didn't perform as expected. What did you learn?",
      "How do you approach building a brand story that resonates with a specific audience?",
      "Describe how you balance creative instinct with performance data in your work.",
      "Tell me about a time you had to make a case for a marketing investment to a sceptical stakeholder.",
      "How do you approach audience research and insight before launching a new campaign?",
      "Describe a time you had to work with a very limited budget. What did you prioritise?",
      "Tell me about a time you collaborated with sales, product, or another team to drive a shared outcome.",
      "How do you measure the effectiveness of brand or awareness activity?",
      "Describe a time you identified a growth or acquisition opportunity others had missed.",
      "How do you approach content strategy — what makes content genuinely useful rather than noise?",
      "Tell me about a time you managed multiple campaigns or projects simultaneously under pressure.",
      "How do you stay on top of trends and channel shifts without chasing every new thing?",
      "Describe a time you had to adapt messaging quickly due to market, cultural, or competitive changes.",
      "Tell me about a time you used data or testing to improve a piece of marketing significantly.",
      "How do you think about the relationship between short-term performance and long-term brand building?",
      "Describe a situation where you had to manage external agencies or creative partners.",
      "Tell me about a time you built or refreshed a brand from the ground up.",
      "How do you approach SEO, organic growth, or distribution as part of your marketing thinking?",
      "Describe a time you had to communicate a complex or sensitive topic clearly to a broad audience.",
      "Tell me about a launch you planned and executed — what went well and what would you do differently?",
      "How do you build a community or audience around a brand rather than just broadcasting at them?",
      "Describe a time you turned customer insight or feedback directly into marketing output.",
      "Tell me about a time you had to defend or evolve a brand position under pressure.",
      "What does truly great marketing look like to you — and give me an example from your own work.",
    ],
  },

  finance_ops: {
    label: "Finance & Operations",
    sublabel: "Finance, Accounting, Operations, Supply Chain",
    icon: "book",
    colour: "#eef4fe",
    borderColour: "#2c4a9e",
    questions: [
      "Walk me through a piece of financial analysis or operational improvement you're proud of.",
      "Tell me about a time you identified a significant inefficiency or cost-saving opportunity.",
      "How do you manage competing priorities when multiple stakeholders need your support simultaneously?",
      "Describe a time you had to present financial or operational data to a non-technical audience.",
      "Tell me about a time a forecast or plan was significantly off. What happened and what did you learn?",
      "How do you build financial models or operational processes that are robust enough to handle real-world complexity?",
      "Describe a time you worked cross-functionally to improve a process that crossed team boundaries.",
      "Tell me about a time you had to manage a supplier, vendor, or partner relationship through a difficult period.",
      "How do you approach budgeting and resource allocation when demand exceeds capacity?",
      "Describe a situation where you used data to drive a significant operational or financial decision.",
      "Tell me about a time you managed risk — financial, operational, or compliance — under pressure.",
      "How do you stay on top of accuracy and detail when working at pace?",
      "Describe a time you implemented or improved a financial control or operational system.",
      "Tell me about a time you had to balance short-term cost pressures with long-term investment needs.",
      "How do you build relationships with stakeholders who don't naturally think in financial or operational terms?",
      "Describe a time you had to navigate ambiguity where the data wasn't clear enough to give a definitive answer.",
      "Tell me about a time you supported a significant business decision with financial modelling or analysis.",
      "How do you approach month-end, quarter-end, or audit processes to maintain quality under time pressure?",
      "Describe a situation where you identified a compliance or governance risk and how you addressed it.",
      "Tell me about a time you improved forecasting accuracy or reduced variance in a plan.",
      "How do you manage operational performance when things outside your control go wrong?",
      "Describe a time you had to push back on a business request because it wasn't financially or operationally viable.",
      "Tell me about a time you led or contributed to a significant change programme or transformation.",
      "How do you keep your team or process aligned during periods of rapid growth or change?",
      "What does operational or financial excellence look like to you in practice?",
    ],
  },

  hr_people: {
    label: "HR & People Ops",
    sublabel: "HR Generalist, L&D, Employee Relations, People Ops",
    icon: "cs",
    colour: "#f0feee",
    borderColour: "#2d6a2f",
    questions: [
      "Tell me about a time you supported an employee or manager through a particularly difficult situation.",
      "How do you balance being an advocate for employees while also representing the business?",
      "Describe a time you had to manage a complex employee relations case. What was your approach?",
      "Tell me about a time you introduced or improved a people process that had a measurable impact.",
      "How do you build trust with employees across different levels of an organisation?",
      "Describe a situation where you had to deliver a difficult message to an employee or team.",
      "Tell me about a time you worked with leadership to shape or improve culture.",
      "How do you approach performance management in a way that's fair, consistent, and constructive?",
      "Describe a time you used data or people analytics to influence a people decision.",
      "Tell me about a time you had to navigate a situation where policy and common sense were in tension.",
      "How do you design or facilitate learning and development that actually changes behaviour?",
      "Describe a situation where you had to manage a grievance or disciplinary process under pressure.",
      "Tell me about a time you supported organisational change and helped people through it.",
      "How do you approach onboarding to set new employees up for long-term success?",
      "Describe a time you identified a capability gap in the organisation and addressed it.",
      "Tell me about a time you had to give honest feedback to a senior leader or manager.",
      "How do you stay current with employment law and translate it into practical advice?",
      "Describe a time you contributed to improving diversity, equity, or inclusion outcomes.",
      "Tell me about a time a people initiative you championed didn't land as expected. What did you learn?",
      "How do you prioritise when you're supporting multiple business units with competing needs?",
      "Describe a situation where you helped a manager become more effective in their role.",
      "Tell me about a time you had to work through a restructure, redundancy, or TUPE situation.",
      "How do you make sure HR is seen as a strategic partner and not just a compliance function?",
      "Describe a time you built an HR process or policy from scratch for a growing organisation.",
      "What does a high-performing people function look like to you?",
    ],
  },

  project_programme: {
    label: "Project & Programme Management",
    sublabel: "Project Management, PMO, Programme Delivery",
    icon: "film",
    colour: "#fef4e8",
    borderColour: "#9e5a1a",
    questions: [
      "Walk me through a project or programme you're most proud of delivering — what made it work?",
      "Tell me about a project that went off track. What happened and how did you recover it?",
      "How do you manage scope creep when stakeholders keep adding to a project mid-delivery?",
      "Describe how you approach stakeholder mapping and engagement at the start of a new project.",
      "Tell me about a time you had to deliver under significant time, budget, or resource constraints.",
      "How do you build and maintain team momentum across a long or complex programme?",
      "Describe a time you had to escalate a risk or issue. How did you manage it?",
      "Tell me about a time you managed multiple workstreams or projects simultaneously.",
      "How do you approach project planning — what does good look like to you?",
      "Describe a situation where a key dependency outside your control threatened delivery. What did you do?",
      "Tell me about a time you had to manage a difficult team dynamic on a project.",
      "How do you ensure lessons from one project are actually applied to the next?",
      "Describe a time you had to get buy-in from a reluctant or resistant stakeholder.",
      "Tell me about a time a project delivered on time and budget but still didn't meet expectations. What did you learn?",
      "How do you balance following a methodology with being pragmatic about what actually works?",
      "Describe a time you introduced a new tool, process, or practice that improved project delivery.",
      "Tell me about a time you had to make a significant project decision without all the information you needed.",
      "How do you communicate progress and risk to senior stakeholders who aren't close to the detail?",
      "Describe a situation where you had to reprioritise significantly mid-project due to a change in business direction.",
      "Tell me about a time you worked across multiple teams or organisations to deliver a shared outcome.",
      "How do you build a project culture where the team flags problems early rather than hiding them?",
      "Describe a time you managed a technology or systems implementation project.",
      "Tell me about a time you had to close down or pivot a project that wasn't delivering value.",
      "How do you measure success on a project beyond on-time and on-budget delivery?",
      "What does great programme leadership look like to you?",
    ],
  },

  general: {
    label: "General / Any Role",
    sublabel: "Universal questions for any job or sector",
    icon: "general",
    colour: "#f5f2eb",
    borderColour: "#6b6660",
    questions: [
      "Tell me about yourself and what's brought you to this point in your career.",
      "What are you looking for in your next role that you don't currently have?",
      "Describe a time you had to work with someone whose style was very different from yours.",
      "Tell me about a piece of feedback that genuinely changed how you work.",
      "What does good look like to you in the kind of role you're applying for?",
      "Describe a time you had to manage competing priorities under real pressure.",
      "Tell me about something you've taught yourself outside of work.",
      "How do you know when you've done a good job?",
      "What would your last manager say is your biggest development area — and would you agree?",
      "Where do you want to be in three years, and why does this role get you there?",
      "Tell me about a time you faced a major setback at work. How did you handle it?",
      "What kind of environment helps you perform at your best?",
      "How do you handle receiving critical feedback in the moment?",
      "Tell me about a time you went significantly beyond what was expected of you.",
      "What values do you look for in an employer — and how do you assess them in an interview process?",
      "Tell me about a time you made a mistake at work and how you handled it.",
      "How would you approach a colleague who isn't pulling their weight on a shared project?",
      "What are you most proud of in your career so far?",
      "Tell me about a time you demonstrated leadership without having a formal leadership title.",
      "How would you respond if you strongly disagreed with a decision made above you?",
      "Describe a time you helped improve team morale during a difficult period.",
      "How would you approach your first 90 days in a new role?",
      "Tell me about a time you had to adapt quickly to a major change you didn't choose.",
      "Describe a situation where doing the right thing was harder than doing the easy thing.",
      "What motivates you to do your best work — and how does this role connect to that?",
    ],
  },

  graduate: {
    label: "Graduate & Early Careers",
    sublabel: "First job, internships, placements, apprenticeships",
    icon: "sparkle",
    colour: "#fff0e8",
    borderColour: "#c2410c",
    questions: [
      "Tell me about yourself — your degree, your experience so far, and why you're here.",
      "Why have you applied for this role specifically — what drew you to it?",
      "What did you study and how does it prepare you for this kind of work?",
      "Tell me about a project, dissertation, or piece of work you're genuinely proud of.",
      "Describe a time you had to manage multiple deadlines at once — how did you cope?",
      "Tell me about a time you worked as part of a team toward a shared goal.",
      "What extracurricular activities, jobs, or experiences have shaped how you work?",
      "Describe a situation where you had to learn something new quickly under pressure.",
      "Tell me about a time you took initiative without being asked.",
      "How do you handle feedback — give me an example of a time you acted on it meaningfully.",
      "What's the biggest challenge you've faced so far, and how did you deal with it?",
      "Tell me about a time you disagreed with someone — how did you handle it?",
      "Describe a situation where things didn't go to plan — what did you do?",
      "What does good teamwork look like to you — and give me an example from your experience.",
      "Tell me about a time you had to persuade someone to see your point of view.",
      "How do you stay organised and manage your time when you have a lot on?",
      "Tell me about something you've taught yourself outside of your studies or work.",
      "Why do you want to start your career in this sector or type of role?",
      "What do you know about this organisation and why does it appeal to you?",
      "Where do you want to be in three to five years, and how does this role fit that?",
      "Tell me about a time you showed resilience when something felt really difficult.",
      "Describe a situation where you had to adapt quickly to an unexpected change.",
      "What kind of workplace culture do you think you'd thrive in — and why?",
      "Tell me about a time you contributed something meaningful to a group or community.",
      "What's one thing about yourself that doesn't show up on your CV but matters to you?",
    ],
  },

  experienced: {
    label: "Experienced Hire",
    sublabel: "5+ years experience, senior roles, leadership",
    icon: "star",
    colour: "#f0e8fe",
    borderColour: "#6d28d9",
    questions: [
      "Walk me through the defining moments of your career so far — what's shaped how you work?",
      "Tell me about the most complex challenge you've faced in your career and how you navigated it.",
      "How has your leadership style evolved over the years — and what changed it?",
      "Describe a time you had to make a high-stakes decision with limited information or time.",
      "Tell me about a time you led a team through significant change or uncertainty.",
      "How do you approach building credibility quickly in a new organisation or role?",
      "Describe a time you had to influence at a senior level without having direct authority.",
      "Tell me about a time you had to challenge the status quo — what happened?",
      "How do you develop and retain talented people in your team?",
      "Describe a situation where you had to balance the needs of your team with the wider business agenda.",
      "Tell me about a time you turned around a failing team, project, or relationship.",
      "How do you manage your own development at this stage of your career?",
      "Describe a time you made a decision that was unpopular but the right call.",
      "Tell me about a time you built something — a team, a function, a process — from scratch.",
      "How do you stay close to the detail without micromanaging?",
      "Describe a situation where you had to manage competing senior stakeholder expectations.",
      "Tell me about a time you spotted a strategic opportunity others had missed.",
      "How do you build a culture of accountability without creating a blame culture?",
      "Describe a time when your values were tested at work — what did you do?",
      "Tell me about a time you had to let someone go. How did you handle it?",
      "How do you approach setting direction and priorities for a team or function?",
      "Describe a time you collaborated across organisations or with external partners to deliver something significant.",
      "Tell me about a time you had to course-correct a strategy that wasn't working.",
      "How do you balance being a strategic leader with still being hands-on when it matters?",
      "What do you know now that you wish you'd known ten years ago?",
    ],
  },

  career_changer: {
    label: "Career Changer",
    sublabel: "Moving industries, pivoting roles, transitioning sectors",
    icon: "arrow",
    colour: "#e8f9fe",
    borderColour: "#1a7a9e",
    questions: [
      "Walk me through what brought you to this career change — what was the turning point?",
      "How have you prepared yourself for this move — what have you done to bridge the gap?",
      "What skills from your previous career are most transferable to this role?",
      "Tell me about a time you had to learn an entirely new skill set or domain from scratch.",
      "How do you respond to concerns that you lack direct experience in this field?",
      "Describe what you've done in the past six to twelve months to move toward this new direction.",
      "Tell me about a problem in your new target field that genuinely excites you — and why.",
      "How do you explain the value of your background to someone in this industry who doesn't immediately see it?",
      "Describe a time you succeeded in an environment where you were the least experienced person in the room.",
      "Tell me about a time you had to convince others to take a chance on you.",
      "What have you had to let go of in making this change — and how have you made peace with that?",
      "Describe a situation from your previous career that directly applies to a challenge in this role.",
      "Tell me about someone in this field you've spoken to or learned from during your transition.",
      "How do you stay motivated when the learning curve feels steep?",
      "Describe a time you had to reframe how you see yourself professionally.",
      "Tell me about a time an outsider perspective gave you an advantage — how might that apply here?",
      "How do you plan to get up to speed in the first 90 days if you get this role?",
      "What do you think you'll find hardest about this transition — and how are you preparing for it?",
      "Tell me about a time you took a calculated risk in your career. What was the outcome?",
      "How do you handle imposter syndrome when entering unfamiliar territory?",
      "Describe a time you had to prove yourself in a new context. What worked?",
      "Tell me about a skill you've developed outside of work that's directly relevant to this role.",
      "How have you used your network to support this career change?",
      "What would success look like for you in the first year of this new career path?",
      "What is it about this particular role and organisation that makes this the right move for you?",
    ],
  },

  returner: {
    label: "Returner to Work",
    sublabel: "Returning after a career break, parental leave, or time out",
    icon: "check",
    colour: "#fef0f8",
    borderColour: "#9e1a7a",
    questions: [
      "Tell me about your career break — what did it involve and what did you take from it?",
      "How have you kept your skills and knowledge current during your time out?",
      "What's brought you back to work now — and why this role?",
      "Describe how you've prepared yourself to return to a professional environment.",
      "Tell me about a skill or strength you developed during your career break that's relevant to this role.",
      "How do you plan to manage the transition back to full-time or structured work?",
      "Describe a time before your break when you performed at your best — what drove that?",
      "Tell me about a piece of work or project from your career that you're most proud of.",
      "How do you stay organised and manage your time under competing demands?",
      "Describe a situation where you had to adapt quickly to significant change.",
      "Tell me about a time you had to rebuild confidence or capability after a difficult period.",
      "How do you approach learning and getting up to speed in a new environment?",
      "Describe a time you demonstrated resilience when things were harder than expected.",
      "Tell me about a time you led or supported others through a difficult situation.",
      "How have you stayed connected to your professional field during your break?",
      "Describe a time you had to balance significant responsibilities across different areas of your life.",
      "Tell me about a time you showed initiative without being prompted.",
      "How do you handle uncertainty or ambiguity in a work setting?",
      "Describe a time you had to persuade or influence someone without having formal authority.",
      "Tell me about a time you gave or received feedback and how you acted on it.",
      "How would you approach your first 90 days in this role to rebuild momentum quickly?",
      "Describe a time you worked as part of a team toward a shared goal — what was your contribution?",
      "Tell me about something you've learned or developed during your career break that surprised you.",
      "What kind of support or environment would help you thrive as you return to work?",
      "Why is this particular role and organisation the right fit for this next chapter?",
    ],
  },

  mindset: {
    label: "Mindset & Leadership",
    sublabel: "Self-awareness, resilience, values, leading others",
    icon: "star",
    colour: "#f0e8fe",
    borderColour: "#6d28d9",
    questions: [
      "Tell me about a time you received feedback that genuinely surprised you — what did you do with it?",
      "What's an area of your performance you're actively working to improve, and how are you doing it?",
      "Describe a situation where you stepped well outside your comfort zone at work.",
      "How do you usually react when you make a significant mistake — walk me through it honestly.",
      "Tell me about a time you sought mentorship or support to develop a new skill.",
      "What have you learned about yourself from your most recent role or project?",
      "Describe a situation where you had to unlearn something to succeed.",
      "Tell me about a time something went badly wrong — how did you recover?",
      "Describe a setback that initially felt discouraging but led to genuine long-term growth.",
      "How do you stay effective when timelines, priorities, or goals suddenly change?",
      "Tell me about a time you faced significant pressure — how did you manage yourself through it?",
      "What's the hardest piece of feedback you've ever had to accept — and did you?",
      "How do you maintain motivation and output when results don't come quickly?",
      "Tell me about a time you failed at something important. What would you do differently?",
      "Tell me about a time you worked with someone who had a very different working style — how did you adapt?",
      "Describe a situation where you helped resolve a real disagreement within a team.",
      "Tell me about a time you contributed to a team's success even when you disagreed with the direction.",
      "How do you build trust and rapport with new teammates quickly?",
      "Describe a time you had to give feedback that was difficult for the other person to hear.",
      "Tell me about a time your personal values guided a difficult decision at work.",
      "Describe a time you made a decision that aligned with your integrity, even though it wasn't the popular one.",
      "What does purpose mean to you in the context of your career — and how does that show up in your work?",
      "Tell me about a time you motivated others without having formal authority to do so.",
      "Describe a situation where you influenced a significant decision or change in direction.",
      "Tell me about a time you led by example during a period of real uncertainty.",
    ],
  },

  tough_questions: {
    label: "Tough & Bias-Adjacent Questions",
    sublabel: "Non-traditional backgrounds, gaps, no degree, social mobility",
    icon: "warning",
    colour: "#fef4e8",
    borderColour: "#c2410c",
    questions: [
      "I notice you don't have a degree — how do you make up for that in a competitive field?",
      "There's a gap in your CV here — can you explain what you were doing during that time?",
      "Your background is quite different from what we usually hire. Why should we take a chance on you?",
      "You haven't followed the traditional route into this industry — why not?",
      "How do you feel your experience compares to candidates who have come through a more conventional path?",
      "You've moved around a lot — are you someone who finds it hard to commit?",
      "This role requires working with very senior stakeholders. How does someone with your background handle that?",
      "You went to a less well-known university — or didn't go at all. How has that shaped you?",
      "You're applying from a very different sector. Why should we believe you can make that leap?",
      "Some people might say you're overqualified for this — why are you interested at this level?",
      "Some people might say you're underqualified for this — what would you say to that?",
      "You've had quite a non-linear career — walk me through the logic of the choices you've made.",
      "How do you handle environments where most of your colleagues have very different educational or professional backgrounds to yours?",
      "This role involves a lot of visibility and presenting to leadership. Is that something you're comfortable with?",
      "You haven't managed a team before — how do we know you're ready to lead?",
      "Your most recent role was at a much smaller company — how will you adapt to the scale of this organisation?",
      "Your most recent role was at a much larger company — how will you adapt to a more resource-constrained environment?",
      "Can you tell me about a time someone underestimated you because of your background — and what happened?",
      "How do you respond when you're the only person in the room who doesn't share the same background or experience as everyone else?",
      "Some of our clients or stakeholders have quite traditional expectations. How do you build credibility with people who might initially question your background?",
      "You've taken a career break. How do we know you're still sharp and up to date?",
      "You're quite young for a role at this level — what would you say to those who question your readiness?",
      "You've been in the same company for a very long time — how do we know you can adapt to a new culture?",
      "Tell me about a time you had to prove yourself in an environment where you felt like an outsider.",
      "What's your honest answer to someone who says your route into this field was unconventional — and why does that actually make you stronger?",
    ],
  },

};

const ROADMAP = [
  { version: "Beta (Now)", title: "AI Interview Coach", description: "Job description analysis, curated question banks, written coaching feedback, personalised cheat sheet.", status: "live", icon: "check" },
  { version: "V2", title: "Session History & Progress", description: "Save your prep across sessions. See how your answers improve over time. Requires a free account.", status: "soon", icon: "star" },
  { version: "V3", title: "Redo & Improve", description: "Flag questions you struggled with, answer again, and get a comparison showing exactly how you improved.", status: "coming", icon: "arrow" },
  { version: "V4", title: "Voice Interview Mode", description: "Hear questions read aloud. Speak your answers. AI coaches on content — delivery analysis follows.", status: "coming", icon: "mic" },
  { version: "V5", title: "Industry Deep Dives", description: "Specialist question banks for medical, legal, finance, and tech. You tell us which sectors to build first.", status: "coming", icon: "book" },
  { version: "V6", title: "Full Interview Simulation", description: "Back-to-back questions, timed, no pause. Panel interview mode. The full mock experience.", status: "coming", icon: "film" },
];

// ── Markdown renderer ─────────────────────────────────────────────
function RenderMarkdown({ text, style = {} }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div style={{ fontSize: 15, lineHeight: 1.85, color: t.ink, ...style }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: 8 }} />;

        const urlOnly = trimmed.match(/^(https?:\/\/[^\s]+)$/);
        if (urlOnly) {
          const url = urlOnly[1];
          const label = url.replace("https://", "").replace("http://", "");
          return (
            <div key={i} style={{ marginBottom: 8 }}>
              <a href={url} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: t.tag, color: t.accentGreen, borderRadius: 6,
                padding: "7px 14px", fontSize: 13, fontWeight: 600,
                textDecoration: "none", border: `1px solid ${t.accentGreen}30`,
                transition: "all 0.15s",
              }}>
                <Icon name="arrow" size={13} colour={t.accentGreen} />
                {label}
              </a>
            </div>
          );
        }

        const labeledUrl = trimmed.match(/^(.+?):\s*(https?:\/\/[^\s]+)$/);
        if (labeledUrl) {
          return (
            <div key={i} style={{ marginBottom: 8 }}>
              <a href={labeledUrl[2]} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: t.tag, color: t.accentGreen, borderRadius: 6,
                padding: "7px 14px", fontSize: 13, fontWeight: 600,
                textDecoration: "none", border: `1px solid ${t.accentGreen}30`,
                transition: "all 0.15s",
              }}>
                <Icon name="arrow" size={13} colour={t.accentGreen} />
                {labeledUrl[1]}
              </a>
            </div>
          );
        }

        const isHeader = trimmed.endsWith(":") && trimmed.length < 60 && !trimmed.startsWith("•") && !trimmed.startsWith("-");
        if (isHeader) {
          return (
            <p key={i} style={{ fontWeight: 700, color: t.accentPop, marginTop: i > 0 ? 18 : 0, marginBottom: 4, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {trimmed.replace(/\*\*/g, "")}
            </p>
          );
        }
        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const bulletContent = isBullet ? trimmed.replace(/^[•\-\*]\s*/, "") : null;
        if (isBullet) {
          return (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 6, alignItems: "flex-start" }}>
              <span style={{ color: t.accentGreen, marginTop: 3, flexShrink: 0 }}>
                <Icon name="arrow" size={14} colour={t.accentGreen} />
              </span>
              <span>{renderInline(bulletContent)}</span>
            </div>
          );
        }
        return <p key={i} style={{ marginBottom: 4 }}>{renderInline(trimmed)}</p>;
      })}
    </div>
  );
}

function renderInline(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// ── Shared UI ─────────────────────────────────────────────────────
function BetaBadge() {
  return (
    <span style={{ background: t.accentPop, color: "#fff", fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 3, letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "sans-serif" }}>
      BETA
    </span>
  );
}

function Divider() {
  return <div style={{ height: 1, background: t.border, margin: "28px 0" }} />;
}

function Btn({ onClick, disabled, children, variant = "primary", style = {} }) {
  const base = { border: "none", borderRadius: 6, padding: "13px 26px", fontSize: 15, fontWeight: 500, cursor: disabled ? "not-allowed" : "pointer", transition: "all 0.18s", fontFamily: "'Inter', sans-serif", ...style };
  const variants = {
    primary: { background: "#3F6F63", color: "#ffffff", opacity: disabled ? 0.35 : 1 },
    outline: { background: "transparent", color: "#111111", border: "1px solid rgba(0,0,0,0.15)", opacity: disabled ? 0.35 : 1 },
    pop: { background: "#D47A2C", color: "#ffffff", opacity: disabled ? 0.35 : 1 },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

function Tag({ children, colour = t.tag, textColour = t.tagText }) {
  return (
    <span style={{ background: colour, color: textColour, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "sans-serif" }}>
      {children}
    </span>
  );
}

function ThinkingDots({ colour = t.accentGreen }) {
  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      <span className="dot1" style={{ width: 8, height: 8, borderRadius: "50%", background: colour, display: "inline-block" }} />
      <span className="dot2" style={{ width: 8, height: 8, borderRadius: "50%", background: colour, display: "inline-block" }} />
      <span className="dot3" style={{ width: 8, height: 8, borderRadius: "50%", background: colour, display: "inline-block" }} />
    </span>
  );
}

function useScrollToTop(dep) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [dep]);
}

// ── Auth Step ─────────────────────────────────────────────────────
function AuthStep({ onAuth, mode = "create" }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function sendMagicLink() {
    if (!email || !email.includes("@")) { setError("Please enter a valid email address"); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch(AUTH_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sendMagicLink", email }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to send link");
      // Persist destination so it survives the magic link redirect
      sessionStorage.setItem("aey_auth_dest", mode === "signin" ? "dashboard" : "session");
      setSent(true);
    } catch (err) { setError(err.message); }
    setLoading(false);
  }

  if (sent) {
    return (
      <div className="fade-up" style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <Icon name="check" size={40} colour={t.accentGreen} />
        </div>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 10 }}>Check your email</h2>
        <p style={{ color: t.inkMid, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
          We've sent a magic link to <strong>{email}</strong>. Click it to access your account — no password needed.
        </p>
        <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: "12px 16px", marginBottom: 24 }}>
          <p style={{ fontSize: 13, color: t.inkLight, fontStyle: "italic" }}>Link not arrived? Check your spam folder or wait 30 seconds and try again.</p>
        </div>

      </div>
    );
  }

  return (
    <div className="fade-up" style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ marginBottom: 8 }}><Tag colour={t.surfaceAlt} textColour={t.inkMid}>{mode === "signin" ? "Your account" : "Save your session"}</Tag></div>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, margin: "12px 0 8px" }}>
        {mode === "signin" ? "Sign in to your account" : "Create your free account"}
      </h2>
      <p style={{ color: t.inkMid, fontSize: 15, lineHeight: 1.65, marginBottom: 28, fontWeight: 300 }}>
        {mode === "signin"
          ? "Enter your email and we'll send you a magic link. No password needed."
          : "No password needed. Just your email and we'll send you a link. Your sessions and cheat sheets are saved automatically so you can come back any time."
        }
      </p>
      <div style={{ marginBottom: 16 }}>
        <input
          type="email" value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMagicLink()}
          placeholder="your@email.com"
          style={{ width: "100%", background: t.surface, border: `1.5px solid ${email.includes("@") ? t.accentGreen : t.border}`, borderRadius: 8, padding: "13px 15px", color: t.ink, fontSize: 15, outline: "none", transition: "border-color 0.2s", fontFamily: "'Inter', sans-serif" }}
        />
        {error && <p style={{ fontSize: 12, color: t.accentPop, marginTop: 6, fontStyle: "italic" }}>{error}</p>}
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <Btn onClick={sendMagicLink} disabled={loading}>{loading ? "Sending…" : "Send my magic link →"}</Btn>

      </div>
      <p style={{ fontSize: 11, color: t.inkLight, marginTop: 16, lineHeight: 1.5, fontStyle: "italic" }}>No spam. We only email you this link and product updates if you opt in.</p>
    </div>
  );
}

// ── Landing ───────────────────────────────────────────────────────
function Landing({ onStart, onSignIn }) {
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
    <div className="fade-up" style={{ maxWidth: 620, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ textAlign: "center", padding: "56px 0 48px", position: "relative" }}>
        <div ref={gridRef} className="grid-bg" aria-hidden="true" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28 }}>
            <BetaBadge />
            <span style={{ color: t.inkLight, fontSize: 13, fontStyle: "italic" }}>Free to use · Share your feedback</span>
          </div>
          <h1 style={{ fontFamily: "'Inter', sans-serif", fontSize: "clamp(38px,8vw,68px)", fontWeight: 700, lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 20 }}>
            Practice your<br />
            <em style={{ color: t.accentPop, fontStyle: "italic" }}>interview</em><br />
            before it matters.
          </h1>
          <p style={{ color: t.inkMid, fontSize: 17, lineHeight: 1.65, maxWidth: 440, margin: "0 auto 36px", fontWeight: 300 }}>
            Paste any job description, pick your role type, and get coached on the questions most likely to come up — and how to answer them well.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginBottom: 40 }}>
            {Object.entries(QUESTION_BANK).slice(0, 8).map(([key, cat]) => (
              <span key={cat.label} style={{ display: "flex", alignItems: "center", gap: 6, background: cat.colour, border: `1px solid ${cat.borderColour}30`, borderRadius: 20, padding: "5px 14px", fontSize: 13, color: t.ink }}>
                <Icon name={cat.icon} size={14} colour={cat.borderColour} />
                {cat.label}
              </span>
            ))}
          </div>
          <Btn onClick={onStart} style={{ padding: "15px 40px", fontSize: 16 }}>Start your session →</Btn>


        </div>
      </div>
      <Divider />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, paddingBottom: 48, textAlign: "center" }}>
        {[
          { n: "6+", label: "Tailored questions per session" },
          { n: "14", label: "Role categories covered" },
          { n: "∞", label: "Sessions during beta" },
        ].map(s => (
          <div key={s.n}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, fontWeight: 900, color: t.accentPop }}>{s.n}</div>
            <div style={{ color: t.inkMid, fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <Divider />
      <div style={{ paddingBottom: 64 }}>
        <div style={{ marginBottom: 6 }}><Tag colour={t.surfaceAlt} textColour={t.inkMid}>What's coming</Tag></div>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.01em" }}>This is just the beginning.</h2>
        <p style={{ color: t.inkMid, fontSize: 15, marginBottom: 24, fontWeight: 300, lineHeight: 1.6 }}>
          The beta is the foundation. Here's where we're taking it, shaped by feedback from people like you.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ROADMAP.map((item, i) => (
            <div key={i} style={{
              background: item.status === "live" ? "#f0f9f0" : t.surface,
              border: `1.5px solid ${item.status === "live" ? t.accentGreen : t.border}`,
              borderRadius: 10, padding: "14px 18px", display: "flex", gap: 14, alignItems: "flex-start",
            }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                <Icon name={item.icon} size={18} colour={item.status === "live" ? t.accentGreen : t.inkLight} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: t.ink }}>{item.title}</span>
                  <Tag
                    colour={item.status === "live" ? t.tag : item.status === "soon" ? "#fff3cd" : t.surfaceAlt}
                    textColour={item.status === "live" ? t.accentGreen : item.status === "soon" ? "#856404" : t.inkMid}
                  >
                    {item.status === "live" ? "Live now" : item.status === "soon" ? "Coming soon" : "On the roadmap"}
                  </Tag>
                </div>
                <p style={{ color: t.inkMid, fontSize: 13, lineHeight: 1.5 }}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Category Picker ───────────────────────────────────────────────
function CategoryStep({ onNext }) {
  const [roleFamily, setRoleFamily] = useState(null);
  const [careerStage, setCareerStage] = useState(null);
  useScrollToTop("category");

  const activeCategory = roleFamily || careerStage;

  const roleFamilies = ROLE_FAMILIES.map(key => ({ key, ...QUESTION_BANK[key] }));
  const careerStages = CAREER_STAGES.map(key => ({ key, ...QUESTION_BANK[key] }));

  return (
    <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ marginBottom: 8 }}><Tag colour={t.surfaceAlt} textColour={t.inkMid}>Step 1 of 2</Tag></div>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 700, margin: "12px 0 6px" }}>Set up your session</h2>
      <p style={{ color: t.inkMid, fontSize: 15, marginBottom: 32, fontWeight: 300 }}>Three quick steps — takes less than a minute.</p>

      <div style={{ background: t.surface, border: `1.5px solid ${roleFamily ? t.accentGreen : t.border}`, borderRadius: 12, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: roleFamily ? t.accentGreen : t.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {roleFamily ? <Icon name="check" size={12} colour="#fff" /> : <span style={{ fontSize: 12, fontWeight: 700, color: t.inkMid }}>1</span>}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: t.ink, textTransform: "uppercase", letterSpacing: "0.06em" }}>What kind of role?</span>
          <span style={{ fontSize: 12, color: t.accentPop, fontWeight: 600 }}>Required</span>
        </div>
        <p style={{ fontSize: 12, color: t.inkMid, marginBottom: 14, fontStyle: "italic", marginLeft: 34 }}>Pick the family that best matches the job you're going for.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
          {roleFamilies.map(({ key, label, sublabel, icon, colour, borderColour }) => (
            <div key={key} className="hover-lift" onClick={() => setRoleFamily(roleFamily === key ? null : key)} style={{
              background: roleFamily === key ? colour : t.bg,
              border: `2px solid ${roleFamily === key ? borderColour : t.border}`,
              borderRadius: 8, padding: "12px 14px", transition: "all 0.18s",
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <div style={{ marginTop: 2, flexShrink: 0 }}>
                <Icon name={icon} size={16} colour={roleFamily === key ? borderColour : t.inkMid} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.ink, lineHeight: 1.3 }}>{label}</div>
                <div style={{ fontSize: 11, color: t.inkLight, marginTop: 2, lineHeight: 1.3 }}>{sublabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: t.surface, border: `1.5px solid ${careerStage ? t.accentGreen : t.border}`, borderRadius: 12, padding: "20px 22px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: careerStage ? t.accentGreen : t.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {careerStage ? <Icon name="check" size={12} colour="#fff" /> : <span style={{ fontSize: 12, fontWeight: 700, color: t.inkMid }}>2</span>}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: t.ink, textTransform: "uppercase", letterSpacing: "0.06em" }}>Where are you in your career?</span>
          <span style={{ fontSize: 12, color: t.inkLight, fontStyle: "italic" }}>Optional</span>
        </div>
        <p style={{ fontSize: 12, color: t.inkMid, marginBottom: 14, fontStyle: "italic", marginLeft: 34 }}>Adds tailored questions for your career stage. Skip if it doesn't apply.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
          {careerStages.map(({ key, label, sublabel, icon, colour, borderColour }) => (
            <div key={key} className="hover-lift" onClick={() => setCareerStage(careerStage === key ? null : key)} style={{
              background: careerStage === key ? colour : t.bg,
              border: `2px solid ${careerStage === key ? borderColour : t.border}`,
              borderRadius: 8, padding: "12px 14px", transition: "all 0.18s",
              display: "flex", alignItems: "flex-start", gap: 10,
            }}>
              <div style={{ marginTop: 2, flexShrink: 0 }}>
                <Icon name={icon} size={16} colour={careerStage === key ? borderColour : t.inkMid} />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.ink, lineHeight: 1.3 }}>{label}</div>
                <div style={{ fontSize: 11, color: t.inkLight, marginTop: 2, lineHeight: 1.3 }}>{sublabel}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Btn
        onClick={() => onNext({ category: activeCategory, roleFamily, careerStage })}
        disabled={!roleFamily}
      >
        Continue →
      </Btn>

      {!roleFamily && (
        <p style={{ color: t.inkLight, fontSize: 12, marginTop: 10, fontStyle: "italic" }}>Pick a role family above to continue</p>
      )}
    </div>
  );
}

// ── About You ─────────────────────────────────────────────────────
// ── Role Step (replaces AboutStep) ───────────────────────────────
// For new users: JD + why + background + worry (all in one)
// For returning users: JD + why only (profile pre-loaded)
function RoleStep({ onNext, existingProfile, isReturning }) {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [why, setWhy] = useState("");
  const [jd, setJd] = useState("");
  useScrollToTop("role");

  const canContinue = jobTitle.trim().length >= 2 && jd.length >= 40;

  return (
    <div className="fade-up" style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px 60px" }}>
      <div style={{ marginBottom: 8 }}>
        <Tag colour={t.surfaceAlt} textColour={t.inkMid}>
          {isReturning ? "New session" : "Step 2 of 3"}
        </Tag>
      </div>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 700, margin: "12px 0 6px" }}>
        {isReturning ? "What are we prepping for?" : "Tell us about the role"}
      </h2>
      <p style={{ color: t.inkMid, fontSize: 15, marginBottom: 28, fontWeight: 300 }}>
        {isReturning
          ? "Your profile is saved. Just tell us about this specific role."
          : "This shapes every question and all the coaching you receive."
        }
      </p>

      {/* Job title + company -- always shown */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: t.accentPop, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Job title <span style={{ color: t.accentPop }}>*</span>
          </label>
          <input
            type="text"
            value={jobTitle}
            onChange={e => setJobTitle(e.target.value)}
            placeholder="e.g. Senior Product Manager"
            style={{ width: "100%", background: t.surface, border: `1.5px solid ${jobTitle.length >= 2 ? t.ink : t.border}`, borderRadius: 8, padding: "11px 14px", color: t.ink, fontSize: 14, outline: "none", transition: "border-color 0.2s", fontFamily: "'Inter', sans-serif" }}
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: t.accentPop, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Company <span style={{ color: t.inkLight, fontWeight: 400, textTransform: "none" }}>(optional)</span>
          </label>
          <input
            type="text"
            value={company}
            onChange={e => setCompany(e.target.value)}
            placeholder="e.g. Acme Corp"
            style={{ width: "100%", background: t.surface, border: `1.5px solid ${company.length > 0 ? t.ink : t.border}`, borderRadius: 8, padding: "11px 14px", color: t.ink, fontSize: 14, outline: "none", transition: "border-color 0.2s", fontFamily: "'Inter', sans-serif" }}
          />
        </div>
      </div>

      {/* JD paste -- always shown */}
      <div style={{ marginBottom: 22 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: t.accentPop, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Paste the job description <span style={{ color: t.accentPop }}>*</span>
        </label>
        <p style={{ fontSize: 12, color: t.inkLight, marginBottom: 8, fontStyle: "italic" }}>
          The more of the JD you paste, the more tailored your questions will be.
        </p>
        <textarea
          value={jd} onChange={e => setJd(e.target.value)} rows={6}
          placeholder="Paste the full job description here..."
          style={{ width: "100%", background: t.surface, border: `1.5px solid ${jd.length > 40 ? t.ink : t.border}`, borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14, lineHeight: 1.6, outline: "none", transition: "border-color 0.2s", resize: "vertical" }}
        />
      </div>



      {/* For returning users show profile summary */}
      {isReturning && existingProfile?.background && (
        <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 10, padding: "14px 18px", marginBottom: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: t.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Coaching from your profile</p>
          <p style={{ fontSize: 13, color: t.inkMid, lineHeight: 1.6, marginBottom: existingProfile.worry ? 8 : 0 }}>{existingProfile.background}</p>
          {existingProfile.worry && (
            <p style={{ fontSize: 13, color: t.inkMid, fontStyle: "italic", lineHeight: 1.5 }}>Worry: {existingProfile.worry}</p>
          )}
        </div>
      )}

      <Btn
        onClick={() => onNext({ jobTitle: jobTitle.trim(), company: company.trim(), why: "", jd })}
        disabled={!canContinue}
      >
        Continue →
      </Btn>
      {!canContinue && (jobTitle.length > 0 || jd.length > 0) && (
        <p style={{ color: t.inkLight, fontSize: 12, marginTop: 10, fontStyle: "italic" }}>
          {jobTitle.trim().length < 2 ? "Add the job title to continue" : "Paste the job description to continue"}
        </p>
      )}
    </div>
  );
}

// ── Profile Setup Step (new users only, step 4.5) ─────────────────
function ProfileSetupStep({ onNext, onSkip }) {
  const [background, setBackground] = useState("");
  const [worry, setWorry] = useState("");
  useScrollToTop("profile-setup");

  return (
    <div className="fade-up" style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px 60px" }}>
      <div style={{ marginBottom: 8 }}>
        <Tag colour={t.surfaceAlt} textColour={t.inkMid}>Step 3 of 3</Tag>
      </div>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 700, margin: "12px 0 6px" }}>
        A bit about you
      </h2>
      <p style={{ color: t.inkMid, fontSize: 15, marginBottom: 6, fontWeight: 300 }}>
        This personalises your coaching. Saved to your profile — you'll never fill this in again.
      </p>
      <p style={{ color: t.inkLight, fontSize: 13, marginBottom: 28, fontStyle: "italic" }}>
        You can skip this and add it later from your dashboard.
      </p>

      <div style={{ marginBottom: 22 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: t.accentPop, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Your background <span style={{ color: t.accentPop }}>*</span>
        </label>
        <p style={{ fontSize: 12, color: t.inkLight, marginBottom: 8, fontStyle: "italic" }}>
          Current or most recent role — 1 to 2 sentences is fine.
        </p>
        <textarea
          value={background} onChange={e => setBackground(e.target.value)} rows={3}
          placeholder="e.g. Senior Account Manager at a SaaS company, 6 years in B2B sales..."
          style={{ width: "100%", background: t.surface, border: `1.5px solid ${background.length > 40 ? t.ink : t.border}`, borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14, lineHeight: 1.6, outline: "none", transition: "border-color 0.2s" }}
        />
      </div>

      <div style={{ marginBottom: 32 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: t.accentPop, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Biggest interview worry <span style={{ color: t.inkLight, fontWeight: 400, textTransform: "none" }}>(optional)</span>
        </label>
        <p style={{ fontSize: 12, color: t.inkLight, marginBottom: 8, fontStyle: "italic" }}>
          Helps us focus the coaching where it counts.
        </p>
        <textarea
          value={worry} onChange={e => setWorry(e.target.value)} rows={2}
          placeholder="e.g. I haven't interviewed in 5 years..."
          style={{ width: "100%", background: t.surface, border: `1.5px solid ${worry.length > 5 ? t.ink : t.border}`, borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14, lineHeight: 1.6, outline: "none", transition: "border-color 0.2s" }}
        />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Btn onClick={() => onNext({ background, worry })} disabled={background.length < 40}>
          Generate my questions →
        </Btn>
        <Btn variant="outline" onClick={onSkip}>Skip for now</Btn>
      </div>
      {background.length > 0 && background.length < 40 && (
        <p style={{ color: t.inkLight, fontSize: 12, marginTop: 10, fontStyle: "italic" }}>
          Add a little more detail to continue
        </p>
      )}
    </div>
  );
}

// ── (AboutStep kept as alias for backward compat) ──
function AboutStep({ onNext }) {
  return <RoleStep onNext={({ why, jd }) => onNext({ background: "", why, worry: "" })} existingProfile={null} isReturning={false} />;
}

// ── Coaching Session ──────────────────────────────────────────────
function CoachingStep({ category, roleFamily, careerStage, jd, jobTitle, company, userInfo, restoredSession, onFinish, onBackToAbout, hasCredits }) {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [phase, setPhase] = useState("loading");
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [questionTypes, setQuestionTypes] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [micError, setMicError] = useState(null);
  const [onboardingInvalid, setOnboardingInvalid] = useState(false);
  const [feedbackIsGibberish, setFeedbackIsGibberish] = useState(false);
  const [paid, setPaid] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("paid") === "true" || !!hasCredits;
  });
  const [pendingAnswers, setPendingAnswers] = useState(null);
  const recognitionRef = useRef(null);
  const sessionIdRef = useRef(null);
  useScrollToTop("coaching");

  // Restore session state if returning from Stripe
  useEffect(() => {
    if (restoredSession) {
      const s = restoredSession;
      if (s.questions && s.questions.length > 0) {
        setQuestions(s.questions);
        setQuestionTypes(s.question_types || []);
        setAnswers(s.answers || []);
        setCurrentQ(s.current_q || 3);
        sessionIdRef.current = s.id;
        setPaid(true); // They've returned from Stripe -- unlock the session
        setPhase("answering");
        // Decrement credit for Stripe-purchased session
        const token = currentAccessToken || sessionStorage.getItem("aey_token");
        const user = currentUser || (() => { try { return JSON.parse(sessionStorage.getItem("aey_user")); } catch(e) { return null; } })();
        if (token && user) {
          fetch(AUTH_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "decrementCredit", userId: user.id, sessionId: s.id, accessToken: token }),
          }).catch(e => console.error("Decrement credit error:", e));
        }
        return;
      }
    }
  }, [restoredSession]);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  const bank = QUESTION_BANK[category] || QUESTION_BANK[roleFamily] || QUESTION_BANK["general"];

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setMicSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-GB";
      recognition.onresult = (e) => {
        let final = "", interim = "";
        for (let i = 0; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript + " ";
          else interim += e.results[i][0].transcript;
        }
        setAnswer(final + interim);
      };
      recognition.onerror = (e) => {
        setMicError(e.error === "not-allowed"
          ? "Mic access blocked — allow it in browser settings or just type below."
          : "Mic issue — try typing your answer instead.");
        setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  function toggleMic() {
    if (!recognitionRef.current) return;
    setMicError(null);
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  }

  useEffect(() => {
    // Skip question generation if we restored a session from Stripe return
    if (restoredSession && restoredSession.questions && restoredSession.questions.length > 0) return;
    buildQuestions();
  }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [currentQ]);

  async function buildQuestions() {
    const whyQuestion = "Why do you want this job?";
    const shuffled = roleFamily && careerStage
      ? [
          ...[...QUESTION_BANK[roleFamily].questions].sort(() => Math.random() - 0.5).slice(0, 2),
          ...[...QUESTION_BANK[careerStage].questions].sort(() => Math.random() - 0.5).slice(0, 1),
        ]
      : [...bank.questions].sort(() => Math.random() - 0.5).slice(0, 3);

    const contextLabel = roleFamily && careerStage
      ? `${QUESTION_BANK[roleFamily].label} (${QUESTION_BANK[careerStage].label})`
      : bank.label;

    const token = generateToken();
    const session = await supabaseInsert({
      session_token: token,
      role_family: roleFamily ? QUESTION_BANK[roleFamily]?.label : null,
      career_stage: careerStage ? QUESTION_BANK[careerStage]?.label : null,
      category_label: bank?.label || null,
      job_title: jobTitle || null,
      company: company || null,
      jd: jd || null,
      user_info: userInfo || null,
      questions_answered: 0,
      completed: false,
      paid: false,
    });
    if (session?.id) {
      sessionIdRef.current = session.id;
      // Decrement credit if user has credits (not coming from Stripe)
      if (hasCredits) {
        const token = currentAccessToken || sessionStorage.getItem("aey_token");
        const user = currentUser || (() => { try { return JSON.parse(sessionStorage.getItem("aey_user")); } catch(e) { return null; } })();
        if (token && user) {
          fetch(AUTH_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "decrementCredit", userId: user.id, sessionId: session.id, accessToken: token }),
          }).catch(e => console.error("Decrement credit error:", e));
        }
      }
    }

    // Quick local check — if background has real words (10+ chars with spaces), skip API validation entirely
    const bg = userInfo?.background || "";
    const looksGenuine = bg.length >= 10 && bg.includes(" ");
    
    if (!looksGenuine) {
      // Definitely gibberish — block without API call
      setOnboardingInvalid(true);
      setLoadingQuestions(false);
      return;
    }
    // API relevance check — is this actually about work/career experience?
    try {
      const relevanceRes = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 5,
          messages: [{
            role: "user",
            content: `Does this text describe someone's professional background, career experience, or interview worry? Answer YES or NO only.

Text: "${userInfo.background}"`,
          }],
        }),
      });
      const relevanceData = await relevanceRes.json();
      const relevanceResult = (relevanceData.content?.[0]?.text || "YES").trim().toUpperCase();
      if (relevanceResult.includes("NO")) {
        setOnboardingInvalid(true);
        setLoadingQuestions(false);
        return;
      }
    } catch {
      // If relevance check fails, proceed anyway — don't block on API errors
    }

    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: `You are a senior interviewer with 15 years experience hiring for ${contextLabel} roles. Generate exactly 4 interview questions for this specific role.

CRITICAL RULES:
- Read the job description carefully and extract specific requirements, skills, tools, and responsibilities mentioned
- Each question MUST be anchored to something specific from the job description — a named skill, responsibility, tool, or challenge mentioned in the spec
- Do NOT generate generic interview questions — every question must be tailored to THIS role
- Mix behavioural (past experience) and situational (hypothetical scenario) questions
- Make questions feel like they came from a real hiring manager who read the spec, not a template
- Return ONLY a valid JSON array of strings, no markdown, no explanation

CRITICAL — SOURCE SEPARATION. Two separate sources of information are provided below. You must never confuse them:
1. JOB DESCRIPTION: what the employer says about the role. Use this to generate relevant questions.
2. CANDIDATE INFORMATION: what the candidate has told us about themselves. Use this only to personalise the tone and difficulty — never to attribute claims to the candidate that only appear in the JD.

A question like "You mentioned hiring from 10,000 applicants" is wrong if that detail came from the JD. The candidate never said that. Questions must only reference what the CANDIDATE has stated when using phrases like "you mentioned", "you said", or "based on your experience". For JD details, frame as "this role involves..." or "the spec mentions..." or ask them to speak to that area.

JOB DESCRIPTION (employer's words — do not attribute to candidate):
${jd}

CANDIDATE INFORMATION (what the candidate has told us — safe to reference directly):
Background: ${userInfo.background}
Why they want this role: ${userInfo.why}

Role Category: ${contextLabel}

Return format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?"]`,
          }],
        }),
      });
      const data = await res.json();
      const aiQuestions = JSON.parse(data.content[0].text.trim());
      const combined = [
        ...shuffled.map(q => ({ q, type: "curated" })),
        ...aiQuestions.map(q => ({ q, type: "ai" })),
      ].sort(() => Math.random() - 0.5);
      setQuestions([whyQuestion, ...combined.map(x => x.q)]);
      setQuestionTypes(["curated", ...combined.map(x => x.type)]);
    } catch {
      const fallback = [
        "What relevant experience do you bring?",
        "Describe a challenge you've overcome at work.",
        "Where do you want to be in three years?",
      ];
      setQuestions([whyQuestion, ...shuffled, ...fallback].slice(0, 8));
      setQuestionTypes(["curated", ...shuffled.map(() => "curated"), ...fallback.map(() => "ai")].slice(0, 8));
    }
    setPhase("answering");
  }

  const GIBBERISH_SENTINEL = "might not have been a real attempt";
  const OFFTOPIC_SENTINEL = "does not quite connect to what was asked";

  async function getFeedback() {
    setPhase("feedback");
    setLoadingFeedback(true);
    setFeedback("");
    setFeedbackIsGibberish(false);
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          messages: [{
            role: "user",
            content: `You are a warm, direct interview coach helping a real candidate prepare for a specific role. Give personalised, specific feedback — not generic advice.

IMPORTANT: First assess the answer against one of three categories:

CATEGORY 1 — GIBBERISH: Random characters (e.g. "asdfgh"), keyboard mashing, a single meaningless word, or fewer than 8 real words with no meaning. If this, respond with only this exact text:

What landed well:
It looks like that answer might not have been a real attempt — that's completely fine, it happens.

What to sharpen:
Try answering as you would in the actual room. Even a rough, honest answer gives us something real to coach.

Try saying it like this:
Start with one sentence about your experience, add what you did, and finish with the result or what you learned.

CATEGORY 2 — OFF-TOPIC: A genuine, real answer but clearly not responding to the question asked. The person has written something meaningful but it does not connect to what was asked. If this, respond with only this exact text but fill in the [brackets] based on the actual question and answer:

What landed well:
That sounds like a real experience and there is something worth using here.

What to sharpen:
It does not quite connect to what was asked though. The question was about [summarise the question in 6 words or fewer] — have another go with that in mind, or hit Move on if you would rather keep going.

Try saying it like this:
[Write 1-2 sentences showing how the experience they mentioned could actually be redirected to answer the question that was asked. If it genuinely cannot connect, just write: Take a fresh run at the question — even a rough answer gives us something real to work with.]

CATEGORY 3 — GENUINE: A real attempt at the question, even if short, rough, technically dense, or imperfect. If in doubt, treat it as genuine. Coach it normally below.

${category === "tough_questions" ? `SPECIAL INSTRUCTION: This candidate has chosen to practise tough, bias-adjacent questions. When coaching their answer, focus especially on helping them reframe from defence to quiet confidence. Their non-traditional route, gap, or background is a strength — coach them to own it, not apologise for it.` : ""}

Use what you know about them:
- Their background: ${userInfo.background}
- Why they want this role: ${userInfo.why}
- Their worry going in: ${userInfo.worry || "not specified"}
- The role they're applying for: ${bank.label} — ${jd.slice(0, 300)}

IMPORTANT — worry: If their stated worry is directly relevant to this question or to how they answered it, acknowledge it and coach toward it explicitly. Don't force it where it doesn't fit, but when it does connect, name it. For example: if they said they haven't interviewed in 15 years and their answer sounds rehearsed or stilted, call that out kindly and help them sound more natural. If they said they lack confidence and their answer undersells them, point to the specific moment they did that and show them how to own it instead.

FRAMEWORK INSTRUCTION: Where the question or answer calls for it, name the relevant framework explicitly in your coaching — use the exact label. The four frameworks are:
- STAR structure (Situation, Task, Action, Result) — for past experience / behavioural questions ("tell me about a time...")
- Claim + Evidence + Relevance — for competency / strengths questions ("what are your strengths?", "are you good at X?")
- Research + Alignment + Enthusiasm — for motivation / fit questions ("why this role?", "why us?")
- Bridge / Clarify / Reframe / Authentic + Boundaries — for challenging questions (weaknesses, failures, gaps, career changes, career breaks, redundancy, public sector to private sector moves)

If the question clearly falls into one of these categories and the candidate's answer would benefit from the structure, name the framework in "What to sharpen" and explain briefly how to apply it to their specific answer. Do not force it where it does not fit naturally.

Give feedback in exactly these 3 sections, using these exact headers:

What landed well:
(1-2 sentences — name something specific and genuine from their answer, connected to what this role needs)

What to sharpen:
(1-2 sentences — one specific, actionable improvement tied to this role or their background. If their worry is relevant here, address it directly. If a framework applies, name it here.)

Try saying it like this:
(Rewrite their answer in 2-3 punchy sentences they could actually use in the room — make it sound like them, not a template. If their worry affects their delivery, this rewrite should model what confident, natural delivery looks like. If a framework applies, the rewrite should model it in action.)

Question asked: ${questions[currentQ]}
Their answer: ${answer}

Keep the whole response under 220 words. Be a coach, not a critic. No bullet points, no markdown symbols — just the three plain sections with their headers.`,
          }],
        }),
      });
      const data = await res.json();
      const feedbackText = data.content[0].text;
      setFeedback(feedbackText);
      setFeedbackIsGibberish(feedbackText.includes(GIBBERISH_SENTINEL) || feedbackText.includes(OFFTOPIC_SENTINEL));
    } catch {
      setFeedback("What landed well:\nYou engaged with the question directly — that confidence matters.\n\nWhat to sharpen:\nAdd a specific example to make your answer more memorable.\n\nTry saying it like this:\nSet the scene briefly, explain what you did, and land on the result. That structure will stick with any interviewer.");
      setFeedbackIsGibberish(false);
    }
    setLoadingFeedback(false);
  }

  function retryAnswer() {
    setAnswer("");
    setFeedback("");
    setFeedbackIsGibberish(false);
    setPhase("answering");
  }

  function nextQuestion() {
    const isGenuine = !feedbackIsGibberish && answer.trim().length > 0;
    const newAnswers = [...answers, {
      q: questions[currentQ],
      a: answer,
      feedback,
      type: questionTypes[currentQ],
      genuine: isGenuine,
    }];
    setAnswers(newAnswers);
    setAnswer("");
    setFeedback("");
    setFeedbackIsGibberish(false);

    const isLastQuestion = currentQ + 1 >= questions.length;

    // Paywall: gate after Q3 (index 2) if not paid
    if (currentQ === 2 && !paid) {
      setPendingAnswers(newAnswers);
      setPhase("paywall");
      // Save full session state to Supabase so we can restore after Stripe redirect
      if (currentAccessToken) {
        const paywallState = {
          questions: questions,
          question_types: questionTypes,
          answers: newAnswers,
          current_q: 3,
          paid: false,
        };
        if (sessionIdRef.current) {
          // Update the existing session row — don't create a duplicate
          supabaseUpdate(sessionIdRef.current, paywallState);
          sessionStorage.setItem("aey_session_id", sessionIdRef.current);
        } else {
          // No session yet — create one now
          saveSessionState({
            session_token: generateToken(),
            user_id: currentUser?.id,
            role_family: roleFamily || "",
            career_stage: careerStage || "",
            category_label: bank?.label || "",
            jd: jd || "",
            job_title: jobTitle || null,
            company: company || null,
            user_info: userInfo,
            questions: questions,
            question_types: questionTypes,
            answers: newAnswers,
            current_q: 3,
            paid: false,
          }).then(savedId => {
            if (savedId) {
              sessionIdRef.current = savedId;
              sessionStorage.setItem("aey_session_id", savedId);
            }
          });
        }
      }
      return;
    }

    if (sessionIdRef.current) {
      supabaseUpdate(sessionIdRef.current, {
        questions_answered: newAnswers.filter(a => a.genuine).length,
        completed: isLastQuestion,
        answers: newAnswers,
      });
    }

    if (isLastQuestion) { onFinish(newAnswers, sessionIdRef.current); }
    else { setCurrentQ(c => c + 1); setPhase("answering"); }
  }

  useEffect(() => {
    if (paid && phase === "paywall" && pendingAnswers) {
      setPendingAnswers(null);
      const isLastQuestion = currentQ + 1 >= questions.length;
      if (sessionIdRef.current) {
        supabaseUpdate(sessionIdRef.current, {
          questions_answered: pendingAnswers.filter(a => a.genuine).length,
          completed: isLastQuestion,
          answers: pendingAnswers,
        });
      }
      if (isLastQuestion) { onFinish(pendingAnswers, sessionIdRef.current); }
      else { setCurrentQ(c => c + 1); setPhase("answering"); }
    }
  }, [paid]);

  function skipQuestion() {
    const newAnswers = [...answers, {
      q: questions[currentQ],
      a: "",
      feedback: "",
      type: questionTypes[currentQ],
      genuine: false,
    }];
    setAnswers(newAnswers);
    setAnswer("");
    setFeedback("");
    setFeedbackIsGibberish(false);

    // Same paywall gate as nextQuestion
    if (currentQ === 2 && !paid) {
      setPendingAnswers(newAnswers);
      setPhase("paywall");
      if (currentAccessToken) {
        const skipPaywallState = {
          questions: questions,
          question_types: questionTypes,
          answers: newAnswers,
          current_q: 3,
          paid: false,
        };
        if (sessionIdRef.current) {
          supabaseUpdate(sessionIdRef.current, skipPaywallState);
          sessionStorage.setItem("aey_session_id", sessionIdRef.current);
        } else {
          saveSessionState({
            session_token: generateToken(),
            user_id: currentUser?.id,
            role_family: roleFamily || "",
            career_stage: careerStage || "",
            category_label: bank?.label || "",
            jd: jd || "",
            job_title: jobTitle || null,
            company: company || null,
            user_info: userInfo,
            questions: questions,
            question_types: questionTypes,
            answers: newAnswers,
            current_q: 3,
            paid: false,
          }).then(savedId => {
            if (savedId) {
              sessionIdRef.current = savedId;
              sessionStorage.setItem("aey_session_id", savedId);
            }
          });
        }
      }
      return;
    }

    if (currentQ + 1 >= questions.length) { onFinish(newAnswers); }
    else { setCurrentQ(c => c + 1); setPhase("answering"); }
  }

  function goBack() {
    if (currentQ === 0) return;
    const prevAnswers = [...answers];
    const prev = prevAnswers.pop();
    setAnswers(prevAnswers);
    setCurrentQ(c => c - 1);
    setAnswer(prev?.a || "");
    setFeedback(prev?.feedback || "");
    setFeedbackIsGibberish(false);
    setPhase(prev?.feedback ? "feedback" : "answering");
  }

  if (phase === "loading") {
    if (onboardingInvalid) {
      return (
        <div className="fade-in" style={{ maxWidth: 520, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <div style={{ background: "#fff8f6", border: `1.5px solid ${t.accentPop}40`, borderRadius: 16, padding: "36px 28px" }}>
            <Icon name="warning" size={36} colour={t.accentPop} />
            <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 700, margin: "16px 0 10px", color: t.ink }}>
              Those answers didn't look quite right
            </h3>
            <p style={{ color: t.inkMid, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
              We need a bit of real information about you to make this session worthwhile. Even a rough sentence or two is enough — we just can't personalise your coaching without something genuine to work with.
            </p>
            <Btn onClick={onBackToAbout} variant="pop">← Go back and try again</Btn>
          </div>
        </div>
      );
    }
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 14, background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 16, padding: "20px 32px" }}>
          <ThinkingDots colour={t.accentGreen} />
          <p style={{ color: t.inkMid, fontStyle: "italic", fontSize: 15, margin: 0 }}>Building your personalised question set…</p>
        </div>
        <p style={{ color: t.inkLight, fontSize: 12, marginTop: 16, fontStyle: "italic" }}>Reading your job description and selecting the best questions</p>
      </div>
    );
  }

  const progress = questions.length > 0 ? currentQ / questions.length : 0;

  // Paywall renders independently -- before the question card outer wrapper
  if (phase === "paywall") {
    return (
      <div className="fade-in" style={{ maxWidth: 480, margin: "40px auto 0", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: "50%", background: t.tag, marginBottom: 14 }}>
            <Icon name="star" size={24} colour={t.accentGreen} />
          </div>
          <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.01em" }}>
            You're doing great.
          </h2>
          <p style={{ color: t.inkMid, fontSize: 15, lineHeight: 1.65, maxWidth: 360, margin: "0 auto" }}>
            You've completed 3 questions with real coaching on each. Unlock the rest of your session to keep going and get your personalised cheat sheet at the end.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
          <a href={`https://buy.stripe.com/3cI28rcfw4hE7YMeCF5Ne01?client_reference_id=${sessionIdRef.current || "session"}`} style={{ textDecoration: "none" }}>
            <div className="hover-lift" style={{ background: t.accentGreen, borderRadius: 10, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 3 }}>Single session</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.4 }}>Finish this session + your cheat sheet</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>£5</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.06em" }}>one-time</div>
              </div>
            </div>
          </a>

          <a href={`https://buy.stripe.com/9B63cvdjA6pM3IwgKN5Ne02?client_reference_id=${sessionIdRef.current || "session"}`} style={{ textDecoration: "none" }}>
            <div className="hover-lift" style={{ background: "#fff", border: `2px solid ${t.accentPop}`, borderRadius: 10, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", position: "relative" }}>
              <div style={{ position: "absolute", top: -10, left: 16 }}>
                <Tag colour={t.accentPop} textColour="#fff">Best value</Tag>
              </div>
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: t.ink, marginBottom: 3 }}>Bundle — 3 sessions</div>
                <div style={{ fontSize: 13, color: t.inkMid, lineHeight: 1.4 }}>Three full sessions — use for different roles or rounds</div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 16 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: t.accentPop }}>£12</div>
                <div style={{ fontSize: 11, color: t.inkLight, textTransform: "uppercase", letterSpacing: "0.06em" }}>one-time</div>
              </div>
            </div>
          </a>

        </div>

        <p style={{ fontSize: 12, color: t.inkLight, textAlign: "center", fontStyle: "italic", lineHeight: 1.6 }}>
          Secure payment via Stripe. You'll be returned here immediately after paying to continue your session.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-up" style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={bank?.icon || "star"} size={16} colour={t.inkMid} />
          <span style={{ fontSize: 13, color: t.inkMid }}>{bank?.label || ""}</span>
        </div>
        <span style={{ fontSize: 13, color: t.inkMid }}>{currentQ + 1} / {questions.length}</span>
      </div>
      <div style={{ height: 3, background: t.border, borderRadius: 2, marginBottom: 32, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: t.accentPop, transition: "width 0.4s ease", borderRadius: 2 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        {questionTypes[currentQ] === "curated"
          ? <Tag colour={bank?.colour || t.tag} textColour={bank?.borderColour || t.inkMid}>From question bank</Tag>
          : <Tag colour="#fff3f0" textColour={t.accentPop}>From your job description</Tag>
        }
      </div>
      <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderLeft: `4px solid ${t.accentPop}`, borderRadius: 10, padding: "22px 24px", marginBottom: 24 }}>
        <p style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.55, fontFamily: "'Inter', sans-serif" }}>{questions[currentQ]}</p>
      </div>

      {phase === "answering" && (
        <>
          {micSupported && (
            <div style={{ marginBottom: 14 }}>
              <button onClick={toggleMic} style={{
                display: "flex", alignItems: "center", gap: 10,
                background: isListening ? "#fff0ee" : t.surface,
                border: `2px solid ${isListening ? t.accentPop : t.border}`,
                borderRadius: 10, padding: "13px 20px", cursor: "pointer",
                width: "100%", transition: "all 0.2s", fontFamily: "'Inter', sans-serif",
              }}>
                <span style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: isListening ? t.accentPop : t.surfaceAlt,
                  display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  boxShadow: isListening ? `0 0 0 6px ${t.accentPop}25` : "none", transition: "all 0.2s",
                }}>
                  <Icon name="mic" size={16} colour={isListening ? "#fff" : t.inkMid} />
                </span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: isListening ? t.accentPop : t.ink }}>
                    {isListening ? "Listening… tap to stop" : "Tap to answer with your voice"}
                  </div>
                  <div style={{ fontSize: 12, color: t.inkLight, marginTop: 2 }}>
                    {isListening ? "Speak clearly — we'll transcribe as you go" : "Or type your answer below"}
                  </div>
                </div>
                {isListening && (
                  <div style={{ marginLeft: "auto", display: "flex", gap: 3, alignItems: "center" }}>
                    {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
                      <div key={i} style={{ width: 3, borderRadius: 2, background: t.accentPop, height: `${12 + i * 6}px`, animation: `pulse 0.8s ${delay}s infinite` }} />
                    ))}
                  </div>
                )}
              </button>
              {micError && (
                <p style={{ fontSize: 12, color: t.accentPop, marginTop: 6, fontStyle: "italic", display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="warning" size={12} colour={t.accentPop} /> {micError}
                </p>
              )}
            </div>
          )}
          <div style={{ position: "relative" }}>
            <textarea
              value={answer} onChange={e => setAnswer(e.target.value)}
              placeholder={micSupported ? "Your spoken answer will appear here — edit freely, or just type directly." : "Answer as you would in the room — no wrong answers, only ones we can improve."}
              rows={6}
              style={{
                width: "100%", background: isListening ? "#fffaf9" : t.surface,
                border: `1.5px solid ${isListening ? t.accentPop + "60" : answer.length > 20 ? t.ink : t.border}`,
                borderRadius: 8, padding: "14px 16px", color: t.ink, fontSize: 15, lineHeight: 1.6,
                outline: "none", transition: "all 0.2s", marginBottom: 16,
              }}
            />
            {answer.length > 0 && (
              <button onClick={() => setAnswer("")} style={{ position: "absolute", top: 10, right: 10, background: t.surfaceAlt, border: "none", borderRadius: 4, padding: "3px 8px", fontSize: 11, color: t.inkMid, cursor: "pointer", fontFamily: "sans-serif" }}>clear</button>
            )}
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Btn onClick={getFeedback} disabled={answer.length < 30}>Get coaching →</Btn>
            <Btn variant="outline" onClick={skipQuestion}>Skip question</Btn>
            {currentQ > 0 && (
              <Btn variant="outline" onClick={goBack} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Icon name="arrowLeft" size={14} colour={t.inkMid} /> Previous
              </Btn>
            )}
          </div>
        </>
      )}

      {phase === "feedback" && (
        <div className="fade-in">
          <div style={{ background: "#fffdf7", border: `1.5px solid ${t.border}`, borderRadius: 10, padding: "20px 22px", marginBottom: 12, minHeight: 100 }}>
            {loadingFeedback ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <ThinkingDots colour={t.accentPop} />
                <p style={{ color: t.inkMid, marginTop: 12, fontStyle: "italic", fontSize: 13 }}>Reviewing your answer…</p>
              </div>
            ) : (
              <RenderMarkdown text={feedback} />
            )}
          </div>
          {!loadingFeedback && !feedbackIsGibberish && (
            <div style={{ background: t.surfaceAlt, borderRadius: 8, padding: "10px 14px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <Icon name="sparkle" size={14} colour={t.inkLight} />
              <p style={{ fontSize: 12, color: t.inkLight, lineHeight: 1.5, fontStyle: "italic" }}>
                The suggested answer above is an example only — use it as inspiration and always replace with your own real experiences and facts.
              </p>
            </div>
          )}
          {!loadingFeedback && (
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {feedbackIsGibberish ? (
                <>
                  <Btn onClick={retryAnswer} variant="pop" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <Icon name="refresh" size={15} colour="#fff" /> Try again
                  </Btn>
                  <Btn variant="outline" onClick={nextQuestion}>
                    {currentQ + 1 >= questions.length ? "Finish anyway →" : "Move on →"}
                  </Btn>
                </>
              ) : (
                <>
                  <Btn onClick={nextQuestion}>
                    {currentQ + 1 >= questions.length ? "See my summary →" : "Next question →"}
                  </Btn>
                  {currentQ > 0 && (
                    <Btn variant="outline" onClick={goBack} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <Icon name="arrowLeft" size={14} colour={t.inkMid} /> Previous
                    </Btn>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
function SummaryStep({ answers, userInfo, category, sessionId, jobTitle, company, onRestart, onViewHistory }) {
  const [cheatSheet, setCheatSheet] = useState("");
  const [loadingSheet, setLoadingSheet] = useState(true);
  const [sheetError, setSheetError] = useState(false);
  const cat = QUESTION_BANK[category] || Object.values(QUESTION_BANK).find(v => v.label === category) || { label: category || "General" };
  useScrollToTop("summary");

  const genuineCount = answers.filter(a => a.genuine === true).length;
  const totalCount = answers.length;
  const halfOrMore = genuineCount >= Math.ceil(totalCount / 2);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, []);

  useEffect(() => {
    if (genuineCount > 0) {
      generateSummary();
    }
  }, []);

  if (genuineCount === 0) {
    return (
      <div className="fade-in" style={{ maxWidth: 520, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 16, padding: "36px 28px" }}>
          <Icon name="warning" size={36} colour={t.accentPop} />
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 700, margin: "16px 0 10px", color: t.ink }}>
            You didn't answer any questions
          </h3>
          <p style={{ color: t.inkMid, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
            We noticed you skipped everything this time — that's fine, but it means there's nothing for us to coach you on. The cheat sheet works best when you've had a real go at the questions, even rough answers. Give it another try.
          </p>
          <Btn onClick={onRestart} variant="pop">Start a new session →</Btn>
        </div>
      </div>
    );
  }

  async function generateSummary() {
    try {
      // Sanitise answers — strip any corrupt characters that could break JSON or the prompt
      const safeAnswers = answers.map(a => ({
        ...a,
        q: (a.q || "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"'),
        a: (a.a || "").replace(/[‘’]/g, "'").replace(/[“”]/g, '"').slice(0, 2000),
        feedback: (a.feedback || "").slice(0, 1000),
      }));
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1200,
          messages: [{
            role: "user",
            content: `You are creating a personalised pre-interview cheat sheet. This is what the candidate reads 10 minutes before walking into the room. It should feel like it was written specifically for them — because it was. Pull from their actual words, their actual stories, their actual coaching feedback. Nothing generic. Nothing they could have read anywhere else.

IMPORTANT CONTEXT: The candidate answered ${genuineCount} out of ${totalCount} questions genuinely.
${genuineCount <= 2 ? `They answered very few questions. Be honest — tell them the cheat sheet is limited because there wasn't enough to work with, and nudge them to come back and complete a full session before their interview. Keep it brief and direct.` : `Build everything from what they actually said and what the coach flagged — not from the questions alone.`}

CANDIDATE CONTEXT:
- Background: ${userInfo.background}
- Why this role: ${userInfo.why}
- Their stated worry going in: ${userInfo.worry || "none given"}
- Role: ${jobTitle ? jobTitle : (cat?.label || "Not specified")}${company ? ` at ${company}` : ""}

THEIR SESSION — all questions in order, with answers and coaching where provided:
${safeAnswers.map((a, i) => a.genuine ? `Q${i + 1}: ${a.q}\nTheir answer: ${a.a}\nCoaching they received: ${a.feedback}` : `Q${i + 1}: ${a.q}\n[Skipped — no answer given]`).join("\n\n")}

INSTRUCTIONS:
If they named a specific worry (e.g. "15 years since I interviewed", "I struggle with confidence", "I don't have a degree"), you MUST address it directly in at least one section. Don't let them walk in still carrying it unaddressed.

Use exactly these 5 sections. Plain text headers followed by a colon on their own line. No asterisks, no dashes, no markdown. Bullets use • only.

Your strongest stories:
3-4 bullets. Each one names a specific story or example from their actual answers and tells them exactly when to use it. Format each as: "The [brief situation label] story — use this when they ask about [topic]." Pull real details. No invented examples.

Lines worth keeping:
2-3 bullets. Pull the most compelling phrases or sentences they actually said — the ones the coaching flagged as strong or the ones that showed real self-awareness. Quote close to verbatim where possible. These are lines they should consciously plan to say.

Things to sharpen:
3 bullets. Based on patterns the coaching flagged across the session — not one-off criticisms. Specific and actionable. If the same issue came up more than once (e.g. vague examples, underselling, running too long), name it as a pattern and tell them how to fix it going in.

Your pattern:
One short paragraph, 3-4 sentences. Reflect back what you noticed across all their answers — what they consistently do well, what they consistently hold back on, and the single most important thing they could do differently in the room tomorrow. Make it feel like a coach who has been watching them, not a report card.

Walk in with this:
One sentence only. Make it personal to their background, their specific worry if they named one, and this role. This is the last thing they read before they go in. Make it land.

Then after the five sections add:

Go deeper:
1-3 article links from aievolvingyou.com. Only include ones genuinely relevant to what the coaching flagged in this session. For each link, write the label on one line, the URL on the next line, then one sentence on the line after explaining why it is relevant to this specific candidate based on their session. No em dashes in that sentence. Keep it direct and personal.

MANDATORY LINK RULES. Always include the relevant article if the candidate's worry or answers match:
- If their worry mentions career break, gap, time out, redundancy, or returning to work: you MUST include the career gap article
- If their worry mentions career change, sector change, public sector, switching industry, or transferable skills: you MUST include the career changers article
- If the coaching flagged vague or unstructured answers across multiple questions: you MUST include the STAR method article
- If the coaching flagged underselling or lack of specifics: you MUST include the specificity principle article

Available articles:
• The STAR Method — how to structure any behavioural answer: https://aievolvingyou.com/resources/star-method
• How to answer "What's your biggest weakness?": https://aievolvingyou.com/resources/weakness-question
• The four types of interview question (and how to handle each): https://aievolvingyou.com/resources/four-types-of-interview-question
• The specificity principle — why vague answers lose interviews: https://aievolvingyou.com/resources/specificity-principle
• How to use AI to prepare for interviews: https://aievolvingyou.com/resources/ai-interview-prep
• How to interview after a long career gap: https://aievolvingyou.com/resources/interviewing-after-long-gap
• Returning to work after a career break — how to interview with confidence: https://aievolvingyou.com/resources/interviewing-after-long-gap
• How to answer interview questions as a career changer: https://aievolvingyou.com/resources/career-changers

RULES: Use ONLY the • character for bullets. No **, *, or - anywhere. Headers are plain text followed by a colon on their own line. Be specific, be personal, be useful.`,
          }],
        }),
      });
      const data = await res.json();
      const sheetText = data.content[0].text;
      setCheatSheet(sheetText);
      // Save cheat sheet to Supabase
      if (sessionId) {
        supabaseUpdate(sessionId, { cheat_sheet: sheetText, completed: true });
      }
    } catch (err) {
      console.error("Cheat sheet generation failed:", err);
      setSheetError(true);
    }
    setLoadingSheet(false);
  }

  const FEATURES = [
    "Save my sessions and track progress over time",
    "Redo questions I struggled with and see improvement",
    "Hear questions read aloud in the coach's voice",
    "Get a reminder the day before my interview",
    "Share my cheat sheet with a mentor or friend",
  ];

  return (
    <div className="fade-up" style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px 60px" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <Icon name="target" size={40} colour={t.accentGreen} />
        </div>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Session complete.</h2>
        <p style={{ color: t.inkMid, fontStyle: "italic" }}>You answered {genuineCount} of {totalCount} questions.</p>
      </div>

      {!halfOrMore && (
        <div style={{ background: "#fff8f6", border: `1.5px solid ${t.accentPop}40`, borderRadius: 10, padding: "14px 18px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Icon name="warning" size={16} colour={t.accentPop} />
          <p style={{ fontSize: 13, color: t.inkMid, lineHeight: 1.6 }}>
            <strong style={{ color: t.accentPop }}>You only answered {genuineCount} of {totalCount} questions.</strong> There isn't enough here to give you meaningful coaching — the cheat sheet below is a placeholder, not a real reflection of your prep. The questions you skipped are likely the ones that will come up in the room. Come back and do the full session before your interview.
          </p>
        </div>
      )}

      <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
        {sheetError ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <Icon name="warning" size={32} colour={t.accentPop} />
            <p style={{ marginTop: 12, color: t.inkMid, fontSize: 14, marginBottom: 16 }}>Something went wrong generating your cheat sheet.</p>
            <Btn onClick={() => { setSheetError(false); setLoadingSheet(true); generateSummary(); }}>Try again</Btn>
          </div>
        ) : loadingSheet ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <ThinkingDots colour={t.accentGreen} />
            <p style={{ marginTop: 12, color: t.inkLight, fontStyle: "italic", fontSize: 13 }}>Building your cheat sheet…</p>
          </div>
        ) : (
          <RenderMarkdown text={cheatSheet} />
        )}
      </div>

      <div className="no-print" style={{ background: "#f0f9f0", border: `1.5px solid ${t.accentGreen}`, borderRadius: 10, padding: "16px 20px", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
          <Icon name="warning" size={16} colour={t.accentGreen} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: t.ink, marginBottom: 2 }}>
              Save as PDF
            </p>
            <p style={{ fontSize: 12, color: t.inkMid, lineHeight: 1.5 }}>
              Your session is saved to your account. Download a PDF copy to have it to hand before your interview.
            </p>
          </div>
        </div>
        <button
          onClick={() => window.print()}
          disabled={loadingSheet}
          style={{
            background: loadingSheet ? t.inkLight : t.accentGreen,
            color: "#fff", border: "none", borderRadius: 6,
            padding: "10px 20px", fontSize: 14, fontWeight: 600,
            cursor: loadingSheet ? "not-allowed" : "pointer",
            fontFamily: "'Inter', sans-serif", whiteSpace: "nowrap",
            opacity: loadingSheet ? 0.6 : 1,
          }}
        >
          Save PDF
        </button>
      </div>

      {answers.filter(a => a.genuine).length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 12 }}>
            <Tag colour={t.surfaceAlt} textColour={t.inkMid}>Your session recap</Tag>
          </div>
          <p style={{ fontSize: 13, color: t.inkMid, marginBottom: 16, fontStyle: "italic", lineHeight: 1.5 }}>
            Every question you answered — with the coaching point to take into your prep.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {answers.filter(a => a.genuine).map((item, i) => (
              <div key={i} style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{ borderLeft: `4px solid ${t.accentGreen}`, padding: "14px 18px", background: t.bg }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: t.inkMid, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Q{i + 1}</p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: t.ink, lineHeight: 1.5 }}>{item.q}</p>
                </div>
                <div style={{ padding: "12px 18px", borderTop: `1px solid ${t.border}` }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: t.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Your answer</p>
                  <p style={{ fontSize: 13, color: t.inkMid, lineHeight: 1.6, fontStyle: "italic" }}>{item.a}</p>
                </div>
                {item.feedback && (() => {
                  const lines = item.feedback.split("\n");
                  const sharpenIdx = lines.findIndex(l => l.toLowerCase().includes("sharpen"));
                  const coachingLine = sharpenIdx >= 0
                    ? lines.slice(sharpenIdx + 1).find(l => l.trim().length > 20) || lines.find(l => l.trim().length > 20)
                    : lines.find(l => l.trim().length > 20);
                  const tryIdx = lines.findIndex(l => l.toLowerCase().includes("try saying"));
                  const tryLine = tryIdx >= 0
                    ? lines.slice(tryIdx + 1).filter(l => l.trim().length > 20).join(" ")
                    : null;
                  return (
                    <>
                      <div style={{ padding: "12px 18px", borderTop: `1px solid ${t.border}`, background: "#fffdf7" }}>
                        <p style={{ fontSize: 12, fontWeight: 700, color: t.accentPop, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Key coaching point</p>
                        <p style={{ fontSize: 13, color: t.ink, lineHeight: 1.6 }}>{coachingLine}</p>
                      </div>
                      {tryLine && (
                        <div style={{ padding: "12px 18px", borderTop: `1px solid ${t.border}`, background: "#f0f9f6" }}>
                          <p style={{ fontSize: 12, fontWeight: 700, color: t.accentGreen, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Try saying it like this</p>
                          <p style={{ fontSize: 13, color: t.ink, lineHeight: 1.6, fontStyle: "italic" }}>{tryLine}</p>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      )}

      <div id="pdf-content" className="cheat-sheet-print print-only">
        <h1>AI Evolving You — Interview Cheat Sheet</h1>
        <p style={{ fontSize: 12, color: "#555555", marginBottom: 16 }}>
          {jobTitle ? `${jobTitle}${company ? ` · ${company}` : ""}` : (cat?.label || category || "Interview session")} · Generated {new Date().toLocaleDateString("en-GB")}
        </p>
        <hr className="divider" />
        <RenderMarkdown text={cheatSheet} />
        {answers.length > 0 && (
          <>
            <hr className="divider" />
            <h2>Session Recap</h2>
            {answers.map((item, i) => (
              <div key={i} className="qa-block">
                <p className="qa-q">Q{i + 1}: {item.q}</p>
                {!item.genuine || !item.a ? (
                  <p className="qa-a" style={{ color: "#999", fontStyle: "italic" }}>This question was skipped.</p>
                ) : (
                  <>
                    <p className="qa-a">Your answer: {item.a && item.a.length > 600 ? item.a.slice(0, 600) + "..." : item.a}</p>
                    {item.feedback && (() => {
                      const lines = item.feedback.split("\n").map(l => l.trim()).filter(Boolean);
                      const isHeader = l => ["what landed well", "what to sharpen", "try saying"].some(h => l.toLowerCase().startsWith(h));
                      const sharpenIdx = lines.findIndex(l => l.toLowerCase().startsWith("what to sharpen"));
                      const tryIdx = lines.findIndex(l => l.toLowerCase().startsWith("try saying"));
                      const coachingLine = sharpenIdx >= 0
                        ? lines.slice(sharpenIdx + 1).find(l => l.length > 20 && !isHeader(l))
                        : lines.find(l => l.length > 20 && !isHeader(l));
                      const tryLine = tryIdx >= 0
                        ? lines.slice(tryIdx + 1).filter(l => l.length > 20 && !isHeader(l)).join(" ")
                        : null;
                      return (
                        <>
                          {coachingLine && <p className="qa-coaching">Coaching: {coachingLine}</p>}
                          {tryLine && <p className="qa-coaching" style={{ marginTop: 4 }}>Try saying it like this: {tryLine}</p>}
                        </>
                      );
                    })()}
                  </>
                )}
              </div>
            ))}
          </>
        )}
        <hr className="divider" />
        <p style={{ fontSize: 11, color: "#999999" }}>coach.aievolvingyou.com</p>
      </div>

      {/* What would you like to do next? */}
      <div style={{ borderTop: `1px solid ${t.border}`, marginTop: 32, paddingTop: 24 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: t.ink, marginBottom: 14 }}>What would you like to do next?</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {currentUser && (
            <Btn onClick={onViewHistory}>Go to my sessions →</Btn>
          )}
          <Btn variant="outline" onClick={onRestart}>Start a new session</Btn>
        </div>
        <p style={{ fontSize: 11, color: t.inkLight, marginTop: 10, fontStyle: "italic" }}>Your cheat sheet is saved. Come back any time.</p>
      </div>
    </div>
  );
}
// ── Credits Step ────────────────────────────────────────────────────
// Shown after auth -- displays credits remaining, routes to paywall if 0
function CreditsStep({ onContinue, onBuyCredits, creditsData: initialCredits }) {
  const [creditsData, setCreditsData] = useState(initialCredits || null);
  const [loading, setLoading] = useState(!initialCredits);
  useScrollToTop("credits");

  useEffect(() => {
    if (initialCredits) {
      // Already have data from App shell -- use it directly
      setCreditsData(initialCredits);
      setLoading(false);
      if (initialCredits.credits_remaining > 0) onContinue();
      return;
    }
    // Fallback: fetch if not passed
    getCredits().then(data => {
      setCreditsData(data);
      setLoading(false);
      if (data && data.credits_remaining > 0) onContinue();
    });
  }, [initialCredits]);

  if (loading) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <ThinkingDots colour={t.accentGreen} />
      </div>
    );
  }

  const credits = creditsData ? creditsData.credits_remaining : 0;

  if (credits > 0) {
    // Will auto-advance -- show brief loading state
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <ThinkingDots colour={t.accentGreen} />
      </div>
    );
  }

  return (
    <div className="fade-up" style={{ maxWidth: 480, margin: "0 auto", padding: "60px 24px" }}>
      <div style={{ marginBottom: 8 }}><Tag colour={t.surfaceAlt} textColour={t.inkMid}>Credits</Tag></div>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 28, fontWeight: 700, margin: "12px 0 8px" }}>
        You're out of credits
      </h2>
      <p style={{ color: t.inkMid, fontSize: 15, lineHeight: 1.65, marginBottom: 32, fontWeight: 300 }}>
        You've used all your sessions. Top up to keep practising — your session history and cheat sheets are all saved.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <a href="https://buy.stripe.com/eVqbJ10wOcOa4MAcux5Ne06" onClick={() => sessionStorage.setItem("aey_stripe_source", "dashboard")} style={{ textDecoration: "none" }}>
          <div style={{ background: t.accentGreen, color: "#fff", borderRadius: 10, padding: "18px 22px", cursor: "pointer" }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 2 }}>Single session</div>
            <div style={{ fontSize: 14, opacity: 0.85 }}>One full coaching session + cheat sheet</div>
            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 8 }}>£5</div>
          </div>
        </a>
        <a href="https://buy.stripe.com/bJe8wPcfw7tQenagKN5Ne05" onClick={() => sessionStorage.setItem("aey_stripe_source", "dashboard")} style={{ textDecoration: "none" }}>
          <div style={{ background: "#fff", color: t.ink, borderRadius: 10, padding: "18px 22px", cursor: "pointer", border: `2px solid ${t.accentPop}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
              <span style={{ fontWeight: 700, fontSize: 16 }}>3-session bundle</span>
              <Tag colour={t.accentPop} textColour="#fff">Best value</Tag>
            </div>
            <div style={{ fontSize: 14, color: t.inkMid }}>Three full sessions to use any time</div>
            <div style={{ fontWeight: 700, fontSize: 22, marginTop: 8, color: t.accentPop }}>£12</div>
          </div>
        </a>
      </div>
      <p style={{ textAlign: "center", marginTop: 24 }}>
        <button onClick={onContinue} style={{ background: "none", border: "none", color: t.inkMid, fontSize: 14, cursor: "pointer", textDecoration: "underline", fontFamily: "'Inter', sans-serif" }}>
          View my past sessions
        </button>
      </p>
    </div>
  );
}

// ── Session History Step ──────────────────────────────────────────
function SessionHistoryStep({ onNewSession, onBack, userProfile, onProfileSaved, initialCreditsData, onCreditsRefresh }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [creditsData, setCreditsData] = useState(initialCreditsData || null);
  const [outcomeForm, setOutcomeForm] = useState(null); // { sessionId, outcome, notes, date }
  const [savingOutcome, setSavingOutcome] = useState(false);
  const [outcomeSaved, setOutcomeSaved] = useState({});
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState({ background: userProfile?.background || "", worry: userProfile?.worry || "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [copyToast, setCopyToast] = useState(false);

  useEffect(() => {
    async function loadData() {
      const justAdded = sessionStorage.getItem("aey_credits_just_added");
      if (justAdded) {
        sessionStorage.removeItem("aey_credits_just_added");
        await new Promise(r => setTimeout(r, 1500));
      }
      const [sess, cred] = await Promise.all([getUserSessions(), getCredits()]);
      setSessions(sess || []);
      if (cred) setCreditsData(cred);
      setLoading(false);
    }
    loadData();
  }, []);

  const OUTCOMES = [
    { value: "pending", label: "Not happened yet" },
    { value: "got_offer", label: "Got the offer" },
    { value: "progressed", label: "Progressed to next round" },
    { value: "no_offer", label: "Did not progress" },
    { value: "withdrew", label: "I withdrew" },
  ];

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <ThinkingDots colour={t.accentGreen} />
        <p style={{ marginTop: 12, color: t.inkLight, fontStyle: "italic", fontSize: 13 }}>Loading your sessions...</p>
      </div>
    );
  }

  // Full cheat sheet view for a past session
  if (selectedSession) {
    return (
      <div className="fade-up" style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px 60px" }}>
        <button onClick={() => setSelectedSession(null)} style={{ background: "none", border: "none", color: t.inkMid, cursor: "pointer", fontSize: 13, fontWeight: 500, fontFamily: "'Inter', sans-serif", marginBottom: 24, display: "flex", alignItems: "center", gap: 6 }}>
          <Icon name="arrowLeft" size={14} colour={t.inkMid} /> Back to sessions
        </button>
        <div style={{ marginBottom: 6 }}><Tag colour={t.tag} textColour={t.tagText}>{selectedSession.category_label || "Session"}</Tag></div>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 700, margin: "10px 0 4px" }}>Cheat sheet</h2>
        <p style={{ color: t.inkLight, fontSize: 13, marginBottom: 24 }}>{formatDate(selectedSession.created_at)}</p>
        {selectedSession.cheat_sheet ? (
          <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
            <RenderMarkdown text={selectedSession.cheat_sheet} />
          </div>
        ) : (
          <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: 24, color: t.inkMid, fontStyle: "italic" }}>
            No cheat sheet saved for this session.
          </div>
        )}

        {selectedSession.answers && Array.isArray(selectedSession.answers) && selectedSession.answers.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: t.inkMid, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Full Q&amp;A from this session</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {selectedSession.answers.map((item, i) => (
                <div key={i} style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 10, padding: "16px 18px" }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: t.inkLight, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Q{i + 1}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: t.ink, marginBottom: item.a ? 10 : 0, lineHeight: 1.5 }}>{item.q}</p>
                  {item.genuine && item.a ? (
                    <>
                      <p style={{ fontSize: 13, color: t.inkMid, lineHeight: 1.6, marginBottom: item.feedback ? 10 : 0, borderLeft: `3px solid ${t.border}`, paddingLeft: 12 }}>{item.a}</p>
                      {item.feedback && (
                        <div style={{ marginTop: 8, padding: "10px 12px", background: "#f0f9f0", borderRadius: 8 }}>
                          <p style={{ fontSize: 11, fontWeight: 700, color: t.accentGreen, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Coaching</p>
                          <RenderMarkdown text={item.feedback} />
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ fontSize: 13, color: t.inkLight, fontStyle: "italic" }}>Skipped</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const credits = creditsData ? creditsData.credits_remaining : 0;

  // Filter out ghost sessions (no questions generated yet) and group by recency
  const realSessions = sessions.filter(s => s.questions_answered > 0 || s.completed || s.cheat_sheet);
  const mostRecentSessionId = realSessions.length > 0 ? realSessions[0].id : null;

  function groupSessionsByDate(sessList) {
    const now = new Date();
    const cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const recent = [];
    const byMonth = {};
    sessList.forEach(s => {
      const d = new Date(s.created_at);
      if (d >= cutoff) {
        recent.push(s);
      } else {
        const key = d.toLocaleString("en-GB", { month: "long", year: "numeric" });
        if (!byMonth[key]) byMonth[key] = [];
        byMonth[key].push(s);
      }
    });
    return { recent, byMonth };
  }
  const { recent: recentSessions, byMonth: olderByMonth } = groupSessionsByDate(realSessions);

  const SectionDivider = () => (
    <div style={{ borderTop: `1px solid ${t.border}`, margin: "24px 0" }} />
  );

  return (
    <div className="fade-up" style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px 60px" }}>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 26, fontWeight: 700, marginBottom: 4 }}>Your sessions</h2>
        <p style={{ color: t.inkMid, fontSize: 14, fontStyle: "italic" }}>Everything you've prepared — tap any session to view your cheat sheet.</p>
      </div>

      {/* ── Coaching profile ── */}
      <p style={{ fontSize: 11, fontWeight: 700, color: t.inkMid, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Your coaching profile</p>
      <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: "16px 18px", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          {!editingProfile ? (
            <>
              <div style={{ flex: 1 }}>
                {userProfile?.background ? (
                  <>
                    <p style={{ fontSize: 13, color: t.inkMid, lineHeight: 1.6, marginBottom: userProfile.worry ? 5 : 0 }}>{userProfile.background}</p>
                    {userProfile.worry && <p style={{ fontSize: 12, color: t.inkLight, fontStyle: "italic" }}>Worry: {userProfile.worry}</p>}
                  </>
                ) : (
                  <p style={{ fontSize: 13, color: t.inkLight, fontStyle: "italic" }}>Not set up yet. Your background and interview worry personalise every session.</p>
                )}
              </div>
              <button onClick={() => { setProfileDraft({ background: userProfile?.background || "", worry: userProfile?.worry || "" }); setEditingProfile(true); }} style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, color: t.inkMid, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 500, flexShrink: 0 }}>
                {userProfile?.background ? "Edit" : "Set up"}
              </button>
            </>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: t.accentPop, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Your background</label>
                <textarea value={profileDraft.background} onChange={e => setProfileDraft(d => ({ ...d, background: e.target.value }))} rows={3} placeholder="Current or most recent role — 1 to 2 sentences..." style={{ width: "100%", background: t.bg, border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "10px 14px", color: t.ink, fontSize: 13, lineHeight: 1.6, outline: "none", resize: "none", fontFamily: "'Inter', sans-serif" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: t.accentPop, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Biggest interview worry <span style={{ color: t.inkLight, fontWeight: 400, textTransform: "none" }}>(optional)</span></label>
                <textarea value={profileDraft.worry} onChange={e => setProfileDraft(d => ({ ...d, worry: e.target.value }))} rows={2} placeholder="e.g. I haven't interviewed in 5 years..." style={{ width: "100%", background: t.bg, border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "10px 14px", color: t.ink, fontSize: 13, lineHeight: 1.6, outline: "none", resize: "none", fontFamily: "'Inter', sans-serif" }} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Btn disabled={savingProfile || profileDraft.background.length < 20} onClick={async () => { setSavingProfile(true); await saveProfile(profileDraft.background, profileDraft.worry); onProfileSaved({ background: profileDraft.background, worry: profileDraft.worry }); setEditingProfile(false); setSavingProfile(false); }}>{savingProfile ? "Saving..." : "Save profile"}</Btn>
                <Btn variant="outline" onClick={() => setEditingProfile(false)}>Cancel</Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      <SectionDivider />

      {/* ── Credits ── */}
      <p style={{ fontSize: 11, fontWeight: 700, color: t.inkMid, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Credits</p>
      <div style={{ background: credits > 0 ? "#f0f9f0" : "#fff8f6", border: `1.5px solid ${credits > 0 ? t.accentGreen : t.accentPop}40`, borderRadius: 10, padding: "14px 20px", marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <p style={{ fontWeight: 600, fontSize: 14, color: t.ink, marginBottom: 2 }}>{credits > 0 ? `${credits} credit${credits !== 1 ? "s" : ""} remaining` : "No credits remaining"}</p>
          <p style={{ fontSize: 12, color: t.inkMid }}>{credits > 0 ? "Ready to start another session" : "Top up to continue practising"}</p>
        </div>
        {credits > 0 ? (
          <Btn onClick={onNewSession}>Start a new session →</Btn>
        ) : (
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a href="https://buy.stripe.com/eVqbJ10wOcOa4MAcux5Ne06" onClick={() => sessionStorage.setItem("aey_stripe_source", "dashboard")} style={{ textDecoration: "none" }}>
              <Btn variant="pop">Single session £5</Btn>
            </a>
            <a href="https://buy.stripe.com/bJe8wPcfw7tQenagKN5Ne05" onClick={() => sessionStorage.setItem("aey_stripe_source", "dashboard")} style={{ textDecoration: "none" }}>
              <Btn>Bundle 3 sessions £12</Btn>
            </a>
          </div>
        )}
      </div>

      <SectionDivider />

      {/* ── Past sessions ── */}
      <p style={{ fontSize: 11, fontWeight: 700, color: t.inkMid, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Past sessions</p>

      {realSessions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <p style={{ color: t.inkMid, fontSize: 14, marginBottom: 20 }}>No sessions yet. Start your first one.</p>
          <Btn onClick={onNewSession}>Start a session →</Btn>
        </div>
      ) : (() => {
        const renderSessionCard = (sess) => {
            const saved = outcomeSaved[sess.id];
            const isEditing = outcomeForm && outcomeForm.sessionId === sess.id;
            const displayOutcome = saved ? saved.outcome : sess.interview_outcome;
            const displayNotes = saved ? saved.notes : sess.interview_notes;
            const displayDate = saved ? saved.date : sess.interview_date;
            const isNewest = sess.id === mostRecentSessionId;
            return (
              <div key={sess.id} style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderLeft: isNewest ? `3px solid ${t.accentGreen}` : `1.5px solid ${t.border}`, borderRadius: 12, overflow: "hidden" }}>
                <div onClick={() => setSelectedSession(sess)} className="hover-lift" style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 600, fontSize: 14, color: t.ink }}>
                        {sess.job_title || sess.category_label || "Interview session"}{sess.company && sess.job_title ? ` · ${sess.company}` : ""}
                      </span>
                      {sess.completed && <Tag colour={t.tag} textColour={t.tagText}>Complete</Tag>}
                      {!sess.completed && <Tag colour={t.surfaceAlt} textColour={t.inkMid}>In progress</Tag>}
                      {isNewest && <Tag colour="#fdf0e6" textColour={t.accentPop}>Just added</Tag>}
                    </div>
                    <p style={{ fontSize: 11, color: t.inkLight }}>
                      {sess.category_label ? `${sess.category_label} · ` : ""}{formatDate(sess.created_at)}
                    </p>
                  </div>
                  <Icon name="arrow" size={15} colour={t.inkLight} />
                </div>

                <div style={{ borderTop: `1px solid ${t.border}`, padding: "10px 20px", background: t.bg }}>
                  {isEditing ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>How did it go?</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {OUTCOMES.map(o => (
                          <button key={o.value} onClick={() => setOutcomeForm(f => ({ ...f, outcome: o.value }))} style={{ background: outcomeForm.outcome === o.value ? t.accentGreen : t.surface, color: outcomeForm.outcome === o.value ? "#fff" : t.ink, border: `1.5px solid ${outcomeForm.outcome === o.value ? t.accentGreen : t.border}`, borderRadius: 6, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{o.label}</button>
                        ))}
                      </div>
                      <input type="date" value={outcomeForm.date ? outcomeForm.date.substring(0, 10) : ""} onChange={e => setOutcomeForm(f => ({ ...f, date: e.target.value }))} style={{ width: "100%", background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "9px 14px", color: t.ink, fontSize: 13, outline: "none", fontFamily: "'Inter', sans-serif" }} />
                      <textarea placeholder="Any notes? (optional)" value={outcomeForm.notes} onChange={e => setOutcomeForm(f => ({ ...f, notes: e.target.value }))} rows={2} style={{ width: "100%", background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "9px 14px", color: t.ink, fontSize: 13, outline: "none", resize: "none", fontFamily: "'Inter', sans-serif" }} />
                      <div style={{ display: "flex", gap: 10 }}>
                        <Btn disabled={savingOutcome} onClick={async () => { setSavingOutcome(true); await updateSessionOutcome(outcomeForm.sessionId, outcomeForm.outcome, outcomeForm.notes, outcomeForm.date); setOutcomeSaved(prev => ({ ...prev, [outcomeForm.sessionId]: { outcome: outcomeForm.outcome, notes: outcomeForm.notes, date: outcomeForm.date } })); setOutcomeForm(null); setSavingOutcome(false); }}>{savingOutcome ? "Saving..." : "Save outcome"}</Btn>
                        <Btn variant="outline" onClick={() => setOutcomeForm(null)}>Cancel</Btn>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        {displayOutcome && displayOutcome !== "pending" ? (
                          <div>
                            <p style={{ fontSize: 13, color: t.inkMid, marginBottom: displayNotes ? 3 : 0 }}>
                              <strong style={{ color: t.ink }}>{OUTCOMES.find(o => o.value === displayOutcome)?.label || displayOutcome}</strong>
                              {displayDate && <span style={{ color: t.inkLight }}> — {formatDate(displayDate)}</span>}
                            </p>
                            {displayNotes && <p style={{ fontSize: 12, color: t.inkLight, fontStyle: "italic" }}>{displayNotes}</p>}
                          </div>
                        ) : (
                          <p style={{ fontSize: 12, color: t.inkLight, fontStyle: "italic" }}>Interview diary — log your outcome</p>
                        )}
                      </div>
                      <button onClick={() => setOutcomeForm({ sessionId: sess.id, outcome: displayOutcome || "pending", notes: displayNotes || "", date: displayDate ? displayDate.substring(0, 10) : "" })} style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 6, padding: "5px 12px", fontSize: 12, color: t.inkMid, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 500, flexShrink: 0 }}>
                        {displayOutcome && displayOutcome !== "pending" ? "Edit" : "Log outcome"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
        };
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {recentSessions.length > 0 && (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, color: t.inkLight, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>Last 14 days</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
                  {recentSessions.map(s => renderSessionCard(s))}
                </div>
              </>
            )}
            {Object.entries(olderByMonth).map(([month, monthSessions]) => (
              <div key={month} style={{ marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: t.inkLight, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8 }}>{month}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {monthSessions.map(s => renderSessionCard(s))}
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      <SectionDivider />

      {/* ── Share + Gift ── */}
      <p style={{ fontSize: 11, fontWeight: 700, color: t.inkMid, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Share</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
        <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="share" size={18} colour={t.accentGreen} />
            <span style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>Share with a friend</span>
          </div>
          <p style={{ fontSize: 12, color: t.inkMid, lineHeight: 1.5 }}>Know someone job hunting? Send them the link.</p>
          <button
            onClick={() => {
              navigator.clipboard.writeText("https://coach.aievolvingyou.com");
              setCopyToast(true);
              setTimeout(() => setCopyToast(false), 2500);
            }}
            style={{ background: copyToast ? t.accentGreen : "none", color: copyToast ? "#fff" : t.inkMid, border: `1px solid ${copyToast ? t.accentGreen : t.border}`, borderRadius: 7, padding: "8px 14px", fontSize: 12, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 500, marginTop: "auto", transition: "all 0.2s" }}
          >
            {copyToast ? "Copied!" : "Copy link"}
          </button>
        </div>
        <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon name="gift" size={18} colour={t.accentPop} />
            <span style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>Buy a gift session</span>
          </div>
          <p style={{ fontSize: 12, color: t.inkMid, lineHeight: 1.5 }}>Give someone a coaching session as a gift.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: "auto" }}>
            <a href="https://buy.stripe.com/eVqbJ10wOcOa4MAcux5Ne06" style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", background: "none", border: `1px solid ${t.border}`, borderRadius: 7, padding: "7px 14px", fontSize: 12, color: t.inkMid, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                Single session £5
              </button>
            </a>
            <a href="https://buy.stripe.com/bJe8wPcfw7tQenagKN5Ne05" style={{ textDecoration: "none" }}>
              <button style={{ width: "100%", background: "none", border: `1px solid ${t.border}`, borderRadius: 7, padding: "7px 14px", fontSize: 12, color: t.inkMid, cursor: "pointer", fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                Bundle 3 sessions £12
              </button>
            </a>
          </div>
        </div>
      </div>

      <SectionDivider />

      {/* ── Quiet feedback link ── */}
      <div style={{ textAlign: "center", paddingBottom: 8 }}>
        <a href="mailto:man@aievolvingyou.com?subject=App feedback" style={{ fontSize: 12, color: t.inkLight, textDecoration: "none", borderBottom: `1px solid ${t.border}`, paddingBottom: 1 }}>
          Share feedback on the app
        </a>
      </div>

    </div>
  );
}

// ── App Shell ─────────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useState(0);
  const [category, setCategory] = useState(null);
  const [roleFamily, setRoleFamily] = useState(null);
  const [careerStage, setCareerStage] = useState(null);
  const [jd, setJd] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [sessionAnswers, setSessionAnswers] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [authed, setAuthed] = useState(false);
  const [restoredSession, setRestoredSession] = useState(null);
  const [authDestination, setAuthDestination] = useState("session"); // "session" | "dashboard"
  const [userProfile, setUserProfile] = useState(null); // { background, worry } from profiles table
  const [creditsData, setCreditsData] = useState(null); // { credits_remaining, ... }
  const [stripeReturning, setStripeReturning] = useState(() => new URLSearchParams(window.location.search).get("paid") === "true");

  // Restore auth from sessionStorage on every load (survives Stripe redirect)
  useEffect(() => {
    const savedToken = sessionStorage.getItem("aey_token");
    const savedUser = sessionStorage.getItem("aey_user");
    if (savedToken && savedUser && !currentAccessToken) {
      currentAccessToken = savedToken;
      currentUser = JSON.parse(savedUser);
      setAuthed(true);
      getProfile().then(profile => setUserProfile(profile));
      getCredits().then(cred => setCreditsData(cred));
    }
  }, []);

useEffect(() => {
  const hash = window.location.hash;
  if (!hash) return;
  const params = new URLSearchParams(hash.replace("#", "?"));
  const accessToken = params.get("access_token");
  if (!accessToken) return;

  fetch(AUTH_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "verifyToken", token: accessToken }),
  })
    .then(r => r.json())
    .then(data => {
      if (data.success && data.user) {
        currentUser = data.user;
        currentAccessToken = accessToken;
        // Persist token so Stripe redirect doesn't lose auth state
        sessionStorage.setItem("aey_token", accessToken);
        sessionStorage.setItem("aey_user", JSON.stringify(data.user));
        setAuthed(true);
        // Load profile silently
        getProfile().then(profile => {
          setUserProfile(profile);
          window.history.replaceState(null, "", window.location.pathname);
          // Read persisted destination (survives magic link redirect)
          const savedDest = sessionStorage.getItem("aey_auth_dest") || "session";
          sessionStorage.removeItem("aey_auth_dest");
          const dest = savedDest === "dashboard" ? 7 : (profile?.background ? 2 : 3);
          setStep(dest);
        });
        getCredits().then(cred => setCreditsData(cred));
      }
    })
    .catch(e => console.error("Token catch error:", e));
}, [setStep]);

// ── Stripe return handler ─────────────────────────────────────────
// Fires when user comes back from Stripe with ?paid=true&session_id=XXX
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const paidParam = params.get("paid");
  const tier = params.get("tier");

  if (paidParam !== "true") return;

  // Clean the URL immediately
  window.history.replaceState(null, "", window.location.pathname);

  // Restore auth from sessionStorage if not already set
  const savedToken = sessionStorage.getItem("aey_token");
  const savedUser = sessionStorage.getItem("aey_user");
  if (savedToken && savedUser && !currentAccessToken) {
    currentAccessToken = savedToken;
    currentUser = JSON.parse(savedUser);
    setAuthed(true);
  }

  const stripeSource = sessionStorage.getItem("aey_stripe_source");
  sessionStorage.removeItem("aey_stripe_source");

  // Inner async function so we can await credit writes before navigating
  async function handleReturn() {
    if (stripeSource === "dashboard" && currentAccessToken) {
      await addCreditsAfterPayment(tier || "single");
      const cred = await getCredits();
      setCreditsData(cred);
      setStripeReturning(false);
      setStep(7);
      return;
    }

    const savedSessionId = sessionStorage.getItem("aey_session_id");

    if (savedSessionId && currentAccessToken) {
      await addCreditsAfterPayment(tier || "single");
      const cred = await getCredits();
      setCreditsData(cred);
      const session = await restoreSessionState(savedSessionId);
      if (session) {
        setCategory(session.role_family || null);
        setRoleFamily(session.role_family || null);
        setCareerStage(session.career_stage || null);
        setJd(session.jd || "");
        setUserInfo(session.user_info || null);
        setRestoredSession(session);
        sessionStorage.removeItem("aey_session_id");
        setStripeReturning(false);
        setStep(5);
      } else {
        setStripeReturning(false);
        setStep(1);
      }
    } else if (currentAccessToken) {
      await addCreditsAfterPayment(tier || "single");
      const cred = await getCredits();
      setCreditsData(cred);
      sessionStorage.setItem("aey_credits_just_added", "true");
      setStripeReturning(false);
      setStep(2);
    } else {
      setStripeReturning(false);
      setStep(1);
    }
  }

  handleReturn();
}, []);

  function reset() {
    setStep(0); setCategory(null); setRoleFamily(null);
    setCareerStage(null); setJd(""); setJobTitle(""); setCompany(""); setUserInfo(null);
    setSessionAnswers([]); setCurrentSessionId(null); setAuthed(false);
    setAuthDestination("session"); setUserProfile(null);
    currentUser = null; currentAccessToken = null;
  }

  function resetSession() {
    // Clears session state only — keeps auth intact, returns to category picker
    setCategory(null); setRoleFamily(null);
    setCareerStage(null); setJd(""); setJobTitle(""); setCompany(""); setUserInfo(null);
    setSessionAnswers([]); setCurrentSessionId(null);
    setStep(3);
  }

  if (stripeReturning) {
    return (
      <>
        <style>{css}</style>
        <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <ThinkingDots colour={t.accentGreen} />
            <p style={{ marginTop: 16, fontFamily: "'Inter', sans-serif", fontSize: 16, fontWeight: 600, color: t.ink }}>Payment confirmed</p>
            <p style={{ marginTop: 8, fontFamily: "'Inter', sans-serif", fontSize: 14, color: t.inkMid }}>Returning you to your session...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: "#ffffff" }}>
        <header style={{ borderBottom: "1px solid rgba(0,0,0,0.08)", background: "#ffffff", padding: "0 24px", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 720, margin: "0 auto", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em", color: "#3F6F63" }}>AI Evolving You</span>
              <BetaBadge />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {step === 0 && (
                <button onClick={() => { setAuthDestination("dashboard"); setStep(1); }} style={{ background: "none", border: "none", color: t.inkMid, cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                  Sign in
                </button>
              )}
              {authed && step !== 7 && step > 0 && (
                <button onClick={() => setStep(7)} style={{ background: "none", border: "none", color: "#555555", cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                  My sessions
                </button>
              )}
              {authed && step >= 3 && step <= 6 && (
                <button onClick={resetSession} style={{ background: "none", border: "none", color: "#555555", cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                  Start over
                </button>
              )}
              {authed && (
                <button onClick={reset} style={{ background: "none", border: "none", color: t.inkLight, cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                  Sign out
                </button>
              )}
              {!authed && step > 0 && (
                <button onClick={reset} style={{ background: "none", border: "none", color: "#555555", cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                  ← Start over
                </button>
              )}
            </div>
          </div>
        </header>
        <main style={{ maxWidth: 720, margin: "0 auto", paddingTop: 40 }}>
          {step === 0 && <Landing onStart={() => setStep(1)} onSignIn={() => { setAuthDestination("dashboard"); setStep(1); }} />}
          {step === 1 && (
            <AuthStep
              mode={authDestination === "dashboard" ? "signin" : "create"}
              onAuth={(user, token) => {
                currentUser = user; currentAccessToken = token; setAuthed(true);
                // Load profile and credits silently after auth
                getProfile().then(profile => {
                  setUserProfile(profile);
                  const dest = authDestination === "dashboard" ? 7 : (profile?.background ? 2 : 3);
                  setStep(dest);
                });
                getCredits().then(cred => setCreditsData(cred));
              }}
            />
          )}
          {step === 2 && (
            <CreditsStep
              creditsData={creditsData}
              onContinue={() => setStep(7)}
              onBuyCredits={() => { }}
            />
          )}
          {step === 3 && (
            <CategoryStep onNext={({ category: c, roleFamily: rf, careerStage: cs }) => {
              setCategory(c); setRoleFamily(rf); setCareerStage(cs); setStep(4);
            }} />
          )}
          {step === 4 && (
            <RoleStep
              existingProfile={userProfile}
              isReturning={!!(userProfile?.background)}
              onNext={({ jobTitle: jt, company: co, why, jd: jdVal }) => {
                setJobTitle(jt);
                setCompany(co);
                setJd(jdVal);
                // For new users without a profile, go to profile setup (step 4.5 = step 45)
                // For returning users, assemble userInfo and go to coaching
                if (userProfile?.background) {
                  setUserInfo({ background: userProfile.background, why, worry: userProfile.worry || "", role: jt });
                  setStep(5);
                } else {
                  // Store why temporarily, go to profile setup
                  setUserInfo({ background: "", why, worry: "", role: jt });
                  setStep(45);
                }
              }}
            />
          )}
          {step === 45 && (
            <ProfileSetupStep
              onNext={({ background, worry }) => {
                const updated = { ...userInfo, background, worry };
                setUserInfo(updated);
                saveProfile(background, worry).then(() => {
                  setUserProfile({ background, worry });
                });
                setStep(5);
              }}
              onSkip={() => setStep(5)}
            />
          )}
          {step === 5 && (
            <CoachingStep
              category={category}
              roleFamily={roleFamily}
              careerStage={careerStage}
              jd={jd}
              jobTitle={jobTitle}
              company={company}
              userInfo={userInfo}
              restoredSession={restoredSession}
              hasCredits={!!(creditsData && creditsData.credits_remaining > 0)}
              onFinish={(ans, sessId) => { setSessionAnswers(ans); setCurrentSessionId(sessId || null); setStep(6); }}
              onBackToAbout={() => setStep(4)}
            />
          )}
          {step === 6 && (
            <SummaryStep
              answers={sessionAnswers}
              userInfo={userInfo}
              category={category}
              sessionId={currentSessionId}
              jobTitle={jobTitle}
              company={company}
              onRestart={reset}
              onViewHistory={() => setStep(7)}
            />
          )}
          {step === 7 && (
            <SessionHistoryStep
              onNewSession={() => setStep(3)}
              onBack={() => setStep(6)}
              userProfile={userProfile}
              onProfileSaved={(updated) => setUserProfile(updated)}
              initialCreditsData={creditsData}
              onCreditsRefresh={() => getCredits().then(cred => setCreditsData(cred))}
            />
          )}
        </main>
      </div>
    </>
  );
}