import { useEffect, useState } from 'react'
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_OPENROUTER_MODEL,
  type Provider,
  type Settings
} from '../lib/db'

const OPENROUTER_MODELS = [
  { id: 'deepseek/deepseek-v4-flash-latest', label: 'DeepSeek V4 Flash (latest) — #1 на OpenRouter, дешёвый' },
  { id: 'deepseek/deepseek-v4-flash-0731', label: 'DeepSeek V4 Flash 0731 — стабильно, дешёвый' },
  { id: 'deepseek/deepseek-v4-pro-0423', label: 'DeepSeek V4 Pro — умнее, дороже' },
  { id: 'openai/gpt-5.6-luna', label: 'GPT-5.6 Luna — топовый от OpenAI' },
  { id: 'openai/gpt-5.6-sol', label: 'GPT-5.6 Sol — лучший для кода' },
  { id: 'google/gemini-3.7-flash', label: 'Gemini 3.7 Flash — быстро, дёшево' },
  { id: 'anthropic/claude-opus-5', label: 'Claude Opus 5 — топовый Anthropic, дорого' },
  { id: 'anthropic/claude-sonnet-4', label: 'Claude Sonnet 4 — баланс цены и качества' },
  { id: 'x-ai/grok-4.6', label: 'Grok 4.6 — от xAI' },
  { id: 'nvidia/nemotron-3-ultra:free', label: 'Nemotron 3 Ultra — бесплатно, 1M контекст' },
  { id: 'z-ai/glm-5.2', label: 'GLM 5.2 — от Z.ai, дешёвый' },
  { id: 'meta/muse-spark-1.2', label: 'Muse Spark 1.2 — reasoning от Meta' },
  { id: 'stealth/ox-alpha', label: 'Ox Alpha — бесплатно, reasoning' }
]

const GEMINI_MODELS = [
  { id: 'gemini-3.7-flash', label: 'Gemini 3.7 Flash — новейший (авг 2026), бесплатно' },
  { id: 'gemini-3.6-flash', label: 'Gemini 3.6 Flash — стабильно, бесплатно' },
  { id: 'gemini-3.5-flash', label: 'Gemini 3.5 Flash — проверенный, бесплатно' },
  { id: 'gemini-3.5-flash-lite', label: 'Gemini 3.5 Flash-Lite — самый дешёвый' },
  { id: 'gemini-3.1-pro-preview', label: 'Gemini 3.1 Pro Preview — умнейший, лимит' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro — до окт 2026' }
]

type SettingsDialogProps = {
  open: boolean
  settings: Settings
  onSave: (settings: Settings) => void
  onClose: () => void
}

export function SettingsDialog({ open, settings, onSave, onClose }: SettingsDialogProps) {
  const [provider, setProvider] = useState<Provider>(settings.provider)
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey)
  const [geminiModel, setGeminiModel] = useState(settings.geminiModel)
  const [openrouterApiKey, setOpenrouterApiKey] = useState(settings.openrouterApiKey)
  const [openrouterModel, setOpenrouterModel] = useState(settings.openrouterModel)

  useEffect(() => {
    if (open) {
      setProvider(settings.provider)
      setGeminiApiKey(settings.geminiApiKey)
      setGeminiModel(settings.geminiModel)
      setOpenrouterApiKey(settings.openrouterApiKey)
      setOpenrouterModel(settings.openrouterModel)
    }
  }, [open, settings])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const handleSave = () => {
    onSave({
      provider,
      geminiApiKey: geminiApiKey.trim(),
      geminiModel: geminiModel.trim() || DEFAULT_GEMINI_MODEL,
      openrouterApiKey: openrouterApiKey.trim(),
      openrouterModel: openrouterModel.trim() || DEFAULT_OPENROUTER_MODEL
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-lg animate-fadeIn overflow-y-auto p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-100">Настройки ИИ-наставника</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          Ключи хранятся <span className="text-slate-200">только в вашем браузере</span> (IndexedDB)
          и отправляются напрямую в API провайдера. Без ключа приложение работает полностью —
          просто без ИИ-подсказок.
        </p>

        <div className="mt-4">
          <p className="text-xs font-medium text-slate-400">Провайдер по умолчанию</p>
          <div className="mt-1 flex gap-2">
            {(['gemini', 'openrouter'] as Provider[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setProvider(p)}
                className={`btn flex-1 ${
                  provider === p ? 'border-agent/50 text-agent' : ''
                }`}
              >
                {p === 'gemini' ? 'Google Gemini' : 'OpenRouter'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-slate-200">Google Gemini</h3>
          <p className="mt-1 text-[11px] text-slate-500">
            Бесплатный ключ: aistudio.google.com → Get API Key
          </p>
          <label className="mt-3 block text-xs font-medium text-slate-400">
            API-ключ
            <input
              type="password"
              value={geminiApiKey}
              onChange={(event) => setGeminiApiKey(event.target.value)}
              placeholder="AIza..."
              autoComplete="off"
              spellCheck={false}
              className="mt-1 w-full rounded-lg border border-border bg-black/30 px-3 py-2 font-mono text-[13px]
                         text-slate-200 placeholder:text-slate-600 focus:border-agent/60 focus:outline-none"
            />
          </label>
          <label className="mt-3 block text-xs font-medium text-slate-400">
            Модель
            <select
              value={geminiModel}
              onChange={(event) => setGeminiModel(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-black/30 px-3 py-2 font-mono text-[13px]
                         text-slate-200 focus:border-agent/60 focus:outline-none"
            >
              {GEMINI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-3 rounded-lg border border-border p-4">
          <h3 className="text-sm font-medium text-slate-200">OpenRouter</h3>
          <p className="mt-1 text-[11px] text-slate-500">
            Ключ: openrouter.ai → Keys. Доступны сотни моделей.
          </p>
          <label className="mt-3 block text-xs font-medium text-slate-400">
            API-ключ
            <input
              type="password"
              value={openrouterApiKey}
              onChange={(event) => setOpenrouterApiKey(event.target.value)}
              placeholder="sk-or-v1-..."
              autoComplete="off"
              spellCheck={false}
              className="mt-1 w-full rounded-lg border border-border bg-black/30 px-3 py-2 font-mono text-[13px]
                         text-slate-200 placeholder:text-slate-600 focus:border-agent/60 focus:outline-none"
            />
          </label>
          <label className="mt-3 block text-xs font-medium text-slate-400">
            Модель
            <select
              value={openrouterModel}
              onChange={(event) => setOpenrouterModel(event.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-black/30 px-3 py-2 font-mono text-[13px]
                         text-slate-200 focus:border-agent/60 focus:outline-none"
            >
              {OPENROUTER_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
            </select>
          </label>
          <p className="mt-2 text-[11px] text-slate-500">
            Если нужной модели нет в списке — полный каталог: openrouter.ai/models
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className="btn flex-1 border-agent/50 text-agent"
            onClick={handleSave}
          >
            Сохранить
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  )
}
