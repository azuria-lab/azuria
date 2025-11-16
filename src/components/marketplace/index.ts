/**
 * Marketplace Components Index
 * 
 * Exporta todos os componentes e serviços relacionados ao marketplace
 */

// Componentes principais
export { default as MultiMarketplaceDashboard } from './MultiMarketplaceDashboard';
export { default as MarketplaceCarousel } from './MarketplaceCarousel';
export { default as MarketplaceDashboard } from './MarketplaceDashboard';

// Tipos
export type { MarketplaceCard } from './MarketplaceCarousel';

// Re-exportar serviços para conveniência
export { createMarketplaceHandler, AVAILABLE_MARKETPLACES } from '@/services/marketplace';
export type { MarketplaceAPI, MarketplaceDashboardData } from '@/types/marketplace-api';
