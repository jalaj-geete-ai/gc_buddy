import { Component } from 'react'
import { C } from '../lib/constants'

// App-wide safety net. Before this, any thrown error during render (e.g. calling
// .includes() on a progress field that came back as {} instead of []) unmounted
// the entire tree and left a blank white screen with no way out. Now the student
// sees a friendly message and can recover — reload, or sign out (which clears the
// local session so a corrupt cached login can't trap them in a crash loop).
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Surfaces in the device console / Cloudflare logs for diagnosis.
    console.error('[GC Buddy] Uncaught render error:', error, info?.componentStack)
  }

  handleReload = () => {
    this.setState({ error: null })
    window.location.reload()
  }

  handleSignOut = () => {
    try {
      ;['gc_roll', 'gc_name', 'gc_email', 'gc_level', 'gc_placed'].forEach(k => localStorage.removeItem(k))
    } catch { /* ignore */ }
    window.location.href = '/'
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 18px' }}>
        <div style={{ background: '#fff', borderRadius: 16, border: `1px solid ${C.border}`, padding: '28px 22px', maxWidth: 380, width: '100%', textAlign: 'center', boxShadow: '0 20px 56px rgba(0,0,0,.14)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>😕</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: C.navy, marginBottom: 6 }}>Something went wrong</div>
          <div style={{ fontSize: 12.5, color: C.textM, lineHeight: 1.6, marginBottom: 20 }}>
            The app hit an unexpected error. Reloading usually fixes it. If it keeps happening, sign out and sign back in.
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={this.handleSignOut}
              style={{ flex: 1, padding: '11px', borderRadius: 11, border: `1.5px solid ${C.border}`, background: '#fff', color: C.navy, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Sign out
            </button>
            <button onClick={this.handleReload}
              style={{ flex: 1, padding: '11px', borderRadius: 11, border: 'none', background: C.blue, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
              Reload
            </button>
          </div>
        </div>
      </div>
    )
  }
}
