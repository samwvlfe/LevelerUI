import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // generateSW: Workbox generates the service worker automatically from the manifest
      strategies: 'generateSW',

      // autoUpdate: SW activates silently on next reload — appropriate for kiosk demo
      registerType: 'autoUpdate',

      // Include all asset types in the precache manifest so the app works fully offline
      workbox: {
        globPatterns: [
          '**/*.{js,css,html,ico,png,jpg,jpeg,svg,mp4,webm,woff,woff2,ttf}'
        ],

        // Increase limit from 2MB default — video files can be large
        maximumFileSizeToCacheInBytes: 50 * 1024 * 1024, // 50 MB

        runtimeCaching: [
          {
            // CRITICAL for iOS Safari: rangeRequests must be true for video playback offline.
            // Safari uses HTTP range requests to stream video; without this the video
            // element silently fails when the network is unavailable.
            urlPattern: /\.mp4$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'leveler-videos',
              rangeRequests: true,
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
          {
            urlPattern: /\.(?:jpg|jpeg|png|svg)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'leveler-images',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },

      // PWA manifest — defined here so vite-plugin-pwa injects <link rel="manifest"> automatically
      manifest: {
        name: 'LevelerUI',
        short_name: 'LevelerUI',
        description: 'Dock leveler control panel — trade show demo',
        theme_color: '#0d1117',
        background_color: '#0d1117',
        // fullscreen: removes all browser chrome when launched from home screen
        display: 'fullscreen',
        // Force landscape orientation — this is a horizontal control panel
        orientation: 'landscape',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },

      // Enable SW in dev for testing offline behavior locally
      devOptions: {
        enabled: false, // Set to true temporarily to test SW behavior in dev
      },
    }),
  ],
})
