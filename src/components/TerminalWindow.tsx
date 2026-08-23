import type { ReactNode } from 'react'

type TerminalWindowProps = {
  path: string
  accent?: string
  className?: string
  children: ReactNode
  right?: ReactNode
}

export function TerminalWindow({ path, accent, className = '', children, right }: TerminalWindowProps) {
  return (
    <div className={`panel overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 border-b border-border bg-black/20 px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-red" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber" />
        <span className="h-2.5 w-2.5 rounded-full bg-teal" />
        <span
          className="ml-2 truncate font-mono text-[11px] text-slate-500"
          style={accent ? { color: accent } : undefined}
        >
          {path}
        </span>
        {right && <div className="ml-auto flex items-center gap-2">{right}</div>}
      </div>
      {children}
    </div>
  )
}
