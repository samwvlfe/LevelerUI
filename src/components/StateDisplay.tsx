import type { LevelerState, StateAsset } from '../types'
import './StateDisplay.css'

interface StateDisplayProps {
  state: LevelerState
  asset: StateAsset
}

// StateDisplay renders the central visual area of the control panel.
//
// Priority order: video (if asset.video is set) → image (always present as fallback)
//
// When real assets are added:
//   - For image-only states: set asset.image to the imported image path
//   - For video states: set asset.video to the imported .mp4 path
//   No changes to this component are needed — it reads from stateAssets.ts.
export function StateDisplay({ state, asset }: StateDisplayProps) {
  return (
    <div
      className="state-display"
      aria-live="polite"
      aria-label={`Current state: ${asset.label}`}
    >
      {asset.video ? (
        // Video mode — plays while the button is held
        // key forces remount when the video src changes, resetting playback to 0:00
        // muted: required for autoPlay on iOS Safari
        // playsInline: required to prevent iOS from hijacking into fullscreen player
        <video
          key={asset.video}
          className="state-media"
          src={asset.video}
          poster={asset.image}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        />
      ) : (
        // Image mode — shown when no video is configured (default / placeholder state)
        <img
          key={asset.image}
          className="state-media"
          src={asset.image}
          alt=""
          aria-hidden="true"
        />
      )}

      {/* State name overlay — large glowing text centered over the display */}
      {state !== 'IDLE' && (
        <div className="state-overlay" aria-hidden="true">
          <span
            className="state-name"
            style={{
              color: asset.accentColor,
              textShadow: `0 0 60px ${asset.accentColor}, 0 0 20px ${asset.accentColor}`,
            }}
          >
            {asset.label}
          </span>
        </div>
      )}
    </div>
  )
}
