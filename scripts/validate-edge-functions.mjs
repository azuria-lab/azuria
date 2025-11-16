#!/usr/bin/env node

/**
 * Script de validação da configuração das Edge Functions
 * 
 * Verifica se todos os arquivos necessários existem e estão corretos
 * 
 * Uso: node scripts/validate-edge-functions.mjs
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(path, description) {
  const fullPath = join(rootDir, path);
  const exists = existsSync(fullPath);
  
  if (exists) {
    log(`✅ ${description}`, 'green');
    return true;
  } else {
    log(`❌ ${description} - NOT FOUND: ${path}`, 'red');
    return false;
  }
}

function checkFileContent(path, searchString, description) {
  const fullPath = join(rootDir, path);
  
  try {
    const content = readFileSync(fullPath, 'utf-8');
    const found = content.includes(searchString);
    
    if (found) {
      log(`✅ ${description}`, 'green');
      return true;
    } else {
      log(`⚠️  ${description} - Content not found`, 'yellow');
      return false;
    }
  } catch (error) {
    log(`❌ ${description} - Error reading file`, 'red');
    return false;
  }
}

async function main() {
  log('\n🔍 Validando configuração das Edge Functions...\n', 'blue');

  let allValid = true;

  // Verificar arquivos compartilhados
  log('📁 Arquivos compartilhados:', 'blue');
  allValid &= checkFile('supabase/functions/_shared/types.ts', 'types.ts');
  allValid &= checkFile('supabase/functions/_shared/utils.ts', 'utils.ts');

  // Verificar Edge Functions
  log('\n📁 Edge Functions:', 'blue');
  allValid &= checkFile('supabase/functions/create-subscription/index.ts', 'create-subscription');
  allValid &= checkFile('supabase/functions/create-payment-preference/index.ts', 'create-payment-preference');
  allValid &= checkFile('supabase/functions/cancel-subscription/index.ts', 'cancel-subscription');
  allValid &= checkFile('supabase/functions/mercadopago-webhook/index.ts', 'mercadopago-webhook');

  // Verificar configuração
  log('\n📁 Configuração:', 'blue');
  allValid &= checkFile('supabase/functions/deno.json', 'deno.json');
  allValid &= checkFile('supabase/functions/.env.example', '.env.example');
  allValid &= checkFile('supabase/functions/README.md', 'README.md');

  // Verificar documentação
  log('\n📁 Documentação:', 'blue');
  allValid &= checkFile('docs/EDGE_FUNCTIONS_DEPLOY.md', 'Guia de Deploy');
  allValid &= checkFile('docs/EDGE_FUNCTIONS_USAGE.md', 'Guia de Uso');
  allValid &= checkFile('MERCADOPAGO_EDGE_FUNCTIONS_COMPLETE.md', 'Resumo Completo');

  // Verificar conteúdo crítico
  log('\n🔍 Validando conteúdo crítico:', 'blue');
  allValid &= checkFileContent(
    'supabase/functions/_shared/types.ts',
    'export const PLANS',
    'Configuração de planos'
  );
  allValid &= checkFileContent(
    'supabase/functions/_shared/utils.ts',
    'mercadoPagoRequest',
    'Função de requisição MP'
  );
  allValid &= checkFileContent(
    'supabase/functions/mercadopago-webhook/index.ts',
    'MercadoPagoWebhookNotification',
    'Processamento de webhook'
  );

  // Verificar integração com frontend
  log('\n🔗 Verificando integração:', 'blue');
  allValid &= checkFile('src/lib/mercadopago-client.ts', 'Cliente Mercado Pago');
  allValid &= checkFile('src/hooks/useMercadoPago.tsx', 'Hook useMercadoPago');

  // Verificar migração do banco
  log('\n💾 Verificando banco de dados:', 'blue');
  allValid &= checkFile(
    'supabase/migrations/20250108_complete_subscription_system.sql',
    'Migração de assinaturas'
  );

  // Resultado final
  log('\n' + '='.repeat(60), 'blue');
  if (allValid) {
    log('\n✅ Todas as verificações passaram!', 'green');
    log('\n📝 Próximos passos:', 'blue');
    log('1. Configure as variáveis de ambiente no Supabase Dashboard', 'reset');
    log('2. Faça deploy das Edge Functions: supabase functions deploy <nome>', 'reset');
    log('3. Configure o webhook no painel do Mercado Pago', 'reset');
    log('4. Teste com pagamentos de teste', 'reset');
    log('\n📚 Consulte docs/EDGE_FUNCTIONS_DEPLOY.md para mais detalhes\n', 'blue');
    process.exit(0);
  } else {
    log('\n❌ Algumas verificações falharam!', 'red');
    log('\nVerifique os arquivos marcados acima e tente novamente.\n', 'yellow');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Erro ao executar validação: ${error.message}`, 'red');
  process.exit(1);
});
