#!/usr/bin/env node

/**
 * Script para encontrar código duplicado no projeto
 * Uso: node scripts/find-duplicates.mjs
 */

import { glob } from 'glob';
import fs from 'fs';
import crypto from 'crypto';

console.log('🔍 Analisando código duplicado...\n');

const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: ['**/*.test.ts', '**/*.test.tsx', '**/*.d.ts']
});

// Analisar funções
const functions = new Map();
const duplicates = [];

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Regex para encontrar funções
  const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+(\w+)|(?:const|let)\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g;
  let match;
  
  while ((match = functionRegex.exec(content)) !== null) {
    const functionName = match[1] || match[2];
    if (!functionName) continue;
    
    // Extrair corpo da função (simplificado)
    const startIndex = match.index;
    let braceCount = 0;
    let endIndex = startIndex;
    let started = false;
    
    for (let i = startIndex; i < content.length; i++) {
      if (content[i] === '{') {
        braceCount++;
        started = true;
      }
      if (content[i] === '}') {
        braceCount--;
        if (started && braceCount === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }
    
    if (endIndex > startIndex) {
      const functionBody = content.slice(startIndex, endIndex);
      
      // Normalizar (remover comentários e whitespace)
      const normalized = functionBody
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      const hash = crypto.createHash('md5').update(normalized).digest('hex');
      
      if (functions.has(hash)) {
        const existing = functions.get(hash);
        duplicates.push({
          function1: `${existing.file}::${existing.name}`,
          function2: `${filePath.replace('src/', '')}::${functionName}`,
          lines: functionBody.split('\n').length,
          similarity: '100%'
        });
      } else {
        functions.set(hash, {
          file: filePath.replace('src/', ''),
          name: functionName,
          body: functionBody
        });
      }
    }
  }
});

if (duplicates.length === 0) {
  console.log('✅ Nenhuma duplicação significativa encontrada!');
  process.exit(0);
}

console.log(`Encontradas ${duplicates.length} possíveis duplicações:\n`);

// Agrupar por similaridade
const grouped = duplicates.reduce((acc, dup) => {
  const key = dup.function1.split('::')[1]; // Nome da função
  if (!acc[key]) acc[key] = [];
  acc[key].push(dup);
  return acc;
}, {});

Object.entries(grouped).forEach(([funcName, dups]) => {
  console.log(`\n📍 Função: ${funcName}`);
  dups.forEach(dup => {
    console.log(`   • ${dup.function1}`);
    console.log(`   • ${dup.function2}`);
    console.log(`   Linhas: ${dup.lines}`);
  });
});

// Análises específicas conhecidas
console.log('\n\n🔎 Análise de Duplicações Conhecidas:\n');

// 1. throttle function
const throttleFiles = files.filter(f => {
  const content = fs.readFileSync(f, 'utf8');
  return content.includes('function throttle') || content.includes('const throttle');
});

if (throttleFiles.length > 1) {
  console.log('⚠️  throttle() encontrado em:');
  throttleFiles.forEach(f => console.log(`   • ${f.replace('src/', '')}`));
  console.log('   Recomendação: Manter apenas em utils/performance.ts\n');
}

// 2. useCalculationCache
const cacheFiles = files.filter(f => {
  const content = fs.readFileSync(f, 'utf8');
  return content.includes('useCalculationCache') && content.includes('export');
});

if (cacheFiles.length > 1) {
  console.log('⚠️  useCalculationCache encontrado em:');
  cacheFiles.forEach(f => console.log(`   • ${f.replace('src/', '')}`));
  console.log('   Recomendação: Manter versão tipada única\n');
}

// 3. Logger implementations
const loggerFiles = files.filter(f => {
  const content = fs.readFileSync(f, 'utf8');
  return f.includes('logger') && content.includes('class') && content.includes('log');
});

if (loggerFiles.length > 1) {
  console.log('⚠️  Implementações de Logger:');
  loggerFiles.forEach(f => console.log(`   • ${f.replace('src/', '')}`));
  console.log('   Recomendação: Unificar em services/logger.ts\n');
}

// Salvar relatório
const reportPath = 'analysis/duplicates-report.json';
fs.mkdirSync('analysis', { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify({
  date: new Date().toISOString(),
  totalDuplicates: duplicates.length,
  duplicates,
  knownIssues: {
    throttle: throttleFiles.map(f => f.replace('src/', '')),
    cache: cacheFiles.map(f => f.replace('src/', '')),
    logger: loggerFiles.map(f => f.replace('src/', ''))
  }
}, null, 2));

console.log(`\n💾 Relatório salvo em: ${reportPath}`);
