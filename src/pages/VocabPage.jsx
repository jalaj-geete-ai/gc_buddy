import { useState, useEffect, useMemo } from 'react'
import { C } from '../lib/constants'
import { Btn, PBar, Spin } from '../components/UI'
import { trackEvent } from '../lib/supabase'
import {
  loadVocabBank, loadVocabProgress, rateWord, saveVocabState,
  wordsForDay, allWords, dueWordIds, masteredCount, remainingToday,
  nextDayNumber, today, wordsToday, isMastered, recordMasterAnswer,
  MASTER_THRESHOLD, TOTAL_DAYS, MILESTONES, WORDS_PER_SET, MAX_WORDS_PER_DAY,
} from '../lib/vocab'
import { playGerman, stopAll, clipUrlWord } from '../lib/tts'

const shuffle = a => [...a].sort(() => Math.random() - 0.5)

function Ring({ pct, size = 62 }) {
  const r = (size - 8) / 2, circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth="6" />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.green} strokeWidth="6"
        strokeLinecap="round" strokeDasharray={circ}
        strokeDashoffset={circ * (1 - Math.min(1, pct))}
        style={{ transition: 'stroke-dashoffset .4s' }} />
    </svg>
  )
}

function Speaker({ text, id, size = 'md' }) {
  const s = size === 'sm'
    ? { padding: '3px 7px', fontSize: 10 }
    : { padding: '6px 12px', fontSize: 13 }
  return (
    <button title="Hear it in German"
      onClick={e => { e.stopPropagation(); playGerman(id ? clipUrlWord(id) : null, text) }}
      style={{ ...s, border: 'none', background: C.blueL, color: C.blue, borderRadius: 6, cursor: 'pointer', flexShrink: 0, fontFamily: 'inherit' }}>
      🔊
    </button>
  )
}

function CapNotice() {
  return (
    <div style={{ background: C.blueL, border: `1px solid ${C.blue}33`, borderRadius: 9, padding: '12px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, lineHeight: 1.6 }}>
        More questions will be unlocked tomorrow.
      </div>
      <div style={{ fontSize: 11, color: C.textM, marginTop: 3, lineHeight: 1.6 }}>
        Till then practice the words you learned today.
      </div>
    </div>
  )
}

function WordRow({ w, rec }) {
  const tone = isMastered(rec) ? C.green : !rec ? C.textS : rec.box >= 3 ? C.blue : C.amber
  return (
    <div style={{ background: '#fff', borderRadius: 10, border: `1px solid ${C.border}`, padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 700, color: C.navy, fontSize: 13 }}>{w.de}</span>
        {w.pl && <span style={{ color: C.textS, fontSize: 10, marginLeft: 6 }}>· pl. {w.pl}</span>}
        <div style={{ fontSize: 11, color: C.textM, marginTop: 2 }}>{w.en}</div>
        {w.ex && <div style={{ fontSize: 10, color: C.textS, marginTop: 2, fontStyle: 'italic' }}>"{w.ex}"</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
        <span style={{ width: 7, height: 7, borderRadius: '50%', background: tone }} />
        <Speaker text={w.de} id={w.i} size="sm" />
      </div>
    </div>
  )
}

export default function VocabPage({ user }) {
  const roll = user?.rollNumber

  const [bank, setBank] = useState(null)
  const [prog, setProg] = useState({})
  const [vstate, setVstate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')

  const [view, setView] = useState('today')
  const [session, setSession] = useState(null)   // { mode:'new'|'review', day, words }
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const [openDay, setOpenDay] = useState(null)
  const [master, setMaster] = useState(null)   // { queue:[wordId...], sel, q, justMastered, done, sessionMastered }
  const [openWord, setOpenWord] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const [b, p] = await Promise.all([loadVocabBank(), loadVocabProgress(roll)])
        if (!alive) return
        setBank(b); setProg(p.prog); setVstate(p.state)
      } catch (e) {
        if (alive) setErr(e.message || 'Could not load vocabulary')
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [roll])

  useEffect(() => stopAll, [])



  const dueIds = useMemo(() => dueWordIds(prog), [prog])
  const mastered = useMemo(() => masteredCount(prog), [prog])
  const nextDay = nextDayNumber(vstate)
  const left = remainingToday(vstate)
  const dayData = bank ? wordsForDay(bank, nextDay) : null
  const doneToday = wordsToday(vstate)
  const finished = (vstate?.current_day || 0) >= TOTAL_DAYS
  const seen = Object.keys(prog).length

  const byId = useMemo(() => {
    const m = {}
    for (const w of allWords(bank)) m[w.i] = w
    return m
  }, [bank])

  // Words the student has unlocked so far (across days 1..current_day).
  const unlockedWords = useMemo(
    () => (bank?.days || []).filter(d => d.d <= (vstate?.current_day || 0)).flatMap(d => d.w),
    [bank, vstate])
  // Unlocked words not yet mastered — the pool for "Master Your Words".
  const toMaster = useMemo(() => unlockedWords.filter(w => !isMastered(prog[w.i])), [unlockedWords, prog])
  // Every mastered word, newest first — the revisit list.
  const masteredWords = useMemo(
    () => allWords(bank).filter(w => isMastered(prog[w.i]))
      .sort((a, b) => (prog[b.i]?.mastered_at || '').localeCompare(prog[a.i]?.mastered_at || '')),
    [bank, prog])

  function begin(mode) {
    const words = mode === 'new'
      ? (dayData?.w || [])
      : shuffle(dueIds.map(i => byId[i]).filter(Boolean)).slice(0, 20)
    if (!words.length) return
    setSession({ mode, day: mode === 'new' ? nextDay : null, words })
    setIdx(0); setFlipped(false); setRevealed(false)
    setView(mode === 'new' ? 'learn' : 'recall')
    trackEvent(roll, mode === 'new' ? 'vocab_day_start' : 'vocab_review_start', 'vocabulary',
      mode === 'new' ? `Day ${nextDay}` : `${words.length} due`, user?.level)
  }

  async function rate(correct) {
    const w = session.words[idx]
    const row = await rateWord(roll, w.i, correct, prog[w.i])
    const nextProg = { ...prog, [w.i]: row }
    setProg(nextProg)

    if (idx + 1 < session.words.length) {
      setIdx(idx + 1); setRevealed(false); return
    }
    // session finished
    if (session.mode === 'new') {
      const fresh = vstate?.last_day_on !== today()
      const next = {
        current_day: session.day,
        last_day_on: today(),
        days_today: (fresh ? 0 : (vstate?.days_today || 0)) + 1,
        words_mastered: masteredCount(nextProg),
      }
      setVstate(next)
      saveVocabState(roll, next)
      trackEvent(roll, 'vocab_day_complete', 'vocabulary', `Day ${session.day}`, user?.level)
      setQuiz(buildQuiz(session.words, bank))
      setView('quiz')
    } else {
      trackEvent(roll, 'vocab_review_complete', 'vocabulary', `${session.words.length} words`, user?.level)
      setSession(null); setView('today')
    }
  }

  // ── Master Your Words ──────────────────────────────────────────────────────
  function beginMaster() {
    const queue = shuffle(toMaster.map(w => w.i))
    if (!queue.length) return
    setMaster({ queue, sel: null, q: buildMeaningQ(byId[queue[0]], bank), justMastered: false, done: false, sessionMastered: 0 })
    setView('master')
    trackEvent(roll, 'vocab_master_start', 'vocabulary', `${queue.length} to master`, user?.level)
  }

  async function answerMaster(i) {
    if (!master || master.sel !== null) return
    const wid = master.queue[0]
    const ok = i === master.q.ans
    const row = await recordMasterAnswer(roll, wid, ok, prog[wid])
    setProg(p => ({ ...p, [wid]: row }))
    const nowMastered = ok && isMastered(row)
    setMaster(m => ({ ...m, sel: i, justMastered: nowMastered, sessionMastered: m.sessionMastered + (nowMastered ? 1 : 0) }))
    if (nowMastered) trackEvent(roll, 'vocab_word_mastered', 'vocabulary', byId[wid]?.de || String(wid), user?.level)
    setTimeout(() => {
      setMaster(m => {
        if (!m) return m
        // Mastered → drop from the queue; otherwise rotate to the back so it comes round again.
        const queue = nowMastered ? m.queue.slice(1) : [...m.queue.slice(1), m.queue[0]]
        if (!queue.length) {
          trackEvent(roll, 'vocab_master_complete', 'vocabulary', `${m.sessionMastered} mastered`, user?.level)
          return { ...m, sel: null, queue: [], done: true }
        }
        return { ...m, sel: null, justMastered: false, queue, q: buildMeaningQ(byId[queue[0]], bank) }
      })
    }, 900)
  }

  if (loading) {
    return <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spin sz={26} /></div>
  }
  if (err) {
    return (
      <div style={{ flex: 1, padding: '24px 18px' }}>
        <div style={{ background: C.redL, border: `1px solid ${C.red}33`, borderRadius: 11, padding: '14px 16px' }}>
          <div style={{ fontWeight: 700, color: C.red, fontSize: 13, marginBottom: 4 }}>Vocabulary unavailable</div>
          <div style={{ fontSize: 11, color: C.textM }}>{err} — please refresh, or check back shortly.</div>
        </div>
      </div>
    )
  }

  const wrap = { flex: 1, overflow: 'auto', padding: '16px 18px' }

  // ── LEARN ──────────────────────────────────────────────────────────────────
  if (view === 'learn' && session) {
    const w = session.words[idx]
    const last = idx + 1 === session.words.length
    return (
      <div style={wrap}>
        <SessionHead title={`Day ${session.day}`} sub={dayData?.t} idx={idx} total={session.words.length}
          onQuit={() => { setSession(null); setView('today') }} />
        <div onClick={() => setFlipped(f => !f)}
          style={{ background: flipped ? `linear-gradient(135deg,${C.navy},${C.navyM})` : '#fff', border: `1px solid ${C.border}`, borderRadius: 15, padding: '26px 20px', minHeight: 210, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: C.shM, marginBottom: 12, transition: 'all .25s' }}>
          <div style={{ position: 'relative', top: -8, fontSize: 9, color: flipped ? 'rgba(255,255,255,.4)' : C.textS }}>
            {flipped ? 'Meaning' : 'Tap to flip →'}
          </div>
          {!flipped ? (
            <>
              <div style={{ fontSize: 24, fontWeight: 700, color: C.navy, textAlign: 'center' }}>{w.de}</div>
              {w.pl && <div style={{ fontSize: 11, color: C.textS, marginTop: 3 }}>plural: {w.pl}</div>}
              {w.p && <div style={{ fontSize: 9, color: C.blue, background: C.blueL, padding: '2px 8px', borderRadius: 9, marginTop: 8 }}>{w.p}</div>}
              <div style={{ marginTop: 14 }}><Speaker text={w.de} id={w.i} /></div>
            </>
          ) : (
            <>
              <div style={{ fontSize: 19, fontWeight: 700, color: '#fff', textAlign: 'center' }}>{w.en}</div>
              {w.ex && <div style={{ fontSize: 12, color: 'rgba(255,255,255,.75)', marginTop: 10, fontStyle: 'italic', textAlign: 'center' }}>"{w.ex}"</div>}
              {w.m && <div style={{ fontSize: 10, color: 'rgba(255,255,255,.55)', marginTop: 12, textAlign: 'center', lineHeight: 1.6 }}>💡 {w.m}</div>}
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Btn label="← Prev" variant="outline" disabled={idx === 0}
            onClick={() => { setIdx(i => Math.max(0, i - 1)); setFlipped(false) }} />
          {last
            ? <Btn label="Start recall →" variant="accent" onClick={() => { setView('recall'); setIdx(0); setRevealed(false) }} />
            : <Btn label="Next →" variant="accent" onClick={() => { setIdx(i => i + 1); setFlipped(false) }} />}
        </div>
      </div>
    )
  }

  // ── RECALL ─────────────────────────────────────────────────────────────────
  if (view === 'recall' && session) {
    const w = session.words[idx]
    return (
      <div style={wrap}>
        <SessionHead title={session.mode === 'new' ? `Day ${session.day} · recall` : 'Review'}
          sub={session.mode === 'new' ? 'Say the meaning before revealing' : 'Words due today'}
          idx={idx} total={session.words.length}
          onQuit={() => { setSession(null); setView('today') }} />
        <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 15, padding: '30px 20px', minHeight: 190, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: C.sh, marginBottom: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: C.navy, textAlign: 'center' }}>{w.de}</div>
          <div style={{ marginTop: 12 }}><Speaker text={w.de} id={w.i} /></div>
          {revealed && (
            <div style={{ marginTop: 16, textAlign: 'center', borderTop: `1px solid ${C.border}`, paddingTop: 14, width: '100%' }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: C.green }}>{w.en}</div>
              {w.ex && <div style={{ fontSize: 11, color: C.textS, marginTop: 6, fontStyle: 'italic' }}>"{w.ex}"</div>}
            </div>
          )}
        </div>
        {!revealed
          ? <div style={{ display: 'flex', justifyContent: 'center' }}><Btn label="Reveal answer" variant="accent" onClick={() => setRevealed(true)} /></div>
          : <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Btn label="✗ Again" variant="outline" onClick={() => rate(false)} />
              <Btn label="✓ Got it" variant="accent" onClick={() => rate(true)} />
            </div>}
        <p style={{ fontSize: 10, color: C.textS, textAlign: 'center', marginTop: 12 }}>
          Answer honestly — "Again" brings the word back tomorrow, which is how it sticks.
        </p>
      </div>
    )
  }

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  if (view === 'quiz' && quiz) {
    const q = quiz.qs[quiz.cur]
    if (quiz.done) {
      const pct = Math.round((quiz.score / quiz.qs.length) * 100)
      const done = wordsToday(vstate)
      const canMore = left > 0 && !finished
      return (
        <div style={wrap}>
          <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, padding: '26px 20px', textAlign: 'center', boxShadow: C.sh }}>
            <div style={{ fontSize: 34 }}>{pct >= 80 ? '🎉' : pct >= 60 ? '👍' : '📖'}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.navy, marginTop: 6 }}>{quiz.score}/{quiz.qs.length}</div>
            <div style={{ fontSize: 12, color: C.textM, marginTop: 4 }}>
              Day {session?.day} complete — these words are scheduled for review
            </div>

            <div style={{ background: C.blueL, borderRadius: 9, padding: '9px 12px', marginTop: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.blue }}>{done} of {MAX_WORDS_PER_DAY} words unlocked today</div>
              <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 6 }}>
                {Array.from({ length: MAX_WORDS_PER_DAY / WORDS_PER_SET }).map((_, i) => (
                  <span key={i} style={{ width: 34, height: 5, borderRadius: 3, background: i < done / WORDS_PER_SET ? C.blue : '#fff' }} />
                ))}
              </div>
            </div>

            {canMore ? (
              <>
                <div style={{ marginTop: 16 }}>
                  <Btn label="🔓 Unlock 10 more words" variant="accent" style={{ width: '100%' }}
                    onClick={() => { setQuiz(null); begin('new') }} />
                </div>
                <button onClick={() => { setQuiz(null); setSession(null); setView('today') }}
                  style={{ border: 'none', background: 'transparent', color: C.textS, cursor: 'pointer', fontSize: 11, marginTop: 11, fontFamily: 'inherit' }}>
                  That's enough for today
                </button>
              </>
            ) : (
              <div style={{ marginTop: 16 }}>
                <CapNotice />
                <div style={{ marginTop: 12 }}>
                  <Btn label="Back to today" variant="accent" onClick={() => { setQuiz(null); setSession(null); setView('today') }} />
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }
    return (
      <div style={wrap}>
        <SessionHead title="Quick check" sub={`Day ${session?.day}`} idx={quiz.cur} total={quiz.qs.length}
          onQuit={() => { setQuiz(null); setSession(null); setView('today') }} />
        <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 16px 18px', boxShadow: C.sh }}>
          <div style={{ fontSize: 10, color: C.textS, marginBottom: 8 }}>{q.label}</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.navy, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ flex: 1 }}>{q.prompt}</span>
            {q.speak && <Speaker text={q.speak} id={q.speakId} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 12 }}>
            {q.opts.map((o, i) => {
              const chosen = quiz.sel === i
              const isAns = i === q.ans
              const show = quiz.sel !== null
              const bg = !show ? '#fff' : isAns ? C.greenL : chosen ? C.redL : '#fff'
              const bd = !show ? C.border : isAns ? C.green : chosen ? C.red : C.border
              return (
                <button key={i} disabled={show} onClick={() => answerQuiz(i)}
                  style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 9, border: `1.5px solid ${bd}`, background: bg, cursor: show ? 'default' : 'pointer', fontSize: 13, color: C.text, fontFamily: 'inherit' }}>
                  {o}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ── MASTER YOUR WORDS ────────────────────────────────────────────────────────
  if (view === 'master' && master) {
    if (master.done) {
      return (
        <div style={wrap}>
          <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, padding: '26px 20px', textAlign: 'center', boxShadow: C.sh }}>
            <div style={{ fontSize: 34 }}>🏆</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.navy, marginTop: 6 }}>All caught up!</div>
            <div style={{ fontSize: 12, color: C.textM, marginTop: 4, lineHeight: 1.6 }}>
              You've mastered every word you've unlocked{master.sessionMastered ? ` — ${master.sessionMastered} this session` : ''}. Learn more words to keep going.
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
              <Btn label="⭐ Revisit mastered" variant="outline" style={{ flex: 1 }} onClick={() => { setMaster(null); setOpenWord(null); setView('mastered') }} />
              <Btn label="Back to today" variant="accent" style={{ flex: 1 }} onClick={() => { setMaster(null); setView('today') }} />
            </div>
          </div>
        </div>
      )
    }
    const q = master.q
    const wid = master.queue[0]
    const got = prog[wid]?.master_correct || 0
    return (
      <div style={wrap}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>🎯 Master Your Words</div>
            <div style={{ fontSize: 10, color: C.textS }}>Mastered this session: {master.sessionMastered} · {master.queue.length} to go</div>
          </div>
          <button onClick={() => { setMaster(null); setView('today') }} style={{ border: 'none', background: 'transparent', color: C.textS, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>Exit</button>
        </div>
        <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px 16px 18px', boxShadow: C.sh }}>
          <div style={{ fontSize: 10, color: C.textS, marginBottom: 8 }}>What does this word mean?</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ flex: 1 }}>{q.prompt}</span>
            <Speaker text={q.speak} id={q.speakId} />
          </div>
          {/* 3-correct progress */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
            {Array.from({ length: MASTER_THRESHOLD }).map((_, n) => (
              <span key={n} style={{ width: 26, height: 5, borderRadius: 3, background: n < got ? C.green : C.border }} />
            ))}
            <span style={{ fontSize: 9, color: C.textS, marginLeft: 6 }}>{Math.min(got, MASTER_THRESHOLD)}/{MASTER_THRESHOLD} correct</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginTop: 12 }}>
            {q.opts.map((o, n) => {
              const chosen = master.sel === n
              const isAns = n === q.ans
              const show = master.sel !== null
              const bg = !show ? '#fff' : isAns ? C.greenL : chosen ? C.redL : '#fff'
              const bd = !show ? C.border : isAns ? C.green : chosen ? C.red : C.border
              return (
                <button key={n} disabled={show} onClick={() => answerMaster(n)}
                  style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 9, border: `1.5px solid ${bd}`, background: bg, cursor: show ? 'default' : 'pointer', fontSize: 13, color: C.text, fontFamily: 'inherit' }}>
                  {o}
                </button>
              )
            })}
          </div>
          {master.justMastered && (
            <div style={{ marginTop: 12, background: C.greenL, border: `1px solid ${C.green}44`, borderRadius: 9, padding: '8px 12px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: C.green }}>
              🎉 Mastered! Added to your mastered words.
            </div>
          )}
        </div>
        <p style={{ fontSize: 10, color: C.textS, textAlign: 'center', marginTop: 12 }}>
          Answer a word's meaning correctly {MASTER_THRESHOLD} times to master it.
        </p>
      </div>
    )
  }

  // ── MASTERED WORDS (revisit) ─────────────────────────────────────────────────
  if (view === 'mastered') {
    return (
      <div style={wrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Btn label="← Back" variant="outline" size="sm" onClick={() => setView('today')} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>⭐ Mastered words</div>
            <div style={{ fontSize: 10, color: C.textS }}>{masteredWords.length} word{masteredWords.length !== 1 ? 's' : ''} · tap to revisit</div>
          </div>
        </div>
        {!masteredWords.length
          ? <p style={{ fontSize: 12, color: C.textS, lineHeight: 1.6 }}>No words mastered yet. Answer a word's meaning correctly {MASTER_THRESHOLD} times in “Master Your Words” and it will appear here.</p>
          : <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {masteredWords.map(w => {
                const open = openWord === w.i
                return (
                  <div key={w.i} onClick={() => setOpenWord(open ? null : w.i)}
                    style={{ background: '#fff', borderRadius: 11, border: `1px solid ${open ? C.green : C.border}`, padding: '11px 13px', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontWeight: 700, color: C.navy, fontSize: 14 }}>{w.de}</span>
                        {w.pl && <span style={{ color: C.textS, fontSize: 10, marginLeft: 6 }}>· pl. {w.pl}</span>}
                        {!open && <div style={{ fontSize: 11, color: C.textM, marginTop: 2 }}>{w.en}</div>}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        <span style={{ fontSize: 12 }}>✅</span>
                        <Speaker text={w.de} id={w.i} size="sm" />
                      </div>
                    </div>
                    {open && (
                      <div style={{ marginTop: 8, borderTop: `1px solid ${C.border}`, paddingTop: 8 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.green }}>{w.en}</div>
                        {w.ex && <div style={{ fontSize: 11, color: C.textM, marginTop: 5, fontStyle: 'italic' }}>"{w.ex}"</div>}
                        {w.m && <div style={{ fontSize: 10, color: C.textS, marginTop: 6, lineHeight: 1.6 }}>💡 {w.m}</div>}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>}
      </div>
    )
  }

  // ── BROWSE ─────────────────────────────────────────────────────────────────
  if (view === 'browse') {
    const unlocked = (bank?.days || []).filter(d => d.d <= (vstate?.current_day || 0))
    return (
      <div style={wrap}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Btn label="← Back" variant="outline" size="sm" onClick={() => setView('today')} />
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>My word list</div>
        </div>
        {!unlocked.length
          ? <p style={{ fontSize: 12, color: C.textS }}>Finish your first day and your words will collect here.</p>
          : [...unlocked].reverse().map(d => (
            <div key={d.d} style={{ marginBottom: 8 }}>
              <div onClick={() => setOpenDay(openDay === d.d ? null : d.d)}
                style={{ background: '#fff', borderRadius: 11, border: `1px solid ${C.border}`, padding: '11px 13px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ background: C.blueL, color: C.blue, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 9, marginRight: 7 }}>{d.l}</span>
                  <span style={{ fontWeight: 600, color: C.navy, fontSize: 12 }}>Day {d.d} · {d.t}</span>
                </div>
                <span style={{ color: C.blue, fontSize: 12 }}>{openDay === d.d ? '▲' : '▼'}</span>
              </div>
              {openDay === d.d && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginTop: 6 }}>
                  {d.w.map(w => <WordRow key={w.i} w={w} rec={prog[w.i]} />)}
                </div>
              )}
            </div>
          ))}
      </div>
    )
  }

  // ── TODAY ──────────────────────────────────────────────────────────────────
  const dayPct = Math.min(1, (vstate?.current_day || 0) / TOTAL_DAYS)
  const hitMilestone = [...MILESTONES].reverse().find(m => mastered >= m)

  return (
    <div style={wrap}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 3 }}>🔤 Daily Vocabulary</h2>
      <p style={{ fontSize: 11, color: C.textS, marginBottom: 12 }}>10 words a set · up to {MAX_WORDS_PER_DAY} a day · A1, A2 &amp; B1</p>

      {/* Today card */}
      <div style={{ background: '#fff', borderRadius: 14, border: `1px solid ${C.border}`, padding: '16px 16px', marginBottom: 12, boxShadow: C.sh }}>
        {finished ? (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 30 }}>🏆</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.navy, marginTop: 6 }}>All {TOTAL_DAYS} days complete</div>
            <div style={{ fontSize: 11, color: C.textM, marginTop: 3 }}>1,962 words across A1, A2 &amp; B1. Keep the reviews going!</div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ position: 'relative' }}>
                <Ring pct={dayPct} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: C.navy }}>
                  {vstate?.current_day || 0}
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, color: C.textS, textTransform: 'uppercase', letterSpacing: '.06em' }}>Up next</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>Day {nextDay}</div>
                <div style={{ fontSize: 11, color: C.textM, marginTop: 1 }}>{dayData?.t || ''}</div>
              </div>
            </div>
            <div style={{ marginTop: 14 }}>
              {left > 0
                ? <Btn label={doneToday ? '🔓 Unlock 10 more words' : 'Learn 10 new words →'} variant="accent"
                    onClick={() => begin('new')} style={{ width: '100%' }} />
                : <CapNotice />}
              {doneToday > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                    <span style={{ fontSize: 10, color: C.textS }}>Unlocked today</span>
                    <span style={{ fontSize: 10, color: C.textM, fontWeight: 600 }}>{doneToday} / {MAX_WORDS_PER_DAY} words</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: MAX_WORDS_PER_DAY / WORDS_PER_SET }).map((_, i) => (
                      <span key={i} style={{ flex: 1, height: 5, borderRadius: 3, background: i < doneToday / WORDS_PER_SET ? C.green : C.border }} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Reviews */}
      <div style={{ background: dueIds.length ? C.greenL : '#fff', border: `1px solid ${dueIds.length ? C.green + '44' : C.border}`, borderRadius: 12, padding: '13px 15px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: dueIds.length ? C.green : C.textM }}>
            {dueIds.length ? `${dueIds.length} word${dueIds.length > 1 ? 's' : ''} due for review` : 'No reviews due'}
          </div>
          <div style={{ fontSize: 10, color: C.textM, marginTop: 2 }}>
            {dueIds.length ? 'Recalling them today is what moves them into long-term memory.' : 'Come back tomorrow — yesterday\'s words will be waiting.'}
          </div>
        </div>
        {dueIds.length > 0 && <Btn label="Review" variant="accent" size="sm" onClick={() => begin('review')} />}
      </div>

      {/* Master Your Words */}
      <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 12, padding: '13px 15px', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.navy }}>🎯 Master Your Words</div>
          <div style={{ fontSize: 10, color: C.textM, marginTop: 2, lineHeight: 1.5 }}>
            {toMaster.length
              ? <>Pick the right meaning {MASTER_THRESHOLD}× to master a word · <b>{toMaster.length}</b> to go</>
              : unlockedWords.length ? 'All unlocked words mastered — learn more to continue' : 'Learn some words first, then master them here'}
          </div>
        </div>
        {toMaster.length > 0 && <Btn label="Start" variant="accent" size="sm" onClick={beginMaster} />}
      </div>

      {/* Mastery */}
      <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '13px 15px', marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 7 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: C.navy }}>Words mastered</div>
          <div style={{ fontSize: 12, color: C.textS }}><b style={{ color: C.green, fontSize: 15 }}>{mastered}</b> / 1,200</div>
        </div>
        <PBar pct={(mastered / 1200) * 100} color={C.green} />
        <div style={{ display: 'flex', gap: 14, marginTop: 11 }}>
          {[['Seen', seen], ['Mastered', mastered], ['Days done', vstate?.current_day || 0]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 15, fontWeight: 700, color: C.navy }}>{v}</div>
              <div style={{ fontSize: 9, color: C.textS }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 5, marginTop: 12, flexWrap: 'wrap' }}>
          {MILESTONES.map(m => {
            const hit = mastered >= m
            return (
              <span key={m} style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 10, background: hit ? C.amber : C.blueL, color: hit ? '#fff' : C.textS }}>
                {m}
              </span>
            )
          })}
        </div>
        {hitMilestone && (
          <div style={{ fontSize: 10, color: C.amber, marginTop: 8, fontWeight: 600 }}>🏅 {hitMilestone} words mastered — keep going!</div>
        )}
        {mastered > 0 && (
          <button onClick={() => { setOpenWord(null); setView('mastered') }}
            style={{ width: '100%', marginTop: 12, padding: '9px', borderRadius: 9, border: `1.5px solid ${C.green}55`, background: C.greenL, color: C.green, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
            ⭐ Revisit mastered words →
          </button>
        )}
      </div>

      <Btn label="📋 Browse my word list" variant="outline" onClick={() => setView('browse')} style={{ width: '100%' }} />
    </div>
  )

  function answerQuiz(i) {
    if (quiz.sel !== null) return
    const q = quiz.qs[quiz.cur]
    const ok = i === q.ans
    setQuiz(s => ({ ...s, sel: i, score: s.score + (ok ? 1 : 0) }))
    setTimeout(() => {
      setQuiz(s => s.cur + 1 >= s.qs.length
        ? { ...s, done: true }
        : { ...s, cur: s.cur + 1, sel: null })
    }, 750)
  }
}

function SessionHead({ title, sub, idx, total, onQuit }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>{title}</div>
          {sub && <div style={{ fontSize: 10, color: C.textS }}>{sub}</div>}
        </div>
        <button onClick={onQuit} style={{ border: 'none', background: 'transparent', color: C.textS, cursor: 'pointer', fontSize: 11, fontFamily: 'inherit' }}>Exit</button>
      </div>
      <PBar pct={((idx + 1) / total) * 100} />
      <div style={{ fontSize: 9, color: C.textS, textAlign: 'right', marginTop: 3 }}>{idx + 1} / {total}</div>
    </div>
  )
}

// ── Quiz generation ──────────────────────────────────────────────────────────
// Pick 3 distinct distractor words from the pool that differ from `exclude` on `key`.
function pickDistractors(pool, exclude, key) {
  const out = []
  const tried = new Set()
  while (out.length < 3 && tried.size < 60) {
    const c = pool[Math.floor(Math.random() * pool.length)]
    tried.add(c.i)
    if (c.i !== exclude.i && c[key] && !out.some(o => o[key] === c[key]) && c[key] !== exclude[key]) out.push(c)
  }
  return out
}

// A single "what does this German word mean?" multiple-choice question.
function buildMeaningQ(w, bank) {
  const opts = shuffle([w, ...pickDistractors(allWords(bank), w, 'en')])
  return { prompt: w.de, speak: w.de, speakId: w.i, opts: opts.map(o => o.en), ans: opts.findIndex(o => o.i === w.i) }
}

function buildQuiz(words, bank) {
  const pool = allWords(bank)
  const pick = (exclude, key) => pickDistractors(pool, exclude, key)

  const qs = words.map((w, n) => {
    const kind = n % 3
    if (kind === 0) {
      const opts = shuffle([w, ...pick(w, 'en')])
      return { label: 'What does this mean?', prompt: w.de, speak: w.de, speakId: w.i,
        opts: opts.map(o => o.en), ans: opts.findIndex(o => o.i === w.i) }
    }
    if (kind === 1) {
      const opts = shuffle([w, ...pick(w, 'de')])
      return { label: 'Which German word is this?', prompt: w.en, speak: null,
        opts: opts.map(o => o.de), ans: opts.findIndex(o => o.i === w.i) }
    }
    const opts = shuffle([w, ...pick(w, 'de')])
    return { label: 'Listen and choose', prompt: '🔊 Tap the speaker, then pick what you heard', speak: w.de, speakId: w.i,
      opts: opts.map(o => o.de), ans: opts.findIndex(o => o.i === w.i) }
  })

  return { qs: shuffle(qs), cur: 0, sel: null, score: 0, done: false }
}
