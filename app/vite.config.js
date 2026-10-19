import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './', // so the built files load from disk inside Electron
  plugins: [react(), tailwindcss()],
  server: { port: 5174, strictPort: true },
})
