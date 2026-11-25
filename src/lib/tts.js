// Shared text-to-speech helpers.
//
// IMPORTANT: window.speechSynthesis does NOT exist in an Android WebView.
// It is a Chrome feature, not a WebView one, so any unguarded access throws
// a TypeError and kills the click handler it was called from. Every function
// here is safe to call unconditionally; callers never need to feature-detect.

const FEMALE_HINTS = [
  /anna/i, /katja/i, /hedda/i, /petra/i, /marlene/i, /vicki/i,
  /google\s*deutsch/i, /\bfemale\b/i,
]

export function synth() {
  if (typeof window === 'undefined') return null
  try { return window.speechSynthesis || null } catch { return null }
}

export const ttsAvailable = () => !!synth()

export function germanVoices() {
  const s = synth()
  if (!s || typeof s.getVoices !== 'function') return []
  try {
    return (s.getVoices() || []).filter(v => (v.lang || '').toLowerCase().startsWith('de'))
  } catch {
    return []
  }
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

// 'unsupported' — no speech engine at all (Android WebView, older browsers)
// 'missing'     — engine present but no German voice installed; speaking would
//                 read German aloud in an English accent, teaching bad pronunciation
// 'ok'          — a German voice is available
export function voiceStatus() {
  if (!ttsAvailable()) return 'unsupported'
  return germanVoices().length ? 'ok' : 'missing'
}

// Voices load asynchronously. Subscribe rather than guessing with a timeout.
export function onVoicesReady(cb) {
  const s = synth()
  if (!s) return () => {}
  try { s.getVoices() } catch { /* noop */ }
  const handler = () => cb()
  s.addEventListener?.('voiceschanged', handler)
  return () => s.removeEventListener?.('voiceschanged', handler)
}

export function cancelSpeech() {
  const s = synth()
  if (!s) return false
  try { s.cancel(); return true } catch { return false }
}

// ── Pre-generated audio clips ────────────────────────────────────────────────
// The reliable path. Plain <audio> works in every browser AND in Android
// WebView, where the Web Speech API does not exist at all. Clips are generated
// with a German female voice and shipped under public/audio.

let currentAudio = null

export function stopAudio() {
  if (currentAudio) {
    try { currentAudio.pause(); currentAudio.currentTime = 0 } catch { /* noop */ }
    currentAudio = null
  }
  stopSource()
}

export function stopAll() {
  stopAudio()
  cancelSpeech()
}

export function playClip(src, opts = {}) {
  const { onStart, onEnd, onFail, rate = 1 } = opts
  stopAll()
  if (typeof Audio === 'undefined') { onFail?.('unsupported'); return false }
  try {
    const a = new Audio(src)
    a.preload = 'auto'
    // Preserve pitch when slowing down. Without this some engines drop the
    // pitch along with the rate, which turns the female voice male-sounding
    // exactly when a learner is listening most carefully.
    try {
      a.preservesPitch = true
      a.mozPreservesPitch = true
      a.webkitPreservesPitch = true
    } catch { /* not supported everywhere; harmless */ }
    try { a.playbackRate = rate } catch { /* some engines refuse; not fatal */ }
    currentAudio = a
    a.onplaying = () => onStart?.()
    a.onended = () => { currentAudio = null; onEnd?.() }
    a.onerror = () => { currentAudio = null; onFail?.('missing') }
    const p = a.play()
    if (p && typeof p.catch === 'function') {
      p.catch(() => { currentAudio = null; onFail?.('blocked') })
    }
    return true
  } catch {
    onFail?.('unsupported')
    return false
  }
}

// Play a clip if we have one, otherwise fall back to the speech engine.
// Returns nothing; use handlers to react.
export function playGerman(src, text, opts = {}) {
  const { onStart, onEnd, onFail, rate = 1 } = opts
  const viaSpeech = () => {
    const started = speakDe(text, rate * 0.85, {
      onStart, onEnd,
      onFail: () => onFail?.('unavailable'),
    })
    if (!started && !ttsAvailable()) onFail?.('unavailable')
  }
  if (!src) return viaSpeech()
  playClip(src, { onStart, onEnd, rate, onFail: viaSpeech })
}

export const clipUrlWord = (id) => `/audio/w/${id}.mp3`
export const clipUrlPhrase = (level, i) => `/audio/ph/${level}-${i}.mp3`
export const clipUrlListen = (id) => `/audio/lq/${id}.mp3`

// ── On-demand German speech ──────────────────────────────────────────────────
// For dynamic text (AI chat replies, AI-generated lesson terms) there is no
// pre-generated clip. We synthesize it on the fly via the LiteLLM audio gateway
// and play it with the Web Audio API — which, unlike window.speechSynthesis,
// DOES work inside an Android WebView. Results are cached per-session by text so
// tapping the same phrase twice never costs a second request.
const LLM_KEY = import.meta.env.VITE_LLM_API_KEY
const SPEECH_URL = (import.meta.env.VITE_LLM_ENDPOINT || 'https://litellm.classplusapp.com/v1/chat/completions')
  .replace(/\/chat\/completions\/?$/, '/audio/speech')
const TTS_MODEL = import.meta.env.VITE_TTS_MODEL || 'gemini-3.8-flash-lite-tts'
const TTS_VOICE = import.meta.env.VITE_TTS_VOICE || 'Aoede'

let audioCtx = null
let currentSource = null
const bufCache = new Map()   // normalized text -> AudioBuffer (or in-flight Promise)

function getCtx() {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  if (!audioCtx) { try { audioCtx = new AC() } catch { return null } }
  try { if (audioCtx.state === 'suspended') audioCtx.resume() } catch { /* noop */ }
  return audioCtx
}

function stopSource() {
  if (currentSource) {
    try { currentSource.onended = null; currentSource.stop() } catch { /* noop */ }
    currentSource = null
  }
}

// Decode the gateway WAV, then trim the trailing synthesis artifact (a short loud
// burst after a silence gap — the "khasss" sound) and any leading silence, the
// same cleanup applied to the pre-generated bank, done here on the raw samples.
function trimBuffer(ctx, buf) {
  try {
    const sr = buf.sampleRate
    const data = buf.getChannelData(0)
    const n = data.length
    const win = Math.max(1, Math.round(0.02 * sr))   // 20ms windows
    const SIL = 0.012                                // RMS floor ≈ int16 300
    const env = []
    for (let i = 0; i < n; i += win) {
      let s = 0, c = 0
      for (let j = i; j < i + win && j < n; j++) { s += data[j] * data[j]; c++ }
      env.push(c ? Math.sqrt(s / c) : 0)
    }
    const L = env.length
    // silence runs of >= 3 windows
    const gaps = []
    for (let i = 0; i < L;) {
      if (env[i] <= SIL) { const s = i; while (i < L && env[i] <= SIL) i++; if (i - s >= 3) gaps.push([s, i]) }
      else i++
    }
    let cutWin = L
    if (gaps.length) {
      const [s, e] = gaps[gaps.length - 1]
      const tailLoud = (L - e) * win / sr
      if (e === L) cutWin = s           // trailing silence
      else if (tailLoud <= 0.40) cutWin = s   // silence then a short loud burst = artifact
    }
    let endSample = Math.min(n, Math.round(cutWin * win + 0.05 * sr))
    if (endSample < Math.round(0.30 * sr)) endSample = n   // safety: never over-trim
    // leading: skip silence before the first audible window (keep one window of lead-in)
    let startWin = 0
    while (startWin < L && env[startWin] <= SIL) startWin++
    let startSample = Math.max(0, (startWin - 1)) * win
    if (startSample >= endSample) startSample = 0
    const len = endSample - startSample
    if (len <= 0 || (startSample === 0 && endSample === n)) return buf
    const out = ctx.createBuffer(1, len, sr)
    out.copyToChannel(data.subarray(startSample, endSample), 0)
    return out
  } catch { return buf }
}

async function fetchBuffer(ctx, text) {
  const r = await fetch(SPEECH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${LLM_KEY}` },
    body: JSON.stringify({ model: TTS_MODEL, input: text, voice: TTS_VOICE, response_format: 'wav' }),
  })
  if (!r.ok) throw new Error('tts ' + r.status)
  const arr = await r.arrayBuffer()
  const decoded = await new Promise((res, rej) => {
    const p = ctx.decodeAudioData(arr, res, rej)
    if (p && typeof p.then === 'function') p.then(res, rej)
  })
  return trimBuffer(ctx, decoded)
}

function playBuffer(ctx, buf, { onStart, onEnd } = {}) {
  stopSource()
  const src = ctx.createBufferSource()
  src.buffer = buf
  src.connect(ctx.destination)
  src.onended = () => { if (currentSource === src) currentSource = null; onEnd?.() }
  currentSource = src
  onStart?.()
  src.start(0)
}

// Speak arbitrary German text now. Returns a promise that resolves once playback
// has started (or rejects / falls back if synthesis is unavailable).
export async function speakOnDemand(text, opts = {}) {
  const { onStart, onEnd, onFail } = opts
  const clean = String(text || '').replace(/<[^>]+>/g, '').replace(/[*_`]+/g, '').trim()
  if (!clean) { onFail?.('empty'); return }
  stopAll()
  const ctx = getCtx()
  if (!ctx || !LLM_KEY) {
    // Fallback: the browser speech engine (desktop only; absent in WebView).
    const started = speakDe(clean, 0.9, { onStart, onEnd, onFail: () => onFail?.('unavailable') })
    if (!started && !ttsAvailable()) onFail?.('unavailable')
    return
  }
  try {
    let entry = bufCache.get(clean)
    if (!entry) { entry = fetchBuffer(ctx, clean); bufCache.set(clean, entry) }
    const buf = await entry
    bufCache.set(clean, buf)   // store resolved buffer
    playBuffer(ctx, buf, { onStart, onEnd })
  } catch (e) {
    bufCache.delete(clean)
    const started = speakDe(clean, 0.9, { onStart, onEnd, onFail: () => onFail?.('error') })
    if (!started) onFail?.('error')
  }
}

export function speaking() { return !!currentSource }
export function speakDe(text, rate = 0.85, handlers = {}) {
  const s = synth()
  if (!s || !text) { handlers.onFail?.('unsupported'); return false }
  const voice = pickGermanVoice()
  if (!voice) { handlers.onFail?.('missing') }
  try {
    s.cancel()
    const u = new SpeechSynthesisUtterance(String(text))
    u.lang = 'de-DE'
    u.rate = rate
    u.pitch = 1.05
    u.volume = 1
    if (voice) u.voice = voice
    if (handlers.onStart) u.onstart = handlers.onStart
    if (handlers.onEnd) u.onend = handlers.onEnd
    u.onerror = e => {
      handlers.onEnd?.()
      handlers.onError?.(e?.error || 'error')
    }
    s.speak(u)
    return !!voice
  } catch {
    handlers.onFail?.('unsupported')
    return false
  }
}
