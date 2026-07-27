// LiteLLM proxy — OpenAI-compatible /chat/completions.
// The proxy holds the real provider key server-side; VITE_LLM_API_KEY is a
// budget-capped virtual key, so if it leaks from the bundle it's revocable.
const KEY = import.meta.env.VITE_LLM_API_KEY
const ENDPOINT = import.meta.env.VITE_LLM_ENDPOINT || 'https://litellm.classplusapp.com/v1/chat/completions'

// Tried in order; first model that returns text wins.
// NOTE: gemini-3.1-flash-lite is first because at setup the proxy's upstream
// key for gemini-2.5-flash was failing. Once that's fixed on the proxy you can
// promote gemini-2.5-flash to the top.
const MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
]

async function gemini(messages, system = '', maxTokens = 1200) {
  const msgs = []
  if (system) msgs.push({ role: 'system', content: system })
  for (const m of messages) {
    msgs.push({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })
  }
  if (!msgs.some(m => m.role === 'user')) msgs.push({ role: 'user', content: 'Hello' })

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

export const ai = (messages, system, max) => gemini(messages, system, max)
export const gcBuddyChat = (messages, system) => gemini(messages, system, 1024)
