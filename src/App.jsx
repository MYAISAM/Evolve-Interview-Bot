import { useState, useEffect, useRef } from "react";

const API = "https://api.anthropic.com/v1/messages";

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
  .fade-up { animation: fadeUp 0.55s cubic-bezier(.22,1,.36,1) forwards; }
  .fade-in { animation: fadeIn 0.4s ease forwards; }
  .dot1{animation:pulse 1.5s infinite;} .dot2{animation:pulse 1.5s .25s infinite;} .dot3{animation:pulse 1.5s .5s infinite;}
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

// ── Question Bank ─────────────────────────────────────────────────
const QUESTION_BANK = {
  sales: {
    label: "Sales & Business Development",
    icon: "📈",
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
    ],
  },
  cs: {
    label: "Customer Success",
    icon: "🤝",
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
    ],
  },
  recruitment: {
    label: "Recruitment & Talent",
    icon: "🎯",
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
    ],
  },
  product: {
    label: "Product Management",
    icon: "🧩",
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
    ],
  },
  engineering: {
    label: "Engineering (Behavioural)",
    icon: "⚙️",
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
    ],
  },
  general: {
    label: "General / Any Role",
    icon: "✦",
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
    ],
  },
};

const ROADMAP = [
  { version: "Beta (Now)", title: "AI Interview Coach", description: "Job description analysis, curated question banks, written coaching feedback, personalised cheat sheet.", status: "live", icon: "✓" },
  { version: "V2", title: "Voice Interview Mode", description: "Speak your answers out loud. AI coaches on delivery, filler words, pace, and confidence — not just content.", status: "soon", icon: "🎙" },
  { version: "V3", title: "Industry Deep Dives", description: "Specialist question banks for medical, legal, finance, and tech roles. Backed by real hiring data.", status: "coming", icon: "📚" },
  { version: "V4", title: "Full Interview Simulation", description: "Back-to-back questions in real time. Panel interview mode. Timed responses. The full experience.", status: "coming", icon: "🎬" },
];

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

function ThinkingDots() {
  return (
    <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
      <span className="dot1" style={{ width: 6, height: 6, borderRadius: "50%", background: t.inkMid, display: "inline-block" }} />
      <span className="dot2" style={{ width: 6, height: 6, borderRadius: "50%", background: t.inkMid, display: "inline-block" }} />
      <span className="dot3" style={{ width: 6, height: 6, borderRadius: "50%", background: t.inkMid, display: "inline-block" }} />
    </span>
  );
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
        {/* Hero grid */}
        <div ref={gridRef} className="grid-bg" aria-hidden="true" />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 28 }}>
            <BetaBadge />
            <span style={{ color: t.inkLight, fontSize: 13, fontStyle: "italic" }}>Free for Aleto Foundation members</span>
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
            {Object.values(QUESTION_BANK).map(cat => (
              <span key={cat.label} style={{ background: cat.colour, border: `1px solid ${cat.borderColour}30`, borderRadius: 20, padding: "5px 14px", fontSize: 13, color: t.ink }}>
                {cat.icon} {cat.label}
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, paddingBottom: 56, textAlign: "center" }}>
        {[
          { n: "6+", label: "Tailored questions per session" },
          { n: "6", label: "Role categories covered" },
          { n: "∞", label: "Sessions during beta" },
        ].map(s => (
          <div key={s.n}>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 36, fontWeight: 900, color: t.accentPop }}>{s.n}</div>
            <div style={{ color: t.inkMid, fontSize: 13, marginTop: 4, lineHeight: 1.4 }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Category Picker ───────────────────────────────────────────────
function CategoryStep({ onNext }) {
  const [selected, setSelected] = useState(null);
  const [jd, setJd] = useState("");

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
          }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{cat.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: t.ink, lineHeight: 1.3 }}>{cat.label}</div>
            {selected === key && <div style={{ fontSize: 11, color: cat.borderColour, marginTop: 4, fontStyle: "italic" }}>Selected ✓</div>}
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

  async function buildQuestions() {
    const bank = QUESTION_BANK[category];
    // Pick 3 curated questions from the bank
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
      setFeedback("**What landed well:** You engaged with the question directly — that confidence matters.\n**What to sharpen:** Add a specific example to make your answer more memorable.\n**Try this instead:** Use the STAR format: briefly set the scene, explain your role, describe the action you took, and land on the result.");
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

  if (phase === "loading") {
    return (
      <div style={{ textAlign: "center", padding: "80px 24px" }}>
        <ThinkingDots />
        <p style={{ color: t.inkMid, marginTop: 16, fontStyle: "italic" }}>Building your personalised question set…</p>
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
          <span style={{ fontSize: 16 }}>{cat.icon}</span>
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
          {/* Mic button */}
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
                {/* Animated mic icon */}
                <span style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: isListening ? t.accentPop : t.surfaceAlt,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, flexShrink: 0,
                  boxShadow: isListening ? `0 0 0 6px ${t.accentPop}25` : "none",
                  transition: "all 0.2s",
                }}>🎙</span>
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
                <p style={{ fontSize: 12, color: t.accentPop, marginTop: 6, fontStyle: "italic" }}>
                  ⚠️ {micError}
                </p>
              )}
            </div>
          )}

          {/* Text area — always visible, mic fills it */}
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
            padding: "20px 22px", marginBottom: 20, minHeight: 100,
          }}>
            {loadingFeedback
              ? <div style={{ textAlign: "center", padding: "20px 0" }}><ThinkingDots /></div>
              : <div style={{ fontSize: 14, lineHeight: 1.8, color: t.ink }}>
                  {feedback.split('\n').map((line, i) => {
                    const isHeader = line.startsWith("What landed well:") || line.startsWith("What to sharpen:") || line.startsWith("Try saying it like this:");
                    return isHeader
                      ? <p key={i} style={{ fontWeight: 700, color: t.accentPop, marginTop: i > 0 ? 16 : 0, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.04em" }}>{line}</p>
                      : line.trim() ? <p key={i} style={{ margin: "0 0 4px" }}>{line}</p> : null;
                  })}
                </div>
            }
          </div>
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
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [tab, setTab] = useState("summary");
  const cat = QUESTION_BANK[category];

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

Use exactly these 3 sections:
**Your strongest moments:** (2-3 bullet points)
**Watch out for:** (2 bullet points max)
**Walk in with this:** (one punchy sentence — the mindset to carry into the room)

Candidate: ${userInfo.background}
Role category: ${cat.label}
Session answers: ${answers.filter(a => a.a).map((a, i) => `Q${i + 1}: ${a.q}\nA: ${a.a}`).join("\n\n")}`,
          }],
        }),
      });
      const data = await res.json();
      setCheatSheet(data.content[0].text);
    } catch {
      setCheatSheet("**Your strongest moments:**\n• You showed up and practised — that already puts you ahead of most candidates\n• Your answers show real experience and self-awareness\n\n**Watch out for:**\n• Keep answers to 60–90 seconds — less is more\n• Back every claim with a specific example\n\n**Walk in with this:** You've done the work. Back yourself.");
    }
    setLoadingSheet(false);
  }

  const tabs = [
    { key: "summary", label: "Your Summary" },
    { key: "roadmap", label: "What's Coming" },
    { key: "feedback", label: "Leave Feedback" },
  ];

  return (
    <div className="fade-up" style={{ maxWidth: 660, margin: "0 auto", padding: "0 24px 60px" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🎯</div>
        <h2 style={{ fontFamily: "'Inter', sans-serif", fontSize: 32, fontWeight: 700, marginBottom: 8 }}>
          Session complete.
        </h2>
        <p style={{ color: t.inkMid, fontStyle: "italic" }}>You answered {answers.filter(a => a.a).length} of {answers.length} questions.</p>
      </div>

      {/* Tab nav */}
      <div style={{ display: "flex", borderBottom: `2px solid ${t.border}`, marginBottom: 28, gap: 0 }}>
        {tabs.map(tb => (
          <button key={tb.key} onClick={() => setTab(tb.key)} style={{
            background: "none", border: "none", padding: "10px 20px", fontSize: 14, fontWeight: 600,
            cursor: "pointer", color: tab === tb.key ? t.accentPop : t.inkMid,
            borderBottom: `2px solid ${tab === tb.key ? t.accentPop : "transparent"}`,
            marginBottom: -2, fontFamily: "'Inter', sans-serif", transition: "color 0.2s",
          }}>{tb.label}</button>
        ))}
      </div>

      {/* Summary tab */}
      {tab === "summary" && (
        <div className="fade-in">
          <div style={{ background: t.surface, border: `1.5px solid ${t.border}`, borderRadius: 12, padding: 24, marginBottom: 20 }}>
            {loadingSheet
              ? <div style={{ textAlign: "center", padding: "30px 0" }}><ThinkingDots /><p style={{ marginTop: 12, color: t.inkLight, fontStyle: "italic", fontSize: 13 }}>Building your cheat sheet…</p></div>
              : <div style={{ fontSize: 15, lineHeight: 1.85, whiteSpace: "pre-wrap" }}>{cheatSheet}</div>
            }
          </div>
          <div style={{ background: "#fff8f6", border: `1px solid ${t.accentPop}25`, borderRadius: 10, padding: "16px 20px" }}>
            <p style={{ fontSize: 13, color: t.inkMid, lineHeight: 1.6 }}>
              <strong style={{ color: t.accentPop }}>Beta note:</strong> You're one of the first people to use this. Voice interview mode and deeper role coaching are coming soon — see the <button onClick={() => setTab("roadmap")} style={{ background: "none", border: "none", color: t.accentPop, cursor: "pointer", textDecoration: "underline", fontSize: 13, fontFamily: "inherit" }}>roadmap</button>.
            </p>
          </div>
        </div>
      )}

      {/* Roadmap tab */}
      {tab === "roadmap" && (
        <div className="fade-in">
          <p style={{ color: t.inkMid, fontSize: 15, marginBottom: 24, fontStyle: "italic" }}>
            Here's where we're taking this. Your feedback shapes what gets built next.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {ROADMAP.map((item, i) => (
              <div key={i} style={{
                background: item.status === "live" ? "#f0f9f0" : t.surface,
                border: `1.5px solid ${item.status === "live" ? t.accentGreen : t.border}`,
                borderRadius: 10, padding: "18px 20px",
                display: "flex", gap: 16, alignItems: "flex-start",
              }}>
                <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{item.title}</span>
                    <Tag
                      colour={item.status === "live" ? t.tag : item.status === "soon" ? "#fff3cd" : t.surfaceAlt}
                      textColour={item.status === "live" ? t.accentGreen : item.status === "soon" ? "#856404" : t.inkMid}
                    >
                      {item.status === "live" ? "Live now" : item.status === "soon" ? "Coming soon" : "On the roadmap"}
                    </Tag>
                  </div>
                  <p style={{ color: t.inkMid, fontSize: 13, lineHeight: 1.5 }}>{item.description}</p>
                  <p style={{ color: t.inkLight, fontSize: 11, marginTop: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{item.version}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, padding: "16px 20px", background: t.surfaceAlt, borderRadius: 10 }}>
            <p style={{ fontSize: 13, color: t.inkMid, lineHeight: 1.6 }}>
              🙏 <strong>You're shaping this.</strong> As an Aleto beta tester, your feedback directly influences what we build. Head to the Feedback tab and tell us what you think.
            </p>
          </div>
        </div>
      )}

      {/* Feedback tab */}
      {tab === "feedback" && (
        <div className="fade-in">
          {feedbackSent ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🙏</div>
              <h3 style={{ fontFamily: "'Inter', sans-serif", fontSize: 22, marginBottom: 8 }}>Thank you — genuinely.</h3>
              <p style={{ color: t.inkMid, fontSize: 15, fontStyle: "italic" }}>This feedback goes straight into making the product better.</p>
            </div>
          ) : (
            <>
              <p style={{ color: t.inkMid, fontSize: 15, marginBottom: 24, fontStyle: "italic" }}>
                This is a beta. Your honest feedback — good or bad — is exactly what we need.
              </p>
              {[
                "What worked well in the session?",
                "What felt off or could be better?",
                "What would make you use this before a real interview?",
              ].map((q, i) => (
                <div key={i} style={{ marginBottom: 20 }}>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: t.ink }}>{q}</label>
                  <textarea
                    rows={3}
                    onChange={e => setFeedbackText(prev => prev + `\n${q}\n${e.target.value}`)}
                    style={{
                      width: "100%", background: t.surface, border: `1.5px solid ${t.border}`,
                      borderRadius: 8, padding: "12px 14px", color: t.ink, fontSize: 14, lineHeight: 1.6,
                      outline: "none",
                    }}
                  />
                </div>
              ))}
              <Btn onClick={() => setFeedbackSent(true)} variant="pop">
                Send feedback →
              </Btn>
            </>
          )}
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
