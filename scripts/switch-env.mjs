#!/usr/bin/env node
/*
Simple env switcher for Vite.
Usage:
  node scripts/switch-env.mjs cloud
  node scripts/switch-env.mjs local
Copies the corresponding preset to .env.local
*/
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const mode = (process.argv[2] || '').toLowerCase();
if (!['cloud', 'local', 'hybrid'].includes(mode)) {
  console.error('[env] Usage: node scripts/switch-env.mjs <cloud|local|hybrid>');
  process.exit(1);
}

const root = process.cwd();
const target = path.join(root, '.env.local');

let candidates;
if (mode === 'cloud') {
  candidates = ['.env.cloud', '.env.cloud.local', '.env.cloud.example'];
} else if (mode === 'hybrid') {
  candidates = ['.env.hybrid', '.env.hybrid.local', '.env.hybrid.example'];
} else {
  candidates = ['.env.localdev', '.env.localdev.local', '.env.localdev.example'];
}

let source = candidates
  .map((f) => path.join(root, f))
  .find((p) => fs.existsSync(p));

if (!source) {
  // Try to generate presets from .env automatically
  const generator = path.join(root, 'scripts', 'generate-env-presets.mjs');
  if (fs.existsSync(generator)) {
    try {
      console.log('[env] No preset found; generating from .env...');
      execSync(`node "${generator}"`, { stdio: 'inherit' });
      source = candidates
        .map((f) => path.join(root, f))
        .find((p) => fs.existsSync(p));
    } catch (e) {
      console.error('[env] Failed to generate presets from .env:', e?.message ?? e);
    }
  }
  if (!source) {
    console.error(`\n[env] No preset found for "${mode}". Create one of: ${candidates.join(', ')}\n`);
    process.exit(2);
  }
}

try {
  fs.copyFileSync(source, target);
  console.log(`[env] Switched to ${mode}. Wrote: ${path.basename(target)} (from ${path.basename(source)})`);
  process.exit(0);
} catch (err) {
  console.error('[env] Failed to switch env:', err);
  process.exit(3);
}
