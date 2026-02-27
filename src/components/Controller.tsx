import { useState, useEffect, useRef } from 'react'
import './Controller.css'
import logo from '../assets/images/logo.png'
import { STEPS, STEP_MAP } from '../sequence'
import type { ButtonAction } from '../sequence'
import { SplitChoice } from './SplitChoice'
import { Screensaver } from './Screensaver'
import { useIdleTimer } from '../hooks/useIdleTimer'

const IDLE_TIMEOUT_MS = 30_000 // 30 seconds — change this to adjust

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function Controller() {
  const [showScreensaver, setShowScreensaver] = useState(true)
  const [stepId, setStepId] = useState(STEPS[0].id)
  const [history, setHistory] = useState<string[]>([])
  const [holdState, setHoldState] = useState<{ key: string; progress: number } | null>(null)
  const [flashKey, setFlashKey] = useState<string | null>(null)
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const now = useClock()

  const step = STEP_MAP[stepId]

  // Show screensaver after idle timeout, from any screen
  useIdleTimer(IDLE_TIMEOUT_MS, () => setShowScreensaver(true))

  // Cancel hold and clear flash state whenever the step changes
  useEffect(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current)
      holdIntervalRef.current = null
    }
    setHoldState(null)
    setFlashKey(null)
  }, [stepId])

  function cancelHold() {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current)
      holdIntervalRef.current = null
    }
    setHoldState(null)
  }

  function startHold(key: string, duration: number, onComplete: () => void) {
    cancelHold()
    const startTime = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(100, (elapsed / duration) * 100)
      setHoldState({ key, progress })
      if (progress >= 100) {
        clearInterval(interval)
        holdIntervalRef.current = null
        setHoldState(null)
        onComplete()
      }
    }, 16) // ~60fps updates
    holdIntervalRef.current = interval
  }

  function dismissScreensaver() {
    // Reset to home whenever screensaver is dismissed
    setStepId(STEPS[0].id)
    setHistory([])
    setShowScreensaver(false)
  }

  function handleAction(action: ButtonAction) {
    if (action.type === 'goto') {
      setHistory((h) => [...h, stepId])
      setStepId(action.stepId)
    } else if (action.type === 'back') {
      setHistory((h) => {
        const prev = h[h.length - 1]
        if (prev === undefined) return h
        setStepId(prev)
        return h.slice(0, -1)
      })
    }
  }

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="app">

      {showScreensaver && (
        <Screensaver doorLabel="Door 2112" onDismiss={dismissScreensaver} />
      )}

      <div className="video-wrap">
        {step.type === 'choice' ? (
          <SplitChoice step={step} onAction={handleAction} />
        ) : (
          <>
            <video
              key={step.video}
              src={step.video}
              autoPlay
              muted
              playsInline
              loop
            />
            <div className="step-name">{step.label}</div>
          </>
        )}

        {/* step-name for choice steps sits above the split layout */}
        {step.type === 'choice' && (
          <div className="step-name">{step.label}</div>
        )}
      </div>

      <div className="footer">
        <img src={logo} alt="dockstar logo" className="ds-menu-logo" />

        <div className="control-cont">
          {step.buttons.map((btn, i) => {
            const btnKey = `${stepId}-${i}`
            const isHold = btn.action.type === 'hold'
            const isHolding = holdState?.key === btnKey
            const isFlashing = flashKey === btnKey
            const progress = isHolding ? holdState!.progress : 0

            if (isHold) {
              const duration = btn.action.type === 'hold' ? (btn.action.duration ?? 2000) : 2000
              return (
                <div
                  key={i}
                  className={isHolding ? 'button button-holding' : 'button'}
                  style={isHolding ? ({ '--hold-progress': progress } as React.CSSProperties) : undefined}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId)
                    startHold(btnKey, duration, () => {
                      setFlashKey(`${stepId}-${i + 1}`)
                    })
                  }}
                  onPointerUp={cancelHold}
                  onPointerLeave={cancelHold}
                  onPointerCancel={cancelHold}
                >
                  {btn.label}
                </div>
              )
            }

            return (
              <div
                key={i}
                className={['button', isFlashing ? 'button-flash' : ''].filter(Boolean).join(' ')}
                onClick={() => {
                  if (isFlashing) setFlashKey(null)
                  handleAction(btn.action)
                }}
              >
                {btn.label}
              </div>
            )
          })}
        </div>

        <div className="footer-data">
          <div className="footer-time">{timeStr}</div>
          <div className="footer-date">{dateStr}</div>
        </div>
      </div>

    </div>
  )
}
