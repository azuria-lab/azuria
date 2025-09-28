// Core Web Vitals Analysis Script for Azuria
// Integrates with Application Insights for real-time performance monitoring

export interface WebVitalsMetrics {
  fcp: number;      // First Contentful Paint
  lcp: number;      // Largest Contentful Paint
  fid: number;      // First Input Delay
  cls: number;      // Cumulative Layout Shift
  ttfb: number;     // Time to First Byte
  inp: number;      // Interaction to Next Paint
}

export interface PerformanceThresholds {
  fcp: { good: number; needsImprovement: number };
  lcp: { good: number; needsImprovement: number };
  fid: { good: number; needsImprovement: number };
  cls: { good: number; needsImprovement: number };
  ttfb: { good: number; needsImprovement: number };
  inp: { good: number; needsImprovement: number };
}

// Google's Core Web Vitals thresholds
const THRESHOLDS: PerformanceThresholds = {
  fcp: { good: 1800, needsImprovement: 3000 },      // 1.8s good, 3.0s needs improvement
  lcp: { good: 2500, needsImprovement: 4000 },      // 2.5s good, 4.0s needs improvement  
  fid: { good: 100, needsImprovement: 300 },        // 100ms good, 300ms needs improvement
  cls: { good: 0.1, needsImprovement: 0.25 },       // 0.1 good, 0.25 needs improvement
  ttfb: { good: 800, needsImprovement: 1800 },      // 800ms good, 1.8s needs improvement
  inp: { good: 200, needsImprovement: 500 }         // 200ms good, 500ms needs improvement
};

class CoreWebVitalsMonitor {
  private metrics: Partial<WebVitalsMetrics> = {};
  private readonly appInsights: any;
  
  constructor(appInsights?: any) {
    this.appInsights = appInsights;
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    // Use Web Vitals library or manual implementation
    this.measureFCP();
    this.measureLCP();
    this.measureFID();
    this.measureCLS();
    this.measureTTFB();
    this.measureINP();
  }

  private measureFCP(): void {
    // First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
      
      if (fcpEntry) {
        this.metrics.fcp = fcpEntry.startTime;
        this.reportMetric('FCP', fcpEntry.startTime);
        observer.disconnect();
      }
    });
    
    observer.observe({ entryTypes: ['paint'] });
  }

  private measureLCP(): void {
    // Largest Contentful Paint
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      this.metrics.lcp = lastEntry.startTime;
      this.reportMetric('LCP', lastEntry.startTime);
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Stop observing after page load
    addEventListener('load', () => {
      setTimeout(() => observer.disconnect(), 0);
    });
  }

  private measureFID(): void {
    // First Input Delay
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0];
      
      this.metrics.fid = firstEntry.processingStart - firstEntry.startTime;
      this.reportMetric('FID', this.metrics.fid);
      observer.disconnect();
    });
    
    observer.observe({ entryTypes: ['first-input'] });
  }

  private measureCLS(): void {
    // Cumulative Layout Shift
    let clsValue = 0;
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      
      this.metrics.cls = clsValue;
      this.reportMetric('CLS', clsValue);
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
    
    // Report final CLS on page unload
    addEventListener('beforeunload', () => {
      observer.disconnect();
    });
  }

  private measureTTFB(): void {
    // Time to First Byte
    const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (navEntry) {
      this.metrics.ttfb = navEntry.responseStart - navEntry.requestStart;
      this.reportMetric('TTFB', this.metrics.ttfb);
    }
  }

  private measureINP(): void {
    // Interaction to Next Paint (replaces FID in 2024)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      for (const entry of entries) {
        const inp = entry.processingEnd - entry.startTime;
        
        if (!this.metrics.inp || inp > this.metrics.inp) {
          this.metrics.inp = inp;
          this.reportMetric('INP', inp);
        }
      }
    });
    
    if (PerformanceObserver.supportedEntryTypes.includes('event')) {
      observer.observe({ entryTypes: ['event'] });
    }
  }

  private reportMetric(name: string, value: number): void {
    const threshold = THRESHOLDS[name.toLowerCase() as keyof PerformanceThresholds];
    let rating: 'good' | 'needsImprovement' | 'poor' = 'poor';
    
    if (threshold) {
      if (value <= threshold.good) {
        rating = 'good';
      } else if (value <= threshold.needsImprovement) {
        rating = 'needsImprovement';
      }
    }

    // Report to Application Insights
    if (this.appInsights) {
      this.appInsights.trackMetric({
        name: `CoreWebVitals.${name}`,
        average: value,
        properties: {
          rating,
          url: window.location.href,
          userAgent: navigator.userAgent,
          connectionType: (navigator as any).connection?.effectiveType || 'unknown'
        }
      });
    }

    // Report to Service Worker for caching optimization
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'TRACK_PERFORMANCE',
        metric: name,
        value,
        rating,
        timestamp: Date.now()
      });
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      const color = rating === 'good' ? '🟢' : rating === 'needsImprovement' ? '🟡' : '🔴';
      console.log(`${color} ${name}: ${value.toFixed(2)}ms (${rating})`);
    }
  }

  public getMetrics(): Partial<WebVitalsMetrics> {
    return { ...this.metrics };
  }

  public generateReport(): string {
    const report = Object.entries(this.metrics)
      .map(([metric, value]) => {
        const threshold = THRESHOLDS[metric as keyof PerformanceThresholds];
        if (!threshold) return '';
        
        let rating: string;
        if (value <= threshold.good) {
          rating = '🟢 Bom';
        } else if (value <= threshold.needsImprovement) {
          rating = '🟡 Precisa Melhorar';
        } else {
          rating = '🔴 Ruim';
        }
        
        return `${metric.toUpperCase()}: ${value.toFixed(2)}${metric === 'cls' ? '' : 'ms'} ${rating}`;
      })
      .filter(Boolean)
      .join('\n');
    
    return `📊 Core Web Vitals Report:\n${report}`;
  }
}

// Initialize monitoring when DOM is ready
export function initCoreWebVitals(appInsights?: any): CoreWebVitalsMonitor {
  const monitor = new CoreWebVitalsMonitor(appInsights);
  
  // Schedule report generation
  setTimeout(() => {
    const report = monitor.generateReport();
    console.log(report);
    
    // Send summary to Application Insights
    if (appInsights) {
      appInsights.trackEvent({
        name: 'CoreWebVitalsReport',
        properties: { 
          report,
          metrics: monitor.getMetrics(),
          url: window.location.href
        }
      });
    }
  }, 10000); // Wait 10 seconds for all metrics to be collected
  
  return monitor;
}

// Performance optimization recommendations
export const optimizationRecommendations = {
  fcp: [
    'Otimizar carregamento de fontes',
    'Reduzir JavaScript bloqueante',
    'Implementar resource hints (preload, prefetch)',
    'Otimizar imagens críticas'
  ],
  lcp: [
    'Otimizar imagens do hero section',
    'Implementar lazy loading',
    'Usar CDN para assets estáticos',
    'Reduzir tempo de resposta do servidor'
  ],
  fid: [
    'Dividir JavaScript em chunks menores',
    'Implementar code splitting',
    'Usar Web Workers para processamento pesado',
    'Otimizar event listeners'
  ],
  cls: [
    'Definir dimensões para imagens e vídeos',
    'Reservar espaço para conteúdo dinâmico',
    'Evitar inserção de conteúdo acima do fold',
    'Usar transform em vez de propriedades que causam layout'
  ],
  ttfb: [
    'Otimizar consultas de banco de dados',
    'Implementar cache no servidor',
    'Usar CDN',
    'Otimizar configuração do servidor'
  ],
  inp: [
    'Otimizar handlers de eventos',
    'Implementar debouncing/throttling',
    'Usar requestIdleCallback',
    'Reduzir complexidade de renderização'
  ]
};

export default CoreWebVitalsMonitor;