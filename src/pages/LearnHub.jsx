import { useState } from 'react'
import { C } from '../lib/constants'
import { EXERCISES } from '../lib/data'
import { GRAMMAR, GRAMMAR_LEVELS } from '../lib/grammar'
import { PBar, Btn } from '../components/UI'
import { trackEvent } from '../lib/supabase'
import MediaPage from './MediaPage'

// ── Grammar block renderer ────────────────────────────────────────────────────
// Grammar content is structured (see lib/grammar.js) so we render clean lists,
// tables and example pairs instead of a monospace text dump.
function GrammarBlock({ b }) {
  const heading = b.h && (
    <div style={{ fontSize: 11, fontWeight: 700, color: C.navy, margin: '2px 0 6px' }}>{b.h}</div>
  )
  if (b.type === 'note') {
    return <div style={{ marginBottom: 12 }}>{heading}
      <p style={{ fontSize: 12, color: C.textM, lineHeight: 1.6, margin: 0 }}>{b.text}</p>
    </div>
  }
  if (b.type === 'list') {
    return <div style={{ marginBottom: 12 }}>{heading}
      <ul style={{ margin: 0, paddingLeft: 16 }}>
        {b.items.map((it, i) => (
          <li key={i} style={{ fontSize: 12, color: C.textM, lineHeight: 1.7, marginBottom: 2 }}>{it}</li>
        ))}
      </ul>
    </div>
  }
  if (b.type === 'ex') {
    return <div style={{ marginBottom: 12 }}>{heading}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {b.items.map(([de, en], i) => (
          <div key={i} style={{ background: C.blueL, borderRadius: 8, padding: '8px 11px', borderLeft: `3px solid ${C.blue}` }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: C.navy, lineHeight: 1.5 }}>{de}</div>
            <div style={{ fontSize: 11, color: C.textM, fontStyle: 'italic', marginTop: 1 }}>{en}</div>
          </div>
        ))}
      </div>
    </div>
  }
  if (b.type === 'table') {
    return <div style={{ marginBottom: 12 }}>{heading}
      <div style={{ overflowX: 'auto', border: `1px solid ${C.border}`, borderRadius: 8 }}>
        <table style={{ borderCollapse: 'collapse', width: '100%', fontSize: 11.5 }}>
          <thead>
            <tr>{b.cols.map((c, i) => (
              <th key={i} style={{ textAlign: 'left', padding: '7px 10px', background: C.surfAlt, color: C.navy, fontWeight: 700, borderBottom: `1px solid ${C.border}`, whiteSpace: 'nowrap' }}>{c}</th>
            ))}</tr>
          </thead>
          <tbody>
            {b.rows.map((r, ri) => (
              <tr key={ri} style={{ background: ri % 2 ? C.surfAlt : '#fff' }}>
                {r.map((cell, ci) => (
                  <td key={ci} style={{ padding: '7px 10px', color: ci === 0 ? C.navy : C.textM, fontWeight: ci === 0 ? 600 : 400, borderBottom: ri < b.rows.length - 1 ? `1px solid ${C.border}` : 'none', verticalAlign: 'top' }}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  }
  return null
}

export default function LearnHub({ user, onAddScore }) {
  const [sub, setSub] = useState('exercises')

  // EXERCISES STATE
  const [setNum, setSetNum] = useState(null)   // which of 20 sets
  const [exSt, setExSt] = useState(null)
  const [showSetPicker, setShowSetPicker] = useState(false)

  // GRAMMAR STATE
  const [gramId, setGramId] = useState(null)                      // expanded card id
  const [gramLevel, setGramLevel] = useState(user?.level || 'A1') // level filter
  const [gramQuery, setGramQuery] = useState('')                  // search text

  const scores = JSON.parse(localStorage.getItem(`gc_ex_${user?.level}`) || '[]')
  const lastScore = scores[scores.length - 1]
  const bestScore = scores.length ? Math.max(...scores) : null

  function startSet(n) {
    // Each "set" is 20 questions from a seeded random (consistent per set number)
    const bank = EXERCISES[user?.level] || EXERCISES.A1
    // For set n, shuffle deterministically then take 20
    const shuffled = [...bank].sort((a, b) => {
      const hashA = (a.q.charCodeAt(0) * (n + 1) + a.q.length) % bank.length
      const hashB = (b.q.charCodeAt(0) * (n + 1) + b.q.length) % bank.length
      return hashA - hashB
    })
    // But actually use random for variety — just track which set number
    const randomized = [...bank].sort(() => Math.random() - 0.5).slice(0, 20)
    setSetNum(n)
    setExSt({ qs: randomized, cur: 0, score: 0, sel: null, done: false, start: Date.now() })
    setShowSetPicker(false)
    trackEvent(user?.rollNumber, 'exercise_start', 'exercise', `Set ${n}`, user?.level)
  }

  function answerEx(i) {
    if (!exSt || exSt.sel !== null) return
    const ok = i === exSt.qs[exSt.cur].ans
    const ns = { ...exSt, sel: i, score: exSt.score + (ok ? 1 : 0) }
    setExSt(ns)
    setTimeout(() => {
      if (exSt.cur + 1 >= exSt.qs.length) {
        trackEvent(user?.rollNumber, 'exercise_complete', 'exercise', `Set ${setNum} Score ${ns.score}`, user?.level, ns.score)
        onAddScore && onAddScore(ns.score)
        const k = `gc_ex_${user?.level}`
        const prev = JSON.parse(localStorage.getItem(k) || '[]')
        prev.push(ns.score); if (prev.length > 100) prev.shift()
        localStorage.setItem(k, JSON.stringify(prev))
        setExSt({ ...ns, done: true })
      } else {
        setExSt({ ...ns, cur: ns.cur + 1, sel: null })
      }
    }, 800)
  }

  // Grammar filtered by level + search
  const query = gramQuery.trim().toLowerCase()
  const gramList = (GRAMMAR[gramLevel] || []).filter(g =>
    !query || g.title.toLowerCase().includes(query) || (g.sub || '').toLowerCase().includes(query)
  )

  function openGrammar(id) {
    const next = gramId === id ? null : id
    setGramId(next)
    if (next) trackEvent(user?.rollNumber, 'grammar_open', 'learn', id, gramLevel)
  }

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 3 }}>📚 Learn Hub</h2>
      <p style={{ fontSize: 11, color: C.textS, marginBottom: 12 }}>Exercises · Grammar · Media</p>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 14, background: '#fff', borderRadius: 10, padding: 3, border: `1px solid ${C.border}` }}>
        {[['exercises', '💪 Exercises'], ['grammar', '📐 Grammar'], ['media', '🎬 Media']].map(([id, lbl]) => (
          <button key={id} onClick={() => setSub(id)}
            style={{ flex: 1, padding: '7px', borderRadius: 7, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 11, fontFamily: 'inherit', background: sub === id ? C.navy : 'transparent', color: sub === id ? '#fff' : C.textS, transition: 'all .15s' }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* ── EXERCISES ── */}
      {sub === 'exercises' && (
        !exSt ? (
          <div>
            {/* Stats bar */}
            {scores.length > 0 && (
              <div style={{ display: 'flex', gap: 12, background: '#fff', borderRadius: 11, border: `1px solid ${C.border}`, padding: '12px 16px', marginBottom: 14, justifyContent: 'center' }}>
                {[['Last', `${lastScore}/20`], ['Best', `${bestScore}/20`], ['Sessions', scores.length]].map(([l, v]) => (
                  <div key={l} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: C.navy }}>{v}</div>
                    <div style={{ fontSize: 10, color: C.textS }}>{l}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Intro */}
            <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyM})`, borderRadius: 14, padding: '18px 20px', marginBottom: 14, textAlign: 'center' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>💪</div>
              <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 4 }}>40 Exercise Sets</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.6 }}>
                Each set has 20 questions · Level <strong style={{ color: C.blueM }}>{user?.level}</strong><br />
                Complete all 40 sets for full mastery!
              </div>
            </div>

            {/* 40 set buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 8 }}>
              {Array.from({ length: 40 }, (_, i) => i + 1).map(n => {
                const sessionScores = JSON.parse(localStorage.getItem(`gc_ex_set_${user?.level}_${n}`) || 'null')
                return (
                  <div key={n} onClick={() => startSet(n)}
                    style={{ background: sessionScores !== null ? C.greenL : '#fff', border: `2px solid ${sessionScores !== null ? C.green : C.border}`, borderRadius: 11, padding: '12px 8px', textAlign: 'center', cursor: 'pointer', transition: 'all .15s' }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = C.shM}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: sessionScores !== null ? C.green : C.navy }}>
                      {sessionScores !== null ? '✅' : n}
                    </div>
                    <div style={{ fontSize: 9, color: C.textS, marginTop: 2 }}>Set {n}</div>
                    {sessionScores !== null && <div style={{ fontSize: 10, fontWeight: 600, color: C.green }}>{sessionScores}/20</div>}
                  </div>
                )
              })}
            </div>
            <p style={{ fontSize: 10, color: C.textS, textAlign: 'center' }}>Each session randomly picks 20 questions from the {user?.level} question bank</p>
          </div>
        ) : exSt.done ? (
          <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '24px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{exSt.score >= 16 ? '🏆' : exSt.score >= 12 ? '🎓' : exSt.score >= 8 ? '📚' : '💪'}</div>
            <div style={{ fontSize: 34, fontWeight: 700, color: C.navy, marginBottom: 3 }}>{exSt.score}/20</div>
            <div style={{ fontSize: 12, color: C.textM, marginBottom: 12 }}>{Math.round((exSt.score / 20) * 100)}% correct · Set {setNum}</div>
            <PBar pct={(exSt.score / 20) * 100} color={exSt.score >= 16 ? C.green : exSt.score >= 12 ? C.blue : C.amber} h={8} style={{ marginBottom: 14 }} />
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Btn label="← All Sets" onClick={() => setExSt(null)} variant="outline" />
              <Btn label="Try Again 🔄" onClick={() => startSet(setNum)} variant="primary" />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
              <Btn label="← Sets" onClick={() => setExSt(null)} variant="ghost" size="sm" />
              <span style={{ fontSize: 10, color: C.textS }}>Set {setNum} · Q{exSt.cur + 1}/20 · Score: {exSt.score}</span>
            </div>
            <PBar pct={(exSt.cur / 20) * 100} h={4} style={{ marginBottom: 10 }} />
            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '13px 15px', marginBottom: 9 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.5 }}>{exSt.qs[exSt.cur].q}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {exSt.qs[exSt.cur].opts.map((opt, i) => {
                const isSel = exSt.sel === i, isOk = i === exSt.qs[exSt.cur].ans, show = exSt.sel !== null
                let bg = '#fff', border = C.border, color = C.text
                if (show) { if (isOk) { bg = C.greenL; border = C.green; color = C.green } else if (isSel) { bg = C.redL; border = C.red; color = C.red } }
                return (
                  <div key={i} onClick={() => answerEx(i)}
                    style={{ background: bg, border: `2px solid ${border}`, borderRadius: 9, padding: '10px 13px', cursor: show ? 'default' : 'pointer', fontSize: 12, color, fontWeight: (isSel || (show && isOk)) ? 600 : 400, display: 'flex', alignItems: 'center', gap: 8, transition: 'all .12s' }}>
                    <span style={{ width: 19, height: 19, borderRadius: '50%', background: show && isOk ? C.green : show && isSel ? C.red : C.border, color: show ? '#fff' : C.textS, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, flexShrink: 0 }}>
                      {show ? (isOk ? '✓' : isSel ? '✗' : String.fromCharCode(65 + i)) : String.fromCharCode(65 + i)}
                    </span>{opt}
                  </div>
                )
              })}
            </div>
          </div>
        )
      )}

      {/* ── GRAMMAR ── */}
      {sub === 'grammar' && (
        <div>
          {/* Level selector — mirrors the whole curriculum, A1 → B2 */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
            {GRAMMAR_LEVELS.map(lv => {
              const active = gramLevel === lv
              const isMine = user?.level === lv
              return (
                <button key={lv} onClick={() => { setGramLevel(lv); setGramId(null) }}
                  style={{ flex: 1, padding: '8px 4px', borderRadius: 9, border: `2px solid ${active ? C.blue : C.border}`, background: active ? C.blue : '#fff', color: active ? '#fff' : C.textM, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 700, fontSize: 12, position: 'relative', transition: 'all .15s' }}>
                  {lv}
                  {isMine && (
                    <span style={{ position: 'absolute', top: -7, right: -4, background: C.green, color: '#fff', fontSize: 7, fontWeight: 700, padding: '1px 4px', borderRadius: 6 }}>YOU</span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Search */}
          <input value={gramQuery} onChange={e => setGramQuery(e.target.value)}
            placeholder="🔍 Search grammar topics…"
            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: 9, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: 'inherit', color: C.text, marginBottom: 10, outline: 'none' }} />

          {/* Level intro strip */}
          <div style={{ background: C.blueL, border: `1px solid ${C.blue}33`, borderRadius: 10, padding: '9px 13px', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.blue, fontWeight: 700 }}>📐 {gramLevel} Grammar · {(GRAMMAR[gramLevel] || []).length} topics</div>
            <div style={{ fontSize: 10, color: C.textM, marginTop: 2 }}>Follows the {gramLevel} curriculum, with nursing examples, tables and common mistakes.</div>
          </div>

          {gramList.length === 0 && (
            <div style={{ textAlign: 'center', color: C.textS, fontSize: 12, padding: '24px 0' }}>No topics match “{gramQuery}”.</div>
          )}

          {gramList.map(g => {
            const open = gramId === g.id
            return (
              <div key={g.id} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${open ? C.blue : C.border}`, marginBottom: 8, overflow: 'hidden', transition: 'border-color .15s' }}>
                <div onClick={() => openGrammar(g.id)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{g.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: C.navy, fontSize: 12.5, lineHeight: 1.3 }}>{g.title}</div>
                      {g.sub && <div style={{ fontSize: 10, color: C.textS, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.sub}</div>}
                    </div>
                  </div>
                  <span style={{ color: C.blue, fontSize: 12, flexShrink: 0, marginLeft: 8 }}>{open ? '▲' : '▼'}</span>
                </div>

                {open && (
                  <div style={{ padding: '4px 14px 14px', borderTop: `1px solid ${C.border}` }}>
                    <div style={{ height: 10 }} />
                    {g.blocks.map((b, i) => <GrammarBlock key={i} b={b} />)}

                    {g.tip && (
                      <div style={{ background: C.greenL, borderLeft: `3px solid ${C.green}`, borderRadius: 8, padding: '8px 11px', marginTop: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.green }}>💡 Tip · </span>
                        <span style={{ fontSize: 11.5, color: C.textM, lineHeight: 1.5 }}>{g.tip}</span>
                      </div>
                    )}
                    {g.mistake && (
                      <div style={{ background: C.amberL, borderLeft: `3px solid ${C.amber}`, borderRadius: 8, padding: '8px 11px', marginTop: 7 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: C.amber }}>⚠️ Common mistake · </span>
                        <span style={{ fontSize: 11.5, color: C.textM, lineHeight: 1.5 }}>{g.mistake}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── MEDIA ── */}
      {sub === 'media' && <MediaPage embedded user={user}/>}
    </div>
  )
}
