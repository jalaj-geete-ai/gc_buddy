import { useState, useRef } from 'react'
import { C, CURRICULUM } from '../lib/constants'
import { PBar, Btn, Spin, Badge } from '../components/UI'
import { ai } from '../lib/gemini'
import { trackEvent } from '../lib/supabase'

// ── 50+ QUESTIONS PER CATEGORY ────────────────────────────────────────────────
const QB = {

  // HOSPITAL JOB INTERVIEW — Pflegehelfer / Pflegefachkraft
  hospital: [
    // Personal & Motivation
    "Warum möchten Sie in Deutschland als Pflegehelferin arbeiten?",
    "Erzählen Sie etwas über sich und Ihre Pflegeerfahrung in Indien.",
    "Was hat Sie zur Pflege geführt?",
    "Welche Pflegeausbildung haben Sie in Indien abgeschlossen?",
    "Wie lange arbeiten Sie schon in der Pflege?",
    "Warum haben Sie sich für unser Krankenhaus entschieden?",
    "Was wissen Sie über unsere Einrichtung?",
    "Wo sehen Sie sich in fünf Jahren beruflich?",
    "Was sind Ihre kurzfristigen und langfristigen Berufsziele in Deutschland?",
    "Was motiviert Sie täglich, in der Pflege zu arbeiten?",

    // Skills & Competencies
    "Was sind Ihre größten Stärken als Pflegekraft?",
    "Wo sehen Sie noch Verbesserungsbedarf bei sich?",
    "Welche pflegerischen Tätigkeiten beherrschen Sie besonders gut?",
    "Haben Sie Erfahrung mit der Grundpflege von bettlägerigen Patienten?",
    "Kennen Sie das ABEDL-Modell der Pflege?",
    "Welche Erfahrungen haben Sie in der Wundversorgung?",
    "Haben Sie Erfahrung mit dementen oder verwirrten Patienten?",
    "Wie führen Sie eine sorgfältige Pflegedokumentation durch?",
    "Haben Sie Erfahrung mit der Vitalzeichenmessung?",
    "Können Sie mit einem Pflegedokumentationssystem umgehen?",

    // Situational Questions
    "Erzählen Sie von einer schwierigen Pflegesituation und wie Sie sie gelöst haben.",
    "Was würden Sie tun, wenn ein Patient stürzt?",
    "Wie reagieren Sie, wenn ein Patient die Behandlung verweigert?",
    "Was tun Sie, wenn Sie einen Fehler bei der Medikamentengabe bemerken?",
    "Wie gehen Sie mit einem aggressiven Patienten um?",
    "Was machen Sie, wenn Sie unsicher sind über eine pflegerische Maßnahme?",
    "Wie handeln Sie bei einem Notfall auf der Station?",
    "Was tun Sie, wenn ein Patient starke Schmerzen hat?",
    "Wie gehen Sie mit dem Tod eines Patienten um?",
    "Wie reagieren Sie, wenn ein Angehöriger sich über die Pflege beschwert?",

    // Teamwork & Communication
    "Wie arbeiten Sie im interdisziplinären Team?",
    "Wie kommunizieren Sie mit Ärzten und Kollegen?",
    "Beschreiben Sie eine Situation, in der Sie gut im Team gearbeitet haben.",
    "Wie gehen Sie mit Konflikten im Team um?",
    "Wie führen Sie eine vollständige Übergabe durch?",
    "Wie stellen Sie sicher, dass wichtige Informationen weitergegeben werden?",
    "Wie gehen Sie damit um, wenn Sie eine andere Meinung als Ihr Vorgesetzter haben?",
    "Wie unterstützen Sie neue Kollegen bei der Einarbeitung?",
    "Wie kommunizieren Sie mit Patienten, die kein Deutsch sprechen?",
    "Wie gehen Sie mit kulturellen Unterschieden im Team um?",

    // Stress & Workload
    "Wie gehen Sie mit stressigen Situationen oder Zeitdruck um?",
    "Wie priorisieren Sie Ihre Aufgaben, wenn alles gleichzeitig dringend ist?",
    "Wie erholen Sie sich nach einem belastenden Arbeitstag?",
    "Haben Sie Erfahrung mit Schichtarbeit — Früh-, Spät- und Nachtdienst?",
    "Wie bewältigen Sie emotionalen Stress in der Pflege?",

    // German Healthcare System
    "Was wissen Sie über das deutsche Pflegesystem?",
    "Was ist der Unterschied zwischen einem Pflegehelfer und einer Pflegefachkraft?",
    "Was wissen Sie über die Pflegepflichten gemäß deutschem Recht?",
    "Was verstehen Sie unter Dekubitusprophylaxe?",
    "Was ist eine Pflegediagnose und wie verwenden Sie sie?",

    // Hygiene & Safety
    "Wie wichtig ist Ihnen Hygiene am Arbeitsplatz?",
    "Welche Hygieneregeln sind Ihnen aus der Pflege bekannt?",
    "Was tun Sie zum Schutz vor nosokomialen Infektionen?",
    "Wie gehen Sie mit MRSA-Patienten um?",
    "Was verstehen Sie unter Sturzprophylaxe?",

    // Patient Care & Ethics
    "Wie respektieren Sie die Würde und Privatsphäre Ihrer Patienten?",
    "Was bedeutet für Sie patientenzentrierte Pflege?",
    "Wie gehen Sie mit einer Patientenverfügung um?",
    "Wie erklären Sie einem Patienten komplizierte medizinische Anweisungen einfach?",
    "Wie zeigen Sie Empathie gegenüber Patienten in schwierigen Situationen?",
  ],

  // AUSLÄNDERBEHÖRDE — Residence Permit
  residency: [
    "Seit wann sind Sie in Deutschland?",
    "Was ist Ihr derzeitiger Aufenthaltsstatus?",
    "Welchen Aufenthaltstitel haben Sie derzeit?",
    "Was ist der Zweck Ihres Aufenthalts in Deutschland?",
    "Wo arbeiten Sie zurzeit und in welcher Position?",
    "Haben Sie einen gültigen Arbeitsvertrag? Können Sie ihn vorzeigen?",
    "Wie viele Stunden arbeiten Sie pro Woche?",
    "Wie hoch ist Ihr monatliches Einkommen?",
    "Können Sie sich selbst finanziell versorgen?",
    "Haben Sie eine gesetzliche Krankenversicherung?",
    "Wo wohnen Sie in Deutschland?",
    "Haben Sie einen Mietvertrag?",
    "Wie lange planen Sie, in Deutschland zu bleiben?",
    "Möchten Sie langfristig in Deutschland bleiben?",
    "Haben Sie Familie in Deutschland?",
    "Haben Sie Kinder, die in Deutschland zur Schule gehen?",
    "Sind Ihre Berufsqualifikationen in Deutschland anerkannt?",
    "Haben Sie die Anerkennungsurkunde Ihres Berufsabschlusses?",
    "Welche Deutschkenntnisse haben Sie? Auf welchem Niveau?",
    "Haben Sie ein Sprachzertifikat — zum Beispiel Goethe oder telc?",
    "Haben Sie bereits Integrationskurse besucht?",
    "Haben Sie ein polizeiliches Führungszeugnis?",
    "Haben Sie ein gültiges Reisedokument / gültigen Reisepass?",
    "Haben Sie Vorstrafen in Deutschland oder in Ihrem Heimatland?",
    "Welche Schritte unternehmen Sie, um sich zu integrieren?",
    "Wie gut kennen Sie die deutschen Gesetze und Regelungen?",
    "Haben Sie Ihren aktuellen Ausweis oder Reisepass dabei?",
    "Wie ist Ihre aktuelle Adresse in Deutschland?",
    "Haben Sie eine Anmeldebestätigung?",
    "Haben Sie Ihre Steuernummer?",
    "Zahlen Sie Steuern in Deutschland?",
    "Haben Sie eine Sozialversicherungsnummer?",
    "Haben Sie Schulden in Deutschland?",
    "Erhalten Sie staatliche Unterstützung oder Sozialleistungen?",
    "Was war Ihr Beruf in Indien?",
    "Wie lange haben Sie in Indien als Pflegekraft gearbeitet?",
    "Haben Sie Referenzschreiben von Ihrem früheren Arbeitgeber?",
    "Haben Sie alle erforderlichen Unterlagen für die Verlängerung mitgebracht?",
    "Warum möchten Sie Ihren Aufenthaltstitel verlängern?",
    "Möchten Sie eine Niederlassungserlaubnis beantragen?",
    "Was verstehen Sie unter einer Niederlassungserlaubnis?",
    "Haben Sie Kenntnisse des Grundgesetzes?",
    "Haben Sie an einem Einbürgerungstest teilgenommen?",
    "Wissen Sie, wann Sie die deutsche Staatsbürgerschaft beantragen können?",
    "Wie oft reisen Sie in Ihr Heimatland?",
    "Haben Sie noch enge Bindungen an Ihr Heimatland?",
    "Sprechen Sie noch andere Sprachen außer Deutsch und Ihrer Muttersprache?",
    "Ist Ihr Deutsch gut genug für den Alltag und die Arbeit?",
    "Wie haben Sie Deutsch gelernt?",
    "Wo haben Sie Ihren Sprachkurs absolviert?",
  ],

  // LANGUAGE CHECK — B1/B2 Free Speech
  language: [
    "Beschreiben Sie Ihren typischen Arbeitstag als Pflegehelferin.",
    "Was machen Sie in Ihrer Freizeit in Deutschland?",
    "Erzählen Sie von Ihrer Familie in Indien.",
    "Wie unterscheidet sich das Leben in Deutschland von dem in Indien?",
    "Was gefällt Ihnen am deutschen Gesundheitssystem?",
    "Wie halten Sie Ihr Deutsch auf dem Laufenden?",
    "Beschreiben Sie, wie Sie eine Übergabe durchführen.",
    "Wie erklären Sie einem Patienten, wie er seine Medikamente nehmen soll?",
    "Was ist das Wichtigste in der Patientenversorgung für Sie?",
    "Beschreiben Sie eine typische Schicht in Ihrer Abteilung.",
    "Wie kommunizieren Sie mit Patienten, die nervös oder ängstlich sind?",
    "Was haben Sie über die deutsche Kultur gelernt?",
    "Was war die größte Herausforderung beim Leben in Deutschland?",
    "Wie haben Sie sich in Deutschland eingelebt?",
    "Was vermissen Sie am meisten aus Ihrem Heimatland?",
    "Beschreiben Sie, wie Sie eine Wunde versorgen.",
    "Wie erklären Sie einem Patienten, was eine Blutdruckmessung ist?",
    "Was würden Sie tun, wenn Sie einen Patienten mit starken Schmerzen haben?",
    "Wie gehen Sie mit Sprachbarrieren im Pflegealltag um?",
    "Warum ist Kommunikation in der Pflege so wichtig?",
    "Was verstehen Sie unter Patientenrechten?",
    "Wie pflegen Sie Ihre Kollegen-Beziehungen am Arbeitsplatz?",
    "Beschreiben Sie eine Situation, in der Sie besonders gut auf Deutsch kommuniziert haben.",
    "Was haben Sie in Deutschland über Pflege Neues gelernt?",
    "Wie schätzen Sie Ihre eigenen Deutschkenntnisse ein?",
    "Was bedeutet Hygienevorschriften für Sie im Alltag?",
    "Beschreiben Sie, wie Sie auf Schichtarbeit reagieren.",
    "Wie gehen Sie mit einem sehr langen und stressigen Arbeitstag um?",
    "Was würden Sie einem Freund in Indien empfehlen, der nach Deutschland kommen möchte?",
    "Wie haben Sie sich auf Ihre Arbeit in Deutschland vorbereitet?",
    "Beschreiben Sie Ihre ersten Wochen in Deutschland.",
    "Wie haben Sie die deutsche Sprache gelernt?",
    "Was bedeutet für Sie Teamarbeit in der Pflege?",
    "Wie erklären Sie einem Patienten die Tagesstruktur auf der Station?",
    "Was tun Sie, wenn Sie ein Wort auf Deutsch nicht kennen?",
    "Wie finden Sie die richtige Balance zwischen Beruf und Privatleben?",
    "Was ist Ihr Lieblingswort auf Deutsch und warum?",
    "Wie beschreiben Sie Deutschland an Freunde in Indien?",
    "Was würden Sie an Ihrem Arbeitsplatz gerne verbessern?",
    "Beschreiben Sie Ihre persönliche Entwicklung seit Ihrer Ankunft in Deutschland.",
    "Was sind Ihre Hobbys und wie helfen sie Ihnen, sich zu entspannen?",
    "Wie gehen Sie mit Kritik am Arbeitsplatz um?",
    "Beschreiben Sie, wie Sie eine Situation gemeistert haben, in der Sie sich unsicher fühlten.",
    "Was bedeutet für Sie lebenslanges Lernen im Pflegeberuf?",
    "Wie bleiben Sie über neue Entwicklungen in der Pflege informiert?",
    "Beschreiben Sie eine besonders schöne Erfahrung mit einem Patienten.",
    "Was ist der Unterschied zwischen Pflege in der Klinik und im Pflegeheim?",
    "Wie schätzen Sie Ihre Zukunft in Deutschland ein?",
    "Was möchten Sie in den nächsten zwei Jahren erreichen?",
    "Was bedeutet für Sie ein guter Pflegeberuf in Deutschland?",
  ],
}

const TYPES = [
  {
    id: 'hospital',
    title: '🏥 Krankenhaus Vorstellungsgespräch',
    desc: 'Pflegehelfer / Pflegefachkraft — hospital job interview',
    lv: 'B1+',
    count: QB.hospital.length,
    color: C.blue,
    bg: C.blueL,
  },
  {
    id: 'residency',
    title: '🏛️ Ausländerbehörde',
    desc: 'Residence permit / visa questions',
    lv: 'B1+',
    count: QB.residency.length,
    color: C.green,
    bg: C.greenL,
  },
  {
    id: 'language',
    title: '🗣️ Sprachcheck B1/B2',
    desc: 'Free speech & fluency practice',
    lv: 'B1–B2',
    count: QB.language.length,
    color: C.amber,
    bg: C.amberL,
  },
]

export default function InterviewPage({ user, completedTopics, onAddScore }) {
  const [phase, setPhase] = useState('select')
  const [type, setType] = useState(null)
  const [qs, setQs] = useState([])
  const [cur, setCur] = useState(0)
  const [answers, setAnswers] = useState([])
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const [rec, setRec] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [textMode, setTextMode] = useState(false)
  const [textAns, setTextAns] = useState('')
  const [qCount, setQCount] = useState(5)
  const recRef = useRef(null)

  const requiredTopics = [...CURRICULUM.A1, ...CURRICULUM.A2]
  const totalTopics = requiredTopics.length
  const doneRequired = requiredTopics.filter(t => completedTopics?.includes(t.id)).length
  const isUnlocked = doneRequired >= totalTopics

  function startInterview(t, count = 5) {
    const sel = [...QB[t]].sort(() => Math.random() - 0.5).slice(0, count)
    setType(t); setQs(sel); setCur(0); setAnswers([])
    setFeedback(null); setTranscript(''); setTextAns(''); setPhase('interview')
    setTimeout(() => speakDE(sel[0]), 400)
    trackEvent(user?.rollNumber, 'interview_start', 'interview', t, user?.level)
  }

  function speakDE(text) {
    window.speechSynthesis.cancel()
    setTimeout(() => {
      const u = new SpeechSynthesisUtterance(text)
      u.lang = 'de-DE'; u.rate = 0.8
      const v = window.speechSynthesis.getVoices().find(v => v.lang.startsWith('de'))
      if (v) u.voice = v
      window.speechSynthesis.speak(u)
    }, 150)
  }

  function startRec() {
    if (!window.SpeechRecognition && !window.webkitSpeechRecognition) {
      setTextMode(true); return
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const r = new SR(); r.lang = 'de-DE'; r.interimResults = true
    r.onresult = e => setTranscript(Array.from(e.results).map(r => r[0].transcript).join(''))
    r.onend = () => setRec(false)
    r.onerror = () => { setRec(false); setTextMode(true) }
    r.start(); recRef.current = r; setRec(true); setTranscript('')
  }

  function stopRec() { recRef.current?.stop(); setRec(false) }

  function submitAns() {
    const ans = textMode ? (textAns || '(No answer)') : (transcript || '(No answer)')
    const na = [...answers, { q: qs[cur], a: ans }]
    setAnswers(na); setTranscript(''); setTextAns('')
    if (cur + 1 >= qs.length) { setPhase('feedback'); getFeedback(na) }
    else { setCur(c => c + 1); setTimeout(() => speakDE(qs[cur + 1]), 300) }
  }

  async function getFeedback(allAns) {
    setLoading(true)
    const qa = allAns.map((a, i) => `Q${i + 1}: ${a.q}\nA: ${a.a}`).join('\n\n')
    const sys = 'German language coach for Indian nurses. Respond ONLY valid JSON: {"overall_score":0-100,"strengths":["s1","s2"],"improvements":["a1","a2"],"corrections":[{"said":"x","better":"y"}],"next_steps":["n1","n2"]}'
    const r = await ai([{ role: 'user', content: `Evaluate these German nursing interview answers:\n\n${qa}` }], sys, 700)
    try {
      const d = JSON.parse(r.replace(/```json|```/g, '').trim())
      setFeedback(d)
      onAddScore && onAddScore(d.overall_score)
      trackEvent(user?.rollNumber, 'interview_complete', 'interview', type, user?.level, d.overall_score)
    } catch {
      setFeedback({ overall_score: 72, strengths: ['Completed all questions', 'Good effort'], improvements: ['Expand German vocabulary', 'Practice longer sentences'], corrections: [], next_steps: ['Practice daily with GC Buddy', 'Review B1 grammar'] })
    }
    setLoading(false)
  }

  // ── SELECT SCREEN ──
  if (phase === 'select') {
    if (!isUnlocked) return (
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 3 }}>🎭 Mock Interviews</h2>
        <div style={{ textAlign: 'center', padding: '36px 16px' }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>🔒</div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 8 }}>Interview Practice Locked</h3>
          <p style={{ fontSize: 12, color: C.textM, lineHeight: 1.7, marginBottom: 18 }}>Complete all <strong>A1 + A2 curriculum topics</strong> ({totalTopics} topics) to unlock.</p>
          <div style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '16px', maxWidth: 260, margin: '0 auto' }}>
            <PBar pct={(doneRequired / totalTopics) * 100} color={C.blue} h={10} style={{ marginBottom: 7 }} />
            <div style={{ fontSize: 12, color: C.textM }}>
              <strong style={{ color: C.navy }}>{doneRequired}</strong>/{totalTopics} done ·{' '}
              <strong style={{ color: C.red }}>{totalTopics - doneRequired} remaining</strong>
            </div>
          </div>
        </div>
      </div>
    )

    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 3 }}>🎭 Mock Interviews</h2>
        <p style={{ fontSize: 11, color: C.textS, marginBottom: 12 }}>AI-powered interview practice · Real-time German feedback</p>

        <div style={{ background: C.greenL, border: `1px solid ${C.green}44`, borderRadius: 10, padding: '9px 13px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
          <span>🏆</span><span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>All topics complete! Interview practice unlocked.</span>
        </div>

        {/* Question count picker */}
        <div style={{ background: '#fff', borderRadius: 11, border: `1px solid ${C.border}`, padding: '11px 13px', marginBottom: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textS, letterSpacing: '.07em', marginBottom: 8 }}>NUMBER OF QUESTIONS</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {[3, 5, 7, 10].map(n => (
              <button key={n} onClick={() => setQCount(n)}
                style={{ flex: 1, padding: '7px', borderRadius: 7, border: `2px solid ${qCount === n ? C.blue : C.border}`, background: qCount === n ? C.blueL : 'transparent', color: qCount === n ? C.blue : C.textM, fontWeight: 700, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                {n} Q
              </button>
            ))}
          </div>
        </div>

        {TYPES.map(t => (
          <div key={t.id} style={{ background: '#fff', borderRadius: 13, border: `1px solid ${C.border}`, padding: '14px', marginBottom: 10, cursor: 'pointer', transition: 'box-shadow .15s' }}
            onClick={() => startInterview(t.id, qCount)}
            onMouseEnter={e => e.currentTarget.style.boxShadow = C.shM}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ fontSize: 26 }}>{t.title.split(' ')[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 12, marginBottom: 2 }}>{t.title.slice(3)}</div>
                <div style={{ fontSize: 10, color: C.textS }}>{t.desc}</div>
              </div>
              <span style={{ color: C.blue, fontSize: 15, flexShrink: 0 }}>→</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ background: t.bg, color: t.color, fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 10 }}>{t.lv}</span>
              <span style={{ background: C.surfAlt, color: C.textS, fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>{t.count} questions in bank</span>
              <span style={{ background: C.navyL || '#f0f4ff', color: C.navy, fontSize: 9, fontWeight: 600, padding: '2px 8px', borderRadius: 10 }}>Picks {qCount} randomly</span>
            </div>
          </div>
        ))}

        {/* Tips */}
        <div style={{ background: C.amberL, border: `1px solid ${C.amber}44`, borderRadius: 11, padding: '12px 14px', marginTop: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, marginBottom: 6 }}>💡 Tips for Success</div>
          <div style={{ fontSize: 10, color: C.textM, lineHeight: 1.8 }}>
            • <strong>Speak in complete sentences</strong> — avoid one-word answers<br />
            • <strong>Use "Ich"</strong> — start answers with "Ich würde...", "Ich habe..."<br />
            • <strong>Take your time</strong> — it's better to speak slowly and correctly<br />
            • <strong>Text mode available</strong> — if microphone doesn't work, type your answer<br />
            • <strong>Practice all 3 categories</strong> — hospital, residency & language check
          </div>
        </div>
      </div>
    )
  }

  // ── INTERVIEW SCREEN ──
  if (phase === 'interview') {
    const typeInfo = TYPES.find(t => t.id === type)
    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
          <Btn label="← Back" onClick={() => { window.speechSynthesis.cancel(); setPhase('select') }} variant="ghost" size="sm" />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: C.textS }}>Q{cur + 1} / {qs.length}</div>
            <div style={{ fontSize: 9, color: C.textS }}>{typeInfo?.title.slice(3)}</div>
          </div>
        </div>
        <PBar pct={(cur / qs.length) * 100} h={4} style={{ marginBottom: 13 }} />

        {/* Question */}
        <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyM})`, borderRadius: 14, padding: '20px 18px', marginBottom: 13, textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.1em', marginBottom: 7 }}>FRAGE {cur + 1} VON {qs.length}</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#fff', lineHeight: 1.6, marginBottom: 12 }}>{qs[cur]}</div>
          <Btn label="🔊 Wiederholen" onClick={() => speakDE(qs[cur])} variant="outline" size="sm"
            style={{ color: '#fff', borderColor: 'rgba(255,255,255,.3)', fontSize: 11 }} />
        </div>

        {/* Input mode toggle */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 10 }}>
          <button onClick={() => setTextMode(false)}
            style={{ flex: 1, padding: '6px', borderRadius: 7, border: `1.5px solid ${!textMode ? C.blue : C.border}`, background: !textMode ? C.blueL : 'transparent', color: !textMode ? C.blue : C.textS, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            🎙️ Voice
          </button>
          <button onClick={() => setTextMode(true)}
            style={{ flex: 1, padding: '6px', borderRadius: 7, border: `1.5px solid ${textMode ? C.blue : C.border}`, background: textMode ? C.blueL : 'transparent', color: textMode ? C.blue : C.textS, fontSize: 10, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            ⌨️ Type
          </button>
        </div>

        {/* Answer area */}
        <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '13px', marginBottom: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.textS, letterSpacing: '.07em', marginBottom: 8 }}>IHRE ANTWORT (auf Deutsch)</div>

          {!textMode ? (
            <>
              {rec && (
                <div style={{ display: 'flex', gap: 5, alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: C.red }} />
                  <span style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>Aufnahme läuft...</span>
                </div>
              )}
              {transcript ? (
                <div style={{ fontSize: 12, color: C.text, background: C.surfAlt, borderRadius: 7, padding: '10px', marginBottom: 10, lineHeight: 1.7 }}>{transcript}</div>
              ) : (
                <div style={{ fontSize: 11, color: C.textS, marginBottom: 10, fontStyle: 'italic', minHeight: 40 }}>
                  Drücken Sie auf Aufnahme und sprechen Sie auf Deutsch...
                </div>
              )}
              <div style={{ display: 'flex', gap: 7 }}>
                {!rec
                  ? <Btn label="🎙️ Aufnahme starten" onClick={startRec} variant="danger" style={{ flex: 1 }} />
                  : <Btn label="⏹ Stopp" onClick={stopRec} variant="outline" style={{ flex: 1 }} />}
                <Btn label={cur + 1 >= qs.length ? 'Fertig ✓' : 'Weiter →'}
                  onClick={submitAns} variant="primary" disabled={!transcript && !rec} />
              </div>
            </>
          ) : (
            <>
              <textarea value={textAns} onChange={e => setTextAns(e.target.value)}
                placeholder="Schreiben Sie Ihre Antwort auf Deutsch..."
                style={{ width: '100%', minHeight: 80, borderRadius: 8, border: `1px solid ${C.border}`, padding: '9px 10px', fontSize: 12, fontFamily: 'inherit', resize: 'vertical', lineHeight: 1.6, color: C.text, boxSizing: 'border-box' }} />
              <Btn label={cur + 1 >= qs.length ? 'Fertig ✓' : 'Weiter →'}
                onClick={submitAns} variant="primary" disabled={!textAns.trim()} style={{ marginTop: 8, width: '100%' }} />
            </>
          )}
        </div>

        {/* Skip */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => { setTranscript('(Übersprungen)'); setTextAns('(Übersprungen)'); submitAns() }}
            style={{ fontSize: 10, color: C.textS, background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
            Überspringen
          </button>
        </div>
      </div>
    )
  }

  // ── FEEDBACK SCREEN ──
  if (phase === 'feedback') {
    if (loading) return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
        <Spin sz={32} />
        <div style={{ color: C.textS, fontSize: 12 }}>GC Buddy analysiert Ihre Antworten...</div>
        <div style={{ color: C.textS, fontSize: 10 }}>This takes 10–20 seconds</div>
      </div>
    )

    return (
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 18px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: C.navy, marginBottom: 13 }}>📊 Interview-Feedback</h2>
        {feedback && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {/* Score */}
            <div style={{ background: `linear-gradient(135deg,${C.navy},${C.navyM})`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: feedback.overall_score >= 80 ? C.green : feedback.overall_score >= 60 ? C.amber : C.red, marginBottom: 2 }}>{feedback.overall_score}</div>
              <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 11, marginBottom: 8 }}>von 100 Punkten</div>
              <div style={{ fontSize: 13, color: '#fff', fontWeight: 600 }}>
                {feedback.overall_score >= 80 ? '🏆 Ausgezeichnet!' : feedback.overall_score >= 65 ? '🎓 Gut gemacht!' : feedback.overall_score >= 50 ? '📚 Weiter üben!' : '💪 Nicht aufgeben!'}
              </div>
            </div>

            {/* Q&A Review */}
            <div style={{ background: '#fff', borderRadius: 12, border: `1px solid ${C.border}`, padding: '12px 14px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textS, letterSpacing: '.07em', marginBottom: 8 }}>IHRE ANTWORTEN</div>
              {answers.map((a, i) => (
                <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: i < answers.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: C.navy, marginBottom: 3 }}>Q{i + 1}: {a.q}</div>
                  <div style={{ fontSize: 10, color: C.textM, background: C.surfAlt, borderRadius: 6, padding: '6px 8px', fontStyle: 'italic' }}>{a.a}</div>
                </div>
              ))}
            </div>

            <div style={{ background: C.greenL, borderRadius: 11, padding: '11px 13px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.green, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>✅ Stärken</div>
              {feedback.strengths?.map((s, i) => <div key={i} style={{ fontSize: 11, color: C.textM, marginBottom: 3 }}>• {s}</div>)}
            </div>

            <div style={{ background: C.amberL, borderRadius: 11, padding: '11px 13px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.amber, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>📈 Verbesserungen</div>
              {feedback.improvements?.map((s, i) => <div key={i} style={{ fontSize: 11, color: C.textM, marginBottom: 3 }}>• {s}</div>)}
            </div>

            {feedback.corrections?.length > 0 && (
              <div style={{ background: '#fff', borderRadius: 11, border: `1px solid ${C.border}`, padding: '11px 13px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: C.textS, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 7 }}>💬 Korrekturen</div>
                {feedback.corrections.map((c, i) => (
                  <div key={i} style={{ marginBottom: 7, padding: '6px 9px', background: C.surfAlt, borderRadius: 7 }}>
                    <div style={{ fontSize: 10, color: C.red, textDecoration: 'line-through' }}>{c.said}</div>
                    <div style={{ fontSize: 10, color: C.green, marginTop: 2, fontWeight: 600 }}>→ {c.better}</div>
                  </div>
                ))}
              </div>
            )}

            <div style={{ background: '#fff', borderRadius: 11, border: `1px solid ${C.border}`, padding: '11px 13px' }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.textS, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 5 }}>🎯 Nächste Schritte</div>
              {feedback.next_steps?.map((s, i) => <div key={i} style={{ fontSize: 11, color: C.textM, marginBottom: 3 }}>→ {s}</div>)}
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <Btn label="← Auswahl" onClick={() => setPhase('select')} variant="outline" style={{ flex: 1 }} />
              <Btn label="Nochmal 🔄" onClick={() => startInterview(type, qCount)} variant="primary" style={{ flex: 1 }} />
            </div>
          </div>
        )}
      </div>
    )
  }
}
