import { useState, useEffect } from 'react'
import { C, CURRICULUM, LEVELS } from '../lib/constants'
import { PBar, Spin, Btn } from '../components/UI'
import { sb } from '../lib/supabase'

const TEST_LABELS = { A1_T1:'Test 1: Phonetics', A1_T2:'Test 2: Greetings & Sein', A1_T3:'Test 3: End-of-Block', A2_T1:'Test 1: Clauses', A2_T2:'Test 2: Adjectives', A2_T3:'Test 3: End-of-Block', B1_T1:'Test 1: Infinitives', B1_T2:'Test 2: Konjunktiv', B1_T3:'Test 3: End-of-Block' }
const TEST_MARKS  = { A1_T1:20, A1_T2:30, A1_T3:50, A2_T1:30, A2_T2:30, A2_T3:40, B1_T1:30, B1_T2:30, B1_T3:40 }
const LEVEL_TESTS = { A1:['A1_T1','A1_T2','A1_T3'], A2:['A2_T1','A2_T2','A2_T3'], B1:['B1_T1','B1_T2','B1_T3'], B2:[] }

// Score a student's engagement 0–100
function engagementScore({ testData, completedTopics, exerciseScores, lastActive, streak }) {
  const now = Date.now(), day = 86400000
  // Activity (30 pts): active in last 7 days
  const daysSince = lastActive ? Math.floor((now - new Date(lastActive).getTime()) / day) : 99
  const activityPts = daysSince === 0 ? 30 : daysSince <= 1 ? 25 : daysSince <= 3 ? 18 : daysSince <= 7 ? 10 : 0
  // Tests (30 pts): attempts and best scores
  const testAttempts = testData.length
  const testsBest = testData.length ? Math.max(...testData.map(t => Number(t.percentage))) : 0
  const testPts = Math.min(30, Math.round((testAttempts > 0 ? 10 : 0) + (testsBest / 100) * 20))
  // Topics (20 pts)
  const totalTopics = Object.values(CURRICULUM).flat().length
  const topicPts = Math.round(Math.min(20, (completedTopics / totalTopics) * 20))
  // Exercises (15 pts)
  const exAvg = exerciseScores.length ? exerciseScores.reduce((a, b) => a + b, 0) / exerciseScores.length : 0
  const exPts = Math.min(15, Math.round((exerciseScores.length > 0 ? 5 : 0) + (exAvg / 20) * 10))
  // Streak (5 pts)
  const streakPts = Math.min(5, streak)
  return Math.min(100, activityPts + testPts + topicPts + exPts + streakPts)
}

function ScoreRing({ score, size = 80, color: colorOverride }) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const fill = (score / 100) * circ
  const color = colorOverride || (score >= 70 ? C.green : score >= 40 ? C.amber : C.red)
  return (
    <svg width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={7}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={7}
        strokeDasharray={`${fill} ${circ}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x={size/2} y={size/2 + 1} textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.22} fontWeight="700" fill={color}>{score}</text>
      <text x={size/2} y={size/2 + size*0.16} textAnchor="middle" dominantBaseline="middle"
        fontSize={size * 0.1} fill={C.textS}>/ 100</text>
    </svg>
  )
}

function MiniBar({ scores, h = 40 }) {
  if (!scores.length) return null
  const max = Math.max(...scores, 1)
  return (
    <div style={{ display:'flex', gap:3, alignItems:'flex-end', height:h }}>
      {scores.slice(-20).map((s, i) => (
        <div key={i} style={{ flex:1, borderRadius:'3px 3px 0 0', height: Math.max(3, (s / max) * h),
          background: s >= max * 0.7 ? C.green : s >= max * 0.4 ? C.amber : C.red }} title={`${s}`}/>
      ))}
    </div>
  )
}

export default function PerformancePage({ user, completedTopics, exerciseScores, progress }) {
  const [loading, setLoading] = useState(true)
  const [testData, setTestData] = useState([])
  const [usageEvents, setUsageEvents] = useState([])
  const [tab, setTab] = useState('overview')

  useEffect(() => { if (user?.rollNumber) load() }, [user])
  useEffect(() => {
    const h = () => { if (user?.rollNumber) load() }
    window.addEventListener('focus', h)
    return () => window.removeEventListener('focus', h)
  }, [user])

  async function load() {
    setLoading(true)
    const [{ data: tests }, { data: events }] = await Promise.all([
      sb.from('daily_test_submissions').select('*').eq('roll_number', user.rollNumber).order('submitted_at', { ascending: true }),
      sb.from('usage_events').select('section, event_type, created_at').eq('roll_number', user.rollNumber).order('created_at', { ascending: false }).limit(500),
    ])
    setTestData(tests || [])
    setUsageEvents(events || [])
    setLoading(false)
  }

  const exScores = exerciseScores || []
  const completedCount = completedTopics?.length || 0
  const curLevel = user?.level || 'A1'
  const myTests = LEVEL_TESTS[curLevel] || []

  // Test helpers
  const byTest = tid => testData.filter(d => d.test_id === tid)
  const bestPct = tid => { const d = byTest(tid); return d.length ? Math.max(...d.map(r => Number(r.percentage))) : null }
  const avgPct  = tid => { const d = byTest(tid); return d.length ? Math.round(d.reduce((a, r) => a + Number(r.percentage), 0) / d.length) : null }
  const clearedTests = myTests.filter(tid => (bestPct(tid) || 0) >= 60).length
  const requiredCleared = Math.ceil(myTests.length * 0.9)
  const passedTests = clearedTests  // alias for existing UI references
  const levelUpReached = myTests.length > 0 && clearedTests >= requiredCleared
  const overallAvg  = testData.length ? Math.round(testData.reduce((a, r) => a + Number(r.percentage), 0) / testData.length) : 0

  // Section usage counts
  const sectionCounts = usageEvents.reduce((acc, e) => {
    const s = e.section || 'other'
    acc[s] = (acc[s] || 0) + 1
    return acc
  }, {})

  // Activity heatmap: last 28 days
  const now = Date.now(), day = 86400000
  const activeDays = new Set(usageEvents.map(e => new Date(e.created_at).toDateString()))
  const heatmap = Array.from({ length: 28 }, (_, i) => {
    const d = new Date(now - (27 - i) * day)
    return { date: d, active: activeDays.has(d.toDateString()) }
  })
  const activeThisWeek = heatmap.slice(-7).filter(d => d.active).length
  const streak = progress?.streak || 0

  // Engagement score
  const engScore = engagementScore({
    testData, completedTopics: completedCount,
    exerciseScores: exScores, lastActive: progress?.last_active, streak
  })
  // Brand-new / barely-started learners shouldn't be greeted with a red "needs
  // attention" score — welcome them and frame the score as something that climbs.
  const barelyStarted = testData.length === 0 && exScores.length === 0 && completedCount <= 1
  const engColor = barelyStarted ? C.blue : engScore >= 70 ? C.green : engScore >= 40 ? C.amber : C.red
  const engLabel = barelyStarted ? 'Getting Started' : engScore >= 70 ? 'Excellent' : engScore >= 40 ? 'Good' : 'Building Momentum'
  const engBlurb = barelyStarted
    ? 'Welcome! Complete your first lesson and Daily Test — your score climbs as you learn.'
    : 'Based on your activity, test scores, topics completed, and consistency.'

  // Curriculum progress per level
  const levelProgress = LEVELS.map(lv => ({
    lv,
    total: CURRICULUM[lv].length,
    done: CURRICULUM[lv].filter(t => completedTopics?.includes(t.id)).length,
  }))

  // "What to do next" suggestion
  const nextSuggestion = (() => {
    if (testData.length === 0) return { icon: '📝', text: 'Take your first Daily Test to get started!' }
    if (!levelUpReached && myTests.length > 0) {
      const next = myTests.find(tid => (bestPct(tid) || 0) < 60)
      return { icon: '🎯', text: next ? `Clear ${TEST_LABELS[next] || next} with ≥60% (currently ${bestPct(next) || 0}%) — need ${requiredCleared}/${myTests.length} cleared to level up` : `Almost there! Need ${requiredCleared - clearedTests} more test cleared at ≥60%` }
    }
    if (exScores.length === 0) return { icon: '💪', text: 'Try Learn Hub → Exercises for the first time' }
    const incompleteLv = levelProgress.find(l => l.done < l.total)
    if (incompleteLv) return { icon: '📘', text: `Complete ${incompleteLv.total - incompleteLv.done} more topics in ${incompleteLv.lv}` }
    return { icon: '🏆', text: 'Outstanding! You have completed all available content.' }
  })()

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10 }}>
      <Spin sz={28}/><div style={{ color:C.textS, fontSize:12 }}>Loading your dashboard...</div>
    </div>
  )

  return (
    <div style={{ flex:1, overflow:'auto', padding:'16px 18px' }}>
      <h2 style={{ fontSize:16, fontWeight:700, color:C.navy, marginBottom:2 }}>📈 My Dashboard</h2>
      <p style={{ fontSize:11, color:C.textS, marginBottom:12 }}>Your GC Buddy engagement and progress</p>

      {/* Tab bar */}
      <div style={{ display:'flex', gap:3, marginBottom:14, background:'#fff', borderRadius:10, padding:3, border:`1px solid ${C.border}` }}>
        {[['overview','📊 Overview'],['tests','📝 Tests'],['activity','🔥 Activity'],['progress','🎓 Progress']].map(([id,lbl]) => (
          <button key={id} onClick={() => setTab(id)}
            style={{ flex:1, padding:'7px 4px', borderRadius:7, border:'none', cursor:'pointer', fontWeight:600, fontSize:10, fontFamily:'inherit',
              background: tab===id ? C.navy : 'transparent', color: tab===id ? '#fff' : C.textS, transition:'all .15s' }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div>
          {/* Engagement score hero */}
          <div style={{ background:'#fff', borderRadius:14, border:`1px solid ${C.border}`, padding:'16px', marginBottom:12, display:'flex', alignItems:'center', gap:16 }}>
            <ScoreRing score={engScore} size={90} color={engColor}/>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:engColor, marginBottom:3 }}>{engLabel}{barelyStarted ? '' : ' Engagement'}</div>
              <div style={{ fontSize:11, color:C.textM, marginBottom:8, lineHeight:1.5 }}>
                {engBlurb}
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {[
                  { lbl:'Active days', val:`${activeThisWeek}/7 this week` },
                  { lbl:'Streak', val:`${streak} days 🔥` },
                  { lbl:'Level', val:curLevel },
                ].map(({ lbl, val }) => (
                  <div key={lbl} style={{ background:C.surfAlt, borderRadius:7, padding:'4px 9px' }}>
                    <span style={{ fontSize:9, color:C.textS }}>{lbl}: </span>
                    <span style={{ fontSize:10, fontWeight:600, color:C.navy }}>{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4 key stats */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12 }}>
            {[
              { lbl:'Tests Attempted', val:testData.length, icon:'📝', color:C.blue, bg:C.blueL },
              { lbl:'Tests Passed', val:`${passedTests}/${myTests.length}`, icon:'✅', color:C.green, bg:C.greenL },
              { lbl:'Topics Done', val:`${completedCount}/${Object.values(CURRICULUM).flat().length}`, icon:'📚', color:C.navy, bg:C.blueL },
              { lbl:'Avg Test Score', val:testData.length ? `${overallAvg}%` : '—', icon:'🎯', color:C.amber, bg:C.amberL },
            ].map(({ lbl, val, icon, color, bg }) => (
              <div key={lbl} style={{ background:bg, borderRadius:12, padding:'13px 12px', border:`1px solid ${color}22` }}>
                <div style={{ fontSize:20 }}>{icon}</div>
                <div style={{ fontSize:22, fontWeight:800, color, marginTop:4 }}>{val}</div>
                <div style={{ fontSize:10, color:C.textS, marginTop:2 }}>{lbl}</div>
              </div>
            ))}
          </div>

          {/* What to do next */}
          <div style={{ background:C.blueL, borderRadius:12, padding:'12px 14px', border:`1px solid ${C.blue}33`, marginBottom:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.navy, marginBottom:3 }}>
              {nextSuggestion.icon} What to do next
            </div>
            <div style={{ fontSize:12, color:C.textM }}>{nextSuggestion.text}</div>
          </div>

          {/* Section usage breakdown */}
          {Object.keys(sectionCounts).length > 0 && (
            <div style={{ background:'#fff', borderRadius:13, border:`1px solid ${C.border}`, padding:'13px', marginBottom:12 }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.textS, letterSpacing:'.07em', marginBottom:10 }}>SECTIONS USED</div>
              {[
                { key:'curriculum', lbl:'Curriculum', icon:'📘' },
                { key:'daily_test', lbl:'Daily Tests', icon:'📝' },
                { key:'exercise', lbl:'Exercises', icon:'💪' },
                { key:'listening', lbl:'Listening', icon:'🎙️' },
                { key:'interview', lbl:'Interview', icon:'🎭' },
                { key:'gcbuddy', lbl:'GC Buddy Chat', icon:'🇩🇪' },
              ].filter(s => sectionCounts[s.key]).map(({ key, lbl, icon }) => {
                const cnt = sectionCounts[key] || 0
                const maxCnt = Math.max(...Object.values(sectionCounts), 1)
                return (
                  <div key={key} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:7 }}>
                    <span style={{ fontSize:14, width:20, flexShrink:0 }}>{icon}</span>
                    <span style={{ fontSize:11, color:C.textM, width:110, flexShrink:0 }}>{lbl}</span>
                    <div style={{ flex:1 }}>
                      <PBar pct={Math.round((cnt / maxCnt) * 100)} h={5} color={C.blue}/>
                    </div>
                    <span style={{ fontSize:10, fontWeight:600, color:C.navy, width:32, textAlign:'right' }}>{cnt}</span>
                  </div>
                )
              })}
            </div>
          )}

          {/* Level-up status */}
          <div style={{ background: levelUpReached ? C.greenL : C.amberL, borderRadius:12, padding:'12px 14px', border:`1px solid ${levelUpReached ? C.green : C.amber}33` }}>
            <div style={{ fontSize:12, fontWeight:700, color: levelUpReached ? C.green : C.amber, marginBottom:4 }}>
              {levelUpReached ? '🏆 Level unlocked — you\'ve been upgraded!' : clearedTests > 0 ? `🎯 ${clearedTests}/${myTests.length} tests cleared (need ${requiredCleared})` : '📝 No tests cleared yet'}
            </div>
            <div style={{ fontSize:10, color:C.textM, lineHeight:1.7 }}>
              {myTests.length === 0 ? 'You are at the final level — keep practicing!' :
               !levelUpReached ? <>Clear <strong>{requiredCleared} of {myTests.length} tests</strong> with ≥60% to move to the next level. <strong>{requiredCleared - clearedTests} more to go.</strong></> :
               'Your level has been upgraded automatically. Keep going!'}
            </div>
          </div>
        </div>
      )}

      {/* ── TESTS TAB ── */}
      {tab === 'tests' && (
        <div>
          {testData.length === 0 ? (
            <div style={{ textAlign:'center', padding:'40px 20px' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>📝</div>
              <div style={{ fontSize:14, fontWeight:600, color:C.navy, marginBottom:6 }}>No tests taken yet</div>
              <div style={{ fontSize:11, color:C.textS }}>Go to Daily Tests to attempt your first test</div>
            </div>
          ) : (
            <>
              {/* Overall test trend */}
              {testData.length > 1 && (
                <div style={{ background:'#fff', borderRadius:12, border:`1px solid ${C.border}`, padding:'13px', marginBottom:12 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:C.textS, letterSpacing:'.07em', marginBottom:8 }}>SCORE TREND (ALL ATTEMPTS)</div>
                  <MiniBar scores={testData.map(t => Number(t.percentage))} h={50}/>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:C.textS, marginTop:4 }}>
                    <span>First attempt</span><span style={{ color:C.green }}>60% = pass</span><span>Latest</span>
                  </div>
                </div>
              )}
              {myTests.map(tid => {
                const attempts = byTest(tid)
                if (!attempts.length) return (
                  <div key={tid} style={{ background:'#fff', borderRadius:12, border:`1px solid ${C.border}`, padding:'13px', marginBottom:10, opacity:0.5 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:C.navy }}>{TEST_LABELS[tid] || tid}</div>
                    <div style={{ fontSize:10, color:C.textS, marginTop:3 }}>Not attempted yet</div>
                  </div>
                )
                const bp = bestPct(tid), ap = avgPct(tid)
                return (
                  <div key={tid} style={{ background:'#fff', borderRadius:12, border:`2px solid ${(bp||0) >= 60 ? C.green : C.border}`, padding:'13px', marginBottom:12 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <div>
                        <div style={{ fontSize:12, fontWeight:700, color:C.navy }}>{TEST_LABELS[tid] || tid}</div>
                        <div style={{ fontSize:10, color:C.textS }}>{attempts.length} attempt{attempts.length > 1 ? 's' : ''} · /{TEST_MARKS[tid] || '?'} marks</div>
                      </div>
                      <span style={{ fontSize:20 }}>{(bp||0) >= 60 ? '✅' : '🔄'}</span>
                    </div>
                    <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                      {[['Best', `${bp}%`, C.green],['Average', `${ap}%`, C.blue],['Attempts', attempts.length, C.navy]].map(([l,v,c]) => (
                        <div key={l} style={{ flex:1, background:C.surfAlt, borderRadius:8, padding:'8px', textAlign:'center' }}>
                          <div style={{ fontSize:16, fontWeight:700, color:c }}>{v}</div>
                          <div style={{ fontSize:9, color:C.textS }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ fontSize:10, fontWeight:700, color:C.textS, marginBottom:5 }}>ATTEMPT HISTORY</div>
                    {attempts.slice().reverse().map((a, i) => (
                      <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom: i < attempts.length - 1 ? `1px solid ${C.border}` : 'none', fontSize:11 }}>
                        <span style={{ color:C.textM }}>#{attempts.length - i}</span>
                        <span style={{ fontWeight:700, color: Number(a.percentage) >= 60 ? C.green : C.red }}>{a.score}/{a.total_marks} ({a.percentage}%)</span>
                        <span style={{ color:C.textS }}>{new Date(a.submitted_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}</span>
                      </div>
                    ))}
                    {attempts.length > 1 && (
                      <div style={{ marginTop:10 }}>
                        <MiniBar scores={attempts.map(a => Number(a.percentage))} h={36}/>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:C.textS, marginTop:2 }}>
                          <span>Attempt 1</span><span>Latest</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* ── ACTIVITY TAB ── */}
      {tab === 'activity' && (
        <div>
          {/* Engagement score detail */}
          <div style={{ background:'#fff', borderRadius:13, border:`1px solid ${C.border}`, padding:'16px', marginBottom:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14 }}>
              <ScoreRing score={engScore} size={80} color={engColor}/>
              <div>
                <div style={{ fontSize:14, fontWeight:700, color:engColor }}>{engLabel}</div>
                <div style={{ fontSize:11, color:C.textS, marginTop:2 }}>Engagement score</div>
              </div>
            </div>
            <div style={{ fontSize:10, fontWeight:700, color:C.textS, letterSpacing:'.07em', marginBottom:8 }}>SCORE BREAKDOWN</div>
            {[
              { lbl:'Activity (last 7 days)', max:30, pts: Math.max(0, 30 - Math.min(30, (now - (progress?.last_active ? new Date(progress.last_active).getTime() : 0)) / day * 4)) },
              { lbl:'Test performance', max:30, pts: Math.min(30, Math.round((testData.length > 0 ? 10 : 0) + (testData.length ? Math.max(...testData.map(t => Number(t.percentage))) / 100 * 20 : 0))) },
              { lbl:'Topics completed', max:20, pts: Math.round(Math.min(20, (completedCount / Math.max(Object.values(CURRICULUM).flat().length, 1)) * 20)) },
              { lbl:'Exercise performance', max:15, pts: Math.min(15, Math.round((exScores.length > 0 ? 5 : 0) + (exScores.length ? (exScores.reduce((a,b) => a+b,0) / exScores.length / 20) * 10 : 0))) },
              { lbl:'Login streak', max:5, pts: Math.min(5, streak) },
            ].map(({ lbl, max, pts }) => (
              <div key={lbl} style={{ marginBottom:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                  <span style={{ fontSize:11, color:C.textM }}>{lbl}</span>
                  <span style={{ fontSize:11, fontWeight:700, color:C.navy }}>{Math.round(Math.max(0, pts))}/{max}</span>
                </div>
                <PBar pct={Math.round(Math.max(0, Math.min(100, (pts / max) * 100)))} h={5} color={pts / max >= 0.7 ? C.green : pts / max >= 0.4 ? C.amber : C.red}/>
              </div>
            ))}
          </div>

          {/* 28-day heatmap */}
          <div style={{ background:'#fff', borderRadius:13, border:`1px solid ${C.border}`, padding:'14px', marginBottom:12 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.textS, letterSpacing:'.07em', marginBottom:10 }}>ACTIVITY — LAST 28 DAYS</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:4 }}>
              {heatmap.map((d, i) => (
                <div key={i} title={d.date.toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                  style={{ aspectRatio:'1', borderRadius:4, background: d.active ? C.blue : C.surfAlt, border:`1px solid ${d.active ? C.blue + '44' : C.border}` }}/>
              ))}
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:C.textS, marginTop:6 }}>
              <span>28 days ago</span>
              <span style={{ color:C.blue }}>■ Active day</span>
              <span>Today</span>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:12 }}>
            {[
              { lbl:'Active days (7d)', val:`${activeThisWeek}/7`, color:activeThisWeek >= 5 ? C.green : activeThisWeek >= 3 ? C.amber : C.red, bg: activeThisWeek >= 5 ? C.greenL : activeThisWeek >= 3 ? C.amberL : C.redL },
              { lbl:'Login streak', val:`${streak}🔥`, color:C.amber, bg:C.amberL },
              { lbl:'Total events', val:usageEvents.length, color:C.blue, bg:C.blueL },
            ].map(({ lbl, val, color, bg }) => (
              <div key={lbl} style={{ background:bg, borderRadius:11, padding:'12px 8px', textAlign:'center', border:`1px solid ${color}22` }}>
                <div style={{ fontSize:20, fontWeight:700, color }}>{val}</div>
                <div style={{ fontSize:9, color:C.textS, marginTop:2 }}>{lbl}</div>
              </div>
            ))}
          </div>

          {/* Exercise history */}
          {exScores.length > 0 && (
            <div style={{ background:'#fff', borderRadius:13, border:`1px solid ${C.border}`, padding:'13px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:C.textS, letterSpacing:'.07em', marginBottom:8 }}>EXERCISE SCORE TREND</div>
              <MiniBar scores={exScores} h={50}/>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:9, color:C.textS, marginTop:4 }}>
                <span>First session</span>
                <span>Best: {Math.max(...exScores)}/20 · Avg: {Math.round(exScores.reduce((a,b) => a+b,0)/exScores.length)}/20</span>
                <span>Latest</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PROGRESS TAB ── */}
      {tab === 'progress' && (
        <div>
          {/* Level hero */}
          <div style={{ background:C.navy, borderRadius:14, padding:'18px', marginBottom:12, textAlign:'center' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.45)', letterSpacing:'.07em', marginBottom:6 }}>CURRENT LEVEL</div>
            <div style={{ fontSize:40, fontWeight:800, color:'#fff' }}>{curLevel}</div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.5)', marginBottom:14 }}>
              {curLevel === 'A1' ? 'Beginner — Foundation German' : curLevel === 'A2' ? 'Elementary — Building Fluency' : curLevel === 'B1' ? 'Intermediate — Workplace Ready' : 'Upper Intermediate — Near Fluent'}
            </div>
            <div style={{ display:'flex', justifyContent:'space-around' }}>
              {[['Topics', completedCount],['Tests', testData.length],['Exercises', exScores.length]].map(([l,v]) => (
                <div key={l} style={{ textAlign:'center' }}>
                  <div style={{ fontSize:22, fontWeight:700, color:'#fff' }}>{v}</div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,.4)' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Curriculum per level */}
          <div style={{ background:'#fff', borderRadius:13, border:`1px solid ${C.border}`, padding:'13px', marginBottom:12 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.textS, letterSpacing:'.07em', marginBottom:10 }}>CURRICULUM PROGRESS</div>
            {levelProgress.map(({ lv, total, done }) => {
              const pct = Math.round((done / total) * 100)
              const isActive = lv === curLevel
              return (
                <div key={lv} style={{ marginBottom:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontSize:11, fontWeight:600, color:C.navy }}>Level {lv}</span>
                      {isActive && <span style={{ background:C.blueL, color:C.blue, fontSize:8, fontWeight:700, padding:'1px 6px', borderRadius:10 }}>CURRENT</span>}
                    </div>
                    <span style={{ fontSize:11, fontWeight:700, color: pct === 100 ? C.green : C.textS }}>{done}/{total} ({pct}%)</span>
                  </div>
                  <PBar pct={pct} h={7} color={pct === 100 ? C.green : isActive ? C.blue : C.border}/>
                </div>
              )
            })}
          </div>

          {/* Milestones */}
          <div style={{ background:'#fff', borderRadius:12, border:`1px solid ${C.border}`, padding:'13px', marginBottom:12 }}>
            <div style={{ fontSize:10, fontWeight:700, color:C.textS, letterSpacing:'.07em', marginBottom:10 }}>🏅 MILESTONES</div>
            {[
              { label:'First test attempted', done: testData.length >= 1, icon:'📝' },
              { label:'First test passed (60%+)', done: testData.some(t => Number(t.percentage) >= 60), icon:'✅' },
              { label:'All current level tests passed', done: passedTests === myTests.length && myTests.length > 0, icon:'🏆' },
              { label:'First exercise completed', done: exScores.length >= 1, icon:'💪' },
              { label:'10 exercise sessions', done: exScores.length >= 10, icon:'🔥' },
              { label:'Score 18+ in an exercise', done: exScores.some(s => s >= 18), icon:'⭐' },
              { label:'5 curriculum topics done', done: completedCount >= 5, icon:'📚' },
              { label:'20 curriculum topics done', done: completedCount >= 20, icon:'📖' },
              { label:'Active 5 days in a week', done: activeThisWeek >= 5, icon:'🗓️' },
              { label:'7-day streak', done: streak >= 7, icon:'🔥' },
            ].map((m, i, arr) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : 'none', opacity: m.done ? 1 : 0.4 }}>
                <span style={{ fontSize:18 }}>{m.done ? m.icon : '○'}</span>
                <span style={{ fontSize:12, color: m.done ? C.navy : C.textS, fontWeight: m.done ? 600 : 400 }}>{m.label}</span>
                {m.done && <span style={{ marginLeft:'auto', background:C.greenL, color:C.green, fontSize:9, fontWeight:700, padding:'2px 7px', borderRadius:10 }}>DONE</span>}
              </div>
            ))}
          </div>

          <button onClick={load} style={{ width:'100%', padding:'11px', borderRadius:10, border:`1.5px solid ${C.border}`, background:'#fff', color:C.navy, fontWeight:600, fontSize:12, cursor:'pointer', fontFamily:'inherit' }}>
            🔄 Refresh
          </button>
        </div>
      )}
    </div>
  )
}
