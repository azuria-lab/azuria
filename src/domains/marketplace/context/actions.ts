import type * as T from './types.ts';

// Action Creators (moved out to satisfy react-refresh export hygiene)
export const marketplaceActions = {
  setSearchQuery: (query: string): T.MarketplaceAction => ({ type: 'SET_SEARCH_QUERY', payload: query }),
  setSearchResults: (results: T.MarketplaceProduct[]): T.MarketplaceAction => ({ type: 'SET_SEARCH_RESULTS', payload: results }),
  setSelectedMarketplace: (marketplace: string): T.MarketplaceAction => ({ type: 'SET_SELECTED_MARKETPLACE', payload: marketplace }),
  setPricingData: (data: T.PricingData): T.MarketplaceAction => ({ type: 'SET_PRICING_DATA', payload: data }),
  setCompetitors: (competitors: T.CompetitorProduct[]): T.MarketplaceAction => ({ type: 'SET_COMPETITORS', payload: competitors }),
  addCompetitor: (competitor: T.CompetitorProduct): T.MarketplaceAction => ({ type: 'ADD_COMPETITOR', payload: competitor }),
  removeCompetitor: (id: string): T.MarketplaceAction => ({ type: 'REMOVE_COMPETITOR', payload: id }),
  updateCompetitorPrice: (id: string, price: number): T.MarketplaceAction => ({ type: 'UPDATE_COMPETITOR_PRICE', payload: { id, price } }),
  setTrends: (trends: T.MarketTrend[]): T.MarketplaceAction => ({ type: 'SET_TRENDS', payload: trends }),
  setLoading: (loading: boolean): T.MarketplaceAction => ({ type: 'SET_LOADING', payload: loading }),
  setError: (error: string | null): T.MarketplaceAction => ({ type: 'SET_ERROR', payload: error }),
  updateSettings: (settings: Partial<T.MarketplaceState['settings']>): T.MarketplaceAction => ({ type: 'UPDATE_SETTINGS', payload: settings }),
  clearSearch: (): T.MarketplaceAction => ({ type: 'CLEAR_SEARCH' }),
  resetMarketplace: (): T.MarketplaceAction => ({ type: 'RESET_MARKETPLACE' }),
};
