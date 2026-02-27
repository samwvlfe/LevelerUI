import { useState, useEffect, useRef } from 'react'
import './Controller.css'
import logo from '../assets/images/logo.png'
import power from '../assets/images/power.png'
import { STEPS, STEP_MAP } from '../sequence'
import type { ButtonAction } from '../sequence'
import { SplitChoice } from './SplitChoice'
import { Screensaver } from './Screensaver'
import { useIdleTimer } from '../hooks/useIdleTimer'

const IDLE_TIMEOUT_MS = 120_000

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
  const [completedHoldKeys, setCompletedHoldKeys] = useState<Set<string>>(new Set())
  const [powerOn, setPowerOn] = useState(false)
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const now = useClock()

  const step = STEP_MAP[stepId]

  useIdleTimer(IDLE_TIMEOUT_MS, () => setShowScreensaver(true))

  // Cancel hold and clear flash state whenever the step changes
  useEffect(() => {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current)
      holdIntervalRef.current = null
    }
    setHoldState(null)
    setFlashKey(null)
    setCompletedHoldKeys(new Set())
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
        setCompletedHoldKeys((prev) => new Set(prev).add(key))
        onComplete()
      }
    }, 16)
    holdIntervalRef.current = interval
  }

  function dismissScreensaver() {
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
        {step.type === 'choice' && (
          <div className="step-name">{step.label}</div>
        )}
      </div>

      <div className="footer">
        <img src={logo} alt="dockstar logo" className="ds-menu-logo" />

        <div className="perm-btns-wrap">
          <div className="control-cont">
            {step.buttons.map((btn, i) => {
              const btnKey = `${stepId}-${i}`
              const isHold = btn.action.type === 'hold'
              const isHolding = holdState?.key === btnKey
              const isFlashing = flashKey === btnKey
              const isHoldDone = completedHoldKeys.has(btnKey)
              const progress = isHolding ? holdState!.progress : 0

              // Locked if any earlier button in this step is a hold not yet completed
              const isLocked = !isHold && step.buttons.slice(0, i).some((b, j) => {
                const priorKey = `${stepId}-${j}`
                return b.action.type === 'hold' && !completedHoldKeys.has(priorKey)
              })

              if (isHold) {
                const duration =
                  btn.action.type === 'hold' ? (btn.action.duration ?? 2000) : 2000

                return (
                  <div
                    key={i}
                    className={[
                      'btn-cont',
                      isHolding ? 'btn-cont--holding' : isHoldDone ? '' : 'btn-cont--hold-idle',
                    ].filter(Boolean).join(' ')}
                    style={
                      isHolding
                        ? ({ '--hold-progress': progress } as React.CSSProperties)
                        : undefined
                    }
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
                    <img className="button" src={btn.image} alt="action button" />
                  </div>
                )
              }

              return (
                <div
                  key={i}
                  className={[
                    'btn-cont',
                    isLocked ? 'btn-cont--locked' : isFlashing ? 'btn-cont--flash' : '',
                  ].filter(Boolean).join(' ')}
                  onClick={() => {
                    if (isLocked) return
                    if (isFlashing) setFlashKey(null)
                    handleAction(btn.action)
                  }}
                >
                  <img className="button" src={btn.image} alt="action button" />
                </div>
              )
            })}
          </div>

          <div
            className={['btn-cont', powerOn ? 'btn-cont--power-on' : 'btn-cont--power-off'].join(' ')}
            onClick={() => setPowerOn((prev) => !prev)}
          >
            <img src={power} alt="power button" className="button" />
          </div>
        </div>

        <div className="footer-data">
          <div className="footer-time">{timeStr}</div>
          <div className="footer-date">{dateStr}</div>
        </div>
      </div>
    </div>
  )
}