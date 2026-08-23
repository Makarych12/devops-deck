import { useEffect, useState } from 'react'
import type { Module } from '../types'
import { Flashcard } from './Flashcard'

type DeckProps = {
  module: Module
  index: number
  known: Set<string>
  onIndexChange: (index: number) => void
  onKnow: (cardId: string) => void
  onRepeat: (cardId: string) => void
  onBack: () => void
}

export function Deck({ module, index, known, onIndexChange, onKnow, onRepeat, onBack }: DeckProps) {
  const [flipped, setFlipped] = useState(false)
  const total = module.cards.length
  const card = module.cards[index]

  useEffect(() => {
    setFlipped(false)
  }, [card.id])

  const go = (delta: number) => {
    const next = Math.min(Math.max(index + delta, 0), total - 1)
    onIndexChange(next)
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      if (event.key === 'ArrowRight') go(1)
      if (event.key === 'ArrowLeft') go(-1)
      if (event.key === ' ') {
        event.preventDefault()
        setFlipped((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const handleKnow = () => {
    onKnow(card.id)
    if (index < total - 1) go(1)
  }

  const handleRepeat = () => {
    onRepeat(card.id)
    if (index < total - 1) go(1)
  }

  const doneCount = module.cards.filter((c) => known.has(c.id)).length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="font-mono text-xs text-slate-500 hover:text-slate-300">
          ← {module.title}
        </button>
        <span className="ml-auto font-mono text-xs text-slate-500">
          знаю: {doneCount}/{total}
        </span>
      </div>

      <Flashcard
        card={card}
        module={module}
        index={index}
        total={total}
        flipped={flipped}
        onFlip={() => setFlipped((v) => !v)}
      />

      <div className="flex items-center justify-center gap-1.5" aria-hidden="true">
        {module.cards.map((c, i) => (
          <span
            key={c.id}
            className="h-1.5 rounded-full transition-all duration-200"
            style={{
              width: i === index ? 18 : 6,
              background: known.has(c.id) ? module.color : i === index ? '#7C8CFF' : '#1E2636'
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button type="button" className="btn" onClick={() => go(-1)} disabled={index === 0}>
          ←
        </button>

        <button
          type="button"
          className="btn flex-1 border-red/40 text-red hover:bg-red/10"
          onClick={handleRepeat}
        >
          Повторить
        </button>
        <button
          type="button"
          className="btn flex-1 border-teal/40 text-teal hover:bg-teal/10"
          onClick={handleKnow}
        >
          Знаю
        </button>

        <button type="button" className="btn" onClick={() => go(1)} disabled={index === total - 1}>
          →
        </button>
      </div>

      {doneCount === total && (
        <div className="panel border-teal/40 bg-teal/5 p-4 text-center text-sm text-teal">
          Модуль пройден целиком. Можно возвращаться к нему для повторения.
        </div>
      )}
    </div>
  )
}
