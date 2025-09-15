import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, DollarSign, Receipt, Target, TrendingDown, TrendingUp } from 'lucide-react';
import { FinancialSummary } from '@/types/businessMetrics';

interface FinancialSummaryWidgetProps {
  data: FinancialSummary;
  isPro?: boolean;
}

export default function FinancialSummaryWidget({ data, isPro = false }: FinancialSummaryWidgetProps) {
  const metrics = [
    {
      title: 'Total de Vendas',
      value: data.totalSales,
      format: 'number',
      icon: Receipt,
      description: 'Vendas no período'
    },
    {
      title: 'Receita Bruta',
      value: data.grossRevenue,
      format: 'currency',
      icon: DollarSign,
      description: 'Faturamento total'
    },
    {
      title: 'Lucro Bruto',
      value: data.grossProfit,
      format: 'currency',
      icon: Target,
      description: 'Lucro após custos'
    },
    {
      title: 'Ticket Médio',
      value: data.averageTicket,
      format: 'currency',
      icon: CreditCard,
      description: 'Valor médio por venda'
    }
  ];

  const formatValue = (value: number, format: string) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    return value.toLocaleString('pt-BR');
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) {return 'text-emerald-600 dark:text-emerald-400';}
    if (growth < 0) {return 'text-red-600 dark:text-red-400';}
    return 'text-muted-foreground';
  };

  const GrowthIcon = data.growth >= 0 ? TrendingUp : TrendingDown;

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Resumo Financeiro</CardTitle>
        <div className="flex items-center space-x-1">
          <GrowthIcon className={`h-4 w-4 ${getGrowthColor(data.growth)}`} />
          <span className={`text-xs font-medium ${getGrowthColor(data.growth)}`}>
            {Math.abs(data.growth).toFixed(1)}%
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{metric.title}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold">
                    {!isPro && index > 1 ? 'R$ --,--' : formatValue(metric.value, metric.format)}
                  </p>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {!isPro && (
          <div className="mt-4 p-3 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg border border-primary/20">
            <p className="text-xs text-center text-muted-foreground">
              Upgrade para PRO para ver todas as métricas
            </p>
          </div>
        )}

        <CardDescription className="mt-3 text-xs">
          Período: {data.period} • Última atualização: {new Date().toLocaleDateString('pt-BR')}
        </CardDescription>
      </CardContent>
    </Card>
  );
}