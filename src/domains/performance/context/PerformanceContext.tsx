/* eslint-disable react-refresh/only-export-components */
import React, { createContext, ReactNode, useContext, useMemo, useReducer } from "react";
import { logger } from '@/services/logger';

// Performance State Types
interface PerformanceState {
  // Web Vitals
  webVitals: WebVitalMetric[];
  
  // Performance Metrics
  metrics: PerformanceMetric[];
  
  // Monitoring
  isMonitoring: boolean;
  budget: PerformanceBudget;
  violations: PerformanceViolation[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Settings
  settings: {
    autoMonitor: boolean;
    alertThreshold: number;
    retentionDays: number;
    enableWebVitals: boolean;
  };
}

interface WebVitalMetric {
  id: string;
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: Date;
}

interface PerformanceMetric {
  id: string;
  type: 'render' | 'api' | 'interaction' | 'navigation';
  name: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface PerformanceBudget {
  componentRender: number; // ms
  apiResponse: number; // ms
  pageLoad: number; // ms
  interaction: number; // ms
}

interface PerformanceViolation {
  id: string;
  type: string;
  duration: number;
  threshold: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// Performance Actions
type PerformanceAction =
  | { type: 'ADD_WEB_VITAL'; payload: WebVitalMetric }
  | { type: 'SET_WEB_VITALS'; payload: WebVitalMetric[] }
  | { type: 'ADD_METRIC'; payload: PerformanceMetric }
  | { type: 'SET_METRICS'; payload: PerformanceMetric[] }
  | { type: 'SET_MONITORING'; payload: boolean }
  | { type: 'UPDATE_BUDGET'; payload: Partial<PerformanceBudget> }
  | { type: 'ADD_VIOLATION'; payload: PerformanceViolation }
  | { type: 'SET_VIOLATIONS'; payload: PerformanceViolation[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<PerformanceState['settings']> }
  | { type: 'CLEAR_METRICS' }
  | { type: 'CLEAR_VIOLATIONS' }
  | { type: 'RESET_PERFORMANCE' };

// Performance Context Type
interface PerformanceContextType extends PerformanceState {
  dispatch: React.Dispatch<PerformanceAction>;
  // Actions
  startMonitoring: () => void;
  stopMonitoring: () => void;
  measurePerformance: <T>(type: PerformanceMetric['type'], name: string, fn: () => Promise<T> | T) => Promise<T>;
  recordMetric: (metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) => void;
  updateBudget: (budget: Partial<PerformanceBudget>) => void;
  getPerformanceReport: () => PerformanceReport;
  clearData: () => void;
  updateSettings: (settings: Partial<PerformanceState['settings']>) => void;
}

interface PerformanceReport {
  summary: {
    totalMeasures: number;
    averageRenderTime: number;
    averageApiTime: number;
    violationRate: number;
    violationsCount: number;
  };
  webVitals: {
    good: number;
    needsImprovement: number;
    poor: number;
  };
  recommendations: string[];
}

// Initial State
const initialPerformanceState: PerformanceState = {
  webVitals: [],
  metrics: [],
  isMonitoring: false,
  budget: {
    componentRender: 100,
    apiResponse: 200,
    pageLoad: 3000,
    interaction: 50,
  },
  violations: [],
  isLoading: false,
  error: null,
  settings: {
    autoMonitor: true,
    alertThreshold: 5,
    retentionDays: 7,
    enableWebVitals: true,
  },
};

// Performance Reducer
function performanceReducer(state: PerformanceState, action: PerformanceAction): PerformanceState {
  switch (action.type) {
    case 'ADD_WEB_VITAL':
      return { 
        ...state, 
        webVitals: [action.payload, ...state.webVitals.slice(0, 99)] // Keep last 100
      };
    case 'SET_WEB_VITALS':
      return { ...state, webVitals: action.payload };
    case 'ADD_METRIC': {
      const newMetric = action.payload;
      const violations = [...state.violations];
      // Check for budget violations
      const threshold = getBudgetThreshold(state.budget, newMetric.type);
      if (newMetric.duration > threshold) {
        violations.unshift({
          id: `violation_${Date.now()}`,
          type: newMetric.type,
          duration: newMetric.duration,
          threshold,
          timestamp: new Date(),
          metadata: newMetric.metadata,
        });
      }
      return {
        ...state,
        metrics: [action.payload, ...state.metrics.slice(0, 999)], // Keep last 1000
        violations: violations.slice(0, 99), // Keep last 100 violations
      };
    }
    case 'SET_METRICS':
      return { ...state, metrics: action.payload };
    case 'SET_MONITORING':
      return { ...state, isMonitoring: action.payload };
    case 'UPDATE_BUDGET':
      return { 
        ...state, 
        budget: { ...state.budget, ...action.payload } 
      };
    case 'ADD_VIOLATION':
      return { 
        ...state, 
        violations: [action.payload, ...state.violations.slice(0, 99)] 
      };
    case 'SET_VIOLATIONS':
      return { ...state, violations: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload } 
      };
    case 'CLEAR_METRICS':
      return { ...state, metrics: [], webVitals: [] };
    case 'CLEAR_VIOLATIONS':
      return { ...state, violations: [] };
    case 'RESET_PERFORMANCE':
      return initialPerformanceState;
    default:
      return state;
  }
}

// Default Context Value
const defaultMeasurePerformance: PerformanceContextType['measurePerformance'] = async (
  _type,
  _name,
  fn,
) => await fn();

const defaultPerformanceValue: PerformanceContextType = {
  ...initialPerformanceState,
  dispatch: () => {},
  startMonitoring: () => {},
  stopMonitoring: () => {},
  measurePerformance: defaultMeasurePerformance,
  recordMetric: () => {},
  updateBudget: () => {},
  getPerformanceReport: () => ({
    summary: {
      totalMeasures: 0,
      averageRenderTime: 0,
      averageApiTime: 0,
      violationRate: 0,
      violationsCount: 0,
    },
    webVitals: { good: 0, needsImprovement: 0, poor: 0 },
    recommendations: [],
  }),
  clearData: () => {},
  updateSettings: () => {},
};

// Context
const PerformanceContext = createContext<PerformanceContextType>(defaultPerformanceValue);

// Provider
export const PerformanceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(performanceReducer, initialPerformanceState);

  // Action Handlers
  const startMonitoring = React.useCallback(() => {
    dispatch({ type: 'SET_MONITORING', payload: true });
    if (state.settings.enableWebVitals) {
      initWebVitalsMonitoring();
    }
  }, [dispatch, state.settings.enableWebVitals]);

  const stopMonitoring = React.useCallback(() => {
    dispatch({ type: 'SET_MONITORING', payload: false });
  }, [dispatch]);

  // recordMetric declared above; define measurePerformance after

  const recordMetric = React.useCallback((metric: Omit<PerformanceMetric, 'id' | 'timestamp'>) => {
    const fullMetric: PerformanceMetric = {
      ...metric,
      id: `metric_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
    };
    
    dispatch({ type: 'ADD_METRIC', payload: fullMetric });
  }, [dispatch]);

  const measurePerformance = React.useCallback(<T,>(
    type: PerformanceMetric['type'],
    name: string,
    fn: () => Promise<T> | T,
  ): Promise<T> => {
    const startTime = performance.now();
    return (async () => {
      try {
        const result = await fn();
        const duration = performance.now() - startTime;
        recordMetric({ type, name, duration });
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        recordMetric({
          type,
          name,
          duration,
          metadata: { error: error instanceof Error ? error.message : 'Unknown error' },
        });
        throw error;
      }
    })();
  }, [recordMetric]);

  const updateBudget = React.useCallback((budget: Partial<PerformanceBudget>) => {
    dispatch({ type: 'UPDATE_BUDGET', payload: budget });
  }, [dispatch]);

  const getPerformanceReport = React.useCallback((): PerformanceReport => {
    const renderMetrics = state.metrics.filter(m => m.type === 'render');
    const apiMetrics = state.metrics.filter(m => m.type === 'api');
    
    const averageRenderTime = renderMetrics.length > 0 
      ? renderMetrics.reduce((sum, m) => sum + m.duration, 0) / renderMetrics.length 
      : 0;
      
    const averageApiTime = apiMetrics.length > 0 
      ? apiMetrics.reduce((sum, m) => sum + m.duration, 0) / apiMetrics.length 
      : 0;

    const violationRate = state.metrics.length > 0 
      ? (state.violations.length / state.metrics.length) * 100 
      : 0;

    const webVitalsStats = state.webVitals.reduce(
      (acc, vital) => {
        acc[vital.rating === 'good' ? 'good' : vital.rating === 'needs-improvement' ? 'needsImprovement' : 'poor']++;
        return acc;
      },
      { good: 0, needsImprovement: 0, poor: 0 }
    );

    const recommendations = generateRecommendations(state);

    return {
      summary: {
        totalMeasures: state.metrics.length,
        averageRenderTime,
        averageApiTime,
        violationRate,
        violationsCount: state.violations.length,
      },
      webVitals: webVitalsStats,
      recommendations,
    };
  }, [state]);

  const clearData = React.useCallback(() => {
    dispatch({ type: 'CLEAR_METRICS' });
    dispatch({ type: 'CLEAR_VIOLATIONS' });
  }, [dispatch]);

  const updateSettings = React.useCallback((settings: Partial<PerformanceState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, [dispatch]);

  // Context value
  const contextValue = useMemo(() => ({
    ...state,
    dispatch,
    startMonitoring,
    stopMonitoring,
    measurePerformance,
    recordMetric,
    updateBudget,
    getPerformanceReport,
    clearData,
    updateSettings,
  }), [state, startMonitoring, stopMonitoring, measurePerformance, recordMetric, updateBudget, getPerformanceReport, clearData, updateSettings]);

  return (
    <PerformanceContext.Provider value={contextValue}>
      {children}
    </PerformanceContext.Provider>
  );
};

// Hook
export const usePerformanceContext = (): PerformanceContextType => {
  const context = useContext(PerformanceContext);
  if (!context) {
    throw new Error('usePerformanceContext deve ser usado dentro de um PerformanceProvider');
  }
  return context;
};

// Helper Functions
function getBudgetThreshold(budget: PerformanceBudget, type: PerformanceMetric['type']): number {
  switch (type) {
    case 'render':
      return budget.componentRender;
    case 'api':
      return budget.apiResponse;
    case 'navigation':
      return budget.pageLoad;
    case 'interaction':
      return budget.interaction;
    default:
      return 100;
  }
}

function initWebVitalsMonitoring() {
  // This would integrate with the actual web-vitals library
  // For now, we'll simulate some basic monitoring
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      // Process performance entries
  if (logger.debug) { logger.debug('Performance entry:', entry as unknown as Record<string, unknown>); }
    });
  });
  
  try {
    observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
  } catch (_e) {
    logger.warn('Performance monitoring not fully supported in this browser');
  }
}

function generateRecommendations(state: PerformanceState): string[] {
  const recommendations: string[] = [];
  const report = {
    summary: {
      averageRenderTime: state.metrics.filter(m => m.type === 'render')
        .reduce((sum, m) => sum + m.duration, 0) / Math.max(1, state.metrics.filter(m => m.type === 'render').length),
      averageApiTime: state.metrics.filter(m => m.type === 'api')
        .reduce((sum, m) => sum + m.duration, 0) / Math.max(1, state.metrics.filter(m => m.type === 'api').length),
    }
  };

  if (report.summary.averageRenderTime > state.budget.componentRender) {
    recommendations.push("Considere usar React.memo() em componentes que re-renderizam frequentemente");
    recommendations.push("Implemente lazy loading para componentes pesados");
  }

  if (report.summary.averageApiTime > state.budget.apiResponse) {
    recommendations.push("Adicione cache nas chamadas de API");
    recommendations.push("Considere implementar paginação ou carregamento incremental");
  }

  if (state.violations.length > state.settings.alertThreshold) {
    recommendations.push("Revise o orçamento de performance - muitas violações detectadas");
  }

  if (recommendations.length === 0) {
    recommendations.push("Performance está dentro dos parâmetros esperados!");
  }

  return recommendations;
}

// Action Creators
export const performanceActions = {
  addWebVital: (vital: WebVitalMetric): PerformanceAction => ({ type: 'ADD_WEB_VITAL', payload: vital }),
  setWebVitals: (vitals: WebVitalMetric[]): PerformanceAction => ({ type: 'SET_WEB_VITALS', payload: vitals }),
  addMetric: (metric: PerformanceMetric): PerformanceAction => ({ type: 'ADD_METRIC', payload: metric }),
  setMetrics: (metrics: PerformanceMetric[]): PerformanceAction => ({ type: 'SET_METRICS', payload: metrics }),
  setMonitoring: (monitoring: boolean): PerformanceAction => ({ type: 'SET_MONITORING', payload: monitoring }),
  updateBudget: (budget: Partial<PerformanceBudget>): PerformanceAction => ({ type: 'UPDATE_BUDGET', payload: budget }),
  addViolation: (violation: PerformanceViolation): PerformanceAction => ({ type: 'ADD_VIOLATION', payload: violation }),
  setViolations: (violations: PerformanceViolation[]): PerformanceAction => ({ type: 'SET_VIOLATIONS', payload: violations }),
  setLoading: (loading: boolean): PerformanceAction => ({ type: 'SET_LOADING', payload: loading }),
  setError: (error: string | null): PerformanceAction => ({ type: 'SET_ERROR', payload: error }),
  updateSettings: (settings: Partial<PerformanceState['settings']>): PerformanceAction => ({ type: 'UPDATE_SETTINGS', payload: settings }),
  clearMetrics: (): PerformanceAction => ({ type: 'CLEAR_METRICS' }),
  clearViolations: (): PerformanceAction => ({ type: 'CLEAR_VIOLATIONS' }),
  resetPerformance: (): PerformanceAction => ({ type: 'RESET_PERFORMANCE' }),
};

export type { 
  PerformanceState, 
  PerformanceAction, 
  PerformanceContextType, 
  WebVitalMetric, 
  PerformanceMetric, 
  PerformanceBudget,
  PerformanceViolation,
  PerformanceReport 
};