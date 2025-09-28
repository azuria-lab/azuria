// Web Vitals utility for performance monitoring
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';

interface WebVitalsMetric {
  name: string;
  value: number;
  id: string;
  delta: number;
  entries: PerformanceEntry[];
}

export function initWebVitals() {
  // Only initialize in production
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  try {
    // Core Web Vitals
    onCLS(onPerfEntry);
    // onINP disponível apenas em versões mais recentes
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  } catch (error) {
    console.warn('Web Vitals initialization failed:', error);
  }
}

function onPerfEntry(metric: WebVitalsMetric) {
  // Send to analytics service
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', metric);
  }

  // Send to monitoring service
  sendToMonitoring(metric);
}

async function sendToMonitoring(metric: WebVitalsMetric) {
  try {
    // Send to your monitoring service (e.g., DataDog, New Relic, etc.)
    await fetch('/api/analytics/web-vitals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: metric.name,
        value: metric.value,
        id: metric.id,
        delta: metric.delta,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    });
  } catch (error) {
    // Fail silently to avoid impacting user experience
    console.warn('Failed to send web vitals:', error);
  }
}

// Extend window interface for gtag
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}