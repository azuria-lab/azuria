
export interface AnalyticsEvent {
  event: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  userId?: string;
  sessionId?: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface GAEvent {
  event_name: string;
  event_category: string;
  event_label?: string;
  value?: number;
  user_id?: string;
  custom_parameters?: Record<string, unknown>;
}

// Extend Window interface for gtag
declare global {
  interface Window {
  gtag: (...args: unknown[]) => void;
  }
}
