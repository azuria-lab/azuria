#!/usr/bin/env node

/**
 * Script para executar migração do Supabase via API
 * Este script lê o arquivo SQL de migração e executa no Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Carregar variáveis de ambiente
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://crpzkppsriranmeumfqs.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não encontrada!');
  console.log('\n📝 Para executar este script, você precisa:');
  console.log('1. Ir ao Dashboard do Supabase: https://supabase.com/dashboard');
  console.log('2. Selecionar seu projeto');
  console.log('3. Ir em Settings > API');
  console.log('4. Copiar a "service_role key"');
  console.log('5. Adicionar ao .env.local: SUPABASE_SERVICE_ROLE_KEY=sua_chave_aqui\n');
  console.log('🔧 Alternativamente, execute o SQL manualmente:');
  console.log('1. Acesse: https://supabase.com/dashboard/project/crpzkppsriranmeumfqs/sql');
  console.log('2. Cole o conteúdo de: supabase/migrations/002_create_avatars_bucket.sql');
  console.log('3. Clique em "Run"\n');
  process.exit(1);
}

// Criar cliente Supabase com service role key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  try {
    console.log('🚀 Iniciando migração do bucket de avatars...\n');
    
    // Ler arquivo de migração
    const migrationPath = join(__dirname, '../supabase/migrations/002_create_avatars_bucket.sql');
    const sql = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Lendo arquivo de migração...');
    console.log(`   Arquivo: ${migrationPath}`);
    console.log(`   Tamanho: ${sql.length} caracteres\n`);
    
    // Executar SQL
    console.log('⚙️  Executando SQL...');
    const { error } = await supabase.rpc('exec_sql', { sql_string: sql });
    
    if (error) {
      console.error('❌ Erro ao executar migração:', error);
      console.log('\n💡 Dica: Execute o SQL manualmente no Dashboard do Supabase.');
      process.exit(1);
    }
    
    console.log('✅ Migração executada com sucesso!');
    console.log('\n📦 Bucket "avatars" criado com:');
    console.log('   - Acesso público: Sim');
    console.log('   - Limite de tamanho: 5MB');
    console.log('   - Tipos permitidos: JPEG, PNG, GIF, WebP');
    console.log('\n🔒 Políticas de segurança configuradas:');
    console.log('   - Usuários autenticados podem fazer upload');
    console.log('   - Todos podem visualizar avatares');
    console.log('   - Usuários podem atualizar/deletar próprios avatares\n');
    
  } catch (err) {
    console.error('❌ Erro inesperado:', err);
    process.exit(1);
  }
}

// Executar migração (top-level await)
await runMigration();
