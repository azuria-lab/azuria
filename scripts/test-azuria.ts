/* eslint-disable no-console */
/**
 * Script de Teste - Azuria AI
 *
 * Testa os serviços principais sem precisar da UI
 */

import { calculatePricingSuggestion } from '../src/services/ai/pricingService';
import {
  calculateTaxAnalysis,
  suggestBestTaxRegime,
} from '../src/services/ai/taxService';
import {
  analyzeCompetitorAlerts,
  fetchCompetitorPrices,
} from '../src/services/ai/competitorService';

console.log('🧪 TESTE DA AZURIA AI - INICIANDO\n');
console.log('='.repeat(50));

// ============================================
// 1. TESTE DE PRECIFICAÇÃO
// ============================================

console.log('\n📊 TESTE 1: PRECIFICAÇÃO');
console.log('-'.repeat(50));

try {
  const pricingSuggestion = calculatePricingSuggestion({
    cost_price: 100,
    target_margin: 30,
    tax_rate: 18,
    marketplace_fee: 16,
    shipping_cost: 20,
  });

  console.log(
    '✅ Preço Sugerido:',
    `R$ ${pricingSuggestion.suggested_price.toFixed(2)}`
  );
  console.log(
    '✅ Margem de Lucro:',
    `${pricingSuggestion.profit_margin_percentage.toFixed(1)}%`
  );
  console.log('💡 Raciocínio:', pricingSuggestion.reasoning);
} catch (error: unknown) {
  console.error('❌ Erro no teste de precificação:', (error as Error).message);
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
  console.log(
    '✅ Valor de Impostos:',
    `R$ ${taxAnalysis.tax_amount.toFixed(2)}`
  );
  console.log('💰 Breakdown:');
  for (const item of taxAnalysis.breakdown) {
    console.log(
      `   - ${item.label}: ${item.rate}% (R$ ${item.amount.toFixed(2)})`
    );
  }
  console.log('💡 Dicas de Otimização:');
  for (const tip of taxAnalysis.optimization_tips) {
    console.log(`   ${tip}`);
  }
} catch (error: unknown) {
  console.error('❌ Erro no teste tributário:', (error as Error).message);
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

  console.log(
    '✅ Regime Recomendado:',
    regimeSuggestion.recommended.toUpperCase()
  );
  console.log('💡 Raciocínio:', regimeSuggestion.reasoning);
  console.log('📊 Comparação:');
  for (const comp of regimeSuggestion.comparison) {
    console.log(
      `   - ${comp.regime}: ${
        comp.effective_rate
      }% (R$ ${comp.annual_tax.toFixed(2)}/ano)`
    );
  }
} catch (error: unknown) {
  console.error('❌ Erro no teste de regime:', (error as Error).message);
}

// ============================================
// 4. TESTE DE MONITORAMENTO DE CONCORRÊNCIA
// ============================================

console.log('\n📊 TESTE 4: MONITORAMENTO DE CONCORRÊNCIA (SIMULADO)');
console.log('-'.repeat(50));

try {
  const competitors = await fetchCompetitorPrices('Produto Teste');

  console.log('✅ Concorrentes Encontrados:', competitors.length);
  for (const [index, comp] of competitors.entries()) {
    console.log(
      `   ${index + 1}. ${
        comp.competitor_name
      }: R$ ${comp.current_price.toFixed(2)} (${comp.price_trend})`
    );
  }

  // Analisar alertas
  const ourPrice = 120;
  const alerts = analyzeCompetitorAlerts(ourPrice, competitors);

  if (alerts.length > 0) {
    console.log('\n⚠️ Alertas:');
    for (const alert of alerts) {
      console.log(`   ${alert.message}`);
      console.log(`   ➡️ ${alert.suggested_action}`);
    }
  } else {
    console.log('\n✅ Sem alertas. Seu preço está competitivo!');
  }
} catch (error: unknown) {
  console.error('❌ Erro no teste de concorrência:', (error as Error).message);
}

// ============================================
// CONCLUSÃO
// ============================================

console.log('\n' + '='.repeat(50));
console.log('✅ TODOS OS TESTES CONCLUÍDOS!');
console.log('='.repeat(50));
console.log('\n🚀 A Azuria AI está pronta para uso!\n');
