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

// Returns true only if speech actually started with a German voice.
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
