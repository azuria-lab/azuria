// Force Vercel rebuild - 2025-10-12 15:30 BRT
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Dev-only security headers (approximation). In production, set headers at the reverse proxy.
import { generateCSP, SECURITY_CONFIG } from "./src/config/security";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Legacy path mappings for migration compatibility
      "@/hooks": path.resolve(__dirname, "./src/shared/hooks"),
      "@/types": path.resolve(__dirname, "./src/shared/types"),
    },
  },
  server: {
    port: 8080,
    headers: {
      "Content-Security-Policy": generateCSP(),
      ...SECURITY_CONFIG.HEADERS,
    }
  },
  build: {
    // Optimized for Vercel (no file limit constraints)
    target: 'es2015',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2,
        unsafe_arrows: true,
        unsafe_methods: true
      },
      mangle: {
        safari10: true
      }
    },
    rollupOptions: {
      output: {
        // Smart chunking strategy for optimal loading
        manualChunks: (id) => {
          // Separate heavy libraries into their own chunks
          if (id.includes('jspdf') || id.includes('autotable')) {
            return 'pdf-export'; // 388KB → lazy loaded only when exporting
          }
          if (id.includes('html2canvas')) {
            return 'screenshot'; // 201KB → lazy loaded only when needed
          }
          if (id.includes('recharts') || id.includes('victory')) {
            return 'charts'; // 449KB → lazy loaded only on analytics pages
          }
          if (id.includes('node_modules')) {
            // Split vendors by category
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('@tanstack') || id.includes('@supabase')) {
              return 'data-vendor';
            }
            return 'vendor'; // Other dependencies
          }
        },
        // Optimized file naming
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        compact: true
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    cssCodeSplit: true,
    reportCompressedSize: false
  }
});
