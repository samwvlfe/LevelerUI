import { useState } from 'react'
import type { ChoiceStep, ButtonAction } from '../sequence'
import './SplitChoice.css'
import checkedImg from '../assets/images/checked.png'
import uncheckedImg from '../assets/images/unchecked.png'

interface SplitChoiceProps {
  step: ChoiceStep
  onSelect: (action: ButtonAction) => void
}

export function SplitChoice({ step, onSelect }: SplitChoiceProps) {
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | null>(null)

  function handleSideClick(side: 'left' | 'right') {
    setSelectedSide(side)
    onSelect(side === 'left' ? step.left.action : step.right.action)
  }

  return (
    <div className="split-choice">

      <div
        className={['split-side', 'split-side--left', selectedSide === 'left' ? 'split-side--selected' : ''].filter(Boolean).join(' ')}
        onClick={() => handleSideClick('left')}
      >
        <img src={step.left.image} alt={step.left.label} className="split-image" />
        <div className="split-label">{step.left.label}</div>
        <img
          src={selectedSide === 'left' ? checkedImg : uncheckedImg}
          alt={selectedSide === 'left' ? 'selected' : 'not selected'}
          className="split-check-icon"
        />
      </div>

      <div className="split-divider" />

      <div
        className={['split-side', 'split-side--right', selectedSide === 'right' ? 'split-side--selected' : ''].filter(Boolean).join(' ')}
        onClick={() => handleSideClick('right')}
      >
        <img src={step.right.image} alt={step.right.label} className="split-image" />
        <div className="split-label">{step.right.label}</div>
        <img
          src={selectedSide === 'right' ? checkedImg : uncheckedImg}
          alt={selectedSide === 'right' ? 'selected' : 'not selected'}
          className="split-check-icon"
        />
      </div>

    </div>
  )
}
