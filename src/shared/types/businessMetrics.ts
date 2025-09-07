export interface BusinessMetric {
  id: string;
  user_id: string;
  metric_type: 'revenue' | 'profit' | 'ticket_medio' | 'despesas' | 'roi' | 'cac' | 'conversao' | 'clientes_ativos' | 'recompra';
  metric_value: number;
  period_type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  period_date: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface SalesData {
  id: string;
  user_id: string;
  channel_name: 'mercado_livre' | 'shopee' | 'amazon' | 'magalu' | 'loja_fisica' | 'site_proprio';
  product_name?: string;
  product_id?: string;
  sale_value: number;
  cost_value?: number;
  profit_margin?: number;
  commission_fee: number;
  advertising_cost: number;
  shipping_cost: number;
  sale_date: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface ProductPerformance {
  id: string;
  user_id: string;
  product_name: string;
  product_sku?: string;
  total_sales: number;
  total_revenue: number;
  avg_margin: number;
  conversion_rate: number;
  units_sold: number;
  views: number;
  clicks: number;
  period_start: string;
  period_end: string;
  channel_breakdown: Record<string, number>;
  performance_status: 'excellent' | 'good' | 'average' | 'poor';
  created_at: string;
  updated_at: string;
}

export interface DashboardConfiguration {
  id: string;
  user_id: string;
  dashboard_name: string;
  is_default: boolean;
  widget_layout: WidgetLayout[];
  template_type: 'ecommerce' | 'services' | 'retail' | 'custom';
  sharing_settings: {
    is_public: boolean;
    shared_with: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface WidgetLayout {
  id: string;
  type: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
  config: Record<string, unknown>;
}

export interface FinancialSummary {
  totalSales: number;
  grossRevenue: number;
  grossProfit: number;
  averageTicket: number;
  totalExpenses: number;
  period: string;
  growth: number;
}

export interface PerformanceKPIs {
  roi: number;
  cac: number;
  conversionRate: number;
  activeClients: number;
  repurchaseRate: number;
  period: string;
}

export interface ChannelComparison {
  channel: string;
  sales: number;
  revenue: number;
  commission: number;
  profit: number;
  growth: number;
}

export interface AIInsight {
  id: string;
  type: 'growth' | 'opportunity' | 'alert' | 'recommendation';
  title: string;
  message: string;
  confidence: number;
  data: Record<string, unknown>;
  created_at: string;
}