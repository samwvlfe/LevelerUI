// ============================================================
// SEQUENCE CONFIG — PRIMARY SWAP POINT
// ============================================================
// This is the only file you need to edit to change:
//   - What video plays at each step
//   - What label shows in the top-right corner
//   - What buttons appear in the footer
//   - Where each button takes the user (linear or branching)
//
// STEP TYPES
// ─────────────────
// video  (default) — plays a looping .mp4 in the main area
//   Required fields: video, buttons
//
// choice           — fills the main area with two tappable image halves
//   Required fields: left, right, buttons
//   left / right each have: image, label, action
//   Tapping a half navigates via its action — no footer button needed for the choice itself.
//
// HOW BUTTONS WORK
// ─────────────────
// Each button (footer) has:
//   label      — text shown on the button
//   action     — one of:
//                  { type: 'goto', stepId: 'some-step' }  → jumps to that step
//                  { type: 'back' }                        → goes to previous step in history
//                  { type: 'none' }                        → does nothing (placeholder)
//
// VIDEO PATHS
// ─────────────────
// Import your .mp4 files at the top of this file, then reference them in each step.
// A step can reuse the same video as another step — just pass the same import.
//
// CHOICE IMAGES
// ─────────────────
// Import your images at the top of this file, then reference them in left.image / right.image.
// ============================================================

// Videos
import video1 from './assets/videos/1_truck-back-in.mp4'
import video2 from './assets/videos/2_restraint-engage.mp4'
import video3 from './assets/videos/3_door-open.mp4'
import video4 from './assets/videos/end-load-positioning-4B1.mp4'
import video5 from './assets/videos/end-unload-4B2.mp4'
import video6 from './assets/videos/reg-loading-positioning-4B3.mp4'
import video7 from './assets/videos/load-unload-5.mp4'
import video8 from './assets/videos/store-leveler-endload-6B1.mp4'
import video9 from './assets/videos/endload-unload-6B2.mp4'
import video10 from './assets/videos/store-leveler-complete.mp4'
import video11 from './assets/videos/lower-door-7.mp4'
import video12 from './assets/videos/restraint-disengage-8.mp4'

// Images
import next from './assets/images/next.png'
import prev from './assets/images/previous.png'
import rest_lock from './assets/images/restraint-locked.png'
import rest_unlock from './assets/images/restraint-unlocked.png'
import door_up from './assets/images/door-up.png'
import door_down from './assets/images/door-down.png'
import leveler_eng from './assets/images/leveler-up.png'
import leveler_down from './assets/images/leveler-down.png'
import loading from './assets/images/active-loading.png'

// Choice step images
import endLoadImg from './assets/images/EndLoad.png'
import regularLoadImg from './assets/images/regularLoad.png'

// ── Types ────────────────────────────────────────────────────

export type ButtonAction =
  | { type: 'goto'; stepId: string }
  | { type: 'back' }
  | { type: 'none' }
  | { type: 'hold'; duration?: number }  // hold for duration ms, then unlocks the next button in the array

export interface StepButton {
  image: string
  action: ButtonAction
}

// A single side of a split-choice screen
export interface ChoiceSide {
  image: string          // imported image path shown in that half
  label: string          // large text overlaid on the image
  action: ButtonAction   // what happens when the user taps this half
}

// A video step — plays a looping video in the main area
export interface VideoStep {
  type?: 'video'         // optional for backwards compat — assumed when 'choice' not set
  id: string
  label: string          // shown in top-right corner
  video: string          // imported .mp4 path
  buttons: StepButton[]  // 1–4 buttons in the footer center
  holdDown?: boolean       // if true, user must hold the button down for 2 seconds to trigger its action (default: false)
}

// A choice step — fills the main area with two tappable image halves
export interface ChoiceStep {
  type: 'choice'
  id: string
  label: string          // shown in top-right corner
  left: ChoiceSide
  right: ChoiceSide
  buttons: StepButton[]  // footer buttons (e.g. just a BACK button)
}

export type Step = VideoStep | ChoiceStep

export const STEPS: Step[] = [

  { //starts here
    id: 'home',
    label: 'Home',
    video: video1,
    buttons: [
      { image: next, action: { type: 'goto', stepId: 'restraint' } },
    ],
  },

  {
    id: 'restraint',
    label: 'Raise Restraint',
    video: video2,
    buttons: [
      { image: prev,     action: { type: 'back' } },
      { image: rest_lock, action: {type: 'hold', duration: 3000 } },
      { image: next, action: { type: 'goto', stepId: 'door' } },
    ],
    holdDown: true,
  },

  {
    id: 'door',
    label: 'Raise Door',
    video: video3,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: door_up, action: {type: 'hold'} },
      { image: next, action: { type: 'goto', stepId: 'which-unload' } },
    ],
    holdDown: true,
  },

  {
    //get here from unload type decision
    //next stepo should be to start unloading from end
    id: 'endload-position',
    label: 'End Load',
    video: video4,
    buttons: [
      { image: prev,   action: { type: 'goto', stepId: 'which-load' } },
      { image: leveler_eng, action: {type: 'hold'} },
      { image: next, action: { type: 'goto', stepId: 'endload-unload' } },
    ],
    holdDown: true,
  },

  {
    id: 'endload-unload',
    label: 'End Unloading',
    video: video5,
    buttons: [
      { image: prev,   action: { type: 'goto', stepId: 'endload-position' } },
      { image: loading, action: {type: 'none'} },
      { image: next, action: { type: 'goto', stepId: 'reg-load-position' } },
    ],
  },

  {
    id: 'reg-load-position',
    label: 'Standard Load',
    video: video6,
    buttons: [
      { image: prev,   action: { type: 'back' } }, //ensure it goes to previous no matter where it came from
      { image: leveler_eng, action: {type: 'hold'} },
      { image: next, action: { type: 'goto', stepId: 'load-unload' } },
    ],
    holdDown: true,
  },

  {
    id: 'load-unload',
    label: 'Standard Loading',
    video: video7,
    buttons: [
      { image: prev,   action: { type: 'back' } }, //ensure it goes to previous no matter where it came from
      { image: loading, action: {type: 'none'} },
      { image: next, action: { type: 'goto', stepId: 'which-load' } },
    ],
  },

  {
    id: 'store-leveler',
    label: 'End Load',
    video: video8,
    buttons: [
      { image: prev,   action: { type: 'back' } }, //ensure it goes to previous no matter where it came from
      { image: leveler_down, action: {type: 'hold'} },
      { image: next, action: { type: 'goto', stepId: 'endload-load' } },
    ],
    holdDown: true,
  },

  {
    id: 'endload-load',
    label: 'End Loading',
    video: video9,
    buttons: [
      { image: prev,   action: { type: 'goto' , stepId: 'store-leveler' } },
      { image: loading, action: {type: 'none'} },
      { image: next, action: { type: 'goto', stepId: 'leveler-complete' } },
    ],
  },

  {
    id: 'leveler-complete',
    label: 'Home Leveler',
    video: video10,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: leveler_down, action: {type: 'hold'} },
      { image: next, action: { type: 'goto', stepId: 'lower-door' } },
    ],
    holdDown: true,
  },

  {
    id: 'lower-door',
    label: 'Lower Door',
    video: video11,
    buttons: [
      { image: prev,   action: { type: 'goto', stepId: 'leveler-complete' } },
      { image: door_down, action: {type: 'hold'} },
      { image: next, action: { type: 'goto', stepId: 'restriant-disengage' } },
    ],
    holdDown: true,
  },

  {
    id: 'restriant-disengage',
    label: 'Lower Restraint',
    video: video12,
    buttons: [
      { image: prev,   action: { type: 'goto', stepId: 'lower-door' } },
      { image: rest_unlock, action: {type: 'hold'} },
      { image: next, action: { type: 'goto', stepId: 'home' } },
    ],
    holdDown: true,
  },

  // Choice steps

  {
    type: 'choice',
    id: 'which-unload',
    label: 'Unload Selection',
    left: {
      image: endLoadImg,
      label: 'End Load',
      action: { type: 'goto', stepId: 'endload-position' },
    },
    right: {
      image: regularLoadImg,
      label: 'Standard Load',
      action: { type: 'goto', stepId: 'reg-load-position' },
    },
    buttons: [
      { image: prev, action: { type: 'back' } },
    ],
  },

  {
    type: 'choice',
    id: 'which-load',
    label: 'Load Selection',
    left: {
      image: endLoadImg,
      label: 'End Load',
      action: { type: 'goto', stepId: 'store-leveler' },
    },
    right: {
      image: regularLoadImg,
      label: 'Standard Load, Finish Loading',
      action: { type: 'goto', stepId: 'leveler-complete' }, //COMPLETE THIS
    },
    buttons: [
      { image: prev, action: { type: 'back' } },
    ],
  }

]

// Lookup map — used by Controller to jump to a step by id in O(1)
export const STEP_MAP: Record<string, Step> = Object.fromEntries(
  STEPS.map((s) => [s.id, s])
)
