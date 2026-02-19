// ============================================================
// STATE ASSETS — PRIMARY SWAP POINT
// ============================================================
// This is the single file to update when swapping in real assets.
//
// IMAGE SWAP:
//   Replace the makePlaceholderSVG() calls with imports of real images:
//   import idleImg from '../assets/images/idle.jpg'
//   Then set: image: idleImg
//
// VIDEO SWAP:
//   Place .mp4 files in src/assets/videos/ then uncomment the video lines below.
//   Use Vite's URL import pattern so the file gets bundled and cached:
//   import extendingVideo from '../assets/videos/extending.mp4'
//   Then set: video: extendingVideo
//
//   Video requirements:
//   - Format: H.264 MP4 (best iOS Safari compatibility)
//   - No audio track needed (autoPlay requires muted on iOS)
//   - Recommended: 1280x720 or 1920x1080
//   - Loop-friendly: first and last frames should be visually similar
// ============================================================

import type { StateAssetMap } from '../types'

// Generates a labeled SVG placeholder as a data URI.
// Visually shows the state name and a "SWAP WITH REAL ASSET" reminder.
// These disappear automatically once you replace the image/video paths above.
function makePlaceholderSVG(label: string, accentColor: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
    <rect width="1280" height="720" fill="#161b22"/>
    <rect x="4" y="4" width="1272" height="712" fill="none" stroke="${accentColor}" stroke-width="2" stroke-dasharray="16,8" opacity="0.5"/>
    <text x="640" y="320" fill="${accentColor}" font-family="Courier New, monospace" font-size="72" font-weight="bold" text-anchor="middle" dominant-baseline="middle" opacity="0.8">${label}</text>
    <text x="640" y="420" fill="#7d8590" font-family="Courier New, monospace" font-size="24" text-anchor="middle" dominant-baseline="middle">SWAP WITH REAL ASSET</text>
    <text x="640" y="460" fill="#4d5666" font-family="Courier New, monospace" font-size="16" text-anchor="middle" dominant-baseline="middle">src/constants/stateAssets.ts</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const STATE_ASSETS: StateAssetMap = {
  IDLE: {
    image: makePlaceholderSVG('IDLE / READY', '#4ade80'),
    // IDLE never plays video — the leveler is stationary in this state
    label: 'READY',
    accentColor: '#4ade80', // green — system ready
  },

  EXTENDING: {
    image: makePlaceholderSVG('EXTENDING', '#facc15'),
    // VIDEO SWAP: uncomment and update path when extending.mp4 is available
    // import extendingVideo from '../assets/videos/extending.mp4'
    // video: extendingVideo,
    label: 'EXTENDING',
    accentColor: '#facc15', // amber — motion in progress
  },

  RETRACTING: {
    image: makePlaceholderSVG('RETRACTING', '#fb923c'),
    // VIDEO SWAP: uncomment and update path when retracting.mp4 is available
    // import retractingVideo from '../assets/videos/retracting.mp4'
    // video: retractingVideo,
    label: 'RETRACTING',
    accentColor: '#fb923c', // orange — retract motion
  },

  RAISING: {
    image: makePlaceholderSVG('RAISING', '#38bdf8'),
    // VIDEO SWAP: uncomment and update path when raising.mp4 is available
    // import raisingVideo from '../assets/videos/raising.mp4'
    // video: raisingVideo,
    label: 'RAISING',
    accentColor: '#38bdf8', // blue — platform lift
  },

  LOWERING: {
    image: makePlaceholderSVG('LOWERING', '#c084fc'),
    // VIDEO SWAP: uncomment and update path when lowering.mp4 is available
    // import loweringVideo from '../assets/videos/lowering.mp4'
    // video: loweringVideo,
    label: 'LOWERING',
    accentColor: '#c084fc', // purple — platform lower
  },
}
