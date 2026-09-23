// Per-device identity + type detection for the "one mobile + one laptop" limit.
//
// gc_device_id is a random id stored on this physical device. It deliberately
// PERSISTS across logout (it is not cleared by handleLogout), so re-logging in
// on the same phone/laptop is recognised as the same device and does NOT show
// the "you'll be logged out elsewhere" warning.

const DEVICE_ID_KEY = 'gc_device_id'

export function getDeviceId() {
  try {
    let id = localStorage.getItem(DEVICE_ID_KEY)
    if (!id) {
      id = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'd-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
      localStorage.setItem(DEVICE_ID_KEY, id)
    }
    return id
  } catch {
    // localStorage blocked (private mode) — fall back to a per-session id so the
    // app still works; the device limit just can't persist here.
    return 'nostore-' + Math.random().toString(36).slice(2)
  }
}

// 'mobile' = phones and tablets (incl. the Android WebView app); 'laptop' =
// everything else (desktop/laptop browsers). The two slots are independent, so
// a second phone only replaces the first phone, a second laptop only the first.
export function getDeviceKind() {
  const ua = navigator.userAgent || ''
  const touch = (navigator.maxTouchPoints || 0) > 1
  const isMobileUA = /Mobi|Android|iPhone|iPod|iPad|IEMobile|BlackBerry|Opera Mini/i.test(ua)
  const isIpadOS = /Macintosh/.test(ua) && touch // iPadOS reports a Mac UA + touch
  return (isMobileUA || isIpadOS) ? 'mobile' : 'laptop'
}

// A short human-friendly label shown in the takeover warning, e.g. "Android · Chrome".
export function getDeviceLabel() {
  const ua = navigator.userAgent || ''
  let os = 'Device'
  if (/Android/i.test(ua)) os = 'Android'
  else if (/iPhone|iPod/i.test(ua)) os = 'iPhone'
  else if (/iPad/i.test(ua) || (/Macintosh/.test(ua) && (navigator.maxTouchPoints || 0) > 1)) os = 'iPad'
  else if (/Windows/i.test(ua)) os = 'Windows'
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'Mac'
  else if (/Linux/i.test(ua)) os = 'Linux'
  let br = 'Browser'
  if (/Edg\//i.test(ua)) br = 'Edge'
  else if (/OPR\/|Opera/i.test(ua)) br = 'Opera'
  else if (/SamsungBrowser/i.test(ua)) br = 'Samsung'
  else if (/Firefox\//i.test(ua)) br = 'Firefox'
  else if (/Chrome\//i.test(ua)) br = 'Chrome'
  else if (/Safari\//i.test(ua)) br = 'Safari'
  return `${os} · ${br}`
}

// "just now" / "5 min ago" / "3 h ago" / "2 days ago" for the warning.
export function timeAgo(iso) {
  if (!iso) return ''
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60); if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60); if (h < 24) return `${h} h ago`
  const d = Math.floor(h / 24); return `${d} day${d > 1 ? 's' : ''} ago`
}
