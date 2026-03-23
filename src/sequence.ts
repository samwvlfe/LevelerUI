// ============================================================
// SEQUENCE CONFIG
// ============================================================

// Videos
import video1 from './assets/videos/CONTROLS2 VIDEO-01.mp4'
import video2 from './assets/videos/CONTROLS2 VIDEO-02.mp4'
import video3 from './assets/videos/3_door-open.mp4'
import video4 from './assets/videos/end-load-positioning-4B1.mp4'
import video5 from './assets/videos/end-unload-4B2.mp4'
import video6 from './assets/videos/reg-loading-positioning-4B3.mp4'
import video7 from './assets/videos/load-unload-5.mp4'
import video8 from './assets/videos/end-endload-home.mp4'
import video9 from './assets/videos/endload-unload-6B2.mp4'
import video10 from './assets/videos/store-leveler-complete.mp4'
import video11 from './assets/videos/lower-door-7.mp4'
import video12 from './assets/videos/restraint-disengage-8.mp4'
import video13 from './assets/videos/lev-eng-to-endload.mp4'

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

  { //starts here
    id: 'home',
    label: 'Home',
    video: video1,
    buttons: [
      { image: next, action: { type: 'goto', stepId: 'restraint' }, flashOnMount: true },
    ],
  },

  {
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

  {
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
    //New video with cubed out trailer
    id: 'endload-position',
    label: 'End Load',
    video: video4,
    playbackRate: PLAYBACK_RATE_faster,
    freezeAt: 1.2,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: leveler_eng, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'goto', stepId: 'endload-unload' } },
    ],
    holdDown: true,
  },

  { //AFTER THIS NEED REVERSED OF VIDEO8
    id: 'endload-unload',
    label: 'End Unloading',
    video: video5,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      // { image: loading, action: { type: 'flash-next' } },
      { image: next, action: { type: 'goto', stepId: 'reg-load-position' }, flashOnMount: true },
    ],
  },

  {
    id: 'reg-load-position',
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

  {
    id: 'load-unload',
    label: 'Standard Loading',
    video: video7,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      // { image: loading, action: { type: 'flash-next' } },
      { image: next, action: { type: 'goto', stepId: 'which-load' }, flashOnMount: true },
    ],
  },

  {
    id: 'store-leveler',
    label: 'End Load',
    video: video13,
    playbackRate: PLAYBACK_RATE_faster,
    freezeAt: 1.2,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: leveler_down, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'goto', stepId: 'endload-load' } },
    ],
    holdDown: true,
  },

  {
    id: 'endload-load',
    label: 'End Loading',
    video: video9,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      // { image: loading, action: { type: 'flash-next' } },
      { image: next, action: { type: 'goto', stepId: 'home-leveler-endload' }, flashOnMount: true },
    ],
  },

  { //new video reversed
    id: 'home-leveler-endload',
    label: 'Home Leveler',
    video: video8,
    playbackRate: PLAYBACK_RATE_faster,
    freezeAt: 1.1,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: leveler_down, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'goto', stepId: 'lower-door' } },
    ],
    holdDown: true,
  },

  {
    id: 'leveler-complete',
    label: 'Home Leveler',
    video: video10,
    playbackRate: PLAYBACK_RATE_faster,
    freezeAt: 1.1,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: leveler_down, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'goto', stepId: 'lower-door' } },
    ],
    holdDown: true,
  },

  {
    id: 'lower-door',
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

  {
    id: 'restriant-disengage',
    label: 'Lower Restraint',
    video: video12,
    freezeAt: 1.1,
    buttons: [
      { image: prev,   action: { type: 'back' } },
      { image: rest_unlock, frozenImage: rest_unlock_done, action: {type: 'hold', duration: 1 } },
      { image: next, action: { type: 'finish' } },
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
      { image: next, action: { type: 'goto-selected' } },
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