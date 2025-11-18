/**
 * Tipos para o Calculador de Licitações
 */

export interface BiddingCalculatorProps {
  initialData?: Partial<import('@/types/bidding').BiddingData>;
}

export type ViabilityColor = 'red' | 'orange' | 'yellow' | 'green' | 'emerald';

