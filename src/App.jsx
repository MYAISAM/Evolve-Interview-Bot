import { useState, useEffect, useRef } from "react";

const API = "/api/anthropic";

// ── Supabase client ───────────────────────────────────────────────
const SUPABASE_URL = "https://fdwldyhzoojeoapmqwxv.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkd2xkeWh6b29qZW9hcG1xd3h2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM3ODcwMjAsImV4cCI6MjA1OTM2MzAyMH0.PRL7W4jzMS9l-B4xJI4NYRp12sVR0ylfc2xWN_E2qL4";

async function supabaseInsert(table, data) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    return result[0] || null;
  } catch (e) {
    console.error("Supabase insert error:", e);
    return null;
  }
}

async function supabaseUpdate(table, id, data) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify(data),
    });
  } catch (e) {
    console.error("Supabase update error:", e);
  }
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
// 14 categories — 8 Role Families + 5 Career Stages + 1 Specialist
// 25 questions per category = 350 questions total

const ROLE_FAMILIES = ["commercial", "people_talent", "product_tech", "marketing", "finance_ops", "hr_people", "project_programme", "general"];
const CAREER_STAGES = ["graduate", "experienced", "career_changer", "returner", "mindset", "tough_questions"];

const QUESTION_BANK = {

  // ── ROLE FAMILIES ────────────────────────────────────────────────

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

  // ── CAREER STAGES ────────────────────────────────────────────────

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

  // ── SPECIALIST ───────────────────────────────────────────────────

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

        // Detect lines that are purely a URL — render as a button link
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

        // Detect lines with inline URL pattern: "Label text: https://..."
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

// ── Landing ───────────────────────────────────────────────────────
function Landing({ onStart }) {
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
          <p style={{ color: t.inkLight, fontSize: 12, marginTop: 14, fontStyle: "italic" }}>No signup · No payment · Beta access</p>
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
// Three-box UX: Role Family (required) → Career Stage (optional) → Job spec (required)
function CategoryStep({ onNext }) {
  const [roleFamily, setRoleFamily] = useState(null);
  const [careerStage, setCareerStage] = useState(null);
  const [jd, setJd] = useState("");
  useScrollToTop("category");

  // Derive the active category key: career stage takes priority if selected, else role family
  const activeCategory = careerStage || roleFamily;

  const roleFamilies = ROLE_FAMILIES.map(key => ({ key, ...QUESTION_BANK[key] }));
  const careerStages = CAREER_STAGES.map(key => ({ key, ...QUESTION_BANK[key] }));

  return (
    <div className="fade-up" style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ marginBottom: 8 }}><Tag colour={t.surfaceAlt} textColour={t.inkMid}>Step 1 of 3</Tag></div>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 700, margin: "12px 0 6px" }}>Set up your session</h2>
      <p style={{ color: t.inkMid, fontSize: 15, marginBottom: 32, fontWeight: 300 }}>Three quick steps — takes less than a minute.</p>

      {/* BOX 1 — Role Family */}
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

      {/* BOX 2 — Career Stage */}
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

      {/* BOX 3 — Job spec */}
      <div style={{ background: t.surface, border: `1.5px solid ${jd.length > 50 ? t.accentGreen : t.border}`, borderRadius: 12, padding: "20px 22px", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: jd.length > 50 ? t.accentGreen : t.surfaceAlt, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {jd.length > 50 ? <Icon name="check" size={12} colour="#fff" /> : <span style={{ fontSize: 12, fontWeight: 700, color: t.inkMid }}>3</span>}
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: t.ink, textTransform: "uppercase", letterSpacing: "0.06em" }}>Paste the job description</span>
          <span style={{ fontSize: 12, color: t.accentPop, fontWeight: 600 }}>Required</span>
        </div>
        <p style={{ fontSize: 12, color: t.inkMid, marginBottom: 12, fontStyle: "italic", marginLeft: 34, lineHeight: 1.5 }}>
          Open the job posting, select all the text, copy and paste it here. The more detail you give us, the more specific your questions will be.
        </p>
        <textarea
          value={jd} onChange={e => setJd(e.target.value)}
          placeholder="Paste the full job description here…" rows={8}
          style={{
            width: "100%", background: t.bg,
            border: `1.5px solid ${jd.length > 50 ? t.accentGreen : t.border}`,
            borderRadius: 7, padding: "13px 15px", color: t.ink, fontSize: 14, lineHeight: 1.6,
            outline: "none", transition: "border-color 0.2s",
          }}
        />
        {jd.length > 50 && (
          <p style={{ fontSize: 11, color: t.accentGreen, marginTop: 6, fontStyle: "italic" }}>
            ✓ {jd.length} characters — looking good
          </p>
        )}
      </div>

      <Btn
        onClick={() => onNext({ category: activeCategory, roleFamily, careerStage, jd })}
        disabled={!roleFamily || jd.length < 50}
      >
        Continue →
      </Btn>

      {!roleFamily && (
        <p style={{ color: t.inkLight, fontSize: 12, marginTop: 10, fontStyle: "italic" }}>Pick a role family above to continue</p>
      )}
      {roleFamily && jd.length < 50 && (
        <p style={{ color: t.inkLight, fontSize: 12, marginTop: 10, fontStyle: "italic" }}>Paste the job description to continue</p>
      )}
    </div>
  );
}

// ── About You ─────────────────────────────────────────────────────
function AboutStep({ onNext }) {
  const [background, setBackground] = useState("");
  const [why, setWhy] = useState("");
  const [worry, setWorry] = useState("");
  useScrollToTop("about");

  return (
    <div className="fade-up" style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ marginBottom: 8 }}><Tag colour={t.surfaceAlt} textColour={t.inkMid}>Step 2 of 3</Tag></div>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 700, margin: "12px 0 6px" }}>A bit about you</h2>
      <p style={{ color: t.inkMid, fontSize: 15, marginBottom: 28, fontWeight: 300 }}>Three quick questions so we can make this personal.</p>
      {[
        { label: "Your background", hint: "Current or most recent role — 1-2 sentences is fine", value: background, set: setBackground, rows: 3, required: true },
        { label: "Why this role?", hint: "What draws you to it?", value: why, set: setWhy, rows: 3, required: true },
        { label: "Biggest interview worry", hint: "Optional — helps us focus the coaching where it counts", value: worry, set: setWorry, rows: 2, required: false },
      ].map((f, i) => (
        <div key={i} style={{ marginBottom: 22 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 700, color: t.accentPop, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {f.label} {!f.required && <span style={{ color: t.inkLight, fontWeight: 400, textTransform: "none" }}>(optional)</span>}
          </label>
          <p style={{ fontSize: 12, color: t.inkLight, marginBottom: 8, fontStyle: "italic" }}>{f.hint}</p>
          <textarea
            value={f.value} onChange={e => f.set(e.target.value)} rows={f.rows}
            style={{
              width: "100%", background: t.surface,
              border: `1.5px solid ${f.value.length > 10 ? t.ink : t.border}`,
              borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14, lineHeight: 1.6,
              outline: "none", transition: "border-color 0.2s",
            }}
          />
          {f.required && f.value.length > 0 && f.value.length < 40 && (
            <p style={{ fontSize: 11, color: t.accentPop, marginTop: 5, fontStyle: "italic" }}>
              A little more detail helps us personalise your session
            </p>
          )}
        </div>
      ))}
      <Btn onClick={() => onNext({ background, why, worry })} disabled={background.length < 40 || why.length < 40}>
        Generate my questions →
      </Btn>
      {(background.length < 40 || why.length < 40) && (background.length > 0 || why.length > 0) && (
        <p style={{ color: t.inkLight, fontSize: 12, marginTop: 10, fontStyle: "italic" }}>
          Add a little more detail above to continue — the more you share, the better your coaching
        </p>
      )}
    </div>
  );
}

// ── Coaching Session ──────────────────────────────────────────────
function CoachingStep({ category, roleFamily, careerStage, jd, userInfo, onFinish, onBackToAbout }) {
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
  const recognitionRef = useRef(null);
  const sessionIdRef = useRef(null);
  useScrollToTop("coaching");

  // Use careerStage bank if selected, otherwise roleFamily bank
  const bank = QUESTION_BANK[category] || QUESTION_BANK[roleFamily];

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

  useEffect(() => { buildQuestions(); }, []);
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [currentQ]);

  async function buildQuestions() {
const shuffled = roleFamily && careerStage
  ? [
      ...[...QUESTION_BANK[roleFamily].questions].sort(() => Math.random() - 0.5).slice(0, 2),
      ...[...QUESTION_BANK[careerStage].questions].sort(() => Math.random() - 0.5).slice(0, 1),
    ]
  : [...bank.questions].sort(() => Math.random() - 0.5).slice(0, 3);
    // Build context label for AI — combine role family + career stage if both selected
    const contextLabel = roleFamily && careerStage
      ? `${QUESTION_BANK[roleFamily].label} (${QUESTION_BANK[careerStage].label})`
      : bank.label;

    // ── Create Supabase session row ───────────────────────────────
    const token = generateToken();
    const session = await supabaseInsert("coach_sessions", {
      session_token: token,
      role_family: roleFamily ? QUESTION_BANK[roleFamily].label : null,
      career_stage: careerStage ? QUESTION_BANK[careerStage].label : null,
      questions_answered: 0,
      completed: false,
      paid: false,
    });
    if (session?.id) sessionIdRef.current = session.id;
    // ─────────────────────────────────────────────────────────────

    try {
      const validationRes = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 50,
          messages: [{
            role: "user",
            content: `You are checking whether two short pieces of text are genuine, meaningful responses from a real person — not gibberish, random letters, placeholder text, or nonsense.

Background: "${userInfo.background}"
Why this role: "${userInfo.why}"

Reply with only the word VALID if both are genuine real responses, or INVALID if either appears to be gibberish, random characters, or not a real answer. Nothing else.`,
          }],
        }),
      });
      const validationData = await validationRes.json();
      const validationResult = validationData.content[0].text.trim().toUpperCase();

      if (validationResult.includes("INVALID")) {
        setOnboardingInvalid(true);
        return;
      }

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
- Each question MUST reference something specific from the job description — a named skill, responsibility, tool, or challenge mentioned in the spec
- Do NOT generate generic interview questions — every question must be tailored to THIS role
- Mix behavioural (past experience) and situational (hypothetical scenario) questions
- Make questions feel like they came from a real hiring manager who read the spec, not a template
- Return ONLY a valid JSON array of strings, no markdown, no explanation

Job Description:
${jd}

Role Category: ${contextLabel}
Candidate background: ${userInfo.background}
Why they want this role: ${userInfo.why}

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
      setQuestions(combined.map(x => x.q));
      setQuestionTypes(combined.map(x => x.type));
    } catch {
      const fallback = [
        "Tell me about yourself and why you're applying for this role.",
        "What relevant experience do you bring?",
        "Describe a challenge you've overcome at work.",
        "Where do you want to be in three years?",
      ];
      setQuestions([...shuffled, ...fallback].slice(0, 7));
      setQuestionTypes([...shuffled.map(() => "curated"), ...fallback.map(() => "ai")].slice(0, 7));
    }
    setPhase("answering");
  }

  const GIBBERISH_SENTINEL = "might not have been a real attempt";

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

IMPORTANT: First check if the answer is genuine. If the answer is random characters, gibberish, a single word, or clearly not a real attempt (e.g. "asdfgh", "xxx", "idk"), do NOT give coaching feedback. Instead respond with only this exact text:

What landed well:
It looks like that answer might not have been a real attempt — that's completely fine, it happens.

What to sharpen:
Try answering as you would in the actual room. Even a rough, honest answer gives us something real to coach.

Try saying it like this:
Start with one sentence about your experience, add what you did, and finish with the result or what you learned.

If the answer IS genuine, continue with your normal coaching below.

${category === "tough_questions" ? `SPECIAL INSTRUCTION: This candidate has chosen to practise tough, bias-adjacent questions. When coaching their answer, focus especially on helping them reframe from defence to quiet confidence. Their non-traditional route, gap, or background is a strength — coach them to own it, not apologise for it.` : ""}

Use what you know about them:
- Their background: ${userInfo.background}
- Why they want this role: ${userInfo.why}
- Their worry going in: ${userInfo.worry || "not specified"}
- The role they're applying for: ${bank.label} — ${jd.slice(0, 300)}

Give feedback in exactly these 3 sections, using these exact headers:

What landed well:
(1-2 sentences — name something specific and genuine from their answer, connected to what this role needs)

What to sharpen:
(1-2 sentences — one specific, actionable improvement tied to this role or their background)

Try saying it like this:
(Rewrite their answer in 2-3 punchy sentences they could actually use in the room — make it sound like them, not a template)

Question asked: ${questions[currentQ]}
Their answer: ${answer}

Keep the whole response under 200 words. Be a coach, not a critic. No bullet points, no markdown symbols — just the three plain sections with their headers.`,
          }],
        }),
      });
      const data = await res.json();
      const feedbackText = data.content[0].text;
      setFeedback(feedbackText);
      setFeedbackIsGibberish(feedbackText.includes(GIBBERISH_SENTINEL));
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

    // ── Update Supabase session ───────────────────────────────────
    if (sessionIdRef.current) {
      supabaseUpdate("coach_sessions", sessionIdRef.current, {
        questions_answered: newAnswers.filter(a => a.genuine).length,
        completed: isLastQuestion,
      });
    }
    // ─────────────────────────────────────────────────────────────

    if (isLastQuestion) { onFinish(newAnswers); }
    else { setCurrentQ(c => c + 1); setPhase("answering"); }
  }

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

  return (
    <div className="fade-up" style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={bank.icon} size={16} colour={t.inkMid} />
          <span style={{ fontSize: 13, color: t.inkMid }}>{bank.label}</span>
        </div>
        <span style={{ fontSize: 13, color: t.inkMid }}>{currentQ + 1} / {questions.length}</span>
      </div>
      <div style={{ height: 3, background: t.border, borderRadius: 2, marginBottom: 32, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: t.accentPop, transition: "width 0.4s ease", borderRadius: 2 }} />
      </div>
      <div style={{ marginBottom: 12 }}>
        {questionTypes[currentQ] === "curated"
          ? <Tag colour={bank.colour} textColour={bank.borderColour}>From question bank</Tag>
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

// ── Summary ───────────────────────────────────────────────────────
function SummaryStep({ answers, userInfo, category, onRestart }) {
  const [cheatSheet, setCheatSheet] = useState("");
  const [loadingSheet, setLoadingSheet] = useState(true);
  const [feedbackText, setFeedbackText] = useState({});
  const [feedbackSent, setFeedbackSent] = useState(false);
  const cat = QUESTION_BANK[category];
  useScrollToTop("summary");

  const genuineCount = answers.filter(a => a.genuine === true).length;
  const totalCount = answers.length;
  const halfOrMore = genuineCount >= Math.ceil(totalCount / 2);

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

  useEffect(() => { generateSummary(); }, []);

  async function generateSummary() {
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 700,
          messages: [{
            role: "user",
            content: `You are creating a pre-interview cheat sheet — not a session debrief. This is something the candidate reads 10 minutes before walking into the room. It should make them feel prepared, armed, and confident. Think boxer's corner card, not post-match analysis.

IMPORTANT CONTEXT: The candidate answered ${genuineCount} out of ${totalCount} questions genuinely.
${genuineCount <= 2 ? `They answered very few questions. Be honest — tell them the cheat sheet is limited because there wasn't enough to work with, and nudge them to come back and complete a full session before their interview. Keep it brief and direct.` : `Build this from what they actually said — pull real phrases and stories from their answers, not generic advice.`}

Use exactly these 4 sections with plain text headers followed by a colon. No asterisks, dashes, or markdown formatting in headers:

Your ammunition:
(2-3 bullet points using • only — name their strongest specific stories or examples from this session. Write each as: "The [situation] story — use this when they ask about [topic]". Make it immediately usable, not descriptive.)

Land these phrases:
(2 bullet points using • only — pull the most compelling specific lines or phrases from their actual answers that they should use verbatim or close to it. Quote them directly if strong enough.)

Watch out for:
(2 bullet points using • only — one specific thing to improve, one reminder about delivery or structure. Forward-facing, not critical.)

Walk in with this:
(One punchy, energising sentence. Make it feel personal to their background and this role. This is the last thing they read before they go in.)

Then after the four sections add:

Go deeper:
(1-3 clickable article links from aievolvingyou.com — only include ones genuinely relevant to what this candidate needs to work on. Format each as: Label text: URL on its own line.)

Available articles:
• The STAR Method — how to structure any behavioural answer: https://aievolvingyou.com/resources/star-method
• How to answer "What's your biggest weakness?": https://aievolvingyou.com/resources/weakness-question
• The four types of interview question (and how to handle each): https://aievolvingyou.com/resources/four-types-of-interview-question
• The specificity principle — why vague answers lose interviews: https://aievolvingyou.com/resources/specificity-principle
• How to use AI to prepare for interviews: https://aievolvingyou.com/resources/ai-interview-prep
• How to interview after a long career gap: https://aievolvingyou.com/resources/interviewing-after-long-gap

RULES: Use ONLY the • character for bullets. No **, *, or - anywhere. Headers are plain text followed by a colon on their own line. Keep the whole thing under 250 words — tight and punchy, not comprehensive.

Candidate background: ${userInfo.background}
Why they want this role: ${userInfo.why}
Their biggest worry: ${userInfo.worry || "not specified"}
Role category: ${cat.label}
Session answers: ${answers.filter(a => a.genuine).map((a, i) => `Q${i + 1}: ${a.q}\nA: ${a.a}`).join("\n\n")}`,
          }],
        }),
      });
      const data = await res.json();
      setCheatSheet(data.content[0].text);
    } catch {
      setCheatSheet("Your strongest moments:\n• You showed up and practised — that already puts you ahead of most candidates\n• Your answers show real experience and self-awareness\n• You engaged honestly with the difficult questions\n\nWatch out for:\n• Keep answers to 60–90 seconds — less is more\n• Back every claim with a specific example\n\nWalk in with this:\nYou've done the work. Back yourself.");
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
        {loadingSheet ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <ThinkingDots colour={t.accentGreen} />
            <p style={{ marginTop: 12, color: t.inkLight, fontStyle: "italic", fontSize: 13 }}>Building your cheat sheet…</p>
          </div>
        ) : (
          <RenderMarkdown text={cheatSheet} />
        )}
      </div>

      {/* ── Q&A Recap ─────────────────────────────────────────── */}
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
                {item.feedback && (
                  <div style={{ padding: "12px 18px", borderTop: `1px solid ${t.border}`, background: "#fffdf7" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: t.accentPop, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>Key coaching point</p>
                    <p style={{ fontSize: 13, color: t.ink, lineHeight: 1.6 }}>
                      {item.feedback.split("\n").find(l => l.toLowerCase().includes("sharpen") || l.toLowerCase().includes("improve"))
                        ? item.feedback.split("\n").slice(
                            item.feedback.split("\n").findIndex(l => l.toLowerCase().includes("sharpen")) + 1
                          ).find(l => l.trim().length > 20) || item.feedback.split("\n").find(l => l.trim().length > 20)
                        : item.feedback.split("\n").find(l => l.trim().length > 20)}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ────────────────────────────────────────────────────────── */}

      <div style={{ background: "#fff8f6", border: `1px solid ${t.accentPop}25`, borderRadius: 10, padding: "14px 18px", marginBottom: 40 }}>
        <p style={{ fontSize: 13, color: t.inkMid, lineHeight: 1.6 }}>
          <strong style={{ color: t.accentPop }}>Beta note:</strong> You're one of the first people to use this tool. Session history, progress tracking, and voice mode are all coming — see the full roadmap on the <a href="/" style={{ color: t.accentPop }}>homepage</a>.
        </p>
      </div>

      <Divider />

      {!feedbackSent ? (
        <div className="fade-in">
          <div style={{ marginBottom: 6 }}><Tag colour={t.surfaceAlt} textColour={t.inkMid}>Before you go</Tag></div>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Five quick questions.</h3>
          <p style={{ color: t.inkMid, fontSize: 15, marginBottom: 28, lineHeight: 1.6, fontWeight: 300 }}>
            This tool is free during beta. In return, we'd love 3 minutes of honest feedback across five quick questions — it directly shapes what gets built next.
          </p>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: t.ink, marginBottom: 6 }}>1. What was the hardest question in today's session?</label>
            <textarea rows={3} onChange={e => setFeedbackText(prev => ({ ...prev, q1: e.target.value }))}
              placeholder="The question that made you think hardest…"
              style={{ width: "100%", background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14, lineHeight: 1.6, outline: "none" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: t.ink, marginBottom: 6 }}>2. Did the coaching feel relevant to your actual role?</label>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              {["Yes, very", "Mostly", "Not really"].map(opt => (
                <button key={opt} onClick={() => setFeedbackText(prev => ({ ...prev, q2: opt }))} style={{
                  padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer",
                  fontFamily: "'Inter', sans-serif", transition: "all 0.15s",
                  background: feedbackText.q2 === opt ? t.accentGreen : t.surface,
                  color: feedbackText.q2 === opt ? "#fff" : t.ink,
                  border: `1.5px solid ${feedbackText.q2 === opt ? t.accentGreen : t.border}`,
                }}>{opt}</button>
              ))}
            </div>
            <textarea rows={2} onChange={e => setFeedbackText(prev => ({ ...prev, q2detail: e.target.value }))}
              placeholder="Any detail helps — even one sentence…"
              style={{ width: "100%", background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14, lineHeight: 1.6, outline: "none" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: t.ink, marginBottom: 6 }}>3. Anything you wished we'd asked you?</label>
            <textarea rows={2} onChange={e => setFeedbackText(prev => ({ ...prev, q3: e.target.value }))}
              placeholder="A question you were expecting but didn't get…"
              style={{ width: "100%", background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14, lineHeight: 1.6, outline: "none" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: t.ink, marginBottom: 6 }}>4. Which of these would make you come back to this tool?</label>
            <p style={{ fontSize: 12, color: t.inkLight, marginBottom: 12, fontStyle: "italic" }}>Select all that apply</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FEATURES.map((feat, i) => {
                const selected = (feedbackText.q4 || []).includes(feat);
                return (
                  <div key={i} onClick={() => setFeedbackText(prev => {
                    const current = prev.q4 || [];
                    return { ...prev, q4: selected ? current.filter(f => f !== feat) : [...current, feat] };
                  })} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                    background: selected ? t.tag : t.surface,
                    border: `1.5px solid ${selected ? t.accentGreen : t.border}`,
                    borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                  }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, flexShrink: 0, background: selected ? t.accentGreen : "#fff", border: `1.5px solid ${selected ? t.accentGreen : t.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {selected && <Icon name="check" size={11} colour="#fff" />}
                    </div>
                    <span style={{ fontSize: 14, color: t.ink, lineHeight: 1.4 }}>{feat}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: t.ink, marginBottom: 4 }}>5. One last thing — optional but really useful.</label>
            <p style={{ fontSize: 12, color: t.inkLight, marginBottom: 14, fontStyle: "italic" }}>Takes 10 seconds. Helps us show others what this is actually like.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.inkMid, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Before this session I felt…</label>
                <input
                  type="text"
                  onChange={e => setFeedbackText(prev => ({ ...prev, q5before: e.target.value }))}
                  placeholder="e.g. unprepared, nervous, unsure where to start…"
                  style={{ width: "100%", background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif" }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: t.inkMid, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Now I feel…</label>
                <input
                  type="text"
                  onChange={e => setFeedbackText(prev => ({ ...prev, q5after: e.target.value }))}
                  placeholder="e.g. more confident, ready, clearer on what to say…"
                  style={{ width: "100%", background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14, outline: "none", fontFamily: "'Inter', sans-serif" }}
                />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: t.ink, marginBottom: 4 }}>
              Stay in the loop <span style={{ color: t.inkLight, fontWeight: 400 }}>(optional)</span>
            </label>
            <p style={{ fontSize: 12, color: t.inkLight, marginBottom: 10, fontStyle: "italic", lineHeight: 1.5 }}>
              Drop your email if you'd like to hear when new features land — voice mode, session history, and more are on the way. No spam, just updates when something worth sharing is ready.
            </p>
            <input
              type="email"
              value={feedbackText.email || ""}
              onChange={e => setFeedbackText(prev => ({ ...prev, email: e.target.value }))}
              placeholder="your@email.com"
              style={{
                width: "100%", background: t.surface,
                border: `1.5px solid ${feedbackText.email ? t.ink : t.border}`,
                borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14,
                outline: "none", transition: "border-color 0.2s", fontFamily: "'Inter', sans-serif",
              }}
            />
          </div>

          <Btn onClick={async () => {
            try {
              const body = new URLSearchParams({
                "form-name": "beta-feedback",
                "q1-hardest-question": feedbackText.q1 || "",
                "q2-coaching-relevant": feedbackText.q2 || "",
                "q2-detail": feedbackText.q2detail || "",
                "q3-missing-questions": feedbackText.q3 || "",
                "q4-features": (feedbackText.q4 || []).join(", "),
                "q5-before": feedbackText.q5before || "",
                "q5-after": feedbackText.q5after || "",
                "email": feedbackText.email || "",
              });
              await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body });
            } catch (e) { console.error("Feedback submit error", e); }
            setFeedbackSent(true);
          }} variant="pop">
            Send feedback →
          </Btn>
          <p style={{ fontSize: 11, color: t.inkLight, marginTop: 12, fontStyle: "italic", lineHeight: 1.5 }}>
            Your answers are used only to generate your coaching and cheat sheet. Nothing is stored or shared. Session ends when you close the tab.
          </p>
        </div>
      ) : (
        <div className="fade-in" style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <Icon name="check" size={40} colour={t.accentGreen} />
          </div>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, marginBottom: 8 }}>Thank you — genuinely.</h3>
          <p style={{ color: t.inkMid, fontSize: 15, fontStyle: "italic" }}>
            This feedback goes straight into making the product better. Good luck with your interview.
          </p>
        </div>
      )}
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
  const [userInfo, setUserInfo] = useState(null);
  const [sessionAnswers, setSessionAnswers] = useState([]);

  function reset() {
    setStep(0); setCategory(null); setRoleFamily(null);
    setCareerStage(null); setJd(""); setUserInfo(null); setSessionAnswers([]);
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
            {step > 0 && (
              <button onClick={reset} style={{ background: "none", border: "none", color: "#555555", cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                ← Start over
              </button>
            )}
          </div>
        </header>
        <main style={{ maxWidth: 720, margin: "0 auto", paddingTop: 40 }}>
          {step === 0 && <Landing onStart={() => setStep(1)} />}
          {step === 1 && (
            <CategoryStep onNext={({ category: c, roleFamily: rf, careerStage: cs, jd: j }) => {
              setCategory(c); setRoleFamily(rf); setCareerStage(cs); setJd(j); setStep(2);
            }} />
          )}
          {step === 2 && <AboutStep onNext={info => { setUserInfo(info); setStep(3); }} />}
          {step === 3 && (
            <CoachingStep
              category={category}
              roleFamily={roleFamily}
              careerStage={careerStage}
              jd={jd}
              userInfo={userInfo}
              onFinish={ans => { setSessionAnswers(ans); setStep(4); }}
              onBackToAbout={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <SummaryStep
              answers={sessionAnswers}
              userInfo={userInfo}
              category={category}
              onRestart={reset}
            />
          )}
        </main>
      </div>
    </>
  );
}