/**
 * Monitoring Configuration
 * Centralized configuration for system monitoring and health checks
 */

export interface MonitoringConfig {
  healthCheck: {
    interval: number; // milliseconds
    timeout: number;  // milliseconds
    retries: number;
    endpoints: string[];
  };
  metrics: {
    collection: {
      interval: number;
      batchSize: number;
      retention: number; // days
    };
    thresholds: {
      responseTime: {
        warning: number; // milliseconds
        critical: number;
      };
      errorRate: {
        warning: number; // percentage
        critical: number;
      };
      memoryUsage: {
        warning: number; // percentage
        critical: number;
      };
      cpuUsage: {
        warning: number; // percentage
        critical: number;
      };
    };
  };
  alerts: {
    channels: {
      email: boolean;
      slack: boolean;
      webhook: boolean;
    };
    escalation: {
      levels: number;
      timeout: number; // minutes
    };
  };
  performance: {
    vitals: {
      cls: number;    // Cumulative Layout Shift
      fid: number;    // First Input Delay (ms)
      lcp: number;    // Largest Contentful Paint (ms)
      fcp: number;    // First Contentful Paint (ms)
      ttfb: number;   // Time to First Byte (ms)
    };
    budgets: {
      bundle: number;     // KB
      assets: number;     // KB
      requests: number;   // count
    };
  };
}

export const monitoringConfig: MonitoringConfig = {
  healthCheck: {
    interval: 30000,      // 30 seconds
    timeout: 10000,       // 10 seconds
    retries: 3,
    endpoints: [
      '/api/health',
      '/api/status',
      '/api/ready'
    ]
  },
  metrics: {
    collection: {
      interval: 60000,    // 1 minute
      batchSize: 100,
      retention: 30       // 30 days
    },
    thresholds: {
      responseTime: {
        warning: 200,     // 200ms
        critical: 500     // 500ms
      },
      errorRate: {
        warning: 1,       // 1%
        critical: 5       // 5%
      },
      memoryUsage: {
        warning: 80,      // 80%
        critical: 90      // 90%
      },
      cpuUsage: {
        warning: 70,      // 70%
        critical: 85      // 85%
      }
    }
  },
  alerts: {
    channels: {
      email: true,
      slack: true,
      webhook: false
    },
    escalation: {
      levels: 3,
      timeout: 15         // 15 minutes
    }
  },
  performance: {
    vitals: {
      cls: 0.1,           // Good: < 0.1
      fid: 100,           // Good: < 100ms
      lcp: 2500,          // Good: < 2.5s
      fcp: 1800,          // Good: < 1.8s
      ttfb: 600           // Good: < 600ms
    },
    budgets: {
      bundle: 250,        // 250KB
      assets: 500,        // 500KB
      requests: 50        // 50 requests
    }
  }
};

/**
 * Environment-specific configurations
 */
export const getMonitoringConfig = (env: string = 'production'): MonitoringConfig => {
  const baseConfig = { ...monitoringConfig };

  switch (env) {
    case 'development':
      return {
        ...baseConfig,
        healthCheck: {
          ...baseConfig.healthCheck,
          interval: 60000,    // 1 minute (less frequent)
          timeout: 5000       // 5 seconds
        },
        metrics: {
          ...baseConfig.metrics,
          collection: {
            ...baseConfig.metrics.collection,
            interval: 300000,  // 5 minutes
            retention: 7       // 7 days
          }
        },
        alerts: {
          ...baseConfig.alerts,
          channels: {
            email: false,
            slack: false,
            webhook: true
          }
        }
      };

    case 'staging':
      return {
        ...baseConfig,
        healthCheck: {
          ...baseConfig.healthCheck,
          interval: 45000     // 45 seconds
        },
        metrics: {
          ...baseConfig.metrics,
          collection: {
            ...baseConfig.metrics.collection,
            retention: 14     // 14 days
          }
        }
      };

    case 'production':
    default:
      return baseConfig;
  }
};

/**
 * Utility functions for monitoring
 */
export const MonitoringUtils = {
  /**
   * Check if a metric value exceeds thresholds
   */
  checkThreshold: (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) {
      return 'critical';
    }
    if (value >= thresholds.warning) {
      return 'warning';
    }
    return 'healthy';
  },

  /**
   * Format monitoring data for display
   */
  formatMetric: (value: number, unit: string) => {
    if (unit === 'ms' && value >= 1000) {
      return `${(value / 1000).toFixed(1)}s`;
    }
    if (unit === 'bytes' && value >= 1024) {
      const units = ['B', 'KB', 'MB', 'GB'];
      let size = value;
      let unitIndex = 0;
      
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      
      return `${size.toFixed(1)}${units[unitIndex]}`;
    }
    
    return `${value}${unit}`;
  },

  /**
   * Calculate health score based on metrics
   */
  calculateHealthScore: (metrics: Array<{ status: string }>) => {
    const total = metrics.length;
    const healthy = metrics.filter(m => m.status === 'healthy').length;
    const warning = metrics.filter(m => m.status === 'warning').length;
    
    // Healthy = 100%, Warning = 70%, Critical = 0%
    return Math.round((healthy * 100 + warning * 70) / total);
  },

  /**
   * Generate monitoring report
   */
  generateReport: (metrics: Array<{ status: string; name: string }>, timeRange: string) => {
    const summary = {
      timestamp: new Date().toISOString(),
      timeRange,
      totalMetrics: metrics.length,
      healthyMetrics: metrics.filter(m => m.status === 'healthy').length,
      warningMetrics: metrics.filter(m => m.status === 'warning').length,
      criticalMetrics: metrics.filter(m => m.status === 'critical').length,
      overallScore: MonitoringUtils.calculateHealthScore(metrics)
    };

    return {
      summary,
      metrics,
      recommendations: MonitoringUtils.generateRecommendations(metrics)
    };
  },

  /**
   * Generate recommendations based on current metrics
   */
  generateRecommendations: (metrics: Array<{ status: string }>) => {
    const recommendations: string[] = [];
    
    const criticalMetrics = metrics.filter(m => m.status === 'critical');
    const warningMetrics = metrics.filter(m => m.status === 'warning');
    
    if (criticalMetrics.length > 0) {
      recommendations.push('🚨 Critical issues detected - immediate attention required');
    }
    
    if (warningMetrics.length > 0) {
      recommendations.push('⚠️ Performance degradation detected - optimization recommended');
    }
    
    if (criticalMetrics.length === 0 && warningMetrics.length === 0) {
      recommendations.push('✅ All systems operating within normal parameters');
    }
    
    return recommendations;
  }
};