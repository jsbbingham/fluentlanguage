import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// FluentLanguage.net — Vite build config.
// The site is deployed to an Apache/PHP host; the PHP API lives in /api and is
// proxied during local dev so the React forms hit the real endpoints.
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://fluentlanguage.net',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
