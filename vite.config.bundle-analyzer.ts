import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

// Bundle analyzer configuration for analyzing build sizes
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'bundle-visualizer.html',
      gzipSize: true,
      brotliSize: true,
      template: 'treemap',
      open: process.env.ANALYZE === 'true',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor code
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
        },
      },
    },
    // Analyze bundle size
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
});