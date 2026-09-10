import { useState, useEffect } from 'react'
import { readAuth, writeAuth, watchAuthExpiry, expiryLabel } from '../../lib/adminAuth'
import { C, LEVELS } from '../../lib/constants'
import { Inp, Btn, Spin, PBar, Badge } from '../../components/UI'
import { sb } from '../../lib/supabase'

// ─────────────────────────────────────────────────────────────────────────────
// GC Multiverse — a single command centre for overall student activity & success.
// Tab per data source (GC Buddy now; Attendance / Gate Tests / EMI to follow) and
// a final cumulative success score.
// ─────────────────────────────────────────────────────────────────────────────
const now = () => Date.now()
const day = 86400000

// The GC Buddy journey, in order (used by the Usage Statistics & Analysis tabs).
const STEPS = [
  { key: 'step_active',    short: 'Active',    icon: '🟢' },
  { key: 'step_placement', short: 'Placement', icon: '🎯' },
  { key: 'step_vocab',     short: 'Vocab',     icon: '🔤' },
  { key: 'step_lesson',    short: 'Lesson',    icon: '📘' },
  { key: 'step_exercise',  short: 'Exercise',  icon: '💪' },
  { key: 'step_listening', short: 'Listening', icon: '🎙️' },
  { key: 'step_test',      short: 'Daily Test',icon: '📝' },
  { key: 'step_tutor',     short: 'AI Tutor',  icon: '🇩🇪' },
  { key: 'step_interview', short: 'Interview', icon: '🎭' },
  { key: 'step_levelup',   short: 'Level Up',  icon: '🎓' },
]
const stepsDone = s => STEPS.reduce((n, st) => n + (s[st.key] ? 1 : 0), 0)

// Raw event_type → feature grouping for the Usage Statistics breakdown.
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

// The 5 headline learning features for the GC Feature Usage tab.
// `act` = column of total actions, `done` = column of completions (null = no
// completion concept for this feature), rendered from the per-student RPC.
const FEAT5 = [
  { id: 'listening',  label: 'Listening',           icon: '🎙️', act: 'listening_plays',      done: null,                    unit: 'plays' },
  { id: 'learnhub',   label: 'Learn Hub',           icon: '💪', act: 'learn_hub_actions',     done: 'learn_hub_completed',   unit: 'actions' },
  { id: 'curriculum', label: 'Curriculum → AI bot', icon: '📘', act: 'curriculum_opens',      done: 'curriculum_completed',  unit: 'opens' },
  { id: 'dailytest',  label: 'Daily Tests',         icon: '📝', act: 'daily_tests_attempts',  done: 'daily_tests_completed', unit: 'attempts' },
  { id: 'media',      label: 'Media',               icon: '🎬', act: 'media_opens',           done: null,                    unit: 'opens' },
]

const TABS = [
  { id: 'gcbuddy',   lbl: '🇩🇪 GC Buddy',      ready: true },
  { id: 'attendance',lbl: '📅 Attendance',    ready: true },
  { id: 'gate',      lbl: '🎓 Gate Tests',    ready: false, note: 'Gate / level test results — student-wise view + metrics.' },
  { id: 'emi',       lbl: '💳 EMI',           ready: false, note: 'Fee status — paid in full / on EMI / defaulter, with a collections view.' },
  { id: 'success',   lbl: '⭐ Success Score',  ready: false, note: 'A cumulative per-student score fusing GC Buddy usage, gate tests, attendance and EMI.' },
]

const LOGO = '/logo.jpeg'

export default function Multiverse() {
  const [auth, setAuth] = useState(() => readAuth('admin'))
  const [pw, setPw] = useState('')
  const [, setTick] = useState(0)
  const [tab, setTab] = useState('gcbuddy')
  const [sub, setSub] = useState('stats')      // 'stats' | 'analysis' | 'features'
  const [rows, setRows] = useState([])
  const [daily, setDaily] = useState([])
  const [weekly, setWeekly] = useState([])
  const [features, setFeatures] = useState([])
  const [featRows, setFeatRows] = useState([])
  const [attSummary, setAttSummary] = useState(null)
  const [attRows, setAttRows] = useState([])
  const [attSub, setAttSub] = useState('metrics')  // 'metrics' | 'students'
  const [attSortBy, setAttSortBy] = useState('pct')
  const [attSortDir, setAttSortDir] = useState('asc')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
  const [sortBy, setSortBy] = useState('eng')
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
      const [f, d, u, w, fu, asum, arow] = await Promise.all([
        sb.rpc('get_student_funnel'),
        sb.rpc('get_gcbuddy_daily_activity', { p_days: 14 }),
        sb.rpc('get_gcbuddy_feature_usage'),
        sb.rpc('get_gcbuddy_weekly_activity', { p_weeks: 12 }),
        sb.rpc('get_gcbuddy_feature_usage_by_student'),
        sb.rpc('get_attendance_summary'),
        sb.rpc('get_attendance_by_student'),
      ])
      setRows((f.data || []).filter(r => !r.is_demo))
      setDaily(d.data || [])
      setFeatures(u.data || [])
      setWeekly(w.data || [])
      setFeatRows((fu.data || []).filter(r => !r.is_demo))
      setAttSummary(asum.data || null)
      setAttRows(arow.data || [])
    } catch (e) { console.error('multiverse load:', e.message) }
    setLoading(false)
  }

  if (!auth) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, padding: '28px 24px', maxWidth: 320, width: '100%', textAlign: 'center' }}>
        <img src={LOGO} alt="GC Buddy" style={{ height: 46, width: 46, borderRadius: 11, objectFit: 'cover', marginBottom: 10 }}/>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 4 }}>GC Multiverse</h2>
        <p style={{ fontSize: 11, color: C.textS, marginBottom: 14 }}>Student activity & success command centre</p>
        <Inp val={pw} set={setPw} ph="Admin password" type="password" style={{ marginBottom: 9 }} autoFocus
          onKeyDown={e => { if (e.key === 'Enter') signIn(pw) }}/>
        <Btn label="Login" onClick={() => signIn(pw)} variant="primary" style={{ width: '100%' }}/>
        <div style={{ marginTop: 10 }}><a href="/" style={{ color: C.blue, fontSize: 11 }}>← Back to App</a></div>
      </div>
    </div>
  )

  // ── Aggregates for Usage Statistics & Analysis (from the funnel rows) ──
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
  const health = [
    { t: 'A1 progression wall', v: `${a1pct}%`, note: `${rows.filter(s => s.level === 'A1').length} of ${total} still at A1`, s: a1pct < 80 ? 1 : a1pct < 90 ? 0 : -1 },
    { t: 'Dormant learners', v: `${dormantPct}%`, note: `${dormant} inactive for 14d+`, s: dormantPct < 20 ? 1 : dormantPct < 30 ? 0 : -1 },
    { t: 'Activation', v: `${activationPct}%`, note: `${never} approved never started`, s: activationPct > 85 ? 1 : activationPct > 70 ? 0 : -1 },
    { t: 'Daily-test gate', v: `${passRate}%`, note: 'pass rate vs the 60% gate', s: passRate >= 65 ? 1 : passRate >= 55 ? 0 : -1 },
    { t: 'AI interview adoption', v: `${intvPct}%`, note: `${intvN} students ever tried it`, s: intvPct > 20 ? 1 : intvPct > 5 ? 0 : -1 },
    { t: 'Stickiness (DAU/MAU)', v: `${stickiness}%`, note: 'daily ÷ monthly actives', s: stickiness >= 20 ? 1 : stickiness >= 10 ? 0 : -1 },
  ]

  // ── GC Feature Usage aggregates & per-student table (from featRows) ──
  const feat5 = FEAT5.map(f => ({
    ...f,
    total: featRows.reduce((a, r) => a + (r[f.act] || 0), 0),
    students: featRows.filter(r => (r[f.act] || 0) > 0).length,
    completions: f.done ? featRows.reduce((a, r) => a + (r[f.done] || 0), 0) : null,
  })).sort((a, b) => b.total - a.total)
  const maxFeat = Math.max(1, ...feat5.map(f => f.total))
  const eng = r => (r.daily_tests_completed || 0) + (r.learn_hub_completed || 0) + (r.curriculum_completed || 0)
  const fuFiltered = featRows.filter(r =>
    (levelFilter === 'all' || r.level === levelFilter) &&
    (!search || (r.name || '').toLowerCase().includes(search.toLowerCase()) || (r.roll_number || '').toLowerCase().includes(search.toLowerCase()))
  )
  const sortKey = {
    name: r => r.name || '', level: r => r.level,
    listening: r => r.listening_plays, learnhub: r => r.learn_hub_completed,
    tests: r => r.daily_tests_completed, vocab: r => r.vocab_actions,
    vocabdone: r => r.vocab_completed, ai: r => r.curriculum_completed, eng,
  }
  const fuSorted = [...fuFiltered].sort((a, b) => {
    const g = sortKey[sortBy] || eng
    const va = g(a), vb = g(b)
    if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    return sortDir === 'asc' ? va - vb : vb - va
  })

  function exportCsv() {
    const head = ['roll_number', 'name', 'level', 'listening_plays', 'learn_hub_sets_completed', 'daily_tests_completed', 'vocab_actions', 'vocab_completed', 'curriculum_ai_completed']
    const lines = fuSorted.map(r => [
      r.roll_number, `"${(r.name || '').replace(/"/g, '""')}"`, r.level,
      r.listening_plays, r.learn_hub_completed, r.daily_tests_completed, r.vocab_actions, r.vocab_completed, r.curriculum_completed,
    ].join(','))
    const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `gcbuddy_feature_usage_by_student_${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  function th(label, key, extra = {}) {
    const active = sortBy === key
    return (
      <th key={key} onClick={() => { if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(key); setSortDir('desc') } }}
        style={{ padding: '8px 10px', textAlign: extra.center ? 'center' : 'left', fontSize: 9, fontWeight: 700, color: active ? C.blue : C.textS, textTransform: 'uppercase', letterSpacing: '.05em', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', borderBottom: `1px solid ${C.border}`, background: C.surfAlt, ...(extra.style || {}) }}>
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

  const numCell = (v, strong) => (
    <td style={{ padding: '7px 8px', textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: 12, color: v > 0 ? (strong ? C.navy : C.textM) : C.border, fontWeight: v > 0 && strong ? 700 : 400 }}>{v || '–'}</td>
  )

  // ── Attendance derived ──
  const attT = attSummary?.totals || {}
  const attByCT = attSummary?.by_class_type || []
  const attByBatch = attSummary?.by_batch || []
  const attWeekly = attSummary?.weekly || []
  const attTracked = attRows.length
  const attChronic = attRows.filter(r => Number(r.attendance_pct) < 40).length
  const attGood = attRows.filter(r => Number(r.attendance_pct) >= 75).length
  const attMaxBatch = Math.max(1, ...attByBatch.map(b => b.marked || 0))
  const attFiltered = attRows.filter(r =>
    (levelFilter === 'all' || r.level === levelFilter) &&
    (!search || (r.name || '').toLowerCase().includes(search.toLowerCase()) || (r.roll_number || '').toLowerCase().includes(search.toLowerCase()))
  )
  const attSortFn = { name: r => r.name || '', batch: r => r.batches || '', pct: r => Number(r.attendance_pct), present: r => r.present, absent: r => r.absent, marked: r => r.marked }
  const attSorted = [...attFiltered].sort((a, b) => {
    const g = attSortFn[attSortBy] || attSortFn.pct
    const va = g(a), vb = g(b)
    if (typeof va === 'string') return attSortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    return attSortDir === 'asc' ? va - vb : vb - va
  })
  const pctColor = p => p >= 75 ? C.green : p >= 40 ? C.amber : C.red
  function attExportCsv() {
    const head = ['roll_number', 'name', 'level', 'batches', 'marked', 'present', 'absent', 'attendance_pct', 'last_present']
    const lines = attSorted.map(r => [r.roll_number, `"${(r.name || '').replace(/"/g, '""')}"`, r.level, `"${r.batches || ''}"`, r.marked, r.present, r.absent, r.attendance_pct, r.last_present || ''].join(','))
    const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob); const a = document.createElement('a')
    a.href = url; a.download = `gcbuddy_attendance_by_student_${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(url)
  }
  function attTh(label, key, extra = {}) {
    const active = attSortBy === key
    return (
      <th key={key} onClick={() => { if (attSortBy === key) setAttSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setAttSortBy(key); setAttSortDir(key === 'pct' ? 'asc' : 'desc') } }}
        style={{ padding: '8px 10px', textAlign: extra.center ? 'center' : 'left', fontSize: 9, fontWeight: 700, color: active ? C.blue : C.textS, textTransform: 'uppercase', letterSpacing: '.05em', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', borderBottom: `1px solid ${C.border}`, background: C.surfAlt, ...(extra.style || {}) }}>
        {label} {active ? (attSortDir === 'asc' ? '↑' : '↓') : ''}
      </th>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: C.navy, padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={LOGO} alt="GC Buddy" style={{ height: 30, width: 30, borderRadius: 7, objectFit: 'cover', flexShrink: 0 }}/>
          <div>
            <div style={{ fontWeight: 800, color: '#fff', fontSize: 15 }}>GC Multiverse</div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,.45)' }}>{total} students · student activity & success · <span title="Staff sessions end 24h after sign-in">{expiryLabel('admin')}</span></div>
          </div>
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
          <div style={{ background: C.surfAlt, borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 6, padding: '8px 16px', flexShrink: 0, overflowX: 'auto' }}>
            {[['stats', '📊 Usage Statistics'], ['analysis', '🔎 Analysis'], ['features', '🧩 GC Feature Usage']].map(([id, lbl]) => (
              <button key={id} onClick={() => setSub(id)}
                style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${sub === id ? C.blue : C.border}`, background: sub === id ? C.blueL : '#fff', color: sub === id ? C.blue : C.textM, cursor: 'pointer', fontSize: 12, fontWeight: sub === id ? 700 : 500, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
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

                <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                  <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 2 }}>🧭 Journey reach</div>
                  <div style={{ fontSize: 10, color: C.textS, marginBottom: 12 }}>Students who have ever done each step</div>
                  {reach.map(st => {
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

          {/* ── GC FEATURE USAGE ── */}
          {!loading && sub === 'features' && (
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              {/* Ranking: most → least used */}
              <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px', marginBottom: 18 }}>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 2 }}>🏆 Feature usage — most to least used</div>
                <div style={{ fontSize: 10, color: C.textS, marginBottom: 14 }}>All-time, demo/BD accounts excluded. Bar = total actions; also showing how many students used it and how many completions.</div>
                {feat5.map(f => {
                  const usersPct = total ? Math.round(f.students / total * 100) : 0
                  return (
                    <div key={f.id} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                        <span style={{ fontSize: 12.5, color: C.navy, fontWeight: 700 }}>{f.icon} {f.label}</span>
                        <span style={{ fontSize: 11, color: C.textS }}>
                          <b style={{ color: C.navy }}>{f.total.toLocaleString()}</b> {f.unit} · {f.students} students ({usersPct}%)
                          {f.completions != null && <span> · <b style={{ color: C.green }}>{f.completions.toLocaleString()}</b> completed</span>}
                        </span>
                      </div>
                      <PBar pct={Math.round(f.total / maxFeat * 100)} h={9} color={C.blue}/>
                    </div>
                  )
                })}
              </div>

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
                <button onClick={exportCsv} style={{ padding: '7px 12px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: '#fff', color: C.textM, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>⬇ CSV</button>
                <span style={{ fontSize: 11, color: C.textS }}>{fuSorted.length} shown</span>
              </div>

              {/* Per-student completions table (= the CSV, live) */}
              <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
                  <thead>
                    <tr>
                      {th('Student', 'name', { style: { position: 'sticky', left: 0, zIndex: 2, minWidth: 150 } })}
                      {th('Lvl', 'level')}
                      {th('🎙️ Listening plays', 'listening', { center: true })}
                      {th('💪 Learn Hub done', 'learnhub', { center: true })}
                      {th('📝 Tests done', 'tests', { center: true })}
                      {th('🔤 Vocab actions', 'vocab', { center: true })}
                      {th('🔤 Vocab done', 'vocabdone', { center: true })}
                      {th('📘 AI lessons done', 'ai', { center: true })}
                    </tr>
                  </thead>
                  <tbody>
                    {fuSorted.map(r => (
                      <tr key={r.roll_number} style={{ borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 10px', position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: `1px solid ${C.border}` }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{r.name}</div>
                          <div style={{ fontSize: 9, color: C.textS }}>{r.roll_number}</div>
                        </td>
                        <td style={{ padding: '8px 8px' }}><Badge label={r.level} color={C.blue} bg={C.blueL}/></td>
                        {numCell(r.listening_plays)}
                        {numCell(r.learn_hub_completed, true)}
                        {numCell(r.daily_tests_completed, true)}
                        {numCell(r.vocab_actions)}
                        {numCell(r.vocab_completed, true)}
                        {numCell(r.curriculum_completed, true)}
                      </tr>
                    ))}
                    {fuSorted.length === 0 && (
                      <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: C.textS, fontSize: 12 }}>No students match.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: 10, color: C.textS, marginTop: 10 }}>
                Completions are finished units: Learn Hub = full 20-question sets · Daily Tests = whole tests submitted · Vocab = days/reviews finished · AI lessons = curriculum topics marked done. Listening has no "complete" event, so it shows clip plays. Demo/BD accounts excluded.
              </div>
            </div>
          )}
        </>
      )}

      {/* ── ATTENDANCE TAB ── */}
      {tab === 'attendance' && (
        <>
          <div style={{ background: C.surfAlt, borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 6, padding: '8px 16px', flexShrink: 0, overflowX: 'auto' }}>
            {[['metrics', '📊 Metrics'], ['students', '👥 Per-Student']].map(([id, lbl]) => (
              <button key={id} onClick={() => setAttSub(id)}
                style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${attSub === id ? C.blue : C.border}`, background: attSub === id ? C.blueL : '#fff', color: attSub === id ? C.blue : C.textM, cursor: 'pointer', fontSize: 12, fontWeight: attSub === id ? 700 : 500, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                {lbl}
              </button>
            ))}
          </div>

          {loading && (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <Spin sz={28}/><span style={{ color: C.textS, fontSize: 12 }}>Loading attendance…</span>
            </div>
          )}

          {!loading && attSub === 'metrics' && (
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 18 }}>
                <MetricCard v={`${attT.pct ?? 0}%`} l="Overall attendance" ic="📊" c={pctColor(attT.pct || 0)} sub={`${attT.present || 0} of ${attT.marked || 0} marked`}/>
                <MetricCard v={attTracked} l="Students tracked" ic="👥" c={C.navy} sub={`of ${total} approved`}/>
                <MetricCard v={attT.present || 0} l="Present" ic="🟢" c={C.green} sub="all sessions"/>
                <MetricCard v={attT.absent || 0} l="Absent" ic="🔴" c={C.red} sub="all sessions"/>
                <MetricCard v={attChronic} l="Chronic (<40%)" ic="⚠️" c={C.red} sub="need intervention"/>
                <MetricCard v={attGood} l="Regular (≥75%)" ic="⭐" c={C.green} sub="strong attenders"/>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 14, marginBottom: 18 }}>
                <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                  <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 12 }}>🕐 Attendance by class type</div>
                  {attByCT.map(ct => (
                    <div key={ct.class_type} style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{ct.class_type}</span>
                        <span style={{ fontSize: 11, color: C.textS }}><b style={{ color: pctColor(ct.pct) }}>{ct.pct}%</b> · {ct.present}/{ct.marked}</span>
                      </div>
                      <PBar pct={ct.pct} h={9} color={pctColor(ct.pct)}/>
                    </div>
                  ))}
                  <div style={{ fontSize: 10, color: C.textS, marginTop: 6 }}>% of marked sessions where the student was Present.</div>
                </div>

                <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                  <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 2 }}>📈 Weekly attendance %</div>
                  <div style={{ fontSize: 10, color: C.textS, marginBottom: 14 }}>Present ÷ marked each week</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 130 }}>
                    {attWeekly.map((w, i) => (
                      <div key={i} title={`Week of ${w.wk}: ${w.pct}% (${w.present}/${w.present + w.absent})`} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', gap: 3, height: '100%' }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: C.textM }}>{w.pct}</span>
                        <div style={{ width: '100%', height: `${w.pct}%`, minHeight: 2, background: pctColor(w.pct), borderRadius: '3px 3px 0 0' }}/>
                      </div>
                    ))}
                    {attWeekly.length === 0 && <div style={{ margin: 'auto', color: C.textS, fontSize: 11 }}>No data</div>}
                  </div>
                </div>
              </div>

              <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 12 }}>🏫 Attendance by batch</div>
                {attByBatch.map(b => (
                  <div key={b.batch} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 130, fontSize: 11, color: C.navy, fontWeight: 600, flexShrink: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.batch}</div>
                    <div style={{ flex: 1 }}><PBar pct={b.pct || 0} h={8} color={pctColor(b.pct || 0)}/></div>
                    <div style={{ width: 120, fontSize: 10, color: C.textS, textAlign: 'right', flexShrink: 0 }}><b style={{ color: pctColor(b.pct || 0) }}>{b.pct}%</b> · {b.students} std</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!loading && attSub === 'students' && (
            <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
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
                <button onClick={attExportCsv} style={{ padding: '7px 12px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: '#fff', color: C.textM, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>⬇ CSV</button>
                <span style={{ fontSize: 11, color: C.textS }}>{attSorted.length} shown</span>
              </div>

              <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 820 }}>
                  <thead>
                    <tr>
                      {attTh('Student', 'name', { style: { position: 'sticky', left: 0, zIndex: 2, minWidth: 150 } })}
                      {attTh('Batch', 'batch')}
                      {attTh('Marked', 'marked', { center: true })}
                      {attTh('Present', 'present', { center: true })}
                      {attTh('Absent', 'absent', { center: true })}
                      {attTh('Attendance %', 'pct', { center: true })}
                      <th style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: C.textS, textTransform: 'uppercase', letterSpacing: '.05em', whiteSpace: 'nowrap', borderBottom: `1px solid ${C.border}`, background: C.surfAlt }}>Last present</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attSorted.map(r => {
                      const p = Number(r.attendance_pct)
                      return (
                        <tr key={r.roll_number} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: '8px 10px', position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{r.name}</div>
                            <div style={{ fontSize: 9, color: C.textS }}>{r.roll_number} · {r.level}</div>
                          </td>
                          <td style={{ padding: '8px 8px', fontSize: 10, color: C.textM, whiteSpace: 'nowrap' }}>{r.batches}</td>
                          {numCell(r.marked)}
                          <td style={{ padding: '7px 8px', textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: 12, color: C.green, fontWeight: 600 }}>{r.present}</td>
                          <td style={{ padding: '7px 8px', textAlign: 'center', fontVariantNumeric: 'tabular-nums', fontSize: 12, color: r.absent > 0 ? C.red : C.border, fontWeight: 600 }}>{r.absent}</td>
                          <td style={{ padding: '7px 8px', textAlign: 'center', minWidth: 96 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: pctColor(p) }}>{p}%</div>
                            <PBar pct={p} h={4} color={pctColor(p)} style={{ marginTop: 3 }}/>
                          </td>
                          <td style={{ padding: '8px 10px', fontSize: 10, color: C.textS, whiteSpace: 'nowrap' }}>{r.last_present || '—'}</td>
                        </tr>
                      )
                    })}
                    {attSorted.length === 0 && (
                      <tr><td colSpan={7} style={{ padding: 30, textAlign: 'center', color: C.textS, fontSize: 12 }}>No students match.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div style={{ fontSize: 10, color: C.textS, marginTop: 10 }}>
                Attendance % = Present ÷ marked sessions. Only students with ≥1 marked live-class record appear ({attTracked} of {total}); the rest are app-only / not in offline batches. Sorted worst-first by default.
              </div>
            </div>
          )}
        </>
      )}

      {/* ── STUB TABS (awaiting data) ── */}
      {!['gcbuddy', 'attendance'].includes(tab) && (() => {
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
