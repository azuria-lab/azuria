import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import ErrorBoundary from './components/layout/ErrorBoundary.tsx';
import './index.css';

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

// Global error listeners
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Log errors in development, send to monitoring in production
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error:', event.error || event.message || event);
    }
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    if (process.env.NODE_ENV === 'development') {
      console.error('Unhandled promise rejection:', (event as PromiseRejectionEvent).reason || event);
    }
  });
}

// Create root instance
const root = createRoot(container);

// Main app initialization
const initializeApp = () => {
  try {
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>
    );
    
    // Initialize additional services after app loads
    initializeServices();
    
  } catch (error) {
    console.error("Failed to render app:", error);
    
    // Fallback error UI
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

// Initialize services (lazy loaded to avoid blocking main bundle)
const initializeServices = async () => {
  try {
    // Register Service Worker in production
    if (process.env.NODE_ENV === 'production') {
      registerServiceWorker();
    }
    
    // Initialize performance monitoring
    if (process.env.NODE_ENV === 'production') {
      // Load web vitals monitoring
      import('./utils/webVitalsOptimizer')
        .then(module => {
          if (module.webVitalsOptimizer?.initialize) {
            module.webVitalsOptimizer.initialize();
          }
        })
        .catch(() => {
          // Fallback to basic web vitals
          import('./utils/webVitalsReporter')
            .then(module => {
              if (module.reportWebVitals) {
                module.reportWebVitals();
              }
            })
            .catch(() => { /* Fail silently */ });
        });
    }
    
    // Initialize logger service
    import('./services/logger')
      .then(module => {
        if (process.env.NODE_ENV === 'development') {
          module.logger?.info?.('✅ App initialized successfully');
        }
      })
      .catch(() => { /* Logger not available */ });
      
  } catch (error) {
    // Services initialization failed, but app should still work
    console.warn('Some services failed to initialize:', error);
  }
};

// Service Worker registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      if (process.env.NODE_ENV === 'development') {
        console.info('✅ Service Worker registered successfully:', registration);
      }
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New version available
              if (process.env.NODE_ENV === 'development') {
                console.info('🔄 New version available');
              }
            }
          });
        }
      });
      
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
    }
  }
};

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}