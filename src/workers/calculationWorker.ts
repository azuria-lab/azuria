/**
 * Web Worker para cálculos pesados
 * Evita bloquear a main thread durante cálculos complexos
 */

export interface CalculationMessage {
  type: 'CALCULATE_BATCH' | 'CALCULATE_SCENARIOS' | 'CALCULATE_MARKET_ANALYSIS';
  data: any;
  id: string;
}

export interface CalculationResult {
  type: 'RESULT' | 'ERROR' | 'PROGRESS';
  data: any;
  id: string;
  progress?: number;
}

// Cálculo em lote otimizado
const calculateBatch = (products: any[]) => {
  const results = [];
  const total = products.length;
  
  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    
    // Cálculo otimizado de preço
    const cost = parseFloat(product.cost) || 0;
    const margin = parseFloat(product.margin) || 0;
    const tax = parseFloat(product.tax) || 0;
    
    const basePrice = cost / (1 - margin / 100);
    const finalPrice = basePrice * (1 + tax / 100);
    
    results.push({
      ...product,
      calculatedPrice: finalPrice,
      profit: finalPrice - cost,
      profitMargin: ((finalPrice - cost) / finalPrice) * 100
    });
    
    // Reportar progresso a cada 10%
    if (i % Math.ceil(total / 10) === 0) {
      self.postMessage({
        type: 'PROGRESS',
        id: 'batch',
        progress: (i / total) * 100
      });
    }
  }
  
  return results;
};

// Análise de cenários
const calculateScenarios = (baseData: any, scenarios: any[]) => {
  return scenarios.map(scenario => {
    const cost = parseFloat(baseData.cost) || 0;
    const margin = parseFloat(scenario.margin) || 0;
    const tax = parseFloat(scenario.tax) || 0;
    
    const basePrice = cost / (1 - margin / 100);
    const finalPrice = basePrice * (1 + tax / 100);
    
    return {
      ...scenario,
      price: finalPrice,
      profit: finalPrice - cost,
      profitMargin: ((finalPrice - cost) / finalPrice) * 100,
      competitiveness: calculateCompetitiveness(finalPrice, scenario.marketPrice)
    };
  });
};

// Cálculo de competitividade
const calculateCompetitiveness = (price: number, marketPrice: number) => {
  if (!marketPrice) {return 'unknown';}
  
  const difference = ((price - marketPrice) / marketPrice) * 100;
  
  if (difference <= -10) {return 'very-competitive';}
  if (difference <= -5) {return 'competitive';}
  if (difference <= 5) {return 'neutral';}
  if (difference <= 15) {return 'expensive';}
  return 'very-expensive';
};

// Event listener principal
self.addEventListener('message', (event: MessageEvent<CalculationMessage>) => {
  const { type, data, id } = event.data;
  
  try {
    let result: any;
    
    switch (type) {
      case 'CALCULATE_BATCH':
        result = calculateBatch(data.products);
        break;
        
      case 'CALCULATE_SCENARIOS':
        result = calculateScenarios(data.baseData, data.scenarios);
        break;
        
      case 'CALCULATE_MARKET_ANALYSIS':
        // Análise de mercado complexa
        result = {
          competitorAnalysis: data.competitors.map((c: any) => ({
            ...c,
            priceAdvantage: ((data.ourPrice - c.price) / c.price) * 100
          })),
          marketPosition: calculateMarketPosition(data.ourPrice, data.competitors),
          recommendations: generateRecommendations(data)
        };
        break;
        
      default:
        throw new Error(`Unknown calculation type: ${type}`);
    }
    
    self.postMessage({
      type: 'RESULT',
      id,
      data: result
    } as CalculationResult);
    
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      id,
      data: { error: error instanceof Error ? error.message : 'Unknown error' }
    } as CalculationResult);
  }
});

const calculateMarketPosition = (ourPrice: number, competitors: any[]) => {
  if (!competitors.length) {return 'unknown';}
  
  const prices = competitors.map(c => c.price).sort((a, b) => a - b);
  const position = prices.findIndex(p => p >= ourPrice);
  
  if (position === -1) {return 'highest';}
  if (position === 0) {return 'lowest';}
  if (position <= prices.length * 0.25) {return 'low';}
  if (position <= prices.length * 0.75) {return 'medium';}
  return 'high';
};

const generateRecommendations = (data: any) => {
  const recommendations = [];
  
  if (data.ourPrice > data.averageMarketPrice * 1.2) {
    recommendations.push({
      type: 'price-reduction',
      message: 'Considere reduzir o preço para ficar mais competitivo',
      impact: 'high'
    });
  }
  
  if (data.margin < 20) {
    recommendations.push({
      type: 'margin-increase',
      message: 'Margem muito baixa, considere otimizar custos',
      impact: 'medium'
    });
  }
  
  return recommendations;
};