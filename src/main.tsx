import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/layout/ErrorBoundary.tsx';
import { initWebVitals } from '@/utils/webvitals';
import './index.css';
// import { SecurityHeaders } from '@/utils/securityHeaders';
// Note: legacy reporter and optimizer are loaded lazily to avoid pulling web-vitals into main bundle
import { initBundleOptimization } from '@/utils/bundleOptimization';
import { logger } from '@/services/logger';

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

// Global error listeners to surface issues occurring outside React boundaries
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
  logger.error('Global error:', event.error || event.message || event);
  });
  window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection:', (event as PromiseRejectionEvent).reason || event);
  });
}

// Create root instance
const root = createRoot(container);

// Safe initialization function
const initializeApp = () => {
  try {
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
  if (import.meta.env.DEV) {
    // route to logger in dev
    import('@/services/logger').then(m => m.logger.info?.('✅ App initialized successfully'));
  }
    
    // Register Service Worker AFTER app is loaded successfully
    registerServiceWorker();
    
    // Initialize Web Vitals reporting and optimization (only in production)
  if (import.meta.env.PROD) {
      // Lazy-load optimizer so web-vitals stays out of main chunk
      import('@/utils/webVitalsOptimizer')
        .then(mod => mod.webVitalsOptimizer.initialize())
        .catch(() => {/* silent */});
  }
  // New modular web vitals (skip during DEV to lighten startup)
    if (import.meta.env.PROD) {
      initWebVitals();
    }
    // Legacy reporter (opt-in via localStorage flag)
    try {
      if (localStorage.getItem('azuria-enable-legacy-vitals') === 'true') {
        // Lazy-load legacy reporter only when explicitly enabled
        import('@/utils/webVitalsReporter')
          .then(mod => mod.initWebVitalsReporting())
          .catch(() => {/* silent */});
      }
    } catch {
      // ignore storage access errors
    }
    
  // Initialize bundle optimization only in PROD
    if (import.meta.env.PROD) {
      initBundleOptimization();
    }
  } catch (error) {
  logger.error("Failed to render app:", error);
    
    // Simplified fallback UI
    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; font-family: system-ui; background: #f8fafc;">
        <div style="text-align: center; max-width: 400px; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h1 style="color: #ef4444; margin-bottom: 16px; font-size: 24px;">Erro ao Carregar</h1>
          <p style="margin-bottom: 20px; color: #64748b;">Não foi possível inicializar o aplicativo. Tente recarregar a página.</p>
          <button onclick="window.location.reload()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;">
            Recarregar Página
          </button>
        </div>
      </div>
    `;
  }
};

// Service Worker registration function
const registerServiceWorker = async () => {
  // Only register in production and if supported
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return;
  }

  try {
  // Wait briefly to ensure app is fully loaded
  await new Promise(resolve => setTimeout(resolve, 300));
    
  const registration = await navigator.serviceWorker.register('/sw.js');
  logger.info('✅ Service Worker registered successfully:', registration);
    
    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            logger.info('🔄 New version available');
          }
        });
      }
    });
    
  } catch (error) {
  logger.warn('Service Worker registration failed:', error);
    // Don't throw - app should work without SW
  }
};

// Initialize production services
import { errorTracker } from '@/services/errorTracking';
import { healthCheck } from '@/services/healthCheck';
import { backupService } from '@/services/backupService';
import { featureFlags } from '@/services/featureFlags';

// Initialize services
errorTracker.initialize();
// Only enable health checks outside landing pages and in production
try {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const onLanding = path === '/' || path === '/index';
  healthCheck.initialize({ enabled: import.meta.env.PROD && !onLanding });
} catch {
  healthCheck.initialize({ enabled: import.meta.env.PROD });
}
backupService.initialize();
featureFlags.initialize();

// Initialize app immediately if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
