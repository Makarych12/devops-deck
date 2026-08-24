const PING_URL = 'https://generativelanguage.googleapis.com'
const PING_TIMEOUT_MS = 2500

export async function probeOnline(timeoutMs = PING_TIMEOUT_MS): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    await fetch(PING_URL, {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    })
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}
