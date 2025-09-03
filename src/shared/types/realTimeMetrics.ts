
export interface RealTimeMetrics {
  activeUsers: number;
  calculationsToday: number;
  avgMarginToday: number;
  revenueToday: number;
  marketTrend: 'up' | 'down' | 'stable';
}

export interface PriceData {
  hour: string;
  avgPrice: number;
  volume: number;
  margin: number;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface CompetitorData {
  day: string;
  nossoPreco: number;
  concorrente1: number;
  concorrente2: number;
  concorrente3: number;
}
