#!/usr/bin/env node
/**
 * Simple coverage badge generator.
 * Reads coverage/coverage-summary.json (Vitest json-summary reporter)
 * and produces an SVG badge at coverage/coverage-badge.svg based on lines %.
 */
import fs from 'fs';
import path from 'path';

const summaryPath = path.resolve('coverage', 'coverage-summary.json');
const outDir = path.resolve('coverage');
const badgePath = path.resolve(outDir, 'coverage-badge.svg');

function loadSummary() {
  if (!fs.existsSync(summaryPath)) {
    console.error(`[coverage-badge] summary file not found: ${summaryPath}`);
    process.exit(0); // do not fail the pipeline; maybe no tests executed
  }
  try {
    return JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
  } catch (e) {
    console.error('[coverage-badge] failed to parse coverage summary:', e);
    process.exit(0);
  }
}

function pickPct(summary) {
  const totals = summary.total || summary; // fallback
  // Prefer lines, then statements
  const pct = (totals.lines && totals.lines.pct) || (totals.statements && totals.statements.pct) || 0;
  return Math.round(pct * 10) / 10; // one decimal
}

function colorFor(pct) {
  if (pct >= 85) return '#2ea44f'; // green
  if (pct >= 70) return '#dfb317'; // yellow
  if (pct >= 50) return '#fe7d37'; // orange
  return '#e05d44'; // red
}

function generateSVG(pct) {
  const label = 'coverage';
  const color = colorFor(pct);
  const text = `${pct}%`;
  // Basic shield-style badge (not pixel perfect but good enough)
  const labelWidth = 70; // approximate
  const valueWidth = 60; // approximate
  const totalWidth = labelWidth + valueWidth;
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${text}">` +
    `<linearGradient id="smooth" x2="0" y2="100%"><stop offset="0" stop-color="#fff" stop-opacity=".7"/><stop offset=".1" stop-opacity=".1"/><stop offset=".9" stop-opacity=".3"/><stop offset="1" stop-opacity=".5"/></linearGradient>` +
    `<mask id="round"><rect width="${totalWidth}" height="20" rx="3" fill="#fff"/></mask>` +
    `<g mask="url(#round)">` +
    `<rect width="${labelWidth}" height="20" fill="#555"/>` +
    `<rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>` +
    `<rect width="${totalWidth}" height="20" fill="url(#smooth)"/>` +
    `</g>` +
    `<g aria-hidden="true" fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="11">` +
    `<text x="${labelWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${label}</text><text x="${labelWidth / 2}" y="14">${label}</text>` +
    `<text x="${labelWidth + valueWidth / 2}" y="15" fill="#010101" fill-opacity=".3">${text}</text><text x="${labelWidth + valueWidth / 2}" y="14">${text}</text>` +
    `</g>` +
    `</svg>`;
}

function ensureOutDir() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
}

function main() {
  ensureOutDir();
  const summary = loadSummary();
  const pct = pickPct(summary);
  const svg = generateSVG(pct);
  fs.writeFileSync(badgePath, svg, 'utf-8');
  console.log(`[coverage-badge] Generated badge at ${badgePath} (${pct}%)`);
}

main();
