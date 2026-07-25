import { useState, useEffect } from 'react'
import { C, NAV, CURRICULUM } from '../lib/constants'
import { AppHeader } from '../components/UI'
import { trackEvent } from '../lib/supabase'
import Home from './Home'
import CurriculumPage from './CurriculumPage'
import LearnHub from './LearnHub'
import VocabPage from './VocabPage'
import ListeningPage from './ListeningPage'
import InterviewPage from './InterviewPage'
import GCBuddyChat from './GCBuddyChat'
import MediaPage from './MediaPage'
import ReferralPage from './ReferralPage'
import LessonChat from './LessonChat'
import DailyTestPage from './DailyTestPage'
import PerformancePage from './PerformancePage'

export default function AppShell({ user, progress, completedTopics, exerciseScores, onLogout, onMarkTopic, onAddScore, onTestComplete }) {
  const [tab, setTab] = useState('home')
  const [lesson, setLesson] = useState(null)

  useEffect(() => {
    const pop = () => {
      if (lesson) { setLesson(null); setTab('curriculum') }
      else if (tab !== 'home') setTab('home')
    }
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', pop)
    return () => window.removeEventListener('popstate', pop)
  }, [tab, lesson])

  function goTab(id) {
    setLesson(null); setTab(id)
    trackEvent(user?.rollNumber, 'section_open', id, '', user?.level)
  }

  function openLesson(topic, level) {
    setLesson({ topic, level: level || user.level })
    setTab('lesson')
    trackEvent(user?.rollNumber, 'lesson_start', 'curriculum', topic.title, level || user.level)
  }

  const content = () => {
    if (tab === 'lesson' && lesson) return <LessonChat user={user} topic={lesson.topic} level={lesson.level} onBack={() => { setLesson(null); setTab('curriculum') }} onMarkDone={onMarkTopic}/>
    if (tab === 'home') return <Home user={user} progress={progress} completedTopics={completedTopics} exerciseScores={exerciseScores} onNav={goTab} onOpenLesson={openLesson}/>
    if (tab === 'curriculum') return <CurriculumPage user={user} completedTopics={completedTopics} onOpenLesson={openLesson}/>
    if (tab === 'learn') return <LearnHub user={user} onAddScore={onAddScore}/>
    if (tab === 'vocab') return <VocabPage user={user}/>
    if (tab === 'listening') return <ListeningPage user={user}/>
    if (tab === 'interview') return <InterviewPage user={user} completedTopics={completedTopics} onAddScore={onAddScore}/>
    if (tab === 'gcbuddy') return <GCBuddyChat user={user} progress={progress} completedTopics={completedTopics} exerciseScores={exerciseScores}/>
    if (tab === 'media') return <MediaPage user={user}/>
    if (tab === 'referral') return <ReferralPage user={user}/>
    if (tab === 'dailytest') return <DailyTestPage user={user} onTestComplete={onTestComplete}/>
    if (tab === 'performance') return <PerformancePage user={user} completedTopics={completedTopics} exerciseScores={exerciseScores} progress={progress}/>
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <AppHeader user={user} onHome={() => goTab('home')} onLogout={onLogout}/>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <nav className="sidebar" style={{ width: 175, background: '#fff', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', padding: '8px 0', flexShrink: 0, overflowY: 'auto' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => goTab(n.id)} className={`nav-btn${tab === n.id || (tab === 'lesson' && n.id === 'curriculum') ? ' active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', border: 'none', background: (tab === n.id || (tab === 'lesson' && n.id === 'curriculum')) ? C.blueL : 'transparent', color: (tab === n.id || (tab === 'lesson' && n.id === 'curriculum')) ? C.blue : C.textM, cursor: 'pointer', fontSize: 12, fontWeight: (tab === n.id) ? 600 : 400, textAlign: 'left', borderLeft: `3px solid ${(tab === n.id || (tab === 'lesson' && n.id === 'curriculum')) ? C.blue : 'transparent'}`, fontFamily: 'inherit', width: '100%', transition: 'all .12s' }}>
              <span className="nav-icon" style={{ fontSize: 15 }}>{n.icon}</span>
              <span className="nav-lbl">{n.lbl}</span>
            </button>
          ))}
        </nav>
        {/* Content */}
        <main className="content-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {content()}
        </main>
      </div>
      {/* Mobile FAB for GC Buddy */}
      <button className="mobile-fab" onClick={() => goTab('gcbuddy')}>🇩🇪</button>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes bounce{0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-5px)}}`}</style>
    </div>
  )
}
