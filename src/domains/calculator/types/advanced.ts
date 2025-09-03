export interface TaxRegime {
  id: string;
  name: string;
  description: string;
  category: string;
  rates: {
    irpj: number;
    csll: number;
    pis: number;
    cofins: number;
    issqn?: number;
    icms?: number;
    icms_st?: number;
    ipi?: number;
    iss?: number;
    cpp?: number;
    inss?: number;
  };
  annexo?: string;
  faturamentoLimite?: number;
  applicableActivities?: string[];
  simplexPercent: number;
  pis: number;
  cofins: number;
  irpj: number;
  csll: number;
  icms: number;
  iss?: number;
  applicableToProduct: boolean;
  applicableToService: boolean;
}

export interface AdvancedCalculationResult {
  sellingPrice: number;
  profit: number;
  profitPercent: number;
  profitMargin: number;
  isHealthyProfit: boolean;
  totalCost: number;
  totalTaxes: number;
  totalFees: number;
  netProfit: number;
  roi: number;
  breakdown: {
    cost: number;
    otherCosts: number;
    marketplaceFee: number;
    taxes: {
      total: number;
      details: Record<string, number>;
      effectiveRate: number;
      simplex?: number;
      pis?: number;
      cofins?: number;
      irpj?: number;
      csll?: number;
      icms?: number;
      iss?: number;
    };
    fees: {
      marketplace: number;
      payment: number;
      logistics: number;
      advertising: number;
      others: number;
    };
    shipping: number;
    margins: {
      gross: number;
      net: number;
      contribution: number;
    };
    netProfit: number;
  };
  competitorAnalysis?: {
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
    averagePrice: number;
    pricePosition: 'below' | 'above' | 'average';
    suggestedPrice: number;
    position: 'below' | 'above' | 'average';
    competitiveAdvantage: number;
  };
  taxRegimeAnalysis: {
    selectedRegime: TaxRegime;
    alternativeRegimes: Array<{
      regime: TaxRegime;
      savings: number;
      sellingPrice: number;
      recommendation: string;
    }>;
  };
  recommendations: string[];
  alerts: {
    type: 'warning' | 'error' | 'info';
    message: string;
  }[];
}