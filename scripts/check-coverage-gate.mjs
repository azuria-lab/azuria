#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * Coverage Gate Script
 * - Lê coverage/coverage-summary.json (gerado pelo Vitest)
 * - Compara com thresholds mínimos (config local) e baseline (arquivo ou main)
 * - Falha se global < mínimo OU queda > delta permitido
 */

const ROOT = process.cwd();
const SUMMARY_PATH = path.join(ROOT, 'coverage', 'coverage-summary.json');
const BASELINE_PATH = path.join(ROOT, 'coverage-baseline.json');

const MIN_THRESHOLDS = {
  statements: 70,
  lines: 70,
  functions: 70,
  branches: 60,
};

const MAX_NEGATIVE_DELTA = 2; // pontos percentuais

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

function format(val) {
  return typeof val === 'number' ? val.toFixed(2) : val;
}

function exitFail(msg) {
  console.error(`\n⛔ Coverage Gate FAILED: ${msg}`);
  process.exit(1);
}

if (!fs.existsSync(SUMMARY_PATH)) {
  exitFail('Arquivo coverage-summary.json não encontrado. Execute testes com --coverage antes.');
}

const summary = readJson(SUMMARY_PATH);
const totals = summary.total || summary;

let baseline = null;
if (fs.existsSync(BASELINE_PATH)) {
  try { baseline = readJson(BASELINE_PATH); } catch {}
}

const rows = [];
let hardFail = false;

for (const key of ['statements','lines','functions','branches']) {
  const pct = totals[key]?.pct;
  if (pct == null) {
    rows.push({ metric: key, current: 'N/A', baseline: baseline?.[key] ?? '—', delta: '—', status: 'missing' });
    hardFail = true;
    continue;
  }
  const min = MIN_THRESHOLDS[key];
  const base = baseline?.[key];
  const delta = base != null ? (pct - base) : 0;
  let status = 'ok';
  if (pct < min) {
    status = 'below-min';
    hardFail = true;
  } else if (base != null && delta < -MAX_NEGATIVE_DELTA) {
    status = 'regression';
    hardFail = true;
  } else if (base != null && delta < 0) {
    status = 'minor-drop';
  } else if (base != null && delta > 0) {
    status = 'improved';
  }
  rows.push({ metric: key, current: pct, baseline: base ?? '—', delta: base != null ? delta : '—', status });
}

// Print report
console.log('\n📊 Coverage Gate Report');
console.log('Metric      Current  Baseline  Δ    Status');
for (const r of rows) {
  const cur = typeof r.current === 'number' ? r.current.toFixed(2) : r.current;
  const base = typeof r.baseline === 'number' ? r.baseline.toFixed(2) : r.baseline;
  const d = typeof r.delta === 'number' ? (r.delta >= 0 ? '+' + r.delta.toFixed(2) : r.delta.toFixed(2)) : r.delta;
  console.log(`${r.metric.padEnd(11)} ${String(cur).padStart(7)}  ${String(base).padStart(8)}  ${String(d).padStart(5)}  ${r.status}`);
}

if (hardFail) {
  exitFail('Cobertura abaixo do mínimo ou regressão além do delta permitido.');
}

console.log('\n✅ Coverage dentro dos limites.');

// Atualização automática opcional (apenas em main) — deixado para workflow controlar.
