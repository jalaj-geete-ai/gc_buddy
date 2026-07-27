// LiteLLM proxy — OpenAI-compatible /chat/completions.
// The proxy holds the real provider key server-side; VITE_LLM_API_KEY is a
// budget-capped virtual key, so if it leaks from the bundle it's revocable.
const KEY = import.meta.env.VITE_LLM_API_KEY
const ENDPOINT = import.meta.env.VITE_LLM_ENDPOINT || 'https://litellm.classplusapp.com/v1/chat/completions'

// Tried in order; first model that returns text wins.
// gemini-2.5-flash-umair is the working 2.5-flash group on the proxy (the bare
// 'gemini-2.5-flash' group has an invalid upstream key). Lite is the fallback.
const MODELS = [
  'gemini-2.5-flash-umair',
  'gemini-3.1-flash-lite',
]

function buildMsgs(messages, system) {
  const msgs = []
  if (system) msgs.push({ role: 'system', content: system })
  for (const m of messages) {
    msgs.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })
  }
  if (!msgs.some(m => m.role === 'user')) msgs.push({ role: 'user', content: 'Hello' })
  return msgs
}

async function gemini(messages, system = '', maxTokens = 1200) {
  const msgs = buildMsgs(messages, system)

  for (const model of MODELS) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 28000)
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: msgs,
          max_tokens: Math.min(maxTokens, 2048),
          temperature: 0.7,
        }),
        signal: ctrl.signal,
      })
      clearTimeout(t)
      const d = await r.json()
      if (!r.ok) {
        console.error(`LLM ${model}:`, d?.error?.message)
        continue
      }
      const text = d?.choices?.[0]?.message?.content || ''
      if (text) return text
    } catch (e) {
      if (e.name === 'AbortError') { console.error(`${model} timed out`); continue }
      console.error(`${model} error:`, e.message); continue
    }
  }
  return 'AI temporarily unavailable. Please try again.'
}

// Streaming variant. Calls onToken(fullTextSoFar) as chunks arrive and returns
// the complete text. Falls back to the non-streaming path if streaming fails,
// so callers always get a usable result.
async function geminiStream(messages, system = '', onToken, maxTokens = 1200) {
  const msgs = buildMsgs(messages, system)

  for (const model of MODELS) {
    try {
      const ctrl = new AbortController()
      const t = setTimeout(() => ctrl.abort(), 40000)
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${KEY}`,
        },
        body: JSON.stringify({
          model,
          messages: msgs,
          max_tokens: Math.min(maxTokens, 2048),
          temperature: 0.7,
          stream: true,
        }),
        signal: ctrl.signal,
      })
      if (!r.ok || !r.body) { clearTimeout(t); continue }

      const reader = r.body.getReader()
      const decoder = new TextDecoder()
      let buf = '', full = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() || ''   // keep the last (possibly partial) line
        for (const line of lines) {
          const s = line.trim()
          if (!s.startsWith('data:')) continue
          const data = s.slice(5).trim()
          if (!data || data === '[DONE]') continue
          try {
            const delta = JSON.parse(data)?.choices?.[0]?.delta?.content || ''
            if (delta) { full += delta; onToken?.(full) }
          } catch { /* partial JSON across chunks — will complete next read */ }
        }
      }
      clearTimeout(t)
      if (full) return full
    } catch (e) {
      if (e.name === 'AbortError') console.error(`${model} stream timed out`)
      else console.error(`${model} stream error:`, e.message)
      continue
    }
  }
  // Streaming unavailable — fall back to a single non-streamed response.
  return gemini(messages, system, maxTokens)
}

export const ai = (messages, system, max) => gemini(messages, system, max)
export const gcBuddyChat = (messages, system) => gemini(messages, system, 1024)
export const aiStream = (messages, system, onToken, max) => geminiStream(messages, system, onToken, max)
export const gcBuddyStream = (messages, system, onToken) => geminiStream(messages, system, onToken, 1024)
