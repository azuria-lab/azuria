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

/**
 * Resultado do cálculo de ICMS
 * 
 * Representa os detalhes de uma operação fiscal ICMS (Imposto sobre Circulação 
 * de Mercadorias e Serviços) entre dois estados brasileiros.
 * 
 * @interface ICMSCalculation
 * 
 * @property {number} rate - Taxa de ICMS aplicável (7% ou 12% para interestadual)
 * @property {number} internalRate - Taxa de ICMS interna do estado de destino (17%-20%)
 * @property {string} ruleDescription - Descrição da regra fiscal aplicada
 * @property {boolean} isInterstate - Indica se é operação interestadual (true) ou interna (false)
 * 
 * @example
 * ```typescript
 * const calculation: ICMSCalculation = {
 *   rate: 7.0,
 *   internalRate: 18.0,
 *   ruleDescription: 'ICMS interestadual Sul/Sudeste → Norte/Nordeste',
 *   isInterstate: true
 * };
 * ```
 * 
 * @remarks
 * **Taxas interestaduais**:
 * - 7%: Sul/Sudeste → Norte/Nordeste/Centro-Oeste/ES
 * - 12%: Demais casos
 * 
 * **Taxas internas**: Variam por estado (17%-20%)
 */
export interface ICMSCalculation {
  rate: number;
  internalRate: number;
  ruleDescription: string;
  isInterstate: boolean;
}

/**
 * Calcula a taxa de ICMS aplicável entre dois estados brasileiros
 * 
 * Determina a alíquota de ICMS com base nas regras fiscais da legislação brasileira,
 * considerando se a operação é interna (mesmo estado) ou interestadual.
 * 
 * @param {string} originState - Código UF do estado de origem (ex: 'SP', 'RJ')
 * @param {string} destinationState - Código UF do estado de destino
 * 
 * @returns {ICMSCalculation} Detalhes da operação fiscal com taxas e descrição
 * 
 * @example
 * ```typescript
 * // Operação interna (mesmo estado)
 * const internal = calculateICMS('SP', 'SP');
 * console.log(internal);
 * // {
 * //   rate: 18.0,
 * //   internalRate: 18.0,
 * //   ruleDescription: 'ICMS interno do estado São Paulo',
 * //   isInterstate: false
 * // }
 * 
 * // Operação interestadual - Sul/Sudeste → Norte/Nordeste
 * const interstate7 = calculateICMS('SP', 'BA');
 * console.log(interstate7);
 * // {
 * //   rate: 7.0,
 * //   internalRate: 18.0,
 * //   ruleDescription: 'ICMS interestadual Sul/Sudeste → Norte/Nordeste/Centro-Oeste/ES',
 * //   isInterstate: true
 * // }
 * 
 * // Operação interestadual - demais casos (12%)
 * const interstate12 = calculateICMS('BA', 'PE');
 * console.log(interstate12);
 * // {
 * //   rate: 12.0,
 * //   internalRate: 18.0,
 * //   ruleDescription: 'ICMS interestadual - demais casos',
 * //   isInterstate: true
 * // }
 * ```
 * 
 * @remarks
 * **Regras fiscais**:
 * - **Operação interna**: Taxa do estado (17%-20%)
 * - **Interestadual 7%**: Sul/Sudeste → Norte/Nordeste/Centro-Oeste/ES
 * - **Interestadual 12%**: Todos os demais casos
 * 
 * **Estados por região**:
 * - Sul: RS, SC, PR
 * - Sudeste: SP, RJ, MG
 * - Norte: AC, RO, AM, RR, PA, AP, TO
 * - Nordeste: BA, SE, AL, PE, PB, RN, CE, PI, MA
 * - Centro-Oeste: MT, MS, GO, DF
 * - Especial: ES (sempre 7% quando destino)
 */
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

/**
 * Calcula a carga tributária total somando múltiplos impostos brasileiros
 * 
 * Agrega diferentes tributos (ICMS, IPI, PIS, COFINS, ISSQN, Simples Nacional)
 * para determinar a carga fiscal total e o detalhamento por imposto.
 * 
 * @param {object} params - Parâmetros dos impostos
 * @param {number} params.icmsRate - Taxa de ICMS (obrigatório)
 * @param {number} [params.ipiRate=0] - Taxa de IPI (Imposto sobre Produtos Industrializados)
 * @param {number} [params.pisRate=0] - Taxa de PIS (Programa de Integração Social)
 * @param {number} [params.cofinsRate=0] - Taxa de COFINS (Contribuição para Financiamento da Seguridade Social)
 * @param {number} [params.issqnRate=0] - Taxa de ISSQN (Imposto sobre Serviços de Qualquer Natureza)
 * @param {number} [params.simplesRate=0] - Taxa do Simples Nacional
 * 
 * @returns {object} Resultado com taxa total e breakdown de cada imposto
 * @returns {number} returns.totalRate - Soma de todas as taxas
 * @returns {Record<string, number>} returns.breakdown - Detalhamento por imposto
 * 
 * @example
 * ```typescript
 * // Carga tributária completa
 * const fullTax = calculateTotalTax({
 *   icmsRate: 18.0,
 *   ipiRate: 10.0,
 *   pisRate: 1.65,
 *   cofinsRate: 7.6,
 *   issqnRate: 0,
 *   simplesRate: 0
 * });
 * console.log(fullTax);
 * // {
 * //   totalRate: 37.25,
 * //   breakdown: {
 * //     icms: 18.0,
 * //     ipi: 10.0,
 * //     pis: 1.65,
 * //     cofins: 7.6,
 * //     issqn: 0,
 * //     simples: 0
 * //   }
 * // }
 * 
 * // Apenas ICMS
 * const icmsOnly = calculateTotalTax({ icmsRate: 12.0 });
 * console.log(icmsOnly);
 * // {
 * //   totalRate: 12.0,
 * //   breakdown: { icms: 12.0, ipi: 0, pis: 0, cofins: 0, issqn: 0, simples: 0 }
 * // }
 * 
 * // Simples Nacional (substitui outros impostos)
 * const simples = calculateTotalTax({
 *   icmsRate: 0,
 *   simplesRate: 6.0
 * });
 * console.log(simples);
 * // { totalRate: 6.0, breakdown: { ... simples: 6.0 } }
 * ```
 * 
 * @remarks
 * **Tributos brasileiros**:
 * - **ICMS**: Estadual, incide sobre circulação de mercadorias (17%-20%)
 * - **IPI**: Federal, produtos industrializados (0%-50%)
 * - **PIS**: Federal, financiamento social (~1.65%)
 * - **COFINS**: Federal, seguridade social (~7.6%)
 * - **ISSQN**: Municipal, serviços (2%-5%)
 * - **Simples Nacional**: Regime simplificado para pequenas empresas (4%-33%)
 * 
 * **Observações**:
 * - No Simples Nacional, outros impostos são zero (regime unificado)
 * - Taxas padrão são zero se não informadas
 */
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