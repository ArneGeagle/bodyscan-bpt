/* global React, ReactDOM, BODYSCAN_DATA */
// Variation 3 — Mint Fresh. Data-rich friendly with sidebar nav.

const { useState, useMemo } = React;
const D = window.BODYSCAN_DATA;
const cx = (...a) => a.filter(Boolean).join(" ");

function Avatar({ initials, size = 36, accent }) {
  return (
    <div className="mf-avatar" style={{ width: size, height: size, fontSize: size * 0.4, background: accent || "#D8EFE4", color: "#1F4D3A" }}>
      {initials}
    </div>
  );
}

function Ring({ value, max, size = 72, stroke = 8, color = "#3FA77F", track = "#E4F0EA", label }) {
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
        {label && <small className="mf-ring-label">{label}</small>}
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
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} className="mf-bigline">
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
          <h1 className="mf-h1">Your body, in numbers you can read.</h1>
          <p className="mf-lede">Every scan, every milestone, everything your coach left in the margins — all in one calm dashboard.</p>
          <ul className="mf-pitch-list">
            <li><span className="mf-tick">✓</span> Track 6 metrics across every scan</li>
            <li><span className="mf-tick">✓</span> Compare any two sessions side-by-side</li>
            <li><span className="mf-tick">✓</span> Coaches add notes; you see them instantly</li>
          </ul>
        </div>
        <div className="mf-login-stats">
          <div><b className="mf-mono">2,840</b><small>scans logged</small></div>
          <div><b className="mf-mono">96%</b><small>hit their first milestone</small></div>
        </div>
      </aside>

      <main className="mf-login-main">
        <div className="mf-login-card">
          {!mode ? (
            <>
              <h2 className="mf-h2">Sign in</h2>
              <p className="mf-sub">Choose your demo account.</p>
              <div className="mf-persona-row">
                <button className="mf-persona" onClick={()=>pick("client")}>
                  <Avatar initials="EL" size={48} />
                  <div>
                    <div className="mf-persona-name">Emma Larsen</div>
                    <div className="mf-persona-role">Client · emma@hey.com</div>
                  </div>
                  <span className="mf-kbd">→</span>
                </button>
                <button className="mf-persona" onClick={()=>pick("coach")}>
                  <Avatar initials="MB" size={48} accent="#F0E1D2" />
                  <div>
                    <div className="mf-persona-name">Marcus Bell</div>
                    <div className="mf-persona-role">Head coach · marcus@studio.fit</div>
                  </div>
                  <span className="mf-kbd">→</span>
                </button>
              </div>
              <div className="mf-login-foot"><span className="mf-divider"><span>or</span></span></div>
              <label className="mf-field"><span>Email</span><input type="email" placeholder="you@studio.fit" /></label>
              <label className="mf-field"><span>Password</span><input type="password" placeholder="••••••••" /></label>
              <button className="mf-btn mf-btn-primary" onClick={()=>onLogin("client")}>Sign in</button>
            </>
          ) : (
            <form onSubmit={(e)=>{ e.preventDefault(); onLogin(mode); }}>
              <button type="button" className="mf-back" onClick={()=>setMode(null)}>← Back</button>
              <h2 className="mf-h2">{mode === "client" ? "Welcome back, Emma" : "Welcome back, Marcus"}</h2>
              <p className="mf-sub">Signing in as a {mode}.</p>
              <label className="mf-field"><span>Email</span><input value={email} onChange={(e)=>setEmail(e.target.value)} autoFocus /></label>
              <label className="mf-field"><span>Password</span><input type="password" value={pwd} onChange={(e)=>setPwd(e.target.value)} /></label>
              <label className="mf-check"><input type="checkbox" defaultChecked /> Remember me on this device</label>
              <button className="mf-btn mf-btn-primary" type="submit">Continue →</button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

// ---- App shell ----
function Shell({ role, sections, active, setActive, onLogout, children }) {
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
              <span className="mf-side-icon">{s.icon}</span>
              <span>{s.label}</span>
              {s.badge && <span className="mf-side-badge">{s.badge}</span>}
            </button>
          ))}
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
      <main className="mf-content">{children}</main>
    </div>
  );
}

// ---- Client app ----
function ClientApp({ onLogout }) {
  const [active, setActive] = useState("dashboard");
  const sections = [
    { id: "dashboard", label: "Dashboard", icon: "◐" },
    { id: "progress", label: "Progress", icon: "↗" },
    { id: "compare", label: "Compare", icon: "⇋" },
    { id: "goals", label: "Goals", icon: "◉" },
  ];
  return (
    <Shell role="client" sections={sections} active={active} setActive={setActive} onLogout={onLogout}>
      {active === "dashboard" && <ClientDashboard />}
      {active === "progress" && <ClientProgress />}
      {active === "compare" && <ClientCompare />}
      {active === "goals" && <ClientGoals />}
    </Shell>
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

function ClientDashboard() {
  const latest = D.scans[D.scans.length - 1];
  const prev = D.scans[D.scans.length - 2];
  return (
    <>
      <PageHeader
        eyebrow={"LAST SCAN · " + D.fmtDate(latest.date, {long:true, year:true}).toUpperCase()}
        title={`Hi ${D.client.firstName}. You're trending right.`}
        sub={`Down ${(D.scans[0].weightKg - latest.weightKg).toFixed(1)} kg and ${(D.scans[0].bodyFatPct - latest.bodyFatPct).toFixed(1)}% body fat since your first scan.`}
        actions={<>
          <button className="mf-btn mf-btn-ghost">Export PDF</button>
          <button className="mf-btn mf-btn-primary">Book next scan</button>
        </>}
      />

      <section className="mf-stats">
        {D.metrics.map(m => {
          const curr = latest[m.key];
          const before = prev[m.key];
          const positive = m.direction === "down" ? curr < before : curr > before;
          return (
            <div key={m.key} className="mf-stat">
              <div className="mf-stat-label">{m.label}</div>
              <div className="mf-stat-val mf-mono">{curr}<small>{m.unit}</small></div>
              <div className={cx("mf-stat-delta", positive ? "is-good" : "is-warn")}>
                {D.deltaStr(curr, before, m.unit)} <span>vs last</span>
              </div>
              <Spark values={D.scans.map(s => s[m.key])} />
            </div>
          );
        })}
      </section>

      <div className="mf-row">
        <section className="mf-panel mf-flex-2">
          <h2 className="mf-h3">Latest coach note</h2>
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
          <h2 className="mf-h3">Your coaches</h2>
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
          <h2 className="mf-h3">Scan history</h2>
          <span className="mf-mono mf-sub">{D.scans.length} sessions · 6 months</span>
        </div>
        <table className="mf-table">
          <thead>
            <tr>
              <th>Date</th><th>Weight</th><th>Body fat</th><th>Muscle</th><th>Visceral</th><th>Water</th><th>Met. age</th><th>Coach</th>
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
  return (
    <>
      <PageHeader title="Progress" sub="Every metric, every scan, plotted." />
      <div className="mf-tabs">
        {D.metrics.map(x => (
          <button key={x.key} className={cx("mf-tab", metric===x.key && "is-on")} onClick={()=>setMetric(x.key)}>{x.label}</button>
        ))}
      </div>
      <section className="mf-panel">
        <div className="mf-chart-head">
          <div>
            <div className="mf-eyebrow">{m.label.toUpperCase()}</div>
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
  return (
    <>
      <PageHeader title="Compare scans" sub="Pick two sessions to see exactly what shifted." />
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
      <section className="mf-panel mf-no-padding">
        <table className="mf-table mf-compare-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>{D.fmtDate(sA.date,{long:true})}</th>
              <th>{D.fmtDate(sB.date,{long:true})}</th>
              <th>Δ</th>
              <th>Direction</th>
            </tr>
          </thead>
          <tbody>
            {D.metrics.map(m => {
              const va = sA[m.key], vb = sB[m.key];
              const positive = m.direction === "down" ? vb < va : vb > va;
              return (
                <tr key={m.key}>
                  <td>{m.label}</td>
                  <td className="mf-mono">{va}{m.unit}</td>
                  <td className="mf-mono">{vb}{m.unit}</td>
                  <td className={cx("mf-mono", positive ? "is-good" : "is-warn")}>{D.deltaStr(vb, va, m.unit)}</td>
                  <td className={cx("mf-mono", positive ? "is-good" : "is-warn")}>{positive ? "▼ better" : "▲ watch"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </>
  );
}

function ClientGoals() {
  const latest = D.scans[D.scans.length - 1];
  const start = D.scans[0];
  return (
    <>
      <PageHeader title="Goals" sub={`Set with Marcus on ${D.fmtDate(D.client.joined, {long:true, year:true})}.`} />
      <div className="mf-goal-grid">
        {D.metrics.filter(m => m.goalKey).map(m => {
          const curr = latest[m.key];
          const target = D.client.goals[m.goalKey];
          const startV = start[m.key];
          const totalRange = Math.abs(target - startV) || 1;
          const traveled = Math.abs(curr - startV);
          const pct = Math.min(100, Math.max(0, (traveled / totalRange) * 100));
          return (
            <div key={m.key} className="mf-panel mf-goal-card">
              <Ring value={pct} max={100} size={96} stroke={9} />
              <div className="mf-goal-meta">
                <div className="mf-goal-label">{m.label}</div>
                <div className="mf-goal-row"><span>Start</span><span className="mf-mono">{startV}{m.unit}</span></div>
                <div className="mf-goal-row"><span>Now</span><span className="mf-mono">{curr}{m.unit}</span></div>
                <div className="mf-goal-row"><span>Goal</span><span className="mf-mono">{target}{m.unit}</span></div>
                <div className="mf-goal-bar"><div className="mf-goal-bar-fill" style={{ width: pct + "%" }} /></div>
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
  const [active, setActive] = useState("roster");
  const [selectedClient, setSelectedClient] = useState("c-emma");
  const [toast, setToast] = useState("");
  function pingToast(msg) { setToast(msg); setTimeout(()=>setToast(""), 2400); }
  const sections = [
    { id: "roster", label: "Clients", icon: "☰", badge: D.roster.length },
    { id: "add", label: "New scan", icon: "+" },
    { id: "messages", label: "Messages", icon: "✉", badge: 3 },
  ];
  return (
    <Shell role="coach" sections={sections} active={active} setActive={setActive} onLogout={onLogout}>
      {active === "roster" && <CoachRoster selected={selectedClient} onSelect={setSelectedClient} onToast={pingToast} />}
      {active === "add" && <CoachNewScan onSaved={(n) => { pingToast(`Saved · ${n} will see it now.`); setActive("roster"); }} />}
      {active === "messages" && <CoachMessages />}
      {toast && <div className="mf-toast">{toast}</div>}
    </Shell>
  );
}

function CoachRoster({ selected, onSelect, onToast }) {
  return (
    <div className="mf-roster">
      <aside className="mf-roster-list">
        <div className="mf-roster-head">
          <input className="mf-search" placeholder="Search clients…" />
        </div>
        <ul>
          {D.roster.map(c => {
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
        <h2 className="mf-h2">{roster.name}</h2>
        <p className="mf-sub">Full data is populated for Emma Larsen. Select her to see the complete client view.</p>
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
        sub={`5 scans · last on ${D.fmtDate(latest.date,{long:true})}. Down ${(D.scans[0].weightKg - latest.weightKg).toFixed(1)} kg and ${(D.scans[0].bodyFatPct - latest.bodyFatPct).toFixed(1)}% body fat since intake.`}
        actions={<>
          <button className="mf-btn mf-btn-ghost">Message Emma</button>
          <button className="mf-btn mf-btn-primary">+ Add scan</button>
        </>}
      />

      <section className="mf-stats">
        {D.metrics.map(m => {
          const curr = latest[m.key];
          const before = prev[m.key];
          const positive = m.direction === "down" ? curr < before : curr > before;
          return (
            <div key={m.key} className="mf-stat">
              <div className="mf-stat-label">{m.label}</div>
              <div className="mf-stat-val mf-mono">{curr}<small>{m.unit}</small></div>
              <div className={cx("mf-stat-delta", positive ? "is-good" : "is-warn")}>{D.deltaStr(curr, before, m.unit)} <span>vs last</span></div>
              <Spark values={D.scans.map(s => s[m.key])} />
            </div>
          );
        })}
      </section>

      <div className="mf-row">
        <section className="mf-panel mf-flex-2">
          <h2 className="mf-h3">Add a note for Emma</h2>
          <p className="mf-sub">She'll see this on her dashboard. Last note shared on {D.fmtDate(latest.date,{long:true})}.</p>
          <textarea className="mf-textarea" rows="3" placeholder="What did you notice? What's next?" value={draft} onChange={e=>setDraft(e.target.value)} />
          <div className="mf-panel-foot">
            <span className="mf-sub mf-mono">{draft.length} chars</span>
            <button className="mf-btn mf-btn-primary" disabled={!draft.trim()} onClick={()=>{ onToast("Note shared with Emma."); setDraft(""); }}>Share with Emma</button>
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
          <button className="mf-btn mf-btn-ghost mf-full" onClick={()=>onToast("Invite link copied.")}>+ Invite a coach</button>
        </section>
      </div>

      <section className="mf-panel">
        <div className="mf-panel-head">
          <h2 className="mf-h3">Scan history</h2>
          <span className="mf-mono mf-sub">{D.scans.length} sessions</span>
        </div>
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

  function autofill() {
    setVals({ weightKg: 66.0, bodyFatPct: 24.2, muscleMassKg: 26.6, visceralFat: 4, waterPct: 53.8, metabolicAge: 29 });
  }

  return (
    <>
      <PageHeader title="Log a new scan" sub="60 seconds. Auto-syncs to your client's dashboard the moment you save." />
      <section className="mf-panel">
        <div className="mf-form-row">
          <label className="mf-field"><span>Client</span>
            <select value={clientId} onChange={e=>setClientId(e.target.value)}>
              {D.roster.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="mf-field"><span>Scan date</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} /></label>
          <button type="button" className="mf-btn mf-btn-ghost mf-autofill" onClick={autofill}>↺ Pull from device</button>
        </div>
      </section>

      <section className="mf-panel">
        <h2 className="mf-h3">Measurements</h2>
        <div className="mf-metrics-grid">
          {D.metrics.map(m => (
            <label key={m.key} className="mf-field">
              <span>{m.label} <small className="mf-mono">{m.unit && `(${m.unit})`}</small></span>
              <input inputMode="decimal" placeholder="—" value={vals[m.key]} onChange={e=>setVals({...vals, [m.key]: e.target.value})} />
            </label>
          ))}
        </div>
      </section>

      <section className="mf-panel">
        <h2 className="mf-h3">Coach note <small className="mf-sub">(optional)</small></h2>
        <textarea className="mf-textarea" rows="4" placeholder="What did you notice? What's the plan for next block?" value={note} onChange={e=>setNote(e.target.value)} />
        <div className="mf-panel-foot">
          <span className="mf-sub mf-mono">{filled ? "✓ All measurements captured" : `${D.metrics.filter(m=>vals[m.key]==="").length} fields remaining`}</span>
          <button className="mf-btn mf-btn-primary" disabled={!filled} onClick={()=>onSaved(D.roster.find(c=>c.id===clientId).name.split(" ")[0])}>Save scan →</button>
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
