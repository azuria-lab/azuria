/**
 * Tipos para useDashboardStats hook
 */

export interface DailyStats {
  calculationsCount: number;
  totalSavings: number;
  productsAnalyzed: number;
  timeSavedMinutes: number;
  change: {
    calculations: number;
    savings: number;
    products: number;
    time: number;
  };
}

export interface Activity {
  id: string;
  type: 'calculation' | 'analysis' | 'export' | 'sync';
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface RecentCalculation {
  id: string;
  productName: string;
  marketplace: string;
  finalPrice: number;
  margin: number;
  createdAt: Date;
}

export interface UseDashboardStatsReturn {
  stats: DailyStats | null;
  activities: Activity[];
  recentCalculations: RecentCalculation[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

