/* eslint-disable react-refresh/only-export-components */
import React, { createContext, ReactNode, useContext, useMemo, useReducer } from "react";
import { logger } from '@/services/logger';

// Analytics State Types
interface AnalyticsState {
  // Metrics
  pageViews: number;
  activeUsers: number;
  conversionRate: number;
  averageSessionDuration: number;
  
  // Events
  events: AnalyticsEvent[];
  
  // Reports
  reports: AnalyticsReport[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  timeRange: 'hour' | 'day' | 'week' | 'month';
  
  // Settings
  settings: {
    autoTrack: boolean;
    dataRetention: number; // days
    enableHeatmaps: boolean;
  };
}

interface AnalyticsEvent {
  id: string;
  name: string;
  properties: Record<string, unknown>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

interface AnalyticsReport {
  id: string;
  name: string;
  data: unknown;
  generatedAt: Date;
  type: 'conversion' | 'engagement' | 'performance' | 'revenue';
}

// Analytics Actions
type AnalyticsAction =
  | { type: 'SET_METRICS'; payload: Partial<Pick<AnalyticsState, 'pageViews' | 'activeUsers' | 'conversionRate' | 'averageSessionDuration'>> }
  | { type: 'ADD_EVENT'; payload: AnalyticsEvent }
  | { type: 'SET_EVENTS'; payload: AnalyticsEvent[] }
  | { type: 'ADD_REPORT'; payload: AnalyticsReport }
  | { type: 'SET_REPORTS'; payload: AnalyticsReport[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TIME_RANGE'; payload: AnalyticsState['timeRange'] }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AnalyticsState['settings']> }
  | { type: 'CLEAR_EVENTS' }
  | { type: 'CLEAR_REPORTS' }
  | { type: 'RESET_ANALYTICS' };

// Analytics Context Type
interface AnalyticsContextType extends AnalyticsState {
  dispatch: React.Dispatch<AnalyticsAction>;
  // Actions
  trackEvent: (name: string, properties?: Record<string, unknown>) => void;
  trackPageView: (page: string) => void;
  generateReport: (type: AnalyticsReport['type']) => Promise<void>;
  setTimeRange: (range: AnalyticsState['timeRange']) => void;
  updateSettings: (settings: Partial<AnalyticsState['settings']>) => void;
  clearData: () => void;
}

// Initial State
const initialAnalyticsState: AnalyticsState = {
  pageViews: 0,
  activeUsers: 0,
  conversionRate: 0,
  averageSessionDuration: 0,
  events: [],
  reports: [],
  isLoading: false,
  error: null,
  timeRange: 'day',
  settings: {
    autoTrack: true,
    dataRetention: 30,
    enableHeatmaps: true,
  },
};

// Analytics Reducer
function analyticsReducer(state: AnalyticsState, action: AnalyticsAction): AnalyticsState {
  switch (action.type) {
    case 'SET_METRICS':
      return { ...state, ...action.payload };
    case 'ADD_EVENT':
      return { 
        ...state, 
        events: [action.payload, ...state.events.slice(0, 999)] // Keep last 1000
      };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'ADD_REPORT':
      return { 
        ...state, 
        reports: [action.payload, ...state.reports.slice(0, 49)] // Keep last 50
      };
    case 'SET_REPORTS':
      return { ...state, reports: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'SET_TIME_RANGE':
      return { ...state, timeRange: action.payload };
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload } 
      };
    case 'CLEAR_EVENTS':
      return { ...state, events: [] };
    case 'CLEAR_REPORTS':
      return { ...state, reports: [] };
    case 'RESET_ANALYTICS':
      return initialAnalyticsState;
    default:
      return state;
  }
}

// Default Context Value
const defaultAnalyticsValue: AnalyticsContextType = {
  ...initialAnalyticsState,
  dispatch: () => {},
  trackEvent: () => {},
  trackPageView: () => {},
  generateReport: async () => {},
  setTimeRange: () => {},
  updateSettings: () => {},
  clearData: () => {},
};

// Context
const AnalyticsContext = createContext<AnalyticsContextType>(defaultAnalyticsValue);

// Provider
export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(analyticsReducer, initialAnalyticsState);

  // Action Handlers
  const trackEvent = React.useCallback((name: string, properties: Record<string, unknown> = {}) => {
    if (!state.settings.autoTrack) {return;}

    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name,
      properties,
      timestamp: new Date(),
      sessionId: getSessionId(),
    };

    dispatch({ type: 'ADD_EVENT', payload: event });
  }, [state.settings.autoTrack]);

  const trackPageView = React.useCallback((page: string) => {
    trackEvent('page_view', { page });
    dispatch({ type: 'SET_METRICS', payload: { pageViews: state.pageViews + 1 } });
  }, [trackEvent, state.pageViews]);

  const generateReport = React.useCallback(async (type: AnalyticsReport['type']) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const report: AnalyticsReport = {
        id: `report_${Date.now()}`,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        data: generateMockReportData(type, state.events),
        generatedAt: new Date(),
        type,
      };

      dispatch({ type: 'ADD_REPORT', payload: report });
      dispatch({ type: 'SET_LOADING', payload: false });
    } catch (error) {
      logger.error('Analytics report generation failed:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : "Erro ao gerar relatório" });
    }
  }, [state.events]);

  const setTimeRange = React.useCallback((range: AnalyticsState['timeRange']) => {
    dispatch({ type: 'SET_TIME_RANGE', payload: range });
  }, []);

  const updateSettings = React.useCallback((settings: Partial<AnalyticsState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const clearData = React.useCallback(() => {
    dispatch({ type: 'CLEAR_EVENTS' });
    dispatch({ type: 'CLEAR_REPORTS' });
  }, []);

  // Context value
  const contextValue = useMemo(() => ({
    ...state,
    dispatch,
    trackEvent,
    trackPageView,
    generateReport,
    setTimeRange,
    updateSettings,
    clearData,
  }), [state, trackEvent, trackPageView, generateReport, setTimeRange, updateSettings, clearData]);

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// Hook
export const useAnalyticsContext = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext deve ser usado dentro de um AnalyticsProvider');
  }
  return context;
};

// Helper Functions
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
}

function generateMockReportData(type: AnalyticsReport['type'], events: AnalyticsEvent[]) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const recentEvents = events.filter(e => e.timestamp >= oneWeekAgo);

  switch (type) {
    case 'conversion':
      return {
        totalConversions: recentEvents.filter(e => e.name === 'conversion').length,
        conversionRate: Math.random() * 10,
        topPages: ['/calculator', '/pricing', '/dashboard'],
      };
    case 'engagement':
      return {
        avgSessionDuration: Math.random() * 300,
        bounceRate: Math.random() * 50,
        pagesPerSession: Math.random() * 5,
      };
    case 'performance':
      return {
        loadTime: Math.random() * 2000,
        errorRate: Math.random() * 5,
        uptime: 99.9,
      };
    case 'revenue':
      return {
        totalRevenue: Math.random() * 10000,
        averageOrderValue: Math.random() * 100,
        revenueGrowth: Math.random() * 20,
      };
    default:
      return {};
  }
}

// Action Creators
export const analyticsActions = {
  setMetrics: (metrics: Partial<Pick<AnalyticsState, 'pageViews' | 'activeUsers' | 'conversionRate' | 'averageSessionDuration'>>): AnalyticsAction => 
    ({ type: 'SET_METRICS', payload: metrics }),
  addEvent: (event: AnalyticsEvent): AnalyticsAction => ({ type: 'ADD_EVENT', payload: event }),
  setEvents: (events: AnalyticsEvent[]): AnalyticsAction => ({ type: 'SET_EVENTS', payload: events }),
  addReport: (report: AnalyticsReport): AnalyticsAction => ({ type: 'ADD_REPORT', payload: report }),
  setReports: (reports: AnalyticsReport[]): AnalyticsAction => ({ type: 'SET_REPORTS', payload: reports }),
  setLoading: (loading: boolean): AnalyticsAction => ({ type: 'SET_LOADING', payload: loading }),
  setError: (error: string | null): AnalyticsAction => ({ type: 'SET_ERROR', payload: error }),
  setTimeRange: (range: AnalyticsState['timeRange']): AnalyticsAction => ({ type: 'SET_TIME_RANGE', payload: range }),
  updateSettings: (settings: Partial<AnalyticsState['settings']>): AnalyticsAction => ({ type: 'UPDATE_SETTINGS', payload: settings }),
  clearEvents: (): AnalyticsAction => ({ type: 'CLEAR_EVENTS' }),
  clearReports: (): AnalyticsAction => ({ type: 'CLEAR_REPORTS' }),
  resetAnalytics: (): AnalyticsAction => ({ type: 'RESET_ANALYTICS' }),
};

export type { AnalyticsState, AnalyticsAction, AnalyticsContextType, AnalyticsEvent, AnalyticsReport };