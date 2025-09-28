// hooks/useApplicationInsights.ts
import { useCallback } from 'react';
import { 
  trackApiCall,
  trackCalculatorUsage,
  trackEvent, 
  trackException, 
  trackPageView, 
  trackPerformance,
  trackUserAction
} from '../../lib/applicationInsights';

// Types for better TypeScript support
interface TelemetryProperties {
  [key: string]: string | number | boolean | undefined;
}

export const useApplicationInsights = () => {
  // Business-specific tracking hooks
  const trackCalculator = useCallback((calculatorType: string, inputs: Record<string, unknown>) => {
    const properties: TelemetryProperties = {};
    
    // Convert inputs to telemetry properties (string/number/boolean only)
    Object.entries(inputs).forEach(([key, value]) => {
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        properties[key] = value;
      } else if (value !== null && value !== undefined) {
        properties[key] = String(value);
      }
    });

    trackCalculatorUsage(calculatorType, properties);
  }, []);

  const trackUserInteraction = useCallback((action: string, component: string, additionalData?: Record<string, unknown>) => {
    const properties: TelemetryProperties = { action, component };
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          properties[key] = value;
        } else if (value != null) {
          properties[key] = String(value);
        }
      });
    }

    trackUserAction(action, component, properties);
  }, []);

  const trackCustomEvent = useCallback((eventName: string, properties?: Record<string, unknown>) => {
    const telemetryProps: TelemetryProperties = {};
    
    if (properties) {
      Object.entries(properties).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          telemetryProps[key] = value;
        } else if (value != null) {
          telemetryProps[key] = String(value);
        }
      });
    }

    trackEvent(eventName, telemetryProps);
  }, []);

  const trackError = useCallback((error: Error, context?: Record<string, unknown>) => {
    const properties: TelemetryProperties = {};
    
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          properties[key] = value;
        } else if (value != null) {
          properties[key] = String(value);
        }
      });
    }

    trackException(error, properties);
  }, []);

  const trackNavigation = useCallback((pageName?: string, url?: string, metadata?: Record<string, unknown>) => {
    const properties: TelemetryProperties = {};
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          properties[key] = value;
        } else if (value != null) {
          properties[key] = String(value);
        }
      });
    }

    trackPageView(pageName, url, properties);
  }, []);

  const trackAPIRequest = useCallback((endpoint: string, method: string, duration: number, success: boolean) => {
    trackApiCall(endpoint, method, duration, success);
  }, []);

  const trackPerformanceMetric = useCallback((metricName: string, duration: number, context?: Record<string, unknown>) => {
    const properties: TelemetryProperties = {};
    
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          properties[key] = value;
        } else if (value != null) {
          properties[key] = String(value);
        }
      });
    }

    trackPerformance(metricName, duration, properties);
  }, []);

  // Business-specific events for Azuria
  const trackPricingCalculation = useCallback((calculationType: 'simple' | 'pro' | 'advanced' | 'batch', inputs: Record<string, unknown>) => {
    trackCalculator(`pricing_calculator_${calculationType}`, inputs);
  }, [trackCalculator]);

  const trackMarketplaceAnalysis = useCallback((marketplace: string, products: number) => {
    trackCustomEvent('marketplace_analysis', { 
      marketplace, 
      productCount: products,
      feature: 'competition_analysis'
    });
  }, [trackCustomEvent]);

  const trackDashboardView = useCallback((dashboardType: string, timeRange?: string) => {
    trackCustomEvent('dashboard_viewed', { 
      dashboardType, 
      timeRange: timeRange || 'default',
      feature: 'analytics'
    });
  }, [trackCustomEvent]);

  const trackFeatureUsage = useCallback((featureName: string, context?: Record<string, unknown>) => {
    trackCustomEvent('feature_used', { 
      featureName, 
      ...context 
    });
  }, [trackCustomEvent]);

  const trackUserOnboarding = useCallback((step: string, completed: boolean) => {
    trackCustomEvent('onboarding_step', { 
      step, 
      completed,
      feature: 'onboarding'
    });
  }, [trackCustomEvent]);

  const trackSubscriptionEvent = useCallback((eventType: 'upgrade' | 'downgrade' | 'cancel' | 'renew', plan: string) => {
    trackCustomEvent('subscription_event', { 
      eventType, 
      plan,
      feature: 'monetization'
    });
  }, [trackCustomEvent]);

  return {
    // Core tracking functions
    trackEvent: trackCustomEvent,
    trackError,
    trackNavigation,
    trackUserInteraction,
    trackAPIRequest,
    trackPerformanceMetric,
    
    // Business-specific functions
    trackPricingCalculation,
    trackMarketplaceAnalysis,
    trackDashboardView,
    trackFeatureUsage,
    trackUserOnboarding,
    trackSubscriptionEvent
  };
};

export default useApplicationInsights;