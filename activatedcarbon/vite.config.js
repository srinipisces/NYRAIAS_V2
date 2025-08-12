import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/activatedcarbon/',
  plugins: [react()],
  server: {
    port: 5174,
    host: true, // Required for Docker access
    hmr: {
        protocol: 'ws',
        clientPort: 80,
        host: '10.0.0.211',
        path: '/activatedcarbon/'
      },
  },
  
})


