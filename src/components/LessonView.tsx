import type { Module } from '../types'
import { TerminalWindow } from './TerminalWindow'

type LessonViewProps = {
  module: Module
  done: number
  onStart: () => void
  onBack: () => void
  onReset: () => void
}

export function LessonView({ module, done, onStart, onBack, onReset }: LessonViewProps) {
  const total = module.cards.length

  return (
    <div className="space-y-4">
      <button type="button" onClick={onBack} className="font-mono text-xs text-slate-500 hover:text-slate-300">
        ← к списку модулей
      </button>

      <TerminalWindow
        path={`~/devops/${module.id}/lesson.md`}
        accent={module.color}
        right={<span className="font-mono text-[11px] text-slate-500">{done}/{total}</span>}
      >
        <div className="p-5">
          <h1 className="text-xl font-bold" style={{ color: module.color }}>
            {module.order}. {module.title}
          </h1>
          <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-slate-300">
            {module.lesson.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onStart}
              className="btn text-bg"
              style={{ background: module.color, borderColor: module.color }}
            >
              Начать карточки ({total})
            </button>
            {done > 0 && (
              <button type="button" onClick={onReset} className="btn text-slate-400">
                Сбросить прогресс модуля
              </button>
            )}
          </div>
        </div>
      </TerminalWindow>
    </div>
  )
}
