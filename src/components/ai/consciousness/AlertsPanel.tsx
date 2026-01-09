/**
 * ══════════════════════════════════════════════════════════════════════════════
 * ALERTS PANEL - Painel de Alertas do Sistema Cognitivo
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Interface para visualizar e gerenciar alertas baseados em métricas.
 * Permite configurar regras, visualizar alertas ativos e histórico.
 *
 * @module components/ai/consciousness/AlertsPanel
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  BellOff,
  Check,
  CheckCircle2,
  Clock,
  Info,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  acknowledgeAlert,
  acknowledgeAllAlerts,
  addAlertRule,
  type AlertRule,
  type AlertSeverity,
  checkAlertsNow,
  clearAlertHistory,
  type ComparisonOperator,
  getActiveAlerts,
  getAlertHistory,
  getAlertRules,
  getAlertStats,
  initAlerts,
  loadDefaultRules,
  removeAlertRule,
  toggleAlertRule,
  type TriggeredAlert,
} from '@/azuria_ai/observability/CognitiveAlerts';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface AlertsPanelProps {
  className?: string;
  autoRefreshInterval?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════════

function useAlerts(refreshInterval: number) {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<TriggeredAlert[]>([]);
  const [history, setHistory] = useState<TriggeredAlert[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getAlertStats> | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refresh = useCallback(() => {
    setRules(getAlertRules());
    setActiveAlerts(getActiveAlerts());
    setHistory(getAlertHistory());
    setStats(getAlertStats());
  }, []);

  // Initialize alerts on mount
  useEffect(() => {
    initAlerts({
      onAlert: () => refresh(),
      onResolve: () => refresh(),
    });
    loadDefaultRules();
    refresh();
  }, [refresh]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) {return;}
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refresh, refreshInterval]);

  return {
    rules,
    activeAlerts,
    history,
    stats,
    autoRefresh,
    setAutoRefresh,
    refresh,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════

/** Ícone de severidade */
function SeverityIcon({ severity }: { severity: AlertSeverity }) {
  switch (severity) {
    case 'critical':
      return <XCircle className="h-4 w-4 text-red-600" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    case 'info':
      return <Info className="h-4 w-4 text-blue-500" />;
  }
}

/** Badge de severidade */
function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  const variants: Record<AlertSeverity, string> = {
    critical: 'bg-red-600 text-white',
    error: 'bg-red-500 text-white',
    warning: 'bg-yellow-500 text-black',
    info: 'bg-blue-500 text-white',
  };

  return (
    <Badge className={cn('text-xs', variants[severity])}>
      {severity.toUpperCase()}
    </Badge>
  );
}

/** Card de Overview */
function OverviewCard({ stats }: { stats: ReturnType<typeof getAlertStats> }) {
  const hasActiveAlerts = stats.activeAlerts > 0;

  return (
    <Card className={cn(hasActiveAlerts && 'border-yellow-500/50')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className={cn('h-5 w-5', hasActiveAlerts && 'text-yellow-500 animate-pulse')} />
            <CardTitle className="text-lg">Visão Geral</CardTitle>
          </div>
          {hasActiveAlerts ? (
            <Badge variant="destructive">{stats.activeAlerts} ativos</Badge>
          ) : (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{stats.totalRules}</p>
            <p className="text-xs text-muted-foreground">Regras</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-green-500">{stats.enabledRules}</p>
            <p className="text-xs text-muted-foreground">Habilitadas</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-500">{stats.activeAlerts}</p>
            <p className="text-xs text-muted-foreground">Ativos</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <p className="text-2xl font-bold">{stats.totalAlerts}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
        </div>

        {/* Breakdown por severidade */}
        {hasActiveAlerts && (
          <>
            <Separator className="my-4" />
            <div className="flex items-center justify-center gap-4">
              {stats.bySeverity.critical > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span className="font-bold">{stats.bySeverity.critical}</span>
                </div>
              )}
              {stats.bySeverity.error > 0 && (
                <div className="flex items-center gap-1 text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-bold">{stats.bySeverity.error}</span>
                </div>
              )}
              {stats.bySeverity.warning > 0 && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-bold">{stats.bySeverity.warning}</span>
                </div>
              )}
              {stats.bySeverity.info > 0 && (
                <div className="flex items-center gap-1 text-blue-500">
                  <Info className="h-4 w-4" />
                  <span className="font-bold">{stats.bySeverity.info}</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/** Card de Alertas Ativos */
function ActiveAlertsCard({
  alerts,
  onAcknowledge,
  onAcknowledgeAll,
}: {
  alerts: TriggeredAlert[];
  onAcknowledge: (id: string) => void;
  onAcknowledgeAll: () => void;
}) {
  return (
    <Card className={cn(alerts.length > 0 && 'border-yellow-500/50')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn('h-5 w-5', alerts.length > 0 ? 'text-yellow-500' : 'text-green-500')} />
            <CardTitle className="text-lg">Alertas Ativos</CardTitle>
          </div>
          {alerts.length > 0 && (
            <Button variant="outline" size="sm" onClick={onAcknowledgeAll}>
              <Check className="h-4 w-4 mr-1" />
              Ack All
            </Button>
          )}
        </div>
        <CardDescription>
          {alerts.length === 0
            ? 'Nenhum alerta ativo'
            : `${alerts.length} alerta(s) requerem atenção`}
        </CardDescription>
      </CardHeader>
      {alerts.length > 0 && (
        <CardContent>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'p-3 rounded-lg border flex items-start gap-3',
                    alert.severity === 'critical' && 'bg-red-500/10 border-red-500/30',
                    alert.severity === 'error' && 'bg-red-500/10 border-red-500/20',
                    alert.severity === 'warning' && 'bg-yellow-500/10 border-yellow-500/20',
                    alert.severity === 'info' && 'bg-blue-500/10 border-blue-500/20',
                    alert.acknowledged && 'opacity-50'
                  )}
                >
                  <SeverityIcon severity={alert.severity} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{alert.ruleName}</p>
                      <SeverityBadge severity={alert.severity} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(alert.timestamp).toLocaleTimeString('pt-BR')}
                      </span>
                      <span>
                        Valor: {alert.currentValue.toFixed(2)} / Limite: {alert.threshold}
                      </span>
                    </div>
                  </div>
                  {!alert.acknowledged && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onAcknowledge(alert.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Reconhecer</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}

/** Tabela de Regras */
function RulesTable({
  rules,
  onToggle,
  onEdit,
  onDelete,
}: {
  rules: AlertRule[];
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (rule: AlertRule) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Regras de Alerta</CardTitle>
        </div>
        <CardDescription>Configuração de thresholds e condições</CardDescription>
      </CardHeader>
      <CardContent>
        {rules.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma regra configurada
          </p>
        ) : (
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Métrica</TableHead>
                  <TableHead>Condição</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead className="text-center">Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id} className={cn(!rule.enabled && 'opacity-50')}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{rule.name}</p>
                        <p className="text-xs text-muted-foreground">{rule.description}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{rule.metric}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {formatCondition(rule)}
                    </TableCell>
                    <TableCell>
                      <SeverityBadge severity={rule.severity} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={(enabled) => onToggle(rule.id, enabled)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onEdit(rule)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Editar</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  if (confirm('Remover esta regra?')) {
                                    onDelete(rule.id);
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Remover</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

/** Histórico de Alertas */
function HistoryTable({ history, onClear }: { history: TriggeredAlert[]; onClear: () => void }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">Histórico</CardTitle>
          </div>
          {history.length > 0 && (
            <Button variant="outline" size="sm" onClick={onClear}>
              Limpar
            </Button>
          )}
        </div>
        <CardDescription>Alertas recentes</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum alerta no histórico
          </p>
        ) : (
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Alerta</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...history].reverse().map((alert) => (
                  <TableRow key={alert.id}>
                    <TableCell>
                      <SeverityIcon severity={alert.severity} />
                    </TableCell>
                    <TableCell>
                      <p className="font-medium text-sm">{alert.ruleName}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {alert.currentValue.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

/** Dialog de Criar/Editar Regra */
function RuleDialog({
  open,
  rule,
  onClose,
  onSave,
}: {
  open: boolean;
  rule: AlertRule | null;
  onClose: () => void;
  onSave: (rule: AlertRule) => void;
}) {
  const [formData, setFormData] = useState<Partial<AlertRule>>({
    name: '',
    description: '',
    metric: '',
    metricType: 'counter',
    operator: 'gt',
    threshold: 0,
    severity: 'warning',
    cooldownMs: 60000,
    enabled: true,
  });

  useEffect(() => {
    if (rule) {
      setFormData(rule);
    } else {
      setFormData({
        name: '',
        description: '',
        metric: '',
        metricType: 'counter',
        operator: 'gt',
        threshold: 0,
        severity: 'warning',
        cooldownMs: 60000,
        enabled: true,
      });
    }
  }, [rule, open]);

  const handleSave = () => {
    const newRule: AlertRule = {
      id: rule?.id ?? `rule-${Date.now()}`,
      name: formData.name ?? '',
      description: formData.description ?? '',
      metric: formData.metric ?? '',
      metricType: formData.metricType ?? 'counter',
      operator: formData.operator ?? 'gt',
      threshold: formData.threshold ?? 0,
      severity: formData.severity ?? 'warning',
      cooldownMs: formData.cooldownMs ?? 60000,
      enabled: formData.enabled ?? true,
      percentile: formData.percentile,
      tags: formData.tags,
    };
    onSave(newRule);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{rule ? 'Editar Regra' : 'Nova Regra de Alerta'}</DialogTitle>
          <DialogDescription>
            Configure os parâmetros da regra de alerta
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nome da regra"
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descrição do alerta"
            />
          </div>

          <div className="space-y-2">
            <Label>Métrica</Label>
            <Input
              value={formData.metric}
              onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
              placeholder="nucleus.error"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={formData.metricType}
                onValueChange={(v) => setFormData({ ...formData, metricType: v as 'counter' | 'gauge' | 'percentile' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="counter">Counter</SelectItem>
                  <SelectItem value="gauge">Gauge</SelectItem>
                  <SelectItem value="percentile">Percentile</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Operador</Label>
              <Select
                value={formData.operator}
                onValueChange={(v) => setFormData({ ...formData, operator: v as ComparisonOperator })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gt">&gt; (maior que)</SelectItem>
                  <SelectItem value="gte">&gt;= (maior ou igual)</SelectItem>
                  <SelectItem value="lt">&lt; (menor que)</SelectItem>
                  <SelectItem value="lte">&lt;= (menor ou igual)</SelectItem>
                  <SelectItem value="eq">== (igual)</SelectItem>
                  <SelectItem value="neq">!= (diferente)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Threshold</Label>
              <Input
                type="number"
                value={formData.threshold}
                onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Severidade</Label>
              <Select
                value={formData.severity}
                onValueChange={(v) => setFormData({ ...formData, severity: v as AlertSeverity })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cooldown (ms)</Label>
            <Input
              type="number"
              value={formData.cooldownMs}
              onChange={(e) => setFormData({ ...formData, cooldownMs: Number(e.target.value) })}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Habilitado</Label>
            <Switch
              checked={formData.enabled}
              onCheckedChange={(enabled) => setFormData({ ...formData, enabled })}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function formatCondition(rule: AlertRule): string {
  const opMap: Record<ComparisonOperator, string> = {
    gt: '>',
    gte: '>=',
    lt: '<',
    lte: '<=',
    eq: '==',
    neq: '!=',
  };
  return `${opMap[rule.operator]} ${rule.threshold}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function AlertsPanel({ className, autoRefreshInterval = 3000 }: AlertsPanelProps) {
  const { rules, activeAlerts, history, stats, autoRefresh, setAutoRefresh, refresh } =
    useAlerts(autoRefreshInterval);
  const [showRuleDialog, setShowRuleDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  const handleToggleRule = useCallback(
    (id: string, enabled: boolean) => {
      toggleAlertRule(id, enabled);
      refresh();
    },
    [refresh]
  );

  const handleEditRule = useCallback((rule: AlertRule) => {
    setEditingRule(rule);
    setShowRuleDialog(true);
  }, []);

  const handleDeleteRule = useCallback(
    (id: string) => {
      removeAlertRule(id);
      refresh();
    },
    [refresh]
  );

  const handleSaveRule = useCallback(
    (rule: AlertRule) => {
      addAlertRule(rule);
      refresh();
    },
    [refresh]
  );

  const handleAcknowledge = useCallback(
    (id: string) => {
      acknowledgeAlert(id);
      refresh();
    },
    [refresh]
  );

  const handleAcknowledgeAll = useCallback(() => {
    acknowledgeAllAlerts();
    refresh();
  }, [refresh]);

  const handleClearHistory = useCallback(() => {
    clearAlertHistory();
    refresh();
  }, [refresh]);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Alertas Inteligentes</h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              checkAlertsNow();
              refresh();
            }}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Verificar Agora
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingRule(null);
              setShowRuleDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Nova Regra
          </Button>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? (
              <Bell className="h-4 w-4" />
            ) : (
              <BellOff className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Overview */}
      {stats && <OverviewCard stats={stats} />}

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="relative">
            Ativos
            {activeAlerts.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="rules">Regras</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <ActiveAlertsCard
            alerts={activeAlerts}
            onAcknowledge={handleAcknowledge}
            onAcknowledgeAll={handleAcknowledgeAll}
          />
        </TabsContent>

        <TabsContent value="rules">
          <RulesTable
            rules={rules}
            onToggle={handleToggleRule}
            onEdit={handleEditRule}
            onDelete={handleDeleteRule}
          />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTable history={history} onClear={handleClearHistory} />
        </TabsContent>
      </Tabs>

      {/* Dialog */}
      <RuleDialog
        open={showRuleDialog}
        rule={editingRule}
        onClose={() => {
          setShowRuleDialog(false);
          setEditingRule(null);
        }}
        onSave={handleSaveRule}
      />
    </div>
  );
}

export default AlertsPanel;
