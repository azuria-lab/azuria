#!/usr/bin/env node

/**
 * Script para substituir console.log por logger em todo o projeto
 * Uso: node scripts/replace-console-logs.mjs [--dry-run]
 */

import { glob } from 'glob';
import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');

console.log(`🔄 ${DRY_RUN ? 'SIMULANDO' : 'EXECUTANDO'} substituição de console.* por logger...\n`);

const files = glob.sync('src/**/*.{ts,tsx}', {
  ignore: [
    '**/*.test.ts',
    '**/*.test.tsx',
    '**/services/logger.ts',
    '**/services/ai/logger.ts',
    '**/__tests__/**'
  ]
});

let totalChanges = 0;
const changedFiles = [];

files.forEach(filePath => {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Verificar se tem console.*
  if (!content.match(/console\.(log|warn|error|info|debug)\(/)) {
    return;
  }

  let newContent = content;
  let hasChanges = false;

  // Adicionar import do logger se não existir
  if (!newContent.includes("import { logger }") && !newContent.includes("import logger")) {
    const firstImport = newContent.indexOf('import');
    if (firstImport !== -1) {
      newContent = newContent.slice(0, firstImport) +
        "import { logger } from '@/services/logger';\n" +
        newContent.slice(firstImport);
      hasChanges = true;
    }
  }

  // Substituir console.log
  const logCount = (newContent.match(/console\.log\(/g) || []).length;
  if (logCount > 0) {
    newContent = newContent.replace(/console\.log\(/g, 'logger.info(');
    hasChanges = true;
    totalChanges += logCount;
  }

  // Substituir console.warn
  const warnCount = (newContent.match(/console\.warn\(/g) || []).length;
  if (warnCount > 0) {
    newContent = newContent.replace(/console\.warn\(/g, 'logger.warn(');
    hasChanges = true;
    totalChanges += warnCount;
  }

  // Substituir console.error
  const errorCount = (newContent.match(/console\.error\(/g) || []).length;
  if (errorCount > 0) {
    newContent = newContent.replace(/console\.error\(/g, 'logger.error(');
    hasChanges = true;
    totalChanges += errorCount;
  }

  // Substituir console.info
  const infoCount = (newContent.match(/console\.info\(/g) || []).length;
  if (infoCount > 0) {
    newContent = newContent.replace(/console\.info\(/g, 'logger.info(');
    hasChanges = true;
    totalChanges += infoCount;
  }

  // Substituir console.debug
  const debugCount = (newContent.match(/console\.debug\(/g) || []).length;
  if (debugCount > 0) {
    newContent = newContent.replace(/console\.debug\(/g, 'logger.debug(');
    hasChanges = true;
    totalChanges += debugCount;
  }

  if (hasChanges) {
    changedFiles.push({
      file: filePath.replace('src/', ''),
      changes: logCount + warnCount + errorCount + infoCount + debugCount
    });

    if (!DRY_RUN) {
      fs.writeFileSync(filePath, newContent);
    }
  }
});

console.log(`\n📊 Resultado:`);
console.log(`   Arquivos modificados: ${changedFiles.length}`);
console.log(`   Total de substituições: ${totalChanges}`);

if (changedFiles.length > 0) {
  console.log('\n📝 Arquivos alterados:');
  changedFiles.forEach(({ file, changes }) => {
    console.log(`   ${file} (${changes} substituições)`);
  });
}

if (DRY_RUN) {
  console.log('\n⚠️  Modo DRY-RUN: Nenhum arquivo foi modificado.');
  console.log('   Execute sem --dry-run para aplicar as mudanças.');
} else {
  console.log('\n✅ Substituições aplicadas com sucesso!');
  console.log('   Execute "npm run type-check" para validar.');
}

// Salvar relatório
const reportPath = 'analysis/console-replacements.json';
fs.mkdirSync('analysis', { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify({
  date: new Date().toISOString(),
  dryRun: DRY_RUN,
  filesChanged: changedFiles.length,
  totalReplacements: totalChanges,
  files: changedFiles
}, null, 2));

console.log(`\n💾 Relatório salvo em: ${reportPath}`);
