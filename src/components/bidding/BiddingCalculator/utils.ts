/**
 * Utilitários para o Calculador de Licitações
 */

import type { ViabilityColor } from './types';

/**
 * Mapeia cor de viabilidade para classe CSS Tailwind
 */
export const getViabilityColorClass = (color: ViabilityColor | string): string => {
  const colorMap: Record<string, string> = {
    red: 'bg-red-500',
    orange: 'bg-orange-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    emerald: 'bg-emerald-500',
  };
  return colorMap[color] || 'bg-gray-500';
};

