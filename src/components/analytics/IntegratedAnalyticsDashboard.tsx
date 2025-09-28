import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { 
  Activity, 
  AlertTriangle,
  BarChart3,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Zap
} from 'lucide-react';

// Integração com Web Vitals existente
interface WebVitalMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  id: string;
  timestamp: number;
}

// Enhanced Analytics Interfaces
interface BusinessKPI {
  id: string;
  name: string;
  value: number;
  previousValue?: number;
  target?: number;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  trendPercent: number;
  category: 'revenue' | 'users' | 'engagement' | 'conversion';
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  services: Array<{
    name: string;
    status: 'up' | 'down' | 'degraded';
    uptime: number;
    responseTime: number;
  }>;
  infrastructure: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  security: {
    threats: number;
    lastScan: Date;
    vulnerabilities: number;
  };
}

interface AnalyticsInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations?: string[];
  metrics: string[];
  confidence: number;
}

// Enhanced Hook for Integrated Dashboard
const useIntegratedAnalytics = () => {
  const [businessKPIs, setBusinessKPIs] = useState<BusinessKPI[]>([]);
  const [webVitals, setWebVitals] = useState<WebVitalMetric[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  // Generate enhanced mock data
  const generateBusinessKPIs = useCallback((): BusinessKPI[] => {
    const now = Date.now();
    return [
      {
        id: 'monthly-revenue',
        name: 'Monthly Revenue',
        value: Math.floor(Math.random() * 50000) + 100000,
        previousValue: Math.floor(Math.random() * 45000) + 95000,
        target: 150000,
        unit: 'BRL',
        trend: 'up',
        trendPercent: 12.5,
        category: 'revenue',
        priority: 'high',
        timestamp: now
      },
      {
        id: 'active-subscribers',
        name: 'Active Subscribers',
        value: Math.floor(Math.random() * 5000) + 15000,
        previousValue: Math.floor(Math.random() * 4500) + 14200,
        target: 20000,
        unit: 'users',
        trend: 'up',
        trendPercent: 8.3,
        category: 'users',
        priority: 'high',
        timestamp: now
      },
      {
        id: 'conversion-rate',
        name: 'Conversion Rate',
        value: Math.random() * 5 + 7,
        previousValue: Math.random() * 4 + 6.5,
        target: 12,
        unit: '%',
        trend: 'up',
        trendPercent: 15.7,
        category: 'conversion',
        priority: 'high',
        timestamp: now
      },
      {
        id: 'churn-rate',
        name: 'Monthly Churn Rate',
        value: Math.random() * 3 + 2,
        previousValue: Math.random() * 4 + 3,
        target: 2,
        unit: '%',
        trend: 'down',
        trendPercent: -18.2,
        category: 'users',
        priority: 'medium',
        timestamp: now
      },
      {
        id: 'avg-session',
        name: 'Avg Session Duration',
        value: Math.random() * 300 + 420,
        previousValue: Math.random() * 280 + 380,
        target: 600,
        unit: 'sec',
        trend: 'up',
        trendPercent: 11.2,
        category: 'engagement',
        priority: 'medium',
        timestamp: now
      },
      {
        id: 'customer-satisfaction',
        name: 'Customer Satisfaction',
        value: Math.random() * 1 + 4.2,
        previousValue: Math.random() * 0.8 + 4.0,
        target: 4.5,
        unit: '/5',
        trend: 'up',
        trendPercent: 5.8,
        category: 'engagement',
        priority: 'high',
        timestamp: now
      }
    ];
  }, []);

  const generateWebVitals = useCallback((): WebVitalMetric[] => {
    const now = Date.now();
    return [
      {
        id: 'lcp',
        name: 'Largest Contentful Paint',
        value: Math.random() * 1000 + 1500,
        rating: Math.random() > 0.7 ? 'good' : Math.random() > 0.4 ? 'needs-improvement' : 'poor',
        delta: Math.random() * 200 - 100,
        timestamp: now
      },
      {
        id: 'fid',
        name: 'First Input Delay',
        value: Math.random() * 50 + 20,
        rating: Math.random() > 0.8 ? 'good' : Math.random() > 0.5 ? 'needs-improvement' : 'poor',
        delta: Math.random() * 20 - 10,
        timestamp: now
      },
      {
        id: 'cls',
        name: 'Cumulative Layout Shift',
        value: Math.random() * 0.2 + 0.05,
        rating: Math.random() > 0.7 ? 'good' : Math.random() > 0.4 ? 'needs-improvement' : 'poor',
        delta: Math.random() * 0.1 - 0.05,
        timestamp: now
      },
      {
        id: 'ttfb',
        name: 'Time to First Byte',
        value: Math.random() * 400 + 200,
        rating: Math.random() > 0.6 ? 'good' : Math.random() > 0.3 ? 'needs-improvement' : 'poor',
        delta: Math.random() * 100 - 50,
        timestamp: now
      }
    ];
  }, []);

  const generateSystemHealth = useCallback((): SystemHealth => {
    return {
      overall: Math.random() > 0.8 ? 'healthy' : Math.random() > 0.6 ? 'warning' : 'critical',
      services: [
        {
          name: 'Web Application',
          status: Math.random() > 0.9 ? 'up' : Math.random() > 0.7 ? 'degraded' : 'down',
          uptime: 99.5 + Math.random() * 0.5,
          responseTime: Math.random() * 200 + 150
        },
        {
          name: 'API Gateway',
          status: Math.random() > 0.95 ? 'up' : 'degraded',
          uptime: 99.8 + Math.random() * 0.2,
          responseTime: Math.random() * 100 + 80
        },
        {
          name: 'Database',
          status: Math.random() > 0.92 ? 'up' : 'degraded',
          uptime: 99.9 + Math.random() * 0.1,
          responseTime: Math.random() * 50 + 30
        },
        {
          name: 'Payment System',
          status: Math.random() > 0.88 ? 'up' : 'degraded',
          uptime: 99.7 + Math.random() * 0.3,
          responseTime: Math.random() * 300 + 200
        }
      ],
      infrastructure: {
        cpu: Math.random() * 40 + 30,
        memory: Math.random() * 50 + 40,
        disk: Math.random() * 30 + 20,
        network: Math.random() * 60 + 20
      },
      security: {
        threats: Math.floor(Math.random() * 5),
        lastScan: new Date(Date.now() - Math.random() * 3600000),
        vulnerabilities: Math.floor(Math.random() * 3)
      }
    };
  }, []);

  const generateInsights = useCallback((kpis: BusinessKPI[], vitals: WebVitalMetric[]): AnalyticsInsight[] => {
    const insights: AnalyticsInsight[] = [];
    
    // Business insights
    const revenueKPI = kpis.find(k => k.id === 'monthly-revenue');
    if (revenueKPI && revenueKPI.trendPercent > 10) {
      insights.push({
        id: 'revenue-growth',
        type: 'success',
        title: 'Strong Revenue Growth',
        description: `Revenue increased by ${revenueKPI.trendPercent.toFixed(1)}% this period`,
        impact: 'high',
        actionable: true,
        recommendations: [
          'Consider scaling marketing efforts',
          'Analyze successful conversion channels',
          'Prepare infrastructure for increased load'
        ],
        metrics: ['monthly-revenue', 'conversion-rate'],
        confidence: 85
      });
    }

    // Performance insights
    const lcpVital = vitals.find(v => v.id === 'lcp');
    if (lcpVital && lcpVital.rating === 'poor') {
      insights.push({
        id: 'lcp-performance',
        type: 'warning',
        title: 'LCP Performance Issue',
        description: 'Largest Contentful Paint is slower than recommended',
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Optimize images and media files',
          'Implement lazy loading',
          'Review server response times'
        ],
        metrics: ['lcp'],
        confidence: 92
      });
    }

    // Churn insight
    const churnKPI = kpis.find(k => k.id === 'churn-rate');
    if (churnKPI && churnKPI.trend === 'down' && churnKPI.trendPercent < -10) {
      insights.push({
        id: 'churn-improvement',
        type: 'success',
        title: 'Churn Rate Improving',
        description: `Churn decreased by ${Math.abs(churnKPI.trendPercent).toFixed(1)}%`,
        impact: 'high',
        actionable: false,
        recommendations: [
          'Continue current retention strategies',
          'Document successful practices',
          'Share learnings with team'
        ],
        metrics: ['churn-rate', 'customer-satisfaction'],
        confidence: 78
      });
    }

    return insights;
  }, []);

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const kpis = generateBusinessKPIs();
      const vitals = generateWebVitals();
      const health = generateSystemHealth();
      const analyticsInsights = generateInsights(kpis, vitals);
      
      setBusinessKPIs(kpis);
      setWebVitals(vitals);
      setSystemHealth(health);
      setInsights(analyticsInsights);
      setLastUpdate(new Date());
    } catch (_error) {
      // Error loading analytics data - handled silently in demo mode
    } finally {
      setIsLoading(false);
    }
  }, [generateBusinessKPIs, generateWebVitals, generateSystemHealth, generateInsights]);

  // Auto refresh
  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!autoRefresh) {
      return;
    }

    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  return {
    businessKPIs,
    webVitals,
    systemHealth,
    insights,
    isLoading,
    lastUpdate,
    autoRefresh,
    timeRange,
    setAutoRefresh,
    setTimeRange,
    refreshData: loadData
  };
};

// Enhanced Metric Card Component
const EnhancedMetricCard: React.FC<{ 
  kpi: BusinessKPI; 
  className?: string;
  showTarget?: boolean;
}> = ({ kpi, className = "", showTarget = false }) => {
  const getTrendColor = (trend: string, priority: string) => {
    if (priority === 'high') {
      switch (trend) {
        case 'up': return 'text-green-600';
        case 'down': return kpi.category === 'users' && kpi.id === 'churn-rate' ? 'text-green-600' : 'text-red-600';
        default: return 'text-gray-600';
      }
    }
    return trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4" />;
      case 'down': return <TrendingDown className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatValue = (value: number, unit?: string) => {
    if (unit === 'BRL') {
      return new Intl.NumberFormat('pt-BR', { 
        style: 'currency', 
        currency: 'BRL',
        minimumFractionDigits: 0
      }).format(value);
    }
    
    if (unit === 'sec') {
      const minutes = Math.floor(value / 60);
      const seconds = Math.floor(value % 60);
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M${unit ? ' ' + unit : ''}`;
    }
    
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K${unit ? ' ' + unit : ''}`;
    }
    
    return `${value.toFixed(unit === '%' || unit === '/5' ? 1 : 0)}${unit ? (unit === '/5' ? unit : ' ' + unit) : ''}`;
  };

  const getTargetProgress = () => {
    if (!kpi.target) {
      return 0;
    }
    return Math.min((kpi.value / kpi.target) * 100, 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`${className} ${kpi.priority === 'high' ? 'border-l-4 border-l-blue-500' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <p className="text-sm font-medium text-muted-foreground">{kpi.name}</p>
                <Badge variant={kpi.priority === 'high' ? 'default' : 'secondary'} className="text-xs">
                  {kpi.priority}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{formatValue(kpi.value, kpi.unit)}</p>
            </div>
            <div className={`flex items-center space-x-1 ${getTrendColor(kpi.trend, kpi.priority)}`}>
              {getTrendIcon(kpi.trend)}
              <span className="text-sm font-medium">
                {kpi.trend === 'up' ? '+' : kpi.trend === 'down' ? '-' : ''}
                {Math.abs(kpi.trendPercent).toFixed(1)}%
              </span>
            </div>
          </div>
          
          {showTarget && kpi.target && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span>Target: {formatValue(kpi.target, kpi.unit)}</span>
                <span>{getTargetProgress().toFixed(0)}%</span>
              </div>
              <Progress value={getTargetProgress()} className="h-2" />
            </div>
          )}
          
          {kpi.previousValue && (
            <div className="mt-2 text-xs text-muted-foreground">
              Previous: {formatValue(kpi.previousValue, kpi.unit)}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Web Vitals Card Component
const WebVitalCard: React.FC<{ vital: WebVitalMetric }> = ({ vital }) => {
  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good': return 'text-green-600 bg-green-50';
      case 'needs-improvement': return 'text-yellow-600 bg-yellow-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good': return <CheckCircle className="h-4 w-4" />;
      case 'needs-improvement': return <AlertTriangle className="h-4 w-4" />;
      case 'poor': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatValue = (name: string, value: number) => {
    if (name.includes('Paint') || name.includes('Byte')) {
      return `${Math.round(value)}ms`;
    }
    if (name.includes('Delay')) {
      return `${Math.round(value)}ms`;
    }
    if (name.includes('Shift')) {
      return value.toFixed(3);
    }
    return Math.round(value).toString();
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Zap className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">{vital.name}</span>
          </div>
          <Badge className={getRatingColor(vital.rating)}>
            <div className="flex items-center space-x-1">
              {getRatingIcon(vital.rating)}
              <span className="capitalize">{vital.rating.replace('-', ' ')}</span>
            </div>
          </Badge>
        </div>
        
        <div className="text-xl font-bold mb-1">
          {formatValue(vital.name, vital.value)}
        </div>
        
        {vital.delta && (
          <div className={`text-xs flex items-center space-x-1 ${vital.delta > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {vital.delta > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{Math.abs(vital.delta).toFixed(1)}ms from last</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// System Health Component
const SystemHealthPanel: React.FC<{ systemHealth: SystemHealth }> = ({ systemHealth }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'up': case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'down': case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'up': case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'down': case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>System Health</span>
            <Badge className={getStatusColor(systemHealth.overall)}>
              {getStatusIcon(systemHealth.overall)}
              <span className="ml-1 capitalize">{systemHealth.overall}</span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Services */}
          <div>
            <h4 className="font-medium mb-2">Services Status</h4>
            <div className="space-y-2">
              {systemHealth.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(service.status)}>
                      {getStatusIcon(service.status)}
                    </Badge>
                    <span className="text-sm font-medium">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">
                      {service.uptime.toFixed(2)}% uptime
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {service.responseTime.toFixed(0)}ms response
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure */}
          <div>
            <h4 className="font-medium mb-2">Infrastructure Usage</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>CPU</span>
                  <span>{systemHealth.infrastructure.cpu.toFixed(1)}%</span>
                </div>
                <Progress value={systemHealth.infrastructure.cpu} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Memory</span>
                  <span>{systemHealth.infrastructure.memory.toFixed(1)}%</span>
                </div>
                <Progress value={systemHealth.infrastructure.memory} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Disk</span>
                  <span>{systemHealth.infrastructure.disk.toFixed(1)}%</span>
                </div>
                <Progress value={systemHealth.infrastructure.disk} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Network</span>
                  <span>{systemHealth.infrastructure.network.toFixed(1)}%</span>
                </div>
                <Progress value={systemHealth.infrastructure.network} className="h-2" />
              </div>
            </div>
          </div>

          {/* Security */}
          <div>
            <h4 className="font-medium mb-2">Security Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Active Threats</span>
                <Badge variant={systemHealth.security.threats === 0 ? 'default' : 'destructive'}>
                  {systemHealth.security.threats}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Vulnerabilities</span>
                <Badge variant={systemHealth.security.vulnerabilities === 0 ? 'default' : 'secondary'}>
                  {systemHealth.security.vulnerabilities}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Last Scan</span>
                <span className="text-xs text-muted-foreground">
                  {systemHealth.security.lastScan.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Enhanced Insights Panel
const InsightsPanel: React.FC<{ insights: AnalyticsInsight[] }> = ({ insights }) => {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'opportunity': return <Target className="h-5 w-5 text-blue-600" />;
      case 'info': return <Activity className="h-5 w-5 text-gray-600" />;
      default: return <Activity className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-4">
      {insights.map((insight) => (
        <motion.div
          key={insight.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                {getInsightIcon(insight.type)}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{insight.title}</h4>
                    <div className="flex items-center space-x-2">
                      <Badge variant={insight.impact === 'high' ? 'default' : 'secondary'}>
                        {insight.impact} impact
                      </Badge>
                      <Badge variant="outline">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">{insight.description}</p>
                  
                  {insight.actionable && insight.recommendations && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium">Recommendations:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {insight.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start space-x-1">
                            <span>•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// Main Integrated Dashboard Component
export const IntegratedAnalyticsDashboard: React.FC = () => {
  const {
    businessKPIs,
    webVitals,
    systemHealth,
    insights,
    isLoading,
    lastUpdate,
    autoRefresh,
    timeRange,
    setAutoRefresh,
    setTimeRange,
    refreshData
  } = useIntegratedAnalytics();

  // Categorize KPIs
  const categorizedKPIs = useMemo(() => {
    return businessKPIs.reduce((acc, kpi) => {
      if (!acc[kpi.category]) {
        acc[kpi.category] = [];
      }
      acc[kpi.category].push(kpi);
      return acc;
    }, {} as Record<string, BusinessKPI[]>);
  }, [businessKPIs]);

  const highPriorityKPIs = businessKPIs.filter(kpi => kpi.priority === 'high');

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integrated Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Business metrics, performance monitoring, and system health
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timeRange} onValueChange={(value: '1h' | '24h' | '7d' | '30d') => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {lastUpdate ? `Updated ${lastUpdate.toLocaleTimeString()}` : 'Never'}
            </span>
          </div>
          
          <Badge variant={autoRefresh ? 'default' : 'secondary'}>
            {autoRefresh ? 'Auto ON' : 'Auto OFF'}
          </Badge>
          
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant="outline"
            size="sm"
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Disable' : 'Enable'}
          </Button>
          
          <Button
            onClick={refreshData}
            disabled={isLoading}
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* High Priority KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {highPriorityKPIs.map((kpi) => (
          <EnhancedMetricCard key={kpi.id} kpi={kpi} showTarget={true} />
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Web Vitals Performance</CardTitle>
                  <CardDescription>
                    Core Web Vitals and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {webVitals.map((vital) => (
                      <WebVitalCard key={vital.id} vital={vital} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              {systemHealth && <SystemHealthPanel systemHealth={systemHealth} />}
            </div>
          </div>
        </TabsContent>

        {/* Business Tab */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categorizedKPIs).map(([category, kpis]) => (
              <div key={category} className="space-y-4">
                <h3 className="text-lg font-semibold capitalize">{category} Metrics</h3>
                {kpis.map((kpi) => (
                  <EnhancedMetricCard key={kpi.id} kpi={kpi} showTarget={true} />
                ))}
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {webVitals.map((vital) => (
              <WebVitalCard key={vital.id} vital={vital} />
            ))}
          </div>
        </TabsContent>

        {/* System Health Tab */}
        <TabsContent value="system" className="space-y-6">
          {systemHealth && <SystemHealthPanel systemHealth={systemHealth} />}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">AI-Powered Insights</h3>
              <InsightsPanel insights={insights} />
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Insight Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Insights</span>
                      <Badge>{insights.length}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>High Impact</span>
                      <Badge variant="destructive">
                        {insights.filter(i => i.impact === 'high').length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Actionable</span>
                      <Badge variant="default">
                        {insights.filter(i => i.actionable).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Confidence</span>
                      <Badge variant="secondary">
                        {insights.length > 0 
                          ? Math.round(insights.reduce((acc, i) => acc + i.confidence, 0) / insights.length)
                          : 0}%
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export & Reports</CardTitle>
              <CardDescription>
                Generate comprehensive reports and export data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex-col">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Business Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Zap className="h-6 w-6 mb-2" />
                  Performance Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Shield className="h-6 w-6 mb-2" />
                  System Health Report
                </Button>
                <Button variant="outline" className="h-20 flex-col">
                  <Download className="h-6 w-6 mb-2" />
                  Export All Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegratedAnalyticsDashboard;