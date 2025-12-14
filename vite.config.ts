
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
// Dev-only security headers (approximation). In production, set headers at the reverse proxy.
import { generateCSP, SECURITY_CONFIG } from "./src/config/security";
// Build: 2025-10-12 18:30 - Force cache invalidation

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
        // Smart chunking strategy for optimal loading by feature
        manualChunks: (id) => {
          // ============================================
          // Bibliotecas pesadas (lazy load sob demanda)
          // ============================================
          if (id.includes('jspdf') || id.includes('autotable')) {
            return 'pdf-export'; // 388KB → lazy loaded only when exporting
          }
          if (id.includes('html2canvas')) {
            return 'screenshot'; // 201KB → lazy loaded only when needed
          }
          if (id.includes('recharts') || id.includes('victory') || id.includes('d3')) {
            return 'charts'; // 449KB → lazy loaded only on analytics pages
          }
          if (id.includes('monaco-editor') || id.includes('prismjs')) {
            return 'code-editor'; // Editor de código (se existir)
          }

          // ============================================
          // Chunks por Feature (code splitting)
          // ============================================
          
          // Feature: Calculadoras
          if (id.includes('/pages/SimpleCalculator') || 
              id.includes('/pages/AdvancedCalculator') ||
              id.includes('/pages/TaxCalculator') ||
              id.includes('/pages/BatchCalculator') ||
              id.includes('/pages/BiddingCalculator') ||
              id.includes('/components/calculator')) {
            return 'feature-calculators';
          }
          
          // Feature: Analytics
          if (id.includes('/pages/Analytics') || 
              id.includes('/pages/AdvancedAnalytics') ||
              id.includes('/components/analytics')) {
            return 'feature-analytics';
          }
          
          // Feature: IA/Azuria AI
          if (id.includes('/azuria_ai/') || 
              id.includes('/pages/AzuriaAI') ||
              id.includes('/components/ai')) {
            return 'feature-ai';
          }
          
          // Feature: Integrações
          if (id.includes('/pages/Integration') || 
              id.includes('/components/integrations')) {
            return 'feature-integrations';
          }
          
          // Feature: Licitações
          if (id.includes('/pages/Bidding') || 
              id.includes('/components/bidding')) {
            return 'feature-bidding';
          }
          
          // Feature: Marketplace
          if (id.includes('/pages/Marketplace') || 
              id.includes('/components/marketplace')) {
            return 'feature-marketplace';
          }

          // ============================================
          // Vendor chunks (node_modules)
          // ============================================
          if (id.includes('node_modules')) {
            // UI Framework
            if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('cmdk')) {
              return 'vendor-ui';
            }
            // Data layer
            if (id.includes('@tanstack') || id.includes('@supabase')) {
              return 'vendor-data';
            }
            // Animações
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // Forms
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'vendor-forms';
            }
            // Utils gerais
            if (id.includes('date-fns') || id.includes('clsx') || id.includes('class-variance')) {
              return 'vendor-utils';
            }
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
