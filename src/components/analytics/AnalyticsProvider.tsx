/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '@/services/logger';

interface AnalyticsContextType {
  analytics: {
    trackEvent: () => void;
    trackCalculation: () => void;
    trackPageView: (pageName: string, pageTitle: string) => void;
  trackFeatureUsage: (feature: string, action: string, metadata?: Record<string, unknown>) => void;
    trackConversion: (conversionType: string, value?: number) => void;
    trackError: () => void;
  };
  abTesting: {
    getVariant: () => string;
    trackConversion: () => void;
  getActiveTests: () => unknown[];
  getTestResults: () => unknown[];
  };
  heatmap: {
    clearOldData: (days: number) => void;
  };
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    // Return fallback instead of throwing error
    return {
      analytics: {
        trackEvent: () => {},
        trackCalculation: () => {},
        trackPageView: () => {},
        trackFeatureUsage: () => {},
        trackConversion: () => {},
        trackError: () => {},
      },
      abTesting: {
        getVariant: () => 'default',
        trackConversion: () => {},
        getActiveTests: () => [],
        getTestResults: () => [],
      },
      heatmap: {
        clearOldData: () => {},
      }
    };
  }
  return context;
};

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<string>('/');
  const location = useLocation();

  // Update current location when router is ready
  useEffect(() => {
    if (location) {
      setCurrentLocation(location.pathname);
    }
  }, [location]);

  // Create safe fallback implementations (memoized)
  const analytics = useMemo(() => ({
    trackEvent: () => {},
    trackCalculation: () => {},
    trackPageView: (pageName: string, pageTitle: string) => {
      logger.info?.('Analytics: page view', { pageName, pageTitle });
    },
    trackFeatureUsage: (feature: string, action: string, metadata?: Record<string, unknown>) => {
      logger.debug?.('Analytics: feature usage', { feature, action, metadata });
    },
    trackConversion: (conversionType: string, value?: number) => {
      logger.info?.('Analytics: conversion', { conversionType, value });
    },
    trackError: () => {},
  }), []);

  const abTesting = useMemo(() => ({
    getVariant: () => 'default',
    trackConversion: () => {},
    getActiveTests: () => [] as unknown[],
    getTestResults: () => [] as unknown[],
  }), []);

  const heatmap = useMemo(() => ({
    clearOldData: (days: number) => {
      logger.debug?.('Analytics: clear heatmap data', { days });
    },
  }), []);

  // Track page views automatically - only when router is ready
  useEffect(() => {
    if (currentLocation) {
      const pageName = currentLocation;
      const pageTitle = document.title;
      analytics.trackPageView(pageName, pageTitle);
    }
  }, [currentLocation, analytics]);

  // Clean old data periodically
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      heatmap.clearOldData(7); // Keep data for 7 days
    }, 24 * 60 * 60 * 1000); // Run daily

    return () => clearInterval(cleanupInterval);
  }, [heatmap]);

  const value = {
    analytics,
    abTesting,
    heatmap
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
