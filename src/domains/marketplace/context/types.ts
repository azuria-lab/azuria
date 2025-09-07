import type React from 'react';

export interface MarketplaceProduct {
  id: string;
  title: string;
  price: number;
  rating: number;
  seller: string;
  marketplace: string;
  url: string;
  image?: string;
  availability: 'in_stock' | 'out_of_stock' | 'limited';
}

export interface PricePoint {
  price: number;
  timestamp: Date;
}

export interface PricingData {
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  suggestedPrice: number;
  confidence: number;
  lastUpdated: Date;
}

export interface CompetitorProduct {
  id: string;
  product: MarketplaceProduct;
  priceHistory: PricePoint[];
  isTracked: boolean;
}

export interface MarketTrend {
  id: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  timeframe: string;
}

export interface MarketplaceState {
  searchQuery: string;
  searchResults: MarketplaceProduct[];
  selectedMarketplace: string;
  pricingData: PricingData | null;
  competitors: CompetitorProduct[];
  trends: MarketTrend[];
  isLoading: boolean;
  error: string | null;
  settings: {
    autoSync: boolean;
    updateInterval: number;
    enableAlerts: boolean;
    targetMarketplaces: string[];
  };
}

export type MarketplaceAction =
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_SEARCH_RESULTS'; payload: MarketplaceProduct[] }
  | { type: 'SET_SELECTED_MARKETPLACE'; payload: string }
  | { type: 'SET_PRICING_DATA'; payload: PricingData }
  | { type: 'SET_COMPETITORS'; payload: CompetitorProduct[] }
  | { type: 'ADD_COMPETITOR'; payload: CompetitorProduct }
  | { type: 'REMOVE_COMPETITOR'; payload: string }
  | { type: 'UPDATE_COMPETITOR_PRICE'; payload: { id: string; price: number } }
  | { type: 'SET_TRENDS'; payload: MarketTrend[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<MarketplaceState['settings']> }
  | { type: 'CLEAR_SEARCH' }
  | { type: 'RESET_MARKETPLACE' };

export interface MarketplaceContextType extends MarketplaceState {
  dispatch: React.Dispatch<MarketplaceAction>;
  searchProducts: (query: string, marketplace?: string) => Promise<void>;
  analyzePricing: (productName: string) => Promise<void>;
  addCompetitor: (product: MarketplaceProduct) => void;
  removeCompetitor: (id: string) => void;
  updateCompetitorPrice: (id: string, price: number) => void;
  refreshTrends: () => Promise<void>;
  getSuggestedPrice: (cost: number, targetMargin: number) => number;
  updateSettings: (settings: Partial<MarketplaceState['settings']>) => void;
  clearSearch: () => void;
}

export const initialMarketplaceState: MarketplaceState = {
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
};
