import { BRAZILIAN_STATES } from '@/types/marketplaceTemplates';

// Regiões do Brasil para cálculo de ICMS
const REGIONS = {
  SUL: ['RS', 'SC', 'PR'],
  SUDESTE: ['SP', 'RJ', 'MG'], // ES fica de fora para regra especial
  CENTRO_OESTE: ['MT', 'MS', 'GO', 'DF'],
  NORDESTE: ['BA', 'SE', 'AL', 'PE', 'PB', 'RN', 'CE', 'PI', 'MA'],
  NORTE: ['AC', 'RO', 'AM', 'RR', 'PA', 'AP', 'TO'],
  ESPECIAL: ['ES'] // Espírito Santo tem regra especial
};

export interface ICMSCalculation {
  rate: number;
  internalRate: number;
  ruleDescription: string;
  isInterstate: boolean;
}

export function calculateICMS(originState: string, destinationState: string): ICMSCalculation {
  // Se for o mesmo estado, usa ICMS interno
  if (originState === destinationState) {
    return {
      rate: getInternalICMSRate(originState),
      internalRate: getInternalICMSRate(originState),
      ruleDescription: `ICMS interno do estado ${getStateName(originState)}`,
      isInterstate: false
    };
  }

  // Regras interestaduais
  const originRegion = getStateRegion(originState);
  const destinationRegion = getStateRegion(destinationState);

  // Regra especial: Sul/Sudeste → Norte/Nordeste/Centro-Oeste/ES = 7%
  if (
    (originRegion === 'SUL' || originRegion === 'SUDESTE') &&
    (destinationRegion === 'NORTE' || destinationRegion === 'NORDESTE' || 
     destinationRegion === 'CENTRO_OESTE' || destinationState === 'ES')
  ) {
    return {
      rate: 7.0,
      internalRate: getInternalICMSRate(destinationState),
      ruleDescription: 'ICMS interestadual Sul/Sudeste → Norte/Nordeste/Centro-Oeste/ES',
      isInterstate: true
    };
  }

  // Demais casos = 12%
  return {
    rate: 12.0,
    internalRate: getInternalICMSRate(destinationState),
    ruleDescription: 'ICMS interestadual - demais casos',
    isInterstate: true
  };
}

function getStateRegion(stateCode: string): string {
  for (const [region, states] of Object.entries(REGIONS)) {
    if (states.includes(stateCode)) {
      return region;
    }
  }
  return 'UNKNOWN';
}

function getInternalICMSRate(stateCode: string): number {
  // Taxas de ICMS interno por estado (valores médios)
  const internalRates: Record<string, number> = {
    'AC': 17.0, 'AL': 17.0, 'AP': 18.0, 'AM': 18.0, 'BA': 18.0,
    'CE': 18.0, 'DF': 18.0, 'ES': 17.0, 'GO': 17.0, 'MA': 18.0,
    'MT': 17.0, 'MS': 17.0, 'MG': 18.0, 'PA': 17.0, 'PB': 18.0,
    'PR': 18.0, 'PE': 18.0, 'PI': 18.0, 'RJ': 20.0, 'RN': 18.0,
    'RS': 18.0, 'RO': 17.5, 'RR': 17.0, 'SC': 17.0, 'SP': 18.0,
    'SE': 18.0, 'TO': 18.0
  };
  
  return internalRates[stateCode] || 18.0;
}

function getStateName(stateCode: string): string {
  const state = BRAZILIAN_STATES.find(s => s.code === stateCode);
  return state ? state.name : stateCode;
}

export function calculateTotalTax(params: {
  icmsRate: number;
  ipiRate?: number;
  pisRate?: number;
  cofinsRate?: number;
  issqnRate?: number;
  simplesRate?: number;
}): {
  totalRate: number;
  breakdown: Record<string, number>;
} {
  const {
    icmsRate,
    ipiRate = 0,
    pisRate = 0,
    cofinsRate = 0,
    issqnRate = 0,
    simplesRate = 0
  } = params;

  const breakdown = {
    icms: icmsRate,
    ipi: ipiRate,
    pis: pisRate,
    cofins: cofinsRate,
    issqn: issqnRate,
    simples: simplesRate
  };

  const totalRate = Object.values(breakdown).reduce((sum, rate) => sum + rate, 0);

  return { totalRate, breakdown };
}