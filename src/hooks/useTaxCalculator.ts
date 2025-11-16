import { useState } from 'react';
import {
  getAnexoById,
  LUCRO_PRESUMIDO_DATA,
  MEI_DATA,
  SIMPLES_NACIONAL_ANEXOS,
  SimplesNacionalAnexo,
} from '@/data/taxRegimes';

export interface TaxCalculationInput {
  monthlyRevenue: number;
  annualRevenue: number;
  businessType: string;
  regime?: string; // 'mei', 'simples', 'lucro_presumido', 'lucro_real'
  anexoId?: string;
}

export interface TaxCalculationResult {
  regime: string;
  regimeName: string;
  icon: string;
  
  // Valores calculados
  effectiveRate: number;           // Alíquota efetiva (%)
  monthlyTax: number;              // Imposto mensal (R$)
  annualTax: number;               // Imposto anual (R$)
  
  // Detalhamento
  faixa?: number;
  aliquotaNominal?: number;
  deducao?: number;
  
  // Breakdown de impostos (quando aplicável)
  breakdown?: {
    irpj?: number;
    csll?: number;
    cofins?: number;
    pis?: number;
    cpp?: number;
    icms?: number;
    iss?: number;
    ipi?: number;
  };
  
  // Alertas e avisos
  alerts?: {
    type: 'warning' | 'info' | 'success';
    message: string;
  }[];
  
  // Recomendações
  recommendations?: string[];
}

export const useTaxCalculator = () => {
  const [isCalculating, setIsCalculating] = useState(false);

  /**
   * Calcula Simples Nacional
   */
  const calculateSimplesNacional = (
    anexo: SimplesNacionalAnexo,
    annualRevenue: number,
    monthlyRevenue: number
  ): TaxCalculationResult => {
    // Encontrar faixa correta
    const faixa = anexo.faixas.find(
      f => annualRevenue >= f.revenueFrom && annualRevenue < f.revenueTo
    );

    if (!faixa) {
      return {
        regime: 'simples',
        regimeName: anexo.name,
        icon: anexo.icon,
        effectiveRate: 0,
        monthlyTax: 0,
        annualTax: 0,
        alerts: [
          {
            type: 'warning',
            message: 'Faturamento fora do limite do Simples Nacional (R$ 4.8 milhões/ano)',
          },
        ],
      };
    }

    // Cálculo da alíquota efetiva
    // Fórmula: ((RBT12 × Aliq) - PD) / RBT12
    const effectiveRate = ((annualRevenue * faixa.aliquota / 100) - faixa.deducao) / annualRevenue * 100;
    
    const monthlyTax = monthlyRevenue * (effectiveRate / 100);
    const annualTax = annualRevenue * (effectiveRate / 100);

    // Alertas
    const alerts: TaxCalculationResult['alerts'] = [];
    
    // Alerta de proximidade de mudança de faixa
    const proximoLimite = faixa.revenueTo;
    const percentualProximo = (annualRevenue / proximoLimite) * 100;
    
    if (percentualProximo > 85 && faixa.faixa < 6) {
      const proxFaixa = anexo.faixas[faixa.faixa]; // próxima faixa
      alerts.push({
        type: 'warning',
        message: `⚠️ Você está a ${(100 - percentualProximo).toFixed(1)}% de mudar para a faixa ${proxFaixa.faixa} (alíquota ${proxFaixa.aliquota}%)`,
      });
    }

    // Alerta se ultrapassou limite do Simples
    if (annualRevenue > 4800000) {
      alerts.push({
        type: 'warning',
        message: '⚠️ Faturamento acima do limite do Simples Nacional. Considere Lucro Presumido ou Real.',
      });
    }

    return {
      regime: 'simples',
      regimeName: anexo.name,
      icon: anexo.icon,
      effectiveRate: Number(effectiveRate.toFixed(2)),
      monthlyTax: Number(monthlyTax.toFixed(2)),
      annualTax: Number(annualTax.toFixed(2)),
      faixa: faixa.faixa,
      aliquotaNominal: faixa.aliquota,
      deducao: faixa.deducao,
      alerts,
    };
  };

  /**
   * Calcula MEI
   */
  const calculateMEI = (
    monthlyRevenue: number,
    annualRevenue: number,
    businessType: string
  ): TaxCalculationResult => {
    const alerts: TaxCalculationResult['alerts'] = [];

    // Verificar limite
    if (annualRevenue > MEI_DATA.revenueLimit) {
      alerts.push({
        type: 'warning',
        message: `⚠️ Faturamento acima do limite do MEI (R$ ${MEI_DATA.revenueLimit.toLocaleString('pt-BR')}). Necessário migrar para outro regime.`,
      });
    }

    // Determinar tipo de atividade
    let monthlyTax = MEI_DATA.monthlyTax.servicos; // padrão
    
    if (businessType === 'comercio') {
      monthlyTax = MEI_DATA.monthlyTax.comercio;
    } else if (businessType === 'comercio_servicos') {
      monthlyTax = MEI_DATA.monthlyTax.comercioServicos;
    }

    const annualTax = monthlyTax * 12;
    const effectiveRate = annualRevenue > 0 ? (annualTax / annualRevenue) * 100 : 0;

    // Alerta de proximidade do limite
    const percentualLimite = (annualRevenue / MEI_DATA.revenueLimit) * 100;
    if (percentualLimite > 80) {
      alerts.push({
        type: 'info',
        message: `💡 Você já utilizou ${percentualLimite.toFixed(1)}% do limite anual do MEI. Planeje a transição para outro regime.`,
      });
    }

    return {
      regime: 'mei',
      regimeName: MEI_DATA.name,
      icon: MEI_DATA.icon,
      effectiveRate: Number(effectiveRate.toFixed(2)),
      monthlyTax: Number(monthlyTax.toFixed(2)),
      annualTax: Number(annualTax.toFixed(2)),
      alerts,
      recommendations: MEI_DATA.benefits,
    };
  };

  /**
   * Calcula Lucro Presumido
   */
  const calculateLucroPresumido = (
    monthlyRevenue: number,
    annualRevenue: number,
    businessType: string
  ): TaxCalculationResult => {
    const alerts: TaxCalculationResult['alerts'] = [];

    // Margem de lucro presumido
    let presumedMargin = LUCRO_PRESUMIDO_DATA.presumedProfitMargin.servicos;
    
    if (businessType === 'comercio' || businessType === 'industria') {
      presumedMargin = LUCRO_PRESUMIDO_DATA.presumedProfitMargin.comercio;
    }

    // Cálculo dos impostos
    const presumedProfit = annualRevenue * (presumedMargin / 100);
    
    // IRPJ: 15% sobre lucro presumido + 10% sobre lucro > 240k/ano
    const irpj = presumedProfit * 0.15;
    const irpjAdditional = Math.max(0, (presumedProfit - 240000) * 0.1);
    
    // CSLL: 9% sobre lucro presumido
    const csll = presumedProfit * 0.09;
    
    // PIS e COFINS sobre receita bruta
    const pis = annualRevenue * 0.0065;
    const cofins = annualRevenue * 0.03;

    const totalTax = irpj + irpjAdditional + csll + pis + cofins;
    const effectiveRate = (totalTax / annualRevenue) * 100;
    const monthlyTax = totalTax / 12;

    // Breakdown
    const breakdown = {
      irpj: Number((irpj / annualRevenue * 100).toFixed(2)),
      csll: Number((csll / annualRevenue * 100).toFixed(2)),
      pis: Number((pis / annualRevenue * 100).toFixed(2)),
      cofins: Number((cofins / annualRevenue * 100).toFixed(2)),
    };

    // Alertas
    if (annualRevenue > LUCRO_PRESUMIDO_DATA.revenueLimit) {
      alerts.push({
        type: 'warning',
        message: '⚠️ Faturamento acima do limite do Lucro Presumido. Necessário migrar para Lucro Real.',
      });
    }

    return {
      regime: 'lucro_presumido',
      regimeName: LUCRO_PRESUMIDO_DATA.name,
      icon: LUCRO_PRESUMIDO_DATA.icon,
      effectiveRate: Number(effectiveRate.toFixed(2)),
      monthlyTax: Number(monthlyTax.toFixed(2)),
      annualTax: Number(totalTax.toFixed(2)),
      breakdown,
      alerts,
    };
  };

  /**
   * Calcula todos os regimes e compara
   */
  const calculateAllRegimes = (input: TaxCalculationInput): TaxCalculationResult[] => {
    setIsCalculating(true);
    
    const results: TaxCalculationResult[] = [];

    try {
      // MEI
      if (input.annualRevenue <= MEI_DATA.revenueLimit) {
        results.push(calculateMEI(input.monthlyRevenue, input.annualRevenue, input.businessType));
      }

      // Simples Nacional - todos os anexos aplicáveis
      for (const anexo of SIMPLES_NACIONAL_ANEXOS) {
        if (input.annualRevenue <= 4800000) {
          results.push(calculateSimplesNacional(anexo, input.annualRevenue, input.monthlyRevenue));
        }
      }

      // Lucro Presumido
      results.push(calculateLucroPresumido(input.monthlyRevenue, input.annualRevenue, input.businessType));

      // Ordenar por menor carga tributária
      results.sort((a, b) => a.monthlyTax - b.monthlyTax);

      return results;
    } finally {
      setIsCalculating(false);
    }
  };

  /**
   * Calcula um regime específico
   */
  const calculateSpecificRegime = (input: TaxCalculationInput): TaxCalculationResult | null => {
    setIsCalculating(true);

    try {
      if (input.regime === 'mei') {
        return calculateMEI(input.monthlyRevenue, input.annualRevenue, input.businessType);
      }

      if (input.regime === 'simples' && input.anexoId) {
        const anexo = getAnexoById(input.anexoId);
        if (anexo) {
          return calculateSimplesNacional(anexo, input.annualRevenue, input.monthlyRevenue);
        }
      }

      if (input.regime === 'lucro_presumido') {
        return calculateLucroPresumido(input.monthlyRevenue, input.annualRevenue, input.businessType);
      }

      return null;
    } finally {
      setIsCalculating(false);
    }
  };

  return {
    isCalculating,
    calculateAllRegimes,
    calculateSpecificRegime,
    calculateSimplesNacional,
    calculateMEI,
    calculateLucroPresumido,
  };
};
