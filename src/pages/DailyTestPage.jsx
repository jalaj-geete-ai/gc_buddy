import { useState, useEffect, useRef } from 'react'
import { C } from '../lib/constants'
import { PBar, Btn, Spin } from '../components/UI'
import { sb, trackEvent } from '../lib/supabase'

// ── TEST DATA (from PDF) ────────────────────────────────────────────────────
const TESTS = [
  {
    id: 'A1_T1',
    name: 'Test 1: Phonetics & Basics Quick Quiz',
    classes: 'Class 1',
    level: 'A1',
    totalMarks: 20,
    timeMinutes: 15,
    passMark: 60,
    sections: [
      {
        title: 'Section A: Multiple Choice — Pronunciation Rules',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T1A1', text: "German letter 'W' is pronounced like:", opts: ["English 'W' (water)", "English 'V' (very)", "English 'B'", "English 'F'"], ans: 1, marks: 1 },
          { id: 'T1A2', text: "German letter 'J' is pronounced like:", opts: ["English 'J' (jungle)", "English 'Y' (yes)", "English 'G' (good)", "English 'Ch'"], ans: 1, marks: 1 },
          { id: 'T1A3', text: "German letter 'Z' is pronounced like:", opts: ["English 'Z' (zoo)", "English 'S' (sun)", "English 'Ts' (cats)", "English 'Dz'"], ans: 2, marks: 1 },
          { id: 'T1A4', text: "The diphthong 'ei' sounds like:", opts: ["English 'ee' (see)", "English 'eye/I' (mine)", "English 'oy' (boy)", "English 'ay' (say)"], ans: 1, marks: 1 },
          { id: 'T1A5', text: "The diphthong 'ie' sounds like:", opts: ["English 'I' (mine)", "Long English 'ee' (see)", "English 'oy' (boy)", "English 'uh'"], ans: 1, marks: 1 },
          { id: 'T1A6', text: "German 'sch' sounds like:", opts: ["English 'sk' (sky)", "English 'sh' (shoe)", "English 'sc' (scare)", "English 'ch' (church)"], ans: 1, marks: 1 },
          { id: 'T1A7', text: "Umlaut 'ü' is pronounced:", opts: ["Like English 'u' (cup)", "Lips round (U) but say 'I'", "Like English 'oo' (moon)", "Like English 'y'"], ans: 1, marks: 1 },
          { id: 'T1A8', text: "The letter 'V' in German sounds like:", opts: ["English 'V' (very)", "English 'F' (father)", "English 'B' (before)", "English 'W' (water)"], ans: 1, marks: 1 },
          { id: 'T1A9', text: "'st' at the START of a German word sounds like:", opts: ["'st' (standard)", "'sht' (shhtar)", "'ts' (cats)", "'s' (see)"], ans: 1, marks: 1 },
          { id: 'T1A10', text: "The Eszett 'ß' is the same as:", opts: ["'s'", "'sz'", "'ss'", "'z'"], ans: 2, marks: 1 },
        ]
      },
      {
        title: 'Section B: Write the German Letter Names',
        marks: 10,
        type: 'fill',
        instructions: 'Write the correct German name for each letter.',
        questions: [
          { id: 'T1B1', text: "German name for letter 'A':", ans: 'ah', marks: 1 },
          { id: 'T1B2', text: "German name for letter 'W':", ans: 'vay', marks: 1 },
          { id: 'T1B3', text: "German name for letter 'J':", ans: 'yot', marks: 1 },
          { id: 'T1B4', text: "German name for letter 'Z':", ans: 'tset', marks: 1 },
          { id: 'T1B5', text: "German name for letter 'Ä':", ans: 'ay-umlaut', altAns: ['ä','ae','äh'], marks: 1 },
          { id: 'T1B6', text: "German name for letter 'B':", ans: 'bay', marks: 1 },
          { id: 'T1B7', text: "German name for letter 'V':", ans: 'fow', altAns: ['fau','fav'], marks: 1 },
          { id: 'T1B8', text: "German name for letter 'R':", ans: 'err', altAns: ['er'], marks: 1 },
          { id: 'T1B9', text: "German name for letter 'Ö':", ans: 'oh-umlaut', altAns: ['ö','oe','öh'], marks: 1 },
          { id: 'T1B10', text: "German name for letter 'Ü':", ans: 'oo-umlaut', altAns: ['ü','ue','üh'], marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_T2',
    name: 'Test 2: Greetings, Introduction & Verb Sein',
    classes: 'Classes 2–3',
    level: 'A1',
    totalMarks: 30,
    timeMinutes: 25,
    passMark: 60,
    sections: [
      {
        title: 'Part 1: Greetings',
        marks: 10,
        type: 'fill',
        instructions: 'Write the correct German greeting for each situation.',
        questions: [
          { id: 'T2P1Q1', text: "It is 8:00 AM. Greet your patient formally:", ans: 'guten morgen', altAns: ['guten morgen!'], marks: 2 },
          { id: 'T2P1Q2', text: "Say goodbye formally to the head doctor:", ans: 'auf wiedersehen', altAns: ['auf wiedersehen!'], marks: 2 },
          { id: 'T2P1Q3', text: "Welcome a new patient warmly:", ans: 'herzlich willkommen', altAns: ['guten tag','herzlich willkommen!','guten tag!'], marks: 2 },
          { id: 'T2P1Q4', text: "Greet your Indian friend casually:", ans: 'hallo', altAns: ['hallo!','hi','hi!'], marks: 2 },
          { id: 'T2P1Q5', text: "Ask your senior colleague (formal) how they are:", ans: 'wie geht es ihnen', altAns: ['wie geht es ihnen?','wie geht es ihnen?'], marks: 2 },
        ]
      },
      {
        title: 'Part 2: Self-Introduction',
        marks: 10,
        type: 'fill_blank',
        instructions: 'Fill in the blanks with the correct German word.',
        questions: [
          { id: 'T2P2Q1', text: "Guten _________ ! (morning at 9AM)", ans: 'morgen', marks: 2 },
          { id: 'T2P2Q2', text: "Ich _________ Priya Sharma. (my name is)", ans: 'heiße', altAns: ['heisse','heiße'], marks: 2 },
          { id: 'T2P2Q3', text: "Ich _________ aus Indien. (come from)", ans: 'komme', marks: 2 },
          { id: 'T2P2Q4', text: "Ich _________ Krankenschwester. (I am)", ans: 'bin', marks: 2 },
          { id: 'T2P2Q5', text: "Auf _________! (formal goodbye)", ans: 'wiedersehen', marks: 2 },
        ]
      },
      {
        title: 'Part 3: Verb "sein" — Fill in',
        marks: 10,
        type: 'fill_blank',
        instructions: 'Fill in the correct form of the verb "sein".',
        questions: [
          { id: 'T2P3Q1', text: "Ich _______ Krankenschwester.", ans: 'bin', marks: 1 },
          { id: 'T2P3Q2', text: "Du _______ krank.", ans: 'bist', marks: 1 },
          { id: 'T2P3Q3', text: "Er _______ Arzt. Sie _______ Ärztin. (write both, separated by /)", ans: 'ist/ist', altAns: ['ist / ist','ist, ist'], marks: 1 },
          { id: 'T2P3Q4', text: "Wir _______ Kollegen.", ans: 'sind', marks: 1 },
          { id: 'T2P3Q5', text: "Ihr _______ müde.", ans: 'seid', marks: 1 },
          { id: 'T2P3Q6', text: "Sie (they) _______ Patienten.", ans: 'sind', marks: 1 },
          { id: 'T2P3Q7', text: "Sie (formal) _______ sehr nett.", ans: 'sind', marks: 1 },
          { id: 'T2P3Q8', text: "Ich _______ nicht müde. (negation — write full phrase)", ans: 'bin nicht', altAns: ['bin...nicht','bin'], marks: 1 },
          { id: 'T2P3Q9', text: "_______ Sie Arzt? (question, formal — write the verb)", ans: 'sind', marks: 1 },
          { id: 'T2P3Q10', text: "_______ du krank? (question, informal — write the verb)", ans: 'bist', marks: 1 },
        ]
      }
    ]
  },
  {
    id: 'A1_T3',
    name: 'Test 3: End-of-Block Test (Classes 1–5)',
    classes: 'Classes 1–5',
    level: 'A1',
    totalMarks: 50,
    timeMinutes: 40,
    passMark: 60,
    sections: [
      {
        title: 'Section A: Phonetics',
        marks: 8,
        type: 'mcq',
        questions: [
          { id: 'T3A1', text: "German 'V' sounds like:", opts: ["English 'V' (very)", "English 'F' (father)", "English 'W' (water)", "English 'B'"], ans: 1, marks: 1 },
          { id: 'T3A2', text: "German diphthong 'au' sounds like:", opts: ["oo", "ay", "ow (cow)", "oy"], ans: 2, marks: 1 },
          { id: 'T3A3', text: "'sch' in German sounds like:", opts: ["sk", "sh", "ch", "ts"], ans: 1, marks: 1 },
          { id: 'T3A4', text: "ß (Eszett) is the same as:", opts: ["sz", "z", "ss", "s"], ans: 2, marks: 1 },
          { id: 'T3A5', text: "The special letter 'ö' is pronounced:", opts: ["Like 'o' in 'more'", "Lips round like O, say E", "Like 'oh' in English", "Like 'oo' in English"], ans: 1, marks: 1 },
          { id: 'T3A6', text: "German name for letter 'W':", ans: 'vay', altAns: ['vay','fow'], type: 'fill', marks: 1 },
          { id: 'T3A7', text: "German name for letter 'J':", ans: 'yot', type: 'fill', marks: 1 },
          { id: 'T3A8', text: "Which letters are called Umlauts? (write all 3)", ans: 'ä, ö, ü', altAns: ['ä ö ü','ä,ö,ü','a o u umlaut','ä/ö/ü'], type: 'fill', marks: 1 },
        ]
      },
      {
        title: 'Section B: Greetings & Introduction',
        marks: 10,
        type: 'fill',
        instructions: 'Write the correct German phrase.',
        questions: [
          { id: 'T3B1', text: "Say 'Good morning!' formally:", ans: 'guten morgen', altAns: ['guten morgen!'], marks: 1 },
          { id: 'T3B2', text: "Say 'My name is [your name].':", ans: 'ich heiße', altAns: ['mein name ist','ich heisse'], marks: 1 },
          { id: 'T3B3', text: "Say 'I come from India.':", ans: 'ich komme aus indien', altAns: ['ich komme aus indien.'], marks: 1 },
          { id: 'T3B4', text: "Say 'I am a nurse.':", ans: 'ich bin krankenschwester', altAns: ['ich bin krankenpfleger','ich bin eine krankenschwester'], marks: 1 },
          { id: 'T3B5', text: "Say 'Goodbye!' formally:", ans: 'auf wiedersehen', altAns: ['auf wiedersehen!'], marks: 1 },
          { id: 'T3B6', text: "Ask formally: 'How are you?':", ans: 'wie geht es ihnen', altAns: ['wie geht es ihnen?'], marks: 1 },
          { id: 'T3B7', text: "Answer: 'Very well, thank you.':", ans: 'sehr gut danke', altAns: ['sehr gut, danke','sehr gut, danke!'], marks: 1 },
          { id: 'T3B8', text: "Say 'Nice to meet you!':", ans: 'schön sie kennenzulernen', altAns: ['schön, sie kennenzulernen!','es freut mich'], marks: 1 },
          { id: 'T3B9', text: "Ask formally: 'What is your name?':", ans: 'wie heißen sie', altAns: ['wie heißen sie?','wie heissen sie?'], marks: 1 },
          { id: 'T3B10', text: "Ask formally: 'Where are you from?':", ans: 'woher kommen sie', altAns: ['woher kommen sie?'], marks: 1 },
        ]
      },
      {
        title: 'Section C: Verb Sein',
        marks: 10,
        type: 'fill_blank',
        instructions: 'Fill in the correct form of sein.',
        questions: [
          { id: 'T3C1', text: "Ich _______ Ärztin.", ans: 'bin', marks: 1 },
          { id: 'T3C2', text: "Du _______ nett.", ans: 'bist', marks: 1 },
          { id: 'T3C3', text: "Er _______ müde.", ans: 'ist', marks: 1 },
          { id: 'T3C4', text: "Wir _______ fertig.", ans: 'sind', marks: 1 },
          { id: 'T3C5', text: "Ihr _______ krank?", ans: 'seid', marks: 1 },
          { id: 'T3C6', text: "Sie (they) _______ Patienten.", ans: 'sind', marks: 1 },
          { id: 'T3C7', text: "Sie (formal) _______ der neue Arzt.", ans: 'sind', marks: 1 },
          { id: 'T3C8', text: "Das _______ nicht richtig.", ans: 'ist', marks: 1 },
          { id: 'T3C9', text: "_______ Sie Krankenschwester? (question)", ans: 'sind', marks: 1 },
          { id: 'T3C10', text: "Wir _______ nicht fertig.", ans: 'sind', marks: 1 },
        ]
      },
      {
        title: 'Section D: Numbers',
        marks: 12,
        type: 'mixed',
        instructions: 'Write numbers in German words or write the digits.',
        questions: [
          { id: 'T3D1', text: "Write in German: 7", ans: 'sieben', type: 'fill', marks: 1 },
          { id: 'T3D2', text: "Write in German: 12", ans: 'zwölf', altAns: ['zwoelf','zwölf'], type: 'fill', marks: 1 },
          { id: 'T3D3', text: "Write in German: 15", ans: 'fünfzehn', altAns: ['fuenfzehn'], type: 'fill', marks: 1 },
          { id: 'T3D4', text: "Write in German: 21", ans: 'einundzwanzig', type: 'fill', marks: 1 },
          { id: 'T3D5', text: "Write in German: 38", ans: 'achtunddreißig', altAns: ['achtunddreissig'], type: 'fill', marks: 1 },
          { id: 'T3D6', text: "Write in German: 50", ans: 'fünfzig', altAns: ['fuenfzig'], type: 'fill', marks: 1 },
          { id: 'T3D7', text: "Write in German: 67", ans: 'siebenundsechzig', type: 'fill', marks: 1 },
          { id: 'T3D8', text: "Write in German: 100", ans: 'hundert', altAns: ['einhundert'], type: 'fill', marks: 1 },
          { id: 'T3D9', text: "Write in digits: dreiundzwanzig =", ans: '23', type: 'fill', marks: 1 },
          { id: 'T3D10', text: "Write in digits: siebenundneunzig =", ans: '97', type: 'fill', marks: 1 },
          { id: 'T3D11', text: "Write in digits: fünfundvierzig =", ans: '45', type: 'fill', marks: 1 },
          { id: 'T3D12', text: "Hospital sentence: Der Patient ist _____ Jahre alt. (Patient is 45 years old)", ans: 'fünfundvierzig', altAns: ['fuenfundvierzig','45'], type: 'fill', marks: 1 },
        ]
      },
      {
        title: 'Section E: Nouns & Genders',
        marks: 10,
        type: 'mcq',
        questions: [
          { id: 'T3E1', text: "Article for 'Arzt' (doctor)?", opts: ["der","die","das"], ans: 0, marks: 1 },
          { id: 'T3E2', text: "Article for 'Tablette' (tablet)?", opts: ["der","die","das"], ans: 1, marks: 1 },
          { id: 'T3E3', text: "Article for 'Krankenhaus' (hospital)?", opts: ["der","die","das"], ans: 2, marks: 1 },
          { id: 'T3E4', text: "Article for 'Patient' (patient)?", opts: ["der","die","das"], ans: 0, marks: 1 },
          { id: 'T3E5', text: "Article for 'Fieber' (fever)?", opts: ["der","die","das"], ans: 2, marks: 1 },
          { id: 'T3E6', text: "Article for 'Bett' (bed)?", opts: ["der","die","das"], ans: 2, marks: 1 },
          { id: 'T3E7', text: "Article for 'Nase' (nose)?", opts: ["der","die","das"], ans: 1, marks: 1 },
          { id: 'T3E8', text: "Article for 'Kind' (child)?", opts: ["der","die","das"], ans: 2, marks: 1 },
          { id: 'T3E9', text: "'Das ist _______ Krankenhaus.' — Fill in ein or eine:", opts: ["ein","eine"], ans: 0, marks: 1 },
          { id: 'T3E10', text: "'Ich bin _______ Krankenschwester.' — Fill in ein or eine:", opts: ["ein","eine"], ans: 1, marks: 1 },
        ]
      }
    ]
  }
]

function checkAnswer(q, userAns) {
  const clean = (s) => s.toString().toLowerCase().trim()
    .replace(/[!?.,-]/g, '').replace(/\s+/g, ' ')
  const ua = clean(userAns)
  const ca = clean(q.ans)
  if (ua === ca) return true
  if (q.altAns) return q.altAns.some(a => clean(a) === ua)
  return false
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function DailyTestPage({ user, onTestComplete }) {
  const [phase, setPhase] = useState('list')      // list | intro | test | result
  const [selTest, setSelTest] = useState(null)
  const [sectionIdx, setSectionIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [allAnswers, setAllAnswers] = useState({}) // {q_id: userAnswer}
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [fillVal, setFillVal] = useState('')
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [myHistory, setMyHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const startTimeRef = useRef(null)
  const inputRef = useRef(null)

  // Load history
  useEffect(() => {
    if (user?.rollNumber) loadHistory()
  }, [user])

  async function loadHistory() {
    const { data } = await sb.from('daily_test_submissions')
      .select('*').eq('roll_number', user.rollNumber)
      .order('submitted_at', { ascending: false })
    if (data) setMyHistory(data)
  }

  // Flatten all questions for the current test
  const allQs = selTest ? selTest.sections.flatMap(s =>
    s.questions.map(q => ({ ...q, sectionTitle: s.title, sectionType: s.type }))
  ) : []
  const totalQs = allQs.length
  const curQ = allQs[qIdx]

  function startTest(test) {
    setSelTest(test)
    setSectionIdx(0); setQIdx(0)
    setAllAnswers({}); setSelectedOpt(null); setFillVal('')
    setResult(null)
    startTimeRef.current = Date.now()
    setPhase('test')
    trackEvent(user?.rollNumber, 'daily_test_start', 'daily_test', test.id, test.level)
  }

  function handleSelect(optIdx) {
    setSelectedOpt(optIdx)
  }

  function goNext() {
    // Save answer — must match the same isMCQ logic used for rendering
    const qType = curQ.type || curQ.sectionType || 'fill'
    const curIsMCQ = qType === 'mcq' && Array.isArray(curQ.opts) && curQ.opts.length > 0
    const ans = curIsMCQ
      ? (selectedOpt !== null ? curQ.opts[selectedOpt] : '')
      : fillVal

    setAllAnswers(prev => ({ ...prev, [curQ.id]: ans }))

    if (qIdx + 1 < totalQs) {
      setQIdx(q => q + 1)
      setSelectedOpt(null); setFillVal('')
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      // All done — evaluate
      const finalAnswers = { ...allAnswers, [curQ.id]: ans }
      evaluateAndSubmit(finalAnswers)
    }
  }

  async function evaluateAndSubmit(answersMap) {
    setSubmitting(true)
    const timeSec = Math.round((Date.now() - startTimeRef.current) / 1000)
    let score = 0
    const details = []
    let saveError = null

    try {
      allQs.forEach(q => {
        const userAns = answersMap[q.id] || ''
        // Determine if this is MCQ or fill — per-question type takes priority over section type
        const qType = q.type || q.sectionType || 'fill'
        const isMCQq = qType === 'mcq' && Array.isArray(q.opts) && q.opts.length > 0 && typeof q.ans === 'number'
        let isCorrect = false
        let correctAnsDisplay = ''

        if (isMCQq) {
          // MCQ: compare selected option text (case-insensitive)
          isCorrect = userAns.toLowerCase().trim() === (q.opts[q.ans] || '').toLowerCase().trim()
          correctAnsDisplay = q.opts[q.ans]
        } else {
          // Fill: use checkAnswer (already case-insensitive)
          isCorrect = checkAnswer(q, userAns)
          correctAnsDisplay = q.ans
        }

        const earned = isCorrect ? q.marks : 0
        score += earned
        details.push({
          q_id: q.id,
          q_text: q.text,
          answer: userAns,
          correct: isCorrect,
          marks_earned: earned,
          marks_total: q.marks,
          correct_ans: correctAnsDisplay
        })
      })
    } catch (e) {
      console.error('Scoring exception:', e)
      saveError = 'Scoring error: ' + (e.message || 'unknown')
    }

    const pct = selTest.totalMarks ? Math.round((score / selTest.totalMarks) * 100) : 0
    const passed = pct >= selTest.passMark

    try {
      const { error } = await sb.from('daily_test_submissions').insert({
        roll_number: user.rollNumber,
        test_id: selTest.id,
        test_name: selTest.name,
        level: selTest.level,
        score,
        total_marks: selTest.totalMarks,
        percentage: pct,
        answers: details,
        time_taken_sec: timeSec,
      })
      if (error) { console.error('Submit error:', error.message); saveError = error.message }
    } catch (e) { console.error('Submit exception:', e); saveError = e.message || 'Network error' }

    trackEvent(user?.rollNumber, 'daily_test_complete', 'daily_test', selTest.id, selTest.level, score)
    setResult({ score, pct, passed, details, timeSec, test: selTest, saveError })
    setSubmitting(false)
    setPhase('result')
    loadHistory()
    // Trigger level-up check in parent — only if save succeeded
    if (!saveError && onTestComplete) onTestComplete()
  }

  // ── LIST VIEW ──
  if (phase === 'list') {
    const attempted = (tid) => myHistory.filter(h => h.test_id === tid)
    const bestScore = (tid) => {
      const h = attempted(tid)
      return h.length ? Math.max(...h.map(s => s.score)) : null
    }

    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 3 }}>📝 Daily Tests</h2>
        <p style={{ fontSize: 11, color: C.textS, marginBottom: 12 }}>A1 Level · Classes 1–5 · Submit answers for AI grading</p>

        {/* My history toggle */}
        {myHistory.length > 0 && (
          <div style={{ background: C.blueL, borderRadius: 10, padding: '10px 13px', marginBottom: 12, cursor: 'pointer', border: `1px solid ${C.blue}33` }}
            onClick={() => setShowHistory(h => !h)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 600, color: C.blue, fontSize: 12 }}>📊 My Test History ({myHistory.length} attempts)</span>
              <span style={{ color: C.blue, fontSize: 11 }}>{showHistory ? '▲' : '▼'}</span>
            </div>
            {showHistory && (
              <div style={{ marginTop: 10 }}>
                {myHistory.slice(0, 10).map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: i < myHistory.length - 1 ? `1px solid ${C.border}` : 'none', fontSize: 11 }}>
                    <span style={{ color: C.navy, fontWeight: 600 }}>{h.test_name?.split(':')[0]}</span>
                    <span style={{ color: h.percentage >= 60 ? C.green : C.red, fontWeight: 700 }}>{h.score}/{h.total_marks} ({h.percentage}%)</span>
                    <span style={{ color: C.textS }}>{new Date(h.submitted_at).toLocaleDateString('en-IN')}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Test cards */}
        {TESTS.map(test => {
          const attempts = attempted(test.id)
          const best = bestScore(test.id)
          const bestPct = best !== null ? Math.round((best / test.totalMarks) * 100) : null
          const passed = bestPct !== null && bestPct >= test.passMark

          return (
            <div key={test.id} style={{ background: '#fff', borderRadius: 14, border: `2px solid ${passed ? C.green : C.border}`, padding: '15px', marginBottom: 10, boxShadow: C.sh }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 3 }}>{test.name}</div>
                  <div style={{ fontSize: 10, color: C.textS }}>{test.classes} · {test.totalMarks} marks · {test.timeMinutes} min</div>
                </div>
                {passed && <span style={{ fontSize: 18 }}>✅</span>}
              </div>

              {/* Sections preview */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
                {test.sections.map((s, i) => (
                  <span key={i} style={{ background: C.surfAlt, color: C.textS, fontSize: 9, padding: '2px 7px', borderRadius: 8, fontWeight: 500 }}>
                    {s.title.split(':')[0]} ({s.marks}m)
                  </span>
                ))}
              </div>

              {/* Stats */}
              {attempts.length > 0 && (
                <div style={{ display: 'flex', gap: 10, marginBottom: 10, background: passed ? C.greenL : C.amberL, borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: passed ? C.green : C.amber }}>{best}/{test.totalMarks}</div>
                    <div style={{ fontSize: 9, color: C.textS }}>Best Score</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: passed ? C.green : C.amber }}>{bestPct}%</div>
                    <div style={{ fontSize: 9, color: C.textS }}>Best %</div>
                  </div>
                  <div style={{ textAlign: 'center', flex: 1 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>{attempts.length}</div>
                    <div style={{ fontSize: 9, color: C.textS }}>Attempts</div>
                  </div>
                </div>
              )}

              <Btn label={attempts.length > 0 ? '🔄 Retake Test' : '▶ Start Test'}
                onClick={() => startTest(test)} variant={passed ? 'outline' : 'primary'} style={{ width: '100%' }} />
            </div>
          )
        })}

        <div style={{ background: C.amberL, border: `1px solid ${C.amber}33`, borderRadius: 10, padding: '10px 13px', marginTop: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, marginBottom: 4 }}>📌 Instructions</div>
          <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.7 }}>
            • Answer <strong>all questions</strong> before submitting<br />
            • For fill-in questions, write in <strong>German</strong><br />
            • Your score is saved to your profile automatically<br />
            • Pass mark is <strong>50%</strong> for all tests · You can retake anytime
          </div>
        </div>
      </div>
    )
  }

  // ── TEST VIEW ──
  if (phase === 'test') {
    const progress = ((qIdx) / totalQs) * 100
    const sType = curQ?.type || curQ?.sectionType || 'fill'
    const isMCQ = sType === 'mcq' && Array.isArray(curQ?.opts) && curQ.opts.length > 0
    const isFill = !isMCQ

    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <button onClick={() => { if (window.confirm('Quit test? Your progress will be lost.')) setPhase('list') }}
            style={{ background: 'none', border: 'none', color: C.textS, fontSize: 11, cursor: 'pointer' }}>✕ Quit</button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>{selTest?.name?.split(':')[0]}</div>
            <div style={{ fontSize: 10, color: C.textS }}>Q{qIdx + 1} of {totalQs}</div>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.blue }}>{Math.round(progress)}%</div>
        </div>

        <PBar pct={progress} h={5} style={{ marginBottom: 12 }} />

        {/* Section label */}
        <div style={{ background: C.blueL, borderRadius: 8, padding: '5px 10px', marginBottom: 10, fontSize: 10, color: C.blue, fontWeight: 600 }}>
          {curQ?.sectionTitle}
        </div>

        {/* Question card */}
        <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px', marginBottom: 12, boxShadow: C.sh }}>
          <div style={{ fontSize: 10, color: C.textS, marginBottom: 6 }}>
            Question {qIdx + 1} · {curQ?.marks} mark{curQ?.marks > 1 ? 's' : ''}
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: C.text, lineHeight: 1.6, marginBottom: 14 }}>
            {curQ?.text}
          </div>

          {/* MCQ options */}
          {isMCQ && curQ.opts && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {curQ.opts.map((opt, i) => (
                <div key={i} onClick={() => handleSelect(i)}
                  style={{ padding: '11px 13px', borderRadius: 9, border: `2px solid ${selectedOpt === i ? C.blue : C.border}`, background: selectedOpt === i ? C.blueL : '#fff', cursor: 'pointer', fontSize: 12, color: selectedOpt === i ? C.blue : C.text, fontWeight: selectedOpt === i ? 600 : 400, display: 'flex', alignItems: 'center', gap: 9, transition: 'all .12s' }}>
                  <span style={{ width: 22, height: 22, borderRadius: '50%', background: selectedOpt === i ? C.blue : C.border, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </div>
              ))}
            </div>
          )}

          {/* Fill input */}
          {isFill && (
            <div>
              <input ref={inputRef} value={fillVal} onChange={e => setFillVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && fillVal.trim()) goNext() }}
                placeholder="Type your answer in German..."
                style={{ width: '100%', padding: '12px 14px', borderRadius: 9, border: `2px solid ${fillVal ? C.blue : C.border}`, fontSize: 13, fontFamily: 'inherit', color: C.text, outline: 'none', boxSizing: 'border-box', background: fillVal ? C.blueL : '#fff' }}
                autoFocus />
              <div style={{ fontSize: 10, color: C.textS, marginTop: 5 }}>Press Enter or tap Next to continue</div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setAllAnswers(prev => ({ ...prev, [curQ.id]: '' })); setSelectedOpt(null); setFillVal(''); goNext() }}
            style={{ padding: '11px 16px', borderRadius: 10, border: `1px solid ${C.border}`, background: 'transparent', color: C.textS, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}>
            Skip
          </button>
          <Btn
            label={qIdx + 1 === totalQs ? `Submit Test ✓` : `Next →`}
            onClick={goNext}
            disabled={isMCQ ? selectedOpt === null : !fillVal.trim()}
            variant="primary"
            style={{ flex: 1, padding: '12px' }}
          />
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3, marginTop: 12, justifyContent: 'center' }}>
          {allQs.map((q, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: i < qIdx ? C.green : i === qIdx ? C.blue : C.border }} />
          ))}
        </div>
      </div>
    )
  }

  // ── SUBMITTING ──
  if (submitting) return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Spin sz={34} />
      <div style={{ color: C.navy, fontSize: 13, fontWeight: 600 }}>Grading your answers...</div>
      <div style={{ color: C.textS, fontSize: 11 }}>Saving to your profile</div>
    </div>
  )

  // ── RESULT VIEW ──
  if (phase === 'result' && result) {
    const { score, pct, passed, details, timeSec, test, saveError } = result
    const correct = details.filter(d => d.correct).length
    const wrong = details.filter(d => !d.correct).length
    const mins = Math.floor(timeSec / 60), secs = timeSec % 60

    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
        {saveError && (
          <div style={{ background: C.redL, border: `1.5px solid ${C.red}`, borderRadius: 10, padding: '11px 14px', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 3 }}>⚠️ Score not saved to server</div>
            <div style={{ fontSize: 10, color: C.textM }}>Your result may not appear in Performance. Error: {saveError}. Please check your internet and try retaking the test.</div>
          </div>
        )}
        {/* Score hero */}
        <div style={{ background: `linear-gradient(135deg, ${passed ? '#0a5c2a' : C.navy}, ${passed ? '#0d7a38' : C.navyM})`, borderRadius: 16, padding: '24px 20px', marginBottom: 14, textAlign: 'center' }}>
          <div style={{ fontSize: 48 }}>{passed ? '🏆' : pct >= 40 ? '📚' : '💪'}</div>
          <div style={{ fontSize: 44, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{score}/{test.totalMarks}</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: passed ? '#5eff9b' : '#ffcf5a', marginBottom: 6 }}>{pct}%</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,.7)', fontWeight: 600 }}>
            {passed ? '✅ PASSED' : '❌ Not Passed'} · Pass mark: {test.passMark}%
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[
            ['✅ Correct', correct, C.green, C.greenL],
            ['❌ Wrong', wrong, C.red, C.redL],
            ['⏱ Time', `${mins}m ${secs}s`, C.blue, C.blueL],
          ].map(([lbl, val, color, bg]) => (
            <div key={lbl} style={{ flex: 1, background: bg, borderRadius: 11, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color }}>{val}</div>
              <div style={{ fontSize: 9, color: C.textS, marginTop: 2 }}>{lbl}</div>
            </div>
          ))}
        </div>

        {/* Section breakdown */}
        <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '13px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textS, letterSpacing: '.07em', marginBottom: 10 }}>SECTION BREAKDOWN</div>
          {test.sections.map((sec, si) => {
            const secQs = sec.questions.map(q => details.find(d => d.q_id === q.id)).filter(Boolean)
            const secScore = secQs.reduce((a, d) => a + (d.correct ? d.marks_total : 0), 0)
            const secPct = Math.round((secScore / sec.marks) * 100)
            return (
              <div key={si} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontSize: 11, color: C.text, fontWeight: 500 }}>{sec.title.split('—')[0].split(':').slice(0, 2).join(':')}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: secPct >= 50 ? C.green : C.red }}>{secScore}/{sec.marks}</span>
                </div>
                <PBar pct={secPct} h={5} color={secPct >= 50 ? C.green : C.red} />
              </div>
            )
          })}
        </div>

        {/* Q&A review */}
        <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '13px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textS, letterSpacing: '.07em', marginBottom: 10 }}>DETAILED REVIEW</div>
          {details.map((d, i) => (
            <div key={i} style={{ padding: '8px 0', borderBottom: i < details.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>{d.correct ? '✅' : '❌'}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: C.text, marginBottom: 3, lineHeight: 1.4 }}>Q{i + 1}: {d.q_text}</div>
                  <div style={{ fontSize: 10, color: d.correct ? C.green : C.red }}>
                    Your answer: <strong>{d.answer || '(blank)'}</strong>
                  </div>
                  {!d.correct && (
                    <div style={{ fontSize: 10, color: C.green, marginTop: 1 }}>
                      Correct: <strong>{d.correct_ans}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Btn label="← All Tests" onClick={() => setPhase('list')} variant="outline" style={{ flex: 1 }} />
          <Btn label="Retake 🔄" onClick={() => startTest(test)} variant="primary" style={{ flex: 1 }} />
        </div>
      </div>
    )
  }
}
