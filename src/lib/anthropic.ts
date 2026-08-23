import type { Card, Module } from '../types'

const API_URL = 'https://api.anthropic.com/v1/messages'
const REQUEST_TIMEOUT_MS = 30000

export const SYSTEM_PROMPT =
  'Ты — наставник по DevOps, объясняешь простыми словами новичку, используешь аналогии, отвечаешь кратко.'

export type ChatMessage = { role: 'user' | 'assistant'; content: string }

export type AskOptions = {
  apiKey: string
  model: string
  history: ChatMessage[]
  card?: Card | null
  module?: Module | null
  signal?: AbortSignal
}

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

export async function askTutor(options: AskOptions): Promise<string> {
  const { apiKey, model, history, card, module, signal } = options

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model,
        max_tokens: 1000,
        system: buildSystem(card, module),
        messages: history.map((m) => ({ role: m.role, content: m.content }))
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      let detail = text
      try {
        detail = JSON.parse(text)?.error?.message ?? text
      } catch {
        /* ответ не JSON — оставляем как есть */
      }
      throw new Error(`Anthropic API ${response.status}: ${detail || 'запрос отклонён'}`)
    }

    const data = (await response.json()) as { content?: Array<{ type: string; text?: string }> }
    return (data.content ?? [])
      .filter((block) => block.type === 'text' && block.text)
      .map((block) => block.text as string)
      .join('\n')
      .trim()
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}
