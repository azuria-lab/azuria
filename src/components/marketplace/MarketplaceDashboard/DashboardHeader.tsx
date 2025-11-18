/**
 * Cabeçalho do Dashboard de Marketplace
 */

import React from 'react';
import { Download, RefreshCw, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  marketplaceName: string;
  onRefresh: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  isLoading?: boolean;
  isPremium?: boolean;
}

export function DashboardHeader({
  marketplaceName,
  onRefresh,
  onExport,
  onSettings,
  isLoading = false,
  isPremium = false,
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Dashboard {marketplaceName}
        </h2>
        <p className="text-muted-foreground">
          Análise completa do marketplace em tempo real
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn('mr-2 h-4 w-4', isLoading && 'animate-spin')} />
          Atualizar
        </Button>

        {isPremium && onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        )}

        {onSettings && (
          <Button variant="outline" size="sm" onClick={onSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Configurar
          </Button>
        )}
      </div>
    </div>
  );
}

