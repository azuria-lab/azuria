#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

/**
 * SBOM Diff Script (modo audit)
 * - Compara sbom.json atual com versão da base (main)
 * - Classifica novos componentes por heurística simples de risco
 * - Modo inicial: apenas warnings (exit code 0) para calibragem
 * - Futuro: permitir modo enforce via env (SBOM_ENFORCE=1)
 */

const ROOT = process.cwd();
const CURRENT_SBOM = path.join(ROOT, 'sbom.json');
const BASE_TMP_DIR = path.join(ROOT, '.sbom-base');
const BASE_BRANCH = process.env.SBOM_BASE || 'origin/main';
const ENFORCE = process.env.SBOM_ENFORCE === '1';

function fail(msg, code = 1) { console.error(msg); process.exit(code); }

if (!fs.existsSync(CURRENT_SBOM)) {
  fail('sbom.json não encontrado. Gere primeiro: npm run sbom');
}

// Obter sbom base
function ensureBase() {
  if (fs.existsSync(BASE_TMP_DIR)) return;
  fs.mkdirSync(BASE_TMP_DIR, { recursive: true });
  try {
    execSync(`git fetch --depth=1 origin main`, { stdio: 'ignore' });
  } catch (e) {
    console.warn('WARN: falha ao fetch main, continuando com comparação limitada.');
  }
  try {
    // Get sbom.json contents from base branch, then write to file safely.
    const baseSbom = execSync('git show ' + `${BASE_BRANCH}:sbom.json`);
    fs.writeFileSync(path.join(BASE_TMP_DIR, 'sbom.json'), baseSbom);
  } catch (e) {
    console.warn('WARN: sbom.json não encontrado na base, considerando todos componentes como NEW baseline.');
  }
}

ensureBase();

function readJSON(file) { return JSON.parse(fs.readFileSync(file, 'utf-8')); }

const current = readJSON(CURRENT_SBOM);
let base = { components: [] };
const basePath = path.join(BASE_TMP_DIR, 'sbom.json');
if (fs.existsSync(basePath)) {
  base = readJSON(basePath);
}

function indexByPurl(doc) {
  const map = new Map();
  (doc.components || []).forEach(c => {
    if (c.purl) map.set(c.purl, c);
  });
  return map;
}

const curIdx = indexByPurl(current);
const baseIdx = indexByPurl(base);

const additions = [];
for (const [purl, comp] of curIdx.entries()) {
  if (!baseIdx.has(purl)) additions.push(comp);
}

function classifyRisk(c) {
  const name = (c.name || '').toLowerCase();
  const desc = (c.description || '').toLowerCase();
  const signals = [];
  const riskyTokens = ['eval', 'crypto', 'shell', 'exec', 'native', 'binary'];
  for (const t of riskyTokens) {
    if (name.includes(t) || desc.includes(t)) signals.push(t);
  }
  let level = 'low';
  if (signals.length >= 2) level = 'high';
  else if (signals.length === 1) level = 'medium';
  return { level, signals };
}

const report = additions.map(c => {
  const risk = classifyRisk(c);
  return {
    name: c.name,
    version: c.version,
    purl: c.purl,
    license: c.license || (c.licenses && c.licenses[0]?.license?.id) || 'UNKNOWN',
    risk: risk.level,
    signals: risk.signals,
  };
});

// Output
console.log('\n🔍 SBOM Diff (modo ' + (ENFORCE ? 'enforce' : 'audit') + ')');
if (report.length === 0) {
  console.log('Nenhum componente novo em relação à base.');
  process.exit(0);
}

console.log('Novos componentes: ' + report.length);
console.log('Name'.padEnd(28) + 'Version'.padEnd(14) + 'Risk'.padEnd(8) + 'Signals');
for (const r of report) {
  console.log(
    (r.name || '').padEnd(28).slice(0,28) +
    (String(r.version || '')).padEnd(14).slice(0,14) +
    r.risk.padEnd(8) + r.signals.join(',')
  );
}

const highRisk = report.filter(r => r.risk === 'high');
if (ENFORCE && highRisk.length > 0) {
  fail(`Encontrados ${highRisk.length} componentes de alto risco. Falhando.`);
}

console.log('\nResumo:');
console.log('  High:   ' + report.filter(r => r.risk === 'high').length);
console.log('  Medium: ' + report.filter(r => r.risk === 'medium').length);
console.log('  Low:    ' + report.filter(r => r.risk === 'low').length);
console.log('\n✅ Modo audit concluído (exit 0). Defina SBOM_ENFORCE=1 para enforcement.');
