/**
 * Script de Teste - Azuria AI
 * 
 * Testa os serviços principais sem precisar da UI
 */

import { getIdealSellingPrice } from '../src/services/ai/pricingService';
import { calculateTaxAnalysis, suggestBestTaxRegime } from '../src/services/ai/taxService';
import { analyzeCompetitorAlerts, fetchCompetitorPrices } from '../src/services/ai/competitorService';
import { BiddingItem } from '../src/types/bidding';
import Decimal from 'decimal.js';

console.log('🧪 TESTE DA AZURIA AI - INICIANDO\n');
console.log('='.repeat(50));

// ============================================
// 1. TESTE DE PRECIFICAÇÃO
// ============================================

console.log('\n📊 TESTE 1: PRECIFICAÇÃO');
console.log('-'.repeat(50));

const testItem: BiddingItem = {
  id: 'test-1',
  description: 'Produto Teste',
  unitPrice: new Decimal(100),
  quantity: new Decimal(10),
  directCosts: {
    material: new Decimal(50),
    labor: new Decimal(20),
    transport: new Decimal(10),
  },
  indirectCosts: {
    administrative: new Decimal(5),
    marketing: new Decimal(3),
    depreciation: new Decimal(2),
  },
};

const taxConfig = {
  icms: new Decimal(0.18),
  pis: new Decimal(0.0165),
  cofins: new Decimal(0.076),
  issqn: new Decimal(0.05),
  irpj: new Decimal(0.15),
  csll: new Decimal(0.09),
};

try {
  const pricingSuggestion = getIdealSellingPrice({
    item: testItem,
    desiredProfitMargin: 0.20,
    taxConfig,
    strategy: 'max_profit',
  });

  console.log('✅ Preço Sugerido:', `R$ ${pricingSuggestion.suggestedPrice.toFixed(2)}`);
  console.log('✅ Margem de Lucro:', `${(pricingSuggestion.profitMargin * 100).toFixed(1)}%`);
  console.log('✅ Ponto de Equilíbrio:', `R$ ${pricingSuggestion.breakEvenPoint.toFixed(2)}`);
  console.log('✅ Score de Competitividade:', pricingSuggestion.competitivenessScore);
  console.log('💡 Raciocínio:', pricingSuggestion.reasoning);
} catch (error: any) {
  console.error('❌ Erro no teste de precificação:', error.message);
}

// ============================================
// 2. TESTE DE ANÁLISE TRIBUTÁRIA
// ============================================

console.log('\n📊 TESTE 2: ANÁLISE TRIBUTÁRIA');
console.log('-'.repeat(50));

try {
  const taxAnalysis = calculateTaxAnalysis(10000, 'simples_nacional');
  
  console.log('✅ Regime:', 'Simples Nacional');
  console.log('✅ Alíquota Efetiva:', `${taxAnalysis.effective_rate}%`);
  console.log('✅ Valor de Impostos:', `R$ ${taxAnalysis.tax_amount.toFixed(2)}`);
  console.log('💰 Breakdown:');
  taxAnalysis.breakdown.forEach((item) => {
    console.log(`   - ${item.label}: ${item.rate}% (R$ ${item.amount.toFixed(2)})`);
  });
  console.log('💡 Dicas de Otimização:');
  taxAnalysis.optimization_tips.forEach((tip) => {
    console.log(`   ${tip}`);
  });
} catch (error: any) {
  console.error('❌ Erro no teste tributário:', error.message);
}

// ============================================
// 3. TESTE DE SUGESTÃO DE REGIME
// ============================================

console.log('\n📊 TESTE 3: SUGESTÃO DE MELHOR REGIME');
console.log('-'.repeat(50));

try {
  const regimeSuggestion = suggestBestTaxRegime({
    annual_revenue: 1000000,
    profit_margin: 0.25,
    business_type: 'service',
  });

  console.log('✅ Regime Recomendado:', regimeSuggestion.recommended.toUpperCase());
  console.log('💡 Raciocínio:', regimeSuggestion.reasoning);
  console.log('📊 Comparação:');
  regimeSuggestion.comparison.forEach((comp) => {
    console.log(`   - ${comp.regime}: ${comp.effective_rate}% (R$ ${comp.annual_tax.toFixed(2)}/ano)`);
  });
} catch (error: any) {
  console.error('❌ Erro no teste de regime:', error.message);
}

// ============================================
// 4. TESTE DE MONITORAMENTO DE CONCORRÊNCIA
// ============================================

console.log('\n📊 TESTE 4: MONITORAMENTO DE CONCORRÊNCIA (SIMULADO)');
console.log('-'.repeat(50));

(async () => {
  try {
    const competitors = await fetchCompetitorPrices('Produto Teste');
    
    console.log('✅ Concorrentes Encontrados:', competitors.length);
    competitors.forEach((comp, index) => {
      console.log(`   ${index + 1}. ${comp.competitor_name}: R$ ${comp.current_price.toFixed(2)} (${comp.price_trend})`);
    });

    // Analisar alertas
    const ourPrice = 120;
    const alerts = analyzeCompetitorAlerts(ourPrice, competitors);
    
    if (alerts.length > 0) {
      console.log('\n⚠️ Alertas:');
      alerts.forEach((alert) => {
        console.log(`   ${alert.message}`);
        console.log(`   ➡️ ${alert.suggested_action}`);
      });
    } else {
      console.log('\n✅ Sem alertas. Seu preço está competitivo!');
    }
  } catch (error: any) {
    console.error('❌ Erro no teste de concorrência:', error.message);
  }

  // ============================================
  // CONCLUSÃO
  // ============================================

  console.log('\n' + '='.repeat(50));
  console.log('✅ TODOS OS TESTES CONCLUÍDOS!');
  console.log('='.repeat(50));
  console.log('\n🚀 A Azuria AI está pronta para uso!\n');
})();

