import { useState } from 'react'
import { C, CURRICULUM, LEVELS, LEVEL_THEME } from '../lib/constants'
import { Btn } from '../components/UI'
import { useNav } from '../lib/nav'
export default function CurriculumPage({ user, completedTopics, onOpenLesson }) {
  const nav = useNav()
  const [openLevel, setOpenLevel] = useState(null) // null = level folders view; else the opened level
  const openFolder = lv => { setOpenLevel(lv); nav.pushView(() => setOpenLevel(null)) }
  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 3 }}>📘 Curriculum</h2>
      <p style={{ fontSize: 11, color: C.textS, marginBottom: 14 }}>All levels unlocked · Tap a level to open its topics</p>

      {openLevel === null ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {LEVELS.map(lv => {
            const topics = CURRICULUM[lv]; const done = topics.filter(t => completedTopics?.includes(t.id)).length
            const isCur = lv === user?.level; const th = LEVEL_THEME[lv]
            return (
              <div key={lv} onClick={() => openFolder(lv)}
                style={{ background: th.main, color: th.on, borderRadius: 13, padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: C.sh }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: th.on, flexShrink: 0 }}>{lv}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>Level {lv}{isCur ? ' · your level' : ''}</div>
                  <div style={{ fontSize: 11, opacity: .85, marginTop: 2 }}>{done}/{topics.length} topics done</div>
                </div>
                <span style={{ fontSize: 18, opacity: .9 }}>→</span>
              </div>
            )
          })}
        </div>
      ) : (() => {
        const lv = openLevel; const th = LEVEL_THEME[lv]; const topics = CURRICULUM[lv]
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <button onClick={() => nav.goBack()}
                style={{ background: th.light, color: C.navy, border: `1px solid ${th.main}`, borderRadius: 9, padding: '8px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>← All levels</button>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: th.main, color: th.on, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>{lv}</div>
              <span style={{ fontWeight: 700, color: C.navy, fontSize: 13 }}>Level {lv} Curriculum</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {topics.map(t => {
                const isDone = completedTopics?.includes(t.id)
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', borderRadius: 9, background: isDone ? C.greenL : '#fff', border: `1px solid ${isDone ? C.green + '44' : C.border}`, borderLeft: `4px solid ${th.main}` }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{isDone ? '✅' : t.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: isDone ? C.green : C.navy }}>{t.title}</div>
                      <div style={{ fontSize: 10, color: C.textS }}>{t.desc}</div>
                    </div>
                    <Btn label={isDone ? 'Review' : 'Learn →'} onClick={e => { e.stopPropagation(); onOpenLesson(t, lv) }} variant={isDone ? 'outline' : 'accent'} size="sm" />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
