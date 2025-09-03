import { logger } from '@/services/logger';
/**
 * Error Tracking Service
 * Sistema de monitoramento de erros para produção
 */

export interface TrackedErrorEvent {
  id: string;
  message: string;
  stack?: string;
  url: string;
  line?: number;
  column?: number;
  userAgent: string;
  userId?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: Record<string, unknown>;
  tags?: string[];
}

export interface ErrorTrackingConfig {
  enabled: boolean;
  environment: 'development' | 'staging' | 'production';
  apiEndpoint?: string;
  maxErrors: number;
  reportingThreshold: number;
}

export class ErrorTrackingService {
  private static instance: ErrorTrackingService;
  private config: ErrorTrackingConfig;
  private errorQueue: TrackedErrorEvent[] = [];
  private reportingTimer?: number;

  private constructor() {
    this.config = {
      enabled: true,
  environment: ((import.meta as unknown as { env?: { MODE?: 'development' | 'staging' | 'production' } }).env?.MODE) || 'development',
      maxErrors: 100,
      reportingThreshold: 10
    };
  }

  static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService();
    }
    return ErrorTrackingService.instance;
  }

  /**
   * Initialize error tracking
   */
  initialize(config?: Partial<ErrorTrackingConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (!this.config.enabled) {return;}

    // Global error handler
    window.addEventListener('error', (event: globalThis.ErrorEvent) => {
      const maybeErr = (event as globalThis.ErrorEvent).error as unknown;
      const err = maybeErr instanceof Error ? maybeErr : new Error(event.message);
      this.captureError(err, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        severity: 'high'
      });
    });

    // Unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      this.captureError(
    new Error(`Unhandled Promise Rejection: ${String(event.reason)}`),
        { severity: 'critical' }
      );
    });

    // React error boundary integration
    this.setupReactErrorBoundary();

  logger.info('Error tracking initialized');
  }

  /**
   * Capture error manually
   */
  captureError(
    error: Error, 
    context?: {
      severity?: TrackedErrorEvent['severity'];
      tags?: string[];
      userId?: string;
      extra?: Record<string, unknown>;
      filename?: string;
      lineno?: number;
      colno?: number;
    }
  ) {
    if (!this.config.enabled) {return;}

    const errorEvent: TrackedErrorEvent = {
      id: this.generateErrorId(),
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      line: context?.lineno,
      column: context?.colno,
      userAgent: navigator.userAgent,
      userId: context?.userId,
      timestamp: new Date(),
      severity: context?.severity || 'medium',
      context: context?.extra,
      tags: context?.tags
    };

    this.addToQueue(errorEvent);
    this.logError(errorEvent);

    // Auto-report critical errors immediately
    if (errorEvent.severity === 'critical') {
      this.flushErrors();
    }
  }

  /**
   * Capture exception with context
   */
  captureException(error: Error, context?: Record<string, unknown>) {
    this.captureError(error, {
      severity: 'high',
      extra: context
    });
  }

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb(message: string, category: string = 'default', data?: Record<string, unknown>) {
    if (!this.config.enabled) {return;}

    logger.debug(`[${category}] ${message}`, data);
    
    // Store breadcrumbs for context in future errors
    const breadcrumbs = this.getBreadcrumbs();
    breadcrumbs.push({
      message,
      category,
      data,
      timestamp: new Date()
    });

    // Keep only last 50 breadcrumbs
    if (breadcrumbs.length > 50) {
      breadcrumbs.shift();
    }

    localStorage.setItem('azuria-breadcrumbs', JSON.stringify(breadcrumbs));
  }

  /**
   * Set user context
   */
  setUserContext(userId: string, email?: string, extra?: Record<string, unknown>) {
    localStorage.setItem('azuria-user-context', JSON.stringify({
      userId,
      email,
      ...extra
    }));
  }

  /**
   * Set release version
   */
  setRelease(version: string) {
    localStorage.setItem('azuria-release', version);
  }

  /**
   * Get error statistics
   */
  getErrorStats() {
    return {
      totalErrors: this.errorQueue.length,
      criticalErrors: this.errorQueue.filter(e => e.severity === 'critical').length,
      highErrors: this.errorQueue.filter(e => e.severity === 'high').length,
      mediumErrors: this.errorQueue.filter(e => e.severity === 'medium').length,
      lowErrors: this.errorQueue.filter(e => e.severity === 'low').length,
      recentErrors: this.errorQueue.filter(e => 
        Date.now() - e.timestamp.getTime() < 24 * 60 * 60 * 1000
      ).length
    };
  }

  /**
   * Get recent errors
   */
  getRecentErrors(limit: number = 20): TrackedErrorEvent[] {
    return this.errorQueue
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Clear all errors
   */
  clearErrors() {
    this.errorQueue = [];
  }

  /**
   * Flush errors to reporting service
   */
  private async flushErrors() {
    if (this.errorQueue.length === 0) {return;}

    try {
      // In a real implementation, you would send to your error tracking service
      // For now, we'll just log and store locally
  logger.warn('Error Report:', {
        errors: this.errorQueue,
        environment: this.config.environment,
        breadcrumbs: this.getBreadcrumbs(),
        userContext: this.getUserContext()
      });

      // Store in localStorage for debugging
      const existingErrors = JSON.parse(
        localStorage.getItem('azuria-error-reports') || '[]'
      );
      existingErrors.push({
        timestamp: new Date(),
        errors: this.errorQueue,
        environment: this.config.environment
      });

      // Keep only last 10 reports
      if (existingErrors.length > 10) {
        existingErrors.shift();
      }

      localStorage.setItem('azuria-error-reports', JSON.stringify(existingErrors));

      // Clear queue after reporting
      this.clearErrors();
    } catch (error) {
      logger.error('Failed to flush errors:', error);
    }
  }

  private addToQueue(errorEvent: TrackedErrorEvent) {
    this.errorQueue.push(errorEvent);

    // Limit queue size
    if (this.errorQueue.length > this.config.maxErrors) {
      this.errorQueue.shift();
    }

    // Auto-flush when threshold is reached
    if (this.errorQueue.length >= this.config.reportingThreshold) {
      this.scheduleFlush();
    }
  }

  private scheduleFlush() {
    if (this.reportingTimer) {return;}

    this.reportingTimer = window.setTimeout(() => {
      this.flushErrors();
      this.reportingTimer = undefined;
    }, 5000); // Flush after 5 seconds
  }

  private logError(errorEvent: TrackedErrorEvent) {
    logger.error(`${errorEvent.severity.toUpperCase()} ERROR`, {
      message: errorEvent.message,
      stack: errorEvent.stack,
      context: errorEvent.context,
      tags: errorEvent.tags,
    });
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getBreadcrumbs() {
    try {
      return JSON.parse(localStorage.getItem('azuria-breadcrumbs') || '[]');
    } catch {
      return [];
    }
  }

  private getUserContext() {
    try {
      return JSON.parse(localStorage.getItem('azuria-user-context') || '{}');
    } catch {
      return {};
    }
  }

  private setupReactErrorBoundary() {
    // This would be integrated with your React Error Boundary
  (window as unknown as Record<string, unknown>).__AZURIA_ERROR_HANDLER__ = (error: Error, errorInfo: Record<string, unknown>) => {
      this.captureError(error, {
        severity: 'high',
        tags: ['react-boundary'],
        extra: errorInfo
      });
    };
  }
}

// Global instance
export const errorTracker = ErrorTrackingService.getInstance();

// React hook for error tracking
export const useErrorTracking = () => {
  const captureError = (error: Error, context?: Record<string, unknown>) => {
    errorTracker.captureError(error, context);
  };

  const captureException = (error: Error, context?: Record<string, unknown>) => {
    errorTracker.captureException(error, context);
  };

  const addBreadcrumb = (message: string, category?: string, data?: Record<string, unknown>) => {
    errorTracker.addBreadcrumb(message, category, data);
  };

  return {
    captureError,
    captureException,
    addBreadcrumb,
    getErrorStats: () => errorTracker.getErrorStats(),
    getRecentErrors: (limit?: number) => errorTracker.getRecentErrors(limit)
  };
};
