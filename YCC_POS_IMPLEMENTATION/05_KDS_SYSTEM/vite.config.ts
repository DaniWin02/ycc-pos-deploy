import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/kds/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '../../shared': path.resolve(__dirname, './shared'),
      '../../../shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    port: 3002,
    host: true,
    fs: {
      allow: ['..'],
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
