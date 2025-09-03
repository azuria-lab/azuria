import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useWebVitals } from '@/hooks/useWebVitals';
import { getWebVitalsReporter } from '@/utils/webVitalsReporter';
import { Activity, Monitor, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface PerformanceMonitorProps {
  showDetails?: boolean;
  autoHide?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  showDetails = false,
  autoHide = true
}) => {
  const { getMetrics, getScore } = useWebVitals({
    reportAllChanges: true,
    onMetric: (metric) => {
      if (metric.rating === 'poor') {
        console.warn(`Performance issue detected: ${metric.name} = ${metric.value}`);
      }
    }
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [performanceScore, setPerformanceScore] = useState<number | null>(null);
  const [shouldShow, setShouldShow] = useState(!autoHide);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const updateScore = () => {
      const score = getScore();
      if (score) {
        const avgScore = (score.good * 100 + score.needsImprovement * 50) / 100;
        setPerformanceScore(Math.round(avgScore));
        
        // Auto mostrar se performance ruim
        if (avgScore < 70 && autoHide) {
          setShouldShow(true);
        }
      }
    };

    const interval = setInterval(updateScore, 5000);
    updateScore();

    return () => clearInterval(interval);
  }, [getScore, autoHide]);

  const refreshMetrics = () => {
    window.location.reload();
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) {return 'text-green-600';}
    if (score >= 60) {return 'text-yellow-600';}
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) {return 'default';}
    if (score >= 60) {return 'secondary';}
    return 'destructive';
  };

  if (!shouldShow && autoHide) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShouldShow(true)}
        className="fixed bottom-4 right-4 z-50 bg-background/80 backdrop-blur-sm"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    );
  }

  const metrics = getMetrics();

  return (
    <Card className="fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)] bg-background/95 backdrop-blur-sm border shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Performance Monitor
          </CardTitle>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-4 w-4 text-green-600" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-600" />
            )}
            {autoHide && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShouldShow(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Score Geral */}
        {performanceScore !== null && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Score Geral</span>
              <Badge variant={getScoreBadgeVariant(performanceScore)}>
                {performanceScore}%
              </Badge>
            </div>
            <Progress value={performanceScore} className="h-2" />
          </div>
        )}

        {/* Métricas Web Vitals */}
        {showDetails && metrics.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Web Vitals</h4>
            {metrics.map((metric) => (
              <div key={metric.name} className="flex items-center justify-between text-xs">
                <span>{metric.name}</span>
                <div className="flex items-center gap-2">
                  <span className={getScoreColor(
                    metric.rating === 'good' ? 100 : 
                    metric.rating === 'needs-improvement' ? 50 : 0
                  )}>
                    {metric.value.toFixed(metric.name === 'CLS' ? 3 : 0)}
                    {metric.name !== 'CLS' && 'ms'}
                  </span>
                  <Badge 
                    variant={
                      metric.rating === 'good' ? 'default' :
                      metric.rating === 'needs-improvement' ? 'secondary' : 'destructive'
                    }
                    className="text-xs py-0"
                  >
                    {metric.rating === 'good' ? 'Bom' :
                     metric.rating === 'needs-improvement' ? 'Regular' : 'Ruim'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Status de Conexão */}
        <div className="flex items-center justify-between text-xs">
          <span>Status</span>
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshMetrics}
            className="flex-1 h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Atualizar
          </Button>
          {import.meta.env.DEV && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.setItem('azuria-enable-vitals-reporting', 'true');
                window.location.reload();
              }}
              className="flex-1 h-7 text-xs"
            >
              Ativar Reports
            </Button>
          )}
        </div>

        {/* Dicas de Performance */}
        {performanceScore !== null && performanceScore < 70 && (
          <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded">
            💡 <strong>Dica:</strong> Performance baixa detectada. 
            Verifique sua conexão ou tente recarregar a página.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;