import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.ts',
    css: true,
    testTimeout: 30000,
    hookTimeout: 30000,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        isolate: true,
        maxForks: 1,
        minForks: 1,
      },
    },
    isolate: true,
    maxConcurrency: 1,
    minWorkers: 1,
    maxWorkers: 1,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      'tests/e2e/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['json'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        'dist/',
        'build/',
        'pages-backup-external/',
        'tests/',
        'tests-to-fix/',
        'public/',
      ],
      thresholds: {
        global: {
          branches: 40,
          functions: 50,
          lines: 60,
          statements: 50,
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
