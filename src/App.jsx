import { useState, useEffect } from 'react'
import { C } from './lib/constants'
import { sb, checkRoll, loadProg, saveProg, trackEvent } from './lib/supabase'
import { Btn, Inp, Spin } from './components/UI'
import Onboard from './pages/Onboard'
import PlacementIntro from './pages/PlacementIntro'
import PlacementTest from './pages/PlacementTest'
import AppShell from './pages/AppShell'
import AdminPanel from './pages/admin/AdminPanel'
import FacultyPanel from './pages/admin/FacultyPanel'
import StudentManager from './pages/admin/StudentManager'
import PublicTest from './pages/PublicTest'

const params = new URLSearchParams(window.location.search)

// Tests required to pass per level before moving up
// Each value is an array of test_ids; a test counts as "cleared" at ≥60%,
// and ≥90% of the level's tests must be cleared to move up (see checkLevelUp).
const LEVEL_TESTS = {
  A1: ['A1_T1','A1_T2','A1_T3','A1_T4','A1_T5','A1_T6','A1_T7','A1_T8','A1_T9','A1_T10','A1_T11','A1_T12','A1_T13','A1_T14','A1_T15','A1_T16','A1_T17','A1_T18','A1_T19','A1_T20','A1_T21'],
  A2: ['A2_T1', 'A2_T2', 'A2_T3'],
  B1: ['B1_T1', 'B1_T2', 'B1_T3'],
  B2: [], // B2 is the final level — no further promotion
}
const NEXT_LEVEL = { A1: 'A2', A2: 'B1', B1: 'B2', B2: null }

export default function App() {
  const [screen, setScreen] = useState('loading')
  const [user, setUser] = useState(null)
  const [progress, setProgress] = useState(null)
  const [completedTopics, setCompletedTopics] = useState([])
  const [exerciseScores, setExerciseScores] = useState([])
  const [levelUpMsg, setLevelUpMsg] = useState(null) // e.g. {from:'A1', to:'A2'}

  // Portal routing
  if (params.get('admin')==='1') return <AdminPanel/>
  if (params.get('faculty')==='1') return <FacultyPanel/>
  if (params.get('students')==='1') return <StudentManager/>
  if (params.get('test')==='public') return <PublicTest/>

  // Restore session
  useEffect(() => {
    const roll = localStorage.getItem('gc_roll')
    const placed = localStorage.getItem('gc_placed')
    if (roll && placed==='1') {
      loadProg(roll).then(prog => {
        const u = { name: localStorage.getItem('gc_name')||'', email: localStorage.getItem('gc_email')||'', rollNumber: roll, level: prog?.level||'A1' }
        setUser(u); setProgress(prog)
        setCompletedTopics(prog?.completed_topics||[])
        setExerciseScores(prog?.exercise_scores||[])
        trackEvent(roll,'session_start','login','restore',u.level)
        setScreen('app')
      })
    } else { setScreen('onboard') }
  }, [])

  // Auto-save progress
  useEffect(() => {
    if (!user || screen!=='app') return
    const t = setTimeout(async () => {
      const newStreak = await saveProg(user.rollNumber, {
        name:user.name, email:user.email, level:user.level,
        completed_topics:completedTopics, exercise_scores:exerciseScores,
      })
      // Sync updated streak AND last_active back into progress state so the
      // streak card computes its countdown from now, not the stale DB value
      // (otherwise a just-refreshed streak wrongly shows "0h left / expires in 0h").
      if (newStreak !== undefined) setProgress(p => ({ ...p, streak: newStreak, last_active: new Date().toISOString() }))
    }, 1500)
    return () => clearTimeout(t)
  }, [completedTopics, exerciseScores, user, screen])

  // ── LEVEL UP CHECK ───────────────────────────────────────────
  // Called after every test submission. A test counts as "cleared" at ≥60%;
  // clearing ≥90% of the level's tests promotes the student to the next level.
  async function checkLevelUp(currentUser) {
    const currentLevel = currentUser.level
    const requiredTests = LEVEL_TESTS[currentLevel]
    const nextLevel = NEXT_LEVEL[currentLevel]

    if (!requiredTests || requiredTests.length === 0 || !nextLevel) return

    // Fetch best score per required test for this student
    const { data, error } = await sb
      .from('daily_test_submissions')
      .select('test_id, percentage')
      .eq('roll_number', currentUser.rollNumber)
      .in('test_id', requiredTests)

    if (error || !data) return

    // Best score per test
    const bestPerTest = {}
    data.forEach(row => {
      const pct = Number(row.percentage)
      if (!bestPerTest[row.test_id] || pct > bestPerTest[row.test_id]) {
        bestPerTest[row.test_id] = pct
      }
    })

    // A test is "cleared" if best score >= 60%
    const clearedCount = requiredTests.filter(tid =>
      bestPerTest[tid] !== undefined && bestPerTest[tid] >= 60
    ).length

    // Level-up requires clearing 90% of tests (ceiling)
    const requiredCleared = Math.ceil(requiredTests.length * 0.9)
    if (clearedCount < requiredCleared) return

    // 🎉 Promote to next level
    const updatedUser = { ...currentUser, level: nextLevel }
    setUser(updatedUser)
    localStorage.setItem('gc_level', nextLevel)
    await saveProg(updatedUser.rollNumber, {
      level: nextLevel,
      name: updatedUser.name,
      email: updatedUser.email,
      completed_topics: completedTopics,
      exercise_scores: exerciseScores,
    })
    trackEvent(updatedUser.rollNumber, 'level_up', 'progression', `${currentLevel}→${nextLevel}`, nextLevel)
    setLevelUpMsg({ from: currentLevel, to: nextLevel })
    setTimeout(() => setLevelUpMsg(null), 6000)
  }

  async function handleLogin(name, email, roll) {
    const approved = await checkRoll(roll)
    if (!approved) throw new Error('Roll number not found. Contact your coordinator.')
    const prog = await loadProg(roll.toUpperCase())
    localStorage.setItem('gc_roll', roll.toUpperCase())
    localStorage.setItem('gc_name', name)
    localStorage.setItem('gc_email', email)
    localStorage.setItem('gc_placed', '1')
    // New student — create record
    if (!prog) await saveProg(roll.toUpperCase(), { name, email, level:'A1', completed_topics:[], exercise_scores:[], streak:0 })
    const level = prog?.level || 'A1'
    localStorage.setItem('gc_level', level)
    const u = { name, email, rollNumber: roll.toUpperCase(), level }
    setUser(u); setProgress(prog)
    setCompletedTopics(prog?.completed_topics || [])
    setExerciseScores(prog?.exercise_scores || [])
    trackEvent(roll.toUpperCase(), 'session_start', 'login', prog ? 'returning user' : 'new user', level)
    setScreen('app')
  }

  function handleLogout() {
    ['gc_roll','gc_name','gc_email','gc_level','gc_placed'].forEach(k=>localStorage.removeItem(k))
    setUser(null); setProgress(null); setCompletedTopics([]); setExerciseScores([])
    setScreen('onboard')
  }

  if (screen==='loading') return <div style={{minHeight:'100vh',background:C.bg,display:'flex',alignItems:'center',justifyContent:'center'}}><Spin sz={32}/></div>
  if (screen==='onboard') return <Onboard onLogin={handleLogin}/>
  if (screen==='placement-intro') return <PlacementIntro user={user} onStart={()=>setScreen('placement')} onSkip={()=>handlePlacementDone()}/>
  if (screen==='placement') return <PlacementTest user={user} onComplete={handlePlacementDone}/>
  if (screen==='app') return (
    <>
      {/* Level-up congratulations banner */}
      {levelUpMsg && (
        <div style={{
          position:'fixed', top:0, left:0, right:0, zIndex:9999,
          background:'linear-gradient(135deg,#0a5c2a,#0d7a38)',
          padding:'14px 20px', textAlign:'center', boxShadow:'0 4px 20px rgba(0,0,0,.3)'
        }}>
          <div style={{fontSize:20,marginBottom:4}}>🎉🎓🎉</div>
          <div style={{color:'#fff',fontWeight:800,fontSize:15}}>
            Congratulations! You've moved to Level {levelUpMsg.to}!
          </div>
          <div style={{color:'rgba(255,255,255,.7)',fontSize:11,marginTop:3}}>
            You passed all {levelUpMsg.from} tests — your level has been upgraded automatically.
          </div>
          <button onClick={()=>setLevelUpMsg(null)}
            style={{position:'absolute',top:10,right:14,background:'none',border:'none',color:'rgba(255,255,255,.5)',fontSize:18,cursor:'pointer'}}>×</button>
        </div>
      )}
      <AppShell
        user={user}
        progress={progress}
        completedTopics={completedTopics}
        exerciseScores={exerciseScores}
        onLogout={handleLogout}
        onMarkTopic={id=>{if(!completedTopics.includes(id)){setCompletedTopics(p=>[...p,id]);trackEvent(user.rollNumber,'lesson_complete','curriculum',id,user.level)}}}
        onAddScore={score=>{setExerciseScores(p=>{const n=[...p,score];const k=`gc_ex_${user.level}`;const prev=JSON.parse(localStorage.getItem(k)||'[]');prev.push(score);if(prev.length>50)prev.shift();localStorage.setItem(k,JSON.stringify(prev));return n})}}
        onTestComplete={()=>checkLevelUp(user)}
      />
    </>
  )
}
