import { createClient } from '@supabase/supabase-js'
const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

// A missing/empty Supabase env var used to take the WHOLE app down: the current
// supabase-js throws "supabaseUrl is required." synchronously inside
// createClient(), and this runs at module load — so React never mounted and the
// production build white-screened with no error on the page. A config gap must
// never blank the entire SPA. Warn loudly, but hand createClient well-formed
// placeholders so the app still renders; data calls then fail at network time,
// which every caller here already tolerates (they check `data`, catch, or log).
// The real fix is setting these in Cloudflare Pages → Settings → Environment
// variables (Production) and redeploying — Vite inlines VITE_* at build time.
if (!URL || !KEY) {
  console.error(
    '[GC Buddy] Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY at build time. ' +
    'Login, progress and admin data are disabled until these are set in the ' +
    'Cloudflare Pages environment and the site is redeployed.'
  )
}

export const sb = createClient(
  URL || 'https://unconfigured.supabase.co',
  KEY || 'unconfigured'
)

export const checkRoll = async roll => {
  const { data } = await sb.from('approved_students').select('roll_number,name').eq('roll_number', roll.trim().toUpperCase()).single()
  return data
}
export const loadProg = async roll => {
  const { data } = await sb.from('student_progress').select('*').eq('roll_number', roll).single()
  return data
}
export const saveProg = async (roll, updates) => {
  // ── Streak logic ──
  // Fetch current last_active and streak to compute new streak
  const { data: current } = await sb.from('student_progress').select('last_active, streak').eq('roll_number', roll).single()
  const now = new Date()
  const last = current?.last_active ? new Date(current.last_active) : null
  let newStreak = current?.streak || 0

  if (last) {
    const hoursSince = (now.getTime() - last.getTime()) / (1000 * 60 * 60)
    const sameDay = last.toDateString() === now.toDateString()
    if (sameDay) {
      // Same calendar day — streak unchanged, just update last_active
      newStreak = current.streak || 1
    } else if (hoursSince <= 30) {
      // Different day, within 30-hour window — increment streak
      newStreak = (current.streak || 0) + 1
    } else {
      // Over 30 hours — streak broken, reset to 1 (today counts)
      newStreak = 1
    }
  } else {
    // First ever activity
    newStreak = 1
  }

  // Email was removed from the login flow, so it now arrives empty — don't let
  // that overwrite an email a student may already have on file.
  const clean = { ...updates }
  if (!clean.email) delete clean.email

  const { error } = await sb.from('student_progress').upsert({
    roll_number: roll,
    ...clean,
    streak: updates.streak !== undefined ? updates.streak : newStreak,
    last_active: now.toISOString()
  })
  if (error) console.error('saveProg:', error.message)
  return newStreak
}
// ── Device sessions (one mobile + one laptop per student) ────────────────────
// The active device for a (roll_number, device_kind) pair is whatever's stored
// here; logging in on a new device of that kind overwrites the slot, and the
// old device notices the mismatch on its next poll and logs itself out.
export const getActiveDevice = async (roll, kind) => {
  const { data } = await sb.from('device_sessions')
    .select('device_id, device_label, updated_at')
    .eq('roll_number', roll).eq('device_kind', kind).single()
  return data || null
}
export const claimDevice = async (roll, kind, deviceId, label) => {
  const { error } = await sb.from('device_sessions').upsert({
    roll_number: roll, device_kind: kind, device_id: deviceId,
    device_label: label, updated_at: new Date().toISOString(),
  })
  if (error) console.error('claimDevice:', error.message)
}
export const releaseDevice = async (roll, kind, deviceId) => {
  // Only clear the slot if we still own it, so we never delete a newer device's claim.
  try {
    await sb.from('device_sessions').delete()
      .eq('roll_number', roll).eq('device_kind', kind).eq('device_id', deviceId)
  } catch { /* best-effort */ }
}

export const trackEvent = async (roll, eventType, section = '', detail = '', level = '', score = null) => {
  if (!roll) return
  try {
    await sb.from('usage_events').insert({ roll_number: roll, event_type: eventType, section, detail: String(detail || '').slice(0, 100), level, score })
  } catch (e) { /* silent */ }
}
