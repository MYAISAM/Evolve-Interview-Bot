import { useState, useEffect, useRef } from "react";
 
const API = "/api/anthropic";
 
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
// All icons use brand green (#3F6F63) as default, orange (#D47A2C) for highlights
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
    star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    book: "M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 004 17V4h16v13H6.5M4 19.5V21",
    film: "M7 4v16M17 4v16M3 8h4M17 8h4M3 12h18M3 16h4M17 16h4M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z",
    target: "M12 22a10 10 0 100-20 10 10 0 000 20zM12 18a6 6 0 100-12 6 6 0 000 12zM12 14a2 2 0 100-4 2 2 0 000 4z",
    sparkle: "M12 3v1M12 20v1M4.22 4.22l.7.7M19.08 19.08l.7.7M3 12h1M20 12h1M4.22 19.78l.7-.7M19.08 4.92l.7-.7M12 7a5 5 0 100 10A5 5 0 0012 7z",
    warning: "M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colour} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}
 
// ── Question Bank ─────────────────────────────────────────────────
const QUESTION_BANK = {
  sales: {
    label: "Sales & Business Development",
    icon: "sales",
    colour: "#e8f0fe",
    borderColour: "#1d4e89",
    questions: [
      "Walk me through a deal you're most proud of closing — what made it work?",
      "Tell me about a time you lost a deal you thought you'd win. What did you learn?",
      "How do you build rapport with a prospect who is initially cold or resistant?",
      "Describe your process for managing a complex, multi-stakeholder sale.",
      "How do you handle objections around price?",
      "What does your pipeline management process look like day to day?",
      "Tell me about a time you exceeded your targets. What drove that performance?",
      "How do you stay motivated during a slow pipeline period?",
      "Describe a time you had to adapt your sales approach for a new market or product.",
      "What's your approach to researching a prospect before a first call?",
      "Tell me about a time you exceeded your sales target — what drove that result?",
      "Describe a situation where a deal fell through at the last moment. What did you learn?",
      "How would you approach a prospect who has gone cold after initial interest?",
      "Tell me about a time you built a long-term relationship with a difficult client.",
      "How do you prioritise accounts when your pipeline is full?",
      "What motivates you most about working in sales?",
      "Tell me about a time you collaborated with marketing or product to close a deal.",
      "How would you handle being behind on your target halfway through the quarter?",
      "Give an example of when you had to persuade a client to choose you over a competitor.",
      "What's the toughest negotiation you've been part of, and how did you handle it?",
      "Tell me about a time you identified an upsell or cross-sell opportunity.",
      "How do you handle rejection in sales without it affecting your confidence?",
      "Describe a time you challenged a client's initial assumptions — what happened?",
      "Tell me about a time you used data to improve your sales performance.",
      "Describe your proudest sales accomplishment and why it matters to you.",
    ],
  },
  cs: {
    label: "Customer Success",
    icon: "cs",
    colour: "#e8f4e8",
    borderColour: "#2d6a4f",
    questions: [
      "Tell me about a customer you turned around from being at risk of churn.",
      "How do you build a success plan with a new customer in the first 90 days?",
      "Describe a time you had to deliver bad news to a customer. How did you handle it?",
      "How do you manage a portfolio of accounts with very different needs and maturity levels?",
      "Tell me about a time a customer pushed back on your advice. What did you do?",
      "How do you identify expansion opportunities without being pushy?",
      "Walk me through how you prepare for a quarterly business review.",
      "Describe a time you collaborated with sales or product to solve a customer problem.",
      "How do you measure the health of your accounts?",
      "Tell me about the most complex onboarding you've managed.",
      "How would you handle a client threatening to cancel their contract?",
      "Describe a time you worked with a customer to achieve a measurable outcome.",
      "What attracted you to customer success as a career?",
      "How do you balance customer needs with internal company policy?",
      "Tell me about a time you identified an opportunity to improve the customer experience.",
      "How do you help drive product adoption among reluctant users?",
      "Give an example of when you collaborated cross-functionally for a client outcome.",
      "How do you measure success in a customer success role beyond NPS?",
      "Describe a time you had to manage a major escalation.",
      "How would you manage a renewal conversation where usage has been low?",
      "Tell me about a time you improved retention or reduced churn across your portfolio.",
      "How do you handle conflicting feedback from multiple customers at once?",
      "Describe a situation where you identified an upsell through relationship building.",
      "How would you onboard a new enterprise client with multiple stakeholders?",
      "Share an example of when data helped you improve customer outcomes.",
    ],
  },
  recruitment: {
    label: "Recruitment & Talent",
    icon: "recruitment",
    colour: "#fff8e8",
    borderColour: "#b8860b",
    questions: [
      "Tell me about a hard-to-fill role you've successfully closed. What was your approach?",
      "How do you build a talent pipeline for roles before they're open?",
      "Describe a time you pushed back on a hiring manager's brief. What happened?",
      "How do you ensure your process is inclusive and reduces bias?",
      "Tell me about a hire you made that didn't work out. What did you learn?",
      "How do you assess culture fit without it becoming a proxy for bias?",
      "Walk me through how you manage candidate experience across a long process.",
      "Describe a time you had to fill multiple roles simultaneously under pressure.",
      "How do you use data to improve your recruitment process?",
      "Tell me about a time you had to sell a role to a passive candidate.",
      "How would you handle a hiring manager who disagrees with your candidate recommendations?",
      "Describe a sourcing strategy you've used creatively to find hard-to-reach talent.",
      "What drew you to a career in recruitment?",
      "How would you improve time-to-hire without compromising on quality?",
      "Tell me about a time you dealt with a candidate withdrawing late in the process.",
      "Give an example of when you managed multiple urgent vacancies simultaneously.",
      "How would you handle a candidate failing to meet expectations after joining?",
      "Tell me about a time you influenced a difficult or sceptical stakeholder.",
      "How would you approach hiring in a new market with little brand recognition?",
      "Give an example of when data helped you improve the recruitment process.",
      "Tell me about a time you used networking to source top talent.",
      "Describe a time you had to manage a hiring freeze or sudden change in priorities.",
      "How would you navigate salary negotiations that exceed the budget?",
      "Tell me about a time you implemented a new hiring process or tool.",
      "How do you maintain relationships with candidates for future opportunities?",
    ],
  },
  product: {
    label: "Product Management",
    icon: "product",
    colour: "#fce8f0",
    borderColour: "#8b1a4a",
    questions: [
      "Walk me through a product decision you're most proud of — from insight to launch.",
      "Tell me about a time you had to say no to a feature request. How did you handle it?",
      "How do you decide what to prioritise when everything feels urgent?",
      "Describe a time a product you shipped didn't land as expected. What did you do?",
      "How do you balance short-term fixes with long-term strategic work?",
      "Tell me about how you build alignment between engineering, design, and commercial teams.",
      "How do you validate an idea before investing in building it?",
      "Describe your approach to writing a product requirements document.",
      "Tell me about a time you used data to challenge an assumption about your users.",
      "How do you keep up with what customers actually need day to day?",
      "Tell me about a time you prioritised conflicting stakeholder requests — how did you decide?",
      "How would you handle launching a product that's running behind schedule?",
      "Describe a product decision you regret and what you'd do differently.",
      "Tell me about a time you said no to a feature and had to defend that decision.",
      "How would you manage a team divided over roadmap priorities?",
      "Give an example of when you used customer feedback to change direction on a product.",
      "How do you personally balance data-driven and intuitive decision making?",
      "How would you handle a stakeholder demanding an unrealistic delivery timeline?",
      "Tell me about a time you influenced without direct authority.",
      "How would you approach gathering requirements for an unfamiliar product area?",
      "Describe a time you led a cross-functional team through a major release.",
      "Tell me about a product you launched successfully — what made it work?",
      "How would you deal with declining user engagement metrics?",
      "Describe a time you managed significant trade-offs between quality and speed.",
      "How would you rebuild trust with users after a failed product launch?",
    ],
  },
  engineering: {
    label: "Engineering (Behavioural)",
    icon: "engineering",
    colour: "#f0f0fe",
    borderColour: "#3730a3",
    questions: [
      "Tell me about a technically complex problem you solved — walk me through your thinking.",
      "Describe a time you had to make a technical decision with incomplete information.",
      "How do you approach code review — giving and receiving feedback?",
      "Tell me about a time you disagreed with a technical decision made by your team. What did you do?",
      "How do you balance writing clean code with shipping fast?",
      "Describe a time a production issue happened on your watch. How did you respond?",
      "How do you approach learning a new codebase or technology?",
      "Tell me about a project that went off track. What was your role in getting it back?",
      "How do you communicate technical concepts to non-technical stakeholders?",
      "Describe how you approach mentoring or supporting less experienced engineers.",
      "Tell me about a time you resolved a conflict within your engineering team.",
      "How would you handle being assigned unclear or incomplete project requirements?",
      "Describe a time you gave constructive feedback to a teammate.",
      "Tell me about a project where communication was essential to its success.",
      "How would you respond to a missed deadline caused by external dependencies?",
      "What kind of engineering culture do you do your best work in?",
      "How would you support a junior engineer who is struggling with a task?",
      "Tell me about how you've contributed to improving processes on your team.",
      "Describe a time you worked closely with non-technical stakeholders.",
      "How would you handle a technical disagreement with your manager?",
      "Tell me about a time you learned from a production incident or outage.",
      "Describe a situation where teamwork made a project significantly more successful.",
      "How would you maintain quality under tight deadlines?",
      "Tell me about a time you proactively prevented a problem before it escalated.",
      "Describe a time you worked in an unfamiliar codebase or system — how did you approach it?",
    ],
  },
  general: {
    label: "General / Any Role",
    icon: "general",
    colour: "#f5f2eb",
    borderColour: "#6b6660",
    questions: [
      "Tell me about yourself and what's brought you to this point in your career.",
      "What are you looking for in your next role that you don't have now?",
      "Describe a time you had to work with someone whose style was very different from yours.",
      "Tell me about a piece of feedback that changed how you work.",
      "What does good look like to you in this type of role?",
      "Describe a time you had to manage competing priorities under pressure.",
      "Tell me about something you've taught yourself outside of work.",
      "How do you know when you've done a good job?",
      "What would your last manager say is your biggest development area?",
      "Where do you want to be in three years, and why does this role get you there?",
      "Tell me about a time you faced a major challenge at work — how did you handle it?",
      "What kind of work environment helps you perform at your best?",
      "How would you handle receiving critical feedback from a manager?",
      "What motivates you to do your best work every day?",
      "Tell me about a time you went beyond your job description.",
      "What values do you look for in an employer?",
      "Tell me about a time you made a mistake at work and how you handled it.",
      "How would you deal with a colleague who isn't pulling their weight?",
      "What are you most proud of in your career so far?",
      "Tell me about a time you handled pressure effectively.",
      "How would you adapt to a major change in your organisation?",
      "Tell me about a time you demonstrated leadership without being in a management role.",
      "How would you respond if you strongly disagreed with a company decision?",
      "Describe a time you helped improve team morale during a difficult period.",
      "How would you prioritise your time and tasks in the first 90 days of a new role?",
    ],
  },
  softskills: {
    label: "Mindset & Leadership",
    icon: "star",
    colour: "#f0e8fe",
    borderColour: "#6d28d9",
    questions: [
      "Tell me about a time you received feedback that surprised you — what did you learn?",
      "What's an area of your performance you're actively working to improve, and how?",
      "Describe a situation where you stepped out of your comfort zone at work.",
      "How do you usually react when you make a mistake — walk me through it.",
      "Tell me about a time you sought mentorship or input to develop a new skill.",
      "What have you learned about yourself from your most recent role or project?",
      "Describe a situation where you had to unlearn something to succeed.",
      "Tell me about a time something didn't go as planned — how did you recover?",
      "Describe a setback that initially felt discouraging but led to long-term growth.",
      "How do you stay effective when timelines or goals suddenly change?",
      "Tell me about a time you faced significant pressure — how did you manage it?",
      "What's the hardest piece of feedback you've ever had to accept?",
      "How do you maintain motivation when results don't come quickly?",
      "Tell me about a time you failed at something important — what would you do differently?",
      "Tell me about a time you worked with someone who had a very different working style.",
      "Describe a situation where you helped resolve a disagreement within a team.",
      "Tell me about a time you contributed to a team's success even when you disagreed with the direction.",
      "How do you build trust and rapport with new teammates quickly?",
      "Describe a time you had to give feedback that was difficult for someone to hear.",
      "Tell me about a time your personal values guided a difficult decision at work.",
      "Describe a time you made a decision that aligned with your integrity, even if it wasn't popular.",
      "What does purpose mean to you in the context of your career?",
      "Tell me about a time you motivated others without having formal authority.",
      "Describe a situation where you influenced a decision or change in direction.",
      "Tell me about a time you led by example during a period of uncertainty.",
    ],
  },
  graduate: {
    label: "Graduate & Early Careers",
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
      "Tell me about a time you took initiative without being asked to.",
      "How do you handle feedback — give me an example of a time you acted on it.",
      "What's the biggest challenge you've faced so far, and how did you deal with it?",
      "Tell me about a time you disagreed with someone — how did you handle it?",
      "Describe a situation where things didn't go to plan — what did you do?",
      "What does good teamwork look like to you — give me an example from your experience.",
      "Tell me about a time you had to persuade someone to see your point of view.",
      "How do you stay organised and manage your time when you have a lot on?",
      "Tell me about something you've taught yourself outside of your studies or work.",
      "Why do you want to start your career in this sector or type of role?",
      "What do you know about this organisation and why does it appeal to you?",
      "Where do you want to be in three to five years, and how does this role fit that?",
      "Tell me about a time you showed resilience when something felt really difficult.",
      "Describe a situation where you had to adapt quickly to a change.",
      "What kind of workplace culture do you think you'd thrive in — and why?",
      "Tell me about a time you contributed something meaningful to a group or community.",
      "What's one thing about yourself that doesn't show up on your CV but matters to you?",
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
 
// ── Markdown renderer (lightweight) ──────────────────────────────
// Converts **bold**, bullet points (• - *), and headers into clean JSX
function RenderMarkdown({ text, style = {} }) {
  if (!text) return null;
 
  const lines = text.split("\n");
 
  return (
    <div style={{ fontSize: 15, lineHeight: 1.85, color: t.ink, ...style }}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} style={{ height: 8 }} />;
 
        // Section headers (lines ending with : that are short, or known headers)
        const isHeader =
          trimmed.endsWith(":") && trimmed.length < 60 && !trimmed.startsWith("•") && !trimmed.startsWith("-");
 
        if (isHeader) {
          return (
            <p key={i} style={{
              fontWeight: 700, color: t.accentPop, marginTop: i > 0 ? 18 : 0, marginBottom: 4,
              fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              {trimmed.replace(/\*\*/g, "")}
            </p>
          );
        }
 
        // Bullet lines
        const isBullet = trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ");
        const bulletContent = isBullet
          ? trimmed.replace(/^[•\-\*]\s*/, "")
          : null;
 
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
 
        // Regular paragraph with inline bold
        return (
          <p key={i} style={{ marginBottom: 4 }}>
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
}
 
// Handles **bold** inline within text
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
 
// Animated dots — green for loading questions, orange for processing answers
function ThinkingDots({ colour = t.accentGreen }) {
  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
      <span className="dot1" style={{ width: 8, height: 8, borderRadius: "50%", background: colour, display: "inline-block" }} />
      <span className="dot2" style={{ width: 8, height: 8, borderRadius: "50%", background: colour, display: "inline-block" }} />
      <span className="dot3" style={{ width: 8, height: 8, borderRadius: "50%", background: colour, display: "inline-block" }} />
    </span>
  );
}
 
// ── Scroll to top helper ──────────────────────────────────────────
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
            {Object.entries(QUESTION_BANK).map(([key, cat]) => (
              <span key={cat.label} style={{ display: "flex", alignItems: "center", gap: 6, background: cat.colour, border: `1px solid ${cat.borderColour}30`, borderRadius: 20, padding: "5px 14px", fontSize: 13, color: t.ink }}>
                <Icon name={cat.icon} size={14} colour={cat.borderColour} />
                {cat.label}
              </span>
            ))}
          </div>
          <Btn onClick={onStart} style={{ padding: "15px 40px", fontSize: 16 }}>
            Start your session →
          </Btn>
          <p style={{ color: t.inkLight, fontSize: 12, marginTop: 14, fontStyle: "italic" }}>No signup · No payment · Beta access</p>
        </div>
      </div>
 
      <Divider />
 
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, paddingBottom: 48, textAlign: "center" }}>
        {[
          { n: "6+", label: "Tailored questions per session" },
          { n: "8", label: "Role categories covered" },
          { n: "∞", label: "Sessions during beta" },
        ].map(s => (
          <div key={s.n}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, fontWeight: 900, color: t.accentPop }}>{s.n}</div>
            <div style={{ color: t.inkMid, fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>
 
      <Divider />
 
      {/* Roadmap on landing */}
      <div style={{ paddingBottom: 64 }}>
        <div style={{ marginBottom: 6 }}><Tag colour={t.surfaceAlt} textColour={t.inkMid}>What's coming</Tag></div>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 24, fontWeight: 700, marginBottom: 8, letterSpacing: "-0.01em" }}>
          This is just the beginning.
        </h2>
        <p style={{ color: t.inkMid, fontSize: 15, marginBottom: 24, fontWeight: 300, lineHeight: 1.6 }}>
          The beta is the foundation. Here's where we're taking it — shaped by feedback from people like you.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ROADMAP.map((item, i) => (
            <div key={i} style={{
              background: item.status === "live" ? "#f0f9f0" : t.surface,
              border: `1.5px solid ${item.status === "live" ? t.accentGreen : t.border}`,
              borderRadius: 10, padding: "14px 18px",
              display: "flex", gap: 14, alignItems: "flex-start",
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
  const [selected, setSelected] = useState(null);
  const [jd, setJd] = useState("");
  useScrollToTop("category");
 
  return (
    <div className="fade-up" style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px" }}>
      <div style={{ marginBottom: 8 }}><Tag colour={t.surfaceAlt} textColour={t.inkMid}>Step 1 of 3</Tag></div>
      <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 30, fontWeight: 700, margin: "12px 0 6px" }}>
        What kind of role is this?
      </h2>
      <p style={{ color: t.inkMid, fontSize: 15, marginBottom: 28, fontWeight: 300 }}>
        We'll blend curated questions with ones tailored to the specific job.
      </p>
 
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 32 }}>
        {Object.entries(QUESTION_BANK).map(([key, cat]) => (
          <div key={key} className="hover-lift" onClick={() => setSelected(key)} style={{
            background: selected === key ? cat.colour : t.surface,
            border: `2px solid ${selected === key ? cat.borderColour : t.border}`,
            borderRadius: 10, padding: "16px 18px", transition: "all 0.18s",
            display: "flex", alignItems: "flex-start", gap: 12,
          }}>
            <div style={{ marginTop: 2, flexShrink: 0 }}>
              <Icon name={cat.icon} size={18} colour={selected === key ? cat.borderColour : t.inkMid} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: t.ink, lineHeight: 1.3 }}>{cat.label}</div>
              {selected === key && <div style={{ fontSize: 11, color: cat.borderColour, marginTop: 4, fontStyle: "italic", display: "flex", alignItems: "center", gap: 4 }}>
                <Icon name="check" size={11} colour={cat.borderColour} /> Selected
              </div>}
            </div>
          </div>
        ))}
      </div>
 
      <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: "20px 22px", marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: t.ink, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
          Paste the job description
        </label>
        <p style={{ fontSize: 12, color: t.inkMid, marginBottom: 12, fontStyle: "italic", lineHeight: 1.5 }}>
          Open the job posting, select all the text, copy and paste it here. The more detail you give us, the more specific your questions will be.
        </p>
        <textarea
          value={jd}
          onChange={e => setJd(e.target.value)}
          placeholder="Paste the full job description here…"
          rows={8}
          style={{
            width: "100%", background: t.bg,
            border: `1.5px solid ${jd.length > 50 ? t.ink : t.border}`,
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
 
      <Btn onClick={() => onNext({ category: selected, jd })} disabled={!selected || jd.length < 50}>
        Continue →
      </Btn>
      {!selected && <p style={{ color: t.inkLight, fontSize: 12, marginTop: 10, fontStyle: "italic" }}>Pick a role category above to continue</p>}
      {selected && jd.length < 50 && <p style={{ color: t.inkLight, fontSize: 12, marginTop: 10, fontStyle: "italic" }}>Paste the job description to continue</p>}
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
      <p style={{ color: t.inkMid, fontSize: 15, marginBottom: 28, fontWeight: 300 }}>
        Three quick questions so we can make this personal.
      </p>
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
              width: "100%", background: t.surface, border: `1.5px solid ${f.value.length > 10 ? t.ink : t.border}`,
              borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14, lineHeight: 1.6,
              outline: "none", transition: "border-color 0.2s",
            }}
          />
        </div>
      ))}
      <Btn onClick={() => onNext({ background, why, worry })} disabled={background.length < 10 || why.length < 10}>
        Generate my questions →
      </Btn>
    </div>
  );
}
 
// ── Coaching Session ──────────────────────────────────────────────
function CoachingStep({ category, jd, userInfo, onFinish }) {
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
  const recognitionRef = useRef(null);
  useScrollToTop("coaching");
 
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
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  }
 
  useEffect(() => { buildQuestions(); }, []);
 
  // Scroll to top whenever question changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentQ]);
 
  async function buildQuestions() {
    const bank = QUESTION_BANK[category];
    const shuffled = [...bank.questions].sort(() => Math.random() - 0.5).slice(0, 3);
 
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: `You are a senior interviewer with 15 years experience hiring for ${bank.label} roles. Generate exactly 4 interview questions for this specific role.
 
CRITICAL RULES:
- Read the job description carefully and extract specific requirements, skills, tools, and responsibilities mentioned
- Each question MUST reference something specific from the job description — a named skill, responsibility, tool, or challenge mentioned in the spec
- Do NOT generate generic interview questions — every question must be tailored to THIS role
- Mix behavioural (past experience) and situational (hypothetical scenario) questions
- Make questions feel like they came from a real hiring manager who read the spec, not a template
- Return ONLY a valid JSON array of strings, no markdown, no explanation
 
Job Description:
${jd}
 
Role Category: ${bank.label}
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
 
  async function getFeedback() {
    setPhase("feedback");
    setLoadingFeedback(true);
    setFeedback("");
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
 
Use what you know about them:
- Their background: ${userInfo.background}
- Why they want this role: ${userInfo.why}
- Their worry going in: ${userInfo.worry || "not specified"}
- The role they're applying for: ${category} — ${jd.slice(0, 300)}
 
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
      setFeedback(data.content[0].text);
    } catch {
      setFeedback("What landed well:\nYou engaged with the question directly — that confidence matters.\n\nWhat to sharpen:\nAdd a specific example to make your answer more memorable.\n\nTry saying it like this:\nSet the scene briefly, explain what you did, and land on the result. That structure will stick with any interviewer.");
    }
    setLoadingFeedback(false);
  }
 
  function nextQuestion() {
    const newAnswers = [...answers, { q: questions[currentQ], a: answer, feedback, type: questionTypes[currentQ] }];
    setAnswers(newAnswers);
    setAnswer("");
    setFeedback("");
    if (currentQ + 1 >= questions.length) {
      onFinish(newAnswers);
    } else {
      setCurrentQ(c => c + 1);
      setPhase("answering");
    }
  }
 
  // ── Loading screen ──
  if (phase === "loading") {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 14,
          background: t.surface, border: `1.5px solid ${t.border}`,
          borderRadius: 16, padding: "20px 32px",
        }}>
          <ThinkingDots colour={t.accentGreen} />
          <p style={{ color: t.inkMid, fontStyle: "italic", fontSize: 15, margin: 0 }}>
            Building your personalised question set…
          </p>
        </div>
        <p style={{ color: t.inkLight, fontSize: 12, marginTop: 16, fontStyle: "italic" }}>
          Reading your job description and selecting the best questions
        </p>
      </div>
    );
  }
 
  const progress = questions.length > 0 ? currentQ / questions.length : 0;
  const cat = QUESTION_BANK[category];
 
  return (
    <div className="fade-up" style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px" }}>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Icon name={cat.icon} size={16} colour={t.inkMid} />
          <span style={{ fontSize: 13, color: t.inkMid }}>{cat.label}</span>
        </div>
        <span style={{ fontSize: 13, color: t.inkMid }}>{currentQ + 1} / {questions.length}</span>
      </div>
      <div style={{ height: 3, background: t.border, borderRadius: 2, marginBottom: 32, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress * 100}%`, background: t.accentPop, transition: "width 0.4s ease", borderRadius: 2 }} />
      </div>
 
      {/* Question type badge */}
      <div style={{ marginBottom: 12 }}>
        {questionTypes[currentQ] === "curated"
          ? <Tag colour={cat.colour} textColour={cat.borderColour}>From question bank</Tag>
          : <Tag colour="#fff3f0" textColour={t.accentPop}>From your job description</Tag>
        }
      </div>
 
      {/* Question card */}
      <div style={{
        background: t.surface, border: `1.5px solid ${t.border}`, borderLeft: `4px solid ${t.accentPop}`,
        borderRadius: 10, padding: "22px 24px", marginBottom: 24,
      }}>
        <p style={{ fontSize: 18, fontWeight: 400, lineHeight: 1.55, fontFamily: "'Inter', sans-serif" }}>
          {questions[currentQ]}
        </p>
      </div>
 
      {/* Answer */}
      {phase === "answering" && (
        <>
          {micSupported && (
            <div style={{ marginBottom: 14 }}>
              <button
                onClick={toggleMic}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: isListening ? "#fff0ee" : t.surface,
                  border: `2px solid ${isListening ? t.accentPop : t.border}`,
                  borderRadius: 10, padding: "13px 20px", cursor: "pointer",
                  width: "100%", transition: "all 0.2s", fontFamily: "'Inter', sans-serif",
                }}
              >
                <span style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: isListening ? t.accentPop : t.surfaceAlt,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: isListening ? `0 0 0 6px ${t.accentPop}25` : "none",
                  transition: "all 0.2s",
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
                      <div key={i} style={{
                        width: 3, borderRadius: 2, background: t.accentPop,
                        height: `${12 + i * 6}px`,
                        animation: `pulse 0.8s ${delay}s infinite`,
                      }} />
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
              placeholder={micSupported
                ? "Your spoken answer will appear here — edit freely, or just type directly."
                : "Answer as you would in the room — no wrong answers, only ones we can improve."}
              rows={6}
              style={{
                width: "100%", background: isListening ? "#fffaf9" : t.surface,
                border: `1.5px solid ${isListening ? t.accentPop + "60" : answer.length > 20 ? t.ink : t.border}`,
                borderRadius: 8, padding: "14px 16px", color: t.ink, fontSize: 15, lineHeight: 1.6,
                outline: "none", transition: "all 0.2s", marginBottom: 16,
              }}
            />
            {answer.length > 0 && (
              <button onClick={() => setAnswer("")} style={{
                position: "absolute", top: 10, right: 10, background: t.surfaceAlt,
                border: "none", borderRadius: 4, padding: "3px 8px", fontSize: 11,
                color: t.inkMid, cursor: "pointer", fontFamily: "sans-serif",
              }}>clear</button>
            )}
          </div>
 
          <div style={{ display: "flex", gap: 12 }}>
            <Btn onClick={getFeedback} disabled={answer.length < 20}>
              Get coaching →
            </Btn>
            <Btn variant="outline" onClick={nextQuestion}>
              Skip question
            </Btn>
          </div>
        </>
      )}
 
      {/* Feedback */}
      {phase === "feedback" && (
        <div className="fade-in">
          <div style={{
            background: "#fffdf7", border: `1.5px solid ${t.border}`, borderRadius: 10,
            padding: "20px 22px", marginBottom: 12, minHeight: 100,
          }}>
            {loadingFeedback ? (
              <div style={{ textAlign: "center", padding: "24px 0" }}>
                <ThinkingDots colour={t.accentPop} />
                <p style={{ color: t.inkMid, marginTop: 12, fontStyle: "italic", fontSize: 13 }}>
                  Reviewing your answer…
                </p>
              </div>
            ) : (
              <RenderMarkdown text={feedback} />
            )}
          </div>
 
          {/* Disclaimer on the "Try saying it like this" suggestion */}
          {!loadingFeedback && (
            <div style={{
              background: t.surfaceAlt, borderRadius: 8, padding: "10px 14px",
              marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 8,
            }}>
              <Icon name="sparkle" size={14} colour={t.inkLight} />
              <p style={{ fontSize: 12, color: t.inkLight, lineHeight: 1.5, fontStyle: "italic" }}>
                The suggested answer above is an example only — use it as inspiration and always replace with your own real experiences and facts.
              </p>
            </div>
          )}
 
          {!loadingFeedback && (
            <Btn onClick={nextQuestion}>
              {currentQ + 1 >= questions.length ? "See my summary →" : "Next question →"}
            </Btn>
          )}
        </div>
      )}
    </div>
  );
}
 
// ── Summary + Feedback + Roadmap ──────────────────────────────────
function SummaryStep({ answers, userInfo, category }) {
  const [cheatSheet, setCheatSheet] = useState("");
  const [loadingSheet, setLoadingSheet] = useState(true);
  const [feedbackText, setFeedbackText] = useState({});
  const [feedbackSent, setFeedbackSent] = useState(false);
  const cat = QUESTION_BANK[category];
  useScrollToTop("summary");
 
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
            content: `Create a short, practical interview cheat sheet for this candidate. Warm, direct, confidence-building tone. Under 220 words.
 
Use exactly these 3 sections with these plain text headers followed by a colon. Do not use asterisks, dashes, or any markdown formatting in the headers themselves:
 
Your strongest moments:
(2-3 bullet points — use the • character only, not dashes or asterisks)
 
Watch out for:
(2 bullet points max — use the • character only)
 
Walk in with this:
(one punchy sentence — the mindset to carry into the room)
 
IMPORTANT: Use ONLY the • character for bullets. Do not use **, *, or - anywhere in your response. Write headers as plain text followed by a colon on its own line.
 
Candidate background: ${userInfo.background}
Why they want this role: ${userInfo.why}
Their biggest worry: ${userInfo.worry || "not specified"}
Role category: ${cat.label}
Session answers: ${answers.filter(a => a.a).map((a, i) => `Q${i + 1}: ${a.q}\nA: ${a.a}`).join("\n\n")}`,
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
 
      {/* Session complete header */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <Icon name="target" size={40} colour={t.accentGreen} />
        </div>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          Session complete.
        </h2>
        <p style={{ color: t.inkMid, fontStyle: "italic" }}>
          You answered {answers.filter(a => a.a).length} of {answers.length} questions.
        </p>
      </div>
 
      {/* Cheat sheet */}
      <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
        {loadingSheet ? (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <ThinkingDots colour={t.accentGreen} />
            <p style={{ marginTop: 12, color: t.inkLight, fontStyle: "italic", fontSize: 13 }}>
              Building your cheat sheet…
            </p>
          </div>
        ) : (
          <RenderMarkdown text={cheatSheet} />
        )}
      </div>
 
      {/* Beta note */}
      <div style={{ background: "#fff8f6", border: `1px solid ${t.accentPop}25`, borderRadius: 10, padding: "14px 18px", marginBottom: 40 }}>
        <p style={{ fontSize: 13, color: t.inkMid, lineHeight: 1.6 }}>
          <strong style={{ color: t.accentPop }}>Beta note:</strong> You're one of the first people to use this tool. Session history, progress tracking, and voice mode are all coming — see the full roadmap on the <a href="/" style={{ color: t.accentPop }}>homepage</a>.
        </p>
      </div>
 
      <Divider />
 
      {/* Feedback section — fair exchange */}
      {!feedbackSent ? (
        <div className="fade-in">
          <div style={{ marginBottom: 6 }}><Tag colour={t.surfaceAlt} textColour={t.inkMid}>Before you go</Tag></div>
          <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 8 }}>
            Three quick questions.
          </h3>
          <p style={{ color: t.inkMid, fontSize: 15, marginBottom: 28, lineHeight: 1.6, fontWeight: 300 }}>
            This tool is free during beta. In return, we'd love 3 minutes of honest feedback — it directly shapes what gets built next.
          </p>
 
          {/* Q1 */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: t.ink, marginBottom: 6 }}>
              1. What was the hardest question in today's session?
            </label>
            <textarea
              rows={3}
              onChange={e => setFeedbackText(prev => ({ ...prev, q1: e.target.value }))}
              placeholder="The question that made you think hardest…"
              style={{
                width: "100%", background: t.surface, border: `1.5px solid ${t.border}`,
                borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14, lineHeight: 1.6, outline: "none",
              }}
            />
          </div>
 
          {/* Q2 */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: t.ink, marginBottom: 6 }}>
              2. Did the coaching feel relevant to your actual role?
            </label>
            <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              {["Yes, very", "Mostly", "Not really"].map(opt => (
                <button key={opt}
                  onClick={() => setFeedbackText(prev => ({ ...prev, q2: opt }))}
                  style={{
                    padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500, cursor: "pointer",
                    fontFamily: "'Inter', sans-serif", transition: "all 0.15s",
                    background: feedbackText.q2 === opt ? t.accentGreen : t.surface,
                    color: feedbackText.q2 === opt ? "#fff" : t.ink,
                    border: `1.5px solid ${feedbackText.q2 === opt ? t.accentGreen : t.border}`,
                  }}
                >{opt}</button>
              ))}
            </div>
            <textarea
              rows={2}
              onChange={e => setFeedbackText(prev => ({ ...prev, q2detail: e.target.value }))}
              placeholder="Any detail helps — even one sentence…"
              style={{
                width: "100%", background: t.surface, border: `1.5px solid ${t.border}`,
                borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14, lineHeight: 1.6, outline: "none",
              }}
            />
          </div>
 
          {/* Q3 */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: t.ink, marginBottom: 6 }}>
              3. Anything you wished we'd asked you?
            </label>
            <textarea
              rows={2}
              onChange={e => setFeedbackText(prev => ({ ...prev, q3: e.target.value }))}
              placeholder="A question you were expecting but didn't get…"
              style={{
                width: "100%", background: t.surface, border: `1.5px solid ${t.border}`,
                borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14, lineHeight: 1.6, outline: "none",
              }}
            />
          </div>
 
          {/* Q4 — feature validation checkboxes */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: t.ink, marginBottom: 6 }}>
              4. Which of these would make you come back to this tool?
            </label>
            <p style={{ fontSize: 12, color: t.inkLight, marginBottom: 12, fontStyle: "italic" }}>Select all that apply</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {FEATURES.map((feat, i) => {
                const selected = (feedbackText.q4 || []).includes(feat);
                return (
                  <div key={i}
                    onClick={() => setFeedbackText(prev => {
                      const current = prev.q4 || [];
                      return { ...prev, q4: selected ? current.filter(f => f !== feat) : [...current, feat] };
                    })}
                    style={{
                      display: "flex", alignItems: "center", gap: 12, padding: "10px 14px",
                      background: selected ? t.tag : t.surface,
                      border: `1.5px solid ${selected ? t.accentGreen : t.border}`,
                      borderRadius: 8, cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      background: selected ? t.accentGreen : "#fff",
                      border: `1.5px solid ${selected ? t.accentGreen : t.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {selected && <Icon name="check" size={11} colour="#fff" />}
                    </div>
                    <span style={{ fontSize: 14, color: t.ink, lineHeight: 1.4 }}>{feat}</span>
                  </div>
                );
              })}
            </div>
          </div>
 
          <Btn onClick={() => setFeedbackSent(true)} variant="pop">
            Send feedback →
          </Btn>
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
  const [jd, setJd] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [sessionAnswers, setSessionAnswers] = useState([]);
 
  function reset() { setStep(0); setCategory(null); setJd(""); setUserInfo(null); setSessionAnswers([]); }
 
  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: "#ffffff" }}>
        {/* Header */}
        <header style={{
          borderBottom: "1px solid rgba(0,0,0,0.08)", background: "#ffffff",
          padding: "0 24px", position: "sticky", top: 0, zIndex: 10,
        }}>
          <div style={{ maxWidth: 720, margin: "0 auto", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 15, letterSpacing: "-0.01em", color: "#3F6F63" }}>
                AI Evolving You
              </span>
              <BetaBadge />
            </div>
            {step > 0 && (
              <button onClick={reset} style={{ background: "none", border: "none", color: "#555555", cursor: "pointer", fontSize: 13, fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>
                ← Start over
              </button>
            )}
          </div>
        </header>
 
        {/* Main */}
        <main style={{ maxWidth: 720, margin: "0 auto", paddingTop: 40 }}>
          {step === 0 && <Landing onStart={() => setStep(1)} />}
          {step === 1 && <CategoryStep onNext={({ category: c, jd: j }) => { setCategory(c); setJd(j); setStep(2); }} />}
          {step === 2 && <AboutStep onNext={info => { setUserInfo(info); setStep(3); }} />}
          {step === 3 && <CoachingStep category={category} jd={jd} userInfo={userInfo} onFinish={ans => { setSessionAnswers(ans); setStep(4); }} />}
          {step === 4 && <SummaryStep answers={sessionAnswers} userInfo={userInfo} category={category} />}
        </main>
      </div>
    </>
  );
}