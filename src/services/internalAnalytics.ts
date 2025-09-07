import { AnalyticsEvent } from '@/types/analytics';

export class InternalAnalyticsService {
  private static getSessionId(): string {
    const existing = sessionStorage.getItem('analytics_session');
    if (existing) {return existing;}
    
    const id = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session', id);
    return id;
  }

  static async trackEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'sessionId'>) {
    const sessionId = this.getSessionId();

    const analyticsEvent: AnalyticsEvent = {
      ...event,
      sessionId,
      timestamp: Date.now()
    };

    // Store locally for dashboard
    const events = JSON.parse(localStorage.getItem('internal_analytics') || '[]');
    events.push(analyticsEvent);
    
    // Keep only last 1000 events to prevent storage overflow
    if (events.length > 1000) {
      events.splice(0, events.length - 1000);
    }
    
    localStorage.setItem('internal_analytics', JSON.stringify(events));
    
  // Enhanced security monitoring
    this.checkSecurityPatterns(events);
    this.checkSuspiciousActivity(analyticsEvent);
    
  // Route debug output via logger to respect env level
  const { logger } = await import('@/services/logger');
  logger.debug?.('📈 Internal Event tracked:', analyticsEvent);
  }

  private static checkSecurityPatterns(events: AnalyticsEvent[]) {
    const now = Date.now();
    const recentEvents = events.filter((e: AnalyticsEvent) => 
      now - e.timestamp < 60000 // Last minute
    );
    
    // Check for high event volume
    if (recentEvents.length > 50) {
      window.dispatchEvent(new CustomEvent('security-event', {
        detail: {
          type: 'High Event Volume',
          details: { eventCount: recentEvents.length, timeWindow: '1 minute' },
          severity: 'medium'
        }
      }));
    }
    
    // Check for rapid repeated events from same session
    const sessionEvents = recentEvents.filter(e => e.sessionId === this.getSessionId());
    if (sessionEvents.length > 30) {
      window.dispatchEvent(new CustomEvent('security-event', {
        detail: {
          type: 'Rapid Session Activity',
          details: { 
            sessionEventCount: sessionEvents.length, 
            sessionId: this.getSessionId(),
            timeWindow: '1 minute' 
          },
          severity: 'high'
        }
      }));
    }
  }

  /**
   * Check for suspicious individual event activity
   */
  private static checkSuspiciousActivity(event: AnalyticsEvent) {
    // Check for suspicious event types
    const suspiciousTypes = ['error', 'failed', 'unauthorized', 'blocked'];
    const isSuspicious = suspiciousTypes.some(type => 
      event.event.toLowerCase().includes(type) || 
      event.action.toLowerCase().includes(type)
    );
    
    if (isSuspicious) {
      window.dispatchEvent(new CustomEvent('security-event', {
        detail: {
          type: 'Suspicious Event Type',
          details: { 
            event: event.event,
            action: event.action,
            userId: event.userId,
            metadata: event.metadata
          },
          severity: 'low'
        }
      }));
    }
    
    // Check for events with suspicious metadata
    if (event.metadata) {
      const hasScriptTags = JSON.stringify(event.metadata).includes('<script');
      const hasSQLInjection = JSON.stringify(event.metadata).toLowerCase().includes('union select');
      
      if (hasScriptTags || hasSQLInjection) {
        window.dispatchEvent(new CustomEvent('security-event', {
          detail: {
            type: 'Potential Injection Attack',
            details: { 
              event: event.event,
              action: event.action,
              suspiciousContent: hasScriptTags ? 'script_tags' : 'sql_injection',
              metadata: event.metadata
            },
            severity: 'critical'
          }
        }));
      }
    }
  }
}
