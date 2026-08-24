import { useCallback, useEffect, useRef, useState } from 'react'
import { probeOnline } from '../lib/network'

const RECHECK_INTERVAL_MS = 30000

export function useOnlineStatus() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : false)
  const [checking, setChecking] = useState(true)
  const inFlight = useRef(false)
  const isFirstCheck = useRef(true)

  const check = useCallback(async () => {
    if (inFlight.current) return
    inFlight.current = true
    if (isFirstCheck.current) setChecking(true)
    const result = await probeOnline()
    inFlight.current = false
    setOnline(result)
    if (isFirstCheck.current) {
      setChecking(false)
      isFirstCheck.current = false
    }
  }, [])

  useEffect(() => {
    void check()

    const onOnline = () => void check()
    const onOffline = () => setOnline(false)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void check()
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    document.addEventListener('visibilitychange', onVisible)
    const timer = window.setInterval(() => void check(), RECHECK_INTERVAL_MS)

    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      document.removeEventListener('visibilitychange', onVisible)
      window.clearInterval(timer)
    }
  }, [check])

  return { online, checking, recheck: check }
}
