
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSecurityMonitor } from '@/hooks/useSecurityMonitor';
import { useAuditLog } from '@/hooks/useAuditLog';
import { useAuthContext } from '@/domains/auth';
import { SecurityMonitoringService } from '@/services/securityMonitoringService';
import { AuditLogService } from '@/services/auditLogService';

interface SecurityContextType {
  securityMonitor: ReturnType<typeof useSecurityMonitor>;
  auditLog: ReturnType<typeof useAuditLog>;
}

const SecurityContext = createContext<SecurityContextType | null>(null);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  
  // Always call hooks at the top level - never conditionally
  let authContext;
  let securityMonitor;
  let auditLog;
  
  try {
    authContext = useAuthContext();
    securityMonitor = useSecurityMonitor();
    auditLog = useAuditLog();
    
    // Set ready state after hooks are successfully called
    if (!isReady) {
      setIsReady(true);
    }
  } catch (error) {
    console.error('Error initializing SecurityProvider:', error);
    
    // Provide safe fallback implementations
    authContext = {
      user: null,
      session: null,
      userProfile: null,
      isLoading: false,
      error: null,
      login: async () => null,
      register: async () => null,
      logout: async () => false,
      resetPassword: async () => false,
      updateProfile: async () => false,
      updatePassword: async () => false,
      updateProStatus: async () => false,
      isAuthenticated: false,
      isPro: false,
    };
    
    securityMonitor = {
      alerts: [],
      addAlert: () => ({
        id: '',
        type: 'suspicious_activity' as const,
        severity: 'low' as const,
        message: '',
        timestamp: new Date(),
        resolved: false
      }),
      resolveAlert: () => {},
      getUnresolvedAlerts: () => [],
      clearResolvedAlerts: () => {},
      apiRateLimit: { 
        checkRateLimit: () => false,
        isLimited: false, 
        getRemainingRequests: () => 100, 
        getResetTime: () => Date.now(),
        reset: () => {}
      },
      authRateLimit: { 
        checkRateLimit: () => false,
        isLimited: false, 
        getRemainingRequests: () => 5, 
        getResetTime: () => Date.now(),
        reset: () => {}
      }
    };
    
    auditLog = {
      logAction: async () => ({
        id: '',
        timestamp: new Date(),
        userId: '',
        action: '',
        category: 'system' as const,
        details: {},
        riskLevel: 'low' as const,
        success: false
      }),
      getAuditLogs: () => [],
      clearAuditLogs: () => {}
    };
  }

  // Initialize enhanced security monitoring
  useEffect(() => {
    if (!isReady) {return;}
    
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
      console.error("🔒 Failed to initialize security monitoring:", error);
    }
  }, [isReady]);

  // Auto-log authentication events - only when ready and user exists
  useEffect(() => {
    if (isReady && authContext?.user && auditLog) {
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
  }, [isReady, authContext?.user, auditLog]);

  // Monitor for security events - only when ready
  useEffect(() => {
    if (!isReady) {return;}

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
  }, [isReady, auditLog, securityMonitor]);

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
export const dispatchSecurityEvent = (type: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') => {
  window.dispatchEvent(new CustomEvent('security-event', {
    detail: { type, details, severity }
  }));
};
