import { useState, useEffect } from 'react'
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
  const now = useClock()

  const step = STEP_MAP[stepId]

  // Show screensaver after idle timeout, from any screen
  useIdleTimer(IDLE_TIMEOUT_MS, () => setShowScreensaver(true))

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
          {step.buttons.map((btn, i) => (
            <div
              key={i}
              className="button"
              onClick={() => handleAction(btn.action)}
            >
              {btn.label}
            </div>
          ))}
        </div>

        <div className="footer-data">
          <div className="footer-time">{timeStr}</div>
          <div className="footer-date">{dateStr}</div>
        </div>
      </div>

    </div>
  )
}
