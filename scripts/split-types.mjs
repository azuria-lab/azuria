#!/usr/bin/env node

/**
 * Script para dividir o arquivo types.ts gigante em módulos menores
 * Uso: node scripts/split-types.mjs [--dry-run]
 */

import fs from 'fs';
import path from 'path';

const DRY_RUN = process.argv.includes('--dry-run');
const TYPES_FILE = 'src/integrations/supabase/types.ts';
const OUTPUT_DIR = 'src/integrations/supabase/types';

console.log(`🔄 ${DRY_RUN ? 'SIMULANDO' : 'EXECUTANDO'} divisão do types.ts...\n`);

// Ler arquivo original
if (!fs.existsSync(TYPES_FILE)) {
  console.error(`❌ Arquivo ${TYPES_FILE} não encontrado!`);
  process.exit(1);
}

const content = fs.readFileSync(TYPES_FILE, 'utf8');
const lines = content.split('\n');

console.log(`📄 Arquivo original: ${lines.length} linhas`);

// Estrutura para armazenar os módulos
const modules = {
  base: [],      // Json type + Database declaration start
  tables: [],    // Tables definitions
  views: [],     // Views definitions
  functions: [], // Functions definitions
  enums: []      // Enums definitions
};

// Parser state
let currentSection = 'base';
let inTables = false;
let inViews = false;
let inFunctions = false;
let inEnums = false;
let braceCount = 0;

// Processar linha por linha
lines.forEach((line, index) => {
  const trimmed = line.trim();
  
  // Detectar seções
  if (trimmed.includes('Tables: {')) {
    currentSection = 'tables';
    inTables = true;
  } else if (trimmed.includes('Views: {')) {
    currentSection = 'views';
    inViews = true;
  } else if (trimmed.includes('Functions: {')) {
    currentSection = 'functions';
    inFunctions = true;
  } else if (trimmed.includes('Enums: {')) {
    currentSection = 'enums';
    inEnums = true;
  }
  
  // Contar chaves para saber quando sair de uma seção
  braceCount += (line.match(/{/g) || []).length;
  braceCount -= (line.match(/}/g) || []).length;
  
  // Adicionar linha ao módulo apropriado
  modules[currentSection].push(line);
  
  // Detectar fim de seção
  if (braceCount === 1 && (inTables || inViews || inFunctions || inEnums)) {
    if (inTables) inTables = false;
    if (inViews) inViews = false;
    if (inFunctions) inFunctions = false;
    if (inEnums) inEnums = false;
    currentSection = 'base';
  }
});

// Criar arquivos modulares
const files = {
  'base.ts': `// Base type definitions
${modules.base.slice(0, 10).join('\n')}
`,
  
  'tables.ts': `import type { Json } from './base';

// Tables type definitions
export interface Tables {
${modules.tables.join('\n')}
}
`,
  
  'views.ts': `import type { Json } from './base';

// Views type definitions
export interface Views {
${modules.views.join('\n')}
}
`,
  
  'functions.ts': `import type { Json } from './base';

// Functions (RPC) type definitions
export interface Functions {
${modules.functions.join('\n')}
}
`,
  
  'enums.ts': `// Enum type definitions
export interface Enums {
${modules.enums.join('\n')}
}
`,
  
  'index.ts': `// Main Database type - Re-exports all modules
import type { Json } from './base';
import type { Tables } from './tables';
import type { Views } from './views';
import type { Functions } from './functions';
import type { Enums } from './enums';

export type { Json };

export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: Tables;
    Views: Views;
    Functions: Functions;
    Enums: Enums;
  }
}
`
};

// Estatísticas
console.log('\n📊 Divisão proposta:');
Object.entries(files).forEach(([filename, content]) => {
  const lineCount = content.split('\n').length;
  console.log(`   ${filename}: ${lineCount} linhas`);
});

if (!DRY_RUN) {
  // Criar backup do arquivo original
  const backupPath = `${TYPES_FILE}.backup-${Date.now()}`;
  fs.copyFileSync(TYPES_FILE, backupPath);
  console.log(`\n💾 Backup criado: ${backupPath}`);
  
  // Criar diretório
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  // Escrever arquivos
  Object.entries(files).forEach(([filename, content]) => {
    const filePath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filePath, content);
    console.log(`✅ Criado: ${filePath}`);
  });
  
  // Atualizar arquivo original para re-exportar
  const newMainFile = `// Re-export from modular structure
export type { Json, Database } from './types';
`;
  fs.writeFileSync(TYPES_FILE, newMainFile);
  console.log(`✅ Atualizado: ${TYPES_FILE}`);
  
  console.log('\n✅ Divisão concluída com sucesso!');
  console.log('\n⚠️  PRÓXIMOS PASSOS:');
  console.log('   1. Execute: npm run type-check');
  console.log('   2. Execute: npm run test');
  console.log('   3. Verifique se não há erros de import');
  console.log('   4. Se houver problemas, restaure o backup');
  
} else {
  console.log('\n⚠️  Modo DRY-RUN: Nenhum arquivo foi criado.');
  console.log('   Execute sem --dry-run para aplicar as mudanças.');
}

// Salvar relatório
const reportPath = 'analysis/types-split-report.json';
fs.mkdirSync('analysis', { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify({
  date: new Date().toISOString(),
  dryRun: DRY_RUN,
  originalSize: lines.length,
  modules: Object.fromEntries(
    Object.entries(files).map(([name, content]) => [
      name,
      content.split('\n').length
    ])
  )
}, null, 2));

console.log(`\n💾 Relatório salvo em: ${reportPath}`);
