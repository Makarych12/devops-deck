import { useEffect, useState } from 'react'
import { DEFAULT_MODEL, type Settings } from '../lib/db'

type SettingsDialogProps = {
  open: boolean
  settings: Settings
  onSave: (settings: Settings) => void
  onClose: () => void
}

export function SettingsDialog({ open, settings, onSave, onClose }: SettingsDialogProps) {
  const [apiKey, setApiKey] = useState(settings.apiKey)
  const [model, setModel] = useState(settings.model)

  useEffect(() => {
    if (open) {
      setApiKey(settings.apiKey)
      setModel(settings.model)
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="panel w-full max-w-lg animate-fadeIn p-5"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-100">Настройки ИИ-наставника</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          Ключ хранится <span className="text-slate-200">только в вашем браузере</span> (IndexedDB),
          никуда не отправляется, кроме прямых запросов к api.anthropic.com. Без ключа приложение
          работает полностью — просто без ИИ-подсказок.
        </p>

        <label className="mt-4 block text-xs font-medium text-slate-400">
          Anthropic API-ключ
          <input
            type="password"
            value={apiKey}
            onChange={(event) => setApiKey(event.target.value)}
            placeholder="sk-ant-..."
            autoComplete="off"
            spellCheck={false}
            className="mt-1 w-full rounded-lg border border-border bg-black/30 px-3 py-2 font-mono text-[13px]
                       text-slate-200 placeholder:text-slate-600 focus:border-agent/60 focus:outline-none"
          />
        </label>

        <label className="mt-3 block text-xs font-medium text-slate-400">
          Модель
          <input
            type="text"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder={DEFAULT_MODEL}
            spellCheck={false}
            className="mt-1 w-full rounded-lg border border-border bg-black/30 px-3 py-2 font-mono text-[13px]
                       text-slate-200 placeholder:text-slate-600 focus:border-agent/60 focus:outline-none"
          />
        </label>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            className="btn flex-1 border-agent/50 text-agent"
            onClick={() => onSave({ apiKey: apiKey.trim(), model: model.trim() || DEFAULT_MODEL })}
          >
            Сохранить
          </button>
          <button type="button" className="btn" onClick={onClose}>
            Отмена
          </button>
          {settings.apiKey && (
            <button
              type="button"
              className="btn border-red/40 text-red"
              onClick={() => onSave({ apiKey: '', model })}
            >
              Удалить ключ
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
