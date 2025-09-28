// Integrated Infrastructure Monitoring Dashboard Component
// Connects cloud infrastructure metrics with existing analytics dashboard

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Database,
  HardDrive,
  Layers,
  MonitorSpeaker,
  Network,
  RefreshCw,
  Server,
  Shield,
  TrendingUp
} from 'lucide-react';

// Interfaces for Infrastructure Monitoring
interface CloudResource {
  id: string;
  name: string;
  type: 'eks' | 'aks' | 'vm' | 'container' | 'database' | 'storage' | 'network';
  provider: 'aws' | 'azure';
  region: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  metrics: ResourceMetrics;
  lastUpdated: Date;
}

interface ResourceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: {
    inbound: number;
    outbound: number;
  };
  availability: number;
  responseTime: number;
}

interface InfrastructureAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  resource: string;
  timestamp: Date;
  acknowledged: boolean;
}

interface BackupStatus {
  id: string;
  name: string;
  type: 'database' | 'kubernetes' | 'storage';
  lastBackup: Date;
  nextBackup: Date;
  status: 'success' | 'failed' | 'running';
  size: string;
  retention: string;
}

interface DeploymentMetrics {
  totalDeployments: number;
  successfulDeployments: number;
  failedDeployments: number;
  averageDeployTime: number;
  lastDeployment: Date;
  rollbacksLast24h: number;
}

// Custom hook for infrastructure monitoring
const useInfrastructureMonitoring = () => {
  const [resources, setResources] = useState<CloudResource[]>([]);
  const [alerts, setAlerts] = useState<InfrastructureAlert[]>([]);
  const [backups, setBackups] = useState<BackupStatus[]>([]);
  const [deploymentMetrics, setDeploymentMetrics] = useState<DeploymentMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchInfrastructureData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Simulate fetching data from monitoring APIs
      // In production, these would be real API calls to Prometheus, CloudWatch, etc.
      
      // Mock cloud resources
      const mockResources: CloudResource[] = [
        {
          id: 'eks-prod-cluster',
          name: 'azuria-prod-eks',
          type: 'eks',
          provider: 'aws',
          region: 'us-east-1',
          status: 'healthy',
          metrics: {
            cpu: 45,
            memory: 62,
            disk: 38,
            network: { inbound: 1200, outbound: 850 },
            availability: 99.98,
            responseTime: 120
          },
          lastUpdated: new Date()
        },
        {
          id: 'aks-prod-cluster',
          name: 'azuria-prod-aks',
          type: 'aks',
          provider: 'azure',
          region: 'eastus',
          status: 'warning',
          metrics: {
            cpu: 78,
            memory: 85,
            disk: 42,
            network: { inbound: 980, outbound: 720 },
            availability: 99.95,
            responseTime: 180
          },
          lastUpdated: new Date()
        },
        {
          id: 'rds-primary',
          name: 'azuria-prod-db',
          type: 'database',
          provider: 'aws',
          region: 'us-east-1',
          status: 'healthy',
          metrics: {
            cpu: 32,
            memory: 48,
            disk: 67,
            network: { inbound: 450, outbound: 380 },
            availability: 99.99,
            responseTime: 15
          },
          lastUpdated: new Date()
        },
        {
          id: 'cosmosdb-prod',
          name: 'azuria-prod-cosmos',
          type: 'database',
          provider: 'azure',
          region: 'eastus',
          status: 'healthy',
          metrics: {
            cpu: 25,
            memory: 35,
            disk: 23,
            network: { inbound: 320, outbound: 280 },
            availability: 99.99,
            responseTime: 8
          },
          lastUpdated: new Date()
        }
      ];

      // Mock alerts
      const mockAlerts: InfrastructureAlert[] = [
        {
          id: 'alert-1',
          severity: 'warning',
          title: 'High Memory Usage - AKS Cluster',
          description: 'Memory utilization on azuria-prod-aks is at 85%',
          resource: 'aks-prod-cluster',
          timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
          acknowledged: false
        },
        {
          id: 'alert-2',
          severity: 'info',
          title: 'Backup Completed Successfully',
          description: 'Daily backup for azuria-prod-db completed',
          resource: 'rds-primary',
          timestamp: new Date(Date.now() - 2 * 60 * 60000), // 2 hours ago
          acknowledged: true
        }
      ];

      // Mock backup status
      const mockBackups: BackupStatus[] = [
        {
          id: 'backup-db-daily',
          name: 'Database Daily Backup',
          type: 'database',
          lastBackup: new Date(Date.now() - 2 * 60 * 60000),
          nextBackup: new Date(Date.now() + 22 * 60 * 60000),
          status: 'success',
          size: '2.3 GB',
          retention: '30 days'
        },
        {
          id: 'backup-k8s-weekly',
          name: 'Kubernetes Weekly Backup',
          type: 'kubernetes',
          lastBackup: new Date(Date.now() - 24 * 60 * 60000),
          nextBackup: new Date(Date.now() + 6 * 24 * 60 * 60000),
          status: 'success',
          size: '1.8 GB',
          retention: '12 weeks'
        },
        {
          id: 'backup-storage-hourly',
          name: 'Storage Hourly Snapshot',
          type: 'storage',
          lastBackup: new Date(Date.now() - 30 * 60000),
          nextBackup: new Date(Date.now() + 30 * 60000),
          status: 'running',
          size: '890 MB',
          retention: '7 days'
        }
      ];

      // Mock deployment metrics
      const mockDeploymentMetrics: DeploymentMetrics = {
        totalDeployments: 247,
        successfulDeployments: 239,
        failedDeployments: 8,
        averageDeployTime: 8.5,
        lastDeployment: new Date(Date.now() - 45 * 60000),
        rollbacksLast24h: 1
      };

      setResources(mockResources);
      setAlerts(mockAlerts);
      setBackups(mockBackups);
      setDeploymentMetrics(mockDeploymentMetrics);
      setLastUpdate(new Date());
      
    } catch (error) {
      console.error('Error fetching infrastructure data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfrastructureData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchInfrastructureData, 30000);
    
    return () => clearInterval(interval);
  }, [fetchInfrastructureData]);

  const acknowledgeAlert = useCallback((alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  }, []);

  return {
    resources,
    alerts,
    backups,
    deploymentMetrics,
    isLoading,
    lastUpdate,
    refreshData: fetchInfrastructureData,
    acknowledgeAlert
  };
};

// Resource Status Card Component
interface ResourceCardProps {
  resource: CloudResource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const getStatusColor = (status: CloudResource['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'critical': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: CloudResource['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle2 className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getResourceIcon = (type: CloudResource['type']) => {
    switch (type) {
      case 'eks':
      case 'aks': return <Layers className="h-5 w-5" />;
      case 'database': return <Database className="h-5 w-5" />;
      case 'storage': return <HardDrive className="h-5 w-5" />;
      case 'network': return <Network className="h-5 w-5" />;
      default: return <Server className="h-5 w-5" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getResourceIcon(resource.type)}
              <CardTitle className="text-sm font-medium">{resource.name}</CardTitle>
            </div>
            <Badge className={`${getStatusColor(resource.status)} border-0`}>
              <div className="flex items-center gap-1">
                {getStatusIcon(resource.status)}
                <span className="capitalize">{resource.status}</span>
              </div>
            </Badge>
          </div>
          <CardDescription>
            {resource.provider.toUpperCase()} • {resource.region} • {resource.type.toUpperCase()}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">CPU</span>
                <span className="font-medium">{resource.metrics.cpu}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    resource.metrics.cpu > 80 ? 'bg-red-500' : 
                    resource.metrics.cpu > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${resource.metrics.cpu}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Memory</span>
                <span className="font-medium">{resource.metrics.memory}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    resource.metrics.memory > 80 ? 'bg-red-500' : 
                    resource.metrics.memory > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${resource.metrics.memory}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Disk</span>
                <span className="font-medium">{resource.metrics.disk}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    resource.metrics.disk > 80 ? 'bg-red-500' : 
                    resource.metrics.disk > 60 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${resource.metrics.disk}%` }}
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime</span>
                <span className="font-medium">{resource.metrics.availability}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full bg-green-500 transition-all duration-300"
                  style={{ width: `${resource.metrics.availability}%` }}
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
            <span>Resp: {resource.metrics.responseTime}ms</span>
            <span>Updated: {resource.lastUpdated.toLocaleTimeString()}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Infrastructure Dashboard Component
const InfrastructureMonitoringDashboard: React.FC = () => {
  const {
    resources,
    alerts,
    backups,
    deploymentMetrics,
    isLoading,
    lastUpdate,
    refreshData,
    acknowledgeAlert
  } = useInfrastructureMonitoring();

  const healthyResources = resources.filter(r => r.status === 'healthy').length;
  const warningResources = resources.filter(r => r.status === 'warning').length;
  const unacknowledgedAlerts = alerts.filter(a => !a.acknowledged).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Summary Cards */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Infrastructure Monitoring</h2>
          <p className="text-gray-600">Real-time monitoring of cloud resources and deployments</p>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Healthy Resources</p>
                <p className="text-2xl font-bold text-green-600">{healthyResources}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">{warningResources}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-red-600">{unacknowledgedAlerts}</p>
              </div>
              <MonitorSpeaker className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Deploy Success</p>
                <p className="text-2xl font-bold text-blue-600">
                  {deploymentMetrics ? Math.round((deploymentMetrics.successfulDeployments / deploymentMetrics.totalDeployments) * 100) : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="resources" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({unacknowledgedAlerts})</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
        </TabsList>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </AnimatePresence>
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-3">
            {alerts.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <p className="text-gray-600">No active alerts</p>
                </CardContent>
              </Card>
            ) : (
              alerts.map((alert) => (
                <Alert key={alert.id} className={
                  alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                  alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className={`h-4 w-4 ${
                          alert.severity === 'critical' ? 'text-red-600' :
                          alert.severity === 'warning' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <h4 className="font-semibold">{alert.title}</h4>
                        <Badge variant={alert.acknowledged ? 'secondary' : 'destructive'}>
                          {alert.acknowledged ? 'Acknowledged' : alert.severity.toUpperCase()}
                        </Badge>
                      </div>
                      <AlertDescription className="text-sm mb-2">
                        {alert.description}
                      </AlertDescription>
                      <p className="text-xs text-gray-500">
                        Resource: {alert.resource} • {alert.timestamp.toLocaleString()}
                      </p>
                    </div>
                    {!alert.acknowledged && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </Alert>
              ))
            )}
          </div>
        </TabsContent>

        {/* Backups Tab */}
        <TabsContent value="backups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {backups.map((backup) => (
              <Card key={backup.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{backup.name}</CardTitle>
                    <Badge className={
                      backup.status === 'success' ? 'bg-green-50 text-green-600 border-green-200' :
                      backup.status === 'failed' ? 'bg-red-50 text-red-600 border-red-200' :
                      'bg-blue-50 text-blue-600 border-blue-200'
                    }>
                      {backup.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="capitalize">{backup.type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Size:</span>
                    <span>{backup.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Last Backup:</span>
                    <span>{backup.lastBackup.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Next Backup:</span>
                    <span>{backup.nextBackup.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Retention:</span>
                    <span>{backup.retention}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Deployments Tab */}
        <TabsContent value="deployments" className="space-y-4">
          {deploymentMetrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Deployment Statistics</CardTitle>
                  <CardDescription>Overview of deployment performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Deployments</span>
                    <span className="text-2xl font-bold">{deploymentMetrics.totalDeployments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Success Rate</span>
                    <span className="text-2xl font-bold text-green-600">
                      {Math.round((deploymentMetrics.successfulDeployments / deploymentMetrics.totalDeployments) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Failed Deployments</span>
                    <span className="text-2xl font-bold text-red-600">{deploymentMetrics.failedDeployments}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg Deploy Time</span>
                    <span className="text-2xl font-bold">{deploymentMetrics.averageDeployTime}m</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest deployment information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Deployment</span>
                    <span className="font-medium">{deploymentMetrics.lastDeployment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rollbacks (24h)</span>
                    <span className="text-2xl font-bold text-orange-600">{deploymentMetrics.rollbacksLast24h}</span>
                  </div>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      All deployments use blue-green strategy with automated rollback on failure.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Last Updated Footer */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {lastUpdate.toLocaleTimeString()} • Auto-refresh every 30 seconds
      </div>
    </div>
  );
};

export default InfrastructureMonitoringDashboard;