import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App'

// PWA service worker registration via vite-plugin-pwa virtual module.
// registerSW handles SW install, activation, and update lifecycle automatically.
import { registerSW } from 'virtual:pwa-register'

registerSW({
  // Trade show kiosk: silently accept updates — no user prompt needed.
  // The updated SW activates on the next page load.
  onNeedRefresh() {
    // No-op: auto-update is handled by the SW's skipWaiting behavior
  },
  onOfflineReady() {
    console.log('[LevelerUI] Ready for offline use.')
  },
  onRegistered(registration) {
    console.log('[LevelerUI] Service worker registered:', registration)
  },
  onRegisterError(error) {
    console.error('[LevelerUI] Service worker registration failed:', error)
  },
})

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('[LevelerUI] Root element #root not found in index.html')

createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
