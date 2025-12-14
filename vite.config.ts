
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "node:path";
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
        manualChunks: getChunkName,
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

// ============================================
// Chunk naming strategy (extracted for clarity)
// ============================================

// Heavy libraries patterns (lazy loaded on demand)
const heavyLibPatterns: Record<string, string> = {
  'jspdf': 'pdf-export',
  'autotable': 'pdf-export',
  'html2canvas': 'screenshot',
  'recharts': 'charts',
  'victory': 'charts',
  'd3': 'charts',
  'monaco-editor': 'code-editor',
  'prismjs': 'code-editor',
};

// Feature patterns (code splitting by feature)
const featurePatterns: Array<{ patterns: string[]; chunk: string }> = [
  { 
    patterns: ['/pages/RapidCalculator', '/pages/AdvancedCalculator', '/pages/TaxCalculator', '/pages/BatchCalculator', '/pages/BiddingCalculator', '/components/calculator'],
    chunk: 'feature-calculators'
  },
  { patterns: ['/pages/Analytics', '/pages/AdvancedAnalytics', '/components/analytics'], chunk: 'feature-analytics' },
  { patterns: ['/azuria_ai/', '/pages/AzuriaAI', '/components/ai'], chunk: 'feature-ai' },
  { patterns: ['/pages/Integration', '/components/integrations'], chunk: 'feature-integrations' },
  { patterns: ['/pages/Bidding', '/components/bidding'], chunk: 'feature-bidding' },
  { patterns: ['/pages/Marketplace', '/components/marketplace'], chunk: 'feature-marketplace' },
];

// Vendor patterns (node_modules)
const vendorPatterns: Record<string, string> = {
  '@radix-ui': 'vendor-ui',
  'lucide-react': 'vendor-ui',
  'cmdk': 'vendor-ui',
  '@tanstack': 'vendor-data',
  '@supabase': 'vendor-data',
  'framer-motion': 'vendor-motion',
  'react-hook-form': 'vendor-forms',
  'zod': 'vendor-forms',
  'date-fns': 'vendor-utils',
  'clsx': 'vendor-utils',
  'class-variance': 'vendor-utils',
};

function getChunkName(id: string): string | undefined {
  // Check heavy libraries first
  for (const [pattern, chunk] of Object.entries(heavyLibPatterns)) {
    if (id.includes(pattern)) {return chunk;}
  }
  
  // Check feature patterns
  for (const { patterns, chunk } of featurePatterns) {
    if (patterns.some(p => id.includes(p))) {return chunk;}
  }
  
  // Check vendor patterns (only for node_modules)
  if (id.includes('node_modules')) {
    for (const [pattern, chunk] of Object.entries(vendorPatterns)) {
      if (id.includes(pattern)) {return chunk;}
    }
  }
  
  return undefined;
}
