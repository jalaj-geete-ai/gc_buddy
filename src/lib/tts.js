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
