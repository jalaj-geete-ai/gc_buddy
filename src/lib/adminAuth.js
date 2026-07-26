// Keeps an admin/faculty portal logged in across page refreshes.
//
// sessionStorage rather than localStorage on purpose: a refresh (F5) keeps the
// session, but closing the tab ends it. These portals are gated by a shared
// password, so leaving them logged in indefinitely on a shared machine would
// be worse than the mild inconvenience of signing in once per sitting.

const key = scope => `gc_auth_${scope}`

export function readAuth(scope) {
  try { return sessionStorage.getItem(key(scope)) === '1' } catch { return false }
}

export function writeAuth(scope, on) {
  try {
    if (on) sessionStorage.setItem(key(scope), '1')
    else sessionStorage.removeItem(key(scope))
  } catch { /* private mode / storage disabled — session just won't persist */ }
}
