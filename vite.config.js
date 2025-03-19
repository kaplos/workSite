import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base:'./',
  css: {
    postcss: './postcss.config.js', // Ensure PostCSS is configured
  },
  plugins: [react()],
})
