import { useState, useEffect } from 'react'
import { readAuth, writeAuth, watchAuthExpiry, expiryLabel } from '../../lib/adminAuth'
import { C, LEVELS } from '../../lib/constants'
import { Inp, Btn, Spin, PBar, Badge } from '../../components/UI'
import { sb } from '../../lib/supabase'

// ──────────────────────────────────────────────────────────────
// GC Multiverse — a single command centre for overall student activity & success.
// Tab per data source (GC Buddy now; Attendance / Gate Tests / EMI to follow) and
// a final cumulative success score. Each data tab has 2 sub-tabs: aggregate
// metrics + a per-student list.
// ──────────────────────────────────────────────────────────────
const now = () => Date.now()
const day = 86400000
const dAgo = dt => { if (!dt) return 'Never'; const d = Math.floor((now() - new Date(dt).getTime()) / day); return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d}d ago` }

// The GC Buddy journey, in order. `count` surfaces a depth number inside the cell.
const STEPS = [
  { key: 'step_active',    short: 'Active',    icon: '🟢', desc: 'Logged in & used the app' },
  { key: 'step_placement', short: 'Placement', icon: '🎯', desc: 'Took the placement test' },
  { key: 'step_vocab',     short: 'Vocab',     icon: '🔤', desc: 'Started the vocabulary plan', count: 'vocab_day', unit: 'd' },
  { key: 'step_lesson',    short: 'Lesson',    icon: '📘', desc: 'Completed a curriculum topic', count: 'topics_count' },
  { key: 'step_exercise',  short: 'Exercise',  icon: '💪', desc: 'Completed a Learn Hub exercise set', count: 'ex_count' },
  { key: 'step_listening', short: 'Listening', icon: '🎙️', desc: 'Played listening practice', count: 'listening_count' },
  { key: 'step_test',      short: 'Daily Test',icon: '📝', desc: 'Submitted a daily test', count: 'test_count' },
  { key: 'step_tutor',     short: 'AI Tutor',  icon: '🇩🇪', desc: 'Chatted with GC Buddy (Lena)', count: 'msg_count' },
  { key: 'step_interview', short: 'Interview', icon: '🎭', desc: 'Started a mock interview' },
  { key: 'step_levelup',   short: 'Level Up',  icon: '🎓', desc: 'Promoted past A1' },
]
const stepsDone = s => STEPS.reduce((n, st) => n + (s[st.key] ? 1 : 0), 0)

// Raw event_type → feature grouping for the usage breakdown.
const FEATURES = [
  { id: 'vocab',     label: 'Vocabulary', icon: '🔤', types: ['vocab_day_start','vocab_day_complete','vocab_review_start','vocab_review_complete','vocab_flip'] },
  { id: 'lesson',    label: 'Lessons',    icon: '📘', types: ['lesson_start','lesson_complete'] },
  { id: 'exercise',  label: 'Exercises',  icon: '💪', types: ['exercise_start','exercise_complete'] },
  { id: 'listening', label: 'Listening',  icon: '🎙️', types: ['listening_play'] },
  { id: 'test',      label: 'Daily Tests',icon: '📝', types: ['daily_test_start','daily_test_complete'] },
  { id: 'tutor',     label: 'AI Tutor',   icon: '🇩🇪', types: ['lena_message'] },
  { id: 'interview', label: 'Interview',  icon: '🎭', types: ['interview_start','interview_complete'] },
  { id: 'referral',  label: 'Referral',   icon: '🎁', types: ['referral_open'] },
]

// Activity status from the student's last tracked event.
function statusOf(s) {
  if (!s.last_event) return { label: 'Never started', c: C.textS, bg: C.surfAlt }
  const d = Math.floor((now() - new Date(s.last_event).getTime()) / day)
  if (d < 7) return { label: 'Active', c: C.green, bg: C.greenL }
  if (d < 14) return { label: 'At risk', c: C.amber, bg: C.amberL }
  return { label: 'Dormant', c: C.red, bg: C.redL }
}

// ── Top-level tabs (future data sources are stubbed until data lands) ──
const TABS = [
  { id: 'gcbuddy',   lbl: '🇩🇪 GC Buddy',      ready: true },
  { id: 'attendance',lbl: '📅 Attendance',    ready: false, note: 'Live-class attendance — student-wise view + metrics.' },
  { id: 'gate',      lbl: '🎓 Gate Tests',    ready: false, note: 'Gate / level test results — student-wise view + metrics.' },
  { id: 'emi',       lbl: '💳 EMI',           ready: false, note: 'Fee status — paid in full / on EMI / defaulter, with a collections view.' },
  { id: 'success',   lbl: '⭐ Success Score',  ready: false, note: 'A cumulative per-student score fusing GC Buddy usage, gate tests, attendance and EMI.' },
]

export default function Multiverse() {
  const [auth, setAuth] = useState(() => readAuth('admin'))
  const [pw, setPw] = useState('')
  const [, setTick] = useState(0)
  const [tab, setTab] = useState('gcbuddy')
  const [sub, setSub] = useState('stats')      // 'stats' | 'analysis' | 'students'
  const [rows, setRows] = useState([])
  const [daily, setDaily] = useState([])
  const [weekly, setWeekly] = useState([])
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('steps')
  const [sortDir, setSortDir] = useState('desc')

  useEffect(() => { if (auth) load() }, [])
  useEffect(() => {
    if (!auth) return
    const stop = watchAuthExpiry('admin', () => { setAuth(false); setPw('') })
    const t = setInterval(() => setTick(n => n + 1), 60000)
    return () => { stop(); clearInterval(t) }
  }, [auth])

  function signIn(entered) {
    if (entered !== import.meta.env.VITE_ADMIN_PASSWORD) { alert('Wrong password'); return }
    writeAuth('admin', true); setAuth(true); load()
  }
  function signOut() { writeAuth('admin', false); setAuth(false); setPw('') }

  async function load() {
    setLoading(true)
    try {
      const [f, d, u, w] = await Promise.all([
        sb.rpc('get_student_funnel'),
        sb.rpc('get_gcbuddy_daily_activity', { p_days: 14 }),
        sb.rpc('get_gcbuddy_feature_usage'),
        sb.rpc('get_gcbuddy_weekly_activity', { p_weeks: 12 }),
      ])
      setRows((f.data || []).filter(r => !r.is_demo))
      setDaily(d.data || [])
      setFeatures(u.data || [])
      setWeekly(w.data || [])
    } catch (e) { console.error('multiverse load:', e.message) }
    setLoading(false)
  }

  if (!auth) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, padding: '28px 24px', maxWidth: 320, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🌌</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 4 }}>GC Multiverse</h2>
        <p style={{ fontSize: 11, color: C.textS, marginBottom: 14 }}>Student activity & success command centre</p>
        <Inp val={pw} set={setPw} ph="Admin password" type="password" style={{ marginBottom: 9 }} autoFocus
          onKeyDown={e => { if (e.key === 'Enter') signIn(pw) }}/>
        <Btn label="Login" onClick={() => signIn(pw)} variant="primary" style={{ width: '100%' }}/>
        <div style={{ marginTop: 10 }}><a href="/" style={{ color: C.blue, fontSize: 11 }}>← Back to App</a></div>
      </div>
    </div>
  )

  // ── Derived GC Buddy aggregates (from per-student rows) ──
  const total = rows.length
  const cnt = fn => rows.filter(fn).length
  const dauY = cnt(s => s.active_yesterday)
  const dauT = cnt(s => s.active_today)
  const wau = cnt(s => s.active_7d)
  const mau = cnt(s => s.active_30d)
  const dormant = cnt(s => s.last_event && !s.active_7d && (now() - new Date(s.last_event).getTime()) >= 14 * day)
  const never = cnt(s => !s.last_event)
  const newWeek = cnt(s => s.first_event && (now() - new Date(s.first_event).getTime()) < 7 * day)
  const stickiness = mau ? Math.round((dauY / mau) * 100) : 0
  const avgSteps = total ? (rows.reduce((a, s) => a + stepsDone(s), 0) / total).toFixed(1) : '0'
  const testers = rows.filter(s => s.test_count > 0)
  const passRate = testers.length ? Math.round(100 * testers.filter(s => Number(s.best_test_pct) >= 60).length / testers.length) : 0
  const avgStreak = total ? Math.round(rows.reduce((a, s) => a + (s.streak || 0), 0) / total) : 0
  const reach = STEPS.map(st => ({ ...st, n: rows.filter(r => r[st.key]).length }))
  const lvDist = LEVELS.map(lv => ({ lv, n: rows.filter(s => s.level === lv).length }))
  const featAgg = FEATURES.map(f => {
    const matched = features.filter(r => f.types.includes(r.event_type))
    return { ...f, n: matched.reduce((a, r) => a + Number(r.n), 0), users: Math.max(0, ...matched.map(r => Number(r.users)), 0) }
  }).filter(f => f.n > 0).sort((a, b) => b.n - a.n)
  const maxDaily = Math.max(1, ...daily.map(d => d.users))
  const maxWeekly = Math.max(1, ...weekly.map(w => w.users))
  const a1pct = total ? Math.round(rows.filter(s => s.level === 'A1').length / total * 100) : 0
  const dormantPct = total ? Math.round(dormant / total * 100) : 0
  const activationPct = total ? Math.round(rows.filter(s => s.last_event).length / total * 100) : 0
  const intvN = reach.find(r => r.key === 'step_interview')?.n || 0
  const intvPct = total ? Math.round(intvN / total * 100) : 0
  // The analytics-map findings, recomputed live. s: 1=good, 0=watch, -1=risk.
  const health = [
    { t: 'A1 progression wall', v: `${a1pct}%`, note: `${rows.filter(s => s.level === 'A1').length} of ${total} still at A1`, s: a1pct < 80 ? 1 : a1pct < 90 ? 0 : -1 },
    { t: 'Dormant learners', v: `${dormantPct}%`, note: `${dormant} inactive for 14d+`, s: dormantPct < 20 ? 1 : dormantPct < 30 ? 0 : -1 },
    { t: 'Activation', v: `${activationPct}%`, note: `${never} approved never started`, s: activationPct > 85 ? 1 : activationPct > 70 ? 0 : -1 },
    { t: 'Daily-test gate', v: `${passRate}%`, note: 'pass rate vs the 60% gate', s: passRate >= 65 ? 1 : passRate >= 55 ? 0 : -1 },
    { t: 'AI interview adoption', v: `${intvPct}%`, note: `${intvN} students ever tried it`, s: intvPct > 20 ? 1 : intvPct > 5 ? 0 : -1 },
    { t: 'Stickiness (DAU/MAU)', v: `${stickiness}%`, note: 'daily ÷ monthly actives', s: stickiness >= 20 ? 1 : stickiness >= 10 ? 0 : -1 },
  ]

  // ── Per-student filter + sort ──
  const filtered = rows.filter(s =>
    (levelFilter === 'all' || s.level === levelFilter) &&
    (statusFilter === 'all' || statusOf(s).label === statusFilter) &&
    (!search || (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.roll_number || '').toLowerCase().includes(search.toLowerCase()))
  )
  const sorted = [...filtered].sort((a, b) => {
    let va, vb
    if (sortBy === 'name') { va = a.name || ''; vb = b.name || '' }
    else if (sortBy === 'level') { va = a.level; vb = b.level }
    else if (sortBy === 'last') { va = a.last_event ? new Date(a.last_event).getTime() : 0; vb = b.last_event ? new Date(b.last_event).getTime() : 0 }
    else if (sortBy === 'tests') { va = a.test_count; vb = b.test_count }
    else if (sortBy === 'streak') { va = a.streak; vb = b.streak }
    else { va = stepsDone(a); vb = stepsDone(b) }
    if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    return sortDir === 'asc' ? va - vb : vb - va
  })

  function exportCsv() {
    const head = ['Roll', 'Name', 'Level', 'Status', 'Last active', 'Steps', ...STEPS.map(s => s.short)]
    const lines = sorted.map(s => [
      s.roll_number, `"${(s.name || '').replace(/"/g, '""')}"`, s.level, statusOf(s).label,
      s.last_event ? new Date(s.last_event).toISOString().slice(0, 10) : '',
      stepsDone(s), ...STEPS.map(st => (s[st.key] ? 1 : 0)),
    ].join(','))
    const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `gcbuddy_students_${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  function th(label, key, extra = {}) {
    const active = sortBy === key
    return (
      <th key={key} onClick={() => { if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(key); setSortDir('desc') } }}
        style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: active ? C.blue : C.textS, textTransform: 'uppercase', letterSpacing: '.05em', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', borderBottom: `1px solid ${C.border}`, background: C.surfAlt, ...extra }}>
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </th>
    )
  }

  const MetricCard = ({ v, l, c, ic, sub }) => (
    <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '14px' }}>
      <div style={{ fontSize: 10, color: C.textS, marginBottom: 4 }}>{ic} {l}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: c }}>{v}</div>
      {sub && <div style={{ fontSize: 10, color: C.textS, marginTop: 3 }}>{sub}</div>}
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: C.navy, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 800, color: '#fff', fontSize: 15 }}>🌌 GC Multiverse</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>{total} students · student activity & success · <span title="Staff sessions end 24h after sign-in">{expiryLabel('admin')}</span></div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={load} disabled={loading} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.25)', background: 'transparent', color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{loading ? '⏳' : '🔄 Refresh'}</button>
          <a href="/?admin=1" style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, textDecoration: 'none' }}>🛡️ Admin</a>
          <a href="/" style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, textDecoration: 'none' }}>← App</a>
        </div>
      </div>

      {/* Main tab bar */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.border}`, display: 'flex', overflowX: 'auto', padding: '0 12px', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '11px 16px', border: 'none', borderBottom: `3px solid ${tab === t.id ? C.blue : 'transparent'}`, background: 'transparent', color: tab === t.id ? C.blue : (t.ready ? C.textM : C.textS), cursor: 'pointer', fontSize: 12, fontWeight: tab === t.id ? 700 : 500, fontFamily: 'inherit', whiteSpace: 'nowrap', opacity: t.ready ? 1 : 0.7 }}>
            {t.lbl}{!t.ready && <span style={{ fontSize: 8, marginLeft: 5, background: C.surfAlt, color: C.textS, padding: '1px 5px', borderRadius: 8, fontWeight: 700 }}>SOON</span>}
          </button>
        ))}
      </div>

      {/* ── GC BUDDY TAB ── */}
      {tab === 'gcbuddy' && (
        <>
          {/* Sub-tab bar */}
          <div style={{ background: C.surfAlt, borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 6, padding: '8px 16px', flexShrink: 0 }}>
            {[['stats', '📊 Usage Statistics'], ['analysis', '🔎 Analysis'], ['students', '👥 Per-Student']].map(([id, lbl]) => (
              <button key={id} onClick={() => setSub(id)}
                style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${sub === id ? C.blue : C.border}`, background: sub === id ? C.blueL : '#fff', color: sub === id ? C.blue : C.textM, cursor: 'pointer', fontSize: 12, fontWeight: sub === id ? 700 : 500, fontFamily: 'inherit' }}>
                {lbl}
              </button>
            ))}
          </div>

          {loading && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Spin sz={28}/><span style={{ color: C.textS, fontSize: 12 }}>Loading GC Buddy data…</span>
            </div>
          )}

          {!loading && sub === 'stats' && (
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {/* Headline metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 18 }}>
                <MetricCard v={dauY} l="Active yesterday" ic="🟢" c={C.green} sub={`${dauT} active today`}/>
                <MetricCard v={wau} l="Active this week" ic="📆" c={C.blue} sub={`${total ? Math.round(wau / total * 100) : 0}% of students`}/>
                <MetricCard v={mau} l="Active this month" ic="🗓️" c={C.navy} sub="last 30 days"/>
                <MetricCard v={dormant} l="Dormant" ic="🔴" c={C.red} sub="no activity 14d+"/>
                <MetricCard v={never} l="Never started" ic="⚪" c={C.textS} sub="approved, 0 activity"/>
                <MetricCard v={newWeek} l="New this week" ic="✨" c={C.green} sub="first activity ≤7d"/>
                <MetricCard v={`${stickiness}%`} l="Stickiness" ic="🧲" c={C.blue} sub="DAU ÷ MAU"/>
                <MetricCard v={`${avgSteps}/10`} l="Avg journey steps" ic="🧭" c={C.navy} sub="per student"/>
                <MetricCard v={`${passRate}%`} l="Test pass rate" ic="📝" c={passRate >= 60 ? C.green : C.amber} sub={`${testers.length} have tested`}/>
                <MetricCard v={`${avgStreak}d`} l="Avg streak" ic="🔥" c={C.amber} sub="current"/>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 18 }}>
                {/* Activity trend */}
                <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                  <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 2 }}>📈 Daily active users — last 14 days</div>
                  <div style={{ fontSize: 10, color: C.textS, marginBottom: 14 }}>Distinct students with ≥1 activity each day (IST)</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 130 }}>
                    {daily.map((d, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, height: '100%' }} title={`${d.d}: ${d.users} users, ${d.events} events`}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: C.textM }}>{d.users}</span>
                        <div style={{ width: '100%', height: `${Math.round(d.users / maxDaily * 100)}%`, minHeight: 2, background: i === daily.length - 1 ? C.blue : C.blueM, borderRadius: '4px 4px 0 0' }}/>
                        <span style={{ fontSize: 8, color: C.textS, whiteSpace: 'nowrap' }}>{new Date(d.d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    ))}
                    {daily.length === 0 && <div style={{ margin: 'auto', color: C.textS, fontSize: 11 }}>No activity in range</div>}
                  </div>
                </div>

                {/* Level distribution */}
                <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                  <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 12 }}>📊 Level distribution</div>
                  {lvDist.map(({ lv, n }) => {
                    const pct = total ? Math.round(n / total * 100) : 0
                    const c = lv === 'A1' ? C.blue : lv === 'A2' ? C.green : lv === 'B1' ? C.amber : C.red
                    return (
                      <div key={lv} style={{ marginBottom: 11 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Level {lv}</span>
                          <span style={{ fontSize: 11, color: C.textS }}>{n} · {pct}%</span>
                        </div>
                        <PBar pct={pct} h={8} color={c}/>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Feature usage */}
                <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                  <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 12 }}>🧩 Feature usage (all time)</div>
                  {featAgg.map(f => {
                    const max = Math.max(1, ...featAgg.map(x => x.n))
                    return (
                      <div key={f.id} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11.5, color: C.textM, fontWeight: 600 }}>{f.icon} {f.label}</span>
                          <span style={{ fontSize: 10.5, color: C.textS }}><b style={{ color: C.navy }}>{f.n.toLocaleString()}</b> actions · {f.users} students</span>
                        </div>
                        <PBar pct={Math.round(f.n / max * 100)} h={7} color={C.blue}/>
                      </div>
                    )
                  })}
                </div>

                {/* Journey reach */}
                <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                  <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 2 }}>🧭 Journey reach</div>
                  <div style={{ fontSize: 10, color: C.textS, marginBottom: 12 }}>Students who have ever done each step</div>
                  {reach.map((st, i) => {
                    const pct = total ? Math.round(st.n / total * 100) : 0
                    return (
                      <div key={st.key} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 11, color: C.textM, fontWeight: 600 }}>{st.icon} {st.short}</span>
                          <span style={{ fontSize: 10.5, color: C.textS }}><b style={{ color: C.navy }}>{st.n}</b> · {pct}%</span>
                        </div>
                        <PBar pct={pct} h={6} color={pct >= 60 ? C.green : pct >= 30 ? C.amber : C.red}/>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {!loading && sub === 'analysis' && (
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {/* Weekly active users */}
              <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px', marginBottom: 18 }}>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 2 }}>📈 Weekly active users — last 12 weeks</div>
                <div style={{ fontSize: 10, color: C.textS, marginBottom: 14 }}>Distinct students active each ISO week (IST). The final bar is the current, still-running week.</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 150 }}>
                  {weekly.map((w, i) => (
                    <div key={i} title={`Week of ${w.wk}: ${w.users} users, ${w.events} events`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 4, height: '100%' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: C.textM }}>{w.users}</span>
                      <div style={{ width: '100%', height: `${Math.round(w.users / maxWeekly * 100)}%`, minHeight: 2, background: C.blue, borderRadius: '4px 4px 0 0', opacity: i === weekly.length - 1 ? 0.5 : 1 }}/>
                      <span style={{ fontSize: 8, color: C.textS, whiteSpace: 'nowrap' }}>{new Date(w.wk).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                    </div>
                  ))}
                  {weekly.length === 0 && <div style={{ margin: 'auto', color: C.textS, fontSize: 11 }}>No activity in range</div>}
                </div>
              </div>

              {/* Health check — analytics-map findings, recomputed live */}
              <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 10 }}>🩺 Product health check <span style={{ fontSize: 10, fontWeight: 400, color: C.textS }}>— the analytics-map findings, recomputed live</span></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 20 }}>
                {health.map(h => {
                  const col = h.s > 0 ? C.green : h.s === 0 ? C.amber : C.red
                  const bg = h.s > 0 ? C.greenL : h.s === 0 ? C.amberL : C.redL
                  const lbl = h.s > 0 ? 'Good' : h.s === 0 ? 'Watch' : 'Risk'
                  return (
                    <div key={h.t} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, borderLeft: `3px solid ${col}`, padding: '14px 15px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: C.navy }}>{h.t}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, color: col, background: bg, padding: '2px 7px', borderRadius: 10 }}>{lbl}</span>
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: col, lineHeight: 1 }}>{h.v}</div>
                      <div style={{ fontSize: 10.5, color: C.textS, marginTop: 5 }}>{h.note}</div>
                    </div>
                  )
                })}
              </div>

              {/* Journey reach & drop-off */}
              <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 2 }}>🧭 Journey reach & drop-off</div>
                <div style={{ fontSize: 10, color: C.textS, marginBottom: 12 }}>Students who have ever reached each step, in journey order.</div>
                {reach.map((st, i) => {
                  const pct = total ? Math.round(st.n / total * 100) : 0
                  const drop = i > 0 ? reach[i - 1].n - st.n : 0
                  return (
                    <div key={st.key} style={{ marginBottom: 9 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: C.textM, fontWeight: 600 }}>{st.icon} {st.short}</span>
                        <span style={{ fontSize: 10.5, color: C.textS }}><b style={{ color: C.navy }}>{st.n}</b> · {pct}%{i > 0 && drop > 0 && <span style={{ color: C.red, marginLeft: 6 }}>▼{drop}</span>}</span>
                      </div>
                      <PBar pct={pct} h={7} color={pct >= 60 ? C.green : pct >= 30 ? C.amber : C.red}/>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!loading && sub === 'students' && (
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {/* Controls */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ flex: 1, minWidth: 180 }}><Inp val={search} set={setSearch} ph="🔍 Search name or roll number"/></div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {['all', ...LEVELS].map(l => (
                    <button key={l} onClick={() => setLevelFilter(l)}
                      style={{ padding: '7px 11px', borderRadius: 8, border: `1.5px solid ${levelFilter === l ? C.blue : C.border}`, background: levelFilter === l ? C.blueL : '#fff', color: levelFilter === l ? C.blue : C.textS, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>
                      {l === 'all' ? 'All lvl' : l}
                    </button>
                  ))}
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  style={{ padding: '7px 10px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: '#fff', color: C.textM, fontSize: 11, fontFamily: 'inherit', cursor: 'pointer' }}>
                  {['all', 'Active', 'At risk', 'Dormant', 'Never started'].map(o => <option key={o} value={o}>{o === 'all' ? 'All status' : o}</option>)}
                </select>
                <button onClick={exportCsv} style={{ padding: '7px 12px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: '#fff', color: C.textM, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>⬇ CSV</button>
                <span style={{ fontSize: 11, color: C.textS }}>{sorted.length} shown</span>
              </div>

              {/* Per-student table */}
              <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1000 }}>
                  <thead>
                    <tr>
                      {th('Student', 'name', { position: 'sticky', left: 0, zIndex: 2, minWidth: 150 })}
                      {th('Lvl', 'level')}
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.textS, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap', borderBottom: `1px solid ${C.border}`, background: C.surfAlt }}>Status</th>
                      {STEPS.map(st => (
                        <th key={st.key} title={st.desc}
                          style={{ padding: '8px 6px', textAlign: 'center', fontSize: 9, fontWeight: 700, color: C.textS, textTransform: 'uppercase', letterSpacing: '.03em', whiteSpace: 'nowrap', borderBottom: `1px solid ${C.border}`, background: C.surfAlt, cursor: 'help' }}>
                          <div style={{ fontSize: 13 }}>{st.icon}</div>{st.short}
                        </th>
                      ))}
                      {th('Done', 'steps', { textAlign: 'center' })}
                      {th('Last active', 'last')}
                    </tr>
                  </thead>
                  <tbody>
                    {sorted.map(s => {
                      const done = stepsDone(s)
                      const st = statusOf(s)
                      return (
                        <tr key={s.roll_number} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '8px 10px', position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{s.name}</div>
                            <div style={{ fontSize: 9, color: C.textS }}>{s.roll_number}</div>
                          </td>
                          <td style={{ padding: '8px 8px' }}><Badge label={s.level} color={C.blue} bg={C.blueL}/></td>
                          <td style={{ padding: '8px 8px' }}><span style={{ background: st.bg, color: st.c, fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>{st.label}</span></td>
                          {STEPS.map(stp => {
                            const d2 = !!s[stp.key]
                            const c2 = stp.count ? s[stp.count] : null
                            return (
                              <td key={stp.key} style={{ padding: '6px 4px', textAlign: 'center' }}>
                                {d2 ? (
                                  <span title={stp.desc} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, borderRadius: 6, background: C.greenL, color: C.green, fontSize: c2 ? 10 : 12, fontWeight: 700, padding: '0 5px' }}>
                                    {c2 ? `${c2}${stp.unit || ''}` : '✓'}
                                  </span>
                                ) : (
                                  <span style={{ display: 'inline-block', width: 22, height: 22, lineHeight: '22px', borderRadius: 6, background: C.surfAlt, color: C.border, fontSize: 12 }}>–</span>
                                )}
                              </td>
                            )
                          })}
                          <td style={{ padding: '6px 10px', textAlign: 'center', minWidth: 70 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: done >= 7 ? C.green : done >= 4 ? C.amber : C.red }}>{done}/{STEPS.length}</div>
                            <PBar pct={(done / STEPS.length) * 100} h={4} color={done >= 7 ? C.green : done >= 4 ? C.amber : C.red} style={{ marginTop: 3 }}/>
                          </td>
                          <td style={{ padding: '8px 10px', fontSize: 10, color: C.textS, whiteSpace: 'nowrap' }}>{dAgo(s.last_event)}</td>
                        </tr>
                      )
                    })}
                    {sorted.length === 0 && (
                      <tr><td colSpan={STEPS.length + 5} style={{ padding: 30, textAlign: 'center', color: C.textS, fontSize: 12 }}>No students match.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: 10, color: C.textS, marginTop: 10 }}>
                ✓ = step done · numbers show depth (vocab days, topics, exercises, listening plays, tests, tutor messages). Demo/BD accounts excluded.
              </div>
            </div>
          )}
        </>
      )}

      {/* ── STUB TABS (awaiting data) ── */}
      {tab !== 'gcbuddy' && (() => {
        const t = TABS.find(x => x.id === tab)
        return (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
            <div style={{ background: '#fff', borderRadius: 16, border: `1px dashed ${C.border}`, padding: '34px 30px', maxWidth: 460, textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>{t.lbl.split(' ')[0]}</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{t.lbl.slice(t.lbl.indexOf(' ') + 1)}</h2>
              <p style={{ fontSize: 13, color: C.textM, marginBottom: 16, lineHeight: 1.5 }}>{t.note}</p>
              <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 11, color: C.textS, background: C.surfAlt, borderRadius: 8, padding: '6px 12px' }}>📊 Metrics</span>
                <span style={{ fontSize: 11, color: C.textS, background: C.surfAlt, borderRadius: 8, padding: '6px 12px' }}>👥 Per-student</span>
              </div>
              <div style={{ fontSize: 11, color: C.blue, fontWeight: 600 }}>Awaiting data — share it and this tab goes live.</div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
