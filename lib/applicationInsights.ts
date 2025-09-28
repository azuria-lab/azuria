// lib/applicationInsights.ts
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';

// Types for better TypeScript support
interface TelemetryProperties {
  [key: string]: string | number | boolean | undefined;
}

interface TelemetryMeasurements {
  [key: string]: number;
}

let appInsights: ApplicationInsights | null = null;
let reactPlugin: ReactPlugin | null = null;

// Initialize Application Insights
export const initializeAppInsights = (): { appInsights: ApplicationInsights; reactPlugin: ReactPlugin } => {
  // Return existing instance if already initialized
  if (appInsights && reactPlugin) {
    return { appInsights, reactPlugin };
  }

  const connectionString = process.env.NEXT_PUBLIC_APPLICATIONINSIGHTS_CONNECTION_STRING || 
                          process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    // eslint-disable-next-line no-console
    console.warn('Application Insights connection string not found. Monitoring disabled.');
    // Create dummy instances for development
    appInsights = {} as ApplicationInsights;
    reactPlugin = {} as ReactPlugin;
    return { appInsights, reactPlugin };
  }

  try {
    // Initialize React Plugin
    reactPlugin = new ReactPlugin();
    
    // Initialize Application Insights
    appInsights = new ApplicationInsights({
      config: {
        connectionString,
        extensions: [reactPlugin],
        extensionConfig: {
          [reactPlugin.identifier]: {
            history: null // Will be set when used with React Router
          }
        },
        enableAutoRouteTracking: true, // Track route changes automatically
        enableCorsCorrelation: true, // Enable CORS correlation
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true,
        correlationHeaderExcludedDomains: [
          'localhost',
          '127.0.0.1'
        ],
        // Sampling configuration
        samplingPercentage: process.env.NODE_ENV === 'production' ? 100 : 50,
        // Disable in development if preferred
        disableTelemetry: process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_AI_DEBUG !== 'true'
      }
    });

    appInsights.loadAppInsights();
    
    // Track initial page view
    appInsights.trackPageView({
      name: window.location.pathname,
      uri: window.location.href
    });

    // eslint-disable-next-line no-console
    console.log('✅ Application Insights initialized successfully');
    
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Failed to initialize Application Insights:', error);
    // Create dummy instances on error
    appInsights = {} as ApplicationInsights;
    reactPlugin = {} as ReactPlugin;
  }

  return { appInsights, reactPlugin };
};

// Utility functions for tracking custom events
export const trackEvent = (name: string, properties?: TelemetryProperties, measurements?: TelemetryMeasurements) => {
  if (appInsights && typeof appInsights.trackEvent === 'function') {
    appInsights.trackEvent({
      name,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      measurements
    });
  }
};

export const trackException = (error: Error, properties?: TelemetryProperties) => {
  if (appInsights && typeof appInsights.trackException === 'function') {
    appInsights.trackException({
      exception: error,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.href
      }
    });
  }
};

export const trackPageView = (name?: string, url?: string, properties?: TelemetryProperties) => {
  if (appInsights && typeof appInsights.trackPageView === 'function') {
    appInsights.trackPageView({
      name: name || window.location.pathname,
      uri: url || window.location.href,
      properties
    });
  }
};

export const trackDependency = (
  name: string, 
  command: string, 
  duration: number, 
  success: boolean,
  properties?: TelemetryProperties
) => {
  if (appInsights && typeof appInsights.trackDependencyData === 'function') {
    appInsights.trackDependencyData({
      id: `${name}-${Date.now()}`,
      name,
      data: command,
      duration,
      success,
      responseCode: success ? 200 : 500,
      properties
    });
  }
};

// Business-specific tracking functions
export const trackCalculatorUsage = (calculatorType: string, inputs: TelemetryProperties) => {
  trackEvent('Calculator_Used', {
    calculatorType,
    ...inputs
  }, {
    inputCount: Object.keys(inputs).length
  });
};

export const trackUserAction = (action: string, component: string, properties?: TelemetryProperties) => {
  trackEvent('User_Action', {
    action,
    component,
    ...properties
  });
};

export const trackApiCall = (endpoint: string, method: string, duration: number, success: boolean) => {
  trackDependency(
    `API: ${endpoint}`,
    `${method} ${endpoint}`,
    duration,
    success,
    { endpoint, method }
  );
};

// Performance tracking
export const trackPerformance = (name: string, duration: number, properties?: TelemetryProperties) => {
  trackEvent('Performance_Metric', {
    metricName: name,
    ...properties
  }, {
    duration
  });
};

// Get the Application Insights instance
export const getAppInsights = () => appInsights;
export const getReactPlugin = () => reactPlugin;