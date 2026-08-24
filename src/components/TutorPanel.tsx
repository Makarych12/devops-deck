import { useEffect, useRef, useState } from 'react'
import { askTutor, type ChatMessage, type Provider } from '../lib/ai'
import type { Settings } from '../lib/db'
import type { Card, Module } from '../types'

type TutorPanelProps = {
  online: boolean
  checking: boolean
  settings: Settings
  card: Card | null
  module: Module | null
  onRecheck: () => void
  onOpenSettings: () => void
  onSwitchProvider: (provider: Provider) => void
}

const SUGGESTIONS = [
  'Объясни ещё проще, как ребёнку',
  'Приведи пример из реальной работы',
  'Какие тут частые ошибки новичков?'
]

export function TutorPanel({
  online,
  checking,
  settings,
  card,
  module,
  onRecheck,
  onOpenSettings,
  onSwitchProvider
}: TutorPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const { provider } = settings
  const apiKey = provider === 'gemini' ? settings.geminiApiKey : settings.openrouterApiKey
  const model = provider === 'gemini' ? settings.geminiModel : settings.openrouterModel
  const available = online && Boolean(apiKey)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, pending])

  useEffect(() => {
    if (!online) {
      abortRef.current?.abort()
      abortRef.current = null
      setPending(false)
    }
  }, [online])

  useEffect(() => () => { abortRef.current?.abort() }, [])

  const send = async (text: string) => {
    const question = text.trim()
    if (!question || pending || !available) return

    const history: ChatMessage[] = [...messages, { role: 'user', content: question }]
    setMessages(history)
    setInput('')
    setError(null)
    setPending(true)

    const controller = new AbortController()
    abortRef.current = controller

    try {
      const reply = await askTutor({
        provider,
        apiKey,
        model,
        history,
        card,
        module,
        signal: controller.signal
      })
      if (controller.signal.aborted) return
      setMessages(prev => [...prev, { role: 'assistant', content: reply || '(пустой ответ)' }])
    } catch (err) {
      if (controller.signal.aborted) {
        setError('Запрос прерван: сеть пропала или истёк таймаут.')
      } else {
        setError(err instanceof Error ? err.message : 'Не удалось получить ответ')
      }
    } finally {
      if (abortRef.current === controller) abortRef.current = null
      setPending(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <span className="relative flex h-8 w-8 items-center justify-center">
          <span
            className={`absolute inset-0 rounded-full bg-agent/30 ${pending ? 'animate-orb' : ''}`}
          />
          <span className="relative h-2.5 w-2.5 rounded-full bg-agent" />
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-slate-100">ИИ-наставник</h2>
          <p className="truncate font-mono text-[11px] text-slate-500">
            {available ? `${provider} · ${model}` : online ? 'нужен API-ключ' : 'офлайн-режим'}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {available && messages.length > 0 && (
            <button
              type="button"
              data-no-flip
              onClick={(e) => {
                e.stopPropagation()
                setMessages([])
                setError(null)
              }}
              className="font-mono text-[10px] text-slate-500 transition-colors hover:text-slate-300"
              title="Очистить чат"
            >
              ✕
            </button>
          )}
          {available && (
            <div className="flex rounded-lg border border-border bg-black/30 p-0.5" data-no-flip>
              {(['gemini', 'openrouter'] as Provider[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  data-no-flip
                  onClick={(e) => {
                    e.stopPropagation()
                    onSwitchProvider(p)
                  }}
                  className={`rounded px-2 py-0.5 font-mono text-[10px] transition-colors ${
                    provider === p ? 'bg-agent/20 text-agent' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {p === 'gemini' ? 'Gemini' : 'OpenRouter'}
                </button>
              ))}
            </div>
          )}
          <span
            className={`h-2 w-2 shrink-0 rounded-full transition-colors duration-300 ${
              online ? 'bg-teal' : 'bg-red'
            }`}
            title={checking ? 'проверка сети…' : online ? 'сеть есть' : 'сети нет'}
          />
        </div>
      </header>

      {!online ? (
        <OfflineBanner checking={checking} onRecheck={onRecheck} />
      ) : !apiKey ? (
        <NoKeyBanner provider={provider} onOpenSettings={onOpenSettings} />
      ) : (
        <>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-xs leading-relaxed text-slate-400">
                  Спросите что угодно про текущую карточку — наставник видит её вопрос, ответ и пример.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="rounded-full border border-border px-3 py-1 text-[11px] text-slate-400
                                 transition-colors hover:border-agent/50 hover:text-slate-200"
                      onClick={() => void send(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message, i) => (
              <div
                key={i}
                className={`max-w-[92%] whitespace-pre-wrap rounded-lg px-3 py-2 text-[13px] leading-relaxed ${
                  message.role === 'user'
                    ? 'ml-auto border border-border bg-white/5 text-slate-200'
                    : 'border border-agent/25 bg-agent/10 text-slate-200'
                }`}
              >
                {message.content}
              </div>
            ))}

            {pending && (
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span className="h-2 w-2 animate-orb rounded-full bg-agent" />
                наставник печатает…
              </div>
            )}

            {error && (
              <div className="space-y-2">
                <div className="rounded-lg border border-red/40 bg-red/10 px-3 py-2 text-xs text-red">
                  {error}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const lastUser = [...messages].reverse().find(m => m.role === 'user')
                    if (lastUser) {
                      setMessages(prev => prev.slice(0, prev.findIndex(m => m === lastUser)))
                      void send(lastUser.content)
                    }
                  }}
                  className="btn w-full border-red/40 text-red"
                >
                  Повторить запрос
                </button>
              </div>
            )}
          </div>

          <form
            className="flex items-end gap-2 border-t border-border p-3"
            onSubmit={(event) => {
              event.preventDefault()
              void send(input)
            }}
          >
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  void send(input)
                }
              }}
              rows={2}
              placeholder="Спросить про эту карточку…"
              className="min-h-[44px] flex-1 resize-none rounded-lg border border-border bg-black/30 px-3 py-2
                         text-[13px] text-slate-200 placeholder:text-slate-600 focus:border-agent/60
                         focus:outline-none"
            />
            <button type="submit" className="btn border-agent/50 text-agent" disabled={pending || !input.trim()}>
              →
            </button>
          </form>
        </>
      )}
    </div>
  )
}

function OfflineBanner({ checking, onRecheck }: { checking: boolean; onRecheck: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-3 p-5">
      <div className="panel border-amber/40 bg-amber/5 p-4">
        <p className="font-mono text-[11px] uppercase tracking-wide text-amber">офлайн-режим</p>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
          Карточки и уроки доступны, ИИ-подсказки недоступны без интернета. Подсказки по терминам
          продолжают работать — они хранятся локально.
        </p>
        <button type="button" className="btn mt-3 w-full" onClick={onRecheck} disabled={checking}>
          {checking ? 'Проверяю…' : 'Повторить проверку'}
        </button>
      </div>
    </div>
  )
}

function NoKeyBanner({ provider, onOpenSettings }: { provider: Provider; onOpenSettings: () => void }) {
  const label = provider === 'gemini' ? 'Google Gemini' : 'OpenRouter'
  const hint = provider === 'gemini'
    ? 'Получите бесплатный ключ в Google AI Studio (aistudio.google.com).'
    : 'Получите ключ на openrouter.ai — работает с множеством моделей.'
  return (
    <div className="flex flex-1 flex-col justify-center gap-3 p-5">
      <div className="panel border-agent/40 bg-agent/5 p-4">
        <p className="font-mono text-[11px] uppercase tracking-wide text-agent">нужен API-ключ</p>
        <p className="mt-2 text-[13px] leading-relaxed text-slate-300">
          Сеть есть, но ИИ-наставнику нужен ключ {label}. {hint} Ключ хранится только в этом
          браузере (IndexedDB).
        </p>
        <button type="button" className="btn mt-3 w-full border-agent/50 text-agent" onClick={onOpenSettings}>
          Добавить ключ
        </button>
      </div>
    </div>
  )
}
