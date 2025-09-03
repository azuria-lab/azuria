
import { useCallback, useEffect, useState } from 'react';
import { useAuditLog } from './useAuditLog';
import { useRateLimit } from './useRateLimit';
import { securityMiddleware } from '@/middleware/securityMiddleware';
import { SECURITY_CONFIG } from '@/config/security';

interface SecurityAlert {
  id: string;
  type: 'rate_limit' | 'suspicious_activity' | 'failed_auth' | 'data_breach';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export const useSecurityMonitor = () => {
  const { logAction, getAuditLogs } = useAuditLog();
  const apiRateLimit = useRateLimit({ maxRequests: 100, windowMs: 60000, identifier: 'api' });
  const authRateLimit = useRateLimit({ maxRequests: 5, windowMs: 300000, identifier: 'auth' });
  
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);

  // Monitor for suspicious patterns
  useEffect(() => {
    const checkSecurity = () => {
      const recentLogs = getAuditLogs({
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      });

      // Check for failed authentication attempts
      const failedAuthAttempts = recentLogs.filter(
        log => log.category === 'auth' && !log.success
      ).length;

      if (failedAuthAttempts > 10) {
        addAlert({
          type: 'failed_auth',
          severity: 'high',
          message: `${failedAuthAttempts} failed authentication attempts detected in the last 24 hours`
        });
      }

      // Check for rate limit violations
      if (apiRateLimit.isLimited) {
        addAlert({
          type: 'rate_limit',
          severity: 'medium',
          message: 'API rate limit exceeded'
        });
      }

      if (authRateLimit.isLimited) {
        addAlert({
          type: 'rate_limit',
          severity: 'high',
          message: 'Authentication rate limit exceeded - possible brute force attack'
        });
      }
    };

    const interval = setInterval(checkSecurity, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [getAuditLogs, apiRateLimit.isLimited, authRateLimit.isLimited]);

  const addAlert = useCallback((alertData: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved'>) => {
    const alert: SecurityAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      resolved: false
    };

    setAlerts(prev => [alert, ...prev.slice(0, 49)]); // Keep last 50 alerts
    
    // Log the security alert
    logAction('Security Alert Generated', 'security', {
      alert_type: alert.type,
      severity: alert.severity,
      message: alert.message
    }, alert.severity === 'critical' ? 'high' : 'medium');

    return alert;
  }, [logAction]);

  const resolveAlert = useCallback((alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  }, []);

  const getUnresolvedAlerts = useCallback(() => {
    return alerts.filter(alert => !alert.resolved);
  }, [alerts]);

  const clearResolvedAlerts = useCallback(() => {
    setAlerts(prev => prev.filter(alert => !alert.resolved));
  }, []);

  return {
    alerts,
    addAlert,
    resolveAlert,
    getUnresolvedAlerts,
    clearResolvedAlerts,
    apiRateLimit,
    authRateLimit
  };
};
