import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3, 
  Repeat, 
  Target, 
  TrendingUp, 
  Users 
} from 'lucide-react';
import { PerformanceKPIs } from '@/types/businessMetrics';

interface PerformanceKPIsWidgetProps {
  data: PerformanceKPIs;
  isPremium?: boolean;
}

export default function PerformanceKPIsWidget({ data, isPremium = false }: PerformanceKPIsWidgetProps) {
  const kpis = [
    {
      title: 'ROI',
      value: data.roi,
      format: 'percentage',
      icon: TrendingUp,
      description: 'Retorno sobre investimento',
      target: 20,
      color: 'bg-emerald-500'
    },
    {
      title: 'CAC',
      value: data.cac,
      format: 'currency',
      icon: Target,
      description: 'Custo de aquisição de cliente',
      target: 50,
      color: 'bg-blue-500',
      inverted: true // Lower is better
    },
    {
      title: 'Taxa de Conversão',
      value: data.conversionRate,
      format: 'percentage',
      icon: BarChart3,
      description: 'Visitantes que compram',
      target: 3,
      color: 'bg-purple-500'
    },
    {
      title: 'Clientes Ativos',
      value: data.activeClients,
      format: 'number',
      icon: Users,
      description: 'Clientes que compraram',
      target: 100,
      color: 'bg-orange-500'
    },
    {
      title: 'Taxa de Recompra',
      value: data.repurchaseRate,
      format: 'percentage',
      icon: Repeat,
      description: 'Clientes que voltaram',
      target: 25,
      color: 'bg-pink-500'
    }
  ];

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(value);
      case 'percentage':
        return `${value.toFixed(1)}%`;
      default:
        return value.toLocaleString('pt-BR');
    }
  };

  const getProgressValue = (value: number, target: number, inverted = false) => {
    if (inverted) {
      return Math.max(0, Math.min(100, 100 - (value / target) * 100));
    }
    return Math.min(100, (value / target) * 100);
  };

  const getPerformanceStatus = (value: number, target: number, inverted = false) => {
    const ratio = inverted ? target / value : value / target;
    if (ratio >= 1.2) {return { status: 'Excelente', color: 'text-emerald-600' };}
    if (ratio >= 1.0) {return { status: 'Bom', color: 'text-blue-600' };}
    if (ratio >= 0.8) {return { status: 'Regular', color: 'text-yellow-600' };}
    return { status: 'Precisa melhorar', color: 'text-red-600' };
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Indicadores de Performance (KPIs)</CardTitle>
        <CardDescription>Métricas essenciais do seu negócio</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            const progressValue = getProgressValue(kpi.value, kpi.target, kpi.inverted);
            const performance = getPerformanceStatus(kpi.value, kpi.target, kpi.inverted);

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{kpi.title}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">
                      {!isPremium && index > 2 ? '--' : formatValue(kpi.value, kpi.format)}
                    </p>
                    <p className={`text-xs ${performance.color}`}>
                      {!isPremium && index > 2 ? '--' : performance.status}
                    </p>
                  </div>
                </div>
                
                {(isPremium || index <= 2) && (
                  <div className="space-y-1">
                    <Progress 
                      value={progressValue} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      {kpi.description} • Meta: {formatValue(kpi.target, kpi.format)}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {!isPremium && (
          <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <p className="text-xs text-center text-muted-foreground">
              Upgrade para Premium para ver todos os KPIs avançados
            </p>
          </div>
        )}

        <CardDescription className="mt-3 text-xs">
          Período: {data.period} • Atualizado em tempo real
        </CardDescription>
      </CardContent>
    </Card>
  );
}