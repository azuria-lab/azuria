#!/usr/bin/env node
/* Validação de variáveis de ambiente (build/runtime) */
import fs from 'fs';

const REQUIRED = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const OPTIONAL = [
  'VITE_OPENAI_API_KEY',
  'VITE_GA_MEASUREMENT_ID'
];

function isProbablyUrl(v) {
  if (!v) return false;
  try { new URL(v); return true; } catch { return false; }
}

let missing = [];
for (const k of REQUIRED) {
  if (!process.env[k]) missing.push(k);
}

if (missing.length) {
  console.error('[env] Variáveis obrigatórias ausentes:', missing.join(', '));
}

// Checks adicionais
if (process.env.VITE_SUPABASE_URL && !isProbablyUrl(process.env.VITE_SUPABASE_URL)) {
  console.warn('[env] VITE_SUPABASE_URL não parece uma URL válida.');
}

for (const opt of OPTIONAL) {
  if (!process.env[opt]) {
    console.warn(`[env] (opcional) ${opt} não definida.`);
  }
}

if (missing.length) {
  process.exit(1);
} else {
  console.log('[env] OK');
}
