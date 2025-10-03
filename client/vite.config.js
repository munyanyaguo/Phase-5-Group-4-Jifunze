import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Ensure all public files are copied to dist
  publicDir: 'public',
  build: {
    copyPublicDir: true,
    outDir: 'dist',
  },
})
