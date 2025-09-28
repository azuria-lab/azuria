import React, { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Gauge, 
  Target,
  Timer,
  TrendingUp,
  Zap
} from 'lucide-react';

// Interfaces para Web Vitals
interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id: string;
  timestamp: number;
}

interface PerformanceReport {
  overall_score: number;
  metrics: Record<string, WebVitalMetric>;
  recommendations: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    action: string;
    description: string;
    techniques?: string[];
  }>;
  trends: Record<string, {
    change: number;
    percent_change: number;
    direction: 'better' | 'worse';
  }>;
}

// Hook para Web Vitals (versão otimizada)
const useWebVitalsMonitor = () => {
  const [metrics, setMetrics] = useState<WebVitalMetric[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastReport, setLastReport] = useState<PerformanceReport | null>(null);

  // Simula coleta de Web Vitals (em produção, usar web-vitals library)
  const collectMetrics = useCallback(async () => {
    if (typeof window === 'undefined') {return;}

    try {
      // Simula métricas para desenvolvimento
      const mockMetrics: WebVitalMetric[] = [
        {
          name: 'LCP',
          value: Math.random() * 3000 + 1500,
          rating: Math.random() > 0.7 ? 'good' : Math.random() > 0.3 ? 'needs-improvement' : 'poor',
          id: 'lcp-' + Date.now(),
          timestamp: Date.now()
        },
        {
          name: 'FID',
          value: Math.random() * 200 + 50,
          rating: Math.random() > 0.6 ? 'good' : Math.random() > 0.3 ? 'needs-improvement' : 'poor',
          id: 'fid-' + Date.now(),
          timestamp: Date.now()
        },
        {
          name: 'CLS',
          value: Math.random() * 0.3 + 0.05,
          rating: Math.random() > 0.5 ? 'good' : Math.random() > 0.3 ? 'needs-improvement' : 'poor',
          id: 'cls-' + Date.now(),
          timestamp: Date.now()
        },
        {
          name: 'FCP',
          value: Math.random() * 2500 + 1000,
          rating: Math.random() > 0.6 ? 'good' : Math.random() > 0.3 ? 'needs-improvement' : 'poor',
          id: 'fcp-' + Date.now(),
          timestamp: Date.now()
        },
        {
          name: 'TTFB',
          value: Math.random() * 800 + 200,
          rating: Math.random() > 0.7 ? 'good' : Math.random() > 0.4 ? 'needs-improvement' : 'poor',
          id: 'ttfb-' + Date.now(),
          timestamp: Date.now()
        }
      ];

      setMetrics(prev => [...mockMetrics, ...prev.slice(0, 50)]);
      
    } catch (error) {
      console.warn('Failed to collect Web Vitals:', error);
    }
  }, []);

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    collectMetrics();
    
    // Coleta inicial e depois a cada 30 segundos
    const interval = setInterval(collectMetrics, 30000);
    return () => clearInterval(interval);
  }, [collectMetrics]);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  const generateReport = useCallback((): PerformanceReport | null => {
    if (metrics.length === 0) {return null;}

    const latestMetrics = metrics.slice(0, 5);
    const metricsRecord: Record<string, WebVitalMetric> = {};
    
    latestMetrics.forEach(metric => {
      metricsRecord[metric.name] = metric;
    });

    const goodMetrics = latestMetrics.filter(m => m.rating === 'good').length;
    const overall_score = Math.round((goodMetrics / latestMetrics.length) * 100);

    const report: PerformanceReport = {
      overall_score,
      metrics: metricsRecord,
      recommendations: generateRecommendations(latestMetrics),
      trends: {}
    };

    setLastReport(report);
    return report;
  }, [metrics]);

  return {
    metrics,
    isMonitoring,
    lastReport,
    startMonitoring,
    stopMonitoring,
    generateReport,
    collectMetrics
  };
};

// Função para gerar recomendações
const generateRecommendations = (metrics: WebVitalMetric[]) => {
  const recommendations: Array<{
    type: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    action: string;
    description: string;
    techniques?: string[];
  }> = [];

  metrics.forEach(metric => {
    if (metric.rating === 'poor') {
      switch (metric.name) {
        case 'LCP':
          recommendations.push({
            type: 'performance',
            priority: 'high',
            action: 'Optimize Largest Contentful Paint',
            description: 'LCP is taking too long. Focus on optimizing your largest page element.',
            techniques: [
              'Optimize and compress images',
              'Preload important resources',
              'Use faster server response times',
              'Remove render-blocking resources'
            ]
          });
          break;
        case 'FID':
          recommendations.push({
            type: 'interactivity',
            priority: 'critical',
            action: 'Improve First Input Delay',
            description: 'Users are experiencing delays when interacting with your page.',
            techniques: [
              'Break up long-running JavaScript tasks',
              'Use web workers for heavy computations',
              'Implement code splitting',
              'Optimize third-party scripts'
            ]
          });
          break;
        case 'CLS':
          recommendations.push({
            type: 'stability',
            priority: 'high',
            action: 'Reduce Cumulative Layout Shift',
            description: 'Page elements are shifting unexpectedly during load.',
            techniques: [
              'Set explicit dimensions for media',
              'Reserve space for dynamic content',
              'Use CSS aspect-ratio',
              'Avoid inserting content above existing elements'
            ]
          });
          break;
      }
    }
  });

  return recommendations.slice(0, 3);
};

// Componente principal
export const WebVitalsMonitor: React.FC = () => {
  const {
    metrics,
    isMonitoring,
    lastReport,
    startMonitoring,
    stopMonitoring,
    generateReport
  } = useWebVitalsMonitor();

  const [activeTab, setActiveTab] = useState('overview');

  // Métricas agrupadas por tipo
  const groupedMetrics = useMemo(() => {
    const latest = metrics.slice(0, 5);
    return latest.reduce((acc, metric) => {
      acc[metric.name] = metric;
      return acc;
    }, {} as Record<string, WebVitalMetric>);
  }, [metrics]);

  // Score geral
  const overallScore = useMemo(() => {
    const latestMetrics = Object.values(groupedMetrics);
    if (latestMetrics.length === 0) {
      return 0;
    }
    
    const goodMetrics = latestMetrics.filter(m => m.rating === 'good').length;
    return Math.round((goodMetrics / latestMetrics.length) * 100);
  }, [groupedMetrics]);

  // Função para obter emoji baseado no rating
  const getRatingEmoji = (rating: string) => {
    switch (rating) {
      case 'good': return '✅';
      case 'needs-improvement': return '⚠️';
      case 'poor': return '❌';
      default: return '⚪';
    }
  };

  // Função para obter cor baseado no rating
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Activity className="h-8 w-8" />
            Web Vitals Monitor
          </h1>
          <p className="text-muted-foreground">
            Real-time Core Web Vitals performance monitoring
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant={overallScore >= 80 ? 'default' : overallScore >= 60 ? 'secondary' : 'destructive'}>
            Score: {overallScore}%
          </Badge>
          
          {isMonitoring ? (
            <Button onClick={stopMonitoring} variant="outline">
              <Timer className="h-4 w-4 mr-2" />
              Stop Monitoring
            </Button>
          ) : (
            <Button onClick={startMonitoring}>
              <Zap className="h-4 w-4 mr-2" />
              Start Monitoring
            </Button>
          )}
          
          <Button onClick={generateReport} variant="secondary">
            <Target className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(groupedMetrics).map(([name, metric]) => (
              <Card key={name}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    {name}
                    <span className="text-xl">{getRatingEmoji(metric.rating)}</span>
                  </CardTitle>
                  <CardDescription className={getRatingColor(metric.rating)}>
                    {metric.rating.replace('-', ' ')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.name === 'CLS' 
                      ? metric.value.toFixed(3)
                      : Math.round(metric.value)
                    }
                    {metric.name !== 'CLS' && <span className="text-sm font-normal ml-1">ms</span>}
                  </div>
                  
                  <Progress 
                    value={metric.rating === 'good' ? 100 : metric.rating === 'needs-improvement' ? 60 : 30}
                    className="mt-2"
                  />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Good Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {Object.values(groupedMetrics).filter(m => m.rating === 'good').length}
                </div>
                <p className="text-muted-foreground">out of {Object.keys(groupedMetrics).length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  Need Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">
                  {Object.values(groupedMetrics).filter(m => m.rating === 'needs-improvement').length}
                </div>
                <p className="text-muted-foreground">metrics to optimize</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gauge className="h-5 w-5" />
                  Overall Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${overallScore >= 80 ? 'text-green-600' : overallScore >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {overallScore}%
                </div>
                <p className="text-muted-foreground">performance score</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Metrics</CardTitle>
              <CardDescription>
                Core Web Vitals measurements and thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(groupedMetrics).map(([name, metric]) => (
                  <div key={name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getRatingEmoji(metric.rating)}</span>
                      <div>
                        <h3 className="font-medium">{name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {getMetricDescription(name)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold">
                        {metric.name === 'CLS' 
                          ? metric.value.toFixed(3)
                          : Math.round(metric.value)
                        }
                        {metric.name !== 'CLS' && <span className="text-sm font-normal">ms</span>}
                      </div>
                      <Badge variant={metric.rating === 'good' ? 'default' : metric.rating === 'needs-improvement' ? 'secondary' : 'destructive'}>
                        {metric.rating}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-4">
          {lastReport?.recommendations && lastReport.recommendations.length > 0 ? (
            <div className="space-y-4">
              {lastReport.recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {rec.priority === 'critical' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                      {rec.priority === 'high' && <TrendingUp className="h-5 w-5 text-orange-600" />}
                      {rec.priority === 'medium' && <Clock className="h-5 w-5 text-yellow-600" />}
                      {rec.action}
                      <Badge variant={rec.priority === 'critical' ? 'destructive' : rec.priority === 'high' ? 'secondary' : 'outline'}>
                        {rec.priority}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{rec.description}</CardDescription>
                  </CardHeader>
                  {rec.techniques && (
                    <CardContent>
                      <h4 className="font-medium mb-2">Recommended Techniques:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {rec.techniques.map((technique, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground">{technique}</li>
                        ))}
                      </ul>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-medium">No issues detected</h3>
                <p className="text-muted-foreground">All Web Vitals metrics are performing well!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
              <CardDescription>
                Track Web Vitals performance over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics.length > 0 ? (
                <div className="space-y-2">
                  {metrics.slice(0, 10).map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getRatingEmoji(metric.rating)}</span>
                        <span className="font-medium">{metric.name}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                          {new Date(metric.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="font-mono">
                          {metric.name === 'CLS' ? metric.value.toFixed(3) : Math.round(metric.value)}
                          {metric.name !== 'CLS' && 'ms'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-muted-foreground">No performance data yet. Start monitoring to see history.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Função auxiliar para descrições de métricas
const getMetricDescription = (metricName: string) => {
  switch (metricName) {
    case 'LCP': return 'Largest Contentful Paint - Time to render largest element';
    case 'FID': return 'First Input Delay - Time from first interaction to browser response';
    case 'CLS': return 'Cumulative Layout Shift - Visual stability of page elements';
    case 'FCP': return 'First Contentful Paint - Time to render first content';
    case 'TTFB': return 'Time to First Byte - Server response time';
    default: return 'Performance metric';
  }
};

export default WebVitalsMonitor;