/* global React, ReactDOM, BODYSCAN_DATA */
// Variation 1 — Soft Sage. Editorial wellness aesthetic.
// Login + client dashboard + coach dashboard in one app.

const { useState, useMemo, useEffect, useRef } = React;
const D = window.BODYSCAN_DATA;

// ---------- tiny shared bits ----------
function cx() { return [...arguments].filter(Boolean).join(" "); }

function Avatar({ initials, size = 36, tone = "sage" }) {
  const tones = {
    sage: { bg: "#DCE5D5", fg: "#3F5237" },
    sand: { bg: "#EADFCB", fg: "#5A4630" },
    blush: { bg: "#ECD7CE", fg: "#6B4035" },
    ink:  { bg: "#2A2A28", fg: "#F4EFE6" },
  };
  const t = tones[tone] || tones.sage;
  return (
    <div className="ss-avatar" style={{ width: size, height: size, background: t.bg, color: t.fg, fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}

function Sparkline({ values, w = 220, h = 60, stroke = "#5C7A4F", fill = "rgba(92,122,79,0.12)" }) {
  if (!values || values.length < 2) return null;
  const min = Math.min(...values), max = Math.max(...values);
  const pad = 4;
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = pad + (i * (w - pad * 2)) / (values.length - 1);
    const y = h - pad - ((v - min) / span) * (h - pad * 2);
    return [x, y];
  });
  const d = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const dFill = d + ` L ${w - pad},${h - pad} L ${pad},${h - pad} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="ss-spark">
      <path d={dFill} fill={fill} />
      <path d={d} stroke={stroke} strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill={stroke} />
    </svg>
  );
}

function LineChart({ values, dates, w = 720, h = 280, label = "", unit = "", goal = null }) {
  if (!values || values.length < 2) return null;
  const pad = { t: 24, r: 24, b: 40, l: 48 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const ymin = Math.min(...values, goal ?? Infinity) - 1;
  const ymax = Math.max(...values, goal ?? -Infinity) + 1;
  const span = ymax - ymin || 1;
  const xs = values.map((_, i) => pad.l + (i * innerW) / (values.length - 1));
  const ys = values.map((v) => pad.t + innerH - ((v - ymin) / span) * innerH);
  const d = xs.map((x, i) => (i === 0 ? "M" : "L") + x + "," + ys[i]).join(" ");
  const ticks = 4;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="ss-line">
      {Array.from({ length: ticks + 1 }, (_, i) => {
        const y = pad.t + (i * innerH) / ticks;
        const v = ymax - (i * span) / ticks;
        return (
          <g key={i}>
            <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#E3DCCB" strokeDasharray="2 4" />
            <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#9A8E78">{v.toFixed(1)}</text>
          </g>
        );
      })}
      {goal != null && (
        <g>
          <line x1={pad.l} x2={w - pad.r} y1={pad.t + innerH - ((goal - ymin) / span) * innerH} y2={pad.t + innerH - ((goal - ymin) / span) * innerH} stroke="#C97A56" strokeDasharray="6 4" />
          <text x={w - pad.r} y={pad.t + innerH - ((goal - ymin) / span) * innerH - 6} textAnchor="end" fontSize="11" fill="#C97A56">goal {goal}{unit}</text>
        </g>
      )}
      <path d={d} stroke="#5C7A4F" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {xs.map((x, i) => (
        <g key={i}>
          <circle cx={x} cy={ys[i]} r="4.5" fill="#FBF7EF" stroke="#5C7A4F" strokeWidth="2" />
          <text x={x} y={h - 12} textAnchor="middle" fontSize="10.5" fill="#9A8E78">
            {D.fmtDate(dates[i])}
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---------- LOGIN ----------
function Login({ onLogin }) {
  const [mode, setMode] = useState(null); // null | 'client' | 'coach'
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");

  function pick(role) {
    setMode(role);
    setEmail(role === "client" ? "emma@hey.com" : "marcus@studio.fit");
    setPwd("••••••••");
    setErr("");
  }

  function submit(e) {
    e.preventDefault();
    if (!email.includes("@")) return setErr("That doesn't look like an email.");
    onLogin(mode);
  }

  return (
    <div className="ss-login">
      <header className="ss-login-head">
        <span className="ss-logo">
          <span className="ss-logo-mark">◐</span> rooted
        </span>
        <span className="ss-login-sub">a body, read kindly</span>
      </header>

      {!mode && (
        <div className="ss-login-card">
          <h1 className="ss-display">Welcome back.</h1>
          <p className="ss-lede">Sign in to see your scans, or to log a session with one of your clients.</p>
          <div className="ss-persona-row">
            <button className="ss-persona" onClick={() => pick("client")}>
              <Avatar initials="EL" size={56} tone="sage" />
              <div>
                <div className="ss-persona-name">I'm Emma</div>
                <div className="ss-persona-role">Client · 5 scans</div>
              </div>
              <span className="ss-arrow">→</span>
            </button>
            <button className="ss-persona" onClick={() => pick("coach")}>
              <Avatar initials="MB" size={56} tone="sand" />
              <div>
                <div className="ss-persona-name">I'm Marcus</div>
                <div className="ss-persona-role">Head coach · 6 clients</div>
              </div>
              <span className="ss-arrow">→</span>
            </button>
          </div>
          <div className="ss-login-foot">
            <span>New here?</span><a href="#" onClick={(e)=>e.preventDefault()}>Request an invite</a>
          </div>
        </div>
      )}

      {mode && (
        <form className="ss-login-card" onSubmit={submit}>
          <button type="button" className="ss-back" onClick={() => setMode(null)}>← choose another</button>
          <h1 className="ss-display">Sign in as {mode}</h1>
          <label className="ss-field">
            <span>Email</span>
            <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} autoFocus />
          </label>
          <label className="ss-field">
            <span>Password</span>
            <input type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} />
          </label>
          {err && <div className="ss-err">{err}</div>}
          <button className="ss-btn ss-btn-primary" type="submit">Sign in →</button>
          <div className="ss-login-foot"><a href="#" onClick={(e)=>e.preventDefault()}>Forgot password</a></div>
        </form>
      )}

      <footer className="ss-login-foot-out">© 2026 rooted · made with care</footer>
    </div>
  );
}

// ---------- CLIENT APP ----------
function ClientApp({ onLogout }) {
  const [tab, setTab] = useState("overview");
  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "progress", label: "Progress" },
    { id: "compare", label: "Compare scans" },
    { id: "goals", label: "Goals" },
  ];
  return (
    <div className="ss-app">
      <TopBar
        title="rooted"
        right={
          <div className="ss-top-right">
            <Avatar initials={D.client.avatar} tone="sage" />
            <div className="ss-top-meta">
              <div className="ss-top-name">{D.client.name}</div>
              <div className="ss-top-sub">Client</div>
            </div>
            <button className="ss-link" onClick={onLogout}>Sign out</button>
          </div>
        }
      />
      <nav className="ss-tabs">
        {tabs.map(t => (
          <button key={t.id} className={cx("ss-tab", tab===t.id && "is-on")} onClick={()=>setTab(t.id)}>{t.label}</button>
        ))}
      </nav>
      <main className="ss-main">
        {tab === "overview" && <ClientOverview />}
        {tab === "progress" && <ClientProgress />}
        {tab === "compare" && <ClientCompare />}
        {tab === "goals" && <ClientGoals />}
      </main>
    </div>
  );
}

function TopBar({ title, right }) {
  return (
    <header className="ss-topbar">
      <div className="ss-topbar-left">
        <span className="ss-logo"><span className="ss-logo-mark">◐</span> {title}</span>
      </div>
      {right}
    </header>
  );
}

function ClientOverview() {
  const latest = D.scans[D.scans.length - 1];
  const prev = D.scans[D.scans.length - 2];
  const head = D.coaches[D.client.headCoach];

  return (
    <div className="ss-grid">
      <section className="ss-hero">
        <div className="ss-hero-eyebrow">Last scan · {D.fmtDate(latest.date, { long: true, year: true })}</div>
        <h1 className="ss-display ss-hero-h">
          Good morning, <span className="ss-italic">{D.client.firstName}.</span>
        </h1>
        <p className="ss-lede">
          You're down <strong>{(D.scans[0].weightKg - latest.weightKg).toFixed(1)} kg</strong> since your first scan in November, and your muscle mass keeps climbing. Steady wins.
        </p>
        <div className="ss-hero-actions">
          <button className="ss-btn ss-btn-primary">Download report</button>
          <button className="ss-btn ss-btn-ghost">Book next scan</button>
        </div>
      </section>

      <aside className="ss-coachcard">
        <div className="ss-coachcard-head">Your coaches</div>
        <ul className="ss-coachlist">
          {D.client.coaches.map(id => {
            const c = D.coaches[id];
            return (
              <li key={id}>
                <Avatar initials={c.avatar} tone={c.isHead ? "sand" : "sage"} size={40} />
                <div className="ss-coach-meta">
                  <div className="ss-coach-name">{c.name} {c.isHead && <span className="ss-pill">Head</span>}</div>
                  <div className="ss-coach-role">{c.role}</div>
                </div>
              </li>
            );
          })}
        </ul>
        <button className="ss-link ss-coach-msg">Message your team →</button>
      </aside>

      <section className="ss-metrics">
        {D.metrics.map(m => {
          const series = D.scans.map(s => s[m.key]);
          const curr = latest[m.key];
          const before = prev[m.key];
          const goalVal = m.goalKey ? D.client.goals[m.goalKey] : null;
          const positive = m.direction === "down" ? curr < before : curr > before;
          return (
            <article key={m.key} className="ss-metric">
              <div className="ss-metric-top">
                <span className="ss-metric-label">{m.label}</span>
                <span className={cx("ss-delta", positive ? "is-good" : "is-warn")}>
                  {D.deltaStr(curr, before, m.unit)} <small>vs last</small>
                </span>
              </div>
              <div className="ss-metric-val">
                <span className="ss-num">{curr}</span><span className="ss-unit">{m.unit}</span>
              </div>
              <Sparkline values={series} />
              {goalVal != null && (
                <div className="ss-metric-goal">Goal · {goalVal}{m.unit}</div>
              )}
            </article>
          );
        })}
      </section>

      <section className="ss-note">
        <div className="ss-note-head">
          <Avatar initials={D.coaches[latest.coachId].avatar} tone="sand" size={40} />
          <div>
            <div className="ss-note-by">{D.coaches[latest.coachId].name}</div>
            <div className="ss-note-meta">After your scan on {D.fmtDate(latest.date, {long: true})}</div>
          </div>
        </div>
        <p className="ss-note-body">{latest.notes}</p>
      </section>

      <section className="ss-timeline">
        <div className="ss-section-head"><h2 className="ss-h2">Your scan story</h2><span className="ss-section-sub">6 months · 5 scans</span></div>
        <ol className="ss-tl">
          {[...D.scans].reverse().map((s, i) => (
            <li key={s.id}>
              <span className="ss-tl-dot" />
              <div className="ss-tl-card">
                <div className="ss-tl-date">{D.fmtDate(s.date, {long:true, year:true})}</div>
                <div className="ss-tl-row">
                  <span>{s.weightKg} kg</span>
                  <span>{s.bodyFatPct}% fat</span>
                  <span>{s.muscleMassKg} kg muscle</span>
                  <span className="ss-tl-coach">w/ {D.coaches[s.coachId].firstName}</span>
                </div>
              </div>
            </li>
          ))}
        </ol>
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
    <div className="ss-progress">
      <div className="ss-section-head">
        <h2 className="ss-h2">Progress</h2>
        <span className="ss-section-sub">Hold the line. Tiny consistent wins.</span>
      </div>
      <div className="ss-metric-toggle">
        {D.metrics.map(x => (
          <button key={x.key} className={cx("ss-toggle", metric===x.key && "is-on")} onClick={()=>setMetric(x.key)}>{x.label}</button>
        ))}
      </div>
      <div className="ss-chart-card">
        <div className="ss-chart-head">
          <div>
            <div className="ss-chart-label">{m.label}</div>
            <div className="ss-chart-val">
              <span className="ss-num">{series[series.length-1]}</span>
              <span className="ss-unit">{m.unit}</span>
              <span className="ss-chart-delta">
                {D.deltaStr(series[series.length-1], series[0], m.unit)} since first scan
              </span>
            </div>
          </div>
          <div className="ss-chart-range">
            <span className="is-on">6m</span><span>3m</span><span>1m</span>
          </div>
        </div>
        <LineChart values={series} dates={dates} unit={m.unit} goal={goal} />
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
    <div className="ss-compare">
      <div className="ss-section-head">
        <h2 className="ss-h2">Compare scans</h2>
        <span className="ss-section-sub">Pick any two scans to see what changed.</span>
      </div>
      <div className="ss-compare-pickers">
        <ScanPicker label="Then" scans={D.scans} value={a} onChange={setA} />
        <span className="ss-vs">vs</span>
        <ScanPicker label="Now" scans={D.scans} value={b} onChange={setB} />
      </div>
      <table className="ss-compare-table">
        <thead>
          <tr>
            <th>Metric</th>
            <th>{D.fmtDate(sA.date, {long:true})}</th>
            <th>{D.fmtDate(sB.date, {long:true})}</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {D.metrics.map(m => {
            const va = sA[m.key], vb = sB[m.key];
            const positive = m.direction === "down" ? vb < va : vb > va;
            return (
              <tr key={m.key}>
                <td>{m.label}</td>
                <td className="ss-num-cell">{va}{m.unit}</td>
                <td className="ss-num-cell">{vb}{m.unit}</td>
                <td className={cx("ss-num-cell", positive ? "is-good" : "is-warn")}>
                  {D.deltaStr(vb, va, m.unit)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ScanPicker({ label, scans, value, onChange }) {
  return (
    <label className="ss-picker">
      <span className="ss-picker-label">{label}</span>
      <select value={value} onChange={(e)=>onChange(e.target.value)}>
        {scans.map(s => (
          <option key={s.id} value={s.id}>{D.fmtDate(s.date, {long:true, year:true})}</option>
        ))}
      </select>
    </label>
  );
}

function ClientGoals() {
  const latest = D.scans[D.scans.length - 1];
  const start = D.scans[0];
  return (
    <div className="ss-goals">
      <div className="ss-section-head">
        <h2 className="ss-h2">Your goals</h2>
        <span className="ss-section-sub">Set with Marcus on {D.fmtDate(D.client.joined, {long:true, year:true})}.</span>
      </div>
      <div className="ss-goal-grid">
        {D.metrics.filter(m => m.goalKey).map(m => {
          const curr = latest[m.key];
          const target = D.client.goals[m.goalKey];
          const startV = start[m.key];
          const totalRange = Math.abs(target - startV) || 1;
          const traveled = Math.abs(curr - startV);
          const pct = Math.min(100, Math.max(0, (traveled / totalRange) * 100));
          return (
            <div key={m.key} className="ss-goal-card">
              <div className="ss-goal-head">
                <div className="ss-goal-label">{m.label}</div>
                <div className="ss-goal-pct">{Math.round(pct)}%</div>
              </div>
              <div className="ss-goal-bar">
                <div className="ss-goal-bar-fill" style={{ width: pct + "%" }} />
              </div>
              <div className="ss-goal-row">
                <span><small>Start</small> <strong>{startV}{m.unit}</strong></span>
                <span><small>Now</small> <strong>{curr}{m.unit}</strong></span>
                <span><small>Goal</small> <strong>{target}{m.unit}</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------- COACH APP ----------
function CoachApp({ onLogout }) {
  const [tab, setTab] = useState("roster");
  const [selectedClient, setSelectedClient] = useState(null);
  const [toast, setToast] = useState("");

  function openClient(id) { setSelectedClient(id); setTab("client"); }
  function pingToast(msg) { setToast(msg); setTimeout(()=>setToast(""), 2400); }

  return (
    <div className="ss-app">
      <TopBar
        title="rooted · studio"
        right={
          <div className="ss-top-right">
            <Avatar initials="MB" tone="sand" />
            <div className="ss-top-meta">
              <div className="ss-top-name">Marcus Bell</div>
              <div className="ss-top-sub">Head coach</div>
            </div>
            <button className="ss-link" onClick={onLogout}>Sign out</button>
          </div>
        }
      />
      <nav className="ss-tabs">
        <button className={cx("ss-tab", tab==="roster" && "is-on")} onClick={()=>setTab("roster")}>Roster</button>
        <button className={cx("ss-tab", tab==="add" && "is-on")} onClick={()=>setTab("add")}>+ New scan</button>
        {selectedClient && <button className={cx("ss-tab", tab==="client" && "is-on")} onClick={()=>setTab("client")}>{D.roster.find(c=>c.id===selectedClient).name.split(" ")[0]}</button>}
      </nav>
      <main className="ss-main">
        {tab === "roster" && <CoachRoster onOpen={openClient} />}
        {tab === "add" && <CoachNewScan onSaved={(name)=>{ pingToast(`Scan saved for ${name}.`); setTab("roster"); }} />}
        {tab === "client" && selectedClient && <CoachClientDetail clientId={selectedClient} onToast={pingToast} />}
      </main>
      {toast && <div className="ss-toast">{toast}</div>}
    </div>
  );
}

function CoachRoster({ onOpen }) {
  return (
    <div>
      <div className="ss-section-head">
        <h2 className="ss-h2">Your clients</h2>
        <span className="ss-section-sub">{D.roster.length} active · 1 overdue</span>
      </div>
      <ul className="ss-roster">
        {D.roster.map(c => {
          const daysSince = Math.round((new Date("2026-05-22") - new Date(c.lastScan)) / 86400000);
          const overdue = daysSince > 28;
          return (
            <li key={c.id} className="ss-roster-row" onClick={()=>onOpen(c.id)}>
              <Avatar initials={c.avatar} tone={overdue ? "blush" : "sage"} size={48} />
              <div className="ss-roster-name">
                <div>{c.name}</div>
                <div className="ss-roster-tags">{c.tags.map(t => <span key={t} className="ss-pill ss-pill-quiet">{t}</span>)}</div>
              </div>
              <div className="ss-roster-cell">
                <small>Last scan</small>
                <strong className={overdue ? "is-warn" : ""}>{daysSince}d ago</strong>
              </div>
              <div className="ss-roster-cell">
                <small>Trend</small>
                <strong className={c.trend === "down" ? "is-good" : c.trend === "up" ? "is-good" : ""}>
                  {c.trend === "down" ? "↘ fat loss" : c.trend === "up" ? "↗ muscle" : "→ steady"}
                </strong>
              </div>
              <div className="ss-roster-cell">
                <small>Next session</small>
                <strong className={c.nextSession === "Overdue" ? "is-warn" : ""}>{c.nextSession}</strong>
              </div>
              <span className="ss-arrow">→</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function CoachNewScan({ onSaved }) {
  const [clientId, setClientId] = useState("c-emma");
  const [date, setDate] = useState("2026-05-22");
  const [vals, setVals] = useState({ weightKg:"", bodyFatPct:"", muscleMassKg:"", visceralFat:"", waterPct:"", metabolicAge:"" });
  const [note, setNote] = useState("");
  const filled = D.metrics.every(m => vals[m.key] !== "");

  function setVal(k, v) { setVals({ ...vals, [k]: v }); }
  function autofill() {
    setVals({ weightKg: 66.0, bodyFatPct: 24.2, muscleMassKg: 26.6, visceralFat: 4, waterPct: 53.8, metabolicAge: 29 });
  }
  function save(e) {
    e.preventDefault();
    const client = D.roster.find(c => c.id === clientId);
    onSaved(client.name.split(" ")[0]);
  }

  return (
    <form onSubmit={save} className="ss-newscan">
      <div className="ss-section-head">
        <h2 className="ss-h2">Log a new scan</h2>
        <span className="ss-section-sub">Takes about 60 seconds. Auto-syncs with your client.</span>
      </div>
      <div className="ss-newscan-grid">
        <label className="ss-field">
          <span>Client</span>
          <select value={clientId} onChange={(e)=>setClientId(e.target.value)}>
            {D.roster.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <label className="ss-field">
          <span>Scan date</span>
          <input type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
        </label>
        <button type="button" className="ss-btn ss-btn-ghost ss-newscan-autofill" onClick={autofill}>
          ↺ pull from device
        </button>
      </div>

      <div className="ss-section-head ss-section-mini">
        <h3 className="ss-h3">Measurements</h3>
      </div>
      <div className="ss-newscan-metrics">
        {D.metrics.map(m => (
          <label key={m.key} className="ss-field">
            <span>{m.label} <small>{m.unit && `(${m.unit})`}</small></span>
            <input
              inputMode="decimal"
              placeholder="—"
              value={vals[m.key]}
              onChange={(e)=>setVal(m.key, e.target.value)}
            />
          </label>
        ))}
      </div>

      <div className="ss-section-head ss-section-mini">
        <h3 className="ss-h3">Coach note</h3>
        <span className="ss-section-sub">Optional. Your client will see this with the scan.</span>
      </div>
      <textarea
        className="ss-textarea"
        rows="4"
        placeholder="What did you notice? What's the plan next block?"
        value={note}
        onChange={(e)=>setNote(e.target.value)}
      />

      <div className="ss-newscan-foot">
        <span className="ss-newscan-state">{filled ? "Ready to save" : "Fill all metrics to save"}</span>
        <button className="ss-btn ss-btn-primary" disabled={!filled}>Save scan →</button>
      </div>
    </form>
  );
}

function CoachClientDetail({ clientId, onToast }) {
  const isEmma = clientId === "c-emma";
  const roster = D.roster.find(c => c.id === clientId);
  const [draft, setDraft] = useState("");

  if (!isEmma) {
    return (
      <div className="ss-empty">
        <h2 className="ss-h2">{roster.name}</h2>
        <p className="ss-lede">Detailed history loads here. (Demo data populated only for Emma — try her profile.)</p>
      </div>
    );
  }
  const latest = D.scans[D.scans.length - 1];
  return (
    <div className="ss-grid">
      <section className="ss-hero">
        <div className="ss-hero-eyebrow">Client · joined {D.fmtDate(D.client.joined, {long:true, year:true})}</div>
        <h1 className="ss-display ss-hero-h">{D.client.name}</h1>
        <p className="ss-lede">
          5 scans · last on {D.fmtDate(latest.date, {long:true})}. Down {(D.scans[0].weightKg - latest.weightKg).toFixed(1)} kg and {(D.scans[0].bodyFatPct - latest.bodyFatPct).toFixed(1)}% body fat since intake.
        </p>
        <div className="ss-hero-actions">
          <button className="ss-btn ss-btn-primary">+ Add scan</button>
          <button className="ss-btn ss-btn-ghost">Message Emma</button>
        </div>
      </section>
      <aside className="ss-coachcard">
        <div className="ss-coachcard-head">Team on this client</div>
        <ul className="ss-coachlist">
          {D.client.coaches.map(id => {
            const c = D.coaches[id];
            return (
              <li key={id}>
                <Avatar initials={c.avatar} tone={c.isHead ? "sand" : "sage"} size={40} />
                <div className="ss-coach-meta">
                  <div className="ss-coach-name">{c.name} {c.isHead && <span className="ss-pill">Head</span>}</div>
                  <div className="ss-coach-role">{c.role}</div>
                </div>
              </li>
            );
          })}
        </ul>
        <button className="ss-link ss-coach-msg">+ Invite another coach</button>
      </aside>
      <section className="ss-metrics">
        {D.metrics.map(m => {
          const series = D.scans.map(s => s[m.key]);
          const curr = latest[m.key];
          const before = D.scans[D.scans.length-2][m.key];
          const positive = m.direction === "down" ? curr < before : curr > before;
          return (
            <article key={m.key} className="ss-metric">
              <div className="ss-metric-top">
                <span className="ss-metric-label">{m.label}</span>
                <span className={cx("ss-delta", positive ? "is-good" : "is-warn")}>{D.deltaStr(curr, before, m.unit)}</span>
              </div>
              <div className="ss-metric-val"><span className="ss-num">{curr}</span><span className="ss-unit">{m.unit}</span></div>
              <Sparkline values={series} />
            </article>
          );
        })}
      </section>
      <section className="ss-note ss-note-edit">
        <div className="ss-note-head">
          <Avatar initials="MB" tone="sand" size={40} />
          <div>
            <div className="ss-note-by">Add a note for Emma</div>
            <div className="ss-note-meta">She'll see this on her overview.</div>
          </div>
        </div>
        <textarea
          rows="3"
          className="ss-textarea"
          placeholder="e.g. Squat 1RM up — let's deload one strength session."
          value={draft}
          onChange={(e)=>setDraft(e.target.value)}
        />
        <div className="ss-note-foot">
          <button className="ss-btn ss-btn-primary" disabled={!draft.trim()} onClick={()=>{ onToast("Note shared with Emma."); setDraft(""); }}>Share with Emma</button>
        </div>
      </section>
    </div>
  );
}

// ---------- ROOT ----------
function App() {
  const [role, setRole] = useState(null);
  if (!role) return <Login onLogin={setRole} />;
  return role === "client" ? <ClientApp onLogout={()=>setRole(null)} /> : <CoachApp onLogout={()=>setRole(null)} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
