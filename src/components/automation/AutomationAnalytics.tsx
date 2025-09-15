
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdvancedAutomation } from '@/hooks/useAdvancedAutomation';
import { 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Cell, 
  Line, 
  LineChart, 
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import { Activity, AlertTriangle, TrendingUp, Zap } from 'lucide-react';

export function AutomationAnalytics() {
  const { rules, alerts, executions, isLoading } = useAdvancedAutomation();

  // Estatísticas gerais
  const stats = {
    totalExecutions: executions.length,
    successRate: executions.length > 0 
      ? Math.round((executions.filter(e => e.status === 'success').length / executions.length) * 100)
      : 0,
    avgExecutionTime: executions.length > 0
      ? Math.round(executions.reduce((sum, e) => sum + (e.execution_time_ms || 0), 0) / executions.length)
      : 0,
    activeRules: rules.filter(r => r.is_active).length,
  };

  // Dados para gráfico de execuções por tipo de regra
  const executionsByType = rules.reduce((acc, rule) => {
    const ruleExecutions = executions.filter(e => e.rule_id === rule.id);
    const existing = acc.find(item => item.type === rule.rule_type);
    
    if (existing) {
      existing.executions += ruleExecutions.length;
    } else {
      acc.push({
        type: rule.rule_type === 'pricing' ? 'Precificação' :
              rule.rule_type === 'alert' ? 'Alertas' :
              rule.rule_type === 'workflow' ? 'Workflows' : 'Notificações',
        executions: ruleExecutions.length,
      });
    }
    
    return acc;
  }, [] as Array<{ type: string; executions: number }>);

  // Dados para gráfico de alertas por severidade
  const alertsBySeverity = alerts.reduce((acc, alert) => {
    const existing = acc.find(item => item.severity === alert.severity);
    
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({
        severity: alert.severity === 'critical' ? 'Crítico' :
                 alert.severity === 'high' ? 'Alto' :
                 alert.severity === 'medium' ? 'Médio' : 'Baixo',
        count: 1,
      });
    }
    
    return acc;
  }, [] as Array<{ severity: string; count: number }>);

  // Dados para gráfico de execuções ao longo do tempo (últimos 7 dias)
  const executionsTrend = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const dayExecutions = executions.filter(e => {
      const execDate = new Date(e.started_at);
      return execDate.toDateString() === date.toDateString();
    });
    
    return {
      date: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
      executions: dayExecutions.length,
      success: dayExecutions.filter(e => e.status === 'success').length,
    };
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Execuções</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExecutions}</div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <p className="text-xs text-muted-foreground">
              De todas as execuções
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgExecutionTime}ms</div>
            <p className="text-xs text-muted-foreground">
              Por execução
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regras Ativas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeRules}</div>
            <p className="text-xs text-muted-foreground">
              De {rules.length} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execuções por Tipo */}
        <Card>
          <CardHeader>
            <CardTitle>Execuções por Tipo de Regra</CardTitle>
            <CardDescription>
              Distribuição das execuções por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={executionsByType}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="executions" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alertas por Severidade */}
        <Card>
          <CardHeader>
            <CardTitle>Alertas por Severidade</CardTitle>
            <CardDescription>
              Distribuição dos alertas por nível de severidade
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={alertsBySeverity}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ severity, percent }) => `${severity} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {alertsBySeverity.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendência de Execuções */}
      <Card>
        <CardHeader>
          <CardTitle>Tendência de Execuções</CardTitle>
          <CardDescription>
            Execuções nos últimos 7 dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={executionsTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="executions" 
                stroke="#3B82F6" 
                strokeWidth={2}
                name="Total"
              />
              <Line 
                type="monotone" 
                dataKey="success" 
                stroke="#10B981" 
                strokeWidth={2}
                name="Sucessos"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
