import { useEffect, useState } from 'react'
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_OPENROUTER_MODEL,
  type Provider,
  type Settings
} from '../lib/db'

const OPENROUTER_MODELS = [
  { id: 'deepseek/deepseek-v3.2', label: 'DeepSeek V3.2 — дешёвый, умный' },
  { id: 'deepseek/deepseek-chat-v3-0324', label: 'DeepSeek V3 0324 — дешёвый чат' },
  { id: 'deepseek/deepseek-r1', label: 'DeepSeek R1 — reasoning, дороже' },
  { id: 'google/gemini-2.0-flash-001', label: 'Gemini 2.0 Flash — быстро' },
  { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B — бесплатно с лимитом' },
  { id: 'qwen/qwen-2.5-72b-instruct', label: 'Qwen 2.5 72B — дешёвый' },
  { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet — дорого, качественно' },
  { id: 'openai/gpt-4o-mini', label: 'GPT-4o mini — дёшево' }
]

const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash — быстро, бесплатно' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash — новее' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro — умнее, лимит больше' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash — стабильный' }
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
