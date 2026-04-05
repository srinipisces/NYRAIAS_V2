import { defineConfig,loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const base = env.VITE_BASENAME || '/';
  return {
    base,
    plugins: [react()],
    server: {
      port: 5174,
      host: true, // Required for Docker access
      hmr: {
          protocol: 'ws',
          clientPort: 80,
          host: '10.0.0.95',
          path: '/activatedcarbon/'
        },
    },
  }
  
})


