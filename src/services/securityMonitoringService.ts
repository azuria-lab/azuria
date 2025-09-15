import { AuditLogService } from './auditLogService';
import { logger } from './logger';

interface SecurityAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, unknown>;
  timestamp: number;
  resolved: boolean;
}

type SecurityEventDetail = {
  type: string;
  details?: Record<string, unknown>;
  severity?: SecurityAlert['severity'];
};

export class SecurityMonitoringService {
  private static alerts: SecurityAlert[] = [];
  private static patterns: Map<string, number> = new Map();
  private static readonly MAX_ALERTS = 50;
  private static readonly PATTERN_WINDOW = 60000; // 1 minute

  /**
   * Initialize security monitoring
   */
  static initialize(): void {
  // Listen for custom security events
  window.addEventListener('security-event', ((e: Event) => this.handleSecurityEvent(e as CustomEvent<SecurityEventDetail>)).bind(this) as EventListener);
    
    // Monitor failed authentication attempts
    this.setupAuthFailureMonitoring();
    
    // Monitor suspicious network activity
    this.setupNetworkMonitoring();
    
    // Setup periodic cleanup
    setInterval(() => this.cleanupOldPatterns(), 30000); // Every 30 seconds
    
  logger.info('🛡️ Security monitoring initialized');
  }

  /**
   * Handle security events
   */
  private static handleSecurityEvent(event: CustomEvent<SecurityEventDetail>): void {
    const { type, details, severity = 'medium' } = event.detail || { type: 'unknown', severity: 'medium' };
    
    // Track patterns
    this.trackPattern(type);
    
    // Create alert if needed
    if (severity === 'high' || severity === 'critical') {
  this.createAlert(type, severity, `Security event detected: ${type}`, details || {});
    }
    
    // Log to audit system
    AuditLogService.logSecurityEvent(
      `security_monitor_${type.toLowerCase().replace(/\s+/g, '_')}`,
      'security',
      details,
      severity === 'critical' ? 'high' : severity
    );
  }

  /**
   * Create security alert
   */
  private static createAlert(
    type: string,
    severity: SecurityAlert['severity'],
    message: string,
  details: Record<string, unknown>
  ): void {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      details,
      timestamp: Date.now(),
      resolved: false
    };

    this.alerts.unshift(alert);
    
    // Keep only MAX_ALERTS
    if (this.alerts.length > this.MAX_ALERTS) {
      this.alerts = this.alerts.slice(0, this.MAX_ALERTS);
    }

    // Auto-resolve low severity alerts after 5 minutes
    if (severity === 'low') {
      setTimeout(() => this.resolveAlert(alert.id), 300000);
    }

  logger.warn(`🚨 Security Alert [${severity.toUpperCase()}]: ${message}`, details);
    
    // Dispatch event for UI components
    window.dispatchEvent(new CustomEvent('security-alert', { detail: alert }));
  }

  /**
   * Track security patterns
   */
  private static trackPattern(type: string): void {
    const now = Date.now();
    const key = `${type}_${Math.floor(now / this.PATTERN_WINDOW)}`;
    
    const count = (this.patterns.get(key) || 0) + 1;
    this.patterns.set(key, count);
    
    // Check for suspicious patterns
    if (count >= 5) {
      this.createAlert(
        'Suspicious Pattern',
        'high',
        `High frequency of ${type} events detected`,
        { eventType: type, count, timeWindow: '1 minute' }
      );
    }
  }

  /**
   * Setup authentication failure monitoring
   */
  private static setupAuthFailureMonitoring(): void {
    let failureCount = 0;
    const resetTime = 300000; // 5 minutes
    
    window.addEventListener('security-event', ((e: Event) => {
      const event = e as CustomEvent;
  const { type, details } = (event.detail || { type: 'unknown' });
      
  const authEvent = (details as Record<string, unknown> | undefined)?.event;
  if (type === 'Auth State Change' && authEvent === 'SIGNED_OUT') {
        failureCount++;
        
        if (failureCount >= 3) {
          this.createAlert(
            'Multiple Auth Failures',
            'high',
            'Multiple authentication failures detected',
            { failureCount, timeWindow: '5 minutes' }
          );
          
          failureCount = 0; // Reset after alert
        }
        
        // Reset counter after time window
        setTimeout(() => { failureCount = Math.max(0, failureCount - 1); }, resetTime);
      }
    }) as EventListener);
  }

  /**
   * Setup network monitoring
   */
  private static setupNetworkMonitoring(): void {
    const originalFetch = window.fetch;
    let requestCount = 0;
    
  window.fetch = async (...args: Parameters<typeof fetch>): ReturnType<typeof fetch> => {
      requestCount++;
      
      // Monitor for unusual request patterns
      if (requestCount > 100) {
        window.dispatchEvent(new CustomEvent('security-event', {
          detail: {
            type: 'High Network Activity',
            details: { requestCount },
            severity: 'medium'
          }
        }));
        requestCount = 0;
      }
      
      try {
        const response = await originalFetch(...args);
        
        // Monitor for 4xx/5xx responses
        if (response.status >= 400) {
          window.dispatchEvent(new CustomEvent('security-event', {
            detail: {
              type: 'HTTP Error Response',
              details: { 
                status: response.status, 
                url: response.url,
                method: (() => {
                  const arg0 = args[0] as Request | URL | string;
                  const init = args[1] as RequestInit | undefined;
                  if (arg0 instanceof Request) {
                    return arg0.method || 'GET';
                  }
                  return init?.method || 'GET';
                })()
              },
              severity: response.status >= 500 ? 'medium' : 'low'
            }
          }));
        }
        
        return response;
      } catch (error) {
        window.dispatchEvent(new CustomEvent('security-event', {
          detail: {
            type: 'Network Request Failed',
            details: { error: error instanceof Error ? error.message : String(error), url: String(args[0] as unknown) },
            severity: 'medium'
          }
        }));
        throw error;
      }
    };
    
    // Reset request counter every minute
    setInterval(() => { requestCount = 0; }, 60000);
  }

  /**
   * Get current alerts
   */
  static getAlerts(): SecurityAlert[] {
    return [...this.alerts];
  }

  /**
   * Get unresolved alerts
   */
  static getUnresolvedAlerts(): SecurityAlert[] {
    return this.alerts.filter(alert => !alert.resolved);
  }

  /**
   * Resolve alert
   */
  static resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
  logger.info(`🛡️ Security alert resolved: ${alert.type}`);
    }
  }

  /**
   * Clear all alerts
   */
  static clearAlerts(): void {
    this.alerts = [];
  logger.info('🛡️ All security alerts cleared');
  }

  /**
   * Cleanup old patterns
   */
  private static cleanupOldPatterns(): void {
    const now = Date.now();
    const cutoff = Math.floor((now - this.PATTERN_WINDOW * 2) / this.PATTERN_WINDOW);
    
    for (const [key] of this.patterns) {
      const timeSlot = parseInt(key.split('_').pop() || '0');
      if (timeSlot < cutoff) {
        this.patterns.delete(key);
      }
    }
  }

  /**
   * Get security metrics
   */
  static getMetrics(): {
    totalAlerts: number;
    unresolvedAlerts: number;
    criticalAlerts: number;
    recentPatterns: number;
  } {
    const unresolved = this.getUnresolvedAlerts();
    const critical = unresolved.filter(a => a.severity === 'critical');
    
    return {
      totalAlerts: this.alerts.length,
      unresolvedAlerts: unresolved.length,
      criticalAlerts: critical.length,
      recentPatterns: this.patterns.size
    };
  }
}
