import { useState, useEffect } from 'react'
import './Controller.css'

import video1 from '../assets/videos/1_truck-back-in.mp4'
import video2 from '../assets/videos/2_restraint-engage.mp4'
import video3 from '../assets/videos/3_door-open.mp4'
import logo from '../../logo.png'

const VIDEOS = [
  { src: video1, label: 'Home' },
  { src: video2, label: 'Raise Restraint' },
  { src: video3, label: 'Raise Door' },
]

function useClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return now
}

export function Controller() {
  const [index, setIndex] = useState(0)
  const now = useClock()

  const goNext = () => setIndex((i) => (i + 1) % VIDEOS.length)
  const goBack = () => setIndex((i) => (i - 1 + VIDEOS.length) % VIDEOS.length)

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })
  const dateStr = now.toLocaleDateString('en-US', {
    month: 'numeric',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="app">

      <div className="video-wrap">
        <video
          key={VIDEOS[index].src}
          src={VIDEOS[index].src}
          autoPlay
          muted
          playsInline
          loop
        />
        <div className="step-name">{VIDEOS[index].label}</div>
      </div>

      <div className="footer">
        <img src={logo} alt="dockstar logo" className="ds-menu-logo" />

        <div className="control-cont">
          <div className="button" onClick={goBack}>BACK</div>
          <div className="button">ACTION</div>
          <div className="button" onClick={goNext}>NEXT</div>
        </div>

        <div className="footer-data">
          <div className="footer-time">{timeStr}</div>
          <div className="footer-date">{dateStr}</div>
        </div>
      </div>

    </div>
  )
}
