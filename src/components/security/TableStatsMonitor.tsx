
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useMaintenanceCleanup, useTableStats } from '@/hooks/useTableStats';
import { useMaintenanceCleanupMutation } from '@/hooks/useSecurityMonitoring';
import { Activity, Database, HardDrive, RefreshCw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const TableStatsMonitor: React.FC = () => {
  const { data: tableStats, isLoading, refetch } = useTableStats();
  const maintenanceCleanup = useMaintenanceCleanupMutation();

  const handleMaintenanceCleanup = async () => {
    try {
      await maintenanceCleanup.mutateAsync();
      toast.success('Limpeza de manutenção executada com sucesso');
      refetch();
    } catch (error) {
      toast.error('Erro na limpeza de manutenção');
    }
  };

  const getIndexUsageColor = (ratio: number) => {
    if (ratio >= 80) {return 'text-green-600';}
    if (ratio >= 60) {return 'text-yellow-600';}
    return 'text-red-600';
  };

  const getIndexUsageBadge = (ratio: number) => {
    if (ratio >= 80) {return 'default';}
    if (ratio >= 60) {return 'secondary';}
    return 'destructive';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Carregando estatísticas das tabelas...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Estatísticas das Tabelas
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleMaintenanceCleanup}
              disabled={maintenanceCleanup.isPending}
            >
              {maintenanceCleanup.isPending ? 'Executando...' : 'Limpeza'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tableStats?.map((table) => (
            <div key={table.table_name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{table.table_name}</span>
                  <Badge variant="outline" className="text-xs">
                    {table.table_size}
                  </Badge>
                </div>
                <Badge variant={getIndexUsageBadge(table.index_usage_ratio)}>
                  {table.index_usage_ratio}% índices
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-500" />
                  <span>Registros: {table.row_count.toString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-green-500" />
                  <span>Tamanho: {table.table_size}</span>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Uso de Índices</span>
                  <span className={getIndexUsageColor(table.index_usage_ratio)}>
                    {table.index_usage_ratio}%
                  </span>
                </div>
                <Progress value={table.index_usage_ratio} className="h-2" />
              </div>
            </div>
          ))}

          {(!tableStats || tableStats.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>Nenhuma estatística disponível</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TableStatsMonitor;
