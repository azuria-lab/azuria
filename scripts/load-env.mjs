/**
 * Script de carregamento de variáveis de ambiente para o Vite
 * Resolve problema do Vite não lendo .env corretamente no Windows
 * 
 * @module scripts/load-env.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

// Caminho do arquivo .env
const envPath = resolve(projectRoot, '.env');

console.log('🔧 Carregando variáveis de ambiente...');

if (!existsSync(envPath)) {
  console.error('❌ Arquivo .env não encontrado!');
  console.error('   Copie .env.example para .env e configure as variáveis.');
  process.exit(1);
}

// Ler e parsear o .env
const envContent = readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  // Ignorar comentários e linhas vazias
  if (!trimmed || trimmed.startsWith('#')) return;
  
  const [key, ...valueParts] = trimmed.split('=');
  if (key && valueParts.length > 0) {
    let value = valueParts.join('=');
    // Remover aspas se existirem
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    envVars[key] = value;
  }
});

// Verificar variáveis críticas do Gemini
const geminiKey = envVars['VITE_GEMINI_API_KEY'];
const geminiModel = envVars['VITE_GEMINI_MODEL'];

if (geminiKey) {
  console.log(`✅ VITE_GEMINI_API_KEY: ...${geminiKey.slice(-5)}`);
} else {
  console.warn('⚠️  VITE_GEMINI_API_KEY não definida no .env');
}

if (geminiModel) {
  console.log(`✅ VITE_GEMINI_MODEL: ${geminiModel}`);
} else {
  console.warn('⚠️  VITE_GEMINI_MODEL não definida no .env');
}

console.log('');
console.log('🚀 Iniciando Vite...');
console.log('');

// Mesclar com variáveis de ambiente existentes
const mergedEnv = { ...process.env, ...envVars };

// Iniciar o Vite com as variáveis carregadas
const vite = spawn('npx', ['vite'], {
  cwd: projectRoot,
  env: mergedEnv,
  stdio: 'inherit',
  shell: true
});

vite.on('error', (err) => {
  console.error('❌ Erro ao iniciar Vite:', err);
  process.exit(1);
});

vite.on('close', (code) => {
  process.exit(code || 0);
});
