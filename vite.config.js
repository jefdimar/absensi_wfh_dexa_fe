import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 3000,
    open: true, // Automatically open browser
    host: true, // Allow external connections
    hmr: {
      overlay: true // Show error overlay
    }
  },
  // Enable hot reload for all file types
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})
