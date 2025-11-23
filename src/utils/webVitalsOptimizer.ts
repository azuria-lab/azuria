// Advanced Web Vitals Optimization
import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';
import { logger } from '@/services/logger';

// Internal logging helpers (no-op in production)
const debugLog = (...args: unknown[]) => {
  if (!import.meta.env?.PROD) {
    logger.debug(...args);
  }
};
const warnLog = (...args: unknown[]) => {
  if (!import.meta.env?.PROD) {
    logger.warn(...args);
  }
};

interface VitalsData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
  url: string;
  connection?: string;
  deviceMemory?: number;
  hardwareConcurrency?: number;
}

class WebVitalsOptimizer {
  private metrics: VitalsData[] = [];
  private analyticsEndpoint = '/api/analytics/vitals';

  initialize() {
    this.measureCoreVitals();
    this.setupPerformanceObserver();
    this.monitorMemoryUsage();
  }

  private measureCoreVitals() {
    // Largest Contentful Paint
    onLCP(metric => {
      this.recordMetric(
        'LCP',
        metric.value,
        this.getRating('LCP', metric.value)
      );
      this.optimizeLCP(metric.value);
    });

    // Interaction to Next Paint (replaces FID)
    onINP(metric => {
      this.recordMetric(
        'INP',
        metric.value,
        this.getRating('INP', metric.value)
      );
      this.optimizeFID(metric.value);
    });

    // Cumulative Layout Shift
    onCLS(metric => {
      this.recordMetric(
        'CLS',
        metric.value,
        this.getRating('CLS', metric.value)
      );
      this.optimizeCLS(metric.value);
    });

    // First Contentful Paint
    onFCP(metric => {
      this.recordMetric(
        'FCP',
        metric.value,
        this.getRating('FCP', metric.value)
      );
    });

    // Time to First Byte
    onTTFB(metric => {
      this.recordMetric(
        'TTFB',
        metric.value,
        this.getRating('TTFB', metric.value)
      );
    });
  }

  private getRating(
    metric: string,
    value: number
  ): 'good' | 'needs-improvement' | 'poor' {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      INP: { good: 200, poor: 500 },
      CLS: { good: 0.1, poor: 0.25 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 800, poor: 1800 },
    };

    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) {
      return 'good';
    }

    if (value <= threshold.good) {
      return 'good';
    }
    if (value <= threshold.poor) {
      return 'needs-improvement';
    }
    return 'poor';
  }

  private recordMetric(
    name: string,
    value: number,
    rating: 'good' | 'needs-improvement' | 'poor'
  ) {
    const metric: VitalsData = {
      name,
      value,
      rating,
      timestamp: Date.now(),
      url: window.location.href,
      connection: (
        navigator as unknown as { connection?: { effectiveType?: string } }
      ).connection?.effectiveType,
      deviceMemory: (navigator as unknown as { deviceMemory?: number })
        .deviceMemory,
      hardwareConcurrency: navigator.hardwareConcurrency,
    };

    this.metrics.push(metric);
    this.sendMetrics([metric]);

    // Dev log
    debugLog(`📊 ${name}: ${value}ms (${rating})`);
  }

  private optimizeLCP(value: number) {
    if (value > 2500) {
      // Preload critical resources
      this.preloadCriticalResources();

      // Optimize images
      this.optimizeImages();

      // Remove render-blocking resources
      this.removeRenderBlocking();
    }
  }

  private optimizeFID(value: number) {
    if (value > 100) {
      // Break up long tasks
      this.breakUpLongTasks();

      // Use web workers for heavy computations
      this.offloadToWebWorkers();
    }
  }

  private optimizeCLS(value: number) {
    if (value > 0.1) {
      // Set dimensions for images and videos
      this.setMediaDimensions();

      // Avoid inserting content above existing content
      this.preventContentShifts();
    }
  }

  private preloadCriticalResources() {
    const criticalResources = ['/src/index.css', '/src/main.tsx'];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = resource.endsWith('.css') ? 'style' : 'script';
      document.head.appendChild(link);
    });
  }

  private optimizeImages() {
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      if (img instanceof HTMLImageElement) {
        img.loading = 'lazy';
        img.decoding = 'async';
      }
    });
  }

  private removeRenderBlocking() {
    // Defer non-critical CSS
    const nonCriticalCSS = document.querySelectorAll(
      'link[rel="stylesheet"]:not([data-critical])'
    );
    nonCriticalCSS.forEach(link => {
      if (link instanceof HTMLLinkElement) {
        link.media = 'print';
        link.onload = () => {
          link.media = 'all';
        };
      }
    });
  }

  private breakUpLongTasks(): void {
    // Use scheduler.postTask if available to yield
    const sched = (
      window as unknown as {
        scheduler?: { postTask?: (cb: () => void) => Promise<unknown> };
      }
    ).scheduler;
    if (sched?.postTask) {
      void sched.postTask(() => {
        /* yield to scheduler */
      });
      return;
    }
    // Fallback to setTimeout to yield
    setTimeout(() => {
      /* yield to event loop */
    }, 0);
  }

  private offloadToWebWorkers() {
    // Create web workers for heavy calculations
    if (window.Worker) {
      const workerCode = `
        self.addEventListener('message', function(e) {
          const { type, data } = e.data;
          
          switch(type) {
            case 'calculate':
              // Perform heavy calculations here
              const result = performCalculation(data);
              self.postMessage({ type: 'result', data: result });
              break;
          }
        });
        
        function performCalculation(data) {
          // Heavy calculation logic
          return data;
        }
      `;

      const blob = new Blob([workerCode], { type: 'application/javascript' });
      const worker = new Worker(URL.createObjectURL(blob));

      worker.onmessage = e => {
        debugLog('Worker result:', e.data);
      };

      return worker;
    }
  }

  private setMediaDimensions() {
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      if (img instanceof HTMLImageElement) {
        // Set aspect ratio to prevent layout shift
        img.style.aspectRatio = '16/9'; // Default ratio
      }
    });
  }

  private preventContentShifts() {
    // Reserve space for dynamic content
    const dynamicContainers = document.querySelectorAll('[data-dynamic]');
    dynamicContainers.forEach(container => {
      if (container instanceof HTMLElement) {
        container.style.minHeight = '200px'; // Reserve minimum space
      }
    });
  }

  private setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      // Monitor long tasks but be less aggressive
      const longTaskObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.duration > 100) {
            // Only warn for tasks > 100ms
            warnLog(`Long task detected: ${entry.duration}ms`);
            this.recordMetric('LongTask', entry.duration, 'poor');
          }
        });
      });

      try {
        longTaskObserver.observe({ entryTypes: ['longtask'] });
      } catch (_e) {
        // Not supported in all browsers
      }

      // Monitor largest contentful paint candidates
      const lcpObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          debugLog('LCP candidate:', entry);
        });
      });

      try {
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (_e) {
        // Not supported in all browsers
      }
    }
  }

  private monitorMemoryUsage() {
    // Only monitor in development and less frequently
    if (
      !import.meta.env?.PROD &&
      'memory' in (performance as unknown as Record<string, unknown>)
    ) {
      setInterval(() => {
        const mem = (
          performance as unknown as {
            memory?: {
              usedJSHeapSize: number;
              totalJSHeapSize: number;
              jsHeapSizeLimit: number;
            };
          }
        ).memory;
        if (!mem) {
          return;
        }
        const usage = {
          used: mem.usedJSHeapSize,
          total: mem.totalJSHeapSize,
          limit: mem.jsHeapSizeLimit,
        };

        const usagePercent =
          usage.total > 0 ? (usage.used / usage.total) * 100 : 0;

        if (usagePercent > 90) {
          // Only warn at 90%+ to reduce noise
          warnLog('High memory usage detected:', usage);
          this.recordMetric('MemoryUsage', usagePercent, 'poor');
        }
      }, 30000); // Check every 30 seconds instead of 10
    }
  }

  private async sendMetrics(metrics: VitalsData[]) {
    // Only send metrics in production or when explicitly enabled
    if (
      !import.meta.env?.PROD &&
      !localStorage.getItem('azuria-enable-vitals-reporting')
    ) {
      return;
    }

    try {
      await fetch(this.analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics }),
        keepalive: true,
      });
    } catch (error) {
      // Silently fail to avoid console spam
      warnLog('Failed to send vitals data:', error);
    }
  }

  getMetrics(): VitalsData[] {
    return this.metrics;
  }

  getAverageRating(): { [key: string]: number } {
    const ratings = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.name]) {
        acc[metric.name] = [];
      }
      acc[metric.name].push(metric.value);
      return acc;
    }, {} as { [key: string]: number[] });

    return Object.entries(ratings).reduce((acc, [name, values]) => {
      acc[name] = values.reduce((sum, val) => sum + val, 0) / values.length;
      return acc;
    }, {} as { [key: string]: number });
  }
}

export const webVitalsOptimizer = new WebVitalsOptimizer();
