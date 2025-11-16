/**
 * Marketplace Analytics Types
 * 
 * Tipos para sistema de analytics avançado de marketplaces
 */

export type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all';
export type MetricType = 'revenue' | 'orders' | 'conversion' | 'avg_ticket' | 'profit_margin';
export type ChartType = 'line' | 'bar' | 'area' | 'pie' | 'donut';

/**
 * Métrica de Analytics
 */
export interface AnalyticsMetric {
  id: string;
  type: MetricType;
  name: string;
  value: number;
  previousValue: number;
  change: number; // percentual
  trend: 'up' | 'down' | 'stable';
  format: 'currency' | 'number' | 'percentage';
  icon?: string;
}

/**
 * Série temporal para gráficos
 */
export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Dados de performance por produto
 */
export interface ProductPerformance {
  productId: string;
  productName: string;
  sku: string;
  image?: string;
  revenue: number;
  orders: number;
  views: number;
  conversionRate: number;
  avgPrice: number;
  totalProfit: number;
  profitMargin: number;
  stock: number;
  trend: 'up' | 'down' | 'stable';
  revenueChange: number; // percentual vs período anterior
}

/**
 * Comparação entre marketplaces
 */
export interface MarketplaceComparison {
  marketplaceId: string;
  marketplaceName: string;
  revenue: number;
  revenueShare: number; // percentual do total
  orders: number;
  ordersShare: number;
  avgTicket: number;
  conversionRate: number;
  activeProducts: number;
  topCategory: string;
  growth: number; // percentual vs período anterior
}

/**
 * Análise de categoria
 */
export interface CategoryAnalysis {
  categoryId: string;
  categoryName: string;
  revenue: number;
  revenueShare: number;
  orders: number;
  avgPrice: number;
  products: number;
  conversionRate: number;
  trend: 'up' | 'down' | 'stable';
  topProduct: {
    name: string;
    revenue: number;
  };
}

/**
 * Análise de tendências
 */
export interface TrendAnalysis {
  id: string;
  type: 'price' | 'demand' | 'seasonality' | 'competition';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  severity: 'low' | 'medium' | 'high';
  confidence: number; // 0-100
  affectedProducts?: string[];
  recommendation?: string;
  data?: TimeSeriesData[];
}

/**
 * Relatório de Analytics
 */
export interface AnalyticsReport {
  id: string;
  period: {
    start: string;
    end: string;
    range: TimeRange;
  };
  overview: {
    totalRevenue: number;
    totalOrders: number;
    avgTicket: number;
    totalProfit: number;
    profitMargin: number;
    conversionRate: number;
  };
  metrics: AnalyticsMetric[];
  topProducts: ProductPerformance[];
  marketplaceComparison: MarketplaceComparison[];
  categoryAnalysis: CategoryAnalysis[];
  trends: TrendAnalysis[];
  timeSeries: {
    revenue: TimeSeriesData[];
    orders: TimeSeriesData[];
    conversion: TimeSeriesData[];
  };
  generatedAt: string;
}

/**
 * Filtros de Analytics
 */
export interface AnalyticsFilter {
  timeRange: TimeRange;
  marketplaceIds?: string[];
  categoryIds?: string[];
  productIds?: string[];
  compareWith?: TimeRange; // período de comparação
}

/**
 * Configuração de exportação
 */
export interface ExportConfig {
  format: 'pdf' | 'excel' | 'csv';
  sections: Array<'overview' | 'products' | 'marketplaces' | 'categories' | 'trends'>;
  includeCharts: boolean;
  includeRawData: boolean;
}

/**
 * Insights de IA
 */
export interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'recommendation' | 'prediction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  impact: {
    metric: MetricType;
    estimatedChange: number; // percentual
    estimatedValue: number; // valor absoluto
  };
  actions: Array<{
    id: string;
    label: string;
    action: string;
    variant: 'default' | 'primary' | 'secondary' | 'destructive';
  }>;
  confidence: number; // 0-100
  basedOn: string[];
  createdAt: string;
}

/**
 * Configuração de Dashboard
 */
export interface DashboardConfig {
  id: string;
  name: string;
  widgets: Array<{
    id: string;
    type: 'metric' | 'chart' | 'table' | 'insight';
    position: { x: number; y: number; w: number; h: number };
    config: Record<string, unknown>;
  }>;
  filters: AnalyticsFilter;
  refreshInterval?: number; // segundos
  isDefault?: boolean;
}
