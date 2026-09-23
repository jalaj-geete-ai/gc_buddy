import { useState, useEffect, useRef } from 'react'
import { C, NAV, CURRICULUM } from '../lib/constants'
import { AppHeader } from '../components/UI'
import { NavContext } from '../lib/nav'
import { trackEvent } from '../lib/supabase'
import Home from './Home'
import CurriculumPage from './CurriculumPage'
import LearnHub from './LearnHub'
import VocabPage from './VocabPage'
import ListeningPage from './ListeningPage'
import InterviewPage from './InterviewPage'
import GCBuddyChat from './GCBuddyChat'
import ReferralPage from './ReferralPage'
import LessonChat from './LessonChat'
import DailyTestPage from './DailyTestPage'

export default function AppShell({ user, progress, completedTopics, exerciseScores, onLogout, onMarkTopic, onAddScore, onTestComplete }) {
  const [tab, setTab] = useState('home')
  const [lesson, setLesson] = useState(null)
  const backStack = useRef([]) // stack of onBack handlers; last entry = deepest view

  // Capture the system / browser Back button and step back through the views the
  // user actually visited — the previous tab, or an in-page sub-view (e.g. a
  // drilled-in level folder) — instead of always jumping straight to Home.
  // Every forward navigation registers a handler and a history entry; each Back
  // press consumes the most recent one. A spare entry is always kept so Back
  // stays captured and the app/webview never exits unexpectedly.
  useEffect(() => {
    window.history.pushState({ gc: true }, '')
    const onPop = () => {
      const handler = backStack.current.pop()
      window.history.pushState({ gc: true }, '') // restore the spare entry
      if (handler) handler()
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Register a Back handler for a newly entered view (+ a history entry to consume).
  function pushView(onBack) {
    backStack.current.push(onBack)
    window.history.pushState({ gc: true }, '')
  }
  // In-app Back / close controls call this so history stays in sync.
  function goBack() { window.history.back() }

  function goTab(id) {
    if (id === tab && !lesson) return
    const prevTab = tab, prevLesson = lesson
    setLesson(null); setTab(id)
    pushView(() => { setLesson(prevLesson); setTab(prevTab) })
    trackEvent(user?.rollNumber, 'section_open', id, '', user?.level)
  }

  function openLesson(topic, level) {
    const prevTab = tab
    setLesson({ topic, level: level || user.level })
    setTab('lesson')
    pushView(() => { setLesson(null); setTab(prevTab) })
    trackEvent(user?.rollNumber, 'lesson_start', 'curriculum', topic.title, level || user.level)
  }

  const content = () => {
    if (tab === 'lesson' && lesson) return <LessonChat user={user} topic={lesson.topic} level={lesson.level} onBack={goBack} onMarkDone={onMarkTopic}/>
    if (tab === 'home') return <Home user={user} progress={progress} completedTopics={completedTopics} exerciseScores={exerciseScores} onNav={goTab} onOpenLesson={openLesson}/>
    if (tab === 'curriculum') return <CurriculumPage user={user} completedTopics={completedTopics} onOpenLesson={openLesson}/>
    if (tab === 'learn') return <LearnHub user={user} onAddScore={onAddScore}/>
    if (tab === 'vocab') return <VocabPage user={user}/>
    if (tab === 'listening') return <ListeningPage user={user}/>
    if (tab === 'interview') return <InterviewPage user={user} completedTopics={completedTopics} onAddScore={onAddScore}/>
    if (tab === 'gcbuddy') return <GCBuddyChat user={user} progress={progress} completedTopics={completedTopics} exerciseScores={exerciseScores}/>
    if (tab === 'referral') return <ReferralPage user={user}/>
    if (tab === 'dailytest') return <DailyTestPage user={user} onTestComplete={onTestComplete}/>
    return null
  }

  return (
    <NavContext.Provider value={{ pushView, goBack }}>
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <AppHeader user={user} onHome={() => goTab('home')} onLogout={onLogout}/>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <nav className="sidebar" style={{ width: 175, background: '#fff', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', padding: '8px 0', flexShrink: 0, overflowY: 'auto' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => goTab(n.id)} className={`nav-btn${tab === n.id || (tab === 'lesson' && n.id === 'curriculum') ? ' active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', border: 'none', background: (tab === n.id || (tab === 'lesson' && n.id === 'curriculum')) ? C.blueL : 'transparent', color: (tab === n.id || (tab === 'lesson' && n.id === 'curriculum')) ? C.blue : C.textM, cursor: 'pointer', fontSize: 12, fontWeight: (tab === n.id) ? 600 : 400, textAlign: 'left', borderLeft: `3px solid ${(tab === n.id || (tab === 'lesson' && n.id === 'curriculum')) ? C.blue : 'transparent'}`, fontFamily: 'inherit', width: '100%', transition: 'all .12s' }}>
              <span className="nav-icon" style={{ fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {n.icon.startsWith('/')
                  ? <img src={n.icon} alt="" style={{ width: 19, height: 19, objectFit: 'contain', display: 'block' }}/>
                  : n.icon}
              </span>
              <span className="nav-lbl">{n.lbl}</span>
            </button>
          ))}
        </nav>
        {/* Content */}
        <main className="content-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {content()}
        </main>
      </div>
      {/* Mobile FAB for GC Buddy — hidden on the chat tab itself (redundant + would overlap the send button) */}
      {tab !== 'gcbuddy' && (
        <button className="mobile-fab" onClick={() => goTab('gcbuddy')} aria-label="Ask GC Buddy">
          <img src="/mascot-face.png" alt="" style={{ width: '92%', height: '92%', objectFit: 'contain', display: 'block' }}/>
        </button>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
    </NavContext.Provider>
  )
}
