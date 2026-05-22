/* global React, ReactDOM, BODYSCAN_DATA */
// V3 (friendlier) — Mint Fresh, made warmer and easier to use.
// Adds: SVG icons, metric tooltips, highlights, quick actions,
// plain-language insights, compare presets, goal ETAs, coach today panel,
// help/glossary modal.

const { useState, useMemo } = React;
const D = window.BODYSCAN_DATA;
const cx = (...a) => a.filter(Boolean).join(" ");

// ---- Plain-language glossary for every metric ----
const GLOSSARY = {
  weightKg:    { what: "Your total body weight including everything — muscle, fat, water, bone. Most useful when compared with the other metrics, not on its own.", range: "Healthy adult range varies; we focus on YOUR trend." },
  bodyFatPct:  { what: "The share of your weight that's fat tissue. Some fat is essential; we look at whether yours is in a healthy range AND moving the right way.", range: "Women 21–33% · Men 8–22% (varies by age)" },
  muscleMassKg:{ what: "How much skeletal muscle you carry. More muscle means a higher metabolism, better strength, easier ageing.", range: "Higher is generally better — track the trend." },
  visceralFat: { what: "Fat stored deep around your organs. Different from the fat under your skin — this one matters most for long-term health.", range: "1–9 is healthy · 10–14 keep an eye on it · 15+ talk to a doctor" },
  waterPct:    { what: "How much of your body is water. Affects energy, recovery, and how accurate the other numbers are. Dropping suddenly often means dehydration, not real change.", range: "Women 45–60% · Men 50–65%" },
  metabolicAge: { what: "An estimate of how your body's burning energy compared to others your age. Lower than your real age = good news.", range: "Lower than your real age is the goal." },
};

// ---- Inline SVG icons (lucide-ish line style) ----
const Icon = ({ name, size = 18, stroke = 1.8 }) => {
  const paths = {
    home:     <><path d="M3 11l9-8 9 8"/><path d="M5 9.5V21h14V9.5"/></>,
    trend:    <><path d="M3 17l5-5 4 4 7-8"/><path d="M14 8h5v5"/></>,
    compare:  <><path d="M8 3v18"/><path d="M16 3v18"/><path d="M5 7l3-4 3 4"/><path d="M13 17l3 4 3-4"/></>,
    target:   <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></>,
    users:    <><circle cx="9" cy="8" r="3.5"/><path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M15 20c0-2.5 1.8-4.5 4-5"/></>,
    plus:     <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    mail:     <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>,
    help:     <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-1.5 2-2.5 3v1"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></>,
    download: <><path d="M12 4v11"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 3v4"/><path d="M16 3v4"/></>,
    message:  <><path d="M21 12a8 8 0 11-3.5-6.6L21 4l-1 4.5A8 8 0 0121 12z"/></>,
    file:     <><path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z"/><path d="M14 3v6h6"/></>,
    book:     <><path d="M4 4h7a3 3 0 013 3v13"/><path d="M20 4h-7a3 3 0 00-3 3v13"/><path d="M4 4v15a1 1 0 001 1h6"/><path d="M20 4v15a1 1 0 01-1 1h-6"/></>,
    arrow:    <><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></>,
    check:    <><path d="M5 12l5 5 9-11"/></>,
    sparkle:  <><path d="M12 3v6"/><path d="M12 15v6"/><path d="M3 12h6"/><path d="M15 12h6"/><path d="M6.5 6.5l3 3"/><path d="M14.5 14.5l3 3"/><path d="M17.5 6.5l-3 3"/><path d="M9.5 14.5l-3 3"/></>,
    chevron:  <><path d="M9 6l6 6-6 6"/></>,
    search:   <><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-3.5-3.5"/></>,
    bell:     <><path d="M6 8a6 6 0 1112 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 19a2 2 0 004 0"/></>,
  };
  return (
    <svg className="mf-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>
  );
};

// ---- shared ----
function Avatar({ initials, size = 36, accent }) {
  return (
    <div className="mf-avatar" style={{ width: size, height: size, fontSize: size * 0.4, background: accent || "#D8EFE4", color: "#1F4D3A" }}>
      {initials}
    </div>
  );
}

function HelpDot({ children }) {
  return (
    <span className="mf-help-dot" tabIndex={0}>?
      <span className="mf-tip">{children}</span>
    </span>
  );
}

function Ring({ value, max, size = 72, stroke = 8, color = "#3FA77F", track = "#E4F0EA" }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = size/2 - stroke;
  const c = 2 * Math.PI * r;
  return (
    <div className="mf-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={`${pct*c} ${c}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div className="mf-ring-center">
        <span className="mf-mono">{Math.round(pct*100)}<small>%</small></span>
      </div>
    </div>
  );
}

function Spark({ values, w = 200, h = 48, stroke = "#3FA77F" }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const pad = 3;
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (values.length - 1);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <path d={d} stroke={stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={i === pts.length-1 ? 3 : 1.5} fill={stroke} />)}
    </svg>
  );
}

function BigLine({ values, dates, w = 760, h = 300, goal = null, unit = "" }) {
  const pad = { t: 24, r: 24, b: 44, l: 56 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const ymin = Math.min(...values, goal ?? Infinity) - 0.8;
  const ymax = Math.max(...values, goal ?? -Infinity) + 0.8;
  const span = ymax - ymin || 1;
  const xs = values.map((_, i) => pad.l + (i * innerW) / (values.length - 1));
  const ys = values.map((v) => pad.t + innerH - ((v - ymin) / span) * innerH);
  const d = xs.map((x, i) => (i === 0 ? "M" : "L") + x + "," + ys[i]).join(" ");
  // area
  const dFill = d + ` L ${xs[xs.length-1]},${pad.t+innerH} L ${xs[0]},${pad.t+innerH} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="mf-bigline">
      <defs>
        <linearGradient id="mf-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3FA77F" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#3FA77F" stopOpacity="0" />
        </linearGradient>
      </defs>
      {Array.from({ length: 5 }, (_, i) => {
        const y = pad.t + (i * innerH) / 4;
        const v = ymax - (i * span) / 4;
        return <g key={i}>
          <line x1={pad.l} x2={w-pad.r} y1={y} y2={y} stroke="#E4EEEA" />
          <text x={pad.l - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#7A9B8E" fontFamily="JetBrains Mono">{v.toFixed(1)}</text>
        </g>;
      })}
      {goal != null && (
        <g>
          <line x1={pad.l} x2={w-pad.r}
            y1={pad.t + innerH - ((goal - ymin) / span) * innerH}
            y2={pad.t + innerH - ((goal - ymin) / span) * innerH}
            stroke="#E5944A" strokeDasharray="4 4" />
          <text x={w-pad.r} y={pad.t + innerH - ((goal - ymin) / span) * innerH - 6}
            textAnchor="end" fontSize="11" fill="#E5944A" fontFamily="JetBrains Mono">goal · {goal}{unit}</text>
        </g>
      )}
      <path d={dFill} fill="url(#mf-area)" />
      <path d={d} stroke="#3FA77F" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={ys[i]} r="4.5" fill="#FBFCFA" stroke="#3FA77F" strokeWidth="2" />
          <text x={x} y={h - 14} textAnchor="middle" fontSize="11" fill="#7A9B8E" fontFamily="JetBrains Mono">{D.fmtDate(dates[i])}</text>
        </g>
      ))}
    </svg>
  );
}

// ---- Glossary modal ----
function GlossaryModal({ onClose }) {
  return (
    <div className="mf-modal-bg" onClick={onClose}>
      <div className="mf-modal" onClick={e => e.stopPropagation()}>
        <div className="mf-modal-head">
          <h2>What do these numbers actually mean?</h2>
          <button className="mf-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="mf-modal-body">
          <p className="mf-sub" style={{ marginTop: 0 }}>Quick, no-jargon explanations of every metric we track. Your coach can give you more context any time.</p>
          {D.metrics.map(m => (
            <div key={m.key} className="mf-gloss-item">
              <div className="mf-gloss-name">
                {m.label}
                <span className="mf-mono">{m.unit || "—"}</span>
              </div>
              <p className="mf-gloss-what">{GLOSSARY[m.key].what}</p>
              <div className="mf-gloss-range">{GLOSSARY[m.key].range}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---- Login ----
function Login({ onLogin }) {
  const [mode, setMode] = useState(null);
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");

  function pick(role) {
    setMode(role);
    setEmail(role === "client" ? "emma@hey.com" : "marcus@studio.fit");
    setPwd("••••••••");
  }

  return (
    <div className="mf-login">
      <aside className="mf-login-aside">
        <div className="mf-logo">
          <span className="mf-logo-mark" />
          <span>kelp</span>
        </div>
        <div className="mf-login-pitch">
          <h1 className="mf-h1">Your body, in numbers you can actually read.</h1>
          <p className="mf-lede">Every scan, every milestone, everything your coach left in the margins — all in one calm dashboard. No jargon, no guessing.</p>
          <ul className="mf-pitch-list">
            <li><span className="mf-tick">✓</span> Plain-language explanations for every metric</li>
            <li><span className="mf-tick">✓</span> Compare any two scans side-by-side</li>
            <li><span className="mf-tick">✓</span> Your coach's notes appear the moment they save</li>
          </ul>
        </div>
        <div className="mf-login-stats">
          <div><b className="mf-mono">2,840</b><small>scans logged this month</small></div>
          <div><b className="mf-mono">96%</b><small>hit their first milestone</small></div>
        </div>
      </aside>

      <main className="mf-login-main">
        <div className="mf-login-card">
          {!mode ? (
            <>
              <h2 className="mf-h2">Welcome back</h2>
              <p className="mf-sub">Tap your face to jump in. (Demo accounts — passwords aren't checked.)</p>
              <div className="mf-persona-row">
                <button className="mf-persona" onClick={()=>pick("client")}>
                  <Avatar initials="EL" size={48} />
                  <div>
                    <div className="mf-persona-name">Emma · I'm a client</div>
                    <div className="mf-persona-role">5 scans · 3 coaches on my team</div>
                  </div>
                  <span className="mf-kbd"><Icon name="arrow" size={14} /></span>
                </button>
                <button className="mf-persona" onClick={()=>pick("coach")}>
                  <Avatar initials="MB" size={48} accent="#F0E1D2" />
                  <div>
                    <div className="mf-persona-name">Marcus · I'm a coach</div>
                    <div className="mf-persona-role">Head coach · 6 active clients</div>
                  </div>
                  <span className="mf-kbd"><Icon name="arrow" size={14} /></span>
                </button>
              </div>
              <div className="mf-login-foot"><span className="mf-divider"><span>or sign in with email</span></span></div>
              <label className="mf-field"><span>Email</span><input type="email" placeholder="you@studio.fit" /></label>
              <label className="mf-field"><span>Password</span><input type="password" placeholder="••••••••" /></label>
              <button className="mf-btn mf-btn-primary" onClick={()=>onLogin("client")}>Sign in</button>
              <a href="#" className="mf-sub" onClick={(e)=>e.preventDefault()} style={{ alignSelf: "center", textDecoration: "underline" }}>Forgot your password?</a>
            </>
          ) : (
            <form onSubmit={(e)=>{ e.preventDefault(); onLogin(mode); }}>
              <button type="button" className="mf-back" onClick={()=>setMode(null)}>← Pick a different account</button>
              <h2 className="mf-h2">{mode === "client" ? "Hey Emma 👋" : "Hey Marcus 👋"}</h2>
              <p className="mf-sub">Just confirm and we'll take you in.</p>
              <label className="mf-field"><span>Email</span><input value={email} onChange={(e)=>setEmail(e.target.value)} autoFocus /></label>
              <label className="mf-field"><span>Password</span><input type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} /></label>
              <label className="mf-check"><input type="checkbox" defaultChecked /> Remember me on this device</label>
              <button className="mf-btn mf-btn-primary" type="submit">Take me in →</button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

// ---- Shell ----
function Shell({ role, sections, active, setActive, onLogout, onHelp, children }) {
  const initials = role === "client" ? D.client.avatar : "MB";
  const name = role === "client" ? D.client.name : "Marcus Bell";
  const subtitle = role === "client" ? "Client" : "Head coach · 6 clients";
  return (
    <div className="mf-shell">
      <aside className="mf-side">
        <div className="mf-side-logo">
          <span className="mf-logo-mark" /><span>kelp</span>
        </div>
        <nav className="mf-side-nav">
          {sections.map(s => (
            <button key={s.id} className={cx("mf-side-link", active===s.id && "is-on")} onClick={()=>setActive(s.id)}>
              <span className="mf-side-icon"><Icon name={s.icon} /></span>
              <span>{s.label}</span>
              {s.badge && <span className="mf-side-badge">{s.badge}</span>}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button className="mf-side-link" onClick={onHelp}>
            <span className="mf-side-icon"><Icon name="help" /></span>
            <span>What do these mean?</span>
          </button>
        </nav>
        <div className="mf-side-user">
          <Avatar initials={initials} size={36} accent={role === "client" ? "#D8EFE4" : "#F0E1D2"} />
          <div className="mf-side-user-meta">
            <div className="mf-side-user-name">{name}</div>
            <div className="mf-side-user-role">{subtitle}</div>
          </div>
          <button className="mf-icon-btn" onClick={onLogout} title="Sign out">⏻</button>
        </div>
      </aside>

      {/* Mobile top bar — only visible <880px */}
      <header className="mf-mobile-top">
        <div className="mf-mobile-top-user">
          <span className="mf-logo-mark" />
          <div>
            <div className="mf-mobile-top-name">{name.split(" ")[0]}</div>
            <div className="mf-mobile-top-role">{subtitle}</div>
          </div>
        </div>
        <div className="mf-mobile-top-actions">
          <button onClick={onHelp} title="Glossary"><Icon name="help" size={16} /></button>
          <button onClick={onLogout} title="Sign out">⏻</button>
        </div>
      </header>

      <main className="mf-content">{children}</main>

      {/* Mobile bottom nav — only visible <880px */}
      <nav className="mf-mobile-nav">
        {sections.map(s => (
          <button key={s.id} className={cx(active===s.id && "is-on")} onClick={()=>setActive(s.id)}>
            <Icon name={s.icon} />
            <span>{s.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function PageHeader({ eyebrow, title, sub, actions }) {
  return (
    <header className="mf-page-head">
      <div>
        {eyebrow && <div className="mf-eyebrow">{eyebrow}</div>}
        <h1 className="mf-h1">{title}</h1>
        {sub && <p className="mf-sub">{sub}</p>}
      </div>
      {actions && <div className="mf-page-actions">{actions}</div>}
    </header>
  );
}

// ---- Stat card with tooltip + status ----
function StatCard({ metric, latest, prev, allScans }) {
  const m = metric;
  const curr = latest[m.key];
  const before = prev[m.key];
  const positive = m.direction === "down" ? curr < before : curr > before;
  // Friendly status line
  let status = "—", statusClass = "";
  if (curr === before) { status = "Held steady"; }
  else { status = positive ? "Moving the right way" : "Worth a chat with your coach"; statusClass = positive ? "is-good" : "is-watch"; }

  return (
    <div className="mf-stat">
      <div className="mf-stat-head">
        <span className="mf-stat-label">{m.label}</span>
        <HelpDot>
          <strong>{m.label}</strong>
          {GLOSSARY[m.key].what}
        </HelpDot>
      </div>
      <div className="mf-stat-val mf-mono">{curr}<small>{m.unit}</small></div>
      <div className={cx("mf-stat-delta", positive ? "is-good" : "is-warn")}>
        {D.deltaStr(curr, before, m.unit)} <span>vs last</span>
      </div>
      <div className={cx("mf-stat-status", statusClass)}>{status}</div>
      <Spark values={allScans.map(s => s[m.key])} />
    </div>
  );
}

// ---- Quick action card ----
function QuickAction({ icon, title, sub, onClick }) {
  return (
    <button className="mf-qa" onClick={onClick}>
      <span className="mf-qa-icon"><Icon name={icon} /></span>
      <div className="mf-qa-meta">
        <div className="mf-qa-title">{title}</div>
        <div className="mf-qa-sub">{sub}</div>
      </div>
    </button>
  );
}

// ---- Highlights card ----
function HighlightsCard() {
  const latest = D.scans[D.scans.length - 1];
  const start = D.scans[0];
  const weightDelta = (start.weightKg - latest.weightKg).toFixed(1);
  const muscleDelta = (latest.muscleMassKg - start.muscleMassKg).toFixed(1);
  const ageDelta = start.metabolicAge - latest.metabolicAge;
  const goalPct = Math.round(Math.min(100, (Math.abs(latest.weightKg - start.weightKg) / Math.abs(D.client.goals.weightKg - start.weightKg)) * 100));

  return (
    <section className="mf-highlights">
      <div className="mf-highlights-head">
        <h2>The story so far</h2>
        <p>Six months of work, told in three numbers.</p>
      </div>
      <div className="mf-highlights-grid">
        <div className="mf-highlight">
          <div className="mf-highlight-emoji">🎯</div>
          <div className="mf-highlight-num">{goalPct}<small>%</small></div>
          <div className="mf-highlight-body">of your weight goal — only {Math.abs(latest.weightKg - D.client.goals.weightKg).toFixed(1)} kg to go.</div>
        </div>
        <div className="mf-highlight">
          <div className="mf-highlight-emoji">💪</div>
          <div className="mf-highlight-num">+{muscleDelta}<small> kg</small></div>
          <div className="mf-highlight-body">muscle gained since your first scan in November.</div>
        </div>
        <div className="mf-highlight">
          <div className="mf-highlight-emoji">✨</div>
          <div className="mf-highlight-num">−{ageDelta}<small> yrs</small></div>
          <div className="mf-highlight-body">metabolic age — your body's burning energy like it's younger.</div>
        </div>
      </div>
    </section>
  );
}

// ---- Client app ----
function ClientApp({ onLogout }) {
  const [active, setActive] = useState("dashboard");
  const [showHelp, setShowHelp] = useState(false);
  const sections = [
    { id: "dashboard", label: "Home", icon: "home" },
    { id: "progress", label: "Progress", icon: "trend" },
    { id: "compare", label: "Compare", icon: "compare" },
    { id: "goals", label: "Goals", icon: "target" },
  ];
  return (
    <Shell role="client" sections={sections} active={active} setActive={setActive} onLogout={onLogout} onHelp={()=>setShowHelp(true)}>
      {active === "dashboard" && <ClientDashboard onGoto={setActive} />}
      {active === "progress" && <ClientProgress />}
      {active === "compare" && <ClientCompare />}
      {active === "goals" && <ClientGoals />}
      {showHelp && <GlossaryModal onClose={()=>setShowHelp(false)} />}
    </Shell>
  );
}

function ClientDashboard({ onGoto }) {
  const latest = D.scans[D.scans.length - 1];
  const prev = D.scans[D.scans.length - 2];
  return (
    <>
      <PageHeader
        eyebrow={"LAST SCAN · " + D.fmtDate(latest.date, {long:true, year:true}).toUpperCase()}
        title={`Welcome back, ${D.client.firstName}.`}
        sub={`Down ${(D.scans[0].weightKg - latest.weightKg).toFixed(1)} kg and ${(D.scans[0].bodyFatPct - latest.bodyFatPct).toFixed(1)}% body fat since your first scan. You're trending right.`}
      />

      <HighlightsCard />

      <section>
        <h2 className="mf-h3" style={{ marginBottom: 10 }}>Quick things</h2>
        <div className="mf-quickactions">
          <QuickAction icon="calendar" title="Book next scan" sub="Suggested · 4 weeks out" />
          <QuickAction icon="message"  title="Message Marcus"  sub="Head coach · usually replies in &lt;1h" />
          <QuickAction icon="compare"  title="Compare scans"   sub="See what's changed" onClick={()=>onGoto("compare")} />
          <QuickAction icon="download" title="Download report" sub="PDF · all 5 scans" />
        </div>
      </section>

      <section>
        <div className="mf-panel-head" style={{ marginBottom: 10 }}>
          <h2 className="mf-h3">Your latest numbers</h2>
          <span className="mf-sub mf-mono">Tap any <span className="mf-help-dot" style={{position:"static", display:"inline-flex"}}>?</span> for what it means</span>
        </div>
        <div className="mf-stats">
          {D.metrics.map(m => <StatCard key={m.key} metric={m} latest={latest} prev={prev} allScans={D.scans} />)}
        </div>
      </section>

      <div className="mf-row">
        <section className="mf-panel mf-flex-2">
          <h2 className="mf-h3">A note from your coach</h2>
          <div className="mf-note">
            <Avatar initials={D.coaches[latest.coachId].avatar} size={40} accent="#F0E1D2" />
            <div>
              <div className="mf-note-head">
                <strong>{D.coaches[latest.coachId].name}</strong>
                <span className="mf-mono mf-sub">{D.fmtDate(latest.date, {long:true})}</span>
              </div>
              <p className="mf-note-body">{latest.notes}</p>
            </div>
          </div>
        </section>
        <section className="mf-panel">
          <h2 className="mf-h3">Your team</h2>
          <ul className="mf-coachlist">
            {D.client.coaches.map(id => {
              const c = D.coaches[id];
              return (
                <li key={id}>
                  <Avatar initials={c.avatar} size={36} accent={c.isHead ? "#F0E1D2" : "#D8EFE4"} />
                  <div className="mf-coach-meta">
                    <div className="mf-coach-name">{c.name} {c.isHead && <span className="mf-tag">Head</span>}</div>
                    <div className="mf-coach-role">{c.role}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <section className="mf-panel">
        <div className="mf-panel-head">
          <h2 className="mf-h3">All your scans</h2>
          <span className="mf-mono mf-sub">{D.scans.length} sessions · 6 months</span>
        </div>
        <div className="mf-table-wrap">
        <table className="mf-table">
          <thead>
            <tr>
              <th>Date</th><th>Weight</th><th>Body fat</th><th>Muscle</th><th>Visceral</th><th>Water</th><th>Met. age</th><th>Logged by</th>
            </tr>
          </thead>
          <tbody>
            {[...D.scans].reverse().map(s => (
              <tr key={s.id}>
                <td>{D.fmtDate(s.date, {long:true, year:true})}</td>
                <td className="mf-mono">{s.weightKg} kg</td>
                <td className="mf-mono">{s.bodyFatPct}%</td>
                <td className="mf-mono">{s.muscleMassKg} kg</td>
                <td className="mf-mono">{s.visceralFat}</td>
                <td className="mf-mono">{s.waterPct}%</td>
                <td className="mf-mono">{s.metabolicAge}</td>
                <td>{D.coaches[s.coachId].firstName}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>
    </>
  );
}

function ClientProgress() {
  const [metric, setMetric] = useState("weightKg");
  const m = D.metrics.find(x => x.key === metric);
  const series = D.scans.map(s => s[metric]);
  const dates = D.scans.map(s => s.date);
  const goal = m.goalKey ? D.client.goals[m.goalKey] : null;

  // Generate a plain-language insight
  const total = series[series.length-1] - series[0];
  const months = 5.6;
  const monthly = total / months;
  const direction = total < 0 ? "down" : total > 0 ? "up" : "flat";
  let insight;
  if (direction === "flat") {
    insight = "Holding steady. Sometimes that's the work — your body's settling in.";
  } else if ((m.direction === "down" && direction === "down") || (m.direction === "up" && direction === "up")) {
    insight = `Trending the right way — about ${Math.abs(monthly).toFixed(2)} ${m.unit || "units"} per month on average. Keep doing what you're doing.`;
  } else {
    insight = `Moving in the opposite direction we hoped — about ${Math.abs(monthly).toFixed(2)} ${m.unit || "units"} per month. Worth a chat with Marcus.`;
  }

  return (
    <>
      <PageHeader title="Progress" sub="Tap a metric to see how it's trending." />

      <div className="mf-insight">
        <span className="mf-insight-icon"><Icon name="sparkle" size={16} /></span>
        <div className="mf-insight-body">
          <div className="mf-insight-title">What we're seeing</div>
          <div className="mf-insight-text">{insight}</div>
        </div>
      </div>

      <div className="mf-tabs">
        {D.metrics.map(x => (
          <button key={x.key} className={cx("mf-tab", metric===x.key && "is-on")} onClick={()=>setMetric(x.key)}>{x.label}</button>
        ))}
      </div>
      <section className="mf-panel">
        <div className="mf-chart-head">
          <div>
            <div className="mf-eyebrow" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {m.label.toUpperCase()}
              <HelpDot><strong>{m.label}</strong>{GLOSSARY[m.key].what}</HelpDot>
            </div>
            <div className="mf-bignum mf-mono">{series[series.length-1]}<small>{m.unit}</small></div>
            <div className="mf-bigdelta">
              <span className="is-good">{D.deltaStr(series[series.length-1], series[0], m.unit)}</span>
              <span className="mf-sub"> since first scan · {D.fmtDate(dates[0], {long:true, year:true})}</span>
            </div>
          </div>
          <div className="mf-chart-range">
            <button className="is-on">6m</button><button>3m</button><button>1m</button>
          </div>
        </div>
        <BigLine values={series} dates={dates} goal={goal} unit={m.unit} />
      </section>
    </>
  );
}

function ClientCompare() {
  const [a, setA] = useState(D.scans[0].id);
  const [b, setB] = useState(D.scans[D.scans.length-1].id);
  const sA = D.scans.find(s => s.id === a);
  const sB = D.scans.find(s => s.id === b);

  const presets = [
    { id: "first-last", label: "First ↔ latest", a: D.scans[0].id, b: D.scans[D.scans.length-1].id },
    { id: "last-two",   label: "Last two scans", a: D.scans[D.scans.length-2].id, b: D.scans[D.scans.length-1].id },
    { id: "first-mid",  label: "Start ↔ midpoint", a: D.scans[0].id, b: D.scans[Math.floor(D.scans.length/2)].id },
  ];
  const currentPreset = presets.find(p => p.a === a && p.b === b)?.id;

  // Plain-language summary card
  const weightChange = sB.weightKg - sA.weightKg;
  const fatChange = sB.bodyFatPct - sA.bodyFatPct;
  const muscleChange = sB.muscleMassKg - sA.muscleMassKg;

  return (
    <>
      <PageHeader title="Compare scans" sub="Pick two sessions to see exactly what shifted." />

      <div className="mf-compare-presets">
        <span className="mf-sub" style={{ marginRight: 4, alignSelf: "center" }}>Quick picks:</span>
        {presets.map(p => (
          <button key={p.id} className={cx("mf-preset", currentPreset===p.id && "is-on")} onClick={()=>{ setA(p.a); setB(p.b); }}>{p.label}</button>
        ))}
      </div>

      <div className="mf-compare-pickers">
        <label className="mf-field"><span>Baseline</span>
          <select value={a} onChange={e=>setA(e.target.value)}>
            {D.scans.map(s => <option key={s.id} value={s.id}>{D.fmtDate(s.date,{long:true,year:true})}</option>)}
          </select>
        </label>
        <span className="mf-vs">VS</span>
        <label className="mf-field"><span>Comparison</span>
          <select value={b} onChange={e=>setB(e.target.value)}>
            {D.scans.map(s => <option key={s.id} value={s.id}>{D.fmtDate(s.date,{long:true,year:true})}</option>)}
          </select>
        </label>
      </div>

      <div className="mf-compare-summary">
        <div className="mf-summary-item">
          <span className={cx("mf-summary-num", weightChange < 0 ? "is-good" : weightChange > 0 ? "is-warn" : "")}>{weightChange > 0 ? "+" : ""}{weightChange.toFixed(1)} kg</span>
          <span className="mf-summary-label">Weight change</span>
        </div>
        <div className="mf-summary-item">
          <span className={cx("mf-summary-num", fatChange < 0 ? "is-good" : "is-warn")}>{fatChange > 0 ? "+" : ""}{fatChange.toFixed(1)}%</span>
          <span className="mf-summary-label">Body fat change</span>
        </div>
        <div className="mf-summary-item">
          <span className={cx("mf-summary-num", muscleChange > 0 ? "is-good" : "is-warn")}>{muscleChange > 0 ? "+" : ""}{muscleChange.toFixed(1)} kg</span>
          <span className="mf-summary-label">Muscle change</span>
        </div>
      </div>

      <section className="mf-panel mf-no-padding">
        <div className="mf-table-wrap" style={{ margin: 0, padding: 0 }}>
        <table className="mf-table mf-compare-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>{D.fmtDate(sA.date,{long:true})}</th>
              <th>{D.fmtDate(sB.date,{long:true})}</th>
              <th>Change</th>
              <th>How it's going</th>
            </tr>
          </thead>
          <tbody>
            {D.metrics.map(m => {
              const va = sA[m.key], vb = sB[m.key];
              const positive = m.direction === "down" ? vb < va : vb > va;
              const flat = va === vb;
              return (
                <tr key={m.key}>
                  <td>{m.label}</td>
                  <td className="mf-mono">{va}{m.unit}</td>
                  <td className="mf-mono">{vb}{m.unit}</td>
                  <td className={cx("mf-mono", flat ? "" : positive ? "is-good" : "is-warn")}>{D.deltaStr(vb, va, m.unit)}</td>
                  <td className={cx(flat ? "" : positive ? "is-good" : "is-warn")} style={{ fontWeight: 600 }}>{flat ? "Held steady" : positive ? "Moving right way" : "Worth a chat"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </section>
    </>
  );
}

function ClientGoals() {
  const latest = D.scans[D.scans.length - 1];
  const start = D.scans[0];
  return (
    <>
      <PageHeader title="Your goals" sub={`Set with Marcus on day one (${D.fmtDate(D.client.joined, {long:true, year:true})}). You're closer than you think.`} />
      <div className="mf-goal-grid">
        {D.metrics.filter(m => m.goalKey).map(m => {
          const curr = latest[m.key];
          const target = D.client.goals[m.goalKey];
          const startV = start[m.key];
          const totalRange = Math.abs(target - startV) || 1;
          const traveled = Math.abs(curr - startV);
          const pct = Math.min(100, Math.max(0, (traveled / totalRange) * 100));
          const remaining = (target - curr).toFixed(1);
          // ETA: based on average per-month pace
          const months = 5.6;
          const monthlyPace = traveled / months;
          const remainingDist = Math.abs(target - curr);
          const monthsToGo = monthlyPace > 0 ? remainingDist / monthlyPace : null;
          // Encouragement
          let encourage;
          if (pct >= 100) encourage = "🎉 You did it! Time to set the next one.";
          else if (pct >= 75) encourage = "Almost there — the last stretch is mostly mental.";
          else if (pct >= 50) encourage = "Past the halfway mark. Keep going.";
          else if (pct >= 25) encourage = "Off to a steady start. Trust the process.";
          else encourage = "Early days. Tiny wins compound — promise.";
          return (
            <div key={m.key} className="mf-panel mf-goal-card">
              <Ring value={pct} max={100} size={96} stroke={9} />
              <div className="mf-goal-meta">
                <div className="mf-goal-label">{m.label}</div>
                <div className="mf-goal-row"><span>Start</span><span className="mf-mono">{startV}{m.unit}</span></div>
                <div className="mf-goal-row"><span>Now</span><span className="mf-mono">{curr}{m.unit}</span></div>
                <div className="mf-goal-row"><span>Goal</span><span className="mf-mono">{target}{m.unit}</span></div>
                <div className="mf-goal-bar"><div className="mf-goal-bar-fill" style={{ width: pct + "%" }} /></div>
                {monthsToGo && pct < 100 && (
                  <div className="mf-goal-eta">At your current pace · ~{Math.ceil(monthsToGo)} months to go</div>
                )}
                <div className="mf-goal-encourage">{encourage}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---- Coach app ----
function CoachApp({ onLogout }) {
  const [active, setActive] = useState("today");
  const [selectedClient, setSelectedClient] = useState("c-emma");
  const [toast, setToast] = useState("");
  const [showHelp, setShowHelp] = useState(false);
  function pingToast(msg) { setToast(msg); setTimeout(()=>setToast(""), 2800); }
  const sections = [
    { id: "today",  label: "Today",     icon: "home" },
    { id: "roster", label: "Clients",   icon: "users", badge: D.roster.length },
    { id: "add",    label: "New scan",  icon: "plus" },
    { id: "messages", label: "Messages", icon: "mail", badge: 3 },
  ];
  return (
    <Shell role="coach" sections={sections} active={active} setActive={setActive} onLogout={onLogout} onHelp={()=>setShowHelp(true)}>
      {active === "today" && <CoachToday onOpenClient={(id)=>{ setSelectedClient(id); setActive("roster"); }} onGoto={setActive} />}
      {active === "roster" && <CoachRoster selected={selectedClient} onSelect={setSelectedClient} onToast={pingToast} onGoto={setActive} />}
      {active === "add" && <CoachNewScan onSaved={(n) => { pingToast(`✓ Saved · ${n} will see it now.`); setActive("today"); }} />}
      {active === "messages" && <CoachMessages />}
      {showHelp && <GlossaryModal onClose={()=>setShowHelp(false)} />}
      {toast && <div className="mf-toast">{toast}</div>}
    </Shell>
  );
}

function CoachToday({ onOpenClient, onGoto }) {
  const today = new Date("2026-05-22");
  const overdue = D.roster.filter(c => Math.round((today - new Date(c.lastScan)) / 86400000) > 28);
  const upcoming = D.roster.filter(c => c.nextSession !== "Overdue").slice(0, 3);
  const recent = D.roster.filter(c => Math.round((today - new Date(c.lastScan)) / 86400000) <= 7).slice(0, 3);

  return (
    <>
      <PageHeader
        eyebrow="THURSDAY · 22 MAY 2026"
        title="Good morning, Marcus."
        sub={`${D.roster.length} active clients · ${overdue.length} overdue for a scan · ${upcoming.length} sessions on the books today.`}
        actions={<>
          <button className="mf-btn mf-btn-ghost" onClick={()=>onGoto("messages")}><Icon name="mail" size={14} /> Messages</button>
          <button className="mf-btn mf-btn-primary" onClick={()=>onGoto("add")}>+ Log a scan</button>
        </>}
      />

      <div className="mf-today">
        {overdue.length > 0 && (
          <div className="mf-today-card is-warn">
            <div className="mf-today-eyebrow">⚠ Needs a nudge</div>
            <div className="mf-today-title">{overdue.length} client{overdue.length === 1 ? "" : "s"} overdue</div>
            <div className="mf-today-clients">
              {overdue.map(c => {
                const days = Math.round((today - new Date(c.lastScan)) / 86400000);
                return (
                  <div key={c.id} className="mf-today-client" onClick={()=>onOpenClient(c.id)}>
                    <Avatar initials={c.avatar} size={28} accent="#F5DAD0" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                      <small>{days} days · last scan</small>
                    </div>
                    <Icon name="chevron" size={14} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mf-today-card">
          <div className="mf-today-eyebrow">📅 Coming up</div>
          <div className="mf-today-title">Next sessions</div>
          <div className="mf-today-clients">
            {upcoming.map(c => (
              <div key={c.id} className="mf-today-client" onClick={()=>onOpenClient(c.id)}>
                <Avatar initials={c.avatar} size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                  <small>{c.nextSession}</small>
                </div>
                <Icon name="chevron" size={14} />
              </div>
            ))}
          </div>
        </div>

        <div className="mf-today-card">
          <div className="mf-today-eyebrow">✨ Recently scanned</div>
          <div className="mf-today-title">Worth a note</div>
          <div className="mf-today-clients">
            {recent.map(c => {
              const days = Math.round((today - new Date(c.lastScan)) / 86400000);
              return (
                <div key={c.id} className="mf-today-client" onClick={()=>onOpenClient(c.id)}>
                  <Avatar initials={c.avatar} size={28} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div>
                    <small>scanned {days === 0 ? "today" : `${days}d ago`}</small>
                  </div>
                  <Icon name="chevron" size={14} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section className="mf-panel">
        <div className="mf-panel-head">
          <h2 className="mf-h3">Spotlight · Emma Larsen</h2>
          <button className="mf-btn mf-btn-ghost" onClick={()=>onOpenClient("c-emma")}>Open profile →</button>
        </div>
        <p className="mf-sub" style={{ marginBottom: 12 }}>Your longest-running client. Six months in, and the numbers tell a story:</p>
        <div className="mf-highlights-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
          {D.metrics.slice(0, 3).map(m => {
            const series = D.scans.map(s => s[m.key]);
            return (
              <div key={m.key} className="mf-stat" style={{ padding: 14 }}>
                <div className="mf-stat-label">{m.label}</div>
                <div className="mf-stat-val mf-mono" style={{ fontSize: 22 }}>{series[series.length-1]}<small>{m.unit}</small></div>
                <div className="mf-stat-delta is-good">{D.deltaStr(series[series.length-1], series[0], m.unit)} <span>since start</span></div>
                <Spark values={series} />
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

function CoachRoster({ selected, onSelect, onToast, onGoto }) {
  const [query, setQuery] = useState("");
  const filtered = D.roster.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="mf-roster">
      <aside className="mf-roster-list">
        <div className="mf-roster-head" style={{ position: "relative" }}>
          <input className="mf-search" placeholder="Search clients…" value={query} onChange={e=>setQuery(e.target.value)} style={{ paddingLeft: 32 }} />
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-3)", display: "flex" }}><Icon name="search" size={14} /></span>
        </div>
        <ul>
          {filtered.map(c => {
            const daysSince = Math.round((new Date("2026-05-22") - new Date(c.lastScan)) / 86400000);
            const overdue = daysSince > 28;
            return (
              <li key={c.id} className={cx("mf-roster-item", selected===c.id && "is-on")} onClick={()=>onSelect(c.id)}>
                <Avatar initials={c.avatar} size={40} accent={overdue ? "#F5DAD0" : "#D8EFE4"} />
                <div className="mf-roster-meta">
                  <div className="mf-roster-name">{c.name}</div>
                  <div className="mf-roster-sub mf-mono">{daysSince}d · {c.tags[0]}</div>
                </div>
                {overdue && <span className="mf-tag mf-tag-warn">!</span>}
                <button className="mf-roster-quickadd" onClick={(e)=>{ e.stopPropagation(); onGoto("add"); }}>+ Scan</button>
              </li>
            );
          })}
        </ul>
      </aside>
      <section className="mf-roster-detail">
        <ClientDetailPane clientId={selected} onToast={onToast} />
      </section>
    </div>
  );
}

function ClientDetailPane({ clientId, onToast }) {
  const isEmma = clientId === "c-emma";
  const roster = D.roster.find(c => c.id === clientId);
  const [draft, setDraft] = useState("");

  if (!isEmma) {
    return (
      <div className="mf-empty">
        <div className="mf-empty-emoji">📋</div>
        <h2 className="mf-h2">{roster.name}'s profile</h2>
        <p className="mf-sub">Full demo data is filled in for Emma Larsen. Select her from the list to see what a complete client view looks like — scans, notes, team, the works.</p>
      </div>
    );
  }

  const latest = D.scans[D.scans.length - 1];
  const prev = D.scans[D.scans.length - 2];
  return (
    <>
      <PageHeader
        eyebrow={`CLIENT · joined ${D.fmtDate(D.client.joined,{long:true,year:true})}`}
        title={D.client.name}
        sub={`5 scans · last on ${D.fmtDate(latest.date,{long:true})}. Down ${(D.scans[0].weightKg - latest.weightKg).toFixed(1)} kg and ${(D.scans[0].bodyFatPct - latest.bodyFatPct).toFixed(1)}% body fat since intake — well ahead of schedule.`}
        actions={<>
          <button className="mf-btn mf-btn-ghost"><Icon name="message" size={14} /> Message</button>
          <button className="mf-btn mf-btn-primary"><Icon name="plus" size={14} /> Add scan</button>
        </>}
      />

      <div className="mf-stats">
        {D.metrics.map(m => <StatCard key={m.key} metric={m} latest={latest} prev={prev} allScans={D.scans} />)}
      </div>

      <div className="mf-row">
        <section className="mf-panel mf-flex-2">
          <h2 className="mf-h3">Add a note for Emma</h2>
          <p className="mf-sub">She'll see this on her home screen. Last note shared on {D.fmtDate(latest.date,{long:true})}.</p>
          <textarea className="mf-textarea" rows="3" placeholder="What did you notice? What's next?" value={draft} onChange={e=>setDraft(e.target.value)} />
          <div className="mf-panel-foot">
            <span className="mf-sub mf-mono">{draft.length} chars · {draft.length > 0 ? "she'll get a notification" : "type something to send"}</span>
            <button className="mf-btn mf-btn-primary" disabled={!draft.trim()} onClick={()=>{ onToast("✓ Note shared with Emma. She just got a notification."); setDraft(""); }}>Share with Emma</button>
          </div>
        </section>
        <section className="mf-panel">
          <h2 className="mf-h3">Coaching team</h2>
          <ul className="mf-coachlist">
            {D.client.coaches.map(id => {
              const c = D.coaches[id];
              return (
                <li key={id}>
                  <Avatar initials={c.avatar} size={36} accent={c.isHead ? "#F0E1D2" : "#D8EFE4"} />
                  <div className="mf-coach-meta">
                    <div className="mf-coach-name">{c.name} {c.isHead && <span className="mf-tag">Head</span>}</div>
                    <div className="mf-coach-role">{c.role}</div>
                  </div>
                </li>
              );
            })}
          </ul>
          <button className="mf-btn mf-btn-ghost mf-full" onClick={()=>onToast("✓ Invite link copied. Paste it anywhere.")}>+ Invite a coach</button>
        </section>
      </div>

      <section className="mf-panel">
        <div className="mf-panel-head">
          <h2 className="mf-h3">Scan history</h2>
          <span className="mf-mono mf-sub">{D.scans.length} sessions</span>
        </div>
        <div className="mf-table-wrap">
        <table className="mf-table">
          <thead>
            <tr><th>Date</th><th>Weight</th><th>Body fat</th><th>Muscle</th><th>Visceral</th><th>Water</th><th>Met. age</th><th>Logged by</th></tr>
          </thead>
          <tbody>
            {[...D.scans].reverse().map(s => (
              <tr key={s.id}>
                <td>{D.fmtDate(s.date,{long:true,year:true})}</td>
                <td className="mf-mono">{s.weightKg}</td>
                <td className="mf-mono">{s.bodyFatPct}%</td>
                <td className="mf-mono">{s.muscleMassKg}</td>
                <td className="mf-mono">{s.visceralFat}</td>
                <td className="mf-mono">{s.waterPct}%</td>
                <td className="mf-mono">{s.metabolicAge}</td>
                <td>{D.coaches[s.coachId].firstName}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </section>
    </>
  );
}

function CoachNewScan({ onSaved }) {
  const [clientId, setClientId] = useState("c-emma");
  const [date, setDate] = useState("2026-05-22");
  const [vals, setVals] = useState({ weightKg:"", bodyFatPct:"", muscleMassKg:"", visceralFat:"", waterPct:"", metabolicAge:"" });
  const [note, setNote] = useState("");
  const filled = D.metrics.every(m => vals[m.key] !== "");
  const remaining = D.metrics.filter(m => vals[m.key] === "").length;
  const clientName = D.roster.find(c=>c.id===clientId).name.split(" ")[0];

  function autofill() {
    setVals({ weightKg: 66.0, bodyFatPct: 24.2, muscleMassKg: 26.6, visceralFat: 4, waterPct: 53.8, metabolicAge: 29 });
  }

  return (
    <>
      <PageHeader
        title="Log a new scan"
        sub={`60 seconds. The moment you save, ${clientName}'s home screen updates with the new numbers — and a notification.`}
      />

      <section className="mf-panel">
        <h2 className="mf-h3">Who & when</h2>
        <div className="mf-form-row">
          <label className="mf-field"><span>Client</span>
            <select value={clientId} onChange={e=>setClientId(e.target.value)}>
              {D.roster.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="mf-field"><span>Scan date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
          <button type="button" className="mf-btn mf-btn-ghost mf-autofill" onClick={autofill}>
            <Icon name="download" size={14} /> Pull from device
          </button>
        </div>
        <p className="mf-sub" style={{ marginTop: 8 }}>Tip: if your scanner is paired, "Pull from device" fills everything in for you.</p>
      </section>

      <section className="mf-panel">
        <h2 className="mf-h3">Measurements <small className="mf-sub">{filled ? "all set ✓" : `${remaining} to go`}</small></h2>
        <div className="mf-metrics-grid">
          {D.metrics.map(m => (
            <label key={m.key} className="mf-field">
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {m.label} <small className="mf-mono">{m.unit && `(${m.unit})`}</small>
                <HelpDot><strong>{m.label}</strong>{GLOSSARY[m.key].what}</HelpDot>
              </span>
              <input inputMode="decimal" placeholder="—" value={vals[m.key]} onChange={e=>setVals({...vals, [m.key]: e.target.value})} />
            </label>
          ))}
        </div>
      </section>

      <section className="mf-panel">
        <h2 className="mf-h3">A note for {clientName} <small className="mf-sub">(optional, but appreciated)</small></h2>
        <textarea className="mf-textarea" rows="4" placeholder="What did you notice? What's the plan for next block?" value={note} onChange={e=>setNote(e.target.value)} />

        {filled && (
          <div className="mf-confirm">
            <div className="mf-confirm-head"><Icon name="check" size={16} /> Ready to save</div>
            <div className="mf-confirm-grid">
              {D.metrics.map(m => (
                <div key={m.key}><small>{m.label}</small><strong>{vals[m.key]}{m.unit}</strong></div>
              ))}
            </div>
          </div>
        )}

        <div className="mf-panel-foot">
          <span className="mf-sub mf-mono">{filled ? "✓ All measurements captured" : `${remaining} field${remaining === 1 ? "" : "s"} remaining`}</span>
          <button className="mf-btn mf-btn-primary" disabled={!filled} onClick={()=>onSaved(clientName)}>Save scan →</button>
        </div>
      </section>
    </>
  );
}

function CoachMessages() {
  return (
    <>
      <PageHeader title="Messages" sub="A lightweight inbox lives here. Demo content for the prototype." />
      <section className="mf-panel">
        <ul className="mf-msgs">
          <li>
            <Avatar initials="EL" size={40} />
            <div>
              <div className="mf-msg-head"><strong>Emma Larsen</strong><span className="mf-sub mf-mono">2h ago</span></div>
              <p className="mf-msg-body">Hip mobility felt amazing this morning — Tom's sequence is working.</p>
            </div>
          </li>
          <li>
            <Avatar initials="SR" size={40} accent="#F0E1D2" />
            <div>
              <div className="mf-msg-head"><strong>Sofia Ruiz</strong><span className="mf-sub mf-mono">yesterday</span></div>
              <p className="mf-msg-body">Bumped Emma's protein target to 110g/day — can you confirm with her at the next session?</p>
            </div>
          </li>
          <li>
            <Avatar initials="JP" size={40} accent="#D5E8FF" />
            <div>
              <div className="mf-msg-head"><strong>Jonah Park</strong><span className="mf-sub mf-mono">2d ago</span></div>
              <p className="mf-msg-body">Bumping the Wednesday session — flight rescheduled. Thursday 7am OK?</p>
            </div>
          </li>
        </ul>
      </section>
    </>
  );
}

// ---- root ----
function App() {
  const [role, setRole] = useState(null);
  if (!role) return <Login onLogin={setRole} />;
  return role === "client" ? <ClientApp onLogout={()=>setRole(null)} /> : <CoachApp onLogout={()=>setRole(null)} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
