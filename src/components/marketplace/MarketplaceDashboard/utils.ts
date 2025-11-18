/**
 * Funções utilitárias para o Dashboard de Marketplace
 */

import type { AlertSeverity, DemandLevel, InventoryStatus, PricePosition } from './types';

/**
 * Formata valor como moeda brasileira (BRL)
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

/**
 * Formata número com separadores de milhares
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

/**
 * Formata valor como porcentagem
 */
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

/**
 * Retorna variant do Badge baseado na severidade do alerta
 */
export const getAlertBadgeVariant = (severity: AlertSeverity): 'destructive' | 'default' | 'secondary' => {
  if (severity === 'high') {
    return 'destructive';
  }
  if (severity === 'medium') {
    return 'default';
  }
  return 'secondary';
};

/**
 * Retorna classe de cor baseada na posição de preço
 */
export const getPricePositionColor = (position: PricePosition): string => {
  if (position === 'below') {
    return 'text-green-600';
  }
  if (position === 'above') {
    return 'text-red-600';
  }
  return 'text-gray-600';
};

/**
 * Retorna variant do Badge baseado no nível de demanda
 */
export const getDemandLevelVariant = (level: DemandLevel): 'default' | 'secondary' | 'outline' => {
  if (level === 'high') {
    return 'default';
  }
  if (level === 'medium') {
    return 'secondary';
  }
  return 'outline';
};

/**
 * Retorna variant do Badge baseado no status de estoque
 */
export const getInventoryStatusVariant = (
  status: InventoryStatus
): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (status === 'available') {
    return 'default';
  }
  if (status === 'low') {
    return 'secondary';
  }
  if (status === 'out') {
    return 'destructive';
  }
  return 'outline';
};

