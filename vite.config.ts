import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        navigateFallback: 'index.html',
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Tabby',
        short_name: 'Tabby',
        description: 'Tabby - Your productivity companion',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    include: ['@material/web', '@material/material-color-utilities', 'lit']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
