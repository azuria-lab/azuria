// Utilities to optimize bundle behavior and diagnostics
import { logger } from '@/services/logger';

/**
 * Bundle optimization utilities for analyzing and improving performance
 */

// Bundle size analyzer (development only)
export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV !== 'development') {return;}
  
  logger.info?.('📦 Bundle Analysis');
  logger.info?.('Para analisar o bundle, execute: npm run build:analyze');
  logger.info?.('Isso irá gerar um relatório visual dos chunks do bundle');
};

// Resource preloading utility
export const preloadResource = (href: string, as: string) => {
  if (typeof document === 'undefined') {return;}
  
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  // Only add if not already present
  const existing = document.querySelector(`link[href="${href}"]`);
  if (!existing) {
    document.head.appendChild(link);
  }
};

// Critical resource hints
export const addResourceHints = () => {
  if (typeof document === 'undefined') {return;}
  
  // Preconnect to external domains
  const domains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    
    const existing = document.querySelector(`link[href="${domain}"]`);
    if (!existing) {
      document.head.appendChild(link);
    }
  });
};

// Dynamic import with error handling
export const safeDynamicImport = async <T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T> => {
  try {
    return await importFn();
  } catch (error) {
  logger.warn?.('Failed to load dynamic import:', { error });
    if (fallback) {return fallback;}
    throw error;
  }
};

// Monitor bundle loading performance
export const monitorChunkLoading = () => {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {return;}
  
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
      if (entry.name.includes('.js') && entry.duration > 100) {
  logger.warn?.(`🐌 Slow chunk loading: ${entry.name} took ${entry.duration.toFixed(2)}ms`);
      }
    });
  });
  
  observer.observe({ entryTypes: ['resource'] });
  
  return () => observer.disconnect();
};

// Initialize optimization utilities
export const initBundleOptimization = () => {
  if (typeof window === 'undefined') {return;}
  
  // Add resource hints
  addResourceHints();
  
  // Monitor chunk loading in development
  if (process.env.NODE_ENV === 'development') {
    monitorChunkLoading();
    analyzeBundleSize();
  }
};