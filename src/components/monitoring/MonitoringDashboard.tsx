/**
 * System Monitoring Dashboard Component
 * Real-time health monitoring and system status display
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle,
  CheckCircle, 
  Clock,
  Database,
  Globe,
  RefreshCw,
  Server,
  Shield,
  XCircle
} from 'lucide-react';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'critical';
  value: string;
  description: string;
  lastChecked: Date;
  trend?: 'up' | 'down' | 'stable';
}

interface SystemStatus {
  overall: 'healthy' | 'warning' | 'critical';
  score: number;
  uptime: string;
  lastUpdate: Date;
  metrics: HealthMetric[];
}

export function MonitoringDashboard() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchSystemStatus = async () => {
    setIsRefreshing(true);
    
    try {
      // Simulate API call - in real implementation, this would call your monitoring API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockStatus: SystemStatus = {
        overall: 'healthy',
        score: 94,
        uptime: '99.8%',
        lastUpdate: new Date(),
        metrics: [
          {
            name: 'Application Health',
            status: 'healthy',
            value: '✓ All systems operational',
            description: 'Core application services running normally',
            lastChecked: new Date(),
            trend: 'stable'
          },
          {
            name: 'Database',
            status: 'healthy',
            value: '< 50ms',
            description: 'Average query response time',
            lastChecked: new Date(),
            trend: 'stable'
          },
          {
            name: 'API Response Time',
            status: 'warning',
            value: '245ms',
            description: 'Average API response time',
            lastChecked: new Date(),
            trend: 'up'
          },
          {
            name: 'Error Rate',
            status: 'healthy',
            value: '0.02%',
            description: 'Error rate in the last 24 hours',
            lastChecked: new Date(),
            trend: 'down'
          },
          {
            name: 'Memory Usage',
            status: 'healthy',
            value: '67%',
            description: 'Server memory utilization',
            lastChecked: new Date(),
            trend: 'stable'
          },
          {
            name: 'Security',
            status: 'healthy',
            value: 'No threats',
            description: 'Security monitoring status',
            lastChecked: new Date(),
            trend: 'stable'
          }
        ]
      };

      setSystemStatus(mockStatus);
    } catch {
      // Handle error silently in production
      // In development, you might want to use a proper logging service
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSystemStatus, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };



  const getMetricIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'database':
        return <Database className="w-5 h-5" />;
      case 'api response time':
        return <Globe className="w-5 h-5" />;
      case 'memory usage':
        return <Server className="w-5 h-5" />;
      case 'security':
        return <Shield className="w-5 h-5" />;
      default:
        return <Activity className="w-5 h-5" />;
    }
  };

  if (!systemStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Loading system status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time application health and performance metrics
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Disable' : 'Enable'} Auto-refresh
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSystemStatus}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon(systemStatus.overall)}
            <span>Overall System Health</span>
            <Badge variant={systemStatus.overall === 'healthy' ? 'default' : 'destructive'}>
              {systemStatus.overall.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {systemStatus.score}%
              </div>
              <div className="text-sm text-muted-foreground">Health Score</div>
              <Progress value={systemStatus.score} className="mt-2" />
            </div>
            
            <div>
              <div className="text-2xl font-bold">
                {systemStatus.uptime}
              </div>
              <div className="text-sm text-muted-foreground">Uptime (30 days)</div>
            </div>
            
            <div>
              <div className="text-sm text-muted-foreground">Last Updated</div>
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{systemStatus.lastUpdate.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics */}
      <Tabs defaultValue="metrics" className="w-full">
        <TabsList>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemStatus.metrics.map((metric) => (
              <Card key={metric.name}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      {getMetricIcon(metric.name)}
                      <span>{metric.name}</span>
                    </div>
                    {getStatusIcon(metric.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">
                      {metric.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {metric.description}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Last checked: {metric.lastChecked.toLocaleTimeString()}</span>
                      {metric.trend && (
                        <Badge variant="outline" className="text-xs">
                          {metric.trend === 'up' && '↗'}
                          {metric.trend === 'down' && '↘'}
                          {metric.trend === 'stable' && '→'}
                          {' '}{metric.trend}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Active Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Performance Warning</AlertTitle>
                  <AlertDescription>
                    API response time is above normal threshold (245ms avg). 
                    Consider optimizing database queries.
                  </AlertDescription>
                </Alert>
                
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>No critical alerts at this time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                <Activity className="w-12 h-12 mx-auto mb-2" />
                <p>Historical performance charts would be displayed here</p>
                <p className="text-sm">Integration with monitoring service required</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}