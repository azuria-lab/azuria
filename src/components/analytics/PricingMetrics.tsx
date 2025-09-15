
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Activity, ArrowDownRight, ArrowUpRight, DollarSign, Target, TrendingUp } from "lucide-react";

interface PricingMetric {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  current?: number;
}

export default function PricingMetrics() {
  const metrics: PricingMetric[] = [
    {
      label: "Margem Média",
      value: "28.5%",
      change: +3.2,
      trend: 'up',
      target: 30,
      current: 28.5
    },
    {
      label: "Preço Médio",
      value: "R$ 127,90",
      change: +12.8,
      trend: 'up'
    },
    {
      label: "Competitividade",
      value: "85%",
      change: -2.1,
      trend: 'down',
      target: 90,
      current: 85
    },
    {
      label: "ROI Estimado",
      value: "245%",
      change: +18.7,
      trend: 'up'
    },
    {
      label: "Produtos Analisados",
      value: "1,247",
      change: +156,
      trend: 'up'
    },
    {
      label: "Taxa de Conversão PRO",
      value: "12.3%",
      change: +4.1,
      trend: 'up',
      target: 15,
      current: 12.3
    }
  ];

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up' || change > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    }
    if (trend === 'down' || change < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getChangeColor = (change: number) => {
    return change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Métricas de Precificação</h2>
        <Badge variant="outline" className="text-xs">
          Atualizado há 5 min
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{metric.label}</span>
                {getTrendIcon(metric.trend, metric.change)}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{metric.value}</span>
                  <span className={`text-sm font-medium ${getChangeColor(metric.change)}`}>
                    {metric.change > 0 ? '+' : ''}{metric.change}%
                  </span>
                </div>

                {metric.target && metric.current && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Meta: {metric.target}%</span>
                      <span>{((metric.current / metric.target) * 100).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={(metric.current / metric.target) * 100} 
                      className="h-2"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo Estratégico */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            Resumo Estratégico
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <DollarSign className="h-8 w-8 text-green-600 bg-green-100 p-2 rounded-full" />
              <div>
                <p className="text-sm text-gray-600">Revenue Impact</p>
                <p className="text-lg font-bold text-green-600">+R$ 12.4k</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <TrendingUp className="h-8 w-8 text-blue-600 bg-blue-100 p-2 rounded-full" />
              <div>
                <p className="text-sm text-gray-600">Otimização</p>
                <p className="text-lg font-bold text-blue-600">23 produtos</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Activity className="h-8 w-8 text-purple-600 bg-purple-100 p-2 rounded-full" />
              <div>
                <p className="text-sm text-gray-600">Oportunidades</p>
                <p className="text-lg font-bold text-purple-600">8 alertas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
