#!/usr/bin/env node
/**
 * Script de monitoramento de performance para desenvolvimento
 * Coleta métricas e detecta degradações de performance
 */

import fs from 'fs/promises';
import path from 'path';

const PERFORMANCE_THRESHOLDS = {
  // Métricas de build (em segundos)
  BUILD_TIME_MAX: 120,
  TYPE_CHECK_MAX: 30,
  LINT_TIME_MAX: 15,
  
  // Métricas de bundle
  BUNDLE_SIZE_MAX_MB: 2,
  CHUNK_COUNT_MAX: 50,
  
  // Métricas de testes
  UNIT_TESTS_MAX: 60,
  INTEGRATION_TESTS_MAX: 180
};

/**
 * Coleta métricas de performance
 */
async function collectMetrics() {
  const metrics = {
    timestamp: new Date().toISOString(),
    build: {},
    bundle: {},
    tests: {}
  };

  console.log('📊 Coletando métricas de performance...\n');

  // Métricas de build
  await measureBuildTime(metrics);
  
  // Métricas de bundle (se disponível)
  await measureBundleMetrics(metrics);
  
  // Métricas de testes
  await measureTestMetrics(metrics);

  return metrics;
}

/**
 * Mede tempo de build
 */
async function measureBuildTime(metrics) {
  console.log('⏱️  Medindo tempo de build...');
  
  const startTime = Date.now();
  
  try {
    const { spawn } = await import('child_process');
    
    await new Promise((resolve, reject) => {
      const process = spawn('npm', ['run', 'build'], { 
        stdio: 'pipe',
        shell: true
      });
      
      process.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Build failed with code ${code}`));
      });
    });
    
    metrics.build.totalTime = (Date.now() - startTime) / 1000;
    metrics.build.status = 'success';
    
    console.log(`✅ Build concluído em ${metrics.build.totalTime.toFixed(1)}s`);
    
  } catch (error) {
    metrics.build.status = 'failed';
    metrics.build.error = error.message;
    console.log('❌ Build falhou:', error.message);
  }
}

/**
 * Mede métricas de bundle
 */
async function measureBundleMetrics(metrics) {
  try {
    // Verificar se existe bundle-visualizer.html (mais preciso)
    try {
      await fs.access('bundle-visualizer.html');
      // Parse do arquivo HTML para métricas precisas
      await parseBundleVisualizer(metrics);
    } catch (accessError) {
      // Fallback para cálculo de diretório (apenas arquivos JS/CSS)
      console.log('Bundle visualizer não encontrado, usando fallback:', accessError.message);
      await calculateBundleFromDist(metrics);
    }
    
    console.log(`📦 Bundle: ${(metrics.bundle.totalSize / 1024 / 1024).toFixed(2)}MB`);
    
  } catch (error) {
    console.log('⚠️  Erro ao coletar métricas de bundle:', error.message);
    metrics.bundle.totalSize = 0;
  }
}

/**
 * Parse do bundle-visualizer.html para métricas precisas
 */
async function parseBundleVisualizer(metrics) {
  try {
    const html = await fs.readFile('bundle-visualizer.html', 'utf8');
    
    // Extrair dados JSON do arquivo HTML
    const dataMatch = html.match(/window\.chartData\s*=\s*(\{.*?\});/s);
    if (dataMatch) {
      const bundleData = JSON.parse(dataMatch[1]);
      
      let totalSize = 0;
      let fileCount = 0;
      
      function traverseBundle(node) {
        if (node.size) {
          totalSize += node.size;
          fileCount++;
        }
        if (node.children) {
          node.children.forEach(traverseBundle);
        }
      }
      
      traverseBundle(bundleData);
      
      metrics.bundle.totalSize = totalSize;
      metrics.bundle.fileCount = fileCount;
      metrics.bundle.source = 'visualizer';
    }
  } catch (error) {
    console.error('Erro ao medir métricas de bundle:', error.message);
    await calculateBundleFromDist(metrics);
  }
}

/**
 * Calcula bundle size apenas dos arquivos de produção
 */
async function calculateBundleFromDist(metrics) {
  const distStats = await getBundleSize('dist');
  
  // Verificar .next/static para Next.js
  let nextStats = { size: 0, files: 0 };
  try {
    nextStats = await getBundleSize('.next/static');
  } catch {
    // .next não existe
  }
  
  metrics.bundle.distSize = distStats.size;
  metrics.bundle.nextSize = nextStats.size;
  metrics.bundle.totalSize = distStats.size + nextStats.size;
  metrics.bundle.fileCount = distStats.files + nextStats.files;
  metrics.bundle.source = 'filesystem';
}

/**
 * Calcula tamanho apenas de arquivos de bundle (JS, CSS, assets)
 */
async function getBundleSize(dirPath) {
  let totalSize = 0;
  let fileCount = 0;
  
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        const subStats = await getBundleSize(itemPath);
        totalSize += subStats.size;
        fileCount += subStats.files;
      } else {
        // Apenas arquivos relevantes para bundle
        const ext = path.extname(item.name).toLowerCase();
        if (['.js', '.css', '.woff', '.woff2', '.png', '.jpg', '.jpeg', '.svg', '.webp'].includes(ext)) {
          const stats = await fs.stat(itemPath);
          totalSize += stats.size;
          fileCount++;
        }
      }
    }
  } catch (error) {
    console.warn('Erro ao calcular tamanho do bundle:', error.message);
    return { size: 0, files: 0 };
  }
  
  return { size: totalSize, files: fileCount };
}

/**
 * Mede métricas de testes
 */
async function measureTestMetrics(metrics) {
  console.log('🧪 Medindo tempo de testes...');
  
  try {
    const startTime = Date.now();
    
    const { spawn } = await import('child_process');
    
    await new Promise((resolve, reject) => {
      const process = spawn('npm', ['test'], { 
        stdio: 'pipe',
        shell: true
      });
      
      process.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Tests failed with code ${code}`));
      });
    });
    
    metrics.tests.unitTime = (Date.now() - startTime) / 1000;
    metrics.tests.status = 'success';
    
    console.log(`✅ Testes concluídos em ${metrics.tests.unitTime.toFixed(1)}s`);
    
  } catch (error) {
    metrics.tests.status = 'failed';
    metrics.tests.error = error.message;
    console.log('❌ Testes falharam:', error.message);
  }
}

/**
 * Calcula tamanho de diretório recursivamente
 */
async function getDirectorySize(dirPath) {
  let totalSize = 0;
  let fileCount = 0;
  
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item.name);
      
      if (item.isDirectory()) {
        const subStats = await getDirectorySize(itemPath);
        totalSize += subStats.size;
        fileCount += subStats.files;
      } else {
        const stats = await fs.stat(itemPath);
        totalSize += stats.size;
        fileCount++;
      }
    }
  } catch (error) {
    // Diretório não existe ou erro de acesso
    console.warn('Diretório não acessível:', error.message);
    return { size: 0, files: 0 };
  }
  
  return { size: totalSize, files: fileCount };
}

/**
 * Verifica se há degradações de performance
 */
function checkPerformanceRegressions(metrics) {
  const issues = [];
  
  // Verificar thresholds de build
  if (metrics.build.totalTime > PERFORMANCE_THRESHOLDS.BUILD_TIME_MAX) {
    issues.push(`Build muito lento: ${metrics.build.totalTime}s (máx: ${PERFORMANCE_THRESHOLDS.BUILD_TIME_MAX}s)`);
  }
  
  // Verificar bundle size
  const bundleSizeMB = metrics.bundle.totalSize / 1024 / 1024;
  if (bundleSizeMB > PERFORMANCE_THRESHOLDS.BUNDLE_SIZE_MAX_MB) {
    issues.push(`Bundle muito grande: ${bundleSizeMB.toFixed(2)}MB (máx: ${PERFORMANCE_THRESHOLDS.BUNDLE_SIZE_MAX_MB}MB)`);
  }
  
  // Verificar testes
  if (metrics.tests.unitTime > PERFORMANCE_THRESHOLDS.UNIT_TESTS_MAX) {
    issues.push(`Testes muito lentos: ${metrics.tests.unitTime}s (máx: ${PERFORMANCE_THRESHOLDS.UNIT_TESTS_MAX}s)`);
  }
  
  return issues;
}

/**
 * Salva métricas no histórico
 */
async function saveMetricsHistory(metrics) {
  try {
    let history = [];
    
    try {
      const data = await fs.readFile('.performance-history.json', 'utf8');
      history = JSON.parse(data);
    } catch {
      // Primeira execução
    }
    
    history.push(metrics);
    
    // Manter apenas últimos 30 registros
    if (history.length > 30) {
      history = history.slice(-30);
    }
    
    await fs.writeFile('.performance-history.json', JSON.stringify(history, null, 2));
    
  } catch (error) {
    console.warn('⚠️  Erro ao salvar histórico:', error.message);
  }
}

/**
 * Gera relatório de performance
 */
function generatePerformanceReport(metrics, issues) {
  console.log('\n📈 RELATÓRIO DE PERFORMANCE\n');
  
  console.log('⏱️  Tempos de Build:');
  if (metrics.build.status === 'success') {
    console.log(`   Total: ${metrics.build.totalTime.toFixed(1)}s`);
  } else {
    console.log(`   ❌ Build falhou: ${metrics.build.error}`);
  }
  
  console.log('\n📦 Bundle:');
  console.log(`   Tamanho total: ${(metrics.bundle.totalSize / 1024 / 1024).toFixed(2)}MB`);
  console.log(`   Arquivos: ${metrics.bundle.fileCount}`);
  
  console.log('\n🧪 Testes:');
  if (metrics.tests.status === 'success') {
    console.log(`   Tempo: ${metrics.tests.unitTime.toFixed(1)}s`);
  } else {
    console.log(`   ❌ Testes falharam: ${metrics.tests.error}`);
  }
  
  if (issues.length > 0) {
    console.log('\n⚠️  PROBLEMAS DE PERFORMANCE:');
    issues.forEach(issue => console.log(`   • ${issue}`));
    return false;
  } else {
    console.log('\n✅ Performance dentro dos parâmetros aceitáveis');
    return true;
  }
}

/**
 * Função principal
 */
async function main() {
  const metrics = await collectMetrics();
  const issues = checkPerformanceRegressions(metrics);
  const success = generatePerformanceReport(metrics, issues);
  
  await saveMetricsHistory(metrics);
  
  if (!success && process.env.CI) {
    console.log('\n❌ Performance regression detected');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});