import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./setupTests.ts', './src/__tests__/setup.ts'],
    clearMocks: true,
    restoreMocks: true,
    mockReset: true,
    css: false,
    // Evita deadlocks e travamentos
    pool: 'forks',
    maxWorkers: 1,
    // Evita loops infinitos e pendências
    isolate: true,
    testTimeout: 15000,
    coverage: {
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        statements: 50,
        branches: 40,
        functions: 50,
        lines: 50,
      },
    },
    // Garante que apenas arquivos de teste sejam executados
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/__tests__/**/*.ts',
      'src/**/__tests__/**/*.tsx',
    ],
    exclude: [
      'src/__tests__/setup.ts',
      'src/__tests__/mocks/**',
      '**/*.d.ts',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
