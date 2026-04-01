// ============================================================
// SEQUENCE CONFIG
// ============================================================

// Videos
import video1 from './assets/videos/1-truck-backing-in.mp4'
import video2 from './assets/videos/2-lock-restraint.mp4'
import video3 from './assets/videos/3-door-open.mp4'
import video4 from './assets/videos/4-to-end-unload-position.mp4'
import video5 from './assets/videos/5-end-unload.mp4'
import video6 from './assets/videos/6-from-endload-to-standard-position.mp4'
import video6_2 from './assets/videos/6_2-reg-loading-position.mp4'
import video7 from './assets/videos/7-load-unload.mp4'
import video8 from './assets/videos/8-to-endload-from-standard.mp4'
import video9 from './assets/videos/9-endload-unload.mp4'
import video10 from './assets/videos/10-from-endload-to-stored.mp4'
import video10_2 from './assets/videos/10_2-from-standard-to-stored.mp4'
import video11 from './assets/videos/11-close-door-cubed-out.mp4'
import video11_2 from './assets/videos/11_2-lower-door.mp4'
import video12 from './assets/videos/12-restraint-disengage2.mp4'

// Images
import next from './assets/images/next.png'
import prev from './assets/images/previous.png'
import rest_lock from './assets/images/restraint-locked.png'
import rest_unlock from './assets/images/restraint-unlocked.png'
import rest_unlock_done from './assets/images/restraint-unlocked-done.png'
import door_up from './assets/images/door-up.png'
import door_down from './assets/images/door-down.png'
import leveler_eng from './assets/images/leveler-up.png'
import leveler_down from './assets/images/leveler-down.png'

// Choice step images
import endLoadImg from './assets/images/end-load.png'
import regularLoadImg from './assets/images/reg-load.png'

// ── Types ────────────────────────────────────────────────────

export type ButtonAction =
  | { type: 'goto'; stepId: string }
  | { type: 'back' }
  | { type: 'none' }
  | { type: 'hold'; duration?: number }  // hold for duration ms, then unlocks the next button in the array
  | { type: 'flash-next' }               // tap to manually flash the next button green
  | { type: 'goto-selected' }            // navigates to whichever choice side the user selected
  | { type: 'finish' }                   // returns to screensaver and resets to home, preserving door label

export interface StepButton {
  image: string
  frozenImage?: string    // if set, replaces image when the video is frozen
  action: ButtonAction
  flashOnMount?: boolean  // if true, this button starts flashing when the step loads
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
  freezeAt?: number        // seconds from the END of the video to pause and hold as a static frame
  playbackRate?: number    // video playback speed multiplier (default: 1.0 = normal speed, e.g. 2.0 = 2x)
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

const PLAYBACK_RATE_fast = 1.3;
const PLAYBACK_RATE_faster = 1.5;

export const STEPS: Step[] = [

  { // truck backing up
    id: 'home',
    label: 'Home',
    video: video1,
    buttons: [
      { image: next, action: { type: 'goto', stepId: 'restraint' }, flashOnMount: true },
    ],
  },

  { // restraint locking
    id: 'restraint',
    label: 'Raise Restraint',
    video: video2,
    freezeAt: 1.1,
    buttons: [
      { image: prev,     action: { type: 'back' } },
      { image: rest_lock, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'goto', stepId: 'door' } },
    ],
    holdDown: true,
  },

  { // door raising
    id: 'door',
    label: 'Raise Door',
    video: video3,
    playbackRate: PLAYBACK_RATE_fast,
    freezeAt: 1.1,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: door_up, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'goto', stepId: 'which-unload' } },
    ],
    holdDown: true,
  },

  {
    // from end UNLOAD selection - leveler going to end unload position - cubed out
    id: 'endload-position',
    label: 'End Load',
    video: video4,
    playbackRate: PLAYBACK_RATE_faster,
    freezeAt: 1.3,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: leveler_eng, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'goto', stepId: 'endload-unload' } },
    ],
    holdDown: true,
  },

  { // forklift taking off end loaded pallet
    id: 'endload-unload',
    label: 'End Unloading',
    video: video5,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: next, action: { type: 'goto', stepId: 'reg-load-position2' }, flashOnMount: true },
    ],
  },

  { // leveler going from end load position to regular load position
    id: 'reg-load-position2',
    label: 'Standard Load',
    video: video6,
    playbackRate: PLAYBACK_RATE_faster,
    freezeAt: 1.1,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: leveler_eng, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'goto', stepId: 'load-unload' } },
    ],
    holdDown: true,
  },

  { // leveler going to standard load position from stored
    id: 'reg-load-position1',
    label: 'Standard Load',
    video: video6_2,
    playbackRate: PLAYBACK_RATE_faster,
    freezeAt: 1.1,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: leveler_eng, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'goto', stepId: 'load-unload' } },
    ],
    holdDown: true,
  },

  { // forkilift going in and out of trailer loading it
    id: 'load-unload',
    label: 'Standard Loading',
    video: video7,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: next, action: { type: 'goto', stepId: 'which-load' }, flashOnMount: true },
    ],
  },

  { // from end LOAD selection - leveler going from regular load position to end load position
    id: 'store-leveler',
    label: 'End Load',
    video: video8,
    playbackRate: PLAYBACK_RATE_faster,
    freezeAt: 1.2,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: leveler_down, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'goto', stepId: 'endload-load' } },
    ],
    holdDown: true,
  },

  { // forklift adding end loaded pallet into back of trailer
    id: 'endload-load',
    label: 'End Loading',
    video: video9,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: next, action: { type: 'goto', stepId: 'home-leveler-endload' }, flashOnMount: true },
    ],
  },

  { // leveler in end load position to stored position - cubed out
    id: 'home-leveler-endload',
    label: 'Home Leveler',
    video: video10,
    playbackRate: PLAYBACK_RATE_faster,
    freezeAt: 1.1,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: leveler_down, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'goto', stepId: 'lower-door-endload' } },
    ],
    holdDown: true,
  },

  { // lower door - cubed out
    id: 'lower-door-endload',
    label: 'Lower Door',
    video: video11,
    playbackRate: PLAYBACK_RATE_fast,
    freezeAt: 1.1,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: door_down, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'goto', stepId: 'restriant-disengage' } },
    ],
    holdDown: true,
  },

  { // leveler from regular load postotion to stored position - non cubed out
    id: 'leveler-complete',
    label: 'Home Leveler',
    video: video10_2,
    playbackRate: PLAYBACK_RATE_faster,
    freezeAt: 1.1,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: leveler_down, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'goto', stepId: 'lower-door' } },
    ],
    holdDown: true,
  },

  { // lower door - non cubed out
    id: 'lower-door',
    label: 'Lower Door',
    video: video11_2,
    playbackRate: PLAYBACK_RATE_fast,
    freezeAt: 1.1,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: door_down, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'goto', stepId: 'restriant-disengage' } },
    ],
    holdDown: true,
  },

  { //NEED NEW VIDEO
    id: 'restriant-disengage',
    label: 'Lower Restraint',
    video: video12,
    freezeAt: 1.05,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: rest_unlock, frozenImage: rest_unlock_done, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'finish' } },
    ],
    holdDown: true,
  },

  // Choice steps

  { // choice 1 - which unload method
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
      action: { type: 'goto', stepId: 'reg-load-position1' },
    },
    buttons: [
      { image: prev, action: { type: 'back' } },
      { image: next, action: { type: 'goto-selected' } },
    ],
  },

  { // choice 2 - which load method
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
      label: 'Finish Loading',
      action: { type: 'goto', stepId: 'leveler-complete' },
    },
    buttons: [
      { image: prev, action: { type: 'back' } },
      { image: next, action: { type: 'goto-selected' } },
    ],
  }

]

// Lookup map — used by Controller to jump to a step by id in O(1)
export const STEP_MAP: Record<string, Step> = Object.fromEntries(
  STEPS.map((s) => [s.id, s])
)