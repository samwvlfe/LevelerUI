import './App.css'
import { Controller } from './components/Controller'

// App is a thin shell — all UI and logic lives in Controller and below
function App() {
  return (
    <main className="app-root">
      <Controller />
    </main>
  )
}

export default App
