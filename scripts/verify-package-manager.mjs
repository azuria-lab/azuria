#!/usr/bin/env node
import { existsSync, readdirSync } from 'node:fs';
import { cwd } from 'node:process';

const forbidden = [
  'yarn.lock',
  'pnpm-lock.yaml',
  'bun.lockb',
  'shrinkwrap.yaml',
  'npm-shrinkwrap.json'
];

const found = forbidden.filter(f => existsSync(f));

if (found.length) {
  console.error('\n❌ Package manager policy violation');
  for (const f of found) console.error(` - Found forbidden lockfile: ${f}`);
  console.error('\nThis repository is npm-only. Remove the files listed above and use:');
  console.error('  npm ci');
  process.exit(1);
}

// Simple heuristic: ensure package-lock.json exists
if (!existsSync('package-lock.json')) {
  console.error('\n❌ package-lock.json missing. Run: npm install --package-lock-only');
  process.exit(1);
}

// Optional: warn if node_modules missing when running in local dev context
try {
  const hasNodeModules = existsSync('node_modules');
  if (!hasNodeModules) {
    console.log('ℹ️  Dica: execute "npm ci" para instalar dependências limpas.');
  }
} catch {}

console.log('✅ NPM package manager guard passed.');
