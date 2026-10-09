import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [ react() ],
  root: 'client',
  build: {
    outDir: '../public',
    emptyOutDir: false,   // do NOT wipe out login.html/css/js when building
    rollupOptions: {
      input: 'app.html'
    }
  }
})