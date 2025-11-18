/**
 * Tipos para o Dashboard de Marketplace
 */

export interface MarketplaceDashboardProps {
  marketplaceId: string;
  marketplaceName: string;
  marketplaceColor: string;
  data: import('@/types/marketplace-api').MarketplaceDashboardData;
  onRefresh: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  isLoading?: boolean;
  isPremium?: boolean;
}

export type AlertSeverity = 'low' | 'medium' | 'high';
export type PricePosition = 'above' | 'below' | 'equal';
export type DemandLevel = 'low' | 'medium' | 'high';
export type InventoryStatus = 'available' | 'low' | 'out' | 'unintegrated';

