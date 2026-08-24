import { useState } from 'react'

type CodeBlockProps = {
  code: string
}

export function CodeBlock({ code }: CodeBlockProps) {
  const [copiedLine, setCopiedLine] = useState<number | null>(null)
  const [copiedAll, setCopiedAll] = useState(false)

  const lines = code.split('\n')

  const copyLine = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLine(index)
      setTimeout(() => setCopiedLine(null), 1200)
    } catch {
      /* clipboard может быть недоступен */
    }
  }

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 1200)
    } catch {
      /* clipboard может быть недоступен */
    }
  }

  return (
    <div className="code-block group relative" data-no-flip>
      <button
        type="button"
        data-no-flip
        onClick={(e) => {
          e.stopPropagation()
          void copyAll()
        }}
        className="absolute right-2 top-2 z-10 rounded border border-border bg-black/50 px-2 py-0.5
                   font-mono text-[10px] text-slate-400 opacity-0 transition-opacity
                   hover:text-slate-200 group-hover:opacity-100"
      >
        {copiedAll ? '✓ скопировано' : 'копировать всё'}
      </button>
      <div className="space-y-0">
        {lines.map((line, i) => (
          <div
            key={i}
            data-no-flip
            onClick={(e) => {
              e.stopPropagation()
              if (line.trim()) void copyLine(line, i)
            }}
            className={`flex items-start gap-2 rounded px-1 py-0.5 transition-colors ${
              line.trim()
                ? 'cursor-pointer hover:bg-white/5'
                : ''
            }`}
            title={line.trim() ? 'нажмите, чтобы скопировать' : ''}
          >
            <span className="select-none text-slate-600 w-6 shrink-0 text-right">
              {copiedLine === i ? '✓' : ''}
            </span>
            <span className="flex-1 break-words">{line || ' '}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
