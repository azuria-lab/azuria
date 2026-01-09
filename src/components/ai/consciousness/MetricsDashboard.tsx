/**
 * ══════════════════════════════════════════════════════════════════════════════
 * METRICS DASHBOARD - Visualização de Métricas em Tempo Real
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Componente para exibir métricas do sistema cognitivo com gráficos e tabelas.
 * Integrado com CognitiveMetrics para observabilidade completa.
 *
 * @module components/ai/consciousness/MetricsDashboard
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Activity,
  ArrowDown,
  ArrowUp,
  BarChart3,
  Clock,
  Download,
  Gauge,
  Hash,
  RefreshCw,
  Timer,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

import {
  exportJSON,
  exportPrometheus,
  getPercentile,
  getSnapshot,
  type MetricAggregation,
  type MetricsSnapshot,
  resetMetrics,
} from '@/azuria_ai/observability/CognitiveMetrics';

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

interface MetricsDashboardProps {
  className?: string;
  autoRefreshInterval?: number;
}

type ExportFormat = 'json' | 'prometheus';

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK DE MÉTRICAS
// ═══════════════════════════════════════════════════════════════════════════════

function useMetrics(refreshInterval: number) {
  const [snapshot, setSnapshot] = useState<MetricsSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const refresh = useCallback(() => {
    try {
      setSnapshot(getSnapshot());
    } catch {
      // Silently handle errors
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    if (!autoRefresh) {return;}
    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refresh, refreshInterval]);

  return {
    snapshot,
    isLoading,
    autoRefresh,
    setAutoRefresh,
    refresh,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════════════

/** Card de Visão Geral */
function OverviewCard({ snapshot }: { snapshot: MetricsSnapshot }) {
  const counterCount = Object.keys(snapshot.counters).length;
  const gaugeCount = Object.keys(snapshot.gauges).length;
  const histogramCount = Object.keys(snapshot.histograms).length;
  const totalMetrics = counterCount + gaugeCount + histogramCount;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Visão Geral</CardTitle>
          </div>
          <Badge variant="outline">{totalMetrics} métricas</Badge>
        </div>
        <CardDescription>Resumo do sistema de métricas</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Hash className="h-5 w-5 mx-auto mb-1 text-blue-500" />
            <p className="text-2xl font-bold">{counterCount}</p>
            <p className="text-xs text-muted-foreground">Contadores</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Gauge className="h-5 w-5 mx-auto mb-1 text-green-500" />
            <p className="text-2xl font-bold">{gaugeCount}</p>
            <p className="text-xs text-muted-foreground">Gauges</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <BarChart3 className="h-5 w-5 mx-auto mb-1 text-purple-500" />
            <p className="text-2xl font-bold">{histogramCount}</p>
            <p className="text-xs text-muted-foreground">Histogramas</p>
          </div>
          <div className="text-center p-3 bg-muted/50 rounded-lg">
            <Clock className="h-5 w-5 mx-auto mb-1 text-orange-500" />
            <p className="text-2xl font-bold">{formatUptime(snapshot.uptimeMs)}</p>
            <p className="text-xs text-muted-foreground">Uptime</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Card de Contadores */
function CountersCard({ counters }: { counters: Record<string, number> }) {
  const entries = Object.entries(counters).sort(([, a], [, b]) => b - a);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Hash className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-lg">Contadores</CardTitle>
        </div>
        <CardDescription>Valores acumulados</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum contador registrado
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Métrica</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map(([name, value]) => (
                  <TableRow key={name}>
                    <TableCell className="font-mono text-xs">{name}</TableCell>
                    <TableCell className="text-right font-bold">
                      {value.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/** Card de Gauges */
function GaugesCard({ gauges }: { gauges: Record<string, number> }) {
  const entries = Object.entries(gauges);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Gauge className="h-5 w-5 text-green-500" />
          <CardTitle className="text-lg">Gauges</CardTitle>
        </div>
        <CardDescription>Valores instantâneos</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum gauge registrado
            </p>
          ) : (
            <div className="space-y-4">
              {entries.map(([name, value]) => (
                <div key={name} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs truncate max-w-[200px]">{name}</span>
                    <span className="font-bold">{value.toFixed(2)}</span>
                  </div>
                  <Progress value={Math.min(value, 100)} className="h-2" />
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/** Card de Histogramas */
function HistogramsCard({ histograms }: { histograms: Record<string, number[]> }) {
  const entries = Object.entries(histograms).filter(([, values]) => values.length > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-500" />
          <CardTitle className="text-lg">Histogramas</CardTitle>
        </div>
        <CardDescription>Distribuição de valores</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum histograma registrado
            </p>
          ) : (
            <div className="space-y-4">
              {entries.map(([name, values]) => {
                const sorted = [...values].sort((a, b) => a - b);
                const min = sorted[0];
                const max = sorted[sorted.length - 1];
                const avg = values.reduce((a, b) => a + b, 0) / values.length;
                const p50 = sorted[Math.floor(sorted.length * 0.5)];
                const p95 = sorted[Math.floor(sorted.length * 0.95)];
                const p99 = sorted[Math.floor(sorted.length * 0.99)];

                return (
                  <div key={name} className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs truncate max-w-[200px]">{name}</span>
                      <Badge variant="outline">{values.length} samples</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-muted-foreground">Min</p>
                        <p className="font-mono">{min.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Avg</p>
                        <p className="font-mono">{avg.toFixed(2)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">Max</p>
                        <p className="font-mono">{max.toFixed(2)}</p>
                      </div>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center">
                        <p className="text-muted-foreground">p50</p>
                        <p className="font-mono">{p50?.toFixed(2) ?? '-'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">p95</p>
                        <p className="font-mono">{p95?.toFixed(2) ?? '-'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-muted-foreground">p99</p>
                        <p className="font-mono">{p99?.toFixed(2) ?? '-'}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/** Card de Métricas Agregadas */
function AggregationsCard({ metrics }: { metrics: Record<string, MetricAggregation> }) {
  const entries = Object.values(metrics).sort((a, b) => b.lastUpdated - a.lastUpdated);

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-cyan-500" />
          <CardTitle className="text-lg">Métricas Agregadas</CardTitle>
        </div>
        <CardDescription>Estatísticas detalhadas por métrica</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma métrica agregada
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Count</TableHead>
                  <TableHead className="text-right">Min</TableHead>
                  <TableHead className="text-right">Avg</TableHead>
                  <TableHead className="text-right">Max</TableHead>
                  <TableHead className="text-right">Last</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((metric) => (
                  <TableRow key={`${metric.name}-${JSON.stringify(metric.tags)}`}>
                    <TableCell className="font-mono text-xs max-w-[200px] truncate">
                      {metric.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {metric.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {metric.count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {metric.min.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {metric.avg.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {metric.max.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {metric.last.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/** Card do Nucleus */
function NucleusMetricsCard({ snapshot }: { snapshot: MetricsSnapshot }) {
  const nucleusMetrics = Object.entries(snapshot.counters).filter(([name]) =>
    name.startsWith('nucleus.')
  );

  const totalActions = nucleusMetrics
    .filter(([name]) => name.includes('action.processed'))
    .reduce((sum, [, val]) => sum + val, 0);

  const errors = nucleusMetrics
    .filter(([name]) => name.includes('error'))
    .reduce((sum, [, val]) => sum + val, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <CardTitle className="text-lg">Nucleus</CardTitle>
        </div>
        <CardDescription>Métricas do CentralNucleus</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-green-500">{totalActions}</p>
              <p className="text-xs text-muted-foreground">Ações Processadas</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-red-500">{errors}</p>
              <p className="text-xs text-muted-foreground">Erros</p>
            </div>
          </div>

          {nucleusMetrics.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                {nucleusMetrics.slice(0, 5).map(([name, value]) => (
                  <div key={name} className="flex items-center justify-between text-xs">
                    <span className="font-mono truncate max-w-[180px]">
                      {name.replace('nucleus.', '')}
                    </span>
                    <span className="font-bold">{value}</span>
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

/** Card de Eventos */
function EventsMetricsCard({ snapshot }: { snapshot: MetricsSnapshot }) {
  const eventMetrics = Object.entries(snapshot.counters).filter(([name]) =>
    name.startsWith('events.')
  );

  const emitted = eventMetrics
    .filter(([name]) => name.includes('emitted'))
    .reduce((sum, [, val]) => sum + val, 0);

  const dropped = eventMetrics
    .filter(([name]) => name.includes('dropped'))
    .reduce((sum, [, val]) => sum + val, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-lg">Eventos</CardTitle>
        </div>
        <CardDescription>Métricas do EventBus</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ArrowUp className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-2xl font-bold">{emitted}</p>
              <p className="text-xs text-muted-foreground">Emitidos</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <ArrowDown className="h-4 w-4 text-red-500" />
              </div>
              <p className="text-2xl font-bold">{dropped}</p>
              <p className="text-xs text-muted-foreground">Descartados</p>
            </div>
          </div>

          {/* Timing metrics */}
          {snapshot.histograms['events.processing.duration'] && (
            <>
              <Separator />
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Tempo de Processamento</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <p className="text-muted-foreground">p50</p>
                    <p className="font-mono">
                      {getPercentile('events.processing.duration', 50).toFixed(0)}ms
                    </p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <p className="text-muted-foreground">p95</p>
                    <p className="font-mono">
                      {getPercentile('events.processing.duration', 95).toFixed(0)}ms
                    </p>
                  </div>
                  <div className="text-center p-2 bg-muted/30 rounded">
                    <p className="text-muted-foreground">p99</p>
                    <p className="font-mono">
                      {getPercentile('events.processing.duration', 99).toFixed(0)}ms
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {return `${days}d ${hours % 24}h`;}
  if (hours > 0) {return `${hours}h ${minutes % 60}m`;}
  if (minutes > 0) {return `${minutes}m`;}
  return `${seconds}s`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════

export function MetricsDashboard({
  className,
  autoRefreshInterval = 2000,
}: MetricsDashboardProps) {
  const { snapshot, isLoading, autoRefresh, setAutoRefresh, refresh } =
    useMetrics(autoRefreshInterval);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json');

  const handleExport = useCallback(() => {
    const data = exportFormat === 'json' ? exportJSON() : exportPrometheus();
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metrics-${Date.now()}.${exportFormat === 'json' ? 'json' : 'txt'}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportFormat]);

  const handleReset = useCallback(() => {
    if (confirm('Tem certeza que deseja resetar todas as métricas?')) {
      resetMetrics();
      refresh();
    }
  }, [refresh]);

  if (isLoading && !snapshot) {
    return (
      <div className={cn('p-4 flex items-center justify-center', className)}>
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className={cn('p-4', className)}>
        <p className="text-muted-foreground text-center">
          Nenhuma métrica disponível
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Métricas do Sistema</h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="prometheus">Prometheus</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-1" />
            Exportar
          </Button>

          {/* Reset */}
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset
          </Button>

          {/* Auto-refresh */}
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={cn('h-4 w-4', autoRefresh && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="aggregations">Agregações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewCard snapshot={snapshot} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NucleusMetricsCard snapshot={snapshot} />
            <EventsMetricsCard snapshot={snapshot} />
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <CountersCard counters={snapshot.counters} />
            <GaugesCard gauges={snapshot.gauges} />
            <HistogramsCard histograms={snapshot.histograms} />
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NucleusMetricsCard snapshot={snapshot} />
            <EventsMetricsCard snapshot={snapshot} />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Timer className="h-5 w-5" />
                Informações do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Timestamp</p>
                  <p className="font-mono text-xs">
                    {new Date(snapshot.timestamp).toLocaleString('pt-BR')}
                  </p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="font-mono text-xs">{formatUptime(snapshot.uptimeMs)}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Counters</p>
                  <p className="font-mono text-xs">{Object.keys(snapshot.counters).length}</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Metrics</p>
                  <p className="font-mono text-xs">{Object.keys(snapshot.metrics).length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aggregations">
          <AggregationsCard metrics={snapshot.metrics} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default MetricsDashboard;
