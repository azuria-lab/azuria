
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  config: WidgetConfig;
  data?: unknown;
}

export type WidgetType = 
  | 'metrics-summary'
  | 'calculations-chart'
  | 'recent-calculations'
  | 'revenue-chart'
  | 'user-activity'
  | 'alerts'
  | 'recommendations'
  | 'competitor-comparison'
  | 'financial-summary'
  | 'performance-kpis'
  | 'channel-comparison'
  | 'ai-insights'
  | 'data-entry-form';

export interface WidgetConfig {
  title?: string;
  period?: 'today' | 'week' | 'month' | 'year';
  showLabel?: boolean;
  color?: string;
  chartType?: 'line' | 'bar' | 'pie' | 'donut';
  metrics?: string[];
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  widgets: DashboardWidget[];
  settings: DashboardSettings;
  userId: string;
  isShared: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSettings {
  theme: 'light' | 'dark';
  autoRefresh: boolean;
  refreshInterval: number;
  gridSize: number;
}

export interface DashboardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'analytics' | 'operations' | 'overview';
  widgets: Omit<DashboardWidget, 'id'>[];
  preview?: string;
}
