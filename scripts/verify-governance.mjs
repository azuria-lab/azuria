#!/usr/bin/env node
/**
 * Governance / License terminology scan
 * Scans repo for disallowed legacy open-source terms after migration to proprietary license.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();

// Terms that should no longer appear (case-insensitive)
const PROHIBITED = [
  /MIT License/i,
  /\bMIT\b/i,
  /open[- ]source/i,
  /Apache License/i,
  /\b(?:GPL|LGPL|AGPL)(?:-\d+\.?\d*)?(?:\+)?\b/i,
];

// Allow list: file paths that may legitimately mention old licenses historically (e.g. changelog) – none yet
// NOTE: We now skip entire dependency & build artifact directories (node_modules, dist, coverage, playwright, etc.)
const ALLOW_PATH_REGEX = [
  /CHANGELOG\.md$/i,
  /package-lock\.json$/i,
  /scripts[\\/]+verify-governance\.mjs$/i,
  /THIRD_PARTY_LICENSES\.md$/i,
];

// Directories we never scan (external or generated content where third‑party licenses are expected)
const SKIP_DIR_NAMES = new Set([
  'node_modules',
  'dist',
  'coverage',
  '.vite',
  '.turbo',
  'playwright-report',
  '.next',
]);

// File extensions to scan
const EXTENSIONS = ['.md', '.ts', '.tsx', '.js', '.cjs', '.mjs', '.json'];

/** Recursively collect files */
function collect(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.name.startsWith('.git')) continue;
    if (SKIP_DIR_NAMES.has(e.name)) continue;
    if (e.isDirectory()) {
      files.push(...collect(join(dir, e.name)));
    } else {
      const lower = e.name.toLowerCase();
      if (EXTENSIONS.some(ext => lower.endsWith(ext))) {
        files.push(join(dir, e.name));
      }
    }
  }
  return files;
}

const results = [];
const files = collect(ROOT);
for (const file of files) {
  if (ALLOW_PATH_REGEX.some(r => r.test(file))) continue;
  const content = readFileSync(file, 'utf8');
  for (const pattern of PROHIBITED) {
    if (pattern.test(content)) {
      // collect line numbers
      const lines = content.split(/\r?\n/);
      lines.forEach((line, idx) => {
        if (pattern.test(line)) {
          results.push({ file, line: idx + 1, match: line.trim().slice(0, 160) });
        }
      });
    }
  }
}

if (results.length) {
  console.error('\n❌ Governance scan failed: prohibited licensing/open-source terms found.');
  for (const r of results) {
    console.error(` - ${r.file}:${r.line} -> ${r.match}`);
  }
  console.error('\nEdit or remove the above references, or add an allow rule if justified.');
  process.exit(1);
}

console.log('✅ Governance scan passed: no prohibited terms found.');
