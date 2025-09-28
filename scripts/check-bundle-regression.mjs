#!/usr/bin/env node
/**
 * Script para detectar regressões no tamanho do bundle
 * Analisa bundle-visualizer.html e verifica se há crescimento significativo
 */

import fs from 'fs/promises';
import path from 'path';

const THRESHOLDS = {
  // Tamanhos máximos recomendados (em KB)
  MAIN_CHUNK_MAX: 500,
  VENDOR_CHUNK_MAX: 800,
  TOTAL_JS_MAX: 1200,
  // Crescimento máximo permitido (%)
  REGRESSION_THRESHOLD: 10
};

/**
 * Extrai informações de tamanho do bundle-visualizer.html
 */
async function analyzeBundleSize() {
  try {
    const bundleHtml = await fs.readFile('bundle-visualizer.html', 'utf8');
    
    // Regex para extrair dados do visualizer (formato atualizado)
    const dataMatch = bundleHtml.match(/const data\s*=\s*(\{.*?\});/s);
    if (!dataMatch) {
      console.warn('⚠️  Não foi possível extrair dados do bundle-visualizer.html');
      return null;
    }

    const data = JSON.parse(dataMatch[1]);
    const analysis = parseChunks(data);
    
    return analysis;
  } catch (error) {
    console.error('❌ Erro ao analisar bundle:', error.message);
    return null;
  }
}

/**
 * Parse dos chunks para calcular tamanhos
 */
function parseChunks(data) {
  let totalSize = 0;
  let mainChunkSize = 0;
  let vendorChunkSize = 0;
  const chunks = [];

  function traverse(node) {
    if (node.children) {
      node.children.forEach(traverse);
    } else if (node.statSize) {
      const sizeKB = Math.round(node.statSize / 1024);
      totalSize += sizeKB;
      
      chunks.push({
        name: node.label,
        size: sizeKB
      });
      
      // Identificar chunks principais
      if (node.label.includes('index') || node.label.includes('main')) {
        mainChunkSize += sizeKB;
      } else if (node.label.includes('vendor') || node.label.includes('node_modules')) {
        vendorChunkSize += sizeKB;
      }
    }
  }

  traverse(data);

  return {
    totalSize,
    mainChunkSize,
    vendorChunkSize,
    chunks: chunks.sort((a, b) => b.size - a.size).slice(0, 10) // Top 10 maiores
  };
}

/**
 * Carrega histórico anterior (se existir)
 */
async function loadPreviousAnalysis() {
  try {
    const data = await fs.readFile('.bundle-analysis-history.json', 'utf8');
    return JSON.parse(data);
  } catch {
    return null; // Primeira execução
  }
}

/**
 * Salva análise atual no histórico
 */
async function saveAnalysis(analysis) {
  try {
    await fs.writeFile('.bundle-analysis-history.json', JSON.stringify(analysis, null, 2));
  } catch (error) {
    console.warn('⚠️  Não foi possível salvar histórico:', error.message);
  }
}

/**
 * Verifica se há regressões de tamanho
 */
function checkRegressions(current, previous) {
  const issues = [];
  
  // Verificar thresholds absolutos
  if (current.totalSize > THRESHOLDS.TOTAL_JS_MAX) {
    issues.push(`Bundle total muito grande: ${current.totalSize}KB (máx: ${THRESHOLDS.TOTAL_JS_MAX}KB)`);
  }
  
  if (current.mainChunkSize > THRESHOLDS.MAIN_CHUNK_MAX) {
    issues.push(`Chunk principal muito grande: ${current.mainChunkSize}KB (máx: ${THRESHOLDS.MAIN_CHUNK_MAX}KB)`);
  }
  
  if (current.vendorChunkSize > THRESHOLDS.VENDOR_CHUNK_MAX) {
    issues.push(`Chunk vendor muito grande: ${current.vendorChunkSize}KB (máx: ${THRESHOLDS.VENDOR_CHUNK_MAX}KB)`);
  }

  // Verificar regressões relativas
  if (previous) {
    const totalGrowth = ((current.totalSize - previous.totalSize) / previous.totalSize) * 100;
    if (totalGrowth > THRESHOLDS.REGRESSION_THRESHOLD) {
      issues.push(`Regressão no bundle total: +${totalGrowth.toFixed(1)}% (${previous.totalSize}KB → ${current.totalSize}KB)`);
    }
  }

  return issues;
}

/**
 * Gera relatório formatado
 */
function generateReport(analysis, previous, issues) {
  console.log('\n📊 ANÁLISE DE BUNDLE\n');
  
  console.log('📏 Tamanhos Atuais:');
  console.log(`   Total: ${analysis.totalSize}KB`);
  console.log(`   Main chunk: ${analysis.mainChunkSize}KB`);
  console.log(`   Vendor chunk: ${analysis.vendorChunkSize}KB`);
  
  if (previous) {
    const totalChange = analysis.totalSize - previous.totalSize;
    const changeSymbol = totalChange > 0 ? '📈' : totalChange < 0 ? '📉' : '➡️';
    console.log(`\n${changeSymbol} Comparação com execução anterior:`);
    console.log(`   Total: ${totalChange >= 0 ? '+' : ''}${totalChange}KB`);
  }

  console.log('\n🏆 Maiores chunks:');
  analysis.chunks.slice(0, 5).forEach((chunk, i) => {
    console.log(`   ${i + 1}. ${chunk.name}: ${chunk.size}KB`);
  });

  if (issues.length > 0) {
    console.log('\n⚠️  PROBLEMAS DETECTADOS:');
    issues.forEach(issue => console.log(`   • ${issue}`));
    return false;
  } else {
    console.log('\n✅ Bundle dentro dos limites aceitáveis');
    return true;
  }
}

/**
 * Verifica se os tamanhos estão dentro do performance budget
 */
function checkPerformanceBudget(analysis, strict = false) {
  console.log('\n🎯 Performance Budget Check...');
  let hasViolations = false;
  
  const checks = [
    {
      name: 'Main Chunk',
      current: analysis.mainChunkSize,
      budget: THRESHOLDS.MAIN_CHUNK_MAX,
      unit: 'KB'
    },
    {
      name: 'Vendor Chunk', 
      current: analysis.vendorChunkSize,
      budget: THRESHOLDS.VENDOR_CHUNK_MAX,
      unit: 'KB'
    },
    {
      name: 'Total JS',
      current: analysis.totalSize,
      budget: THRESHOLDS.TOTAL_JS_MAX,
      unit: 'KB'
    }
  ];
  
  checks.forEach(check => {
    const isOverBudget = check.current > check.budget;
    const percentage = ((check.current / check.budget) * 100).toFixed(1);
    const status = isOverBudget ? '❌' : '✅';
    
    console.log(`${status} ${check.name}: ${check.current}${check.unit} / ${check.budget}${check.unit} (${percentage}%)`);
    
    if (isOverBudget) {
      hasViolations = true;
      if (strict) {
        console.log(`   ⚠️  Budget violation: exceeds by ${check.current - check.budget}${check.unit}`);
      }
    }
  });
  
  if (hasViolations && strict) {
    console.log('\n🚫 Performance budget violations detected in strict mode');
  } else if (!hasViolations) {
    console.log('\n✅ All bundles within performance budget');
  }
  
  return hasViolations && strict;
}

/**
 * Gera relatório em formato JSON
 */
function generateJsonReport(analysis, previous, issues) {
  const report = {
    current: analysis,
    previous: previous,
    issues: issues,
    hasRegression: issues.length > 0,
    timestamp: new Date().toISOString()
  };
  
  console.log(JSON.stringify(report, null, 2));
  return issues.length === 0;
}

/**
 * Gera relatório em formato Markdown
 */
function generateMarkdownReport(analysis, previous, issues) {
  console.log('| Metric | Current | Previous | Change |');
  console.log('|--------|---------|----------|--------|');
  
  // Calcular mudanças de forma mais limpa
  const totalChange = previous ? analysis.totalSize - previous.totalSize : 0;
  const mainChange = previous ? analysis.mainChunkSize - previous.mainChunkSize : 0;
  const vendorChange = previous ? analysis.vendorChunkSize - previous.vendorChunkSize : 0;
  
  const formatChange = (change) => {
    if (!previous) return 'N/A';
    return change >= 0 ? `+${change}KB` : `${change}KB`;
  };
  
  console.log(`| Total Size | ${analysis.totalSize}KB | ${previous?.totalSize || 'N/A'}KB | ${formatChange(totalChange)} |`);
  console.log(`| Main Chunk | ${analysis.mainChunkSize}KB | ${previous?.mainChunkSize || 'N/A'}KB | ${formatChange(mainChange)} |`);
  console.log(`| Vendor Chunk | ${analysis.vendorChunkSize}KB | ${previous?.vendorChunkSize || 'N/A'}KB | ${formatChange(vendorChange)} |`);
  
  if (issues.length > 0) {
    console.log('\n**⚠️ Issues Detected:**\n');
    issues.forEach(issue => console.log(`- ${issue}`));
  } else {
    console.log('\n**✅ No issues detected**');
  }
  
  console.log('\n**📊 Top Chunks:**\n');
  analysis.chunks.slice(0, 5).forEach((chunk, i) => {
    console.log(`${i + 1}. \`${chunk.name}\`: ${chunk.size}KB`);
  });
  
  return issues.length === 0;
}

/**
 * Função principal
 */
async function main() {
  const analysis = await analyzeBundleSize();
  
  if (!analysis) {
    console.log('❌ Não foi possível analisar o bundle. Verifique se bundle-visualizer.html existe.');
    process.exit(1);
  }

  const previous = await loadPreviousAnalysis();
  const issues = checkRegressions(analysis, previous);
  
  // Diferentes formatos de output
  const isJsonMode = process.argv.includes('--json');
  const isMarkdownMode = process.argv.includes('--markdown');
  const isStrict = process.argv.includes('--strict');
  
  let success;
  let hasBudgetViolations = false;

  if (isJsonMode) {
    success = generateJsonReport(analysis, previous, issues);
  } else if (isMarkdownMode) {
    success = generateMarkdownReport(analysis, previous, issues);
  } else {
    success = generateReport(analysis, previous, issues);
    hasBudgetViolations = checkPerformanceBudget(analysis, isStrict);
  }
  
  // Salvar para próxima comparação
  await saveAnalysis(analysis);
  
  if ((!success || hasBudgetViolations) && (process.env.CI || isStrict)) {
    if (!isJsonMode && !isMarkdownMode) {
      console.log('\n❌ Bundle regression check failed');
    }
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});