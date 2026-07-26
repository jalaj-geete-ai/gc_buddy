// Session handling for the staff portals (Coordinator, Faculty, Student Manager).
//
// Policy: a staff login lasts 24 hours from sign-in, on every device, then
// expires automatically. Surviving a refresh was the point of persisting at
// all, so this uses localStorage rather than sessionStorage — otherwise
// closing the tab would end the session and the 24-hour window would rarely
// be reached.
//
// This does NOT touch student sessions. Students persist under gc_roll /
// gc_name / gc_email in App.jsx and stay signed in indefinitely by design.

export const AUTH_TTL_MS = 24 * 60 * 60 * 1000   // 24 hours

const key = scope => `gc_auth_${scope}`

function read(scope) {
  try {
    const raw = localStorage.getItem(key(scope))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.at !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

export function readAuth(scope) {
  const rec = read(scope)
  if (!rec) return false
  if (Date.now() - rec.at >= AUTH_TTL_MS) {
    writeAuth(scope, false)   // expired — clear it out
    return false
  }
  return true
}

export function writeAuth(scope, on) {
  try {
    if (on) localStorage.setItem(key(scope), JSON.stringify({ at: Date.now() }))
    else localStorage.removeItem(key(scope))
  } catch { /* private mode / storage disabled — session just won't persist */ }
}

// Milliseconds until this session expires, or 0 if already expired.
export function msUntilExpiry(scope) {
  const rec = read(scope)
  if (!rec) return 0
  return Math.max(0, rec.at + AUTH_TTL_MS - Date.now())
}

// Human-readable remaining time, e.g. "3h left" — for the portal header.
export function expiryLabel(scope) {
  const ms = msUntilExpiry(scope)
  if (!ms) return 'expired'
  const h = Math.floor(ms / 3_600_000)
  if (h >= 1) return `${h}h left`
  return `${Math.max(1, Math.round(ms / 60_000))}m left`
}

// Logs the portal out the moment the 24 hours elapse, even if the tab has
// been sitting open the whole time. Also fires if another tab logs out.
export function watchAuthExpiry(scope, onExpire, intervalMs = 60_000) {
  const check = () => { if (!readAuth(scope)) onExpire() }
  const id = setInterval(check, intervalMs)
  const onStorage = e => { if (e.key === key(scope)) check() }
  window.addEventListener('storage', onStorage)
  return () => {
    clearInterval(id)
    window.removeEventListener('storage', onStorage)
  }
}
