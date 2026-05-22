/* global React, ReactDOM, BODYSCAN_DATA */
// Variation 2 — Sunset Glow. Playful, coral, bubbly.

const { useState, useMemo } = React;
const D = window.BODYSCAN_DATA;
const cx = (...a) => a.filter(Boolean).join(" ");

// ---- shared ----
function Bubble({ initials, size = 40, tone = "coral" }) {
  const tones = {
    coral:  ["#FFD9C9", "#7A2E1F"],
    peach:  ["#FFE4C5", "#7A4A1E"],
    grape:  ["#E7D6FF", "#3F2A6B"],
    mint:   ["#CFEFE0", "#1F5A3F"],
    sky:    ["#D5E8FF", "#1E3D6B"],
    cream:  ["#FFF1DC", "#5A4630"],
  };
  const t = tones[tone] || tones.coral;
  return (
    <div className="sg-bubble" style={{ width: size, height: size, background: t[0], color: t[1], fontSize: size * 0.38 }}>{initials}</div>
  );
}

function Donut({ value, max, color = "#F08869", track = "#FFE0D2", size = 92, label, unit = "" }) {
  const pct = Math.max(0, Math.min(1, value / max));
  const r = size/2 - 8;
  const c = 2 * Math.PI * r;
  return (
    <div className="sg-donut" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={r} stroke={track} strokeWidth="10" fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth="10" fill="none"
          strokeDasharray={`${pct*c} ${c}`} strokeLinecap="round"
          transform={`rotate(-90 ${size/2} ${size/2})`} />
      </svg>
      <div className="sg-donut-center">
        <div className="sg-donut-val">{value}<span>{unit}</span></div>
        {label && <div className="sg-donut-label">{label}</div>}
      </div>
    </div>
  );
}

function AreaChart({ values, dates, w = 720, h = 280, goal = null, unit = "" }) {
  if (!values || values.length < 2) return null;
  const pad = { t: 28, r: 24, b: 44, l: 48 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const ymin = Math.min(...values, goal ?? Infinity) - 1;
  const ymax = Math.max(...values, goal ?? -Infinity) + 1;
  const span = ymax - ymin || 1;
  const xs = values.map((_, i) => pad.l + (i * innerW) / (values.length - 1));
  const ys = values.map((v) => pad.t + innerH - ((v - ymin) / span) * innerH);
  const d = xs.map((x, i) => (i === 0 ? "M" : "L") + x + "," + ys[i]).join(" ");
  const dFill = d + ` L ${xs[xs.length-1]},${pad.t+innerH} L ${xs[0]},${pad.t+innerH} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="sg-area">
      <defs>
        <linearGradient id="sg-grad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#F08869" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#F08869" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0,1,2,3,4].map(i => {
        const y = pad.t + (i * innerH) / 4;
        const v = ymax - (i * span) / 4;
        return <g key={i}>
          <line x1={pad.l} x2={w-pad.r} y1={y} y2={y} stroke="#F5E0D4" />
          <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#B5867A">{v.toFixed(1)}</text>
        </g>;
      })}
      {goal != null && (
        <g>
          <line x1={pad.l} x2={w-pad.r}
            y1={pad.t + innerH - ((goal - ymin) / span) * innerH}
            y2={pad.t + innerH - ((goal - ymin) / span) * innerH}
            stroke="#2F7C5C" strokeDasharray="6 4" />
          <text x={w-pad.r} y={pad.t + innerH - ((goal - ymin) / span) * innerH - 6}
            textAnchor="end" fontSize="11" fill="#2F7C5C">goal {goal}{unit}</text>
        </g>
      )}
      <path d={dFill} fill="url(#sg-grad)" />
      <path d={d} stroke="#F08869" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={ys[i]} r="6" fill="#FFF" stroke="#F08869" strokeWidth="2.5" />
          <text x={x} y={h-14} textAnchor="middle" fontSize="11" fill="#B5867A">{D.fmtDate(dates[i])}</text>
        </g>
      ))}
    </svg>
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
    <div className="sg-login">
      <div className="sg-shape sg-shape-1" />
      <div className="sg-shape sg-shape-2" />
      <div className="sg-shape sg-shape-3" />
      <header className="sg-login-head">
        <span className="sg-logo">
          <span className="sg-logo-mark" />
          glow
        </span>
        <span className="sg-login-tag">Bodyscans, but make it nice</span>
      </header>

      <div className="sg-login-card">
        {!mode ? (
          <>
            <h1 className="sg-h1">Hey, you.</h1>
            <p className="sg-lede">Pick how you're showing up today.</p>
            <div className="sg-persona-grid">
              <button className="sg-persona-tile" onClick={() => pick("client")}>
                <Bubble initials="EL" size={72} tone="coral" />
                <div className="sg-persona-name">I'm Emma</div>
                <div className="sg-persona-role">Client · 5 scans logged</div>
              </button>
              <button className="sg-persona-tile" onClick={() => pick("coach")}>
                <Bubble initials="MB" size={72} tone="grape" />
                <div className="sg-persona-name">I'm Marcus</div>
                <div className="sg-persona-role">Head coach · 6 clients</div>
              </button>
            </div>
            <div className="sg-login-foot">First time? <a href="#" onClick={(e)=>e.preventDefault()}>Ask your coach for an invite</a></div>
          </>
        ) : (
          <form onSubmit={(e)=>{ e.preventDefault(); onLogin(mode); }}>
            <button type="button" className="sg-back" onClick={()=>setMode(null)}>← back</button>
            <h1 className="sg-h1">Welcome back!</h1>
            <p className="sg-lede">Signing in as a {mode}.</p>
            <label className="sg-field"><span>Email</span><input value={email} onChange={(e)=>setEmail(e.target.value)} autoFocus /></label>
            <label className="sg-field"><span>Password</span><input type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} /></label>
            <button className="sg-btn sg-btn-primary" type="submit">Let me in</button>
            <a href="#" onClick={(e)=>e.preventDefault()} className="sg-mini-link">Forgot your password?</a>
          </form>
        )}
      </div>
    </div>
  );
}

// ---- Client ----
function ClientApp({ onLogout }) {
  const [tab, setTab] = useState("home");
  const tabs = [
    { id: "home", label: "Home", icon: "✦" },
    { id: "progress", label: "Progress", icon: "↗" },
    { id: "compare", label: "Compare", icon: "⇋" },
    { id: "goals", label: "Goals", icon: "◉" },
  ];

  return (
    <div className="sg-app">
      <TopBar
        right={
          <>
            <Bubble initials={D.client.avatar} tone="coral" />
            <div className="sg-top-meta">
              <div className="sg-top-name">{D.client.firstName}</div>
              <button className="sg-top-out" onClick={onLogout}>Sign out</button>
            </div>
          </>
        }
      />
      <div className="sg-main">
        {tab === "home" && <ClientHome />}
        {tab === "progress" && <ClientProgress />}
        {tab === "compare" && <ClientCompare />}
        {tab === "goals" && <ClientGoals />}
      </div>
      <nav className="sg-bottomnav">
        {tabs.map(t => (
          <button key={t.id} className={cx("sg-nav", tab===t.id && "is-on")} onClick={()=>setTab(t.id)}>
            <span className="sg-nav-icon">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function TopBar({ right }) {
  return (
    <header className="sg-topbar">
      <span className="sg-logo"><span className="sg-logo-mark" /> glow</span>
      <div className="sg-top-right">{right}</div>
    </header>
  );
}

function ClientHome() {
  const latest = D.scans[D.scans.length - 1];
  const prev = D.scans[D.scans.length - 2];
  const head = D.coaches[D.client.headCoach];
  const tones = ["coral", "peach", "grape", "mint", "sky", "cream"];

  return (
    <div className="sg-home">
      <section className="sg-greet">
        <div className="sg-greet-eyebrow">{D.fmtDate(latest.date, {long:true, year:true})}</div>
        <h1 className="sg-h1">Look at you go, <span className="sg-h1-accent">{D.client.firstName}.</span></h1>
        <p className="sg-lede">Down <strong>{(D.scans[0].weightKg - latest.weightKg).toFixed(1)} kg</strong> in 6 months, and still gaining muscle. That's the dream combo.</p>
        <div className="sg-greet-actions">
          <button className="sg-btn sg-btn-primary">Book next scan</button>
          <button className="sg-btn sg-btn-ghost">Download report</button>
        </div>
        <div className="sg-greet-glyph">☀</div>
      </section>

      <section className="sg-tiles">
        {D.metrics.map((m, i) => {
          const curr = latest[m.key];
          const before = prev[m.key];
          const positive = m.direction === "down" ? curr < before : curr > before;
          const tone = tones[i % tones.length];
          return (
            <article key={m.key} className={cx("sg-tile", `is-${tone}`)}>
              <div className="sg-tile-label">{m.label}</div>
              <div className="sg-tile-val">{curr}<span>{m.unit}</span></div>
              <div className={cx("sg-tile-delta", positive ? "is-good" : "is-warn")}>
                {D.deltaStr(curr, before, m.unit)} since last scan
              </div>
            </article>
          );
        })}
      </section>

      <section className="sg-card sg-note-card">
        <div className="sg-note-head">
          <Bubble initials={D.coaches[latest.coachId].avatar} tone="grape" size={48} />
          <div>
            <div className="sg-note-by">{D.coaches[latest.coachId].name} says</div>
            <div className="sg-note-meta">After your {D.fmtDate(latest.date, {long:true})} scan</div>
          </div>
        </div>
        <p className="sg-note-body">"{latest.notes}"</p>
      </section>

      <section className="sg-card sg-team">
        <h2 className="sg-h2">Your team</h2>
        <div className="sg-team-grid">
          {D.client.coaches.map((id, i) => {
            const c = D.coaches[id];
            const t = ["grape","mint","sky"][i] || "cream";
            return (
              <div key={id} className="sg-team-card">
                <Bubble initials={c.avatar} size={56} tone={t} />
                <div className="sg-team-name">{c.name}</div>
                <div className="sg-team-role">{c.role}</div>
                {c.isHead && <span className="sg-chip">Head coach</span>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function ClientProgress() {
  const [metric, setMetric] = useState("weightKg");
  const m = D.metrics.find(x => x.key === metric);
  const series = D.scans.map(s => s[metric]);
  const dates = D.scans.map(s => s.date);
  const goal = m.goalKey ? D.client.goals[m.goalKey] : null;

  return (
    <div className="sg-page">
      <h1 className="sg-h1 sg-page-h">Progress 📈</h1>
      <p className="sg-lede">Tap a metric to see how it's trending.</p>
      <div className="sg-pills">
        {D.metrics.map(x => (
          <button key={x.key} className={cx("sg-pill", metric===x.key && "is-on")} onClick={()=>setMetric(x.key)}>{x.label}</button>
        ))}
      </div>
      <div className="sg-card sg-chartcard">
        <div className="sg-chart-head">
          <div>
            <div className="sg-chart-label">{m.label}</div>
            <div className="sg-chart-val">
              {series[series.length-1]}<span>{m.unit}</span>
              <em>{D.deltaStr(series[series.length-1], series[0], m.unit)} since first scan</em>
            </div>
          </div>
        </div>
        <AreaChart values={series} dates={dates} goal={goal} unit={m.unit} />
      </div>
    </div>
  );
}

function ClientCompare() {
  const [a, setA] = useState(D.scans[0].id);
  const [b, setB] = useState(D.scans[D.scans.length-1].id);
  const sA = D.scans.find(s => s.id === a);
  const sB = D.scans.find(s => s.id === b);

  return (
    <div className="sg-page">
      <h1 className="sg-h1 sg-page-h">Then & now ⇋</h1>
      <p className="sg-lede">Pick any two scans to see what shifted.</p>

      <div className="sg-compare-pickers">
        <div className="sg-pickwrap">
          <span className="sg-picklabel">Then</span>
          <select value={a} onChange={e=>setA(e.target.value)}>
            {D.scans.map(s => <option key={s.id} value={s.id}>{D.fmtDate(s.date,{long:true,year:true})}</option>)}
          </select>
        </div>
        <div className="sg-pickwrap">
          <span className="sg-picklabel">Now</span>
          <select value={b} onChange={e=>setB(e.target.value)}>
            {D.scans.map(s => <option key={s.id} value={s.id}>{D.fmtDate(s.date,{long:true,year:true})}</option>)}
          </select>
        </div>
      </div>

      <div className="sg-compare-grid">
        {D.metrics.map(m => {
          const va = sA[m.key], vb = sB[m.key];
          const positive = m.direction === "down" ? vb < va : vb > va;
          return (
            <div key={m.key} className="sg-compare-card">
              <div className="sg-compare-name">{m.label}</div>
              <div className="sg-compare-pair">
                <div className="sg-compare-then"><small>then</small><strong>{va}{m.unit}</strong></div>
                <div className="sg-compare-arrow">→</div>
                <div className="sg-compare-now"><small>now</small><strong>{vb}{m.unit}</strong></div>
              </div>
              <div className={cx("sg-compare-delta", positive ? "is-good" : "is-warn")}>{D.deltaStr(vb, va, m.unit)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ClientGoals() {
  const latest = D.scans[D.scans.length - 1];
  const start = D.scans[0];
  return (
    <div className="sg-page">
      <h1 className="sg-h1 sg-page-h">Your goals ◉</h1>
      <p className="sg-lede">Set with Marcus on day one. You're closer than you think.</p>
      <div className="sg-goal-grid">
        {D.metrics.filter(m => m.goalKey).map((m, i) => {
          const curr = latest[m.key];
          const target = D.client.goals[m.goalKey];
          const startV = start[m.key];
          const totalRange = Math.abs(target - startV) || 1;
          const traveled = Math.abs(curr - startV);
          const pct = Math.min(100, Math.max(0, (traveled / totalRange) * 100));
          const tones = ["coral","peach","grape","mint"];
          const colors = ["#F08869","#F0A569","#9C7BD8","#5FBF93"];
          return (
            <div key={m.key} className={cx("sg-goalcard", `is-${tones[i%4]}`)}>
              <Donut value={Math.round(pct)} max={100} color={colors[i%4]} track="rgba(255,255,255,0.55)" size={120} label="of goal" unit="%" />
              <div className="sg-goalcard-meta">
                <div className="sg-goalcard-label">{m.label}</div>
                <div className="sg-goalcard-row"><span>Start</span><strong>{startV}{m.unit}</strong></div>
                <div className="sg-goalcard-row"><span>Now</span><strong>{curr}{m.unit}</strong></div>
                <div className="sg-goalcard-row"><span>Goal</span><strong>{target}{m.unit}</strong></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---- Coach ----
function CoachApp({ onLogout }) {
  const [tab, setTab] = useState("roster");
  const [selected, setSelected] = useState(null);
  const [toast, setToast] = useState("");

  function pingToast(msg) { setToast(msg); setTimeout(()=>setToast(""), 2400); }

  return (
    <div className="sg-app">
      <TopBar right={<>
        <Bubble initials="MB" tone="grape" />
        <div className="sg-top-meta">
          <div className="sg-top-name">Marcus</div>
          <button className="sg-top-out" onClick={onLogout}>Sign out</button>
        </div>
      </>} />
      <div className="sg-main">
        {tab === "roster" && <CoachRoster onOpen={(id)=>{ setSelected(id); setTab("client"); }} />}
        {tab === "add" && <CoachNewScan onSaved={(name)=>{ pingToast(`Saved · ${name} will see it now.`); setTab("roster"); }} />}
        {tab === "client" && <CoachClient clientId={selected} onToast={pingToast} />}
      </div>
      <nav className="sg-bottomnav">
        <button className={cx("sg-nav", tab==="roster" && "is-on")} onClick={()=>setTab("roster")}><span className="sg-nav-icon">☰</span><span>Clients</span></button>
        <button className={cx("sg-nav sg-nav-big", tab==="add" && "is-on")} onClick={()=>setTab("add")}>+<span>New scan</span></button>
        {selected && <button className={cx("sg-nav", tab==="client" && "is-on")} onClick={()=>setTab("client")}><span className="sg-nav-icon">●</span><span>{D.roster.find(c=>c.id===selected).name.split(" ")[0]}</span></button>}
      </nav>
      {toast && <div className="sg-toast">{toast}</div>}
    </div>
  );
}

function CoachRoster({ onOpen }) {
  const tones = ["coral","peach","grape","mint","sky","cream"];
  return (
    <div className="sg-page">
      <h1 className="sg-h1 sg-page-h">Your clients</h1>
      <p className="sg-lede">{D.roster.length} active · tap a name to open their profile.</p>
      <div className="sg-roster-grid">
        {D.roster.map((c, i) => {
          const daysSince = Math.round((new Date("2026-05-22") - new Date(c.lastScan)) / 86400000);
          const overdue = daysSince > 28;
          return (
            <button key={c.id} className="sg-rostercard" onClick={()=>onOpen(c.id)}>
              <div className="sg-rostercard-top">
                <Bubble initials={c.avatar} size={56} tone={overdue ? "coral" : tones[i%tones.length]} />
                <div className="sg-rostercard-name">
                  <div>{c.name}</div>
                  <small>Streak · {c.streak} days</small>
                </div>
              </div>
              <div className="sg-rostercard-row"><span>Last scan</span><strong className={overdue ? "is-warn" : ""}>{daysSince}d ago</strong></div>
              <div className="sg-rostercard-row"><span>Next</span><strong className={c.nextSession==="Overdue"?"is-warn":""}>{c.nextSession}</strong></div>
              <div className="sg-rostercard-tags">{c.tags.map(t => <span key={t} className="sg-chip sg-chip-quiet">{t}</span>)}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CoachNewScan({ onSaved }) {
  const [clientId, setClientId] = useState("c-emma");
  const [date, setDate] = useState("2026-05-22");
  const [vals, setVals] = useState({ weightKg:"", bodyFatPct:"", muscleMassKg:"", visceralFat:"", waterPct:"", metabolicAge:"" });
  const [note, setNote] = useState("");
  const filled = D.metrics.every(m => vals[m.key] !== "");

  function autofill() {
    setVals({ weightKg: 66.0, bodyFatPct: 24.2, muscleMassKg: 26.6, visceralFat: 4, waterPct: 53.8, metabolicAge: 29 });
  }

  return (
    <div className="sg-page sg-newscan">
      <h1 className="sg-h1 sg-page-h">Log a scan ✦</h1>
      <p className="sg-lede">Punch in what came off the device.</p>

      <div className="sg-card">
        <div className="sg-newscan-row">
          <label className="sg-field"><span>Client</span>
            <select value={clientId} onChange={e=>setClientId(e.target.value)}>
              {D.roster.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="sg-field"><span>Date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
        </div>
        <button className="sg-btn sg-btn-ghost sg-pull-btn" type="button" onClick={autofill}>↺ Pull from device</button>
      </div>

      <div className="sg-card">
        <h2 className="sg-h2">Numbers</h2>
        <div className="sg-newscan-metrics">
          {D.metrics.map(m => (
            <label key={m.key} className="sg-field"><span>{m.label} {m.unit && <small>({m.unit})</small>}</span>
              <input inputMode="decimal" placeholder="—" value={vals[m.key]} onChange={e=>setVals({...vals, [m.key]: e.target.value})} />
            </label>
          ))}
        </div>
      </div>

      <div className="sg-card">
        <h2 className="sg-h2">A note for them</h2>
        <p className="sg-lede sg-mini">Optional. Your client sees this with the scan.</p>
        <textarea className="sg-textarea" rows="4" placeholder="What you noticed, what's next…" value={note} onChange={e=>setNote(e.target.value)} />
      </div>

      <div className="sg-newscan-foot">
        <span className="sg-newscan-state">{filled ? "✓ Ready" : "Fill all numbers"}</span>
        <button className="sg-btn sg-btn-primary" disabled={!filled} onClick={()=>onSaved(D.roster.find(c=>c.id===clientId).name.split(" ")[0])}>Save scan →</button>
      </div>
    </div>
  );
}

function CoachClient({ clientId, onToast }) {
  const isEmma = clientId === "c-emma";
  const roster = D.roster.find(c => c.id === clientId);
  const [draft, setDraft] = useState("");

  if (!isEmma) {
    return (
      <div className="sg-page">
        <h1 className="sg-h1 sg-page-h">{roster.name}</h1>
        <p className="sg-lede">Demo data is filled in for Emma. Try her profile to see the full picture.</p>
      </div>
    );
  }
  const latest = D.scans[D.scans.length-1];
  const tones = ["coral","peach","grape","mint","sky","cream"];

  return (
    <div className="sg-page">
      <section className="sg-greet">
        <div className="sg-greet-eyebrow">Client · joined {D.fmtDate(D.client.joined,{long:true,year:true})}</div>
        <h1 className="sg-h1">{D.client.name}</h1>
        <p className="sg-lede">5 scans · last on {D.fmtDate(latest.date,{long:true})}. Down {(D.scans[0].weightKg - latest.weightKg).toFixed(1)} kg and {(D.scans[0].bodyFatPct - latest.bodyFatPct).toFixed(1)}% body fat since intake. Keep going.</p>
        <div className="sg-greet-actions">
          <button className="sg-btn sg-btn-primary">+ Add scan</button>
          <button className="sg-btn sg-btn-ghost">Message Emma</button>
        </div>
        <div className="sg-greet-glyph">★</div>
      </section>

      <section className="sg-tiles">
        {D.metrics.map((m, i) => {
          const curr = latest[m.key];
          const before = D.scans[D.scans.length-2][m.key];
          const positive = m.direction === "down" ? curr < before : curr > before;
          return (
            <article key={m.key} className={cx("sg-tile", `is-${tones[i%tones.length]}`)}>
              <div className="sg-tile-label">{m.label}</div>
              <div className="sg-tile-val">{curr}<span>{m.unit}</span></div>
              <div className={cx("sg-tile-delta", positive ? "is-good" : "is-warn")}>{D.deltaStr(curr, before, m.unit)} vs last</div>
            </article>
          );
        })}
      </section>

      <section className="sg-card">
        <h2 className="sg-h2">Add a note for Emma</h2>
        <p className="sg-lede sg-mini">She sees this on her home.</p>
        <textarea className="sg-textarea" rows="3" placeholder="e.g. Squat 1RM up — deload one strength session." value={draft} onChange={e=>setDraft(e.target.value)} />
        <div className="sg-newscan-foot">
          <span></span>
          <button className="sg-btn sg-btn-primary" disabled={!draft.trim()} onClick={()=>{ onToast("Note shared with Emma."); setDraft(""); }}>Share →</button>
        </div>
      </section>

      <section className="sg-card sg-team">
        <h2 className="sg-h2">Team on this client</h2>
        <div className="sg-team-grid">
          {D.client.coaches.map((id, i) => {
            const c = D.coaches[id];
            return (
              <div key={id} className="sg-team-card">
                <Bubble initials={c.avatar} size={56} tone={["grape","mint","sky"][i] || "cream"} />
                <div className="sg-team-name">{c.name}</div>
                <div className="sg-team-role">{c.role}</div>
                {c.isHead && <span className="sg-chip">Head coach</span>}
              </div>
            );
          })}
          <button className="sg-team-card sg-team-card-add" onClick={()=>onToast("Invite link copied.")}>
            <div className="sg-team-plus">+</div>
            <div className="sg-team-name">Invite a coach</div>
            <div className="sg-team-role">Send an invite link</div>
          </button>
        </div>
      </section>
    </div>
  );
}

// ---- root ----
function App() {
  const [role, setRole] = useState(null);
  if (!role) return <Login onLogin={setRole} />;
  return role === "client" ? <ClientApp onLogout={()=>setRole(null)} /> : <CoachApp onLogout={()=>setRole(null)} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
