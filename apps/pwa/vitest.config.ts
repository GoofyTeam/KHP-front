import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: true,
    pool: 'forks',
    maxThreads: 1,
    minThreads: 1,
    environmentOptions: {
      jsdom: { url: 'http://localhost' },
    },
  },
  resolve: {
    alias: {
      'virtual:pwa-register/react': resolve(
        __dirname,
        'src/test/mocks/pwa-register-react.ts'
      ),
    },
  },
})
