
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { usePerformanceMonitoring, useWebVitals } from '@/hooks/useWebVitals';
import { Activity, Clock, Users, Zap } from 'lucide-react';
import { logger } from '@/services/logger';

type WebVitalMetric = {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
};

export const PerformanceDashboard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([]);
  const performanceMonitor = usePerformanceMonitoring();

  const { getMetrics, getScore } = useWebVitals({
    onMetric: (metric) => {
      logger.debug?.('Web Vital recorded:', { name: metric.name, value: metric.value });
    },
    reportAllChanges: true
  });

  useEffect(() => {
    // Só mostrar em desenvolvimento por padrão
    setIsVisible(process.env.NODE_ENV === 'development');
    
    // Atualizar métricas periodicamente
    const interval = setInterval(() => {
      setMetrics(getMetrics());
    }, 5000);

    return () => clearInterval(interval);
  }, [getMetrics]);

  if (!isVisible) {return null;}

  const score = getScore();
  const performanceReport = performanceMonitor.getPerformanceReport();

  const getMetricColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'bg-green-500';
      case 'needs-improvement': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatMetricValue = (name: string, value: number) => {
    switch (name) {
      case 'CLS':
        return value.toFixed(3);
      case 'FID':
      case 'FCP':
      case 'LCP':
      case 'TTFB':
        return `${Math.round(value)}ms`;
      default:
        return value.toString();
    }
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 max-w-sm">
      <Card className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Dashboard
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
              className="ml-auto h-6 w-6 p-0"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4 text-xs">
          {/* Performance Score */}
          {score && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Performance Score</span>
                <Badge variant={performanceReport.performanceScore > 80 ? "default" : "destructive"}>
                  {performanceReport.performanceScore}/100
                </Badge>
              </div>
              <Progress value={performanceReport.performanceScore} className="h-2" />
            </div>
          )}

          {/* Web Vitals */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Web Vitals
            </h4>
            
            {metrics.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {metrics.map((metric) => (
                  <div key={metric.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getMetricColor(metric.rating)}`} />
                      <span className="font-mono text-xs">{metric.name}</span>
                    </div>
                    <span className="font-mono text-xs">
                      {formatMetricValue(metric.name, metric.value)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-2">
                Coletando métricas...
              </div>
            )}
          </div>

          {/* Render Performance */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Render Stats
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Avg Render</div>
                <div className={`font-mono ${performanceReport.averageRenderTime > 16 ? 'text-red-600' : 'text-green-600'}`}>
                  {performanceReport.averageRenderTime.toFixed(1)}ms
                </div>
              </div>
              
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Slow Renders</div>
                <div className={`font-mono ${performanceReport.slowRenders > 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {performanceReport.slowRenders}
                </div>
              </div>
            </div>
          </div>

          {/* User Activity */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-1">
              <Users className="h-3 w-3" />
              Session Info
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Interactions</div>
                <div className="font-mono text-blue-600">
                  {performanceReport.userInteractions}
                </div>
              </div>
              
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Errors</div>
                <div className={`font-mono ${performanceReport.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {performanceReport.errors}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => window.location.reload()}
              className="flex-1 text-xs"
            >
              Reload
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => logger.info?.('Performance Report:', performanceReport)}
              className="flex-1 text-xs"
            >
              Log Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Toggle para ativar/desativar o dashboard
export const PerformanceToggle: React.FC = () => {
  const [isDashboardVisible, setIsDashboardVisible] = useState(false);

  if (process.env.NODE_ENV !== 'development') {return null;}

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDashboardVisible(!isDashboardVisible)}
        className="fixed bottom-4 right-20 z-50"
      >
        <Activity className="h-4 w-4" />
      </Button>
      
      {isDashboardVisible && <PerformanceDashboard />}
    </>
  );
};
