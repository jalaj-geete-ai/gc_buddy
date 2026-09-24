import { useState, useEffect, useRef } from 'react'
import { C, LEVELS, LEVEL_THEME } from '../lib/constants'
import { Btn, Inp, Spin, PBar } from '../components/UI'
import { gcBuddyStream } from '../lib/gemini'
import { playGerman, stopAll, clipUrlPhrase, clipUrlWord } from '../lib/tts'
import { sb } from '../lib/supabase'
import demo from './demoData.json'

// Every "Subscribe / unlock" action fires a confetti + thank-you popup (a lead
// has already been captured at entry) instead of navigating anywhere.
const fireThanks = () => { try { window.dispatchEvent(new CustomEvent('gc-demo-thanks')) } catch { /* noop */ } }

const NAV = [
  { id: 'home', icon: '🏠', lbl: 'Home' },
  { id: 'curriculum', icon: '📘', lbl: 'Curriculum' },
  { id: 'dailytest', icon: '📝', lbl: 'Daily Test' },
  { id: 'learn', icon: '💪', lbl: 'Learn Hub' },
  { id: 'vocab', icon: '🔤', lbl: 'Vocabulary' },
  { id: 'listening', icon: '🎙️', lbl: 'Listening' },
  { id: 'interview', icon: '🎭', lbl: 'Interview' },
  { id: 'gcbuddy', icon: '/mascot-face.png', lbl: 'GC Buddy' },
  { id: 'referral', icon: '🎁', lbl: 'Refer' },
]

// ── Shared bits ──────────────────────────────────────────────────────────────
function SubscribeCard({ text = 'Subscribe to the course to unlock this.', compact = false }) {
  return (
    <div style={{ background: C.blueL, border: `1px solid ${C.blue}44`, borderRadius: 12, padding: compact ? '12px 14px' : '16px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: compact ? 20 : 26, marginBottom: 6 }}>🔒</div>
      <div style={{ fontSize: 12.5, color: C.navy, fontWeight: 700, lineHeight: 1.5, marginBottom: 10 }}>{text}</div>
      <Btn label="Subscribe to unlock →" variant="accent" onClick={fireThanks} />
    </div>
  )
}

// Blurred dummy rows — deliberately NO real text (locked content is never shipped).
function BlurredRows({ count, label = 'more locked', maxShow = 5 }) {
  const n = Math.min(count, maxShow)
  const widths = ['82%', '68%', '90%', '74%', '60%']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} style={{ position: 'relative', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 14px', overflow: 'hidden' }}>
          <div style={{ filter: 'blur(7px)', userSelect: 'none', pointerEvents: 'none' }} aria-hidden>
            <div style={{ height: 11, width: widths[i % widths.length], background: '#c7d2e8', borderRadius: 6, marginBottom: 7 }} />
            <div style={{ height: 8, width: '40%', background: '#dbe3f2', borderRadius: 6 }} />
          </div>
          <span style={{ position: 'absolute', top: '50%', right: 14, transform: 'translateY(-50%)', fontSize: 15 }}>🔒</span>
        </div>
      ))}
      {count > maxShow && <div style={{ fontSize: 11, color: C.textS, textAlign: 'center' }}>+ {count - maxShow} {label}</div>}
    </div>
  )
}

function BackBar({ th, label, onBack }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <button onClick={onBack} style={{ background: th.light, color: C.navy, border: `1px solid ${th.main}`, borderRadius: 9, padding: '8px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit' }}>← All levels</button>
      <span style={{ fontWeight: 700, color: C.navy, fontSize: 13 }}>{label}</span>
    </div>
  )
}

const wrap = { flex: 1, overflow: 'auto', padding: '16px 18px' }
const H2 = ({ children }) => <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 3 }}>{children}</h2>
const Sub = ({ children }) => <p style={{ fontSize: 11, color: C.textS, marginBottom: 12 }}>{children}</p>

// ── Chat (curriculum lesson = 3 Q, GC Buddy = 5 Q) ───────────────────────────
function DemoChat({ systemPrompt, greeting, maxQ }) {
  const [msgs, setMsgs] = useState([{ role: 'assistant', content: greeting }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [asked, setAsked] = useState(0)
  const bottomRef = useRef(null)
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs, loading])

  const limitReached = asked >= maxQ
  async function send() {
    const content = input.trim()
    if (!content || loading || limitReached) return
    const nm = [...msgs, { role: 'user', content }]
    setMsgs(nm); setInput(''); setLoading(true); setAsked(a => a + 1)
    const r = await gcBuddyStream(nm.map(m => ({ role: m.role, content: m.content })), systemPrompt, t => {
      setLoading(false); setMsgs([...nm, { role: 'assistant', content: t }])
    })
    setMsgs([...nm, { role: 'assistant', content: r }]); setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 2px', display: 'flex', flexDirection: 'column', gap: 9 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: m.role === 'user' ? 'row-reverse' : 'row', gap: 7 }}>
            <div style={{ maxWidth: '82%', background: m.role === 'user' ? C.navy : '#fff', color: m.role === 'user' ? '#fff' : C.text, padding: '9px 12px', borderRadius: 12, border: m.role === 'assistant' ? `1px solid ${C.border}` : 'none', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{m.content}</div>
          </div>
        ))}
        {loading && <div style={{ fontSize: 12, color: C.textS }}>GC Buddy is typing…</div>}
        {limitReached && <div style={{ marginTop: 6 }}><SubscribeCard compact text="To ask more questions, subscribe to the course." /></div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ display: 'flex', gap: 7, marginTop: 8 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={1}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder={limitReached ? 'Demo question limit reached' : 'Ask in English or Hinglish…'}
          disabled={limitReached}
          style={{ flex: 1, padding: '10px 12px', borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 13, fontFamily: 'inherit', resize: 'none', outline: 'none', background: limitReached ? C.surfAlt : '#fff' }} />
        <button onClick={send} disabled={!input.trim() || loading || limitReached}
          style={{ width: 40, borderRadius: 10, background: (!input.trim() || loading || limitReached) ? C.border : C.navy, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 16 }}>➤</button>
      </div>
      <div style={{ fontSize: 10, color: C.textS, textAlign: 'center', marginTop: 6 }}>Demo · {Math.max(0, maxQ - asked)} of {maxQ} questions left</div>
    </div>
  )
}

// ── Quiz runner (daily test + exercise set) ──────────────────────────────────
function Quiz({ title, questions, onExit }) {
  const [cur, setCur] = useState(0)
  const [sel, setSel] = useState(null)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)
  const q = questions[cur]
  function answer(i) {
    if (sel !== null) return
    const ok = i === q.ans
    setSel(i); if (ok) setScore(s => s + 1)
    setTimeout(() => {
      if (cur + 1 >= questions.length) setDone(true)
      else { setCur(c => c + 1); setSel(null) }
    }, 800)
  }
  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 13, padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: 38 }}>{pct >= 60 ? '🎉' : '📚'}</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: C.navy, margin: '4px 0' }}>{score}/{questions.length}</div>
        <div style={{ fontSize: 12, color: C.textM, marginBottom: 14 }}>{pct}% · {title}</div>
        <Btn label="← Back" variant="outline" onClick={onExit} />
      </div>
    )
  }
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <button onClick={onExit} style={{ background: 'none', border: 'none', color: C.textS, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>← Exit</button>
        <span style={{ fontSize: 11, color: C.textS }}>Q{cur + 1}/{questions.length} · Score {score}</span>
      </div>
      <PBar pct={(cur / questions.length) * 100} h={4} style={{ marginBottom: 10 }} />
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '14px', marginBottom: 9 }}>
        <p style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.5 }}>{q.text}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {q.opts.map((o, i) => {
          const show = sel !== null, isOk = i === q.ans, isSel = sel === i
          let bg = '#fff', bd = C.border, col = C.text
          if (show) { if (isOk) { bg = C.greenL; bd = C.green; col = C.green } else if (isSel) { bg = C.redL; bd = C.red; col = C.red } }
          return (
            <button key={i} disabled={show} onClick={() => answer(i)}
              style={{ textAlign: 'left', padding: '11px 13px', borderRadius: 9, border: `1.5px solid ${bd}`, background: bg, color: col, fontSize: 13, fontFamily: 'inherit', cursor: show ? 'default' : 'pointer', fontWeight: (isSel || (show && isOk)) ? 600 : 400 }}>
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Grammar block renderer (presentational) ──────────────────────────────────
function GBlock({ b }) {
  const heading = b.h && <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, margin: '2px 0 6px' }}>{b.h}</div>
  if (b.type === 'note') return <div style={{ marginBottom: 12 }}>{heading}<p style={{ fontSize: 12, color: C.textM, lineHeight: 1.6, margin: 0 }}>{b.text}</p></div>
  if (b.type === 'list') return <div style={{ marginBottom: 12 }}>{heading}<ul style={{ margin: 0, paddingLeft: 16 }}>{b.items.map((it, i) => <li key={i} style={{ fontSize: 12, color: C.textM, lineHeight: 1.7 }}>{it}</li>)}</ul></div>
  if (b.type === 'ex') return <div style={{ marginBottom: 12 }}>{heading}<div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>{b.items.map(([de, en], i) => <div key={i} style={{ background: C.blueL, borderRadius: 8, padding: '8px 11px', borderLeft: `3px solid ${C.blue}` }}><div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy }}>{de}</div><div style={{ fontSize: 11, color: C.textM, fontStyle: 'italic' }}>{en}</div></div>)}</div></div>
  if (b.type === 'table') return <div style={{ marginBottom: 12, overflowX: 'auto' }}>{heading}<table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11.5, border: `1px solid ${C.border}`, borderRadius: 8 }}><thead><tr>{b.cols.map((c, i) => <th key={i} style={{ textAlign: 'left', padding: '7px 10px', background: C.surfAlt, color: C.navy, fontWeight: 700, borderBottom: `1px solid ${C.border}` }}>{c}</th>)}</tr></thead><tbody>{b.rows.map((r, ri) => <tr key={ri} style={{ background: ri % 2 ? C.surfAlt : '#fff' }}>{r.map((cell, ci) => <td key={ci} style={{ padding: '7px 10px', color: ci === 0 ? C.navy : C.textM, fontWeight: ci === 0 ? 600 : 400 }}>{cell}</td>)}</tr>)}</tbody></table></div>
  return null
}

// ── Level-folder helper (curriculum / dailytest / listening) ─────────────────
function LevelFolders({ levels, subtitleFor, onOpen }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {levels.map(lv => {
        const th = LEVEL_THEME[lv]
        return (
          <div key={lv} onClick={() => onOpen(lv)} style={{ background: th.main, color: th.on, borderRadius: 13, padding: '16px 18px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12, boxShadow: C.sh }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: th.on }}>{lv}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Level {lv}</div>
              <div style={{ fontSize: 11, opacity: .85, marginTop: 2 }}>{subtitleFor(lv)}</div>
            </div>
            <span style={{ fontSize: 18, opacity: .9 }}>→</span>
          </div>
        )
      })}
    </div>
  )
}

// ── Pages ────────────────────────────────────────────────────────────────────
function HomePage({ name, go }) {
  const tiles = [
    ['curriculum', '📘', 'Curriculum', 'Structured A1–B2 path'],
    ['dailytest', '📝', 'Daily Tests', 'Auto-graded practice'],
    ['learn', '💪', 'Learn Hub', 'Exercises & grammar'],
    ['vocab', '🔤', 'Vocabulary', '3000+ words'],
    ['listening', '🎙️', 'Listening', 'Native audio'],
    ['gcbuddy', '🤖', 'GC Buddy', 'Your AI German coach'],
  ]
  return (
    <div style={wrap}>
      <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyM})`, borderRadius: 16, padding: '22px 20px', color: '#fff', marginBottom: 14 }}>
        <div style={{ fontSize: 12, opacity: .7 }}>Welcome to the free demo,</div>
        <div style={{ fontSize: 22, fontWeight: 800, margin: '2px 0 8px' }}>{name || 'Learner'} 👋</div>
        <div style={{ fontSize: 12.5, opacity: .85, lineHeight: 1.6 }}>Explore a taste of GC Buddy — AI-powered German for Indian nurses. A few topics, tests and words are unlocked so you can try it out.</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, marginBottom: 14 }}>
        {tiles.map(([id, ic, t, d]) => (
          <div key={id} onClick={() => go(id)} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 13, padding: '14px', cursor: 'pointer', boxShadow: C.sh }}>
            <div style={{ fontSize: 24 }}>{ic}</div>
            <div style={{ fontWeight: 700, color: C.navy, fontSize: 13, marginTop: 6 }}>{t}</div>
            <div style={{ fontSize: 10.5, color: C.textS, marginTop: 1 }}>{d}</div>
          </div>
        ))}
      </div>
      <SubscribeCard text="Like what you see? Subscribe to unlock the full course — all levels, tests, 3000+ words and unlimited AI coaching." />
    </div>
  )
}

function CurriculumPage() {
  const [lv, setLv] = useState(null)
  const [lesson, setLesson] = useState(null) // topic object
  if (lesson) {
    const th = LEVEL_THEME[lv]
    return (
      <div style={{ ...wrap, display: 'flex', flexDirection: 'column' }}>
        <BackBar th={th} label={lesson.title} onBack={() => setLesson(null)} />
        <div style={{ flex: 1, minHeight: 0 }}>
          <DemoChat maxQ={3} greeting={`Hallo! Let's learn "${lesson.title}". ${lesson.desc || ''}\n\nAsk me anything about this topic — you have 3 questions in this demo.`}
            systemPrompt={`You are GC Buddy, a friendly German tutor for Indian nurses. The student is on the topic "${lesson.title}" (${lesson.desc || ''}). Teach in simple English/Hinglish with short German examples. Keep answers concise.`} />
        </div>
      </div>
    )
  }
  if (lv) {
    const th = LEVEL_THEME[lv], d = demo.curriculum[lv]
    return (
      <div style={wrap}>
        <BackBar th={th} label={`Level ${lv} Curriculum`} onBack={() => setLv(null)} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {d.unlocked.map(t => (
            <div key={t.id} onClick={() => setLesson(t)} style={{ display: 'flex', alignItems: 'center', gap: 9, background: '#fff', border: `1px solid ${C.border}`, borderLeft: `4px solid ${th.main}`, borderRadius: 10, padding: '11px 13px', cursor: 'pointer' }}>
              <span style={{ fontSize: 17 }}>{t.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>{t.title}</div>
                <div style={{ fontSize: 10, color: C.textS }}>{t.desc}</div>
              </div>
              <span style={{ fontSize: 15 }}>▶</span>
            </div>
          ))}
        </div>
        {d.lockedCount > 0 && <><BlurredRows count={d.lockedCount} /><div style={{ marginTop: 12 }}><SubscribeCard text={`${d.lockedCount} more topics in Level ${lv}. Subscribe to the course to unlock them.`} /></div></>}
      </div>
    )
  }
  return (
    <div style={wrap}>
      <H2>📘 Curriculum</H2><Sub>Tap a level · first 2 topics unlocked in this demo</Sub>
      <LevelFolders levels={LEVELS} onOpen={setLv} subtitleFor={lv => `2 topics unlocked · ${demo.curriculum[lv].lockedCount} locked`} />
    </div>
  )
}

function DailyTestPage() {
  const [lv, setLv] = useState(null)
  const [quiz, setQuiz] = useState(null)
  const testLevels = ['A1', 'A2', 'B1'] // B2 has no daily tests (same as the app)
  if (quiz) {
    return <div style={wrap}><Quiz title={quiz.name} questions={quiz.questions} onExit={() => setQuiz(null)} /></div>
  }
  if (lv) {
    const th = LEVEL_THEME[lv], d = demo.dailytests[lv]
    return (
      <div style={wrap}>
        <BackBar th={th} label={`Level ${lv} Daily Tests`} onBack={() => setLv(null)} />
        <div style={{ background: '#fff', border: `2px solid ${C.border}`, borderLeft: `4px solid ${th.main}`, borderRadius: 12, padding: '14px', marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 3 }}>{d.unlocked.name}</div>
          <div style={{ fontSize: 10, color: C.textS, marginBottom: 10 }}>{d.unlocked.questions.length} questions · auto-graded</div>
          <Btn label="▶ Start Test" variant="primary" style={{ width: '100%', background: th.main }} onClick={() => setQuiz(d.unlocked)} />
        </div>
        {d.lockedCount > 0 && <><BlurredRows count={d.lockedCount} label="more tests locked" /><div style={{ marginTop: 12 }}><SubscribeCard text={`${d.lockedCount} more tests in Level ${lv}. Subscribe to the course to unlock them.`} /></div></>}
      </div>
    )
  }
  return (
    <div style={wrap}>
      <H2>📝 Daily Tests</H2><Sub>Tap a level · one test unlocked per level in this demo</Sub>
      <LevelFolders levels={testLevels} onOpen={setLv} subtitleFor={lv => `1 test unlocked · ${demo.dailytests[lv].lockedCount} locked`} />
    </div>
  )
}

function LearnHubPage() {
  const [sub, setSub] = useState('exercises')
  const [exSet, setExSet] = useState(null)   // 0 or 1 (unlocked sets)
  const [gOpen, setGOpen] = useState(null)
  const [locked, setLocked] = useState(false)
  const setQuestions = i => demo.exercises.questions.slice(i * 20, i * 20 + 20).map(q => ({ text: q.q, opts: q.opts, ans: q.ans }))

  if (exSet !== null) {
    return <div style={wrap}><Quiz title={`Exercise Set ${exSet + 1}`} questions={setQuestions(exSet)} onExit={() => setExSet(null)} /></div>
  }
  return (
    <div style={wrap}>
      <H2>📚 Learn Hub</H2><Sub>Exercises · Grammar · Media</Sub>
      <div style={{ display: 'flex', gap: 3, marginBottom: 14, background: '#fff', borderRadius: 10, padding: 3, border: `1px solid ${C.border}` }}>
        {[['exercises', '💪 Exercises'], ['grammar', '📐 Grammar'], ['media', '🎬 Media']].map(([id, l]) => (
          <button key={id} onClick={() => setSub(id)} style={{ flex: 1, padding: '7px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 11, fontFamily: 'inherit', background: sub === id ? C.navy : 'transparent', color: sub === id ? '#fff' : C.textS }}>{l}</button>
        ))}
      </div>

      {sub === 'exercises' && (
        <div>
          <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyM})`, borderRadius: 13, padding: '16px', textAlign: 'center', color: '#fff', marginBottom: 12 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>40 Exercise Sets</div>
            <div style={{ fontSize: 11, opacity: .8, marginTop: 3 }}>First 2 sets unlocked in this demo</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8 }}>
            {Array.from({ length: demo.exercises.totalSets }, (_, i) => {
              const open = i < demo.exercises.unlockedSets
              return (
                <div key={i} onClick={() => open ? setExSet(i) : setLocked(true)}
                  style={{ background: open ? '#fff' : C.surfAlt, border: `2px solid ${open ? C.blue : C.border}`, borderRadius: 11, padding: '12px 6px', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                  <div style={{ fontSize: open ? 17 : 15, fontWeight: 700, color: open ? C.navy : C.textS }}>{open ? i + 1 : '🔒'}</div>
                  <div style={{ fontSize: 9, color: C.textS, marginTop: 2 }}>Set {i + 1}</div>
                </div>
              )
            })}
          </div>
          {locked && <div style={{ marginTop: 12 }}><SubscribeCard text="This exercise set is locked. Subscribe to the course to unlock all 40 sets." /></div>}
        </div>
      )}

      {sub === 'grammar' && (
        <div>
          {demo.grammar.unlocked.map((g, i) => {
            const open = gOpen === i
            return (
              <div key={i} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${open ? C.blue : C.border}`, borderLeft: `4px solid ${C.blue}`, marginBottom: 8, overflow: 'hidden' }}>
                <div onClick={() => setGOpen(open ? null : i)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', cursor: 'pointer' }}>
                  <span style={{ fontSize: 18 }}>{g.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, color: C.navy, fontSize: 12.5 }}>{g.title}</div>
                    {g.sub && <div style={{ fontSize: 10, color: C.textS }}>{g.sub}</div>}
                  </div>
                  <span style={{ color: C.blue, fontSize: 12 }}>{open ? '▲' : '▼'}</span>
                </div>
                {open && <div style={{ padding: '4px 14px 14px', borderTop: `1px solid ${C.border}` }}><div style={{ height: 10 }} />{g.blocks.map((b, j) => <GBlock key={j} b={b} />)}
                  {g.tip && <div style={{ background: C.greenL, borderLeft: `3px solid ${C.green}`, borderRadius: 8, padding: '8px 11px', marginTop: 4, fontSize: 11.5, color: C.textM }}><b style={{ color: C.green }}>💡 Tip · </b>{g.tip}</div>}
                  {g.mistake && <div style={{ background: C.amberL, borderLeft: `3px solid ${C.amber}`, borderRadius: 8, padding: '8px 11px', marginTop: 7, fontSize: 11.5, color: C.textM }}><b style={{ color: C.amber }}>⚠️ Common mistake · </b>{g.mistake}</div>}
                </div>}
              </div>
            )
          })}
          {demo.grammar.lockedCount > 0 && <div style={{ marginTop: 4 }}><BlurredRows count={demo.grammar.lockedCount + 20} label="more grammar topics locked" /><div style={{ marginTop: 12 }}><SubscribeCard text="Subscribe to the course to unlock all grammar topics across A1–B2." /></div></div>}
        </div>
      )}

      {sub === 'media' && (
        <div>
          <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 12 }}>
            <div style={{ filter: 'blur(8px)', pointerEvents: 'none', userSelect: 'none' }} aria-hidden>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, padding: '12px', background: '#fff', border: `1px solid ${C.border}`, borderRadius: 11, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 8, background: '#c7d2e8' }} />
                  <div style={{ flex: 1 }}><div style={{ height: 10, width: '70%', background: '#c7d2e8', borderRadius: 6, marginBottom: 6 }} /><div style={{ height: 8, width: '45%', background: '#dbe3f2', borderRadius: 6 }} /></div>
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30 }}>🔒</div>
          </div>
          <SubscribeCard text="The Media library (podcasts, series, apps & more) is available to subscribers. Subscribe to the course to unlock it." />
        </div>
      )}
    </div>
  )
}

function VocabPage() {
  const [flipped, setFlipped] = useState({})
  return (
    <div style={wrap}>
      <H2>🔤 Vocabulary</H2><Sub>2 days unlocked (20 words) in this demo</Sub>
      <div style={{ background: C.blueL, border: `1px solid ${C.blue}44`, borderRadius: 10, padding: '10px 14px', marginBottom: 12, textAlign: 'center', fontSize: 12.5, fontWeight: 700, color: C.blue }}>
        📚 Learn 3000+ words with GC Buddy
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {demo.vocab.words.map(w => (
          <div key={w.i} onClick={() => setFlipped(f => ({ ...f, [w.i]: !f[w.i] }))} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 10, padding: '11px 13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>{w.de}{w.pl ? <span style={{ fontSize: 10, color: C.textS, fontWeight: 400 }}> · pl. {w.pl}</span> : null}</div>
              <div style={{ fontSize: 11, color: C.textM, marginTop: 2 }}>{flipped[w.i] ? w.en : 'Tap to reveal meaning'}</div>
              {flipped[w.i] && w.ex && <div style={{ fontSize: 10, color: C.textS, fontStyle: 'italic', marginTop: 2 }}>"{w.ex}"</div>}
            </div>
            <button onClick={e => { e.stopPropagation(); playGerman(clipUrlWord(w.i), w.de) }} style={{ border: 'none', background: C.blueL, color: C.blue, borderRadius: 7, padding: '6px 10px', cursor: 'pointer', fontSize: 13 }}>🔊</button>
          </div>
        ))}
      </div>
      <SubscribeCard text="This demo shows just 20 words. Subscribe to the course to learn 3000+ words with spaced-repetition review." />
    </div>
  )
}

function ListeningPage() {
  const [lv, setLv] = useState(null)
  const [playing, setPlaying] = useState(null)
  useEffect(() => stopAll, [])
  function play(idx, de, rate) {
    const key = `${lv}:${idx}:${rate}`
    if (playing === key) { stopAll(); setPlaying(null); return }
    stopAll(); setPlaying(key)
    playGerman(clipUrlPhrase(lv, idx), de, { rate, onEnd: () => setPlaying(null), onFail: () => setPlaying(null) })
  }
  if (lv) {
    const th = LEVEL_THEME[lv], d = demo.listening[lv]
    return (
      <div style={wrap}>
        <BackBar th={th} label={`Level ${lv} Listening`} onBack={() => { stopAll(); setPlaying(null); setLv(null) }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {d.unlocked.map(p => (
            <div key={p.idx} style={{ background: '#fff', border: `1px solid ${C.border}`, borderLeft: `4px solid ${th.main}`, borderRadius: 10, padding: '10px 12px', display: 'flex', gap: 9, alignItems: 'flex-start' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, lineHeight: 1.5 }}>{p.de}</div>
                <div style={{ fontSize: 11, color: C.textM, fontStyle: 'italic', marginTop: 2 }}>{p.en}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <button onClick={() => play(p.idx, p.de, 1)} style={{ width: 40, height: 32, borderRadius: 8, border: 'none', background: th.main, color: '#fff', cursor: 'pointer', fontSize: 14 }}>🔊</button>
                <button onClick={() => play(p.idx, p.de, 0.7)} style={{ width: 40, height: 32, borderRadius: 8, border: `1.5px solid ${th.main}`, background: '#fff', color: th.main, cursor: 'pointer', fontSize: 14 }}>🐢</button>
              </div>
            </div>
          ))}
        </div>
        {d.lockedCount > 0 && <><BlurredRows count={d.lockedCount} label="more phrases locked" /><div style={{ marginTop: 12 }}><SubscribeCard text={`${d.lockedCount} more phrases in Level ${lv}. Subscribe to the course to unlock them.`} /></div></>}
      </div>
    )
  }
  return (
    <div style={wrap}>
      <H2>🎙️ Listening Practice</H2><Sub>Tap a level · 5 phrases unlocked per level in this demo</Sub>
      <LevelFolders levels={LEVELS} onOpen={setLv} subtitleFor={lv => `5 phrases unlocked · ${demo.listening[lv].lockedCount} locked`} />
    </div>
  )
}

function InterviewPage() {
  return (
    <div style={wrap}>
      <H2>🎭 Mock Interview</H2>
      <div style={{ marginTop: 40, background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: '30px 22px', textAlign: 'center' }}>
        <div style={{ fontSize: 40 }}>🎓</div>
        <div style={{ fontSize: 15, fontWeight: 800, color: C.navy, marginTop: 8 }}>Unlocks after B1</div>
        <div style={{ fontSize: 12.5, color: C.textM, lineHeight: 1.6, marginTop: 8, maxWidth: 320, marginInline: 'auto' }}>
          This section is only for students who have cleared the <strong>B1 level</strong> of the course.
        </div>
        <div style={{ marginTop: 16 }}><Btn label="Subscribe to the course →" variant="accent" onClick={fireThanks} /></div>
      </div>
    </div>
  )
}

function GCBuddyPage({ name }) {
  return (
    <div style={{ ...wrap, display: 'flex', flexDirection: 'column' }}>
      <H2>🤖 GC Buddy</H2><Sub>Your AI German coach · 5 questions in this demo</Sub>
      <div style={{ flex: 1, minHeight: 0 }}>
        <DemoChat maxQ={5}
          greeting={`Hallo ${name || ''}! 👋 I'm GC Buddy, your AI German coach. Ask me anything — grammar, vocabulary, pronunciation, or nursing phrases. You have 5 questions in this demo.`}
          systemPrompt="You are GC Buddy, a warm, encouraging AI German coach for Indian nurses preparing to work in Germany. Answer in simple English/Hinglish with short German examples. Keep replies concise and practical." />
      </div>
    </div>
  )
}

function ReferPage({ name }) {
  const url = `https://globalcareersbytestbook.pages.dev/referral?${new URLSearchParams({ name: name || '', enrollment: '' })}`
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyM})`, padding: '13px 18px' }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: '#fff' }}>🎁 Refer & Win</div>
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)' }}>Refer friends · Earn up to a MacBook Air</div>
      </div>
      <iframe src={url} style={{ flex: 1, border: 'none', width: '100%' }} title="Refer & Win" allow="clipboard-write" />
    </div>
  )
}

// ── Lead capture ─────────────────────────────────────────────────────────────
function LeadGate({ onEnter }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  async function submit() {
    const n = name.trim(), p = phone.replace(/\D/g, '')
    if (!n) { setErr('Please enter your name.'); return }
    if (p.length !== 10) { setErr('Please enter a valid 10-digit phone number.'); return }
    setErr(''); setLoading(true)
    try { await sb.from('demo_leads').insert({ name: n, phone: p }) } catch { /* don't block entry on save failure */ }
    try { localStorage.setItem('gc_demo_lead', JSON.stringify({ name: n, phone: p })) } catch { /* noop */ }
    onEnter({ name: n, phone: p })
  }
  return (
    <div style={{ minHeight: '100vh', background: `linear-gradient(160deg,${C.navy} 0%,#0d1f4a 100%)`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px 16px' }}>
      <img src="/mascot.png" alt="GC Buddy" style={{ height: 130, filter: 'drop-shadow(0 10px 26px rgba(0,0,0,.4))' }} onError={e => { e.target.style.display = 'none' }} />
      <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', textAlign: 'center', marginTop: 10 }}>Try GC Buddy — Free Demo</h1>
      <p style={{ color: 'rgba(255,255,255,.5)', fontSize: 12, marginBottom: 18, textAlign: 'center' }}>Enter your details to explore the app</p>
      <div style={{ width: '100%', maxWidth: 380, background: '#fff', borderRadius: 18, padding: '24px 20px', boxShadow: '0 24px 64px rgba(0,0,0,.28)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textS, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>Your Name</div>
        <Inp val={name} set={setName} ph="e.g. Priya Sharma" />
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textS, textTransform: 'uppercase', letterSpacing: '.07em', margin: '12px 0 5px' }}>Phone Number</div>
        <Inp val={phone} set={v => setPhone(v.replace(/\D/g, '').slice(0, 10))} ph="10-digit mobile number" type="tel" />
        {err && <div style={{ color: C.red, fontSize: 12, marginTop: 10, background: C.redL, padding: '8px 12px', borderRadius: 8 }}>{err}</div>}
        <Btn label={loading ? [<Spin sz={13} key="s" />, ' Starting…'] : 'Start Free Demo →'} onClick={submit} disabled={loading} variant="primary" size="lg" style={{ width: '100%', marginTop: 16, borderRadius: 11 }} />
        <div style={{ fontSize: 10, color: C.textS, textAlign: 'center', marginTop: 10 }}>A preview of GC Buddy. Subscribe for full access.</div>
      </div>
    </div>
  )
}

// ── Thank-you confetti popup (fires on any Subscribe / unlock action) ────────
function ThanksOverlay() {
  const [show, setShow] = useState(false)
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const hideRef = useRef(0)

  useEffect(() => {
    const onFire = () => setShow(true)
    window.addEventListener('gc-demo-thanks', onFire)
    return () => window.removeEventListener('gc-demo-thanks', onFire)
  }, [])

  useEffect(() => {
    if (!show) return undefined
    hideRef.current = setTimeout(() => setShow(false), 10000) // auto-dismiss after 10s
    const canvas = canvasRef.current
    if (!canvas) return () => clearTimeout(hideRef.current)
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const W = () => window.innerWidth, H = () => window.innerHeight
    const resize = () => { canvas.width = W() * dpr; canvas.height = H() * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0) }
    resize(); window.addEventListener('resize', resize)
    const colors = ['#1034A6', '#CC5500', '#E1AD01', '#01796F', '#1e90ff', '#2d9e6b', '#ff5e7e', '#ffd166']
    let parts = []
    const spawn = n => { for (let i = 0; i < n; i++) parts.push({ x: W() / 2 + (Math.random() - 0.5) * 140, y: H() * 0.34, vx: (Math.random() - 0.5) * 11, vy: Math.random() * -12 - 4, g: 0.28, size: 5 + Math.random() * 7, rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, color: colors[(Math.random() * colors.length) | 0], life: 0, ttl: 120 + Math.random() * 90 }) }
    spawn(160); const t1 = setTimeout(() => spawn(120), 250); const t2 = setTimeout(() => spawn(100), 550)
    const start = performance.now()
    const loop = () => {
      ctx.clearRect(0, 0, W(), H())
      parts.forEach(p => {
        p.vy += p.g; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.rot += p.vr; p.life++
        ctx.save(); ctx.globalAlpha = Math.max(0, 1 - p.life / p.ttl); ctx.translate(p.x, p.y); ctx.rotate(p.rot)
        ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6); ctx.restore()
      })
      parts = parts.filter(p => p.life < p.ttl && p.y < H() + 40)
      if (performance.now() - start < 9500 || parts.length) rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); clearTimeout(hideRef.current); clearTimeout(t1); clearTimeout(t2) }
  }, [show])

  if (!show) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(6,15,40,.45)', padding: 20 }} onClick={() => setShow(false)}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
      <div onClick={e => e.stopPropagation()} style={{ position: 'relative', background: '#fff', borderRadius: 18, padding: '28px 24px', maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,.35)' }}>
        <div style={{ fontSize: 44 }}>🎉</div>
        <div style={{ fontSize: 17, fontWeight: 800, color: C.navy, margin: '8px 0 6px' }}>Thank you for showing interest!</div>
        <div style={{ fontSize: 13, color: C.textM, lineHeight: 1.6 }}>Our team will get in touch with you.</div>
        <button onClick={() => setShow(false)} style={{ marginTop: 16, background: C.navy, color: '#fff', border: 'none', borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Close</button>
      </div>
    </div>
  )
}

// ── Shell ────────────────────────────────────────────────────────────────────
export default function DemoApp() {
  const [lead, setLead] = useState(null)
  const [tab, setTab] = useState('home')
  useEffect(() => {
    try { const s = localStorage.getItem('gc_demo_lead'); if (s) setLead(JSON.parse(s)) } catch { /* noop */ }
  }, [])
  if (!lead) return <LeadGate onEnter={setLead} />

  const page = () => {
    switch (tab) {
      case 'home': return <HomePage name={lead.name} go={setTab} />
      case 'curriculum': return <CurriculumPage />
      case 'dailytest': return <DailyTestPage />
      case 'learn': return <LearnHubPage />
      case 'vocab': return <VocabPage />
      case 'listening': return <ListeningPage />
      case 'interview': return <InterviewPage />
      case 'gcbuddy': return <GCBuddyPage name={lead.name} />
      case 'referral': return <ReferPage name={lead.name} />
      default: return null
    }
  }
  const ini = (lead.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', flexDirection: 'column' }}>
      <ThanksOverlay />
      <header style={{ background: C.navy, height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', position: 'sticky', top: 0, zIndex: 100, flexShrink: 0 }}>
        <div onClick={() => setTab('home')} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}><img src="/mascot-face.png" alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 13, color: '#fff' }}>GC Buddy <span style={{ fontSize: 9, background: C.amber, color: '#fff', padding: '1px 6px', borderRadius: 8, marginLeft: 2 }}>DEMO</span></div>
            <div style={{ fontSize: 8, color: 'rgba(255,255,255,.4)' }}>by Global Careers × Testbook</div>
          </div>
        </div>
        <button onClick={fireThanks} style={{ background: C.amber, color: '#fff', border: 'none', borderRadius: 20, padding: '6px 14px', fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Subscribe</button>
      </header>
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        <nav className="sidebar" style={{ width: 175, background: '#fff', borderRight: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', padding: '8px 0', flexShrink: 0, overflowY: 'auto' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setTab(n.id)} className={`nav-btn${tab === n.id ? ' active' : ''}`}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 14px', border: 'none', background: tab === n.id ? C.blueL : 'transparent', color: tab === n.id ? C.blue : C.textM, cursor: 'pointer', fontSize: 12, fontWeight: tab === n.id ? 600 : 400, textAlign: 'left', borderLeft: `3px solid ${tab === n.id ? C.blue : 'transparent'}`, fontFamily: 'inherit', width: '100%' }}>
              <span className="nav-icon" style={{ fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {n.icon.startsWith('/') ? <img src={n.icon} alt="" style={{ width: 19, height: 19, objectFit: 'contain' }} /> : n.icon}
              </span>
              <span className="nav-lbl">{n.lbl}</span>
            </button>
          ))}
        </nav>
        <main className="content-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {page()}
        </main>
      </div>
    </div>
  )
}
