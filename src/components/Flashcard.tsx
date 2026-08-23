import type { ReactNode } from 'react'
import type { Card, Module } from '../types'
import { RichText } from './RichText'

type FlashcardProps = {
  card: Card
  module: Module
  index: number
  total: number
  flipped: boolean
  onFlip: () => void
}

export function Flashcard({ card, module, index, total, flipped, onFlip }: FlashcardProps) {
  return (
    <div className="flip-scene h-[440px] sm:h-[460px]">
      <div className={`flip-inner relative h-full w-full ${flipped ? 'is-flipped' : ''}`}>
        <Face
          hidden={flipped}
          className="flip-face"
          module={module}
          path={`~/devops/${module.id}/card-${index + 1}.q`}
          counter={`${index + 1}/${total}`}
          onClick={onFlip}
        >
          <div className="flex h-full flex-col items-center justify-center gap-6 px-6 text-center">
            <h2 className="text-xl font-medium leading-snug text-slate-100 sm:text-2xl">
              {card.question}
            </h2>
            <span className="font-mono text-xs text-slate-500">нажмите, чтобы перевернуть</span>
          </div>
        </Face>

        <Face
          hidden={!flipped}
          className="flip-face flip-face-back"
          module={module}
          path={`~/devops/${module.id}/card-${index + 1}.a`}
          counter={`${index + 1}/${total}`}
          onClick={onFlip}
        >
          <div className="h-full space-y-4 overflow-y-auto px-5 py-5">
            <p className="text-[15px] leading-relaxed text-slate-300">
              <RichText text={card.answer} />
            </p>
            <pre className="code-block">{card.example}</pre>
          </div>
        </Face>
      </div>
    </div>
  )
}

type FaceProps = {
  children: ReactNode
  className: string
  hidden: boolean
  module: Module
  path: string
  counter: string
  onClick: () => void
}

function Face({ children, className, hidden, module, path, counter, onClick }: FaceProps) {
  return (
    <div
      className={`${className} panel absolute inset-0 cursor-pointer overflow-hidden`}
      style={{ borderColor: `${module.color}33` }}
      aria-hidden={hidden}
      onClick={(event) => {
        const target = event.target as HTMLElement
        if (target.closest('[data-no-flip]')) return
        onClick()
      }}
    >
      <div className="flex items-center gap-2 border-b border-border bg-black/20 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber" />
        <span className="h-2.5 w-2.5 rounded-full bg-teal" />
        <span className="ml-2 truncate font-mono text-[11px]" style={{ color: `${module.color}cc` }}>
          {path}
        </span>
        <span className="ml-auto font-mono text-[11px] text-slate-500">{counter}</span>
      </div>
      <div className="h-[calc(100%-37px)]">{children}</div>
    </div>
  )
}
