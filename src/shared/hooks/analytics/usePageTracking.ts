
import { useCallback } from 'react';

type TrackEvent = (
  eventName: string,
  category: string,
  action: string,
  label?: string,
  value?: number,
  props?: Record<string, unknown>
) => void;

export const usePageTracking = (trackEvent: TrackEvent) => {
  const trackPageView = useCallback((pageName: string, pageTitle?: string) => {
    trackEvent(
      'page_view',
      'navigation',
      'view',
      pageName,
      undefined,
      {
        page_name: pageName,
        page_title: pageTitle,
        referrer: typeof document !== 'undefined' ? document.referrer : ''
      }
    );
  }, [trackEvent]);

  return { trackPageView };
};
