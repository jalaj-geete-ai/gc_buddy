import { createClient } from '@supabase/supabase-js'
const URL = 'https://uxdrldreaockdloqvojs.supabase.co'
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4ZHJsZHJlYW9ja2Rsb3F2b2pzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MzE2MjIsImV4cCI6MjA4OTQwNzYyMn0.swqYBfGzHP5qSDPnZ_AivFE0zljyK33Kq-_ephz4Ybc'
export const sb = createClient(URL, KEY)

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

  const { error } = await sb.from('student_progress').upsert({
    roll_number: roll,
    ...updates,
    streak: updates.streak !== undefined ? updates.streak : newStreak,
    last_active: now.toISOString()
  })
  if (error) console.error('saveProg:', error.message)
  return newStreak
}
export const trackEvent = async (roll, eventType, section = '', detail = '', level = '', score = null) => {
  if (!roll) return
  try {
    await sb.from('usage_events').insert({ roll_number: roll, event_type: eventType, section, detail: String(detail || '').slice(0, 100), level, score })
  } catch (e) { /* silent */ }
}
