/**
 * Tax Service - Azuria AI
 * 
 * Serviço responsável por cálculos e análises tributárias
 */

import { TaxAnalysis } from '@/types/azuriaAI';

/**
 * Alíquotas por regime tributário
 */
const TAX_RATES = {
  simples_nacional: {
    label: 'Simples Nacional',
    base_rate: 8.0,
    breakdown: [
      { label: 'Simples Nacional', rate: 8.0 },
    ],
  },
  lucro_presumido: {
    label: 'Lucro Presumido',
    breakdown: [
      { label: 'PIS', rate: 0.65 },
      { label: 'COFINS', rate: 3.0 },
      { label: 'IRPJ', rate: 4.8 },
      { label: 'CSLL', rate: 2.88 },
      { label: 'ISS', rate: 5.0 },
    ],
  },
  lucro_real: {
    label: 'Lucro Real',
    breakdown: [
      { label: 'PIS', rate: 1.65 },
      { label: 'COFINS', rate: 7.6 },
      { label: 'IRPJ', rate: 15.0 },
      { label: 'CSLL', rate: 9.0 },
      { label: 'ISS', rate: 5.0 },
    ],
  },
};

/**
 * Calcula análise tributária completa
 */
export function calculateTaxAnalysis(
  revenue: number,
  regime: 'simples_nacional' | 'lucro_presumido' | 'lucro_real'
): TaxAnalysis {
  const config = TAX_RATES[regime];
  
  let breakdown: { label: string; rate: number; amount: number }[] = [];
  let effective_rate = 0;

  if (regime === 'simples_nacional') {
    effective_rate = config.base_rate;
    breakdown = config.breakdown.map((item) => ({
      ...item,
      amount: revenue * (item.rate / 100),
    }));
  } else {
    effective_rate = config.breakdown.reduce((sum, item) => sum + item.rate, 0);
    breakdown = config.breakdown.map((item) => ({
      ...item,
      amount: revenue * (item.rate / 100),
    }));
  }

  const tax_amount = revenue * (effective_rate / 100);

  // Dicas de otimização
  const optimization_tips: string[] = [];

  if (regime === 'simples_nacional') {
    optimization_tips.push(
      '💡 Mantenha faturamento anual abaixo de R$ 4,8 milhões para não perder o benefício'
    );
    optimization_tips.push(
      '📊 Simples Nacional é vantajoso para serviços com alta margem'
    );
  }

  if (regime === 'lucro_presumido') {
    optimization_tips.push(
      '💡 Considere Simples Nacional se faturamento < R$ 4,8 mi/ano'
    );
    optimization_tips.push(
      '📊 Lucro Presumido é bom para margens baixas e faturamento médio'
    );
  }

  if (regime === 'lucro_real') {
    optimization_tips.push(
      '⚠️ Regime mais complexo - garanta contabilidade precisa'
    );
    optimization_tips.push(
      '💡 Vantajoso apenas se lucro real < 32% do faturamento'
    );
  }

  // Comparação com regime alternativo
  let alternative_regime_comparison;

  if (regime === 'simples_nacional' && revenue > 0) {
    const lp_rate = TAX_RATES.lucro_presumido.breakdown.reduce((s, i) => s + i.rate, 0);
    const lp_amount = revenue * (lp_rate / 100);
    const savings = tax_amount - lp_amount;

    if (savings < 0) {
      alternative_regime_comparison = {
        regime: 'Lucro Presumido',
        rate: lp_rate,
        savings: Math.abs(savings),
        recommendation: `💡 No Lucro Presumido você economizaria R$ ${Math.abs(savings).toFixed(2)} (${lp_rate.toFixed(2)}% vs ${effective_rate}%)`,
      };
    }
  }

  if (regime === 'lucro_presumido' && revenue > 0) {
    const sn_rate = TAX_RATES.simples_nacional.base_rate;
    const sn_amount = revenue * (sn_rate / 100);
    const savings = tax_amount - sn_amount;

    if (savings > 0) {
      alternative_regime_comparison = {
        regime: 'Simples Nacional',
        rate: sn_rate,
        savings,
        recommendation: `💡 No Simples Nacional você economizaria R$ ${savings.toFixed(2)} (${sn_rate}% vs ${effective_rate.toFixed(2)}%)`,
      };
    }
  }

  return {
    regime,
    effective_rate: Math.round(effective_rate * 100) / 100,
    tax_amount: Math.round(tax_amount * 100) / 100,
    breakdown,
    optimization_tips,
    alternative_regime_comparison,
  };
}

/**
 * Sugere regime tributário ideal
 */
export function suggestBestTaxRegime(params: {
  annual_revenue: number;
  profit_margin: number;
  business_type: 'product' | 'service' | 'both';
}): {
  recommended: 'simples_nacional' | 'lucro_presumido' | 'lucro_real';
  reasoning: string;
  comparison: {
    regime: string;
    effective_rate: number;
    annual_tax: number;
  }[];
} {
  const { annual_revenue, profit_margin } = params;

  const sn_rate = 8.0;
  const lp_rate = 16.33;
  const lr_rate = 38.25;

  const sn_tax = annual_revenue * (sn_rate / 100);
  const lp_tax = annual_revenue * (lp_rate / 100);
  const lr_tax = annual_revenue * profit_margin * (lr_rate / 100);

  const comparison = [
    { regime: 'Simples Nacional', effective_rate: sn_rate, annual_tax: sn_tax },
    { regime: 'Lucro Presumido', effective_rate: lp_rate, annual_tax: lp_tax },
    { regime: 'Lucro Real', effective_rate: lr_rate, annual_tax: lr_tax },
  ].sort((a, b) => a.annual_tax - b.annual_tax);

  let recommended: 'simples_nacional' | 'lucro_presumido' | 'lucro_real' = 'simples_nacional';
  let reasoning = '';

  if (annual_revenue > 4800000) {
    recommended = 'lucro_presumido';
    reasoning = 'Faturamento acima do limite do Simples Nacional (R$ 4,8 mi/ano)';
  } else if (sn_tax < lp_tax && sn_tax < lr_tax) {
    recommended = 'simples_nacional';
    reasoning = `Simples Nacional oferece menor carga tributária: R$ ${sn_tax.toFixed(2)}/ano vs R$ ${lp_tax.toFixed(2)} (LP)`;
  } else if (lp_tax < lr_tax) {
    recommended = 'lucro_presumido';
    reasoning = `Lucro Presumido é mais vantajoso: R$ ${lp_tax.toFixed(2)}/ano vs R$ ${sn_tax.toFixed(2)} (SN)`;
  } else {
    recommended = 'lucro_real';
    reasoning = 'Lucro Real é indicado pois sua margem de lucro é baixa';
  }

  return {
    recommended,
    reasoning,
    comparison,
  };
}

/**
 * Explica diferenças entre regimes
 */
export function explainTaxRegime(regime: string): string {
  const explanations: Record<string, string> = {
    simples_nacional: `📋 **Simples Nacional:**

✅ Mais simples e prático
✅ Uma única guia de impostos (DAS)
✅ Alíquota progressiva (4% a 33%)
✅ Ideal para faturamento até R$ 4,8 mi/ano

⚠️ Limitações:
• Não pode importar produtos
• Algumas atividades não podem optar
• Margem de lucro alta pode não compensar`,

    lucro_presumido: `📋 **Lucro Presumido:**

✅ Menos burocracia que Lucro Real
✅ Presume margem de 8% a 32% de lucro
✅ Alíquota total ~16,33%
✅ Bom para margens baixas

⚠️ Limitações:
• Faturamento máximo: R$ 78 milhões/ano
• Mais guias que Simples Nacional
• Exige contador experiente`,

    lucro_real: `📋 **Lucro Real:**

✅ Tributa lucro efetivo (não presumido)
✅ Vantajoso se lucro < 32% do faturamento
✅ Pode compensar prejuízos anteriores
✅ Obrigatório para grandes empresas

⚠️ Desvantagens:
• Alta complexidade contábil
• Mais auditorias fiscais
• Custos contábeis elevados`,
  };

  return explanations[regime] || 'Regime não reconhecido.';
}
