import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => ({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    mainFields: ['jsnext:main', 'browser', 'module', 'main']
  },
  build: {
    outDir: '../docs',
    emptyOutDir: true
  },
  base: mode === 'production'
    ? '/agent-monitoring-app-blueprint/'
    : '/'
}))
