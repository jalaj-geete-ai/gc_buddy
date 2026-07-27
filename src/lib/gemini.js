const KEY = import.meta.env.VITE_GEMINI_API_KEY
const sleep = ms => new Promise(r => setTimeout(r, ms))

const MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-1.5-flash',
]

async function gemini(messages, system = '', maxTokens = 1200) {
  const body = {
    contents: messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    })),
    generationConfig: { maxOutputTokens: Math.min(maxTokens, 2048), temperature: 0.7 }
  }
  if (system) body.systemInstruction = { parts: [{ text: system }] }
  if (!body.contents.length) body.contents = [{ role: 'user', parts: [{ text: 'Hello' }] }]

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${KEY}`
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 28000)
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: ctrl.signal
      })
      clearTimeout(t)
      const d = await r.json()
      if (!r.ok) {
        console.error(`Gemini ${model}:`, d?.error?.message)
        continue
      }
      const text = d?.candidates?.[0]?.content?.parts?.[0]?.text || ''
      if (text) return text
    } catch (e) {
      if (e.name === 'AbortError') { console.error(`${model} timed out`); continue }
      console.error(`${model} error:`, e.message); continue
    }
  }
  return 'AI temporarily unavailable. Please try again.'
}

export const ai = (messages, system, max) => gemini(messages, system, max)
export const gcBuddyChat = (messages, system) => gemini(messages, system, 1024)
