#!/usr/bin/env node

/**
 * Script para encontrar arquivos grandes que precisam de refatoração
 * Uso: node scripts/find-large-files.mjs
 */

import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

const THRESHOLD_LINES = 300;
const CRITICAL_LINES = 500;

console.log('🔍 Analisando tamanho dos arquivos...\n');

const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/*.test.ts', '**/*.test.tsx', '**/*.d.ts']
});

const results = files
  .map(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n').length;
    const size = fs.statSync(file).size;
    
    return {
      file: file.replace('src/', ''),
      lines,
      sizeKB: (size / 1024).toFixed(2),
      status: lines > CRITICAL_LINES ? '🔴 CRÍTICO' : 
              lines > THRESHOLD_LINES ? '🟡 ALTO' : '🟢 OK'
    };
  })
  .filter(f => f.lines > THRESHOLD_LINES)
  .sort((a, b) => b.lines - a.lines);

if (results.length === 0) {
  console.log('✅ Nenhum arquivo grande encontrado! Todos os arquivos estão dentro do limite.');
  process.exit(0);
}

console.log(`Encontrados ${results.length} arquivos acima de ${THRESHOLD_LINES} linhas:\n`);
console.table(results);

// Estatísticas
const critical = results.filter(r => r.status === '🔴 CRÍTICO');
const high = results.filter(r => r.status === '🟡 ALTO');

console.log('\n📊 Resumo:');
console.log(`   🔴 Críticos (>${CRITICAL_LINES} linhas): ${critical.length}`);
console.log(`   🟡 Altos (>${THRESHOLD_LINES} linhas): ${high.length}`);
console.log(`   📝 Total de linhas em arquivos grandes: ${results.reduce((sum, r) => sum + r.lines, 0)}`);

// Salvar relatório
const reportPath = 'analysis/large-files-report.json';
fs.mkdirSync('analysis', { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify({
  date: new Date().toISOString(),
  threshold: THRESHOLD_LINES,
  critical: CRITICAL_LINES,
  results,
  summary: {
    total: results.length,
    critical: critical.length,
    high: high.length
  }
}, null, 2));

console.log(`\n💾 Relatório salvo em: ${reportPath}`);
