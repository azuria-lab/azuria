/**
 * Tipos e interfaces para a Calculadora Avançada
 */

export interface AdvancedCalculatorProps {
  userId?: string;
}

export interface CalculationHistory {
  id: string;
  timestamp: Date;
  cost: number;
  margin: number;
  finalPrice: number;
  marketplace: string;
}

export interface MarketplaceTemplate {
  id: string;
  name: string;
  icon: string;
  defaultFee: number;
  includePaymentFee: boolean;
  shippingPolicy: string;
  extraCommissions: string[];
  colors: {
    primary: string;
    secondary: string;
  };
}

export interface FormData {
  cost: string;
  productName: string;
  productCategory: string;
  targetMargin: string;
  marketplaceId: string;
  shipping: string;
  packaging: string;
  marketing: string;
  otherCosts: string;
  paymentMethod: string;
  paymentFee: string;
  calculationMode: string;
  manualPrice: string;
  includePaymentFee: boolean;
}

export interface RealtimeResults {
  suggestedPrice: number;
  netProfit: number;
  totalMargin: number;
  totalCosts: number;
  totalFees: number;
}

