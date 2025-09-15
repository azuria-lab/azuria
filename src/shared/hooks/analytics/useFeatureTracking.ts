
import { useCallback } from 'react';

type TrackEvent = (
  eventName: string,
  category: string,
  action: string,
  label?: string,
  value?: number,
  props?: Record<string, unknown>
) => void;

export const useFeatureTracking = (trackEvent: TrackEvent) => {
  const trackFeatureUsage = useCallback((feature: string, action: string, metadata?: Record<string, unknown>) => {
    trackEvent(
      'feature_used',
      'feature',
      action,
      feature,
      undefined,
      {
        feature_name: feature,
        ...metadata
      }
    );
  }, [trackEvent]);

  const trackConversion = useCallback((conversionType: string, value?: number, userType?: string) => {
    trackEvent(
      'conversion',
      'business',
      'convert',
      conversionType,
      value,
      {
        conversion_type: conversionType,
        user_type: userType || 'free'
      }
    );
  }, [trackEvent]);

  const trackError = useCallback((error: Error, context?: string) => {
    trackEvent(
      'error_occurred',
      'error',
      'exception',
      error.name,
      undefined,
      {
        error_message: error.message,
        error_stack: error.stack,
  context,
  user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server'
      }
    );
  }, [trackEvent]);

  return {
    trackFeatureUsage,
    trackConversion,
    trackError
  };
};
