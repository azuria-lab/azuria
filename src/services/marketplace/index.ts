/**
 * Marketplace Handlers Export
 * 
 * Exporta todos os handlers de marketplace disponíveis
 */

export { BaseMarketplaceHandler } from './BaseMarketplaceHandler';
export { MercadoLivreHandler } from './MercadoLivreHandler';

// Factory para criar handlers
import type { MarketplaceAPI } from '@/types/marketplace-api';
import { MercadoLivreHandler } from './MercadoLivreHandler';

/**
 * Cria uma instância do handler apropriado para o marketplace
 */
export function createMarketplaceHandler(marketplaceId: string): MarketplaceAPI {
  switch (marketplaceId) {
    case 'mercado-livre':
      return new MercadoLivreHandler();
    
    // TODO: Adicionar outros marketplaces
    // case 'shopee':
    //   return new ShopeeHandler();
    // case 'amazon':
    //   return new AmazonHandler();
    // case 'magazine-luiza':
    //   return new MagazineLuizaHandler();
    
    default:
      throw new Error(`Marketplace não suportado: ${marketplaceId}`);
  }
}

/**
 * Lista de todos os marketplaces disponíveis
 */
export const AVAILABLE_MARKETPLACES = [
  {
    id: 'mercado-livre',
    name: 'Mercado Livre',
    logoUrl: '/logos/mercadolivre.svg',
    color: '#FFE600',
    category: 'nacional' as const,
    region: 'América Latina',
    description: 'Maior marketplace da América Latina',
  },
  // Adicione mais marketplaces conforme implementados
] as const;
