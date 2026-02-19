import { useState, useCallback, useRef } from 'react'
import type { LevelerState } from '../types'

interface UseLevelerStateReturn {
  state: LevelerState
  activateState: (newState: Exclude<LevelerState, 'IDLE'>) => void
  deactivateState: () => void
}

// Hold-to-activate state machine — mirrors physical dock leveler deadman control.
// The leveler operates only while the button is held; releasing returns to IDLE.
// This is authentic to real dock leveler behavior and appropriate for trade show demos.
export function useLevelerState(): UseLevelerStateReturn {
  const [state, setState] = useState<LevelerState>('IDLE')

  // Ref tracks whether we have an active press so concurrent pointer events
  // (e.g. pointerUp + pointerLeave firing together) can't double-deactivate
  const activeRef = useRef<boolean>(false)

  const activateState = useCallback((newState: Exclude<LevelerState, 'IDLE'>) => {
    activeRef.current = true
    setState(newState)
  }, [])

  const deactivateState = useCallback(() => {
    if (activeRef.current) {
      activeRef.current = false
      setState('IDLE')
    }
  }, [])

  return { state, activateState, deactivateState }
}
