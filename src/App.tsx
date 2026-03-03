import './App.css'
import { Controller } from './components/Controller'

// App is a thin shell — all UI and logic lives in Controller and below
function App() {
  return (
    <main className="app-root">
      <div className="portrait-overlay">Rotate your device to landscape</div>
      <Controller />
    </main>
  )
}

export default App
