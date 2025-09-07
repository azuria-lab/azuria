
import React from 'react';
import { DashboardWidget } from '@/types/dashboard';
import { useRealTimeMetrics } from '@/hooks/useRealTimeMetrics';
import { useCalculationHistory } from '@/hooks/useCalculationHistory';
import { useAdvancedBusinessMetrics } from '@/hooks/useAdvancedBusinessMetrics';
import { useAuthContext } from '@/domains/auth';
import TrendsChart from '@/components/analytics/dashboard/TrendsChart';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/calculator/formatCurrency';
import { AlertTriangle, Calculator, DollarSign, TrendingUp, Users } from 'lucide-react';
import FinancialSummaryWidget from './widgets/FinancialSummaryWidget';
import PerformanceKPIsWidget from './widgets/PerformanceKPIsWidget';
import ChannelComparisonWidget from './widgets/ChannelComparisonWidget';
import AIInsightsWidget from './widgets/AIInsightsWidget';
import DataEntryFormWidget from './widgets/DataEntryFormWidget';

interface WidgetRendererProps {
  widget: DashboardWidget;
}

// Define chart data types to match the TrendsChart component
interface ChartDataItem {
  hour: string;
  avgPrice: number;
  volume: number;
  margin: number;
}

interface RevenueDataItem {
  hour: string;
  avgPrice: number;
  volume: number;
  margin: number;
  receita?: number;
}

export default function WidgetRenderer({ widget }: WidgetRendererProps) {
  const { realTimeMetrics } = useRealTimeMetrics();
  const { history } = useCalculationHistory();
  const { user } = useAuthContext();
  const period = widget.config.period === 'today' ? 'week' : widget.config.period || 'month';
  const { 
    financialSummary, 
    performanceKPIs, 
    channelComparison, 
    insights 
  } = useAdvancedBusinessMetrics(period as 'week' | 'month' | 'quarter' | 'year');

  switch (widget.type) {
    case 'metrics-summary':
      return (
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Calculator className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <p className="text-sm text-gray-600">Cálculos Hoje</p>
            <p className="text-lg font-bold text-blue-600">{realTimeMetrics.calculationsToday}</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <DollarSign className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-sm text-gray-600">Receita Pot.</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(realTimeMetrics.revenueToday)}
            </p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Users className="h-5 w-5 mx-auto mb-1 text-purple-600" />
            <p className="text-sm text-gray-600">Usuários</p>
            <p className="text-lg font-bold text-purple-600">{realTimeMetrics.activeUsers}</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-orange-600" />
            <p className="text-sm text-gray-600">Margem Média</p>
            <p className="text-lg font-bold text-orange-600">
              {realTimeMetrics.avgMarginToday.toFixed(1)}%
            </p>
          </div>
        </div>
      );

    case 'calculations-chart': {
      const calculationsData: ChartDataItem[] = [
        { hour: '00:00', avgPrice: 45, volume: 12, margin: 25 },
        { hour: '04:00', avgPrice: 52, volume: 15, margin: 28 },
        { hour: '08:00', avgPrice: 38, volume: 11, margin: 22 },
        { hour: '12:00', avgPrice: 61, volume: 18, margin: 30 },
        { hour: '16:00', avgPrice: 49, volume: 14, margin: 26 },
        { hour: '20:00', avgPrice: 33, volume: 9, margin: 20 },
        { hour: '23:00', avgPrice: 28, volume: 8, margin: 18 }
      ];

      return (
        <div className="h-48">
          <TrendsChart data={calculationsData} />
        </div>
      );
    }

    case 'recent-calculations': {
      const recentCalculations = history.slice(0, 5);
      return (
        <div className="space-y-2">
          {recentCalculations.length > 0 ? recentCalculations.map((calc, index) => (
            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
              <div>
                <p className="text-sm font-medium">
                  {formatCurrency(parseFloat(calc.cost || '0'))} → {formatCurrency(calc.result?.sellingPrice || 0)}
                </p>
                <p className="text-xs text-gray-500">Margem: {calc.margin}%</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {new Date(calc.date).toLocaleDateString('pt-BR')}
              </Badge>
            </div>
          )) : (
            <p className="text-sm text-gray-500 text-center py-4">
              Nenhum cálculo recente
            </p>
          )}
        </div>
      );
    }

    case 'revenue-chart': {
      const revenueData: RevenueDataItem[] = [
        { hour: '00:00', avgPrice: 45000, volume: 120, margin: 25 },
        { hour: '04:00', avgPrice: 52000, volume: 150, margin: 28 },
        { hour: '08:00', avgPrice: 48000, volume: 110, margin: 22 },
        { hour: '12:00', avgPrice: 61000, volume: 180, margin: 30 },
        { hour: '16:00', avgPrice: 55000, volume: 140, margin: 26 },
        { hour: '20:00', avgPrice: 67000, volume: 190, margin: 32 }
      ];

      return (
        <div className="h-48">
          <TrendsChart data={revenueData} />
        </div>
      );
    }

    case 'user-activity':
      return (
        <div className="text-center">
          <div className="text-3xl font-bold text-brand-600 mb-2">
            {realTimeMetrics.activeUsers}
          </div>
          <p className="text-sm text-gray-600 mb-3">Usuários ativos agora</p>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-brand-600 transition-all duration-500"
              style={{ width: `${Math.min(realTimeMetrics.activeUsers * 10, 100)}%` }}
            />
          </div>
        </div>
      );

    case 'alerts':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <div>
              <p className="text-sm font-medium">Margem baixa detectada</p>
              <p className="text-xs text-gray-600">3 produtos com margem menor que 20%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Aumento na demanda</p>
              <p className="text-xs text-gray-600">+15% cálculos esta semana</p>
            </div>
          </div>
        </div>
      );

    case 'recommendations':
      return (
        <div className="space-y-3">
          <div className="p-3 bg-gradient-to-r from-brand-50 to-brand-100 rounded-lg">
            <h4 className="font-medium text-brand-800 mb-1">💡 Recomendação</h4>
            <p className="text-sm text-brand-700">
              Considere aumentar a margem em produtos de alta rotação para maximizar lucros.
            </p>
          </div>
          <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <h4 className="font-medium text-green-800 mb-1">📈 Oportunidade</h4>
            <p className="text-sm text-green-700">
              Templates de restaurante estão em alta. Explore esse mercado.
            </p>
          </div>
        </div>
      );

    case 'competitor-comparison':
      return (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm">Sua margem média</span>
            <span className="font-bold text-brand-600">
              {realTimeMetrics.avgMarginToday.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Mercado</span>
            <span className="text-gray-600">28.5%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Concorrente A</span>
            <span className="text-gray-600">32.1%</span>
          </div>
          <div className="mt-3 p-2 bg-green-50 rounded text-center">
            <p className="text-xs text-green-700">
              Você está {realTimeMetrics.avgMarginToday > 28.5 ? 'acima' : 'abaixo'} da média do mercado
            </p>
          </div>
        </div>
      );

    // Novos widgets avançados
    case 'financial-summary':
      return <FinancialSummaryWidget data={financialSummary} />;

    case 'performance-kpis':
      return <PerformanceKPIsWidget data={performanceKPIs} />;

    case 'channel-comparison':
      return <ChannelComparisonWidget data={channelComparison} />;

    case 'ai-insights':
      return <AIInsightsWidget insights={insights} />;

    case 'data-entry-form':
      return <DataEntryFormWidget userPlan={user?.user_metadata?.plan || 'free'} />;

    default:
      return (
        <div className="text-center text-gray-500 py-8">
          <p>Widget não implementado: {widget.type}</p>
        </div>
      );
  }
}
