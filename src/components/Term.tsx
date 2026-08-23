import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { lookupTerm } from '../data'

type Position = { top: number; left: number; placement: 'top' | 'bottom' }

const TOOLTIP_WIDTH = 272

type TermProps = {
  term: string
}

export function Term({ term }: TermProps) {
  const definition = lookupTerm(term)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<Position>({ top: 0, left: 0, placement: 'top' })
  const wrapRef = useRef<HTMLSpanElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const tooltipId = useId()

  const updatePosition = useCallback(() => {
    const rect = buttonRef.current?.getBoundingClientRect()
    if (!rect) return
    const width = Math.min(TOOLTIP_WIDTH, window.innerWidth - 24)
    const left = Math.min(
      Math.max(12, rect.left + rect.width / 2 - width / 2),
      window.innerWidth - width - 12
    )
    const placeTop = rect.top > 180
    setPosition({
      top: placeTop ? rect.top - 8 : rect.bottom + 8,
      left,
      placement: placeTop ? 'top' : 'bottom'
    })
  }, [])

  useLayoutEffect(() => {
    if (open) updatePosition()
  }, [open, updatePosition])

  useEffect(() => {
    if (!open) return
    const onDocClick = (event: MouseEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const onReflow = () => setOpen(false)
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    window.addEventListener('resize', onReflow)
    window.addEventListener('scroll', onReflow, true)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', onReflow)
      window.removeEventListener('scroll', onReflow, true)
    }
  }, [open])

  if (!definition) return <span>{term}</span>

  return (
    <span ref={wrapRef} className="inline" data-no-flip>
      <button
        ref={buttonRef}
        type="button"
        className="term-underline text-slate-100"
        aria-describedby={open ? tooltipId : undefined}
        onClick={(event) => {
          event.stopPropagation()
          setOpen((v) => !v)
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {term}
      </button>
      {open &&
        createPortal(
          <span
            id={tooltipId}
            role="tooltip"
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
              width: Math.min(TOOLTIP_WIDTH, window.innerWidth - 24),
              transform: position.placement === 'top' ? 'translateY(-100%)' : undefined
            }}
            className="panel z-50 block bg-[#141a28] p-3 text-xs leading-relaxed text-slate-300
                       shadow-2xl animate-fadeIn"
            onClick={(event) => event.stopPropagation()}
          >
            <span className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-agent">
              {term}
            </span>
            {definition}
          </span>,
          document.body
        )}
    </span>
  )
}
