import { useState, useRef } from 'react'
import './Screensaver.css'

interface ScreensaverProps {
  doorLabel: string   // e.g. "Door 2112"
  onDismiss: () => void
  onRename: (name: string) => void
}

export function Screensaver({ doorLabel, onDismiss, onRename }: ScreensaverProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(doorLabel)
  const inputRef = useRef<HTMLInputElement>(null)

  function startEdit(e: React.MouseEvent) {
    e.stopPropagation()
    setDraft(doorLabel)
    setEditing(true)
    setTimeout(() => {
      inputRef.current?.select()
    }, 0)
  }

  function commitEdit() {
    const trimmed = draft.trim()
    if (trimmed) onRename(trimmed)
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitEdit()
    if (e.key === 'Escape') setEditing(false)
  }

  return (
    <div className="screensaver" onClick={editing ? undefined : onDismiss}>
      <span className="screensaver-text">Press The Title To Customize Your Door</span>
      {editing ? (
        <input
          ref={inputRef}
          className="screensaver-label screensaver-input"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={handleKeyDown}
          onClick={e => e.stopPropagation()}
          autoFocus
        />
      ) : (
        <span className="screensaver-label" onClick={startEdit}>{doorLabel}</span>
      )}
      <span className="screensaver-hint">{editing ? 'PRESS ENTER TO SAVE' : 'TAP TO BEGIN'}</span>
    </div>
  )
}
