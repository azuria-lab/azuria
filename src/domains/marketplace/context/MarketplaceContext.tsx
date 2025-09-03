import React, { createContext, ReactNode, useContext, useMemo, useReducer } from "react";

// Marketplace State Types
interface MarketplaceState {
  // Search
  searchQuery: string;
  searchResults: MarketplaceProduct[];
  selectedMarketplace: string;
  
  // Pricing Intelligence
  pricingData: PricingData | null;
  competitors: CompetitorProduct[];
  
  // Trends
  trends: MarketTrend[];
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Settings
  settings: {
    autoSync: boolean;
    updateInterval: number; // minutes
    enableAlerts: boolean;
    targetMarketplaces: string[];
  };
}

interface MarketplaceProduct {
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

interface PricingData {
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  suggestedPrice: number;
  confidence: number;
  lastUpdated: Date;
}

interface CompetitorProduct {
  id: string;
  product: MarketplaceProduct;
  priceHistory: PricePoint[];
  isTracked: boolean;
}

interface PricePoint {
  price: number;
  timestamp: Date;
}

interface MarketTrend {
  id: string;
  category: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
  timeframe: string;
}

// Marketplace Actions
type MarketplaceAction =
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

// Marketplace Context Type
interface MarketplaceContextType extends MarketplaceState {
  dispatch: React.Dispatch<MarketplaceAction>;
  // Actions
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

// Initial State
const initialMarketplaceState: MarketplaceState = {
  searchQuery: "",
  searchResults: [],
  selectedMarketplace: "all",
  pricingData: null,
  competitors: [],
  trends: [],
  isLoading: false,
  error: null,
  settings: {
    autoSync: true,
    updateInterval: 60,
    enableAlerts: true,
    targetMarketplaces: ["mercadolivre", "amazon", "shopee"],
  },
};

// Marketplace Reducer
function marketplaceReducer(state: MarketplaceState, action: MarketplaceAction): MarketplaceState {
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
        competitors: state.competitors.filter(c => c.id !== action.payload) 
      };
    case 'UPDATE_COMPETITOR_PRICE':
      return {
        ...state,
        competitors: state.competitors.map(competitor => 
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
      return initialMarketplaceState;
    default:
      return state;
  }
}

// Default Context Value
const defaultMarketplaceValue: MarketplaceContextType = {
  ...initialMarketplaceState,
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

// Context
const MarketplaceContext = createContext<MarketplaceContextType>(defaultMarketplaceValue);

// Provider
export const MarketplaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(marketplaceReducer, initialMarketplaceState);

  // Action Handlers
  const searchProducts = async (query: string, marketplace = "all") => {
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
  };

  const analyzePricing = async (productName: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const analysis = generatePricingAnalysis(productName);
      dispatch({ type: 'SET_PRICING_DATA', payload: analysis });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : "Erro na análise" });
    }
  };

  const addCompetitor = (product: MarketplaceProduct) => {
    const competitor: CompetitorProduct = {
      id: `comp_${Date.now()}`,
      product,
      priceHistory: [{ price: product.price, timestamp: new Date() }],
      isTracked: true,
    };
    
    dispatch({ type: 'ADD_COMPETITOR', payload: competitor });
  };

  const removeCompetitor = (id: string) => {
    dispatch({ type: 'REMOVE_COMPETITOR', payload: id });
  };

  const updateCompetitorPrice = (id: string, price: number) => {
    dispatch({ type: 'UPDATE_COMPETITOR_PRICE', payload: { id, price } });
  };

  const refreshTrends = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const trends = generateMockTrends();
      dispatch({ type: 'SET_TRENDS', payload: trends });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : "Erro ao atualizar tendências" });
    }
  };

  const getSuggestedPrice = (cost: number, targetMargin: number): number => {
    if (!state.pricingData) {return cost * (1 + targetMargin / 100);}
    
    const basePrice = cost * (1 + targetMargin / 100);
    const marketAverage = state.pricingData.averagePrice;
    
    // Adjust based on market data
    return (basePrice + marketAverage) / 2;
  };

  const updateSettings = (settings: Partial<MarketplaceState['settings']>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  };

  const clearSearch = () => {
    dispatch({ type: 'CLEAR_SEARCH' });
  };

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
  }), [state]);

  return (
    <MarketplaceContext.Provider value={contextValue}>
      {children}
    </MarketplaceContext.Provider>
  );
};

// Hook
export const useMarketplaceContext = (): MarketplaceContextType => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplaceContext deve ser usado dentro de um MarketplaceProvider');
  }
  return context;
};

// Helper Functions
function generateMockProducts(query: string, marketplace: string): MarketplaceProduct[] {
  const products: MarketplaceProduct[] = [];
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

function generatePricingData(products: MarketplaceProduct[]): PricingData {
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

function generatePricingAnalysis(productName: string): PricingData {
  return {
    averagePrice: Math.random() * 300 + 100,
    minPrice: Math.random() * 100 + 50,
    maxPrice: Math.random() * 200 + 400,
    suggestedPrice: Math.random() * 250 + 150,
    confidence: Math.random() * 0.2 + 0.8,
    lastUpdated: new Date(),
  };
}

function generateMockTrends(): MarketTrend[] {
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

// Action Creators
export const marketplaceActions = {
  setSearchQuery: (query: string): MarketplaceAction => ({ type: 'SET_SEARCH_QUERY', payload: query }),
  setSearchResults: (results: MarketplaceProduct[]): MarketplaceAction => ({ type: 'SET_SEARCH_RESULTS', payload: results }),
  setSelectedMarketplace: (marketplace: string): MarketplaceAction => ({ type: 'SET_SELECTED_MARKETPLACE', payload: marketplace }),
  setPricingData: (data: PricingData): MarketplaceAction => ({ type: 'SET_PRICING_DATA', payload: data }),
  setCompetitors: (competitors: CompetitorProduct[]): MarketplaceAction => ({ type: 'SET_COMPETITORS', payload: competitors }),
  addCompetitor: (competitor: CompetitorProduct): MarketplaceAction => ({ type: 'ADD_COMPETITOR', payload: competitor }),
  removeCompetitor: (id: string): MarketplaceAction => ({ type: 'REMOVE_COMPETITOR', payload: id }),
  updateCompetitorPrice: (id: string, price: number): MarketplaceAction => ({ type: 'UPDATE_COMPETITOR_PRICE', payload: { id, price } }),
  setTrends: (trends: MarketTrend[]): MarketplaceAction => ({ type: 'SET_TRENDS', payload: trends }),
  setLoading: (loading: boolean): MarketplaceAction => ({ type: 'SET_LOADING', payload: loading }),
  setError: (error: string | null): MarketplaceAction => ({ type: 'SET_ERROR', payload: error }),
  updateSettings: (settings: Partial<MarketplaceState['settings']>): MarketplaceAction => ({ type: 'UPDATE_SETTINGS', payload: settings }),
  clearSearch: (): MarketplaceAction => ({ type: 'CLEAR_SEARCH' }),
  resetMarketplace: (): MarketplaceAction => ({ type: 'RESET_MARKETPLACE' }),
};

export type { 
  MarketplaceState, 
  MarketplaceAction, 
  MarketplaceContextType, 
  MarketplaceProduct, 
  PricingData, 
  CompetitorProduct, 
  MarketTrend 
};