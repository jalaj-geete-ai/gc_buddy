import { useState, useEffect } from 'react'
import { readAuth, writeAuth, watchAuthExpiry, expiryLabel } from '../../lib/adminAuth'
import { C, CURRICULUM, LEVELS } from '../../lib/constants'
import { Btn, Inp, Spin, PBar, Badge } from '../../components/UI'
import { sb } from '../../lib/supabase'

const now = () => Date.now()
const day = 86400000
const dAgo = dt => { if (!dt) return 'Never'; const d = Math.floor((now() - new Date(dt).getTime()) / day); return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d}d ago` }

function engScore({ completedTopics = [], exerciseScores = [], lastActive, streak = 0, testPct = 0, testAttempts = 0 }) {
  const daysSince = lastActive ? Math.floor((now() - new Date(lastActive).getTime()) / day) : 99
  const actPts = daysSince === 0 ? 30 : daysSince <= 1 ? 25 : daysSince <= 3 ? 18 : daysSince <= 7 ? 10 : 0
  const testPts = Math.min(30, Math.round((testAttempts > 0 ? 10 : 0) + (testPct / 100) * 20))
  const topicTotal = Object.values(CURRICULUM).flat().length
  const topicPts = Math.round(Math.min(20, (completedTopics.length / topicTotal) * 20))
  const exAvg = exerciseScores.length ? exerciseScores.reduce((a, b) => a + b, 0) / exerciseScores.length : 0
  const exPts = Math.min(15, Math.round((exerciseScores.length > 0 ? 5 : 0) + (exAvg / 20) * 10))
  const strPts = Math.min(5, streak)
  return Math.min(100, actPts + testPts + topicPts + exPts + strPts)
}

function ScoreRing({ score, size = 44 }) {
  const r = (size / 2) - 5
  const circ = 2 * Math.PI * r
  const color = score >= 70 ? C.green : score >= 40 ? C.amber : C.red
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
        strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.24} fontWeight="700" fill={color}>{score}</text>
    </svg>
  )
}

function MiniSparkline({ vals, h = 24, w = 60 }) {
  if (!vals || vals.length < 2) return <span style={{ fontSize: 9, color: C.textS }}>—</span>
  const max = Math.max(...vals, 1)
  const pts = vals.slice(-10).map((v, i, arr) => {
    const x = (i / (arr.length - 1)) * w
    const y = h - (v / max) * h
    return `${x},${y}`
  }).join(' ')
  const last = vals[vals.length - 1], prev = vals[vals.length - 2]
  const color = last > prev ? C.green : last < prev ? C.red : C.textS
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

const TABS = [
  { id: 'overview', lbl: '📊 Overview' },
  { id: 'students', lbl: '👥 All Students' },
  { id: 'engagement', lbl: '🔥 Engagement' },
  { id: 'tests', lbl: '📝 Tests' },
  { id: 'topics', lbl: '📘 Topics' },
  { id: 'live', lbl: '⚡ Live' },
]

export default function AdminPanel() {
  const [auth, setAuth] = useState(() => readAuth('admin'))
  const [pw, setPw] = useState('')
  const [, setTick] = useState(0)
  const [tab, setTab] = useState('overview')
  const [students, setStudents] = useState([])
  const [testSubs, setTestSubs] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('score')
  const [sortDir, setSortDir] = useState('desc')
  const [expanded, setExpanded] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  // Restore data after a refresh when the session is still valid
  useEffect(() => { if (auth) load() }, [])

  // Auto sign-out when the 24h staff session elapses, even on an idle tab
  useEffect(() => {
    if (!auth) return
    const stop = watchAuthExpiry('admin', () => { setAuth(false); setPw('') })
    const t = setInterval(() => setTick(n => n + 1), 60000)
    return () => { stop(); clearInterval(t) }
  }, [auth])

  function signIn(entered) {
    if (entered !== 'gcbuddy2025') { alert('Wrong password'); return }
    writeAuth('admin', true)
    setAuth(true)
    load()
  }

  function signOut() {
    writeAuth('admin', false)
    setAuth(false)
    setPw('')
  }

  async function load() {
    setLoading(true)
    try {
      const [{ data: approved }, { data: progress }, { data: tests }, { data: ev }] = await Promise.all([
        sb.from('approved_students').select('roll_number,name').order('name'),
        sb.from('student_progress').select('*').order('last_active', { ascending: false }),
        sb.from('daily_test_submissions').select('roll_number,test_id,percentage,score,total_marks,submitted_at'),
        sb.from('usage_events').select('roll_number,section,event_type,created_at').order('created_at', { ascending: false }).limit(2000),
      ])
      const pm = {}; (progress || []).forEach(p => { pm[p.roll_number] = p })
      const testMap = {}; (tests || []).forEach(t => {
        if (!testMap[t.roll_number]) testMap[t.roll_number] = []
        testMap[t.roll_number].push(t)
      })
      const merged = (approved || []).map(a => {
        const p = pm[a.roll_number] || {}
        const myTests = testMap[a.roll_number] || []
        const bestPct = myTests.length ? Math.max(...myTests.map(t => Number(t.percentage))) : 0
        const score = engScore({
          completedTopics: p.completed_topics || [],
          exerciseScores: p.exercise_scores || [],
          lastActive: p.last_active,
          streak: p.streak || 0,
          testPct: bestPct,
          testAttempts: myTests.length,
        })
        return {
          roll_number: a.roll_number,
          name: a.name || '—',
          level: p.level || 'A1',
          completed_topics: p.completed_topics || [],
          exercise_scores: p.exercise_scores || [],
          streak: p.streak || 0,
          last_active: p.last_active || null,
          placement_done: p.placement_done || false,
          _has: !!pm[a.roll_number],
          _tests: myTests,
          _bestTestPct: bestPct,
          _engScore: score,
        }
      })
      setStudents(merged)
      setTestSubs(tests || [])
      setEvents(ev || [])
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  if (!auth) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, padding: '28px 24px', maxWidth: 320, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🛡️</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Coordinator Dashboard</h2>
        <p style={{ fontSize: 11, color: C.textS, marginBottom: 14 }}>GC Buddy Analytics</p>
        <Inp val={pw} set={setPw} ph="Admin password" type="password" style={{ marginBottom: 9 }} autoFocus
          onKeyDown={e => { if (e.key === 'Enter') signIn(pw) }}/>
        <Btn label="Login" onClick={() => signIn(pw)} variant="primary" style={{ width: '100%' }}/>
        <div style={{ marginTop: 10 }}><a href="/" style={{ color: C.blue, fontSize: 11 }}>← Back to App</a></div>
      </div>
    </div>
  )

  async function togglePlacement(roll, current) {
    const newVal = !current
    await sb.from('student_progress').update({ placement_done: newVal }).eq('roll_number', roll)
    setStudents(prev => prev.map(s => s.roll_number === roll ? { ...s, placement_done: newVal } : s))
  }
  const active7 = students.filter(s => s.last_active && now() - new Date(s.last_active).getTime() < 7 * day)
  const atRisk  = students.filter(s => s.last_active && now() - new Date(s.last_active).getTime() >= 7 * day && now() - new Date(s.last_active).getTime() < 15 * day)
  const inactive = students.filter(s => !s.last_active || now() - new Date(s.last_active).getTime() >= 15 * day)
  const lvDist = {}; LEVELS.forEach(lv => lvDist[lv] = 0); students.forEach(s => { if (lvDist[s.level] !== undefined) lvDist[s.level]++ })
  const allExScores = students.flatMap(s => s.exercise_scores)
  const avgEx = allExScores.length ? Math.round(allExScores.reduce((a, b) => a + b, 0) / allExScores.length) : 0
  const avgEng = students.length ? Math.round(students.reduce((a, s) => a + s._engScore, 0) / students.length) : 0

  const placed = students.filter(s => s.placement_done)
  const testPassMap = {}
  testSubs.forEach(t => {
    if (!testPassMap[t.test_id]) testPassMap[t.test_id] = { attempts: 0, passes: 0, students: new Set() }
    testPassMap[t.test_id].attempts++
    testPassMap[t.test_id].students.add(t.roll_number)
    if (Number(t.percentage) >= 50) testPassMap[t.test_id].passes++
  })

  // Section usage from events
  const sectionMap = {}
  events.forEach(e => {
    const s = e.section || 'other'
    if (!sectionMap[s]) sectionMap[s] = { count: 0, users: new Set() }
    sectionMap[s].count++
    sectionMap[s].users.add(e.roll_number)
  })

  // Topic completion
  const topicMap = {}
  Object.values(CURRICULUM).flat().forEach(t => { topicMap[t.id] = { title: t.title, icon: t.icon, done: 0 } })
  students.forEach(s => s.completed_topics.forEach(tid => { if (topicMap[tid]) topicMap[tid].done++ }))

  function getStatusInfo(s) {
    if (!s._has) return { label: 'Not logged in', c: C.textS, bg: C.surfAlt }
    const d = now() - new Date(s.last_active || 0).getTime()
    if (d < 7 * day) return { label: 'Active', c: C.green, bg: C.greenL }
    if (d < 15 * day) return { label: 'At Risk', c: C.amber, bg: C.amberL }
    return { label: 'Inactive', c: C.red, bg: C.redL }
  }

  // ── Sort & filter ──
  const statusFilter = s => {
    if (filterStatus === 'all') return true
    return getStatusInfo(s).label.toLowerCase() === filterStatus.toLowerCase()
  }
  const searched = students.filter(s =>
    statusFilter(s) &&
    (!search || s.name.toLowerCase().includes(search.toLowerCase()) || s.roll_number.includes(search))
  )
  const sorted = [...searched].sort((a, b) => {
    let va, vb
    if (sortBy === 'score') { va = a._engScore; vb = b._engScore }
    else if (sortBy === 'name') { va = a.name; vb = b.name }
    else if (sortBy === 'topics') { va = a.completed_topics.length; vb = b.completed_topics.length }
    else if (sortBy === 'last') { va = a.last_active ? new Date(a.last_active).getTime() : 0; vb = b.last_active ? new Date(b.last_active).getTime() : 0 }
    else if (sortBy === 'tests') { va = a._bestTestPct; vb = b._bestTestPct }
    else if (sortBy === 'streak') { va = a.streak; vb = b.streak }
    if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    return sortDir === 'asc' ? va - vb : vb - va
  })

  function th(label, key, width) {
    const active = sortBy === key
    return (
      <th key={key} onClick={() => { if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(key); setSortDir('desc') } }}
        style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: active ? C.blue : C.textS, textTransform: 'uppercase', letterSpacing: '.05em', cursor: 'pointer', userSelect: 'none', width, whiteSpace: 'nowrap', borderBottom: `1px solid ${C.border}`, background: C.surfAlt }}>
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </th>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: C.navy, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>🛡️ GC Buddy — Coordinator Dashboard</div>
          <span style={{fontSize:9,color:'rgba(255,255,255,.5)',marginLeft:'auto',marginRight:8}} title="Staff sessions end 24 hours after sign-in">{expiryLabel('admin')}</span>
          <button onClick={signOut} style={{ border: '1px solid rgba(255,255,255,.3)', background: 'transparent', color: 'rgba(255,255,255,.85)', borderRadius: 7, padding: '5px 11px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>Log out</button>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{students.length} students enrolled · Avg engagement: {avgEng}/100</div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={load} disabled={loading}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.25)', background: 'transparent', color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
            {loading ? '⏳' : '🔄 Refresh'}
          </button>
          <a href="/?students=1" style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, textDecoration: 'none' }}>👥 Manage</a>
          <a href="/" style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, textDecoration: 'none' }}>← App</a>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${C.border}`, display: 'flex', overflowX: 'auto', padding: '0 16px', flexShrink: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding: '11px 16px', border: 'none', borderBottom: `3px solid ${tab === t.id ? C.blue : 'transparent'}`, background: 'transparent', color: tab === t.id ? C.blue : C.textS, cursor: 'pointer', fontSize: 11, fontWeight: tab === t.id ? 700 : 400, fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            {t.lbl}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Spin sz={28}/><span style={{ color: C.textS, fontSize: 12 }}>Loading all student data...</span>
        </div>
      )}

      {!loading && (
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>

          {/* ── OVERVIEW ── */}
          {tab === 'overview' && (
            <div>
              {/* Hero metric cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 18 }}>
                {[
                  { v: students.length, l: 'Enrolled', ic: '👥', c: C.navy },
                  { v: active7.length, l: 'Active this week', ic: '🟢', c: C.green },
                  { v: atRisk.length, l: 'At risk (7–14d)', ic: '🟡', c: C.amber },
                  { v: inactive.length, l: 'Inactive (15d+)', ic: '🔴', c: C.red },
                  { v: `${avgEng}/100`, l: 'Avg engagement score', ic: '📊', c: C.blue },
                  { v: testSubs.length, l: 'Total test attempts', ic: '📝', c: C.navy },
                  { v: placed.length, l: 'Placed in Germany', ic: '✈️', c: C.green },
                  { v: `${students.length ? Math.round(students.reduce((a, s) => a + s.streak, 0) / students.length) : 0}d`, l: 'Avg streak', ic: '🔥', c: C.amber },
                ].map(({ v, l, ic, c }) => (
                  <div key={l} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '14px 14px' }}>
                    <div style={{ fontSize: 10, color: C.textS, marginBottom: 3 }}>{ic} {l}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: c }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Engagement score distribution */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 18 }}>
                <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                  <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 12 }}>🎯 Engagement Score Distribution</div>
                  {[
                    { l: '70–100 Excellent', min: 70, max: 100, c: C.green, bg: C.greenL },
                    { l: '40–69 Good', min: 40, max: 69, c: C.amber, bg: C.amberL },
                    { l: '0–39 Needs Attention', min: 0, max: 39, c: C.red, bg: C.redL },
                  ].map(({ l, min, max, c, bg }) => {
                    const cnt = students.filter(s => s._engScore >= min && s._engScore <= max).length
                    const pct = students.length ? Math.round((cnt / students.length) * 100) : 0
                    return (
                      <div key={l} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: C.textM }}>{l}</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: c }}>{cnt} ({pct}%)</span>
                        </div>
                        <PBar pct={pct} h={7} color={c}/>
                      </div>
                    )
                  })}
                  {/* Quick at-risk list */}
                  {students.filter(s => s._engScore < 40).length > 0 && (
                    <div style={{ marginTop: 12, padding: '10px', background: C.redL, borderRadius: 8, border: `1px solid ${C.red}33` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: C.red, marginBottom: 6 }}>⚠️ Needs Attention ({students.filter(s => s._engScore < 40).length} students)</div>
                      {students.filter(s => s._engScore < 40).slice(0, 5).map(s => (
                        <div key={s.roll_number} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '3px 0', borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ color: C.navy, fontWeight: 600 }}>{s.name}</span>
                          <span style={{ color: C.textS }}>{dAgo(s.last_active)} · {s._engScore}/100</span>
                        </div>
                      ))}
                      {students.filter(s => s._engScore < 40).length > 5 && (
                        <div style={{ fontSize: 9, color: C.red, marginTop: 4 }}>+{students.filter(s => s._engScore < 40).length - 5} more → go to Students tab</div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                  <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 12 }}>📊 Level Distribution</div>
                  {LEVELS.map(lv => {
                    const cnt = lvDist[lv] || 0
                    const pct = students.length ? Math.round((cnt / students.length) * 100) : 0
                    const c = lv === 'A1' ? C.blue : lv === 'A2' ? C.green : lv === 'B1' ? C.amber : C.red
                    return (
                      <div key={lv} style={{ marginBottom: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>Level {lv}</span>
                          <span style={{ fontSize: 11, color: C.textS }}>{cnt} students · {pct}%</span>
                        </div>
                        <PBar pct={pct} h={8} color={c}/>
                      </div>
                    )
                  })}
                  <div style={{ marginTop: 12, padding: '10px', background: C.surfAlt, borderRadius: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: C.navy, marginBottom: 6 }}>Section Usage (all students)</div>
                    {Object.entries(sectionMap).sort((a, b) => b[1].count - a[1].count).slice(0, 5).map(([sec, data]) => {
                      const ic = { curriculum:'📘', daily_test:'📝', exercise:'💪', listening:'🎙️', interview:'🎭', gcbuddy:'🇩🇪', login:'🔑' }
                      return (
                        <div key={sec} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, padding: '3px 0', borderBottom: `1px solid ${C.border}` }}>
                          <span style={{ color: C.textM }}>{ic[sec] || '📌'} {sec.replace(/_/g, ' ')}</span>
                          <span style={{ fontWeight: 600, color: C.navy }}>{data.count} ({data.users.size} students)</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Completion funnel */}
              <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 12 }}>🔽 Student Progression Funnel</div>
                {[
                  { l: 'Registered', n: students.length, c: C.blue },
                  { l: 'Logged in at least once', n: students.filter(s => s._has).length, c: C.navyM },
                  { l: 'Took at least 1 test', n: [...new Set(testSubs.map(t => t.roll_number))].length, c: C.green },
                  { l: 'Passed at least 1 test (≥50%)', n: [...new Set(testSubs.filter(t => Number(t.percentage) >= 50).map(t => t.roll_number))].length, c: C.amber },
                  { l: 'Completed 10+ curriculum topics', n: students.filter(s => s.completed_topics.length >= 10).length, c: '#e67e22' },
                  { l: 'Completed 30+ curriculum topics', n: students.filter(s => s.completed_topics.length >= 30).length, c: C.red },
                ].map(({ l, n, c }) => {
                  const pct = students.length ? Math.round((n / students.length) * 100) : 0
                  return (
                    <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 180, fontSize: 11, color: C.textM, flexShrink: 0 }}>{l}</div>
                      <div style={{ flex: 1 }}>
                        <PBar pct={pct} h={7} color={c}/>
                      </div>
                      <div style={{ width: 70, fontSize: 11, fontWeight: 600, color: c, textAlign: 'right' }}>{n} ({pct}%)</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── STUDENTS TABLE ── */}
          {tab === 'students' && (
            <div>
              {/* Filter bar */}
              <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <Inp val={search} set={setSearch} ph="Search name or roll number..." style={{ flex: 1, minWidth: 200 }}/>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[
                    ['all', 'All', students.length, C.navy],
                    ['active', 'Active', active7.length, C.green],
                    ['at risk', 'At Risk', atRisk.length, C.amber],
                    ['inactive', 'Inactive', inactive.length, C.red],
                    ['not logged in', 'Not Logged In', students.filter(s => !s._has).length, C.textS],
                  ].map(([val, lbl, cnt, c]) => (
                    <button key={val} onClick={() => setFilterStatus(val)}
                      style={{ padding: '6px 12px', borderRadius: 8, border: `1px solid ${filterStatus === val ? c : C.border}`, background: filterStatus === val ? '#fff' : '#fff', color: filterStatus === val ? c : C.textS, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: filterStatus === val ? 700 : 400, boxShadow: filterStatus === val ? `inset 0 0 0 1px ${c}` : 'none' }}>
                      {lbl} <span style={{ fontSize: 10, opacity: 0.7 }}>({cnt})</span>
                    </button>
                  ))}
                </div>
                <span style={{ fontSize: 11, color: C.textS }}>{sorted.length} students</span>
              </div>

              {/* Students table */}
              <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead>
                      <tr>
                        {th('Student', 'name', '180px')}
                        {th('Score', 'score', '80px')}
                        {th('Level', 'level', '60px')}
                        {th('Topics', 'topics', '70px')}
                        {th('Best Test', 'tests', '80px')}
                        {th('Streak', 'streak', '65px')}
                        {th('Last Active', 'last', '100px')}
                        <th style={{ padding: '8px 10px', fontSize: 9, fontWeight: 700, color: C.textS, textTransform: 'uppercase', letterSpacing: '.05em', background: C.surfAlt, borderBottom: `1px solid ${C.border}`, width: '90px' }}>STATUS</th>
                        <th style={{ padding: '8px 10px', fontSize: 9, fontWeight: 700, color: C.textS, textTransform: 'uppercase', letterSpacing: '.05em', background: C.surfAlt, borderBottom: `1px solid ${C.border}`, width: '70px' }}>TREND</th>
                        <th style={{ padding: '8px 10px', fontSize: 9, fontWeight: 700, color: C.textS, textTransform: 'uppercase', letterSpacing: '.05em', background: C.surfAlt, borderBottom: `1px solid ${C.border}`, width: '80px' }}>PLACED</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((s, i) => {
                        const st = getStatusInfo(s)
                        const isExp = expanded === s.roll_number
                        const topicTotal = Object.values(CURRICULUM).flat().length
                        return (
                          <>
                            <tr key={s.roll_number}
                              style={{ borderBottom: `1px solid ${C.border}`, background: isExp ? C.blueL : i % 2 === 0 ? '#fff' : C.surfAlt, cursor: 'pointer' }}
                              onClick={() => setExpanded(isExp ? null : s.roll_number)}>
                              <td style={{ padding: '10px 10px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.navy, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                                    {(s.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600, color: C.navy, fontSize: 11 }}>{s.name}</div>
                                    <div style={{ fontSize: 9, color: C.textS }}>{s.roll_number}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '10px 10px' }}>
                                <ScoreRing score={s._engScore} size={40}/>
                              </td>
                              <td style={{ padding: '10px 10px' }}>
                                <span style={{ background: C.blueL, color: C.blue, fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>{s.level}</span>
                              </td>
                              <td style={{ padding: '10px 10px' }}>
                                <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{s.completed_topics.length}<span style={{ color: C.textS, fontWeight: 400 }}>/{topicTotal}</span></div>
                                <PBar pct={Math.round((s.completed_topics.length / topicTotal) * 100)} h={3} color={C.blue} style={{ marginTop: 3 }}/>
                              </td>
                              <td style={{ padding: '10px 10px' }}>
                                {s._tests.length > 0 ? (
                                  <span style={{ fontSize: 12, fontWeight: 700, color: s._bestTestPct >= 50 ? C.green : C.red }}>{Math.round(s._bestTestPct)}%</span>
                                ) : <span style={{ fontSize: 10, color: C.textS }}>—</span>}
                              </td>
                              <td style={{ padding: '10px 10px' }}>
                                <span style={{ fontSize: 12, fontWeight: 600, color: s.streak >= 7 ? C.green : s.streak >= 3 ? C.amber : C.textS }}>{s.streak}🔥</span>
                              </td>
                              <td style={{ padding: '10px 10px' }}>
                                <div style={{ fontSize: 11, color: C.textM }}>{dAgo(s.last_active)}</div>
                              </td>
                              <td style={{ padding: '10px 10px' }}>
                                <span style={{ background: st.bg, color: st.c, fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>{st.label}</span>
                              </td>
                              <td style={{ padding: '10px 10px' }}>
                                <MiniSparkline vals={s.exercise_scores.slice(-8)} h={22} w={55}/>
                              </td>
                              <td style={{ padding: '10px 10px' }} onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => togglePlacement(s.roll_number, s.placement_done)}
                                  style={{ padding: '4px 10px', borderRadius: 8, border: `1px solid ${s.placement_done ? C.green : C.border}`, background: s.placement_done ? C.greenL : '#fff', color: s.placement_done ? C.green : C.textS, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                                  {s.placement_done ? '✅ Placed' : '○ Not placed'}
                                </button>
                              </td>
                            </tr>
                            {isExp && (
                              <tr key={`${s.roll_number}-exp`}>
                                <td colSpan={9} style={{ padding: '14px 16px', background: '#fff', borderBottom: `1px solid ${C.border}` }}>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 12 }}>
                                    {[
                                      { l: 'Eng. Score', v: `${s._engScore}/100`, c: s._engScore >= 70 ? C.green : s._engScore >= 40 ? C.amber : C.red },
                                      { l: 'Streak', v: `${s.streak} days 🔥`, c: C.amber },
                                      { l: 'Test Attempts', v: s._tests.length, c: C.blue },
                                      { l: 'Best Test', v: s._tests.length ? `${Math.round(s._bestTestPct)}%` : '—', c: s._bestTestPct >= 50 ? C.green : C.red },
                                      { l: 'Ex. Sessions', v: s.exercise_scores.length, c: C.navy },
                                    ].map(({ l, v, c }) => (
                                      <div key={l} style={{ background: C.surfAlt, borderRadius: 9, padding: '8px 10px', border: `1px solid ${C.border}` }}>
                                        <div style={{ fontSize: 9, color: C.textS }}>{l}</div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: c, marginTop: 2 }}>{v}</div>
                                      </div>
                                    ))}
                                  </div>
                                  {/* Placement toggle */}
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: s.placement_done ? C.greenL : C.amberL, borderRadius: 10, border: `1px solid ${s.placement_done ? C.green : C.amber}44`, marginBottom: 12 }}>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>Placement Status</div>
                                      <div style={{ fontSize: 10, color: C.textS, marginTop: 2 }}>
                                        {s.placement_done ? 'This student has been placed in Germany.' : 'This student has not been placed yet.'}
                                      </div>
                                    </div>
                                    <button
                                      onClick={() => togglePlacement(s.roll_number, s.placement_done)}
                                      style={{ padding: '7px 14px', borderRadius: 9, border: `1px solid ${s.placement_done ? C.green : C.border}`, background: s.placement_done ? C.green : '#fff', color: s.placement_done ? '#fff' : C.textM, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                                      {s.placement_done ? '✅ Placed — click to undo' : '○ Mark as Placed'}
                                    </button>
                                  </div>
                                  {/* Tests taken */}
                                  {s._tests.length > 0 && (
                                    <div style={{ marginBottom: 10 }}>
                                      <div style={{ fontSize: 10, fontWeight: 700, color: C.textS, marginBottom: 5 }}>TEST HISTORY</div>
                                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {s._tests.map((t, i) => (
                                          <div key={i} style={{ background: Number(t.percentage) >= 50 ? C.greenL : C.redL, border: `1px solid ${Number(t.percentage) >= 50 ? C.green : C.red}44`, borderRadius: 8, padding: '4px 10px', fontSize: 10 }}>
                                            <div style={{ fontWeight: 600, color: C.navy }}>{t.test_id}</div>
                                            <div style={{ color: Number(t.percentage) >= 50 ? C.green : C.red, fontWeight: 700 }}>{t.score}/{t.total_marks} ({Number(t.percentage).toFixed(0)}%)</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {/* Topics */}
                                  <div>
                                    <div style={{ fontSize: 10, fontWeight: 700, color: C.textS, marginBottom: 6 }}>TOPICS ({s.completed_topics.length}/{Object.values(CURRICULUM).flat().length})</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                      {Object.values(CURRICULUM).flat().slice(0, 20).map(t => {
                                        const done = s.completed_topics.includes(t.id)
                                        return (
                                          <div key={t.id} style={{ padding: '2px 8px', borderRadius: 10, fontSize: 9, fontWeight: 600, background: done ? C.greenL : C.surfAlt, color: done ? C.green : C.textS, border: `1px solid ${done ? C.green + '44' : C.border}` }}>
                                            {t.title}
                                          </div>
                                        )
                                      })}
                                      {Object.values(CURRICULUM).flat().length > 20 && <div style={{ fontSize: 9, color: C.textS, padding: '2px 0' }}>+{Object.values(CURRICULUM).flat().length - 20} more topics</div>}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                  {sorted.length === 0 && <div style={{ textAlign: 'center', padding: 36, color: C.textS }}>No students found</div>}
                </div>
              </div>
            </div>
          )}

          {/* ── ENGAGEMENT ── */}
          {tab === 'engagement' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 18 }}>
                {[
                  { label: '🟢 Active', sub: 'Last 7 days', list: active7, c: C.green, bg: C.greenL },
                  { label: '🟡 At Risk', sub: '8–14 days inactive', list: atRisk, c: C.amber, bg: C.amberL },
                  { label: '🔴 Needs Attention', sub: '15+ days inactive', list: inactive, c: C.red, bg: C.redL },
                ].map(({ label, sub, list, c, bg }) => (
                  <div key={label} style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '14px' }}>
                    <div style={{ fontWeight: 700, color: c, fontSize: 13, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 10, color: C.textS, marginBottom: 10 }}>{sub}</div>
                    <div style={{ fontSize: 30, fontWeight: 700, color: c, marginBottom: 12 }}>{list.length}</div>
                    <div style={{ maxHeight: 200, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {list.sort((a, b) => a._engScore - b._engScore).map(s => (
                        <div key={s.roll_number} style={{ background: bg, borderRadius: 8, padding: '6px 9px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: 600, color: C.navy, fontSize: 11 }}>{s.name}</div>
                            <span style={{ fontSize: 10, fontWeight: 700, color: c }}>{s._engScore}</span>
                          </div>
                          <div style={{ color: C.textS, fontSize: 9, marginTop: 1 }}>{dAgo(s.last_active)} · {s.level} · {s.completed_topics.length} topics</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Engagement leaderboard */}
              <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px', marginBottom: 14 }}>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 12 }}>🏆 Top 10 Students by Engagement</div>
                {[...students].sort((a, b) => b._engScore - a._engScore).slice(0, 10).map((s, i) => (
                  <div key={s.roll_number} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 9 ? `1px solid ${C.border}` : 'none' }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: i < 3 ? '#000' : C.textS, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{s.name}</div>
                      <div style={{ fontSize: 9, color: C.textS }}>{s.level} · {s.completed_topics.length} topics · {s.streak}🔥 streak</div>
                    </div>
                    <ScoreRing score={s._engScore} size={38}/>
                  </div>
                ))}
              </div>

              {/* Streak leaderboard */}
              <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 12 }}>🔥 Streak Leaderboard</div>
                {[...students].sort((a, b) => b.streak - a.streak).slice(0, 10).map((s, i) => (
                  <div key={s.roll_number} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 0', borderBottom: i < 9 ? `1px solid ${C.border}` : 'none' }}>
                    <span style={{ width: 18, fontSize: 10, color: C.textS, flexShrink: 0 }}>{i + 1}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: C.navy }}>{s.name}</div>
                      <div style={{ fontSize: 9, color: C.textS }}>{s.level}</div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: C.amber }}>{s.streak} 🔥</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── TESTS ── */}
          {tab === 'tests' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
                {[
                  { v: testSubs.length, l: 'Total submissions', c: C.blue },
                  { v: testSubs.filter(t => Number(t.percentage) >= 50).length, l: 'Passes (≥50%)', c: C.green },
                  { v: testSubs.length ? `${Math.round(testSubs.reduce((a, t) => a + Number(t.percentage), 0) / testSubs.length)}%` : '—', l: 'Avg score', c: C.navy },
                ].map(({ v, l, c }) => (
                  <div key={l} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '14px' }}>
                    <div style={{ fontSize: 10, color: C.textS, marginBottom: 3 }}>{l}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: c }}>{v}</div>
                  </div>
                ))}
              </div>

              {/* Per-test stats */}
              {Object.entries(testPassMap).sort((a, b) => a[0].localeCompare(b[0])).map(([tid, data]) => {
                const passRate = data.attempts ? Math.round((data.passes / data.attempts) * 100) : 0
                const scores = testSubs.filter(t => t.test_id === tid).map(t => Number(t.percentage))
                const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
                const best = scores.length ? Math.max(...scores) : 0
                return (
                  <div key={tid} style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '14px 16px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{tid}</div>
                        <div style={{ fontSize: 10, color: C.textS }}>{data.students.size} students attempted · {data.attempts} total submissions</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: passRate >= 50 ? C.green : C.red }}>{passRate}%</div>
                        <div style={{ fontSize: 9, color: C.textS }}>pass rate</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
                      {[['Avg score', `${avg}%`, C.blue], ['Best score', `${Math.round(best)}%`, C.green], ['Passes', data.passes, C.green]].map(([l, v, c]) => (
                        <div key={l} style={{ background: C.surfAlt, borderRadius: 8, padding: '8px', textAlign: 'center' }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
                          <div style={{ fontSize: 9, color: C.textS }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <PBar pct={passRate} h={8} color={passRate >= 50 ? C.green : C.red}/>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: C.textS, marginTop: 3 }}>
                      <span>0%</span><span style={{ color: C.green }}>50% = pass</span><span>100%</span>
                    </div>
                  </div>
                )
              })}
              {Object.keys(testPassMap).length === 0 && (
                <div style={{ textAlign: 'center', padding: 48, color: C.textS }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📝</div>
                  <div>No test submissions yet</div>
                </div>
              )}
            </div>
          )}

          {/* ── TOPICS ── */}
          {tab === 'topics' && (
            <div>
              {LEVELS.map(lv => (
                <div key={lv} style={{ marginBottom: 16 }}>
                  <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 8 }}>
                    <span style={{ background: C.blueL, color: C.blue, padding: '3px 10px', borderRadius: 12, fontSize: 11 }}>Level {lv}</span>
                  </div>
                  {CURRICULUM[lv].map(t => {
                    const cnt = topicMap[t.id]?.done || 0
                    const pct = students.length ? Math.round((cnt / students.length) * 100) : 0
                    const c = pct >= 75 ? C.green : pct >= 40 ? C.blue : pct >= 15 ? C.amber : C.red
                    return (
                      <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, padding: '8px 12px', background: '#fff', borderRadius: 9, border: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 14, flexShrink: 0 }}>{t.icon}</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: C.navy, marginBottom: 3 }}>{t.title}</div>
                          <PBar pct={pct} h={5} color={c}/>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: c }}>{cnt}/{students.length}</div>
                          <div style={{ fontSize: 9, color: C.textS }}>{pct}%</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          )}

          {/* ── LIVE ── */}
          {tab === 'live' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 9, marginBottom: 16 }}>
                {Object.entries(sectionMap).sort((a, b) => b[1].count - a[1].count).slice(0, 8).map(([sec, data]) => {
                  const ic = { curriculum:'📘', daily_test:'📝', exercise:'💪', listening:'🎙️', interview:'🎭', gcbuddy:'🇩🇪', login:'🔑', session_start:'🔑' }
                  return (
                    <div key={sec} style={{ background: '#fff', borderRadius: 11, border: `1px solid ${C.border}`, padding: '12px' }}>
                      <div style={{ fontSize: 18, marginBottom: 3 }}>{ic[sec] || '📌'}</div>
                      <div style={{ fontWeight: 600, color: C.navy, fontSize: 11, textTransform: 'capitalize', marginBottom: 2 }}>{sec.replace(/_/g, ' ')}</div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: C.blue }}>{data.count}</div>
                      <div style={{ fontSize: 9, color: C.textS }}>{data.users.size} students</div>
                    </div>
                  )
                })}
              </div>

              <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px' }}>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 10 }}>📋 Recent Events (Last 100)</div>
                <div style={{ maxHeight: 500, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {events.length === 0
                    ? <div style={{ textAlign: 'center', padding: 24, color: C.textS }}>No events yet</div>
                    : events.slice(0, 100).map((e, i) => {
                      const st = students.find(s => s.roll_number === e.roll_number)
                      const ic = { session_start:'🔑', lesson_start:'📖', lesson_complete:'✅', exercise_complete:'🏆', daily_test_complete:'📝', interview_complete:'🎖️', level_up:'🎓' }
                      const dt = new Date(e.created_at)
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 9px', background: C.surfAlt, borderRadius: 7, fontSize: 11 }}>
                          <span style={{ fontSize: 13, flexShrink: 0 }}>{ic[e.event_type] || '📌'}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{ fontWeight: 600, color: C.navy }}>{st?.name || e.roll_number}</span>
                            <span style={{ color: C.textS }}> · {e.event_type?.replace(/_/g, ' ')}</span>
                          </div>
                          <div style={{ fontSize: 9, color: C.textS, flexShrink: 0, textAlign: 'right', whiteSpace: 'nowrap' }}>
                            {dt.toLocaleDateString([], { day:'numeric', month:'short' })}<br/>
                            {dt.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}
