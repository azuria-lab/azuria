#!/usr/bin/env node
/**
 * Governance / License terminology scan
 * Scans repo for disallowed legacy open-source terms after migration to proprietary license.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join, normalize, relative } from 'node:path';

const ROOT = process.cwd();

// Terms that should no longer appear (case-insensitive)
// GPL family regex simplified for clarity; we enumerate explicit tokens and optional version suffix
// Examples that match: GPL, GPL-3, LGPL-2.1+, AGPL-3.0
const PROHIBITED = [
  /MIT License/i,
  /\bMIT\b/i,
  /open[- ]source/i,
  /Apache License/i,
  /\bGPL(?:-[0-9](?:\.[0-9])?(?:\+)?)?\b/i,
  /\bLGPL(?:-[0-9](?:\.[0-9])?(?:\+)?)?\b/i,
  /\bAGPL(?:-[0-9](?:\.[0-9])?(?:\+)?)?\b/i,
];

// Allow list (normalized relative paths from repo root) that may legitimately mention old licenses historically.
// Avoids complex regex for paths – direct comparison after normalization.
const ALLOW_PATHS = new Set([
  'CHANGELOG.md',
  'package-lock.json',
  'scripts/verify-governance.mjs',
  'THIRD_PARTY_LICENSES.md',
]);

// Directories we never scan (external or generated artifacts where third-party licenses are expected)
// Can be extended via environment variable GOV_SCAN_SKIP_DIRS="dir1,dir2".
const DEFAULT_SKIP_DIRS = [
  'node_modules',
  'dist',
  'coverage',
  '.vite',
  '.turbo',
  'playwright-report',
  '.next',
];
const EXTRA_SKIP = process.env.GOV_SCAN_SKIP_DIRS?.split(',')?.map(s => s.trim())?.filter(Boolean) || [];
const SKIP_DIR_NAMES = new Set([...DEFAULT_SKIP_DIRS, ...EXTRA_SKIP]);

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

const MAX_MATCH_DISPLAY_LENGTH = 160; // maximum length displayed when reporting found line
// Regex to remove explicitly allowed governance blocks (ignored from scanning)
const ALLOW_BLOCK_REGEX = /<!--\s*GOVERNANCE_ALLOW_START\s*-->[\s\S]*?<!--\s*GOVERNANCE_ALLOW_END\s*-->/gi;
function stripGovernanceAllowBlocks(text) { return text.replace(ALLOW_BLOCK_REGEX, ''); }
const results = [];
const files = collect(ROOT);
for (const abs of files) {
  const rel = normalize(relative(ROOT, abs)).replace(/\\/g, '/');
  if (ALLOW_PATHS.has(rel)) continue;
  const content = readFileSync(abs, 'utf8');
  const stripped = stripGovernanceAllowBlocks(content);
  const lines = stripped.split(/\r?\n/);
  lines.forEach((line, idx) => {
    for (const pattern of PROHIBITED) {
      if (pattern.test(line)) {
        results.push({ file: rel, line: idx + 1, match: line.trim().slice(0, MAX_MATCH_DISPLAY_LENGTH) });
        break; // Only record first matching pattern per line
      }
    }
  });
}

if (results.length) {
  console.error('\n❌ Governance scan failed: prohibited licensing/open-source terms found.');
  for (const r of results) console.error(` - ${r.file}:${r.line} -> ${r.match}`);
  console.error('\nEdit or remove the above references, or add an allow rule if justified.');
  process.exit(1);
}

console.log('✅ Governance scan passed: no prohibited terms found.');
