
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, AlertTriangle, Clock, Zap } from "lucide-react";

interface PerformanceMetricsProps {
  performanceScore: number;
}

export default function PerformanceMetrics({ performanceScore }: PerformanceMetricsProps) {
  const [webVitals, setWebVitals] = useState({
    lcp: 0,
    fid: 0,
    cls: 0,
    fcp: 0,
    ttfb: 0
  });

  const [performanceHistory, setPerformanceHistory] = useState<any[]>([]);

  useEffect(() => {
    // Simulate Web Vitals data
    setWebVitals({
      lcp: Math.random() * 2000 + 1000, // LCP in ms
      fid: Math.random() * 50 + 10, // FID in ms
      cls: Math.random() * 0.1 + 0.05, // CLS score
      fcp: Math.random() * 1500 + 800, // FCP in ms
      ttfb: Math.random() * 200 + 100 // TTFB in ms
    });

    // Generate performance history
    const history = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      performance: Math.floor(Math.random() * 20) + 75,
      loadTime: Math.random() * 1000 + 500,
      errorRate: Math.random() * 2,
      uptime: 99 + Math.random()
    }));
    setPerformanceHistory(history);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) {return "text-green-600";}
    if (score >= 70) {return "text-yellow-600";}
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) {return { label: "Excelente", color: "bg-green-100 text-green-800" };}
    if (score >= 70) {return { label: "Bom", color: "bg-yellow-100 text-yellow-800" };}
    return { label: "Precisa Melhorar", color: "bg-red-100 text-red-800" };
  };

  const vitalsData = [
    {
      metric: "LCP (Largest Contentful Paint)",
      value: webVitals.lcp.toFixed(0),
      unit: "ms",
      threshold: 2500,
      icon: Clock,
      description: "Tempo até o maior elemento visual carregar"
    },
    {
      metric: "FID (First Input Delay)",
      value: webVitals.fid.toFixed(0),
      unit: "ms",
      threshold: 100,
      icon: Zap,
      description: "Tempo de resposta à primeira interação"
    },
    {
      metric: "CLS (Cumulative Layout Shift)",
      value: webVitals.cls.toFixed(3),
      unit: "",
      threshold: 0.1,
      icon: Activity,
      description: "Estabilidade visual da página"
    },
    {
      metric: "FCP (First Contentful Paint)",
      value: webVitals.fcp.toFixed(0),
      unit: "ms",
      threshold: 1800,
      icon: Clock,
      description: "Tempo até o primeiro conteúdo aparecer"
    },
    {
      metric: "TTFB (Time to First Byte)",
      value: webVitals.ttfb.toFixed(0),
      unit: "ms",
      threshold: 600,
      icon: Zap,
      description: "Tempo de resposta do servidor"
    }
  ];

  const scoreBadge = getScoreBadge(performanceScore);

  return (
    <div className="space-y-6">
      {/* Performance Score Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                Score de Performance
              </CardTitle>
              <p className="text-sm text-gray-600">Baseado em Web Vitals e métricas do sistema</p>
            </div>
            <Badge className={scoreBadge.color}>
              {scoreBadge.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-gray-200 relative">
                <div 
                  className="absolute top-0 left-0 w-full h-full rounded-full border-8 border-blue-600 border-t-transparent animate-pulse"
                  style={{
                    transform: `rotate(${(performanceScore / 100) * 360}deg)`,
                    borderColor: performanceScore >= 90 ? '#10B981' : performanceScore >= 70 ? '#F59E0B' : '#EF4444'
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
                      {performanceScore}
                    </p>
                    <p className="text-xs text-gray-600">/ 100</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Uptime</p>
                  <p className="text-xl font-bold text-green-600">99.9%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Erro Rate</p>
                  <p className="text-xl font-bold text-red-600">0.1%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Load Time</p>
                  <p className="text-xl font-bold text-blue-600">{(webVitals.lcp / 1000).toFixed(1)}s</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requests/min</p>
                  <p className="text-xl font-bold text-purple-600">1,247</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Web Vitals Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vitalsData.map((vital, index) => {
          const Icon = vital.icon;
          const isGood = parseFloat(vital.value) <= vital.threshold;
          
          return (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Icon className={`h-5 w-5 ${isGood ? 'text-green-600' : 'text-red-600'}`} />
                  <Badge className={isGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {isGood ? 'Bom' : 'Ruim'}
                  </Badge>
                </div>
                <div className="mb-2">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    {vital.metric.split(' (')[0]}
                  </p>
                  <p className="text-2xl font-bold">
                    {vital.value} {vital.unit}
                  </p>
                </div>
                <div className="mb-3">
                  <Progress 
                    value={Math.min((parseFloat(vital.value) / vital.threshold) * 100, 100)} 
                    className="h-2"
                  />
                </div>
                <p className="text-xs text-gray-600">{vital.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Performance</CardTitle>
          <p className="text-sm text-gray-600">Métricas das últimas 24 horas</p>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="performance" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  name="Score"
                />
                <Line 
                  type="monotone" 
                  dataKey="loadTime" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Load Time (ms)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Recomendações de Otimização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                priority: "Alta",
                issue: "Otimizar imagens para reduzir LCP",
                impact: "Redução de ~800ms no tempo de carregamento",
                color: "text-red-600"
              },
              {
                priority: "Média",
                issue: "Implementar lazy loading para componentes",
                impact: "Melhoria de 15% no FCP",
                color: "text-yellow-600"
              },
              {
                priority: "Baixa",
                issue: "Minificar JavaScript não utilizado",
                impact: "Redução de 50KB no bundle",
                color: "text-green-600"
              }
            ].map((rec, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={`${rec.color} bg-opacity-10`}>
                      {rec.priority}
                    </Badge>
                    <p className="text-sm font-medium">{rec.issue}</p>
                  </div>
                  <p className="text-xs text-gray-600">{rec.impact}</p>
                </div>
                <AlertTriangle className={`h-4 w-4 ${rec.color}`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
