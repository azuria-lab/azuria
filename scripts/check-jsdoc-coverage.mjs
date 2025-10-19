#!/usr/bin/env node

/**
 * Script para identificar módulos sem documentação JSDoc
 * 
 * Analisa arquivos TypeScript/JavaScript e reporta funções/classes
 * que não possuem documentação JSDoc adequada.
 */

import { readdir, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Diretórios a serem analisados
const TARGET_DIRS = [
  'src/services',
  'src/hooks',
  'src/utils',
  'src/lib',
  'src/contexts'
];

// Diretórios a ignorar
const IGNORE_PATTERNS = [
  'node_modules',
  'dist',
  '__tests__',
  '.test.',
  '.spec.',
  'types.ts' // Já documentados na Fase 5
];

// Padrões para detectar falta de JSDoc
const NEEDS_JSDOC_PATTERNS = [
  /export\s+(?:async\s+)?function\s+(\w+)/g,
  /export\s+const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/g,
  /export\s+class\s+(\w+)/g,
  /export\s+interface\s+(\w+)/g,
  /export\s+type\s+(\w+)/g
];

const HAS_JSDOC_PATTERN = /\/\*\*[\s\S]*?\*\//;

/**
 * Verifica se um arquivo deve ser ignorado
 */
function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => filePath.includes(pattern));
}

/**
 * Processa um arquivo e identifica exports sem JSDoc
 */
async function analyzeFile(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const undocumented = [];

    for (const pattern of NEEDS_JSDOC_PATTERNS) {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const exportName = match[1];
        const startPos = match.index;
        
        // Pegar contexto antes da declaração (últimas 500 chars)
        const before = content.slice(Math.max(0, startPos - 500), startPos);
        
        // Verificar se há JSDoc imediatamente antes
        if (!HAS_JSDOC_PATTERN.test(before)) {
          undocumented.push({
            name: exportName,
            type: match[0].includes('function') ? 'function' :
                  match[0].includes('class') ? 'class' :
                  match[0].includes('interface') ? 'interface' :
                  match[0].includes('type') ? 'type' : 'const',
            line: content.slice(0, startPos).split('\n').length
          });
        }
      }
    }

    return undocumented;
  } catch (error) {
    console.error(`Erro ao analisar ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Varre diretório recursivamente
 */
async function scanDirectory(dir) {
  const results = [];
  
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name);
      
      if (shouldIgnore(fullPath)) {
        continue;
      }
      
      if (entry.isDirectory()) {
        const subResults = await scanDirectory(fullPath);
        results.push(...subResults);
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        const undocumented = await analyzeFile(fullPath);
        if (undocumented.length > 0) {
          results.push({
            file: relative(rootDir, fullPath),
            undocumented
          });
        }
      }
    }
  } catch (error) {
    // Diretório não existe, ignorar
  }
  
  return results;
}

/**
 * Calcula prioridade baseada em complexidade/uso
 */
function calculatePriority(fileData) {
  const { file, undocumented } = fileData;
  let priority = 0;
  
  // Mais exports = maior prioridade
  priority += undocumented.length * 2;
  
  // Services têm maior prioridade
  if (file.includes('services/')) priority += 10;
  
  // Hooks têm prioridade média
  if (file.includes('hooks/')) priority += 5;
  
  // Utils têm prioridade menor
  if (file.includes('utils/')) priority += 3;
  
  return priority;
}

/**
 * Main function
 */
async function main() {
  console.log('🔍 Analisando módulos sem JSDoc...\n');
  
  const allResults = [];
  
  for (const dir of TARGET_DIRS) {
    const fullPath = join(rootDir, dir);
    const results = await scanDirectory(fullPath);
    allResults.push(...results);
  }
  
  if (allResults.length === 0) {
    console.log('✅ Todos os módulos estão documentados!\n');
    return;
  }
  
  // Ordenar por prioridade
  allResults.sort((a, b) => calculatePriority(b) - calculatePriority(a));
  
  // Estatísticas gerais
  const totalFiles = allResults.length;
  const totalUndocumented = allResults.reduce((sum, r) => sum + r.undocumented.length, 0);
  
  console.log(`📊 Estatísticas:`);
  console.log(`   Arquivos sem JSDoc completo: ${totalFiles}`);
  console.log(`   Total de exports não documentados: ${totalUndocumented}\n`);
  
  // Relatório detalhado
  console.log('📝 Arquivos prioritários para documentação:\n');
  
  allResults.slice(0, 20).forEach((result, index) => {
    const priority = calculatePriority(result);
    const priorityLabel = priority >= 15 ? '🔴 ALTA' :
                          priority >= 8 ? '🟡 MÉDIA' : '🟢 BAIXA';
    
    console.log(`${index + 1}. ${priorityLabel} ${result.file}`);
    console.log(`   Prioridade: ${priority} | Exports sem doc: ${result.undocumented.length}`);
    
    result.undocumented.slice(0, 5).forEach(item => {
      console.log(`   - ${item.type} ${item.name} (linha ${item.line})`);
    });
    
    if (result.undocumented.length > 5) {
      console.log(`   ... e mais ${result.undocumented.length - 5} items`);
    }
    
    console.log('');
  });
  
  if (allResults.length > 20) {
    console.log(`... e mais ${allResults.length - 20} arquivos\n`);
  }
  
  // Recomendações
  console.log('💡 Próximos passos recomendados:');
  console.log('   1. Comece pelos arquivos com prioridade ALTA (🔴)');
  console.log('   2. Use o padrão estabelecido na Fase 5 (FASE5_COMPLETO.md)');
  console.log('   3. Garanta @param, @returns, @example e @remarks em todas as funções');
  console.log('   4. Execute "npm run docs:generate" após documentar\n');
  
  // Salvar relatório JSON para processamento
  const reportPath = join(rootDir, 'jsdoc-coverage-report.json');
  await import('fs/promises').then(fs => 
    fs.writeFile(reportPath, JSON.stringify({
      generatedAt: new Date().toISOString(),
      totalFiles,
      totalUndocumented,
      files: allResults
    }, null, 2))
  );
  
  console.log(`📄 Relatório detalhado salvo em: jsdoc-coverage-report.json\n`);
}

main().catch(console.error);
