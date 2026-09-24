import React from 'react'
import { createRoot } from 'react-dom/client'
import DemoApp from './DemoApp'
import '../index.css'

// Light anti-inspection deterrents (NOT real security — a determined user can
// always bypass these; the real protection is that locked content is never
// shipped to this page). These just discourage casual snooping.
try {
  document.addEventListener('contextmenu', e => e.preventDefault())
  document.addEventListener('keydown', e => {
    const k = (e.key || '').toLowerCase()
    if (k === 'f12') e.preventDefault()
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && ['i','j','c'].includes(k)) e.preventDefault()
    if ((e.ctrlKey || e.metaKey) && k === 'u') e.preventDefault()
  })
} catch { /* noop */ }

createRoot(document.getElementById('root')).render(<DemoApp />)
