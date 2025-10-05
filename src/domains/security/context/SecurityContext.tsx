/* eslint-disable react-refresh/only-export-components */
import React, { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useReducer } from "react";
import { logger } from '@/services/logger';
import { generateSecureId } from '@/utils/secureRandom';

// Security State Types
export interface SecurityState {
  // Alerts
  alerts: SecurityAlert[];
  
  // Threats
  threats: SecurityThreat[];
  
  // Rate Limiting
  rateLimits: RateLimitStatus[];
  
  // Monitoring
  isMonitoring: boolean;
  
  // Security Metrics
  metrics: SecurityMetrics;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Settings
  settings: {
    autoDetection: boolean;
    alertThreshold: number;
    retentionDays: number;
    enableRateLimit: boolean;
    maxFailedAttempts: number;
  };
}

export interface SecurityAlert {
  id: string;
  type: 'rate_limit' | 'suspicious_activity' | 'failed_auth' | 'data_breach' | 'malicious_request';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  resolved: boolean;
  metadata?: Record<string, unknown>;
}

export interface SecurityThreat {
  id: string;
  type: 'brute_force' | 'sql_injection' | 'xss' | 'csrf' | 'ddos';
  source: string;
  blocked: boolean;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface RateLimitStatus {
  id: string;
  endpoint: string;
  limit: number;
  remaining: number;
  resetTime: Date;
  violations: number;
}

export interface SecurityMetrics {
  totalAlerts: number;
  resolvedAlerts: number;
  blockedThreats: number;
  failedLogins: number;
  rateLimitViolations: number;
  uptime: number;
}

// Security Actions
export type SecurityAction =
  | { type: 'ADD_ALERT'; payload: SecurityAlert }
  | { type: 'SET_ALERTS'; payload: SecurityAlert[] }
  | { type: 'RESOLVE_ALERT'; payload: string }
  | { type: 'ADD_THREAT'; payload: SecurityThreat }
  | { type: 'SET_THREATS'; payload: SecurityThreat[] }
  | { type: 'BLOCK_THREAT'; payload: string }
  | { type: 'UPDATE_RATE_LIMIT'; payload: RateLimitStatus }
  | { type: 'SET_RATE_LIMITS'; payload: RateLimitStatus[] }
  | { type: 'SET_MONITORING'; payload: boolean }
  | { type: 'UPDATE_METRICS'; payload: Partial<SecurityMetrics> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<SecurityState['settings']> }
  | { type: 'CLEAR_RESOLVED_ALERTS' }
  | { type: 'CLEAR_OLD_THREATS' }
  | { type: 'RESET_SECURITY' };

// Security Context Type
export interface SecurityContextType extends SecurityState {
  dispatch: React.Dispatch<SecurityAction>;
  // Actions
  startMonitoring: () => void;
  stopMonitoring: () => void;
  addAlert: (alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved'>) => void;
  resolveAlert: (alertId: string) => void;
  addThreat: (threat: Omit<SecurityThreat, 'id' | 'timestamp' | 'blocked'>) => void;
  blockThreat: (threatId: string) => void;
  checkRateLimit: (endpoint: string, identifier: string) => boolean;
  reportSecurityEvent: (type: string, details: Record<string, unknown>) => void;
  getSecurityReport: () => SecurityReport;
  clearOldData: () => void;
  updateSettings: (settings: Partial<SecurityState['settings']>) => void;
}

export interface SecurityReport {
  summary: {
    totalAlerts: number;
    criticalAlerts: number;
    resolvedAlerts: number;
    activeThreats: number;
    blockedThreats: number;
  };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}

// Initial State
const initialSecurityState: SecurityState = {
  alerts: [],
  threats: [],
  rateLimits: [],
  isMonitoring: false,
  metrics: {
    totalAlerts: 0,
    resolvedAlerts: 0,
    blockedThreats: 0,
    failedLogins: 0,
    rateLimitViolations: 0,
    uptime: 100,
  },
  isLoading: false,
  error: null,
  settings: {
    autoDetection: true,
    alertThreshold: 5,
    retentionDays: 30,
    enableRateLimit: true,
    maxFailedAttempts: 5,
  },
};

// Security Reducer
function securityReducer(state: SecurityState, action: SecurityAction): SecurityState {
  switch (action.type) {
    case 'ADD_ALERT':
      return { 
        ...state, 
        alerts: [action.payload, ...state.alerts.slice(0, 99)], // Keep last 100
        metrics: {
          ...state.metrics,
          totalAlerts: state.metrics.totalAlerts + 1,
        }
      };
    case 'SET_ALERTS':
      return { ...state, alerts: action.payload };
    case 'RESOLVE_ALERT':
      return { 
        ...state, 
        alerts: state.alerts.map(alert => 
          alert.id === action.payload ? { ...alert, resolved: true } : alert
        ),
        metrics: {
          ...state.metrics,
          resolvedAlerts: state.metrics.resolvedAlerts + 1,
        }
      };
    case 'ADD_THREAT':
      return { 
        ...state, 
        threats: [action.payload, ...state.threats.slice(0, 99)] // Keep last 100
      };
    case 'SET_THREATS':
      return { ...state, threats: action.payload };
    case 'BLOCK_THREAT':
      return { 
        ...state, 
        threats: state.threats.map(threat => 
          threat.id === action.payload ? { ...threat, blocked: true } : threat
        ),
        metrics: {
          ...state.metrics,
          blockedThreats: state.metrics.blockedThreats + 1,
        }
      };
    case 'UPDATE_RATE_LIMIT': {
      const existingIndex = state.rateLimits.findIndex(rl => rl.id === action.payload.id);
      const updatedRateLimits = [...state.rateLimits];
      
      if (existingIndex >= 0) {
        updatedRateLimits[existingIndex] = action.payload;
      } else {
        updatedRateLimits.push(action.payload);
      }
      
      return { ...state, rateLimits: updatedRateLimits };
    }
    case 'SET_RATE_LIMITS':
      return { ...state, rateLimits: action.payload };
    case 'SET_MONITORING':
      return { ...state, isMonitoring: action.payload };
    case 'UPDATE_METRICS':
      return { 
        ...state, 
        metrics: { ...state.metrics, ...action.payload } 
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload } 
      };
    case 'CLEAR_RESOLVED_ALERTS':
      return { 
        ...state, 
        alerts: state.alerts.filter(alert => !alert.resolved) 
      };
    case 'CLEAR_OLD_THREATS': {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - state.settings.retentionDays);
      return { 
        ...state, 
        threats: state.threats.filter(threat => threat.timestamp >= cutoffDate) 
      };
    }
    case 'RESET_SECURITY':
      return initialSecurityState;
    default:
      return state;
  }
}

// Default Context Value
const defaultSecurityValue: SecurityContextType = {
  ...initialSecurityState,
  dispatch: () => {},
  startMonitoring: () => {},
  stopMonitoring: () => {},
  addAlert: () => {},
  resolveAlert: () => {},
  addThreat: () => {},
  blockThreat: () => {},
  checkRateLimit: () => false,
  reportSecurityEvent: () => {},
  getSecurityReport: () => ({
    summary: {
      totalAlerts: 0,
      criticalAlerts: 0,
      resolvedAlerts: 0,
      activeThreats: 0,
      blockedThreats: 0,
    },
    riskLevel: 'low',
    recommendations: [],
  }),
  clearOldData: () => {},
  updateSettings: () => {},
};

// Context
const SecurityContext = createContext<SecurityContextType>(defaultSecurityValue);

// Provider
export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(securityReducer, initialSecurityState);

  // Event reporting first
  const reportSecurityEvent = useCallback((type: string, details: Record<string, unknown>) => {
    logger.info(`🔒 Security Event: ${type}`, details);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('security-event', {
        detail: { type, details, timestamp: new Date() }
      }));
    }
  }, []);

  const initSecurityEventListeners = useCallback(() => {
    if (typeof window !== 'undefined') {
      const handleSecurityEvent = (event: CustomEvent) => {
        reportSecurityEvent(event.detail.type, event.detail.details);
      };
      window.addEventListener('security-event', handleSecurityEvent as EventListener);
      return () => {
        window.removeEventListener('security-event', handleSecurityEvent as EventListener);
      };
    }
    return undefined;
  }, [reportSecurityEvent]);

  const startMonitoring = useCallback(() => {
    dispatch({ type: 'SET_MONITORING', payload: true });
    initSecurityEventListeners();
  }, [dispatch, initSecurityEventListeners]);

  const stopMonitoring = useCallback(() => {
    dispatch({ type: 'SET_MONITORING', payload: false });
  }, [dispatch]);

  const addAlert = useCallback((alertData: Omit<SecurityAlert, 'id' | 'timestamp' | 'resolved'>) => {
    const alert: SecurityAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${generateSecureId(6)}`,
      timestamp: new Date(),
      resolved: false,
    };
    dispatch({ type: 'ADD_ALERT', payload: alert });
    if (alert.severity === 'critical') {
      logger.error('🚨 CRITICAL SECURITY ALERT:', { message: alert.message });
    }
  }, [dispatch]);

  const resolveAlert = useCallback((alertId: string) => {
    dispatch({ type: 'RESOLVE_ALERT', payload: alertId });
  }, [dispatch]);

  const blockThreat = useCallback((threatId: string) => {
    dispatch({ type: 'BLOCK_THREAT', payload: threatId });
  }, [dispatch]);

  const addThreat = useCallback((threatData: Omit<SecurityThreat, 'id' | 'timestamp' | 'blocked'>) => {
    const threat: SecurityThreat = {
      ...threatData,
      id: `threat_${Date.now()}_${generateSecureId(6)}`,
      timestamp: new Date(),
      blocked: false,
    };
    dispatch({ type: 'ADD_THREAT', payload: threat });
    if (threat.type === 'sql_injection' || threat.type === 'xss') {
      blockThreat(threat.id);
    }
  }, [dispatch, blockThreat]);

  const checkRateLimit = useCallback((endpoint: string, identifier: string): boolean => {
    const rateLimitId = `${endpoint}_${identifier}`;
    const existing = state.rateLimits.find(rl => rl.id === rateLimitId);
    if (!existing) {
      const newRateLimit: RateLimitStatus = {
        id: rateLimitId,
        endpoint,
        limit: 60,
        remaining: 59,
        resetTime: new Date(Date.now() + 60000),
        violations: 0,
      };
      dispatch({ type: 'UPDATE_RATE_LIMIT', payload: newRateLimit });
      return false;
    }
    if (Date.now() >= existing.resetTime.getTime()) {
      const resetRateLimit: RateLimitStatus = {
        ...existing,
        remaining: existing.limit - 1,
        resetTime: new Date(Date.now() + 60000),
      };
      dispatch({ type: 'UPDATE_RATE_LIMIT', payload: resetRateLimit });
      return false;
    }
    if (existing.remaining <= 0) {
      const violatedRateLimit: RateLimitStatus = {
        ...existing,
        violations: existing.violations + 1,
      };
      dispatch({ type: 'UPDATE_RATE_LIMIT', payload: violatedRateLimit });
      addAlert({
        type: 'rate_limit',
        severity: 'medium',
        message: `Rate limit exceeded for ${endpoint}`,
        metadata: { endpoint, identifier },
      });
      return true;
    }
    const updatedRateLimit: RateLimitStatus = {
      ...existing,
      remaining: existing.remaining - 1,
    };
    dispatch({ type: 'UPDATE_RATE_LIMIT', payload: updatedRateLimit });
    return false;
  }, [state.rateLimits, addAlert]);

  const getSecurityReport = useCallback((): SecurityReport => {
    const criticalAlerts = state.alerts.filter(alert => alert.severity === 'critical').length;
    const unresolvedAlerts = state.alerts.filter(alert => !alert.resolved).length;
    const activeThreats = state.threats.filter(threat => !threat.blocked).length;
    let riskLevel: SecurityReport['riskLevel'] = 'low';
    if (criticalAlerts > 0 || activeThreats > 5) {
      riskLevel = 'critical';
    } else if (unresolvedAlerts > 10 || activeThreats > 2) {
      riskLevel = 'high';
    } else if (unresolvedAlerts > 5 || activeThreats > 0) {
      riskLevel = 'medium';
    }
    const recommendations = generateSecurityRecommendations(state, riskLevel);
    return {
      summary: {
        totalAlerts: state.metrics.totalAlerts,
        criticalAlerts,
        resolvedAlerts: state.metrics.resolvedAlerts,
        activeThreats,
        blockedThreats: state.metrics.blockedThreats,
      },
      riskLevel,
      recommendations,
    };
  }, [state]);

  const clearOldData = useCallback(() => {
    dispatch({ type: 'CLEAR_RESOLVED_ALERTS' });
    dispatch({ type: 'CLEAR_OLD_THREATS' });
  }, [dispatch]);

  const updateSettings = useCallback((settings: Partial<SecurityState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, [dispatch]);

  const performSecurityChecks = useCallback(() => {
    const now = new Date();
    const recentAlerts = state.alerts.filter(
      (alert) => now.getTime() - alert.timestamp.getTime() < 300000
    );
    if (recentAlerts.length > state.settings.alertThreshold) {
      addAlert({
        type: 'suspicious_activity',
        severity: 'high',
        message: `${recentAlerts.length} alerts in the last 5 minutes`,
        metadata: { alertCount: recentAlerts.length },
      });
    }
  }, [state.alerts, state.settings.alertThreshold, addAlert]);

  useEffect(() => {
    if (state.settings.autoDetection && state.isMonitoring) {
      const interval = setInterval(() => {
        performSecurityChecks();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [state.settings.autoDetection, state.isMonitoring, performSecurityChecks]);

  // Context value
  const contextValue = useMemo(() => ({
    ...state,
    dispatch,
    startMonitoring,
    stopMonitoring,
    addAlert,
    resolveAlert,
    addThreat,
    blockThreat,
    checkRateLimit,
    reportSecurityEvent,
    getSecurityReport,
    clearOldData,
    updateSettings,
  }), [state, startMonitoring, stopMonitoring, addAlert, resolveAlert, addThreat, blockThreat, checkRateLimit, reportSecurityEvent, getSecurityReport, clearOldData, updateSettings]);

  return (
    <SecurityContext.Provider value={contextValue}>
      {children}
    </SecurityContext.Provider>
  );
};

// Hook
export const useSecurityContext = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext deve ser usado dentro de um SecurityProvider');
  }
  return context;
};

// Helper Functions
function generateSecurityRecommendations(state: SecurityState, riskLevel: SecurityReport['riskLevel']): string[] {
  const recommendations: string[] = [];

  if (riskLevel === 'critical') {
    recommendations.push("🚨 Ação imediata necessária - ameaças críticas detectadas");
    recommendations.push("Revisar logs de segurança imediatamente");
    recommendations.push("Considerar suspender operações até resolução");
  }

  if (state.alerts.filter(a => !a.resolved).length > 10) {
    recommendations.push("Resolver alertas pendentes para melhorar a postura de segurança");
  }

  if (state.metrics.failedLogins > state.settings.maxFailedAttempts) {
    recommendations.push("Implementar bloqueio temporário após falhas de login");
  }

  const rateLimitViolations = state.rateLimits.reduce((sum, rl) => sum + rl.violations, 0);
  if (rateLimitViolations > 50) {
    recommendations.push("Revisar limites de taxa - muitas violações detectadas");
  }

  if (!state.settings.enableRateLimit) {
    recommendations.push("Habilitar rate limiting para melhor proteção");
  }

  if (recommendations.length === 0) {
    recommendations.push("✅ Postura de segurança está adequada");
    recommendations.push("Continue monitorando regularmente");
  }

  return recommendations;
}

// Action Creators
export const securityActions = {
  addAlert: (alert: SecurityAlert): SecurityAction => ({ type: 'ADD_ALERT', payload: alert }),
  setAlerts: (alerts: SecurityAlert[]): SecurityAction => ({ type: 'SET_ALERTS', payload: alerts }),
  resolveAlert: (alertId: string): SecurityAction => ({ type: 'RESOLVE_ALERT', payload: alertId }),
  addThreat: (threat: SecurityThreat): SecurityAction => ({ type: 'ADD_THREAT', payload: threat }),
  setThreats: (threats: SecurityThreat[]): SecurityAction => ({ type: 'SET_THREATS', payload: threats }),
  blockThreat: (threatId: string): SecurityAction => ({ type: 'BLOCK_THREAT', payload: threatId }),
  updateRateLimit: (rateLimit: RateLimitStatus): SecurityAction => ({ type: 'UPDATE_RATE_LIMIT', payload: rateLimit }),
  setRateLimits: (rateLimits: RateLimitStatus[]): SecurityAction => ({ type: 'SET_RATE_LIMITS', payload: rateLimits }),
  setMonitoring: (monitoring: boolean): SecurityAction => ({ type: 'SET_MONITORING', payload: monitoring }),
  updateMetrics: (metrics: Partial<SecurityMetrics>): SecurityAction => ({ type: 'UPDATE_METRICS', payload: metrics }),
  setLoading: (loading: boolean): SecurityAction => ({ type: 'SET_LOADING', payload: loading }),
  setError: (error: string | null): SecurityAction => ({ type: 'SET_ERROR', payload: error }),
  updateSettings: (settings: Partial<SecurityState['settings']>): SecurityAction => ({ type: 'UPDATE_SETTINGS', payload: settings }),
  clearResolvedAlerts: (): SecurityAction => ({ type: 'CLEAR_RESOLVED_ALERTS' }),
  clearOldThreats: (): SecurityAction => ({ type: 'CLEAR_OLD_THREATS' }),
  resetSecurity: (): SecurityAction => ({ type: 'RESET_SECURITY' }),
};