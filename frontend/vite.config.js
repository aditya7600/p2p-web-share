import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      events: 'events',
    }
  },
  define: {
    // simple-peer uses global, which isn't present in native ES browser builds.
    global: 'globalThis',
  },
  server: {
    port: 5173,
    host: true
  }
})
