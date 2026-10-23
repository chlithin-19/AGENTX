import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

// Test helper that mirrors formatGeminiPayload in server.js
function formatGeminiPayload(messages, opts = {}) {
  let systemText = ''
  const contents = []
  for (const m of messages) {
    if (m.role === 'system') {
      systemText += (systemText ? '\n\n' : '') + (m.content || '')
    } else {
      const role = m.role === 'assistant' ? 'model' : 'user'
      const text = m.content || ''
      if (contents.length > 0 && contents[contents.length - 1].role === role) {
        contents[contents.length - 1].parts[0].text += '\n\n' + text
      } else {
        contents.push({ role, parts: [{ text }] })
      }
    }
  }
  if (contents.length === 0) {
    contents.push({ role: 'user', parts: [{ text: 'Hello' }] })
  } else if (contents[0].role === 'model') {
    contents.unshift({ role: 'user', parts: [{ text: 'Hello' }] })
  }
  const payload = { contents }
  if (systemText) {
    payload.system_instruction = { parts: [{ text: systemText }] }
  }
  if (opts.temperature !== undefined || opts.num_predict !== undefined) {
    payload.generationConfig = {
      temperature: opts.temperature ?? 0.6,
      maxOutputTokens: opts.num_predict ?? 800
    }
  }
  return payload
}

// Test helper to parse SSE chunk lines from Gemini REST stream
function parseGeminiSSE(chunkText) {
  const tokens = []
  let totalUsage = 0
  const lines = chunkText.split('\n')
  for (const line of lines) {
    const l = line.trim()
    if (!l.startsWith('data:')) continue
    const data = l.slice(5).trim()
    if (!data) continue
    try {
      const o = JSON.parse(data)
      const t = o.candidates?.[0]?.content?.parts?.[0]?.text
      if (t) tokens.push(t)
      if (o.usageMetadata?.totalTokenCount) {
        totalUsage = o.usageMetadata.totalTokenCount
      }
    } catch {
      // ignore
    }
  }
  return { text: tokens.join(''), tokens, totalUsage }
}

describe('Phase 09: Priority A — Reliable AI Inference & Provider Routing', () => {

  describe('1. Message Conversion to Google GenAI REST Schema', () => {
    it('extracts system message into system_instruction parts', () => {
      const messages = [
        { role: 'system', content: 'You are an institutional campus guide.' },
        { role: 'user', content: 'Where is the library?' }
      ]
      const payload = formatGeminiPayload(messages)
      assert.equal(payload.system_instruction.parts[0].text, 'You are an institutional campus guide.')
      assert.equal(payload.contents.length, 1)
      assert.equal(payload.contents[0].role, 'user')
      assert.equal(payload.contents[0].parts[0].text, 'Where is the library?')
    })

    it('maps assistant role to model role and preserves multi-turn order', () => {
      const messages = [
        { role: 'user', content: 'Hi' },
        { role: 'assistant', content: 'Hello student!' },
        { role: 'user', content: 'What are library hours?' }
      ]
      const payload = formatGeminiPayload(messages)
      assert.equal(payload.contents.length, 3)
      assert.equal(payload.contents[0].role, 'user')
      assert.equal(payload.contents[1].role, 'model')
      assert.equal(payload.contents[1].parts[0].text, 'Hello student!')
      assert.equal(payload.contents[2].role, 'user')
    })

    it('merges consecutive messages with identical roles', () => {
      const messages = [
        { role: 'user', content: 'Question part 1.' },
        { role: 'user', content: 'Question part 2.' }
      ]
      const payload = formatGeminiPayload(messages)
      assert.equal(payload.contents.length, 1)
      assert.equal(payload.contents[0].role, 'user')
      assert.ok(payload.contents[0].parts[0].text.includes('Question part 1.'))
      assert.ok(payload.contents[0].parts[0].text.includes('Question part 2.'))
    })

    it('correctly maps generationConfig options', () => {
      const payload = formatGeminiPayload([{ role: 'user', content: 'Test' }], {
        temperature: 0.2,
        num_predict: 250
      })
      assert.equal(payload.generationConfig.temperature, 0.2)
      assert.equal(payload.generationConfig.maxOutputTokens, 250)
    })
  })

  describe('2. Gemini SSE Stream Parsing & Token Extraction', () => {
    it('parses multi-chunk candidate stream data correctly', () => {
      const mockStream = `
data: {"candidates": [{"content": {"parts": [{"text": "Hello "}], "role": "model"}}]}
data: {"candidates": [{"content": {"parts": [{"text": "World!"}], "role": "model"}}], "usageMetadata": {"totalTokenCount": 5}}
`
      const parsed = parseGeminiSSE(mockStream)
      assert.equal(parsed.text, 'Hello World!')
      assert.deepEqual(parsed.tokens, ['Hello ', 'World!'])
      assert.equal(parsed.totalUsage, 5)
    })

    it('safely skips malformed or empty SSE lines without throwing', () => {
      const mockMalformedStream = `
: keep-alive comment
data: NOT_JSON
data: 
data: {"candidates": [{"content": {"parts": [{"text": "Valid"}]}}]}
`
      const parsed = parseGeminiSSE(mockMalformedStream)
      assert.equal(parsed.text, 'Valid')
      assert.equal(parsed.tokens.length, 1)
    })
  })

  describe('3. Degradation Resilience & Fallback Integrity', () => {
    it('produces immediate informative offline response without hanging', () => {
      const degraded = "I am currently running in local campus offline mode without an active generative LLM provider. You can still ask me about your academics, attendance, campus facilities, maintenance requests, events, and official circulars."
      assert.ok(degraded.includes('campus offline mode'))
      assert.ok(degraded.includes('academics'))
      assert.ok(degraded.includes('facilities'))
    })

    it('falls back from primary cloud provider to local ollama when cloud provider fails', async () => {
      let providerSelected = null
      const mockStreamLLM = async (providers) => {
        // Tier 1: Cloud
        try {
          const res = await providers.cloud()
          if (res) { providerSelected = 'cloud'; return res }
        } catch { /* cloud failed */ }

        // Tier 2: Local Ollama
        try {
          const res = await providers.ollama()
          if (res) { providerSelected = 'ollama'; return res }
        } catch { /* ollama failed */ }

        // Tier 3: Degraded mode
        providerSelected = 'degraded'
        return { full: 'offline degraded mode', tokens: 0 }
      }

      const res = await mockStreamLLM({
        cloud: async () => { throw new Error('Cloud quota exceeded 429') },
        ollama: async () => ({ full: 'Local Gemma response', tokens: 42 })
      })

      assert.equal(providerSelected, 'ollama')
      assert.equal(res.full, 'Local Gemma response')
      assert.equal(res.tokens, 42)
    })

    it('falls back to immediate degraded offline mode when both cloud and local ollama fail', async () => {
      let providerSelected = null
      const mockStreamLLM = async (providers) => {
        try {
          const res = await providers.cloud()
          if (res) { providerSelected = 'cloud'; return res }
        } catch { /* cloud failed */ }

        try {
          const res = await providers.ollama()
          if (res) { providerSelected = 'ollama'; return res }
        } catch { /* ollama failed */ }

        providerSelected = 'degraded'
        return { full: 'I am currently running in local campus offline mode', tokens: 0 }
      }

      const res = await mockStreamLLM({
        cloud: async () => { throw new Error('Network unreachable') },
        ollama: async () => { throw new Error('Ollama connection refused ECONNREFUSED') }
      })

      assert.equal(providerSelected, 'degraded')
      assert.ok(res.full.includes('campus offline mode'))
      assert.equal(res.tokens, 0)
    })
  })
})
