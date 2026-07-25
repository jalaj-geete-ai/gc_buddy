import { sb } from './supabase'

// ── Spaced repetition ────────────────────────────────────────────────────────
// Box 0..4 map to review intervals; box 5 = mastered (no longer scheduled).
// Mirrors the Day 1 / 2 / 4 / 7 schedule the vocabulary book itself recommends.
export const INTERVALS = [1, 3, 7, 21, 60]
export const MAX_BOX = 5
export const DAYS_PER_SESSION = 3   // catch-up allowance per calendar day
export const TOTAL_DAYS = 120

export const today = () => new Date().toISOString().slice(0, 10)

const addDays = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

export function nextBox(box, correct) {
  if (!correct) return 0
  return Math.min((box || 0) + 1, MAX_BOX)
}

export function boxState(box) {
  if (box >= MAX_BOX) return 'mastered'
  if (box >= 3) return 'known'
  return 'learning'
}

export function dueDateFor(box) {
  if (box >= MAX_BOX) return null
  return addDays(INTERVALS[Math.min(box, INTERVALS.length - 1)])
}

// ── Audio: German pronunciation, female voice preferred ──────────────────────
// Voice names vary by platform. Anna ships on iOS, Katja/Hedda on Windows,
// Google Deutsch on Android/Chrome. We match by name first, then fall back to
// any de-DE voice, then any German-language voice at all.
const FEMALE_HINTS = [
  /anna/i, /katja/i, /hedda/i, /petra/i, /marlene/i, /vicki/i,
  /google\s*deutsch/i, /\bfemale\b/i,
]

export function germanVoices() {
  const synth = typeof window !== 'undefined' && window.speechSynthesis
  if (!synth || !synth.getVoices) return []
  return synth.getVoices().filter(v => (v.lang || '').toLowerCase().startsWith('de'))
}

export function pickGermanVoice() {
  const de = germanVoices()
  if (!de.length) return null
  for (const re of FEMALE_HINTS) {
    const hit = de.find(v => re.test(v.name || ''))
    if (hit) return hit
  }
  return de.find(v => /^de[-_]DE$/i.test(v.lang || '')) || de[0]
}

// 'ok' — a real German voice is installed.
// 'missing' — none found; the browser would read German with an English voice,
//   which teaches wrong pronunciation, so the UI warns instead.
// 'unsupported' — no speechSynthesis at all.
export function voiceStatus() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return 'unsupported'
  return germanVoices().length ? 'ok' : 'missing'
}

// Voices load asynchronously on most browsers. Call this once on mount and
// re-check when the list arrives, instead of guessing with a timeout.
export function onVoicesReady(cb) {
  const synth = typeof window !== 'undefined' && window.speechSynthesis
  if (!synth) return () => {}
  synth.getVoices()
  const handler = () => cb()
  synth.addEventListener?.('voiceschanged', handler)
  return () => synth.removeEventListener?.('voiceschanged', handler)
}

export function speakDe(text, rate = 0.85) {
  const synth = typeof window !== 'undefined' && window.speechSynthesis
  if (!synth || !text) return false
  try {
    synth.cancel()
    const u = new SpeechSynthesisUtterance(String(text))
    u.lang = 'de-DE'
    u.rate = rate
    u.pitch = 1.05
    const v = pickGermanVoice()
    if (v) u.voice = v
    u.onerror = () => {}
    synth.speak(u)
    return !!v
  } catch {
    return false
  }
}

// ── Word bank ────────────────────────────────────────────────────────────────
// Ships as a static asset rather than in the bundle (235 kB would nearly
// double a 785 kB single-file build). Cached in localStorage after first load.
const CACHE_KEY = 'gc_vocab_bank_v1'

export async function loadVocabBank() {
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed?.days?.length) return parsed
    }
  } catch { /* fall through to network */ }

  const res = await fetch('/vocab.json', { cache: 'force-cache' })
  if (!res.ok) throw new Error(`Could not load vocabulary (${res.status})`)
  const data = await res.json()
  if (!data?.days?.length) throw new Error('Vocabulary file was empty')
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)) } catch { /* quota — fine */ }
  return data
}

export const wordsForDay = (bank, day) => bank?.days?.find(d => d.d === day) || null
export const allWords = (bank) => (bank?.days || []).flatMap(d => d.w)

// ── Progress ─────────────────────────────────────────────────────────────────
export async function loadVocabProgress(roll) {
  if (!roll) return { prog: {}, state: null }
  const [pRes, sRes] = await Promise.all([
    sb.from('vocab_progress')
      .select('word_id,box,state,due_on,times_correct,times_wrong')
      .eq('roll_number', roll),
    sb.from('vocab_state').select('*').eq('roll_number', roll).maybeSingle(),
  ])
  const prog = {}
  for (const r of pRes.data || []) prog[r.word_id] = r
  return { prog, state: sRes.data || null }
}

export async function rateWord(roll, wordId, correct, prev) {
  const box = nextBox(prev?.box ?? 0, correct)
  const row = {
    roll_number: roll,
    word_id: wordId,
    box,
    state: boxState(box),
    due_on: dueDateFor(box),
    times_correct: (prev?.times_correct || 0) + (correct ? 1 : 0),
    times_wrong: (prev?.times_wrong || 0) + (correct ? 0 : 1),
    last_seen: new Date().toISOString(),
  }
  if (roll) {
    try { await sb.from('vocab_progress').upsert(row, { onConflict: 'roll_number,word_id' }) }
    catch { /* keep local state; a later sync will pick it up */ }
  }
  return row
}

export async function saveVocabState(roll, next) {
  if (!roll) return next
  const row = { roll_number: roll, ...next, updated_at: new Date().toISOString() }
  try { await sb.from('vocab_state').upsert(row, { onConflict: 'roll_number' }) } catch { /* noop */ }
  return next
}

// ── Derived helpers ──────────────────────────────────────────────────────────
export function dueWordIds(prog, upto = today()) {
  return Object.values(prog)
    .filter(r => r.box < MAX_BOX && r.due_on && r.due_on <= upto)
    .map(r => r.word_id)
}

export function masteredCount(prog) {
  return Object.values(prog).filter(r => r.box >= MAX_BOX).length
}

// How many new days the student may still start today.
export function remainingToday(state) {
  if (!state) return DAYS_PER_SESSION
  const usedToday = state.last_day_on === today() ? (state.days_today || 0) : 0
  return Math.max(0, DAYS_PER_SESSION - usedToday)
}

export function nextDayNumber(state) {
  return Math.min((state?.current_day || 0) + 1, TOTAL_DAYS)
}

export const MILESTONES = [50, 100, 250, 500, 1000, 1200]
