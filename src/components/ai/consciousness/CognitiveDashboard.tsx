/**
 * ══════════════════════════════════════════════════════════════════════════════
 * COGNITIVE DASHBOARD - Dashboard de Consciência do Modo Deus
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Este componente fornece visualização em tempo real do sistema cognitivo:
 * - Status do CentralNucleus
 * - Engines ativos e estatísticas
 * - Eventos processados
 * - Níveis de consciência
 * - Memória e estado
 *
 * @access ADMIN only
 * @module components/ai/consciousness/CognitiveDashboard
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
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  Cpu,
  Eye,
  Layers,
  MemoryStick,
  Network,
  Pause,
  Play,
  RefreshCw,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { type DashboardData, useCognitiveDashboard } from './useCognitiveDashboard';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface CognitiveDashboardProps {
  /** Modo compacto */
  compact?: boolean;
  /** Classe CSS adicional */
  className?: string;
  /** Callback ao fechar */
  onClose?: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════

/** Card de Status do Nucleus */
function NucleusStatusCard({
  data,
  onTogglePause,
}: {
  data: DashboardData;
  onTogglePause: () => void;
}) {
  const statusColor = data.nucleus.isRunning
    ? data.nucleus.isPaused
      ? 'text-yellow-500'
      : 'text-green-500'
    : 'text-red-500';

  const statusText = data.nucleus.isRunning
    ? data.nucleus.isPaused
      ? 'Pausado'
      : 'Ativo'
    : 'Inativo';

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className={cn('h-5 w-5', statusColor)} />
            <CardTitle className="text-lg">Central Nucleus</CardTitle>
          </div>
          <Badge
            variant={data.nucleus.isRunning ? (data.nucleus.isPaused ? 'secondary' : 'default') : 'destructive'}
          >
            {statusText}
          </Badge>
        </div>
        <CardDescription>Núcleo central de consciência cognitiva</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Uptime */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Uptime
            </span>
            <span className="font-mono">{formatUptime(data.nucleus.uptimeMs)}</span>
          </div>

          {/* Ciclos */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <RefreshCw className="h-4 w-4" />
              Ciclos
            </span>
            <span className="font-mono">{data.nucleus.cycleCount.toLocaleString()}</span>
          </div>

          {/* Nível de Consciência */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Nível
            </span>
            <Badge variant="outline">{data.nucleus.currentLevel}</Badge>
          </div>

          {/* Ações Pendentes */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Ações Pendentes
            </span>
            <span className="font-mono">{data.nucleus.pendingActions}</span>
          </div>

          <Separator />

          {/* Controles */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onTogglePause}
              disabled={!data.nucleus.isRunning}
              className="flex-1"
            >
              {data.nucleus.isPaused ? (
                <>
                  <Play className="mr-1 h-4 w-4" />
                  Retomar
                </>
              ) : (
                <>
                  <Pause className="mr-1 h-4 w-4" />
                  Pausar
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Card de Engines */
function EnginesCard({ data }: { data: DashboardData }) {
  const activeEngines = data.engines.filter((e) => e.active);
  const inactiveEngines = data.engines.filter((e) => !e.active);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Engines</CardTitle>
          </div>
          <Badge variant="outline">
            {activeEngines.length}/{data.engines.length}
          </Badge>
        </div>
        <CardDescription>Engines cognitivos registrados</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] pr-4">
          <div className="space-y-2">
            {activeEngines.map((engine) => (
              <EngineRow key={engine.id} engine={engine} />
            ))}
            {inactiveEngines.length > 0 && (
              <>
                <Separator className="my-2" />
                <p className="text-xs text-muted-foreground mb-2">Inativos</p>
                {inactiveEngines.map((engine) => (
                  <EngineRow key={engine.id} engine={engine} />
                ))}
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/** Linha de Engine */
function EngineRow({
  engine,
}: {
  engine: DashboardData['engines'][0];
}) {
  const categoryColors: Record<string, string> = {
    cognitive: 'bg-purple-500',
    operational: 'bg-blue-500',
    governance: 'bg-green-500',
    safety: 'bg-red-500',
    learning: 'bg-yellow-500',
    prediction: 'bg-cyan-500',
    communication: 'bg-pink-500',
    integration: 'bg-orange-500',
    utility: 'bg-gray-500',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center justify-between py-1 px-2 rounded-md hover:bg-muted/50 cursor-default">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  'h-2 w-2 rounded-full',
                  engine.active ? categoryColors[engine.category] || 'bg-gray-500' : 'bg-gray-300'
                )}
              />
              <span className={cn('text-sm', !engine.active && 'text-muted-foreground')}>
                {engine.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground font-mono">
                {engine.eventsEmitted}
              </span>
              <Badge variant="outline" className="text-xs">
                {engine.privilege}
              </Badge>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p>
              <strong>ID:</strong> {engine.id}
            </p>
            <p>
              <strong>Categoria:</strong> {engine.category}
            </p>
            <p>
              <strong>Privilégio:</strong> {engine.privilege}
            </p>
            <p>
              <strong>Eventos:</strong> {engine.eventsEmitted}
            </p>
            <p>
              <strong>Ações:</strong> {engine.actionsExecuted}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/** Card de Eventos */
function EventsCard({ data }: { data: DashboardData }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            <CardTitle className="text-lg">Eventos</CardTitle>
          </div>
          <Badge variant="outline">{data.events.total.toLocaleString()}</Badge>
        </div>
        <CardDescription>Eventos processados pelo sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-green-500">{data.events.approved}</p>
              <p className="text-xs text-muted-foreground">Aprovados</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-red-500">{data.events.denied}</p>
              <p className="text-xs text-muted-foreground">Negados</p>
            </div>
          </div>

          {/* Taxa de aprovação */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Taxa de Aprovação</span>
              <span className="font-mono">{data.events.approvalRate.toFixed(1)}%</span>
            </div>
            <Progress value={data.events.approvalRate} className="h-2" />
          </div>

          {/* Cache hits */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Cache Hits
            </span>
            <span className="font-mono">{data.events.cached}</span>
          </div>

          {/* Eventos recentes por tipo */}
          {data.events.recentByType && Object.keys(data.events.recentByType).length > 0 && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground mb-2">Por Tipo (últimos 5 min)</p>
                {Object.entries(data.events.recentByType)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between text-xs">
                      <span className="truncate max-w-[150px]">{type}</span>
                      <span className="font-mono">{count}</span>
                    </div>
                  ))}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Card de Governança */
function GovernanceCard({ data }: { data: DashboardData }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Governança</CardTitle>
          </div>
          <Badge
            variant={data.governance.strictMode ? 'default' : 'secondary'}
          >
            {data.governance.strictMode ? 'Strict' : 'Normal'}
          </Badge>
        </div>
        <CardDescription>Sistema de permissões e controle</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Requests */}
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold">{data.governance.totalRequests}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold text-green-500">{data.governance.granted}</p>
              <p className="text-xs text-muted-foreground">Granted</p>
            </div>
            <div className="text-center p-2 bg-muted/50 rounded-lg">
              <p className="text-lg font-bold text-red-500">{data.governance.denied}</p>
              <p className="text-xs text-muted-foreground">Denied</p>
            </div>
          </div>

          {/* Engines registrados */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Layers className="h-4 w-4" />
              Engines Registrados
            </span>
            <span className="font-mono">{data.governance.enginesRegistered}</span>
          </div>

          {/* Cache size */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Network className="h-4 w-4" />
              Cache Size
            </span>
            <span className="font-mono">{data.governance.cacheSize}</span>
          </div>

          {/* CompatibilityAdapter */}
          <Separator />
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Compatibility Adapter</p>
            <div className="flex items-center justify-between">
              <span className="text-sm">Status</span>
              <Badge variant={data.governance.adapterInstalled ? 'default' : 'secondary'}>
                {data.governance.adapterInstalled ? 'Instalado' : 'Não Instalado'}
              </Badge>
            </div>
            {data.governance.adapterInstalled && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Interceptados</span>
                <span className="font-mono">{data.governance.adapterIntercepted}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Card de Memória */
function MemoryCard({ data }: { data: DashboardData }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MemoryStick className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-lg">Memória</CardTitle>
          </div>
          <Badge variant={data.memory.syncEnabled ? 'default' : 'secondary'}>
            {data.memory.syncEnabled ? 'Sync ON' : 'Sync OFF'}
          </Badge>
        </div>
        <CardDescription>Sistema de memória unificado</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* STM */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Short-Term Memory</span>
              <span className="font-mono">{data.memory.stm.recentInteractions}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Tela atual: {data.memory.stm.currentScreen}
            </p>
          </div>

          {/* WM */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Working Memory</span>
              <span className="font-mono">{data.memory.wm.calculations} calc</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Padrões: {data.memory.wm.patterns}</span>
              <span>Sugestões: {data.memory.wm.suggestionsShown}</span>
            </div>
          </div>

          {/* LTM */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Long-Term Memory</span>
              <span className="font-mono">{data.memory.ltm.preferences} pref</span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Padrões: {data.memory.ltm.behaviorPatterns}</span>
              <span>Feedback: {data.memory.ltm.feedback}</span>
            </div>
          </div>

          {/* Sync */}
          {data.memory.syncEnabled && data.memory.lastSyncAt && (
            <>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Último Sync</span>
                <span className="text-xs">{formatTimestamp(data.memory.lastSyncAt)}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/** Card de Estado */
function StateCard({ data }: { data: DashboardData }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-cyan-500" />
            <CardTitle className="text-lg">Estado</CardTitle>
          </div>
          <Badge variant={data.state.initialized ? 'default' : 'secondary'}>
            {data.state.initialized ? 'Inicializado' : 'Não Inicializado'}
          </Badge>
        </div>
        <CardDescription>UnifiedStateStore</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Identidade */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Identidade</p>
            <div className="flex items-center gap-2">
              <Badge>{data.state.role}</Badge>
              <Badge variant="outline">{data.state.tier}</Badge>
            </div>
          </div>

          {/* Sessão */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sessão</span>
              <span className="text-xs font-mono">{data.state.sessionId.slice(0, 8)}...</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cálculos:</span>
                <span>{data.state.calculations}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Erros:</span>
                <span>{data.state.errors}</span>
              </div>
            </div>
          </div>

          {/* Engine Slices */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <Layers className="h-4 w-4" />
              Engine Slices
            </span>
            <span className="font-mono">{data.state.engineSlices}</span>
          </div>

          {/* System Health */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">System Health</span>
              <span className="font-mono">{(data.state.healthScore * 100).toFixed(0)}%</span>
            </div>
            <Progress
              value={data.state.healthScore * 100}
              className={cn(
                'h-2',
                data.state.healthScore < 0.5 && '[&>div]:bg-red-500',
                data.state.healthScore >= 0.5 && data.state.healthScore < 0.8 && '[&>div]:bg-yellow-500'
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Card de Alertas */
function AlertsCard({ data }: { data: DashboardData }) {
  const hasAlerts = data.alerts.length > 0;

  return (
    <Card className={cn(hasAlerts && 'border-yellow-500/50')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className={cn('h-5 w-5', hasAlerts ? 'text-yellow-500' : 'text-green-500')} />
            <CardTitle className="text-lg">Alertas</CardTitle>
          </div>
          {hasAlerts ? (
            <Badge variant="secondary">{data.alerts.length}</Badge>
          ) : (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          )}
        </div>
        <CardDescription>
          {hasAlerts ? 'Atenção necessária' : 'Nenhum alerta ativo'}
        </CardDescription>
      </CardHeader>
      {hasAlerts && (
        <CardContent>
          <ScrollArea className="h-[120px]">
            <div className="space-y-2">
              {data.alerts.map((alert, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-2 rounded-md text-sm',
                    alert.severity === 'error' && 'bg-red-500/10 text-red-500',
                    alert.severity === 'warning' && 'bg-yellow-500/10 text-yellow-500',
                    alert.severity === 'info' && 'bg-blue-500/10 text-blue-500'
                  )}
                >
                  <p className="font-medium">{alert.title}</p>
                  <p className="text-xs opacity-80">{alert.message}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function formatUptime(ms: number | null): string {
  if (!ms) {return '0s';}
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {return `${days}d ${hours % 24}h`;}
  if (hours > 0) {return `${hours}h ${minutes % 60}m`;}
  if (minutes > 0) {return `${minutes}m ${seconds % 60}s`;}
  return `${seconds}s`;
}

function formatTimestamp(ts: number): string {
  const date = new Date(ts);
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function CognitiveDashboard({
  compact = false,
  className,
  onClose,
}: CognitiveDashboardProps) {
  const { data, isLoading, error, refresh, togglePause } = useCognitiveDashboard();
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) {return;}
    const interval = setInterval(refresh, 2000);
    return () => clearInterval(interval);
  }, [autoRefresh, refresh]);

  if (isLoading && !data) {
    return (
      <div className={cn('p-4 flex items-center justify-center', className)}>
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn('p-4', className)}>
        <Card className="border-red-500/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              <p>Erro ao carregar dashboard: {error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={refresh} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tentar Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Cognitive Dashboard</h2>
          <Badge variant="outline" className="ml-2">
            Modo Deus
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={autoRefresh ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                >
                  <RefreshCw className={cn('h-4 w-4', autoRefresh && 'animate-spin')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {autoRefresh ? 'Pausar auto-refresh' : 'Ativar auto-refresh'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </div>
      </div>

      {/* Grid de Cards */}
      {compact ? (
        <div className="grid grid-cols-2 gap-4">
          <NucleusStatusCard data={data} onTogglePause={togglePause} />
          <EventsCard data={data} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <NucleusStatusCard data={data} onTogglePause={togglePause} />
          <EnginesCard data={data} />
          <EventsCard data={data} />
          <GovernanceCard data={data} />
          <MemoryCard data={data} />
          <StateCard data={data} />
          <div className="md:col-span-2 lg:col-span-3">
            <AlertsCard data={data} />
          </div>
        </div>
      )}
    </div>
  );
}

export default CognitiveDashboard;
