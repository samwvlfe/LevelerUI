import './Screensaver.css'

interface ScreensaverProps {
  doorLabel: string   // e.g. "Door 2112"
  onDismiss: () => void
}

export function Screensaver({ doorLabel, onDismiss }: ScreensaverProps) {
  return (
    <div className="screensaver" onClick={onDismiss}>
      <span className="screensaver-label">{doorLabel}</span>
      <span className="screensaver-hint">TAP TO BEGIN</span>
    </div>
  )
}
