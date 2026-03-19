import { useState, useEffect, useRef } from 'react'
import './Controller.css'
import logo from '../assets/images/logo.png'
import power from '../assets/images/power.png'
import door from '../assets/images/door.png'
import door_up from '../assets/images/door-up.png'
import door_stop from '../assets/images/door-stop.png'
import door_down from '../assets/images/door-down.png'
import { STEPS, STEP_MAP } from '../sequence'
import type { ButtonAction } from '../sequence'
import { SplitChoice } from './SplitChoice'
import { Screensaver } from './Screensaver'
import { useIdleTimer } from '../hooks/useIdleTimer'

const IDLE_TIMEOUT_MS = 240_000
const DOOR_LIGHT_COUNT = 4
const DOOR_LIGHT_DURATION_MS = 2500   // ← change this to adjust animation speed
const DOOR_LIGHT_STEPS = ['door', 'lower-door']

const MENU_ITEMS: { label: string; stepId: string | null }[] = [
  { label: 'Home',                stepId: 'home' },
  { label: 'Engage Restraint',    stepId: 'restraint' },
  { label: 'Open Door',           stepId: 'door' },
  { label: 'Unload Selection',    stepId: 'which-unload' },
  { label: 'Load Selection',      stepId: 'which-load' },
  { label: 'Close Door',          stepId: 'lower-door' },
  { label: 'Disengage Restraint', stepId: 'restriant-disengage' },
]

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
  const [doorLabel, setDoorLabel] = useState('Door 14')
  const [stepId, setStepId] = useState(STEPS[0].id)
  const [_history, setHistory] = useState<string[]>([])
  const [holdState, setHoldState] = useState<{ key: string; progress: number } | null>(null)
  const [flashKey, setFlashKey] = useState<string | null>(null)
  const [completedHoldKeys, setCompletedHoldKeys] = useState<Set<string>>(new Set())
  const [powerOn, setPowerOn] = useState(false)
  const [doorOpen, setDoorOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [freezeTriggered, setFreezeTriggered] = useState(false)
  const [videoFrozen, setVideoFrozen] = useState(false)
  const [pendingChoiceAction, setPendingChoiceAction] = useState<ButtonAction | null>(null)
  const [timerMs, setTimerMs] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [doorLightIndex, setDoorLightIndex] = useState<number | null>(null)
  const [doorLightAnimating, setDoorLightAnimating] = useState(false)
  const [doorPosition, setDoorPosition] = useState<number>(3) // 3 = closed/bottom, 0 = open/top
  const holdIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerStartRef = useRef<number>(0)
  const doorLightIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const currentDoorPosRef = useRef<number>(3)
  const videoRef = useRef<HTMLVideoElement>(null)
  const freezeReadyRef = useRef(false)
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
    setCompletedHoldKeys(new Set())
    setFreezeTriggered(false)
    setVideoFrozen(false)
    freezeReadyRef.current = false
    setPendingChoiceAction(null)
    if (doorLightIntervalRef.current) {
      clearInterval(doorLightIntervalRef.current)
      doorLightIntervalRef.current = null
    }
    setDoorLightAnimating(false)
    setDoorLightIndex(DOOR_LIGHT_STEPS.includes(stepId) ? doorPosition : null)

    // Auto-flash any button marked flashOnMount
    const currentStep = STEP_MAP[stepId]
    const mountFlashIndex = currentStep.buttons.findIndex((b) => b.flashOnMount)
    setFlashKey(mountFlashIndex !== -1 ? `${stepId}-${mountFlashIndex}` : null)
  }, [stepId])

  function cancelHold() {
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current)
      holdIntervalRef.current = null
    }
    setHoldState(null)
  }

  function startTimer() {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    timerStartRef.current = Date.now()
    setTimerMs(0)
    setTimerRunning(true)
    timerIntervalRef.current = setInterval(() => {
      setTimerMs(Date.now() - timerStartRef.current)
    }, 1000)
  }

  function stopTimer() {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
      timerIntervalRef.current = null
    }
    setTimerMs(Date.now() - timerStartRef.current)
    setTimerRunning(false)
  }

  function startDoorLightAnimation(direction: 'up' | 'down', onComplete: () => void, fromIndex?: number) {
    if (doorLightIntervalRef.current) clearInterval(doorLightIntervalRef.current)
    const intervalMs = DOOR_LIGHT_DURATION_MS / (DOOR_LIGHT_COUNT - 1)
    let current = fromIndex ?? (direction === 'up' ? DOOR_LIGHT_COUNT - 1 : 0)
    setDoorLightIndex(current)
    setDoorLightAnimating(true)
    doorLightIntervalRef.current = setInterval(() => {
      current = direction === 'up' ? current - 1 : current + 1
      setDoorLightIndex(current)
      const done = direction === 'up' ? current <= 0 : current >= DOOR_LIGHT_COUNT - 1
      if (done) {
        clearInterval(doorLightIntervalRef.current!)
        doorLightIntervalRef.current = null
        setDoorLightAnimating(false)
        onComplete()
      }
    }, intervalMs)
  }

  function startManualDoorMove(direction: 'up' | 'down') {
    if (doorLightIntervalRef.current) clearInterval(doorLightIntervalRef.current)
    const intervalMs = DOOR_LIGHT_DURATION_MS / (DOOR_LIGHT_COUNT - 1)
    currentDoorPosRef.current = doorPosition
    setDoorLightAnimating(true)
    doorLightIntervalRef.current = setInterval(() => {
      const next = direction === 'up'
        ? currentDoorPosRef.current - 1
        : currentDoorPosRef.current + 1
      const clamped = Math.max(0, Math.min(DOOR_LIGHT_COUNT - 1, next))
      currentDoorPosRef.current = clamped
      setDoorLightIndex(clamped)
      const atEnd = direction === 'up' ? clamped <= 0 : clamped >= DOOR_LIGHT_COUNT - 1
      if (atEnd) {
        clearInterval(doorLightIntervalRef.current!)
        doorLightIntervalRef.current = null
        setDoorLightAnimating(false)
        setDoorPosition(clamped)
      }
    }, intervalMs)
  }

  function stopManualDoorMove() {
    if (doorLightIntervalRef.current) {
      clearInterval(doorLightIntervalRef.current)
      doorLightIntervalRef.current = null
    }
    setDoorLightAnimating(false)
    setDoorPosition(currentDoorPosRef.current)
  }

  function formatTimer(ms: number) {
    const totalSecs = Math.floor(ms / 1000)
    const h = Math.floor(totalSecs / 3600)
    const m = Math.floor((totalSecs % 3600) / 60)
    const s = totalSecs % 60
    return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
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
    if (action.type === 'finish') {
      setStepId(STEPS[0].id)
      setHistory([])
      setShowScreensaver(true)
      return
    }
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
    } else if (action.type === 'goto-selected' && pendingChoiceAction) {
      handleAction(pendingChoiceAction)
    }
  }

  function handleChoiceSelect(action: ButtonAction) {
    setPendingChoiceAction(action)
    const nextIdx = step.buttons.findIndex((b) => b.action.type === 'goto-selected')
    if (nextIdx !== -1) setFlashKey(`${stepId}-${nextIdx}`)
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
        <Screensaver doorLabel={doorLabel} onDismiss={dismissScreensaver} onRename={setDoorLabel} />
      )}

      <div className="video-wrap">
        {step.type === 'choice' ? (
          <SplitChoice key={stepId} step={step} onSelect={handleChoiceSelect} />
        ) : (
          <>
            <video
              ref={videoRef}
              key={step.video}
              src={step.video}
              autoPlay
              muted
              playsInline
              loop
              onCanPlay={(e) => { (e.target as HTMLVideoElement).playbackRate = step.playbackRate ?? 1.0 }}
              onTimeUpdate={() => {
                const vid = videoRef.current
                if (!vid || !step.freezeAt || !freezeTriggered) return
                if (!freezeReadyRef.current) {
                  // Still in the zone when button was pressed — wait until we loop past it
                  if (vid.currentTime < vid.duration - step.freezeAt) {
                    freezeReadyRef.current = true
                  }
                  return
                }
                if (vid.currentTime >= vid.duration - step.freezeAt) {
                  vid.pause()
                  setVideoFrozen(true)
                  if (stepId === 'restraint') startTimer()
                  // Door steps get their flash from the light animation completion, not here
                  if (!DOOR_LIGHT_STEPS.includes(stepId)) {
                    const holdIdx = step.buttons.findIndex(b => b.action.type === 'hold')
                    if (holdIdx !== -1) setFlashKey(`${stepId}-${holdIdx + 1}`)
                  }
                }
              }}
            />
            <div className="top-right-hud">
              <div className="step-name">{step.label}</div>
              <div className="load-timer">
                <span>{timerRunning || timerMs === 0 ? 'Load Timer' : 'Last Load'}</span>
                <div className="timer">{formatTimer(timerMs)}</div>
              </div>
            </div>
          </>
        )}
        {step.type === 'choice' && (
          <div className="top-right-hud">
            <div className="step-name">{step.label}</div>
          </div>
        )}
        {(DOOR_LIGHT_STEPS.includes(stepId) || doorLightAnimating || doorOpen) && (
          <div className="door-lights">
            {Array.from({ length: DOOR_LIGHT_COUNT }, (_, i) => (
              <div key={i} className={`light${(doorLightAnimating ? doorLightIndex : doorPosition) === i ? ' on' : ''}`} />
            ))}
          </div>
        )}
      </div>

      <div className="footer">
        <div className="menu-cont">
          <img
            src={logo}
            alt="dockstar logo"
            className="ds-menu-logo"
            onClick={() => setMenuOpen(prev => !prev)}
          />
          {menuOpen && (
            <div className="pu-menu">
              {MENU_ITEMS.map((item) => (
                <div
                  key={item.label}
                  className="menu-item"
                  onClick={() => {
                    if (item.stepId) {
                      setStepId(item.stepId)
                      setMenuOpen(false)
                    }
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="perm-btns-wrap">
          <div className="control-cont">
            {step.buttons.map((btn, i) => {
              const btnKey = `${stepId}-${i}`
              const isHold = btn.action.type === 'hold'
              const isHolding = holdState?.key === btnKey
              const isFlashing = flashKey === btnKey
              const isHoldDone = completedHoldKeys.has(btnKey)
              const progress = isHolding ? holdState!.progress : 0

              // Locked if any earlier button in this step is a hold not yet completed,
              // or if this step has a freeze and the video hasn't frozen yet
              const hasPriorIncompleteHold = step.buttons.slice(0, i).some((b, j) => {
                const priorKey = `${stepId}-${j}`
                return b.action.type === 'hold' && !completedHoldKeys.has(priorKey)
              })
              const awaitingFreeze = step.type !== 'choice' && !!step.freezeAt && !videoFrozen &&
                step.buttons.slice(0, i).some(b => b.action.type === 'hold')
              const awaitingSelection = btn.action.type === 'goto-selected' && !pendingChoiceAction
              const awaitingDoorLights = DOOR_LIGHT_STEPS.includes(stepId) && doorLightAnimating
              const isLocked = !isHold && (hasPriorIncompleteHold || awaitingFreeze || awaitingSelection || awaitingDoorLights)

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
                        const freezeAt = step.type !== 'choice' ? step.freezeAt : undefined
                        if (freezeAt) {
                          // Flash will happen once video actually freezes
                          setFreezeTriggered(true)
                          const vid = videoRef.current
                          if (vid && vid.duration) {
                            freezeReadyRef.current = vid.currentTime < vid.duration - freezeAt
                          } else {
                            freezeReadyRef.current = true
                          }
                        } else {
                          // No freeze — flash next button immediately as before
                          setFlashKey(`${stepId}-${i + 1}`)
                        }
                        if (stepId === 'restriant-disengage') stopTimer()
                        if (DOOR_LIGHT_STEPS.includes(stepId)) {
                          const dir = stepId === 'lower-door' ? 'down' : 'up'
                          startDoorLightAnimation(dir, () => {
                            setFlashKey(`${stepId}-${i + 1}`)
                            setDoorPosition(dir === 'up' ? 0 : DOOR_LIGHT_COUNT - 1)
                          }, doorPosition)
                        }
                      })
                    }}
                    onPointerUp={cancelHold}
                    onPointerLeave={cancelHold}
                    onPointerCancel={cancelHold}
                  >
                    <img className="button" src={videoFrozen && btn.frozenImage ? btn.frozenImage : btn.image} alt="action button" />
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
                    if (btn.action.type === 'flash-next') {
                      setFlashKey(`${stepId}-${i + 1}`)
                      return
                    }
                    handleAction(btn.action)
                  }}
                >
                  <img className="button" src={btn.image} alt="action button" />
                </div>
              )
            })}
          </div>
          <div className="btn-cont door-controll-cont" onClick={() => setDoorOpen(prev => !prev)}>
            <img src={door} alt="asynchronous door controls" className="button"/>
            {doorOpen && (
              <div className="door-controls" onClick={e => e.stopPropagation()}>
                <img
                  src={door_down}
                  alt="door down button"
                  className="button"
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId)
                    if (doorPosition >= DOOR_LIGHT_COUNT - 1) return
                    startManualDoorMove('down')
                  }}
                  onPointerUp={stopManualDoorMove}
                  onPointerLeave={stopManualDoorMove}
                  onPointerCancel={stopManualDoorMove}
                />
                <img src={door_stop} alt="door stop button" className="button" />
                <img
                  src={door_up}
                  alt="door up button"
                  className="button"
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId)
                    if (doorPosition <= 0) return
                    startManualDoorMove('up')
                  }}
                  onPointerUp={stopManualDoorMove}
                  onPointerLeave={stopManualDoorMove}
                  onPointerCancel={stopManualDoorMove}
                />
              </div>
            )}
          </div>
          <div
            className={['btn-cont', powerOn ? 'btn-cont--power-on' : 'btn-cont--power-off'].join(' ')}
            onClick={() => setPowerOn((prev) => !prev)}
          >
            <img src={power} alt="outlet power button" className="button" />
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