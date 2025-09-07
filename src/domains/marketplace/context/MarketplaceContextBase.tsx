import { createContext, useContext } from 'react';
import type { MarketplaceContextType } from './types.ts';

// Default value used to initialize the context; actual values come from the Provider
export const defaultMarketplaceValue: MarketplaceContextType = {
  searchQuery: '',
  searchResults: [],
  selectedMarketplace: 'all',
  pricingData: null,
  competitors: [],
  trends: [],
  isLoading: false,
  error: null,
  settings: {
    autoSync: true,
    updateInterval: 60,
    enableAlerts: true,
    targetMarketplaces: ['mercadolivre', 'amazon', 'shopee'],
  },
  dispatch: () => {},
  searchProducts: async () => {},
  analyzePricing: async () => {},
  addCompetitor: () => {},
  removeCompetitor: () => {},
  updateCompetitorPrice: () => {},
  refreshTrends: async () => {},
  getSuggestedPrice: () => 0,
  updateSettings: () => {},
  clearSearch: () => {},
};

export const MarketplaceContext = createContext<MarketplaceContextType>(defaultMarketplaceValue);

export const useMarketplaceContext = (): MarketplaceContextType => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplaceContext deve ser usado dentro de um MarketplaceProvider');
  }
  return context;
};
