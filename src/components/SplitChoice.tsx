import type { ChoiceStep, ButtonAction } from '../sequence'
import './SplitChoice.css'

interface SplitChoiceProps {
  step: ChoiceStep
  onAction: (action: ButtonAction) => void
}

export function SplitChoice({ step, onAction }: SplitChoiceProps) {
  return (
    <div className="split-choice">

      <div
        className="split-side split-side--left"
        onClick={() => onAction(step.left.action)}
      >
        <img src={step.left.image} alt={step.left.label} className="split-image" />
        <div className="split-label">{step.left.label}</div>
        <div className="split-tap-hint">TAP TO SELECT</div>
      </div>

      <div className="split-divider" />

      <div
        className="split-side split-side--right"
        onClick={() => onAction(step.right.action)}
      >
        <img src={step.right.image} alt={step.right.label} className="split-image" />
        <div className="split-label">{step.right.label}</div>
        <div className="split-tap-hint">TAP TO SELECT</div>
      </div>

    </div>
  )
}
