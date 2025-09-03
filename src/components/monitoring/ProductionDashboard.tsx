/**
 * Production Dashboard
 * Centraliza todos os pontos críticos para produção
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Download,
  Eye,
  Flag,
  Shield,
  TrendingUp,
  Upload,
  Zap
} from 'lucide-react';
import { useHealthCheck } from '@/services/healthCheck';
import { useErrorTracking } from '@/services/errorTracking';
import { useBackup } from '@/services/backupService';
import { useFeatureFlags } from '@/services/featureFlags';

const ProductionDashboard: React.FC = () => {
  const { status: healthStatus, isLoading: healthLoading, runCheck } = useHealthCheck();
  const { getErrorStats, getRecentErrors } = useErrorTracking();
  const { stats: backupStats, createBackup, isCreating } = useBackup();
  const featureFlags = useFeatureFlags([
    'ai_gemini_integration',
    'advanced_analytics',
    'collaboration_features',
    'automation_workflows',
    'security_dashboard'
  ]);

  const errorStats = getErrorStats();
  const recentErrors = getRecentErrors(5);

  const getHealthColor = (status?: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'degraded': return 'text-yellow-500';
      case 'unhealthy': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getHealthIcon = (status?: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'degraded': return AlertTriangle;
      case 'unhealthy': return AlertTriangle;
      default: return Clock;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Produção</h1>
          <p className="text-muted-foreground">
            Monitoramento crítico e status da aplicação
          </p>
        </div>
        <Badge 
          variant={healthStatus?.status === 'healthy' ? 'default' : 'destructive'}
          className="text-sm px-3 py-1"
        >
          {healthStatus?.status?.toUpperCase() || 'CHECKING'}
        </Badge>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full bg-opacity-10 ${getHealthColor(healthStatus?.status)}`}>
                {React.createElement(getHealthIcon(healthStatus?.status), { 
                  className: `h-5 w-5 ${getHealthColor(healthStatus?.status)}` 
                })}
              </div>
              <div>
                <p className="text-sm font-medium">Status Geral</p>
                <p className="text-2xl font-bold">
                  {healthStatus?.overallScore || 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/20">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Erros Críticos</p>
                <p className="text-2xl font-bold">
                  {errorStats.criticalErrors}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/20">
                <Database className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Backups</p>
                <p className="text-2xl font-bold">
                  {backupStats.totalBackups}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900/20">
                <Flag className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Features Ativas</p>
                <p className="text-2xl font-bold">
                  {Object.values(featureFlags).filter(Boolean).length}/{Object.keys(featureFlags).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Health Checks</TabsTrigger>
          <TabsTrigger value="errors">Monitoramento</TabsTrigger>
          <TabsTrigger value="backups">Backup</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Status dos Serviços</CardTitle>
                <CardDescription>
                  Monitoramento em tempo real dos componentes críticos
                </CardDescription>
              </div>
              <Button 
                onClick={runCheck} 
                disabled={healthLoading}
                size="sm"
              >
                <Activity className="h-4 w-4 mr-2" />
                {healthLoading ? 'Verificando...' : 'Verificar'}
              </Button>
            </CardHeader>
            <CardContent>
              {healthStatus ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Score Geral</span>
                    <div className="flex items-center space-x-2">
                      <Progress value={healthStatus.overallScore} className="w-32" />
                      <span className="text-sm font-medium">{healthStatus.overallScore}%</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {healthStatus.checks.map((check, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="flex items-center space-x-3">
                          {check.status === 'pass' && <CheckCircle className="h-5 w-5 text-green-500" />}
                          {check.status === 'warn' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                          {check.status === 'fail' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                          <div>
                            <p className="font-medium capitalize">{check.name}</p>
                            <p className="text-sm text-muted-foreground">{check.message}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={check.status === 'pass' ? 'default' : 'destructive'}
                            className="mb-1"
                          >
                            {check.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground">
                            {check.responseTime}ms
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Clique em "Verificar" para executar os health checks
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas de Erros</CardTitle>
                <CardDescription>Resumo dos erros nas últimas 24h</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Total de Erros</span>
                    <span className="font-medium">{errorStats.totalErrors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Críticos</span>
                    <span className="font-medium text-red-500">{errorStats.criticalErrors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Alto Impacto</span>
                    <span className="font-medium text-orange-500">{errorStats.highErrors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Médio Impacto</span>
                    <span className="font-medium text-yellow-500">{errorStats.mediumErrors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Baixo Impacto</span>
                    <span className="font-medium text-green-500">{errorStats.lowErrors}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Erros Recentes</CardTitle>
                <CardDescription>Últimos 5 erros registrados</CardDescription>
              </CardHeader>
              <CardContent>
                {recentErrors.length > 0 ? (
                  <div className="space-y-3">
                    {recentErrors.map((error, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <Badge 
                            variant={error.severity === 'critical' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {error.severity}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {error.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm font-medium truncate">{error.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    Nenhum erro recente registrado
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Sistema de Backup</CardTitle>
                <CardDescription>
                  Backup automático de dados críticos
                </CardDescription>
              </div>
              <Button 
                onClick={createBackup} 
                disabled={isCreating}
                size="sm"
              >
                <Download className="h-4 w-4 mr-2" />
                {isCreating ? 'Criando...' : 'Backup Manual'}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{backupStats.totalBackups}</p>
                  <p className="text-sm text-muted-foreground">Total de Backups</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{backupStats.totalSizeMB}MB</p>
                  <p className="text-sm text-muted-foreground">Tamanho Total</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <p className="text-2xl font-bold">{backupStats.automaticBackups}</p>
                  <p className="text-sm text-muted-foreground">Automáticos</p>
                </div>
              </div>

              {backupStats.failedBackups > 0 && (
                <Alert className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Atenção</AlertTitle>
                  <AlertDescription>
                    {backupStats.failedBackups} backup(s) falharam. Verifique os logs.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Controle de funcionalidades em produção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(featureFlags).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
                      <p className="text-sm text-muted-foreground">{key}</p>
                    </div>
                    <Badge variant={enabled ? 'default' : 'secondary'}>
                      {enabled ? 'Ativada' : 'Desativada'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionDashboard;