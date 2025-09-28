#!/usr/bin/env node
/**
 * Script para executar testes de integração com configurações otimizadas de memória
 * Usa NODE_OPTIONS para aumentar o heap disponível quando necessário
 */

import { spawn } from 'child_process';
import process from 'process';

// Configurações de memória otimizadas
const NODE_OPTIONS = [
  '--max-old-space-size=4096',  // 4GB heap máximo
  '--max-semi-space-size=128',   // Otimização do garbage collector
  '--expose-gc',                 // Permitir garbage collection manual
].join(' ');

// Adicionar às variáveis de ambiente existentes
const env = {
  ...process.env,
  NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} ${NODE_OPTIONS}`.trim(),
  // Configurações específicas do Vitest
  VITEST_POOL_THREADS: '1',
  VITEST_MAX_THREADS: '1',
  VITEST_MIN_THREADS: '1'
};

// Argumentos para o comando vitest
const args = [
  'run',
  '--pool=threads',
  '--maxWorkers=1',
  '--logHeapUsage',
  '--reporter=verbose',
  'src/__tests__/integration'
];

console.log('🚀 Executando testes de integração com configurações otimizadas de memória...');
console.log(`📊 Heap máximo: 4GB`);
console.log(`⚙️  Workers: 1 (single-threaded)`);
console.log('');

// Executar vitest com configurações otimizadas
const child = spawn('npx', ['vitest', ...args], {
  env,
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('✅ Testes de integração concluídos com sucesso!');
  } else {
    console.log(`❌ Testes falharam com código: ${code}`);
    process.exit(code);
  }
});

child.on('error', (error) => {
  console.error('❌ Erro ao executar testes:', error.message);
  process.exit(1);
});