// lib/ApplicationInsightsProvider.tsx
'use client';

import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { initializeAppInsights } from './applicationInsights';

interface ApplicationInsightsContextType {
  appInsights: ApplicationInsights | null;
  reactPlugin: ReactPlugin | null;
  isInitialized: boolean;
}

const ApplicationInsightsContext = createContext<ApplicationInsightsContextType>({
  appInsights: null,
  reactPlugin: null,
  isInitialized: false
});

export const useApplicationInsights = () => {
  const context = useContext(ApplicationInsightsContext);
  if (!context) {
    throw new Error('useApplicationInsights must be used within ApplicationInsightsProvider');
  }
  return context;
};

interface ApplicationInsightsProviderProps {
  children: ReactNode;
}

export const ApplicationInsightsProvider: React.FC<ApplicationInsightsProviderProps> = ({ children }) => {
  const [contextValue, setContextValue] = React.useState<ApplicationInsightsContextType>({
    appInsights: null,
    reactPlugin: null,
    isInitialized: false
  });

  useEffect(() => {
    // Only initialize on client-side
    if (typeof window !== 'undefined') {
      const { appInsights, reactPlugin } = initializeAppInsights();
      
      setContextValue({
        appInsights,
        reactPlugin,
        isInitialized: true
      });

      // Set up global error boundary
      window.addEventListener('error', (event) => {
        if (appInsights && typeof appInsights.trackException === 'function') {
          appInsights.trackException({
            exception: event.error || new Error(event.message),
            properties: {
              filename: event.filename,
              lineno: event.lineno?.toString(),
              colno: event.colno?.toString(),
              type: 'Global Error Handler'
            }
          });
        }
      });

      // Set up unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        if (appInsights && typeof appInsights.trackException === 'function') {
          appInsights.trackException({
            exception: event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
            properties: {
              type: 'Unhandled Promise Rejection'
            }
          });
        }
      });
    }
  }, []);

  return (
    <ApplicationInsightsContext.Provider value={contextValue}>
      {children}
    </ApplicationInsightsContext.Provider>
  );
};

// Higher-order component for tracking component usage
export const withApplicationInsights = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { appInsights } = useApplicationInsights();
    const displayName = componentName || Component.displayName || Component.name || 'Component';

    useEffect(() => {
      if (appInsights && typeof appInsights.trackEvent === 'function') {
        appInsights.trackEvent({
          name: 'Component_Mounted',
          properties: {
            componentName: displayName,
            timestamp: new Date().toISOString()
          }
        });
      }

      return () => {
        if (appInsights && typeof appInsights.trackEvent === 'function') {
          appInsights.trackEvent({
            name: 'Component_Unmounted',
            properties: {
              componentName: displayName,
              timestamp: new Date().toISOString()
            }
          });
        }
      };
    }, [appInsights, displayName]);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withApplicationInsights(${Component.displayName || Component.name || 'Component'})`;
  return WrappedComponent;
};

export default ApplicationInsightsProvider;