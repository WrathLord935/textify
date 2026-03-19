import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// tells vite: when the frontend makes a request to /api/...
// forward it to our express server on port 3001
// this avoids CORS issues during development
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  }
})
