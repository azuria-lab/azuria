import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    css: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'tests/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'build/',
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 90,
          statements: 85
        },
        // Per file thresholds for critical modules
        './src/utils/calculator/*.ts': {
          branches: 90,
          functions: 95,
          lines: 95,
          statements: 95
        },
        './src/hooks/*.ts': {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85
        },
        './src/components/**/*.tsx': {
          branches: 70,
          functions: 75,
          lines: 80,
          statements: 75
        },
        lines: 70,
        functions: 70,
        statements: 70,
        branches: 60
      }
  }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})