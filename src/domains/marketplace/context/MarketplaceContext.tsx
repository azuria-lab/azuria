import React, { ReactNode, useCallback, useMemo, useReducer } from "react";
import { MarketplaceContext } from './MarketplaceContextBase.tsx';
import * as T from './types.ts';

// Types moved to ./types to satisfy react-refresh hygiene

// Initial State
// initialMarketplaceState moved to ./types

// Marketplace Reducer
function marketplaceReducer(state: T.MarketplaceState, action: T.MarketplaceAction): T.MarketplaceState {
  switch (action.type) {
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_SEARCH_RESULTS':
      return { ...state, searchResults: action.payload, isLoading: false };
    case 'SET_SELECTED_MARKETPLACE':
      return { ...state, selectedMarketplace: action.payload };
    case 'SET_PRICING_DATA':
      return { ...state, pricingData: action.payload };
    case 'SET_COMPETITORS':
      return { ...state, competitors: action.payload };
    case 'ADD_COMPETITOR':
      return { 
        ...state, 
        competitors: [action.payload, ...state.competitors.slice(0, 49)] // Keep last 50
      };
    case 'REMOVE_COMPETITOR':
      return { 
        ...state, 
  competitors: state.competitors.filter((c: T.CompetitorProduct) => c.id !== action.payload) 
      };
    case 'UPDATE_COMPETITOR_PRICE':
      return {
        ...state,
  competitors: state.competitors.map((competitor: T.CompetitorProduct) => 
          competitor.id === action.payload.id
            ? {
                ...competitor,
                product: { ...competitor.product, price: action.payload.price },
                priceHistory: [
                  { price: action.payload.price, timestamp: new Date() },
                  ...competitor.priceHistory.slice(0, 99) // Keep last 100 price points
                ]
              }
            : competitor
        )
      };
    case 'SET_TRENDS':
      return { ...state, trends: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'UPDATE_SETTINGS':
      return { 
        ...state, 
        settings: { ...state.settings, ...action.payload } 
      };
    case 'CLEAR_SEARCH':
      return { 
        ...state, 
        searchQuery: "", 
        searchResults: [], 
        pricingData: null,
        error: null 
      };
    case 'RESET_MARKETPLACE':
  return T.initialMarketplaceState;
    default:
      return state;
  }
}

// Provider
export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(marketplaceReducer, T.initialMarketplaceState);

  // Action Handlers
  const searchProducts = useCallback(async (query: string, marketplace = "all") => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    dispatch({ type: 'SET_SELECTED_MARKETPLACE', payload: marketplace });
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResults = generateMockProducts(query, marketplace);
      dispatch({ type: 'SET_SEARCH_RESULTS', payload: mockResults });
      
      // Generate pricing data
      const pricingData = generatePricingData(mockResults);
      dispatch({ type: 'SET_PRICING_DATA', payload: pricingData });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : "Erro na busca" });
    }
  }, [dispatch]);

  const analyzePricing = useCallback(async (productName: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const analysis = generatePricingAnalysis(productName);
      dispatch({ type: 'SET_PRICING_DATA', payload: analysis });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : "Erro na análise" });
    }
  }, [dispatch]);

  const addCompetitor = useCallback((product: T.MarketplaceProduct) => {
    const competitor: T.CompetitorProduct = {
      id: `comp_${Date.now()}`,
      product,
      priceHistory: [{ price: product.price, timestamp: new Date() }],
      isTracked: true,
    };
    
    dispatch({ type: 'ADD_COMPETITOR', payload: competitor });
  }, [dispatch]);

  const removeCompetitor = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_COMPETITOR', payload: id });
  }, [dispatch]);

  const updateCompetitorPrice = useCallback((id: string, price: number) => {
    dispatch({ type: 'UPDATE_COMPETITOR_PRICE', payload: { id, price } });
  }, [dispatch]);

  const refreshTrends = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const trends = generateMockTrends();
      dispatch({ type: 'SET_TRENDS', payload: trends });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : "Erro ao atualizar tendências" });
    }
  }, [dispatch]);

  const getSuggestedPrice = useCallback((cost: number, targetMargin: number): number => {
    if (!state.pricingData) {return cost * (1 + targetMargin / 100);}
    const basePrice = cost * (1 + targetMargin / 100);
    const marketAverage = state.pricingData.averagePrice;
    return (basePrice + marketAverage) / 2;
  }, [state.pricingData]);

  const updateSettings = useCallback((settings: Partial<T.MarketplaceState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH' });
  }, [dispatch]);

  // Context value
  const contextValue = useMemo(() => ({
    ...state,
    dispatch,
    searchProducts,
    analyzePricing,
    addCompetitor,
    removeCompetitor,
    updateCompetitorPrice,
    refreshTrends,
    getSuggestedPrice,
    updateSettings,
    clearSearch,
  }), [state, dispatch, searchProducts, analyzePricing, addCompetitor, removeCompetitor, updateCompetitorPrice, refreshTrends, getSuggestedPrice, updateSettings, clearSearch]);

  return (
    <MarketplaceContext.Provider value={contextValue}>
      {children}
    </MarketplaceContext.Provider>
  );
};

// Helper Functions
function generateMockProducts(query: string, marketplace: string): T.MarketplaceProduct[] {
  const products: T.MarketplaceProduct[] = [];
  const marketplaces = marketplace === "all" ? ["mercadolivre", "amazon", "shopee"] : [marketplace];
  
  for (let i = 0; i < 10; i++) {
    const selectedMarketplace = marketplaces[Math.floor(Math.random() * marketplaces.length)];
    products.push({
      id: `product_${i}`,
      title: `${query} - Produto ${i + 1}`,
      price: Math.random() * 500 + 50,
      rating: Math.random() * 2 + 3,
      seller: `Vendedor ${i + 1}`,
      marketplace: selectedMarketplace,
      url: `https://${selectedMarketplace}.com/product/${i}`,
      availability: Math.random() > 0.1 ? 'in_stock' : 'out_of_stock',
    });
  }
  
  return products;
}

function generatePricingData(products: T.MarketplaceProduct[]): T.PricingData {
  if (products.length === 0) {
  return {
      averagePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      suggestedPrice: 0,
      confidence: 0,
      lastUpdated: new Date(),
    };
  }
  
  const prices = products.map(p => p.price);
  const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  return {
    averagePrice,
    minPrice,
    maxPrice,
    suggestedPrice: averagePrice * 0.95, // 5% below average
    confidence: Math.random() * 0.3 + 0.7, // 70-100%
    lastUpdated: new Date(),
  };
}

function generatePricingAnalysis(_productName: string): T.PricingData {
  return {
    averagePrice: Math.random() * 300 + 100,
    minPrice: Math.random() * 100 + 50,
    maxPrice: Math.random() * 200 + 400,
    suggestedPrice: Math.random() * 250 + 150,
    confidence: Math.random() * 0.2 + 0.8,
    lastUpdated: new Date(),
  };
}

function generateMockTrends(): T.MarketTrend[] {
  const categories = ["Eletrônicos", "Roupas", "Casa", "Esportes", "Livros"];
  const trends: ("up" | "down" | "stable")[] = ["up", "down", "stable"];
  
  return categories.map((category, index) => ({
    id: `trend_${index}`,
    category,
    trend: trends[Math.floor(Math.random() * trends.length)],
    percentage: Math.random() * 20,
    timeframe: "7 dias",
  }));
}

// Note: types and actions are exported from separate files to satisfy react-refresh export hygiene