import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  HardDrive,
  RefreshCw,
  Shield,
  TrendingUp,
  Zap
} from 'lucide-react';
import { 
  useCleanupExpiredRoles, 
  useCleanupOldAnalytics, 
  useMaintenanceCleanupMutation, 
  useOptimizeTables,
  usePerformanceAlerts,
  useResolveAlert,
  useRLSPerformanceMetrics,
  useSecurityMetrics
} from '@/hooks/useSecurityMonitoring';
import { useIsAdminOrOwner } from '@/hooks/useUserRoles';
import RoleManager from './RoleManager';
import TableStatsMonitor from './TableStatsMonitor';
import { toast } from '@/components/ui/use-toast';

const SecurityDashboard: React.FC = () => {
  const { data: metrics, isLoading: metricsLoading } = useSecurityMetrics('day');
  const { data: alerts, isLoading: alertsLoading } = usePerformanceAlerts();
  const { data: rlsMetrics } = useRLSPerformanceMetrics();
  const { data: isAdmin } = useIsAdminOrOwner();
  const resolveAlert = useResolveAlert();
  const cleanupRoles = useCleanupExpiredRoles();
  const optimizeTables = useOptimizeTables();
  const cleanupAnalytics = useCleanupOldAnalytics();
  const maintenanceCleanup = useMaintenanceCleanupMutation();

  const handleResolveAlert = async (alertId: string) => {
    try {
      await resolveAlert.mutateAsync(alertId);
      toast.success('Alerta resolvido com sucesso');
    } catch (_error) {
      toast.error('Erro ao resolver alerta');
    }
  };

  const handleCleanupRoles = async () => {
    try {
      await cleanupRoles.mutateAsync();
      toast.success('Limpeza de roles expirados executada com sucesso');
    } catch (_error) {
      toast.error('Erro na limpeza de roles expirados');
    }
  };

  const handleOptimizeTables = async () => {
    try {
      await optimizeTables.mutateAsync();
      toast.success('Otimização de tabelas executada com sucesso');
    } catch (_error) {
      toast.error('Erro na otimização de tabelas');
    }
  };

  const handleCleanupAnalytics = async () => {
    try {
      await cleanupAnalytics.mutateAsync();
      toast.success('Limpeza de analytics executada com sucesso');
    } catch (_error) {
      toast.error('Erro na limpeza de analytics');
    }
  };

  const handleMaintenanceCleanup = async () => {
    try {
      await maintenanceCleanup.mutateAsync();
      toast.success('Limpeza completa de manutenção executada com sucesso');
    } catch (_error) {
      toast.error('Erro na limpeza de manutenção');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const criticalAlerts = alerts?.filter(alert => alert.severity === 'critical') || [];
  const avgQueryTime = (metrics?.filter(m => m.metric_type === 'query_time') || [])
    .reduce((sum, m) => sum + m.metric_value, 0) / 
    ((metrics?.filter(m => m.metric_type === 'query_time') || []).length || 1);

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Acesso restrito a administradores</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alertas Críticos */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalAlerts.length} alerta(s) crítico(s)</strong> requerem atenção imediata
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Tempo Médio Query</p>
                <p className="text-xl font-semibold">{avgQueryTime.toFixed(2)}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-gray-500">Alertas Ativos</p>
                <p className="text-xl font-semibold">{alerts?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Métricas RLS</p>
                <p className="text-xl font-semibold">
                  {metrics?.filter(m => m.metric_type === 'rls_performance').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-gray-500">Eventos Segurança</p>
                <p className="text-xl font-semibold">
                  {metrics?.filter(m => m.metric_type === 'suspicious_activity').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="w-full">
        <TabsList>
          <TabsTrigger value="alerts">Alertas</TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="tables">Tabelas</TabsTrigger>
          <TabsTrigger value="roles">Gerenciar Roles</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          <TabsTrigger value="performance">Performance RLS</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Alertas de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertsLoading ? (
                  <div className="animate-pulse">Carregando alertas...</div>
                ) : alerts?.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum alerta ativo</p>
                  </div>
                ) : (
                  alerts?.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <span className="font-medium">{alert.title}</span>
                        </div>
                        <p className="text-sm text-gray-600">{alert.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveAlert(alert.id)}
                      >
                        Resolver
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>Métricas de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metricsLoading ? (
                  <div className="animate-pulse">Carregando métricas...</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {metrics?.slice(0, 10).map((metric) => (
                      <div key={metric.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium capitalize">
                            {metric.metric_type.replace('_', ' ')}
                          </span>
                          <Badge variant="outline">
                            {metric.metric_value.toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">
                          {new Date(metric.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tables">
          <TableStatsMonitor />
        </TabsContent>

        <TabsContent value="roles">
          <RoleManager />
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader>
              <CardTitle>Manutenção do Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Limpeza Completa de Manutenção</h4>
                  <p className="text-sm text-gray-600">
                    Executa limpeza completa: dados expirados, sessões, notificações antigas e otimiza estatísticas
                  </p>
                </div>
                <Button 
                  onClick={handleMaintenanceCleanup}
                  disabled={maintenanceCleanup.isPending}
                >
                  <HardDrive className="h-4 w-4 mr-2" />
                  {maintenanceCleanup.isPending ? 'Executando...' : 'Limpeza Completa'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Limpeza de Roles Expirados</h4>
                  <p className="text-sm text-gray-600">
                    Remove roles que expiraram para otimizar performance
                  </p>
                </div>
                <Button onClick={handleCleanupRoles}>
                  <Clock className="h-4 w-4 mr-2" />
                  Executar Limpeza
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Otimizar Tabelas</h4>
                  <p className="text-sm text-gray-600">
                    Executa ANALYZE nas tabelas principais para otimizar queries
                  </p>
                </div>
                <Button onClick={handleOptimizeTables}>
                  <Zap className="h-4 w-4 mr-2" />
                  Otimizar
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Limpeza de Analytics</h4>
                  <p className="text-sm text-gray-600">
                    Remove dados antigos de analytics e logs para liberar espaço
                  </p>
                </div>
                <Button onClick={handleCleanupAnalytics}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance RLS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
        {Array.isArray(rlsMetrics) && rlsMetrics.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
          {rlsMetrics.map((metric: { policy_name?: string; avg_execution_time?: number; table_name?: string; total_calls?: number; avg_policy_execution_time?: number; total_policies?: number }, index: number) => {
                      // Support both per-policy and summary shapes
                      const policy = metric.policy_name ?? 'Resumo';
                      const avg = metric.avg_execution_time ?? metric.avg_policy_execution_time ?? 0;
                      const table = metric.table_name ?? '—';
                      const calls = metric.total_calls ?? metric.total_policies ?? 0;
                      return (
                        <div key={index} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{policy}</span>
                            <Badge variant="outline">{avg}ms</Badge>
                          </div>
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>{table}</span>
                            <span>{calls} {metric.total_calls ? 'calls' : 'policies'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-500">Métricas RLS serão coletadas automaticamente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;
