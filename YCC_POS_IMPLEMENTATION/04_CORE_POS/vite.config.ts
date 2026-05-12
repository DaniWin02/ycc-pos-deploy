import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/pos/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '../../shared': path.resolve(__dirname, './shared'),
      '../../../shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    port: 3000,
    host: true,
    fs: {
      allow: ['..'],
    },
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
})
