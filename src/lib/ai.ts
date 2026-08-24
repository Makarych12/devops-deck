import type { Card, Module } from '../types'

const REQUEST_TIMEOUT_MS = 30000

export type Provider = 'gemini' | 'openrouter'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export type AskOptions = {
  provider: Provider
  apiKey: string
  model: string
  history: ChatMessage[]
  card?: Card | null
  module?: Module | null
  signal?: AbortSignal
}

export const SYSTEM_PROMPT =
  'Ты — наставник по DevOps и IT, объясняешь простыми словами новичку, используешь аналогии, отвечаешь кратко.'

function buildSystem(card?: Card | null, module?: Module | null): string {
  if (!card) return SYSTEM_PROMPT
  return [
    SYSTEM_PROMPT,
    '',
    'Контекст текущей карточки, которую изучает пользователь:',
    module ? `Модуль: ${module.title}` : '',
    `Вопрос: ${card.question}`,
    `Ответ: ${card.answer.replace(/\{\{term:([^}]+)\}\}/g, '$1')}`,
    `Пример:\n${card.example}`
  ]
    .filter(Boolean)
    .join('\n')
}

async function askGemini(
  apiKey: string,
  model: string,
  system: string,
  history: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const contents = history.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }))

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { maxOutputTokens: 1000 }
    }),
    signal
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    let detail = text
    try {
      detail = JSON.parse(text)?.error?.message ?? text
    } catch {
      /* not JSON */
    }
    throw new Error(`Gemini API ${response.status}: ${detail || 'запрос отклонён'}`)
  }

  const data = await response.json()
  return (data.candidates ?? [])
    .flatMap((c: { content?: { parts?: Array<{ text?: string }> } }) =>
      (c.content?.parts ?? []).map((p) => p.text).filter(Boolean)
    )
    .join('\n')
    .trim()
}

async function askOpenRouter(
  apiKey: string,
  model: string,
  system: string,
  history: ChatMessage[],
  signal?: AbortSignal
): Promise<string> {
  const messages = [
    { role: 'system', content: system },
    ...history.map((m) => ({ role: m.role, content: m.content }))
  ]

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': window.location.origin,
      'X-Title': 'DevOps Deck'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 1000
    }),
    signal
  })

  if (!response.ok) {
    const text = await response.text().catch(() => '')
    let detail = text
    try {
      detail = JSON.parse(text)?.error?.message ?? text
    } catch {
      /* not JSON */
    }
    if (response.status === 404) {
      throw new Error(`OpenRouter: модель «${model}» недоступна. Проверьте: 1) имя модели на openrouter.ai/models 2) настройки приватности — openrouter.ai/settings/privacy (включите Prompt training) 3) баланс аккаунта.`)
    }
    throw new Error(`OpenRouter API ${response.status}: ${detail || 'запрос отклонён'}`)
  }

  const data = await response.json()
  return (data.choices?.[0]?.message?.content ?? '').trim()
}

export async function askTutor(options: AskOptions): Promise<string> {
  const { provider, apiKey, model, history, card, module, signal } = options

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  if (signal?.aborted) {
    controller.abort()
  } else {
    signal?.addEventListener('abort', () => controller.abort(), { once: true })
  }

  try {
    const system = buildSystem(card, module)
    if (provider === 'gemini') {
      return await askGemini(apiKey, model, system, history, controller.signal)
    } else {
      return await askOpenRouter(apiKey, model, system, history, controller.signal)
    }
  } finally {
    clearTimeout(timer)
  }
}
