#!/usr/bin/env node
/**
 * Verifica artifacts JS suspeitos dentro de app/ que podem introduzir loops de re-export
 * em ambiente de teste (Vitest) quando usamos TypeScript como fonte.
 * Heurística:
 *  - Arquivos page.js, layout.js, route.js coexistindo com .tsx de mesmo nome
 *  - Conteúdo contendo apenas re-export para './page' ou './layout'
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const APP_DIR = path.join(ROOT, 'app');
const targets = ['page', 'layout', 'route'];

/** @type {Array<{file:string, reason:string}>} */
const findings = [];

function scan(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      scan(path.join(dir, e.name));
    } else if (e.isFile()) {
      const base = path.basename(e.name);
      const ext = path.extname(base);
      const stem = base.replace(ext, '');
      if (ext === '.js' && targets.includes(stem)) {
        const tsxPeer = path.join(dir, stem + '.tsx');
        if (fs.existsSync(tsxPeer)) {
          const full = path.join(dir, e.name);
          const raw = fs.readFileSync(full, 'utf8').trim();
          const simpleReexport = /^export\s+\{\s*default\s*\}\s+from\s+'\.\/(page|layout|route)';?$/;
          if (simpleReexport.test(raw)) {
            findings.push({ file: path.relative(ROOT, full), reason: 'looping-simple-reexport' });
          } else {
            findings.push({ file: path.relative(ROOT, full), reason: 'js-artifact-with-tsx-peer' });
          }
        }
      }
    }
  }
}

if (fs.existsSync(APP_DIR)) {
  scan(APP_DIR);
}

if (findings.length) {
  console.error('[check-next-artifacts] Encontrados artifacts suspeitos:');
  for (const f of findings) {
    console.error(' -', f.file, '=>', f.reason);
  }
  process.exitCode = 1;
} else {
  console.log('[check-next-artifacts] OK: nenhum artifact suspeito.');
}
