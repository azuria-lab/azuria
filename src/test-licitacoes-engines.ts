/**
 * Script de teste para validar engines de licitações
 * 
 * Execute com:
 * npm run dev (e importe este arquivo em qualquer componente)
 * ou
 * Abra o console do navegador e veja os logs
 */

/* eslint-disable no-console */

import ragEngine from '@/azuria_ai/engines/ragEngine';
import multimodalEngine from '@/azuria_ai/engines/multimodalEngine';
import whatIfSimulator from '@/azuria_ai/engines/whatIfSimulator';
import xaiEngine from '@/azuria_ai/engines/xaiEngine';
import portalMonitorAgent from '@/azuria_ai/agents/portalMonitorAgent';

/**
 * Testa se a API key do Gemini está configurada
 */
function testGeminiAPIKey() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ VITE_GEMINI_API_KEY não está configurada!');
    return false;
  }
  
  if (apiKey.startsWith('AIza')) {
    console.log('✅ Gemini API Key encontrada:', apiKey.substring(0, 10) + '...');
    return true;
  }
  
  console.warn('⚠️ API Key não parece válida (deveria começar com AIza)');
  return false;
}

/**
 * Testa inicialização dos engines
 */
async function testEnginesInitialization() {
  console.log('\n🔧 Testando inicialização dos engines...\n');
  
  try {
    // RAG Engine
    ragEngine.initRAGEngine();
    const ragStats = ragEngine.getRAGStats();
    console.log('✅ RAG Engine:', ragStats);
    
    // Multimodal Engine
    multimodalEngine.initMultimodalEngine();
    const multimodalStats = multimodalEngine.getMultimodalStats();
    console.log('✅ Multimodal Engine:', multimodalStats);
    
    // What-If Simulator
    whatIfSimulator.initWhatIfSimulator();
    const simulatorStats = whatIfSimulator.getSimulatorStats();
    console.log('✅ What-If Simulator:', simulatorStats);
    
    // XAI Engine
    xaiEngine.initXAIEngine();
    const xaiStats = xaiEngine.getXAIStats();
    console.log('✅ XAI Engine:', xaiStats);
    
    console.log('\n✅ Todos os engines foram inicializados com sucesso!\n');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar engines:', error);
    return false;
  }
}

/**
 * Testa simulação Monte Carlo
 */
async function testMonteCarloSimulation() {
  console.log('\n🎲 Testando simulação Monte Carlo...\n');
  
  try {
    const result = await whatIfSimulator.runMonteCarloSimulation(
      [
        {
          name: 'custo_material',
          baseValue: 50000,
          distribution: 'normal',
          params: { mean: 50000, stdDev: 2500 },
        },
        {
          name: 'custo_mao_obra',
          baseValue: 30000,
          distribution: 'uniform',
          params: { min: 28000, max: 32000 },
        },
      ],
      (values) => {
        const custoTotal = values.custo_material + values.custo_mao_obra;
        const bdi = 0.25; // 25%
        return custoTotal * (1 + bdi);
      },
      {
        iterations: 1000,
        seed: 12345,
        confidenceLevels: [0.95],
      }
    );
    
    console.log('📊 Resultado da simulação:');
    console.log('  - Média:', result.stats.mean.toFixed(2));
    console.log('  - Mediana:', result.stats.median.toFixed(2));
    console.log('  - Desvio padrão:', result.stats.stdDev.toFixed(2));
    console.log('  - Intervalo 95%:', result.confidenceIntervals['95%']);
    console.log('  - Percentil 10%:', result.percentiles.p10.toFixed(2));
    console.log('  - Percentil 90%:', result.percentiles.p90.toFixed(2));
    
    console.log('\n✅ Simulação Monte Carlo executada com sucesso!\n');
    return true;
  } catch (error) {
    console.error('❌ Erro ao executar simulação:', error);
    return false;
  }
}

/**
 * Testa explicação XAI de BDI
 */
async function testXAIExplanation() {
  console.log('\n🧠 Testando explicação XAI...\n');
  
  try {
    const explanation = await xaiEngine.explainBDICalculation(
      {
        administracaoCentral: 3.5,
        despesasFinanceiras: 1.2,
        lucro: 8,
        garantias: 0.4,
        impostos: 6.25,
        risco: 2.5,
      },
      21.85
    );
    
    console.log('📝 Explicação do BDI:');
    console.log('  - Racionalidade:', explanation.rationale);
    console.log('  - Principais fatores:');
    explanation.topFactors.forEach((factor, index) => {
      console.log(`    ${index + 1}. ${factor.name}: ${factor.value}% (importância: ${(factor.importance * 100).toFixed(1)}%)`);
    });
    console.log('  - Base legal:', explanation.legalBasis.map(lb => lb.source).join(', '));
    
    console.log('\n✅ Explicação XAI gerada com sucesso!\n');
    return true;
  } catch (error) {
    console.error('❌ Erro ao gerar explicação:', error);
    return false;
  }
}

/**
 * Testa estatísticas do portal monitor (sem iniciar de fato)
 */
function testPortalMonitorStats() {
  console.log('\n📡 Testando estatísticas do Portal Monitor...\n');
  
  try {
    const stats = portalMonitorAgent.getPortalMonitorStats();
    console.log('📊 Stats do Portal Monitor:');
    console.log('  - Rodando:', stats.isRunning);
    console.log('  - Portais monitorados:', stats.portaisMonitorados);
    console.log('  - Editais detectados:', stats.editaisDetectados);
    console.log('  - Alertas gerados:', stats.alertasGerados);
    
    console.log('\n✅ Portal Monitor stats obtidas com sucesso!\n');
    return true;
  } catch (error) {
    console.error('❌ Erro ao obter stats:', error);
    return false;
  }
}

/**
 * Executa todos os testes
 */
export async function runAllTests() {
  console.log('🚀 ========================================');
  console.log('🚀 Teste dos Engines de Licitações');
  console.log('🚀 ========================================\n');
  
  const results = {
    apiKey: false,
    engines: false,
    monteCarlo: false,
    xai: false,
    portalMonitor: false,
  };
  
  // Teste 1: API Key
  results.apiKey = testGeminiAPIKey();
  
  if (!results.apiKey) {
    console.error('\n❌ Testes abortados: Gemini API Key não configurada\n');
    return results;
  }
  
  // Teste 2: Inicialização
  results.engines = await testEnginesInitialization();
  
  if (!results.engines) {
    console.error('\n❌ Testes abortados: Engines não inicializaram\n');
    return results;
  }
  
  // Teste 3: Monte Carlo
  results.monteCarlo = await testMonteCarloSimulation();
  
  // Teste 4: XAI
  results.xai = await testXAIExplanation();
  
  // Teste 5: Portal Monitor Stats
  results.portalMonitor = testPortalMonitorStats();
  
  // Resumo
  console.log('\n📊 ========================================');
  console.log('📊 Resumo dos Testes');
  console.log('📊 ========================================\n');
  
  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;
  
  console.log(`✅ Testes passados: ${passedTests}/${totalTests}`);
  console.log(`${passedTests === totalTests ? '🎉' : '⚠️'} Status: ${passedTests === totalTests ? 'SUCESSO TOTAL' : 'PARCIAL'}\n`);
  
  return results;
}

// Auto-execução se em DEV mode
if (import.meta.env.DEV) {
  console.log('🔍 Script de teste carregado. Execute runAllTests() no console para testar.');
  
  // Disponibiliza globalmente
  (globalThis as unknown as Record<string, unknown>).testLicitacoesEngines = runAllTests;
  
  console.log('💡 Dica: Digite testLicitacoesEngines() no console do navegador');
}

export default {
  testGeminiAPIKey,
  testEnginesInitialization,
  testMonteCarloSimulation,
  testXAIExplanation,
  testPortalMonitorStats,
  runAllTests,
};
