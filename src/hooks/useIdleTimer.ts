import { useEffect, useRef, useCallback } from 'react'

/**
 * Calls onIdle() after `timeoutMs` ms of no user interaction.
 * Any pointer or keyboard event resets the timer.
 * Call the returned `reset` function to manually reset (e.g. when the
 * screensaver is dismissed by a tap — the tap itself resets the timer,
 * but calling reset() explicitly from onDismiss keeps things clear).
 */
export function useIdleTimer(timeoutMs: number, onIdle: () => void) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onIdleRef = useRef(onIdle)
  onIdleRef.current = onIdle

  const reset = useCallback(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onIdleRef.current(), timeoutMs)
  }, [timeoutMs])

  useEffect(() => {
    const events = ['pointerdown', 'keydown'] as const

    const handleActivity = () => reset()

    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }))

    // Start the timer immediately on mount
    reset()

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity))
      if (timerRef.current !== null) clearTimeout(timerRef.current)
    }
  }, [reset])

  return { reset }
}
