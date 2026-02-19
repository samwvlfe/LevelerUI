import { useLevelerState } from '../hooks/useLevelerState'
import { StateDisplay } from './StateDisplay'
import { STATE_ASSETS } from '../constants/stateAssets'
import type { ControlButton } from '../types'
import './Controller.css'

// Button definitions — separated from render logic for easy modification
// To add/remove/rename buttons, edit this array only
const BUTTONS: ControlButton[] = [
  {
    id: 'extend',
    label: 'EXTEND',
    activatesState: 'EXTENDING',
    ariaLabel: 'Hold to extend leveler lip into trailer',
  },
  {
    id: 'retract',
    label: 'RETRACT',
    activatesState: 'RETRACTING',
    ariaLabel: 'Hold to retract leveler lip',
  },
  {
    id: 'raise',
    label: 'RAISE',
    activatesState: 'RAISING',
    ariaLabel: 'Hold to raise platform',
  },
  {
    id: 'lower',
    label: 'LOWER',
    activatesState: 'LOWERING',
    ariaLabel: 'Hold to lower platform',
  },
]

export function Controller() {
  const { state, activateState, deactivateState } = useLevelerState()
  const asset = STATE_ASSETS[state]

  return (
    <div className="controller">

      {/* ── Status Bar ─────────────────────────────────────────── */}
      <div className="status-bar">
        <div className="status-left">
          {/* Indicator dot — pulses green when idle, accent color when active */}
          <div
            className={`status-dot ${state !== 'IDLE' ? 'status-dot--active' : 'status-dot--idle'}`}
            style={state !== 'IDLE' ? { backgroundColor: asset.accentColor, boxShadow: `0 0 8px ${asset.accentColor}` } : undefined}
          />
          <span
            className="status-state"
            style={state !== 'IDLE' ? { color: asset.accentColor } : undefined}
          >
            {asset.label}
          </span>
        </div>

        <span className="status-brand">DOCK LEVELER CONTROL SYSTEM</span>

        <div className="status-right">
          <span className="status-mode">DEMO MODE</span>
        </div>
      </div>

      {/* ── Display Area ───────────────────────────────────────── */}
      <StateDisplay state={state} asset={asset} />

      {/* ── Button Panel ───────────────────────────────────────── */}
      <div className="button-panel" role="group" aria-label="Leveler controls">
        {BUTTONS.map((btn) => {
          const isActive = state === btn.activatesState
          const btnAsset = STATE_ASSETS[btn.activatesState]

          return (
            <button
              key={btn.id}
              className={`control-btn ${isActive ? 'control-btn--active' : ''}`}
              aria-label={btn.ariaLabel}
              aria-pressed={isActive}
              style={
                isActive
                  ? {
                      borderColor: btnAsset.accentColor,
                      color: btnAsset.accentColor,
                      boxShadow: `0 0 16px ${btnAsset.accentColor}33, inset 0 0 12px rgba(255,255,255,0.05)`,
                    }
                  : undefined
              }
              // Pointer events handle both touch and mouse, covering all iOS edge cases:
              // pointerDown: button pressed
              // pointerUp: finger lifted normally
              // pointerLeave: finger slides off button without lifting
              // pointerCancel: iOS interrupts interaction (e.g. notification arrives)
              onPointerDown={() => activateState(btn.activatesState)}
              onPointerUp={deactivateState}
              onPointerLeave={deactivateState}
              onPointerCancel={deactivateState}
            >
              <span className="control-btn-label">{btn.label}</span>
              <span className="control-btn-hint">HOLD</span>
            </button>
          )
        })}
      </div>

    </div>
  )
}
