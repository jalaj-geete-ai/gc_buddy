import { useState, useEffect } from 'react'
import { readAuth, writeAuth, watchAuthExpiry, expiryLabel } from '../../lib/adminAuth'
import { C, LEVELS } from '../../lib/constants'
import { Btn, Inp, Spin, PBar, Badge } from '../../components/UI'
import { sb } from '../../lib/supabase'

const now = () => Date.now()
const day = 86400000
const dAgo = dt => { if (!dt) return 'Never'; const d = Math.floor((now() - new Date(dt).getTime()) / day); return d === 0 ? 'Today' : d === 1 ? 'Yesterday' : `${d}d ago` }

// The GC Buddy student journey, in order. `count` names a numeric field from the
// RPC to surface inside the cell (instead of a plain tick) so admins see depth,
// not just done/not-done.
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

export default function FunnelDashboard() {
  const [auth, setAuth] = useState(() => readAuth('admin'))
  const [pw, setPw] = useState('')
  const [, setTick] = useState(0)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')
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
      const { data, error } = await sb.rpc('get_student_funnel')
      if (error) throw error
      // Demo/BD accounts are excluded from the funnel (they exist only for demos).
      setRows((data || []).filter(r => !r.is_demo))
    } catch (e) { console.error('funnel load:', e.message) }
    setLoading(false)
  }

  function exportCsv() {
    const head = ['Roll', 'Name', 'Level', 'Last active', 'Steps', ...STEPS.map(s => s.short)]
    const lines = sorted.map(s => [
      s.roll_number, `"${(s.name || '').replace(/"/g, '""')}"`, s.level,
      s.last_active ? new Date(s.last_active).toISOString().slice(0, 10) : '',
      stepsDone(s), ...STEPS.map(st => (s[st.key] ? 1 : 0)),
    ].join(','))
    const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `gcbuddy_funnel_${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  }

  if (!auth) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, padding: '28px 24px', maxWidth: 320, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>🫇</div>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: C.navy, marginBottom: 4 }}>Student Funnel</h2>
        <p style={{ fontSize: 11, color: C.textS, marginBottom: 14 }}>Per-student journey view</p>
        <Inp val={pw} set={setPw} ph="Admin password" type="password" style={{ marginBottom: 9 }} autoFocus
          onKeyDown={e => { if (e.key === 'Enter') signIn(pw) }}/>
        <Btn label="Login" onClick={() => signIn(pw)} variant="primary" style={{ width: '100%' }}/>
        <div style={{ marginTop: 10 }}><a href="/" style={{ color: C.blue, fontSize: 11 }}>← Back to App</a></div>
      </div>
    </div>
  )

  // ── Aggregate reach per step (drop-off shape, in journey order) ──
  const total = rows.length
  const reach = STEPS.map(st => ({ ...st, n: rows.filter(r => r[st.key]).length }))

  // ── Filter + sort ──
  const filtered = rows.filter(s =>
    (levelFilter === 'all' || s.level === levelFilter) &&
    (!search || (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.roll_number || '').toLowerCase().includes(search.toLowerCase()))
  )
  const sorted = [...filtered].sort((a, b) => {
    let va, vb
    if (sortBy === 'name') { va = a.name || ''; vb = b.name || '' }
    else if (sortBy === 'level') { va = a.level; vb = b.level }
    else if (sortBy === 'last') { va = a.last_active ? new Date(a.last_active).getTime() : 0; vb = b.last_active ? new Date(b.last_active).getTime() : 0 }
    else if (sortBy === 'tests') { va = a.test_count; vb = b.test_count }
    else if (sortBy === 'vocab') { va = a.vocab_day; vb = b.vocab_day }
    else { va = stepsDone(a); vb = stepsDone(b) }
    if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    return sortDir === 'asc' ? va - vb : vb - va
  })

  const avgSteps = total ? (rows.reduce((a, s) => a + stepsDone(s), 0) / total).toFixed(1) : '0'

  function th(label, key, extra = {}) {
    const active = sortBy === key
    return (
      <th key={key} onClick={() => { if (sortBy === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortBy(key); setSortDir('desc') } }}
        style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, fontWeight: 700, color: active ? C.blue : C.textS, textTransform: 'uppercase', letterSpacing: '.05em', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', borderBottom: `1px solid ${C.border}`, background: C.surfAlt, ...extra }}>
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : ''}
      </th>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: C.navy, padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>🫇 GC Buddy — Student Funnel</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,.4)' }}>{total} students · avg {avgSteps}/{STEPS.length} steps done · <span title="Staff sessions end 24h after sign-in">{expiryLabel('admin')}</span></div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={load} disabled={loading} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.25)', background: 'transparent', color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>{loading ? '⏳' : '🔄 Refresh'}</button>
          <button onClick={exportCsv} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,.25)', background: 'transparent', color: '#fff', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>⬇ CSV</button>
          <a href="/?admin=1" style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, textDecoration: 'none' }}>🛡️ Admin</a>
          <a href="/" style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, textDecoration: 'none' }}>← App</a>
        </div>
      </div>

      {loading && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <Spin sz={28}/><span style={{ color: C.textS, fontSize: 12 }}>Loading student funnel…</span>
        </div>
      )}

      {!loading && (
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>

          {/* ── Aggregate funnel (journey order) ── */}
          <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 18px', marginBottom: 18 }}>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginBottom: 3 }}>🧭 Journey reach — how many students reached each step</div>
            <div style={{ fontSize: 10.5, color: C.textS, marginBottom: 14 }}>Students complete activities in any order, so this is step-coverage across the cohort (not a strict sequential funnel). Ordered along the intended journey.</div>
            {reach.map((st, i) => {
              const pct = total ? Math.round((st.n / total) * 100) : 0
              const drop = i > 0 ? reach[i - 1].n - st.n : 0
              return (
                <div key={st.key} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 3 }}>
                    <span style={{ fontSize: 11.5, color: C.textM, fontWeight: 600 }}>{st.icon} {st.short}</span>
                    <span style={{ fontSize: 11, color: C.textS }}>
                      <b style={{ color: C.navy }}>{st.n}</b> · {pct}%
                      {i > 0 && drop > 0 && <span style={{ color: C.red, marginLeft: 7 }}>▼ {drop}</span>}
                    </span>
                  </div>
                  <PBar pct={pct} h={9} color={pct >= 60 ? C.green : pct >= 30 ? C.amber : C.red}/>
                </div>
              )
            })}
          </div>

          {/* ── Controls ── */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 180 }}><Inp val={search} set={setSearch} ph="🔍 Search name or roll number"/></div>
            <div style={{ display: 'flex', gap: 4 }}>
              {['all', ...LEVELS].map(l => (
                <button key={l} onClick={() => setLevelFilter(l)}
                  style={{ padding: '7px 12px', borderRadius: 8, border: `1.5px solid ${levelFilter === l ? C.blue : C.border}`, background: levelFilter === l ? C.blueL : '#fff', color: levelFilter === l ? C.blue : C.textS, cursor: 'pointer', fontSize: 11, fontWeight: 600, fontFamily: 'inherit' }}>
                  {l === 'all' ? 'All' : l}
                </button>
              ))}
            </div>
            <span style={{ fontSize: 11, color: C.textS }}>{sorted.length} shown</span>
          </div>

          {/* ── Per-student table ── */}
          <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr>
                  {th('Student', 'name', { position: 'sticky', left: 0, zIndex: 2, minWidth: 150 })}
                  {th('Lvl', 'level')}
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
                  return (
                    <tr key={s.roll_number} style={{ borderBottom: `1px solid ${C.border}` }}>
                      <td style={{ padding: '8px 10px', position: 'sticky', left: 0, background: '#fff', zIndex: 1, borderRight: `1px solid ${C.border}` }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: C.navy, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 160 }}>{s.name}</div>
                        <div style={{ fontSize: 9, color: C.textS }}>{s.roll_number}</div>
                      </td>
                      <td style={{ padding: '8px 8px' }}><Badge label={s.level} color={C.blue} bg={C.blueL}/></td>
                      {STEPS.map(st => {
                        const done2 = !!s[st.key]
                        const cnt = st.count ? s[st.count] : null
                        return (
                          <td key={st.key} style={{ padding: '6px 4px', textAlign: 'center' }}>
                            {done2 ? (
                              <span title={st.desc} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 22, height: 22, borderRadius: 6, background: C.greenL, color: C.green, fontSize: cnt ? 10 : 12, fontWeight: 700, padding: '0 5px' }}>
                                {cnt ? `${cnt}${st.unit || ''}` : '✓'}
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
                      <td style={{ padding: '8px 10px', fontSize: 10, color: C.textS, whiteSpace: 'nowrap' }}>{dAgo(s.last_active)}</td>
                    </tr>
                  )
                })}
                {sorted.length === 0 && (
                  <tr><td colSpan={STEPS.length + 4} style={{ padding: 30, textAlign: 'center', color: C.textS, fontSize: 12 }}>No students match.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div style={{ fontSize: 10, color: C.textS, marginTop: 10 }}>
            ✓ = step done · numbers show depth (vocab days, topics, exercises, listening plays, tests, tutor messages). Demo/BD accounts excluded.
          </div>
        </div>
      )}
    </div>
  )
}
