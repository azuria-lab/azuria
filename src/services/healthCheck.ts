/**
 * Health Check Service
 * Sistema de monitoramento de saúde da aplicação
 */

import React from 'react';
import { logger } from '@/services/logger';
import { supabase } from '@/integrations/supabase/client';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  checks: HealthCheck[];
  overallScore: number;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  responseTime: number;
  message?: string;
  details?: Record<string, unknown>;
}

export interface HealthCheckConfig {
  enabled: boolean;
  interval: number; // ms
  timeout: number; // ms
  retries: number;
  endpoints: HealthEndpoint[];
}

export interface HealthEndpoint {
  name: string;
  url?: string;
  check: () => Promise<HealthCheck>;
  critical: boolean;
}

export class HealthCheckService {
  private static instance: HealthCheckService;
  private config: HealthCheckConfig;
  private currentStatus: HealthStatus | null = null;
  private checkInterval?: number;
  private listeners: ((status: HealthStatus) => void)[] = [];

  private constructor() {
    this.config = {
      enabled: true,
      interval: 30000, // 30 seconds
      timeout: 5000,   // 5 seconds
      retries: 3,
      endpoints: []
    };
  }

  static getInstance(): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService();
    }
    return HealthCheckService.instance;
  }

  /**
   * Initialize health checks
   */
  initialize(config?: Partial<HealthCheckConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    this.setupDefaultChecks();

    if (this.config.enabled) {
  this.startMonitoring();
  logger.info('Health monitoring started');
    }
  }

  /**
   * Add health check listener
   */
  onStatusChange(callback: (status: HealthStatus) => void) {
    this.listeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Run all health checks
   */
  async runHealthChecks(): Promise<HealthStatus> {
    const startTime = Date.now();
    const checks: HealthCheck[] = [];

    for (const endpoint of this.config.endpoints) {
      try {
        const check = await this.runSingleCheck(endpoint);
        checks.push(check);
      } catch (error) {
        checks.push({
          name: endpoint.name,
          status: 'fail',
          responseTime: Date.now() - startTime,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    const status = this.calculateOverallStatus(checks);
    this.currentStatus = status;
    this.notifyListeners(status);

    return status;
  }

  /**
   * Get current health status
   */
  getCurrentStatus(): HealthStatus | null {
    return this.currentStatus;
  }

  /**
   * Stop monitoring
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = undefined;
    }
  }

  /**
   * Get health history (from localStorage)
   */
  getHealthHistory(hours: number = 24): HealthStatus[] {
    try {
      const history = JSON.parse(
        localStorage.getItem('azuria-health-history') || '[]'
      ) as Array<{ timestamp: string } & Omit<HealthStatus, 'timestamp'>>;
      
      const cutoff = Date.now() - (hours * 60 * 60 * 1000);
      return history
        .filter((h) => new Date(h.timestamp).getTime() > cutoff)
        .map((h) => ({
          ...h,
          timestamp: new Date(h.timestamp)
        }));
    } catch {
      return [];
    }
  }

  private async runSingleCheck(endpoint: HealthEndpoint): Promise<HealthCheck> {
    const startTime = Date.now();
    
    try {
      const result = await Promise.race([
        endpoint.check(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), this.config.timeout)
        )
      ]);

      return {
        ...result,
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        name: endpoint.name,
        status: 'fail',
        responseTime: Date.now() - startTime,
        message: error instanceof Error ? error.message : 'Check failed'
      };
    }
  }

  private calculateOverallStatus(checks: HealthCheck[]): HealthStatus {
    const criticalChecks = this.config.endpoints.filter(e => e.critical);
    const criticalResults = checks.filter(check => 
      criticalChecks.some(c => c.name === check.name)
    );

    const failedCritical = criticalResults.filter(c => c.status === 'fail').length;
    const totalFailed = checks.filter(c => c.status === 'fail').length;
    const totalWarnings = checks.filter(c => c.status === 'warn').length;

    let status: HealthStatus['status'];
    let overallScore: number;

    if (failedCritical > 0) {
      status = 'unhealthy';
      overallScore = 0;
    } else if (totalFailed > 0 || totalWarnings > checks.length / 2) {
      status = 'degraded';
      overallScore = Math.max(0, 100 - (totalFailed * 30) - (totalWarnings * 10));
    } else {
      status = 'healthy';
      overallScore = Math.max(70, 100 - (totalWarnings * 5));
    }

    return {
      status,
      timestamp: new Date(),
      checks,
      overallScore
    };
  }

  private startMonitoring() {
    // Run initial check
    this.runHealthChecks();

    // Set up periodic checks
    this.checkInterval = window.setInterval(() => {
      this.runHealthChecks();
    }, this.config.interval);
  }

  private notifyListeners(status: HealthStatus) {
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
  logger.error('Health check listener error:', error);
      }
    });

    // Store in history
    this.storeHealthHistory(status);
  }

  private storeHealthHistory(status: HealthStatus) {
    try {
      const history = this.getHealthHistory(24);
      history.push(status);

      // Keep only last 100 entries
      if (history.length > 100) {
        history.splice(0, history.length - 100);
      }

      localStorage.setItem('azuria-health-history', JSON.stringify(history));
    } catch (error) {
      logger.error('Failed to store health history:', error);
    }
  }

  private setupDefaultChecks() {
    this.config.endpoints = [
      // Database connectivity
      {
        name: 'database',
        critical: true,
        check: async (): Promise<HealthCheck> => {
          const startTime = Date.now();
          try {
            const { error } = await supabase
              .from('user_profiles')
              .select('count')
              .limit(1);

            if (error) {throw error;}

            return {
              name: 'database',
              status: 'pass',
              responseTime: Date.now() - startTime,
              message: 'Database connection healthy'
            };
          } catch (error) {
            return {
              name: 'database',
              status: 'fail',
              responseTime: Date.now() - startTime,
              message: error instanceof Error ? error.message : 'Database error'
            };
          }
        }
      },

      // Authentication service
      {
        name: 'auth',
        critical: true,
        check: async (): Promise<HealthCheck> => {
          const startTime = Date.now();
          try {
            const { error } = await supabase.auth.getSession();
            
            if (error) {throw error;}

            return {
              name: 'auth',
              status: 'pass',
              responseTime: Date.now() - startTime,
              message: 'Authentication service healthy'
            };
          } catch (error) {
            return {
              name: 'auth',
              status: 'fail',
              responseTime: Date.now() - startTime,
              message: error instanceof Error ? error.message : 'Auth error'
            };
          }
        }
      },

      // Local storage
      {
        name: 'localStorage',
        critical: false,
        check: async (): Promise<HealthCheck> => {
          const startTime = Date.now();
          try {
            const testKey = 'azuria-health-test';
            const testValue = Date.now().toString();
            
            localStorage.setItem(testKey, testValue);
            const retrieved = localStorage.getItem(testKey);
            localStorage.removeItem(testKey);

            if (retrieved !== testValue) {
              throw new Error('localStorage read/write mismatch');
            }

            return {
              name: 'localStorage',
              status: 'pass',
              responseTime: Date.now() - startTime,
              message: 'Local storage working'
            };
          } catch (error) {
            return {
              name: 'localStorage',
              status: 'warn',
              responseTime: Date.now() - startTime,
              message: error instanceof Error ? error.message : 'localStorage error'
            };
          }
        }
      },

      // Performance check
      {
        name: 'performance',
        critical: false,
        check: async (): Promise<HealthCheck> => {
          const startTime = Date.now();
          try {
            // Simple CPU performance test
            const iterations = 100000;
            let sum = 0;
            for (let i = 0; i < iterations; i++) {
              sum += Math.random();
            }

            const responseTime = Date.now() - startTime;
            
            return {
              name: 'performance',
              status: responseTime < 100 ? 'pass' : 'warn',
              responseTime,
              message: `Performance test completed in ${responseTime}ms`,
              details: { iterations, sum }
            };
          } catch (error) {
            return {
              name: 'performance',
              status: 'warn',
              responseTime: Date.now() - startTime,
              message: error instanceof Error ? error.message : 'Performance test failed'
            };
          }
        }
      }
    ];
  }
}

// Global instance
export const healthCheck = HealthCheckService.getInstance();

// React hook for health monitoring
export const useHealthCheck = () => {
  const [status, setStatus] = React.useState<HealthStatus | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    // Get current status
    setStatus(healthCheck.getCurrentStatus());

    // Subscribe to status changes
    const unsubscribe = healthCheck.onStatusChange(setStatus);

    return unsubscribe;
  }, []);

  const runCheck = async () => {
    setIsLoading(true);
    try {
      const result = await healthCheck.runHealthChecks();
      setStatus(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const getHistory = (hours?: number) => {
    return healthCheck.getHealthHistory(hours);
  };

  return {
    status,
    isLoading,
    runCheck,
    getHistory
  };
};
