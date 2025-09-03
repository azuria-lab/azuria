
import { GAEvent } from '@/types/analytics';

export class GoogleAnalyticsService {
  static initialize(userId?: string, userType?: string) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        user_id: userId,
        custom_map: {
          custom_user_type: userType || 'free'
        }
      });
    }
  }

  static trackEvent(event: GAEvent) {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', event.event_name, {
        event_category: event.event_category,
        event_label: event.event_label,
        value: event.value,
        user_id: event.user_id,
        ...event.custom_parameters
      });
      
      console.log('📊 GA Event tracked:', event);
    }
  }
}
