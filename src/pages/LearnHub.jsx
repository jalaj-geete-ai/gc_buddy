import { useState } from 'react'
import { C } from '../lib/constants'
import { EXERCISES, pickExercises } from '../lib/data'
import { PBar, Btn } from '../components/UI'
import { trackEvent } from '../lib/supabase'

// ── EXPANDED GRAMMAR ──────────────────────────────────────────────────────────
const GRAMMAR = [
  {
    level:'A1/A2',
    t:'Articles: der / die / das',
    c:`German has THREE genders — every noun has an article you must memorize!

MASCULINE (der):
→ der Arzt (doctor), der Patient (patient), der Arm (arm), der Bauch (stomach), der Rücken (back)
→ der Rollstuhl (wheelchair), der Blutdruck (blood pressure), der Puls (pulse)

FEMININE (die):
→ die Krankenschwester (nurse), die Klinik (clinic), die Wunde (wound), die Tablette (tablet)
→ die Pflege (care), die Behandlung (treatment), die Station (ward), die Diagnose (diagnosis)

NEUTER (das):
→ das Krankenhaus (hospital), das Medikament (medication), das Bett (bed), das Blut (blood)
→ das Fieber (fever), das Rezept (prescription), das Formular (form), das Zimmer (room)

💡 TIP: Always learn the article WITH the noun — never separate them!
Wrong: "Krankenhaus" ✗  →  Correct: "das Krankenhaus" ✓

PLURAL → always "die":
→ die Tabletten, die Patienten, die Ärzte, die Krankenschwestern`
  },
  {
    level:'A1/A2',
    t:'Present Tense (Präsens)',
    c:`REGULAR VERBS — Example: arbeiten (to work)

ich arbeite          → I work
du arbeitest         → you work (informal)
er/sie/es arbeitet   → he/she/it works
wir arbeiten         → we work
ihr arbeitet         → you (plural) work
sie/Sie arbeiten     → they/You (formal) work

⚠️ In nursing we ALWAYS use "Sie" (formal) with patients!

NURSING EXAMPLES:
→ Ich arbeite auf der Intensivstation. (I work in ICU)
→ Der Patient schläft gut. (The patient sleeps well)
→ Wie fühlen Sie sich? (How do you feel? — formal)
→ Ich messe Ihren Blutdruck. (I measure your blood pressure)
→ Der Arzt kommt gleich. (The doctor comes shortly)

IRREGULAR VERBS (must memorize!):
sein (to be):      ich bin / du bist / er ist / wir sind
haben (to have):   ich habe / du hast / er hat / wir haben
gehen (to go):     ich gehe / du gehst / er geht / wir gehen
nehmen (to take):  ich nehme / du nimmst / er nimmt / wir nehmen`
  },
  {
    level:'A2',
    t:'Cases: Nominativ, Akkusativ, Dativ',
    c:`German has 4 cases — articles CHANGE based on role in sentence!

NOMINATIV (subject — who is doing the action):
→ Der Patient liegt im Bett. (The patient lies in bed)
→ Die Schwester kommt. (The nurse comes)
→ Das Fieber steigt. (The fever rises)

AKKUSATIV (direct object — what/who receives the action):
→ Ich rufe den Arzt. (I call the doctor) [der → den]
→ Ich nehme die Tablette. (I take the tablet) [die → die — unchanged!]
→ Ich prüfe das Formular. (I check the form) [das → das — unchanged!]

DATIV (indirect object — to/for whom):
→ Ich gebe dem Patienten die Tablette. (I give the patient the tablet) [der → dem]
→ Ich helfe der Patientin. (I help the patient/female) [die → der]
→ Ich erkläre dem Kind die Lage. (I explain the situation to the child) [das → dem]

QUICK REFERENCE TABLE:
         | m (der) | f (die) | n (das)
Nominativ|  der    |  die    |  das
Akkusativ|  den    |  die    |  das
Dativ    |  dem    |  der    |  dem

NURSING EXAMPLE:
→ Ich gebe dem Patienten (Dat) die Medikamente (Akk).
   I give the patient his medications.`
  },
  {
    level:'A2/B1',
    t:'Modal Verbs (Modalverben)',
    c:`Modal verbs express ability, permission, obligation — essential in nursing!

MÜSSEN (must / have to):
→ Patient muss nüchtern bleiben. (Patient must stay fasting)
→ Sie müssen die Tabletten regelmäßig nehmen. (You must take tablets regularly)
→ Ich muss den Arzt informieren. (I must inform the doctor)

KÖNNEN (can / to be able to):
→ Können Sie einatmen? (Can you breathe in?)
→ Ich kann Ihnen helfen. (I can help you)
→ Der Patient kann nicht aufstehen. (The patient cannot stand up)

DÜRFEN (may / to be allowed to):
→ Sie dürfen aufstehen. (You may stand up)
→ Patienten dürfen nicht rauchen. (Patients are not allowed to smoke)
→ Darf ich Ihren Arm nehmen? (May I take your arm?)

SOLLEN (should / supposed to):
→ Medikament soll nach dem Essen genommen werden. (Medicine should be taken after eating)
→ Sie sollen morgen nüchtern kommen. (You should come fasting tomorrow)

WOLLEN (want to):
→ Der Patient will nach Hause. (The patient wants to go home)
→ Ich will den Arzt sprechen. (I want to speak to the doctor)

⚠️ WORD ORDER: Modal + infinitive at END of sentence!
→ Ich kann Ihnen die Spritze geben. ✓
→ Ich kann geben Ihnen die Spritze. ✗`
  },
  {
    level:'B1',
    t:'Perfekt (Past Tense)',
    c:`The Perfekt is the most common past tense in spoken German!

FORMATION: haben/sein + Partizip II (past participle)

MOST VERBS → use HABEN:
→ Ich habe die Tablette genommen. (I took the tablet)
→ Der Patient hat gut geschlafen. (The patient slept well)
→ Ich habe den Verband gewechselt. (I changed the bandage)
→ Die Ärztin hat die Diagnose gestellt. (The doctor made the diagnosis)

VERBS OF MOVEMENT/CHANGE → use SEIN:
→ Der Patient ist aufgestanden. (The patient got up) [aufstehen]
→ Ich bin ins Zimmer gegangen. (I went into the room) [gehen]
→ Das Fieber ist gesunken. (The fever went down) [sinken]
→ Der Zustand ist besser geworden. (The condition improved) [werden]

PARTIZIP II PATTERNS:
Regular:   ge + stem + t   → gearbeitet, gemacht, gefragt
Irregular: ge + stem + en  → genommen, gegeben, gefunden, geschrieben
sep. verb: stem + ge + part → aufgenommen, abgenommen, eingenommen

NURSING USAGE:
→ Ich habe die Vitalzeichen gemessen. (I measured the vital signs)
→ Patient hat Schmerzmittel erhalten. (Patient received painkillers)
→ Die Wundversorgung ist erfolgt. (Wound care has been carried out)
→ Blut wurde abgenommen. (Blood was drawn) — PASSIVE Perfekt!`
  },
  {
    level:'B1',
    t:'Subordinate Clauses (Nebensätze)',
    c:`In subordinate clauses, the VERB goes to the END — very important for B1!

WEIL (because):
→ Ich rufe den Arzt, weil der Patient Schmerzen hat.
  (I call the doctor because the patient has pain.)
→ Sie bleibt im Bett, weil sie Fieber hat.
  (She stays in bed because she has fever.)

OBWOHL (although):
→ Obwohl er Schmerzen hat, bleibt er ruhig.
  (Although he has pain, he stays calm.)
→ Sie isst nicht, obwohl sie Hunger hat.
  (She doesn't eat although she is hungry.)

WENN/FALLS (if / when):
→ Wenn Sie Schmerzen haben, klingeln Sie bitte.
  (If/When you have pain, please ring the bell.)
→ Falls die Übelkeit schlimmer wird, sagen Sie mir Bescheid.
  (If the nausea gets worse, let me know.)

DAMIT (so that):
→ Ich erkläre die Medikamente, damit Sie sie richtig nehmen.
  (I explain the medications so that you take them correctly.)

SOBALD (as soon as):
→ Sobald der Arzt da ist, informiere ich Sie.
  (As soon as the doctor is here, I will inform you.)

BEVOR (before) / NACHDEM (after):
→ Bevor Sie schlafen, nehmen Sie die Tablette.
  (Before you sleep, take the tablet.)
→ Nachdem die Visite ist, erkläre ich alles.
  (After the ward round, I will explain everything.)

⚠️ REMEMBER: Verb always at END of subordinate clause!`
  },
  {
    level:'B1/B2',
    t:'Passive Voice (Passiv)',
    c:`PASSIVE is essential for medical documentation and nursing reports!

PRESENT PASSIVE (Präsens Passiv):
Formation: werden + Partizip II

→ Das Medikament wird gegeben. (The medication is given)
→ Der Verband wird gewechselt. (The dressing is changed)
→ Die Wunde wird versorgt. (The wound is treated)
→ Der Patient wird untersucht. (The patient is examined)
→ Blut wird abgenommen. (Blood is drawn)
→ Maßnahmen werden eingeleitet. (Measures are initiated)

PAST PASSIVE (Perfekt Passiv):
Formation: sein + Partizip II + worden

→ Das Medikament ist gegeben worden. (The medication was given)
→ Der Patient ist aufgenommen worden. (The patient was admitted)
→ Die Operation ist durchgeführt worden. (The operation was performed)

WITH AGENT (von = by):
→ Das Medikament wird vom Arzt verschrieben. (prescribed by the doctor)
→ Der Verband wird von der Schwester gewechselt. (changed by the nurse)

NURSING DOCUMENTATION:
→ Vitaldaten wurden dokumentiert. ✓
→ Medikamente wurden verabreicht. ✓
→ Patient wurde informiert und aufgeklärt. ✓
→ Wundversorgung wurde täglich durchgeführt. ✓

💡 Use passive when the ACTION is more important than WHO does it.`
  },
  {
    level:'B2',
    t:'Konjunktiv II (Subjunctive)',
    c:`Konjunktiv II is used for polite requests, recommendations, hypotheticals — essential for professional B2 communication!

POLITE RECOMMENDATIONS (very common in nursing!):
→ Ich würde empfehlen, dass Sie ruhen. (I would recommend that you rest)
→ Es wäre besser, wenn Sie mehr trinken würden. (It would be better if you drank more)
→ Könnten Sie mir bitte die Hand geben? (Could you please give me your hand?)
→ Dürfte ich fragen, wie alt Sie sind? (May I ask how old you are?)
→ Würden Sie bitte ruhig bleiben? (Would you please stay calm?)

HYPOTHETICAL SITUATIONS:
→ Wenn der Patient früher gekommen wäre, hätte man besser helfen können.
  (If the patient had come earlier, we could have helped better.)
→ Wenn ich an Ihrer Stelle wäre, würde ich den Arzt fragen.
  (If I were in your position, I would ask the doctor.)

KEY FORMS (often irregular!):
sein   → wäre     (would be)
haben  → hätte    (would have)
können → könnte   (could)
müssen → müsste   (should/would have to)
dürfen → dürfte   (would be allowed to)
werden → würde    (would)
wollen → wollte   (would want)

PROFESSIONAL COMMUNICATION:
→ Ich würde vorschlagen... (I would suggest...)
→ Es wäre ratsam... (It would be advisable...)
→ Man könnte erwägen... (One could consider...)
→ Wäre es möglich... (Would it be possible...)

💡 In professional settings Konjunktiv II sounds more polite and respectful!`
  },
  {
    level:'B2',
    t:'Medical Documentation Language',
    c:`Special language patterns used in German medical records and nursing documentation:

OBJECTIVE STYLE (no "I" — use passive or impersonal forms):
→ Patient klagt über... (Patient complains of...)
→ Es wurde festgestellt, dass... (It was determined that...)
→ Die Untersuchung ergibt... (The examination shows...)
→ Befund: unauffällig / auffällig (Finding: normal / abnormal)

ABBREVIATIONS COMMON IN DOCS:
→ RR = Blutdruck (blood pressure — Riva-Rocci)
→ HF = Herzfrequenz (heart rate)
→ AF = Atemfrequenz (respiratory rate)
→ T° = Temperatur
→ SpO2 = Sauerstoffsättigung
→ BZ = Blutzucker (blood sugar)
→ i.v. = intravenös / s.c. = subkutan / p.o. = per os (oral)
→ n.N. = nach Notwendigkeit (as needed / PRN)

DESCRIBING SYMPTOMS:
→ Der Patient gibt an, ... (The patient states that...)
→ Schmerzen werden als ... beschrieben. (Pain is described as...)
→ stechend (stabbing), dumpf (dull), brennend (burning), drückend (pressing)
→ zeitweise (intermittent), dauerhaft (persistent), anfallsweise (in episodes)

HANDOVER (Übergabe) STRUCTURE — SBAR:
S = Situation: "Patient X, 65 Jahre, auf Station 3..."
B = Background: "Aufnahme wegen... Vorerkrankungen..."
A = Assessment: "Aktuell klagt über... Vitalzeichen..."
R = Recommendation: "Bitte beachten Sie... Maßnahmen..."

NURSING RECORD PHRASES:
→ Pflegemaßnahmen wurden durchgeführt. ✓
→ Patient war kooperativ / nicht kooperativ.
→ Zustand stabil / verschlechtert / verbessert.
→ Nächste Kontrolle: [time/date].`
  },
]

export default function LearnHub({ user, onAddScore }) {
  const [sub, setSub] = useState('exercises')

  // EXERCISES STATE
  const [setNum, setSetNum] = useState(null)   // which of 10 sets
  const [exSt, setExSt] = useState(null)
  const [showSetPicker, setShowSetPicker] = useState(false)

  // GRAMMAR STATE
  const [gramIdx, setGramIdx] = useState(null)

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

  return (
    <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 3 }}>📚 Learn Hub</h2>
      <p style={{ fontSize: 11, color: C.textS, marginBottom: 12 }}>Exercises · Grammar</p>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 3, marginBottom: 14, background: '#fff', borderRadius: 10, padding: 3, border: `1px solid ${C.border}` }}>
        {[['exercises', '💪 Exercises'], ['grammar', '📐 Grammar']].map(([id, lbl]) => (
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
              <div style={{ fontWeight: 800, fontSize: 15, color: '#fff', marginBottom: 4 }}>10 Exercise Sets</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,.65)', lineHeight: 1.6 }}>
                Each set has 20 questions · Level <strong style={{ color: C.blueM }}>{user?.level}</strong><br />
                Complete all 10 sets for full mastery!
              </div>
            </div>

            {/* 10 set buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 8, marginBottom: 8 }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => {
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
            <p style={{ fontSize: 10, color: C.textS, textAlign: 'center' }}>Each session randomly picks 20 questions from 200+ question bank</p>
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
          <div style={{ background: C.greenL, border: `1px solid ${C.green}33`, borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: C.green, fontWeight: 600 }}>📐 All levels covered: A1 · A2 · B1 · B2</div>
            <div style={{ fontSize: 10, color: C.textM, marginTop: 2 }}>With nursing examples, use cases and professional documentation language</div>
          </div>
          {GRAMMAR.map((g, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '12px 14px', marginBottom: 8, cursor: 'pointer' }}
              onClick={() => setGramIdx(gramIdx === i ? null : i)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ background: C.blueL, color: C.blue, fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 10, marginRight: 7 }}>{g.level}</span>
                  <span style={{ fontWeight: 600, color: C.navy, fontSize: 12 }}>{g.t}</span>
                </div>
                <span style={{ color: C.blue, fontSize: 12, flexShrink: 0, marginLeft: 8 }}>{gramIdx === i ? '▲' : '▼'}</span>
              </div>
              {gramIdx === i && (
                <div style={{ marginTop: 11, fontSize: 11, color: C.textM, lineHeight: 1.9, whiteSpace: 'pre-line', borderTop: `1px solid ${C.border}`, paddingTop: 11, fontFamily: 'monospace' }}>
                  {g.c}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
