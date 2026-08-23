import { useCallback, useEffect, useState } from 'react'
import { loadKnown, saveKnown } from '../lib/db'

export function useProgress() {
  const [known, setKnown] = useState<Set<string>>(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    loadKnown().then((stored) => {
      if (!alive) return
      setKnown(stored)
      setLoaded(true)
    })
    return () => {
      alive = false
    }
  }, [])

  const markKnown = useCallback((cardId: string) => {
    setKnown((prev) => {
      if (prev.has(cardId)) return prev
      const next = new Set(prev)
      next.add(cardId)
      void saveKnown(next)
      return next
    })
  }, [])

  const markRepeat = useCallback((cardId: string) => {
    setKnown((prev) => {
      if (!prev.has(cardId)) return prev
      const next = new Set(prev)
      next.delete(cardId)
      void saveKnown(next)
      return next
    })
  }, [])

  const resetModule = useCallback((cardIds: string[]) => {
    setKnown((prev) => {
      const next = new Set(prev)
      cardIds.forEach((id) => next.delete(id))
      void saveKnown(next)
      return next
    })
  }, [])

  return { known, loaded, markKnown, markRepeat, resetModule }
}
