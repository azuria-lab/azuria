import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/domains/auth';
import { 
  AIInsight, 
  BusinessMetric, 
  ChannelComparison, 
  FinancialSummary, 
  PerformanceKPIs,
  ProductPerformance,
  SalesData
} from '@/types/businessMetrics';

export const useAdvancedBusinessMetrics = (period: 'week' | 'month' | 'quarter' | 'year' = 'month') => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const [insights, setInsights] = useState<AIInsight[]>([]);

  // Fetch business metrics
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['business-metrics', user?.id, period],
    queryFn: async () => {
      if (!user?.id) {return [];}
      
      const { data, error } = await supabase
        .from('business_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_date', getDateRange(period).start)
        .lte('period_date', getDateRange(period).end)
        .order('period_date', { ascending: false });

      if (error) {throw error;}
      return data as BusinessMetric[];
    },
    enabled: !!user?.id
  });

  // Fetch sales data
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-data', user?.id, period],
    queryFn: async () => {
      if (!user?.id) {return [];}
      
      const { data, error } = await supabase
        .from('sales_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('sale_date', getDateRange(period).start)
        .lte('sale_date', getDateRange(period).end)
        .order('sale_date', { ascending: false });

      if (error) {throw error;}
      return (data as unknown as SalesData[]);
    },
    enabled: !!user?.id
  });

  // Fetch product performance
  const { data: productPerformance, isLoading: productsLoading } = useQuery({
    queryKey: ['product-performance', user?.id, period],
    queryFn: async () => {
      if (!user?.id) {return [];}
      
      const { data, error } = await supabase
        .from('product_performance')
        .select('*')
        .eq('user_id', user.id)
        .gte('period_start', getDateRange(period).start)
        .lte('period_end', getDateRange(period).end)
        .order('total_revenue', { ascending: false });

      if (error) {throw error;}
      return (data as unknown as ProductPerformance[]);
    },
    enabled: !!user?.id
  });

  // Calculate financial summary
  const financialSummary: FinancialSummary = useMemo(() => {
    if (!salesData?.length) {
      return {
        totalSales: 0,
        grossRevenue: 0,
        grossProfit: 0,
        averageTicket: 0,
        totalExpenses: 0,
        period,
        growth: 0
      };
    }

    const totalSales = salesData.length;
    const grossRevenue = salesData.reduce((sum, sale) => sum + sale.sale_value, 0);
    const totalCosts = salesData.reduce((sum, sale) => 
      sum + (sale.cost_value || 0) + sale.commission_fee + sale.advertising_cost + sale.shipping_cost, 0);
    const grossProfit = grossRevenue - totalCosts;
    const averageTicket = grossRevenue / totalSales;

    return {
      totalSales,
      grossRevenue,
      grossProfit,
      averageTicket,
      totalExpenses: totalCosts,
      period,
      growth: calculateGrowth(salesData)
    };
  }, [salesData, period]);

  // Calculate performance KPIs
  const performanceKPIs: PerformanceKPIs = useMemo(() => {
    const roiMetric = metrics?.find(m => m.metric_type === 'roi')?.metric_value || 0;
    const cacMetric = metrics?.find(m => m.metric_type === 'cac')?.metric_value || 0;
    const conversionMetric = metrics?.find(m => m.metric_type === 'conversao')?.metric_value || 0;
    const activeClientsMetric = metrics?.find(m => m.metric_type === 'clientes_ativos')?.metric_value || 0;
    const repurchaseMetric = metrics?.find(m => m.metric_type === 'recompra')?.metric_value || 0;

    return {
      roi: roiMetric,
      cac: cacMetric,
      conversionRate: conversionMetric,
      activeClients: activeClientsMetric,
      repurchaseRate: repurchaseMetric,
      period
    };
  }, [metrics, period]);

  // Calculate channel comparison
  const channelComparison: ChannelComparison[] = useMemo(() => {
    if (!salesData?.length) {return [];}

    const channelGroups = salesData.reduce((acc, sale) => {
      const channel = sale.channel_name;
      if (!acc[channel]) {
        acc[channel] = {
          sales: 0,
          revenue: 0,
          commission: 0,
          cost: 0
        };
      }
      
      acc[channel].sales += 1;
      acc[channel].revenue += sale.sale_value;
      acc[channel].commission += sale.commission_fee;
      acc[channel].cost += (sale.cost_value || 0) + sale.advertising_cost + sale.shipping_cost;
      
      return acc;
  }, {} as Record<string, { sales: number; revenue: number; commission: number; cost: number }>);

    return Object.entries(channelGroups).map(([channel, data]) => ({
      channel: getChannelDisplayName(channel),
      sales: data.sales,
      revenue: data.revenue,
      commission: data.commission,
      profit: data.revenue - data.cost - data.commission,
      growth: Math.random() * 20 - 10 // Mock growth for now
    }));
  }, [salesData]);

  // Generate AI insights
  useEffect(() => {
    if (financialSummary && performanceKPIs && channelComparison.length > 0) {
      const newInsights = generateAIInsights(financialSummary, performanceKPIs, channelComparison);
      setInsights(newInsights);
    }
  }, [financialSummary, performanceKPIs, channelComparison]);

  return {
    metrics,
    salesData,
    productPerformance,
    financialSummary,
    performanceKPIs,
    channelComparison,
    insights,
    isLoading: metricsLoading || salesLoading || productsLoading,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ['business-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['sales-data'] });
      queryClient.invalidateQueries({ queryKey: ['product-performance'] });
    }
  };
};

// Helper functions
function getDateRange(period: string) {
  const now = new Date();
  const start = new Date();
  
  switch (period) {
    case 'week':
      start.setDate(now.getDate() - 7);
      break;
    case 'month':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'quarter':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'year':
      start.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return {
    start: start.toISOString().split('T')[0],
    end: now.toISOString().split('T')[0]
  };
}

function calculateGrowth(salesData: SalesData[]): number {
  if (salesData.length < 2) {return 0;}
  
  const sortedData = [...salesData].sort((a, b) => 
    new Date(a.sale_date).getTime() - new Date(b.sale_date).getTime()
  );
  
  const halfPoint = Math.floor(sortedData.length / 2);
  const firstHalf = sortedData.slice(0, halfPoint);
  const secondHalf = sortedData.slice(halfPoint);
  
  const firstHalfTotal = firstHalf.reduce((sum, sale) => sum + sale.sale_value, 0);
  const secondHalfTotal = secondHalf.reduce((sum, sale) => sum + sale.sale_value, 0);
  
  if (firstHalfTotal === 0) {return 0;}
  
  return ((secondHalfTotal - firstHalfTotal) / firstHalfTotal) * 100;
}

function getChannelDisplayName(channel: string): string {
  const channelNames = {
    'mercado_livre': 'Mercado Livre',
    'shopee': 'Shopee',
    'amazon': 'Amazon',
    'magalu': 'Magalu',
    'loja_fisica': 'Loja Física',
    'site_proprio': 'Site Próprio'
  };
  
  return channelNames[channel as keyof typeof channelNames] || channel;
}

function generateAIInsights(
  financial: FinancialSummary, 
  kpis: PerformanceKPIs, 
  channels: ChannelComparison[]
): AIInsight[] {
  const insights: AIInsight[] = [];
  
  // Growth insight
  if (financial.growth > 10) {
    insights.push({
      id: 'growth-positive',
      type: 'growth',
      title: 'Crescimento Acelerado! 🚀',
      message: `Suas vendas cresceram ${financial.growth.toFixed(1)}% no período analisado. Continue assim!`,
      confidence: 0.9,
      data: { growth: financial.growth },
      created_at: new Date().toISOString()
    });
  } else if (financial.growth < -5) {
    insights.push({
      id: 'growth-alert',
      type: 'alert',
      title: 'Atenção: Queda nas Vendas 📉',
      message: `Suas vendas caíram ${Math.abs(financial.growth).toFixed(1)}% no período. Vamos analisar estratégias de recuperação.`,
      confidence: 0.8,
      data: { growth: financial.growth },
      created_at: new Date().toISOString()
    });
  }
  
  // Best channel insight
  const bestChannel = channels.reduce((best, current) => 
    current.profit > best.profit ? current : best, channels[0]
  );
  
  if (bestChannel) {
    insights.push({
      id: 'best-channel',
      type: 'opportunity',
      title: `${bestChannel.channel} é seu melhor canal! 💰`,
      message: `${bestChannel.channel} gerou R$ ${bestChannel.profit.toFixed(2)} de lucro. Considere investir mais neste canal.`,
      confidence: 0.85,
      data: { channel: bestChannel },
      created_at: new Date().toISOString()
    });
  }
  
  // Conversion rate insight
  if (kpis.conversionRate < 2) {
    insights.push({
      id: 'conversion-low',
      type: 'recommendation',
      title: 'Melhore sua Taxa de Conversão 🎯',
      message: `Sua taxa de conversão atual é ${kpis.conversionRate.toFixed(1)}%. Otimize suas descrições e preços para aumentar as vendas.`,
      confidence: 0.75,
      data: { conversionRate: kpis.conversionRate },
      created_at: new Date().toISOString()
    });
  }
  
  return insights;
}