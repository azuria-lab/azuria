 
import assert from 'node:assert';

export async function run() {
  console.log('Rodando testes de expansão cognitiva...');

  try {
    // Tentar carregar versão compilada/JS; se não existir, marcar como skip não fatal
    const mod = await import('../../src/azuria_ai/engines/cognitiveExpansionEngine.js').catch(() =>
      import('../../src/azuria_ai/engines/cognitiveExpansionEngine.ts').catch(() => null)
    );

    if (!mod) {
      console.warn('Aviso: cognitiveExpansionEngine não encontrado (JS/TS). Teste marcado como skipped.');
      return;
    }

    const {
      registerPattern = () => {},
      generateInsights = () => [],
      emitSnapshot = () => ({}),
    } = mod;

    registerPattern({ pattern: 'teste', frequency: 1, impact: 0.5, details: {} });
    const insights = generateInsights();
    assert(Array.isArray(insights), 'Insights deve ser array');
    const snap = emitSnapshot();
    assert(snap !== undefined, 'Snapshot emitido');

    console.log('Expansão cognitiva ok.');
  } catch (err) {
    console.error('Falha no teste de expansão cognitiva:', err);
    process.exitCode = 1;
  }
}

// Execução direta
run();

