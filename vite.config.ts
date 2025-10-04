
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
    // CRITICAL: Optimize for Azure Static Web Apps Free tier (250 MB limit)
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
        // CRITICAL FOR AZURE FREE: Inline ALL imports to create single bundle
        // This reduces ~100+ files to just 3-4 files total
        inlineDynamicImports: true,
        // Simplest possible output structure
        entryFileNames: 'assets/app.js',
        assetFileNames: 'assets/[name].[ext]',
        // Compact output
        compact: true
      }
    },
    chunkSizeWarningLimit: 600,
    // Reduce source map size
    sourcemap: false,
    // Optimize CSS
    cssCodeSplit: true,
    // Aggressive minification
    reportCompressedSize: false
  }
});
