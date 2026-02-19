// All five operational states of the dock leveler
export type LevelerState = 'IDLE' | 'EXTENDING' | 'RETRACTING' | 'RAISING' | 'LOWERING'

// Each state maps to a display asset and visual metadata
export interface StateAsset {
  // Path to still image — always present (used as placeholder and video poster frame)
  image: string
  // Path to video — undefined until real .mp4 files are provided
  // SWAP POINT: Add video path here when .mp4 files are placed in src/assets/videos/
  video?: string
  // Human-readable label shown in the status bar
  label: string
  // Hex color for the active state indicator and text glow
  accentColor: string
}

// Maps every leveler state to its display asset
export type StateAssetMap = Record<LevelerState, StateAsset>

// Button definition for the control panel
export interface ControlButton {
  id: string
  label: string
  // Which state this button activates when held
  activatesState: Exclude<LevelerState, 'IDLE'>
  // ARIA label for accessibility
  ariaLabel: string
}
