// Shared types for Web Vitals performance reporting

export interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  entries?: PerformanceEntry[];
}

export interface DeviceInfo {
  userAgent: string;
  viewport: { width: number; height: number };
  deviceMemory?: number;
  hardwareConcurrency?: number;
  connectionType?: string;
}

export interface ConnectionInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

export interface PerformanceReport {
  metrics: WebVitalMetric[];
  deviceInfo: DeviceInfo;
  connectionInfo: ConnectionInfo;
  timestamp: number;
  sessionId: string;
  userId?: string;
}
