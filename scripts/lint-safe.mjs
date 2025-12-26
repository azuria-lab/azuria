#!/usr/bin/env node
/**
 * Script seguro para rodar lint sem causar problemas de conexão
 * Salva a saída em um arquivo primeiro, depois exibe apenas um resumo
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const LINT_OUTPUT_FILE = join(process.cwd(), '.lint-output.txt');
const MAX_DISPLAY_LINES = 50;

try {
  console.log('🔍 Executando lint...');
  console.log('📝 Salvando saída em arquivo para evitar problemas de conexão...\n');
  
  // Executa o lint e salva a saída em arquivo
  try {
    execSync(`npm run lint > "${LINT_OUTPUT_FILE}" 2>&1`, { 
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024 // 10MB
    });
    
    // Se chegou aqui, não houve erros
    console.log('✅ Lint passou sem erros!');
    
    // Remove o arquivo de saída se existir
    if (existsSync(LINT_OUTPUT_FILE)) {
      execSync(`rm "${LINT_OUTPUT_FILE}"`, { stdio: 'ignore' });
    }
    
    process.exit(0);
  } catch (error) {
    // Lint falhou, vamos ler o arquivo e mostrar um resumo
    if (existsSync(LINT_OUTPUT_FILE)) {
      const output = readFileSync(LINT_OUTPUT_FILE, 'utf-8');
      const lines = output.split('\n');
      
      console.log('❌ Lint encontrou problemas:\n');
      
      // Mostra apenas as primeiras linhas
      const displayLines = lines.slice(0, MAX_DISPLAY_LINES);
      console.log(displayLines.join('\n'));
      
      if (lines.length > MAX_DISPLAY_LINES) {
        console.log(`\n... e mais ${lines.length - MAX_DISPLAY_LINES} linhas`);
        console.log(`\n📄 Saída completa salva em: ${LINT_OUTPUT_FILE}`);
      }
      
      // Conta erros e warnings
      const errorCount = output.match(/✖/g)?.length || 0;
      const warningCount = output.match(/⚠/g)?.length || 0;
      
      console.log(`\n📊 Resumo: ${errorCount} erro(s), ${warningCount} aviso(s)`);
      console.log(`\n💡 Para ver a saída completa, abra: ${LINT_OUTPUT_FILE}`);
      
      process.exit(1);
    } else {
      // Não conseguiu salvar o arquivo, mostra erro padrão
      console.error('❌ Erro ao executar lint');
      throw error;
    }
  }
} catch (error) {
  console.error('❌ Erro ao executar script de lint:', error.message);
  process.exit(1);
}

