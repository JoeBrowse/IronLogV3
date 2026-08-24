import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The version the "What's New" screen shows comes from package.json, so there
// is one place to bump it rather than a constant in the source that can drift
// away from the versionName the Play release is actually built with.
const { version } = JSON.parse(readFileSync('./package.json', 'utf8'))

export default defineConfig({
  // Relative asset URLs, so one build runs from anywhere: the root of
  // Capacitor's webview in the APK, and an arbitrary subdirectory when the
  // same bundle is served as a PWA from GitHub Pages. An absolute base
  // would 404 every asset in the subdirectory case.
  base: './',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  build: {
    outDir: 'dist',
  },
})
