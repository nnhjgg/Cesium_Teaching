import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import path from 'path'

export default defineConfig({
  plugins: [vue({ script: { reactivityTransform: true } })],
  resolve: {
    alias: {
      '@': path.resolve('src')
    }
  },
  build: {
    sourcemap: false,
    target: 'esnext'
  },
  optimizeDeps: {
    include: ['axios']
  },
  base: './',
  envDir: './env',
  server: {
    host: '0.0.0.0',
    port: 6768,
    open: true,
    base: './',
    strictPort: true
    // proxy: {
    //   '^/api': {
    //     target: 'http://127.0.0.1',
    //     changeOrigin: true,
    //     rewrite: (t) => t.replace(/^\/api/, '')
    //   }
    // }
  }
})
