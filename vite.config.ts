import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Use relative paths so assets resolve correctly inside Capacitor's native WebView
  base: './',
  plugins: [
    react(),
  ],
})
