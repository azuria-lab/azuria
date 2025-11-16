/**
 * Types for Multi-Marketplace Comparison Feature
 */

export interface MarketplaceComparisonResult {
  marketplaceId: string;
  marketplaceName: string;
  marketplaceIcon: string;
  suggestedPrice: number;
  netProfit: number;
  profitMargin: number;
  totalFees: number;
  totalCosts: number;
  ranking: number; // 1 = melhor, 2 = segundo melhor, etc
  profitDifference: number; // Diferença em R$ vs melhor marketplace
  profitDifferencePercentage: number; // Diferença em % vs melhor marketplace
  isRecommended: boolean; // Badge "Melhor Opção"
  breakdown: {
    marketplaceFee: number;
    marketplaceFeePercentage: number;
    paymentFee: number;
    paymentFeePercentage: number;
    shippingCost: number;
    packagingCost: number;
    marketingCost: number;
    otherCosts: number;
  };
  insights: string[]; // Insights específicos deste marketplace
}

export interface MultiMarketplaceComparisonData {
  results: MarketplaceComparisonResult[];
  bestMarketplace: MarketplaceComparisonResult;
  worstMarketplace: MarketplaceComparisonResult;
  averageProfit: number;
  averageMargin: number;
  totalFeesComparison: {
    lowest: { marketplaceId: string; value: number };
    highest: { marketplaceId: string; value: number };
  };
  summary: {
    message: string;
    recommendation: string;
    potentialSavings: number; // Quanto pode economizar no melhor vs pior
  };
}

export interface MultiMarketplaceInput {
  cost: number;
  targetMargin: number;
  shipping: number;
  packaging: number;
  marketing: number;
  otherCosts: number;
  paymentMethod: string;
  includePaymentFee: boolean;
}

export type ComparisonViewMode = 'table' | 'cards' | 'chart';

export type ComparisonSortBy = 'profit' | 'margin' | 'fees' | 'price';
