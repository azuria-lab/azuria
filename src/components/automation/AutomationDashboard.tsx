
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdvancedAutomation } from '@/hooks/useAdvancedAutomation';
import { AutomationRulesManager } from './AutomationRulesManager';
import { AutomationAlertsCenter } from './AutomationAlertsCenter';
import { AutomationWorkflowBuilder } from './AutomationWorkflowBuilder';
import { AutomationAnalytics } from './AutomationAnalytics';
import { 
  Activity, 
  AlertTriangle, 
  Bot, 
  CheckCircle, 
  Clock,
  Plus,
  Workflow,
  XCircle,
  Zap
} from 'lucide-react';

export default function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    rules, 
    alerts, 
    workflows, 
    executions,
    unreadAlerts,
    activeRules,
    criticalAlerts,
    isLoading 
  } = useAdvancedAutomation();

  const stats = {
    totalRules: rules.length,
    activeRules: activeRules.length,
    totalAlerts: alerts.length,
    unreadAlerts: unreadAlerts.length,
    criticalAlerts: criticalAlerts.length,
    totalWorkflows: workflows.length,
    recentExecutions: executions.slice(0, 5),
    successRate: executions.length > 0 
      ? Math.round((executions.filter(e => e.status === 'success').length / executions.length) * 100)
      : 0
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Central de Automações</h1>
          <p className="text-gray-600">
            Gerencie regras, alertas e workflows automatizados
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nova Automação
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
            <Bot className="h-4 w-4 text-brand-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRules}</div>
            <p className="text-xs text-gray-500">
              de {stats.totalRules} regras criadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadAlerts}</div>
            <p className="text-xs text-gray-500">
              {stats.criticalAlerts > 0 && (
                <span className="text-red-500 font-medium">
                  {stats.criticalAlerts} críticos
                </span>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkflows}</div>
            <p className="text-xs text-gray-500">workflows configurados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-gray-500">últimas execuções</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentExecutions.length > 0 ? (
            <div className="space-y-3">
              {stats.recentExecutions.map((execution) => {
                const rule = rules.find(r => r.id === execution.rule_id);
                return (
                  <div key={execution.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      {execution.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : execution.status === 'failed' ? (
                        <XCircle className="h-4 w-4 text-red-500" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      )}
                      <div>
                        <p className="font-medium">{rule?.name || 'Regra removida'}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(execution.started_at).toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        execution.status === 'success' ? 'default' :
                        execution.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {execution.status === 'success' ? 'Sucesso' :
                         execution.status === 'failed' ? 'Falha' : 'Pendente'}
                      </Badge>
                      {execution.execution_time_ms && (
                        <span className="text-xs text-gray-400">
                          {execution.execution_time_ms}ms
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Nenhuma execução recente
            </p>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Regras
            {stats.activeRules > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {stats.activeRules}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Alertas
            {stats.unreadAlerts > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs">
                {stats.unreadAlerts}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Workflow className="h-4 w-4" />
            Workflows
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AutomationAnalytics />
        </TabsContent>

        <TabsContent value="rules">
          <AutomationRulesManager />
        </TabsContent>

        <TabsContent value="alerts">
          <AutomationAlertsCenter />
        </TabsContent>

        <TabsContent value="workflows">
          <AutomationWorkflowBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
}
