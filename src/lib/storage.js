// Guarded localStorage wrapper.
//
// Accessing localStorage can THROW (not just return null) on some browsers:
// Android WebViews with storage disabled, private/incognito modes, and when the
// user has blocked site data / third-party cookies. An unguarded read in a
// render or effect therefore crashes the whole app at load — which showed up as
// the "Something went wrong" error-boundary screen for students on such devices.
// Every access here is wrapped so a blocked store degrades gracefully (the app
// runs, it just can't persist) instead of crashing.
export const storage = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem(key)
      return v === null ? fallback : v
    } catch { return fallback }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); return true } catch { return false }
  },
  remove(key) {
    try { localStorage.removeItem(key) } catch { /* ignore */ }
  },
  getJSON(key, fallback = null) {
    try {
      const v = localStorage.getItem(key)
      return v == null ? fallback : JSON.parse(v)
    } catch { return fallback }
  },
  setJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true } catch { return false }
  },
}
