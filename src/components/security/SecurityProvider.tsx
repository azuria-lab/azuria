
import React, { useEffect } from 'react';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useAuthContext } from '@/domains/auth';
import { SecurityMonitoringService } from '@/services/securityMonitoringService';
import { AuditLogService } from '@/services/auditLogService';
import { SecurityContext } from './SecurityContext';
import { logger } from '@/services/logger';

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  // Always call hooks at the top level
  const authContext = useAuthContext();
  const securityMonitor = useSecurityMonitor();
  const auditLog = useAuditLog();

  // Initialize enhanced security monitoring
  useEffect(() => {
    try {
      SecurityMonitoringService.initialize();
      
      // Sync any fallback audit logs when online
      if (navigator.onLine) {
        AuditLogService.syncFallbackLogs();
      }
      
      // Listen for online events to sync logs
      const handleOnline = () => AuditLogService.syncFallbackLogs();
      window.addEventListener('online', handleOnline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
      };
    } catch (error) {
      if (import.meta.env?.DEV) {
        logger.warn('Failed to initialize security monitoring', error);
      }
    }
  }, []);

  // Auto-log authentication events - only when ready and user exists
  useEffect(() => {
    if (authContext?.user && auditLog) {
      // Log to both old system and new secure audit service
      auditLog.logAction('User Login', 'auth', { 
        userId: authContext.user.id,
        loginTime: new Date().toISOString()
      }, 'low', true);
      
      // Enhanced server-side logging
    AuditLogService.logAuthEvent('login', {
        userId: authContext.user.id,
        loginTime: new Date().toISOString(),
        sessionId: sessionStorage.getItem('analytics_session')
      }, true);
    }
  }, [authContext?.user, auditLog]);

  // Monitor for security events - only when ready
  useEffect(() => {
    const handleSecurityEvent = (event: CustomEvent) => {
      const { type, details, severity } = event.detail;
      
      if (auditLog) {
        auditLog.logAction(
          `Security Event: ${type}`,
          'security',
          details,
          severity || 'medium',
          true
        );
      }

      if (securityMonitor && (severity === 'high' || severity === 'critical')) {
        securityMonitor.addAlert({
          type: 'suspicious_activity',
          severity,
          message: `Security event detected: ${type}`
        });
      }
    };

    window.addEventListener('security-event', handleSecurityEvent as EventListener);
    
    return () => {
      window.removeEventListener('security-event', handleSecurityEvent as EventListener);
    };
  }, [auditLog, securityMonitor]);

  const value = {
    securityMonitor,
    auditLog
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};

// Helper function to dispatch security events
// Note: helper utilities are exported from a separate module to preserve fast-refresh behavior
