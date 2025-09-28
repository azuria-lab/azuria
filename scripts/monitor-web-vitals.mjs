#!/usr/bin/env node
/**
 * Web Vitals Monitoring & Optimization Script
 * Automatiza coleta e análise de Core Web Vitals
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const VITALS_DATA_DIR = '.vitals-data';
const VITALS_HISTORY_FILE = join(VITALS_DATA_DIR, 'vitals-history.json');
const VITALS_REPORT_FILE = join(VITALS_DATA_DIR, 'latest-report.json');

// Thresholds para Core Web Vitals (baseado no Google)
const VITALS_THRESHOLDS = {
  'first-contentful-paint': { good: 1800, poor: 3000 },
  'largest-contentful-paint': { good: 2500, poor: 4000 },
  'first-input-delay': { good: 100, poor: 300 },
  'interaction-to-next-paint': { good: 200, poor: 500 },
  'cumulative-layout-shift': { good: 0.1, poor: 0.25 },
  'total-blocking-time': { good: 200, poor: 600 }
};

// Performance budgets por tipo de página
const PERFORMANCE_BUDGETS = {
  homepage: {
    fcp: 1500,
    lcp: 2000,
    cls: 0.05,
    tbt: 150
  },
  calculator: {
    fcp: 1800,
    lcp: 2500,
    cls: 0.1,
    tbt: 200
  },
  dashboard: {
    fcp: 2000,
    lcp: 3000,
    cls: 0.1,
    tbt: 300
  }
};

/**
 * Inicializa diretório de dados
 */
async function initializeDataDirectory() {
  if (!existsSync(VITALS_DATA_DIR)) {
    await mkdir(VITALS_DATA_DIR, { recursive: true });
    console.log(`📁 Created vitals data directory: ${VITALS_DATA_DIR}`);
  }
}

/**
 * Carrega histórico de Web Vitals
 */
async function loadVitalsHistory() {
  try {
    if (!existsSync(VITALS_HISTORY_FILE)) {
      return { runs: [], summary: {} };
    }
    const data = await readFile(VITALS_HISTORY_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('⚠️ Failed to load vitals history:', error.message);
    return { runs: [], summary: {} };
  }
}

/**
 * Salva dados de Web Vitals
 */
async function saveVitalsData(data) {
  try {
    await writeFile(VITALS_HISTORY_FILE, JSON.stringify(data, null, 2));
    console.log(`💾 Saved vitals data to ${VITALS_HISTORY_FILE}`);
  } catch (error) {
    console.error('❌ Failed to save vitals data:', error);
  }
}

/**
 * Avalia rating de uma métrica
 */
function getMetricRating(metricName, value) {
  const threshold = VITALS_THRESHOLDS[metricName];
  if (!threshold) return 'unknown';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Simula coleta de Web Vitals (em produção, viria do browser)
 */
async function collectWebVitals() {
  // Em produção, estes dados viriam do browser via web-vitals library
  // Aqui simulamos dados para demonstração
  return {
    'first-contentful-paint': Math.random() * 2000 + 1000,
    'largest-contentful-paint': Math.random() * 3000 + 1500,
    'first-input-delay': Math.random() * 200 + 50,
    'interaction-to-next-paint': Math.random() * 400 + 100,
    'cumulative-layout-shift': Math.random() * 0.2 + 0.05,
    'total-blocking-time': Math.random() * 400 + 100
  };
}

/**
 * Analisa Web Vitals e gera insights
 */
function analyzeWebVitals(metrics, previousMetrics = null) {
  const analysis = {
    metrics: {},
    overall_score: 0,
    issues: [],
    recommendations: [],
    trends: {}
  };

  let goodMetrics = 0;
  let totalMetrics = 0;

  // Analisa cada métrica
  Object.entries(metrics).forEach(([name, value]) => {
    const rating = getMetricRating(name, value);
    const isGood = rating === 'good';
    
    analysis.metrics[name] = {
      value: Math.round(value * 100) / 100,
      rating,
      threshold: VITALS_THRESHOLDS[name]
    };

    if (isGood) goodMetrics++;
    totalMetrics++;

    // Identifica problemas
    if (rating === 'poor') {
      analysis.issues.push({
        metric: name,
        value,
        severity: 'high',
        message: `${name} is in poor range (${Math.round(value)})`
      });
    } else if (rating === 'needs-improvement') {
      analysis.issues.push({
        metric: name,
        value,
        severity: 'medium',
        message: `${name} needs improvement (${Math.round(value)})`
      });
    }

    // Calcula trends se temos dados anteriores
    if (previousMetrics && previousMetrics[name]) {
      const change = value - previousMetrics[name];
      const percentChange = (change / previousMetrics[name]) * 100;
      
      analysis.trends[name] = {
        change: Math.round(change * 100) / 100,
        percent_change: Math.round(percentChange * 100) / 100,
        direction: change > 0 ? 'worse' : 'better'
      };
    }
  });

  // Score geral
  analysis.overall_score = Math.round((goodMetrics / totalMetrics) * 100);

  // Gera recomendações baseadas nos problemas
  analysis.recommendations = generateRecommendations(analysis.issues, analysis.metrics);

  return analysis;
}

/**
 * Gera recomendações específicas baseadas nos problemas
 */
function generateRecommendations(issues, metrics) {
  const recommendations = [];

  issues.forEach(issue => {
    switch (issue.metric) {
      case 'first-contentful-paint':
      case 'largest-contentful-paint':
        recommendations.push({
          type: 'performance',
          priority: issue.severity,
          action: 'Optimize Critical Rendering Path',
          description: 'Minimize render-blocking resources, optimize images, and implement resource hints',
          techniques: [
            'Preload critical resources with <link rel="preload">',
            'Implement lazy loading for images below the fold',
            'Use modern image formats (WebP, AVIF)',
            'Minimize and compress CSS/JS bundles'
          ]
        });
        break;

      case 'first-input-delay':
      case 'interaction-to-next-paint':
        recommendations.push({
          type: 'interactivity',
          priority: issue.severity,
          action: 'Optimize JavaScript Execution',
          description: 'Reduce main thread blocking and improve interactivity',
          techniques: [
            'Break up long-running tasks with setTimeout',
            'Use Web Workers for heavy computations',
            'Implement code splitting and lazy loading',
            'Optimize third-party scripts'
          ]
        });
        break;

      case 'cumulative-layout-shift':
        recommendations.push({
          type: 'stability',
          priority: issue.severity,
          action: 'Prevent Layout Shifts',
          description: 'Ensure visual stability during page load',
          techniques: [
            'Set explicit dimensions for images and videos',
            'Reserve space for dynamic content',
            'Use CSS aspect-ratio for responsive images',
            'Avoid inserting content above existing content'
          ]
        });
        break;

      case 'total-blocking-time':
        recommendations.push({
          type: 'blocking',
          priority: issue.severity,
          action: 'Reduce Main Thread Blocking',
          description: 'Minimize tasks that block the main thread',
          techniques: [
            'Defer non-critical JavaScript',
            'Optimize large DOM manipulations',
            'Use requestIdleCallback for non-urgent tasks',
            'Implement progressive enhancement'
          ]
        });
        break;
    }
  });

  // Remove duplicatas
  const uniqueRecommendations = recommendations.filter((rec, index, self) =>
    index === self.findIndex(r => r.action === rec.action)
  );

  return uniqueRecommendations.slice(0, 5); // Máximo 5 recomendações
}

/**
 * Gera relatório detalhado
 */
function generateDetailedReport(analysis, history) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      overall_score: analysis.overall_score,
      total_issues: analysis.issues.length,
      critical_issues: analysis.issues.filter(i => i.severity === 'high').length,
      performance_grade: getPerformanceGrade(analysis.overall_score)
    },
    metrics: analysis.metrics,
    issues: analysis.issues,
    recommendations: analysis.recommendations,
    trends: analysis.trends,
    historical_comparison: generateHistoricalComparison(analysis, history)
  };

  return report;
}

/**
 * Atribui nota de performance
 */
function getPerformanceGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Gera comparação histórica
 */
function generateHistoricalComparison(analysis, history) {
  if (history.runs.length < 2) {
    return { message: 'Insufficient historical data for comparison' };
  }

  const lastRun = history.runs[history.runs.length - 1];
  const currentScore = analysis.overall_score;
  const lastScore = lastRun.summary?.overall_score || 0;

  return {
    score_change: currentScore - lastScore,
    performance_trend: currentScore > lastScore ? 'improving' : 'declining',
    runs_analyzed: history.runs.length,
    best_score: Math.max(...history.runs.map(r => r.summary?.overall_score || 0)),
    average_score: Math.round(history.runs.reduce((sum, r) => sum + (r.summary?.overall_score || 0), 0) / history.runs.length)
  };
}

/**
 * Exibe relatório no console
 */
function displayReport(report) {
  console.log('\n🚀 Web Vitals Performance Report');
  console.log('═'.repeat(50));
  
  // Summary
  console.log(`\n📊 Overall Score: ${report.summary.overall_score}% (Grade: ${report.summary.performance_grade})`);
  console.log(`🔍 Issues Found: ${report.summary.total_issues} (${report.summary.critical_issues} critical)`);
  
  // Metrics
  console.log('\n📈 Core Web Vitals:');
  Object.entries(report.metrics).forEach(([name, data]) => {
    let emoji = '❌';
    if (data.rating === 'good') emoji = '✅';
    else if (data.rating === 'needs-improvement') emoji = '⚠️';
    
    console.log(`  ${emoji} ${name}: ${data.value} (${data.rating})`);
  });

  // Trends
  if (Object.keys(report.trends).length > 0) {
    console.log('\n📊 Trends:');
    Object.entries(report.trends).forEach(([metric, trend]) => {
      const arrow = trend.direction === 'better' ? '📈' : '📉';
      console.log(`  ${arrow} ${metric}: ${trend.percent_change > 0 ? '+' : ''}${trend.percent_change}%`);
    });
  }

  // Issues
  if (report.issues.length > 0) {
    console.log('\n⚠️ Issues Detected:');
    report.issues.forEach(issue => {
      const severity = issue.severity === 'high' ? '🔴' : '🟡';
      console.log(`  ${severity} ${issue.message}`);
    });
  }

  // Recommendations
  if (report.recommendations.length > 0) {
    console.log('\n💡 Optimization Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`\n  ${index + 1}. ${rec.action} (${rec.priority} priority)`);
      console.log(`     ${rec.description}`);
      if (rec.techniques && rec.techniques.length > 0) {
        console.log(`     Techniques:`);
        rec.techniques.forEach(technique => {
          console.log(`     • ${technique}`);
        });
      }
    });
  }

  // Historical comparison
  if (report.historical_comparison.score_change !== undefined) {
    const trend = report.historical_comparison.performance_trend;
    const emoji = trend === 'improving' ? '📈' : '📉';
    console.log(`\n${emoji} Historical Performance:`);
    console.log(`  Score change: ${report.historical_comparison.score_change > 0 ? '+' : ''}${report.historical_comparison.score_change}%`);
    console.log(`  Best score: ${report.historical_comparison.best_score}%`);
    console.log(`  Average: ${report.historical_comparison.average_score}%`);
  }

  console.log('\n' + '═'.repeat(50));
}

/**
 * Função principal
 */
async function main() {
  try {
    console.log('🔄 Starting Web Vitals monitoring...');
    
    await initializeDataDirectory();
    
    // Carrega histórico
    const history = await loadVitalsHistory();
    const previousMetrics = history.runs.length > 0 ? 
      history.runs[history.runs.length - 1].metrics : null;

    // Coleta métricas atuais
    console.log('📊 Collecting Web Vitals metrics...');
    const metrics = await collectWebVitals();

    // Analisa os resultados
    console.log('🔍 Analyzing performance data...');
    const analysis = analyzeWebVitals(metrics, 
      previousMetrics ? Object.fromEntries(
        Object.entries(previousMetrics).map(([k, v]) => [k, v.value])
      ) : null
    );

    // Gera relatório detalhado
    const report = generateDetailedReport(analysis, history);

    // Atualiza histórico
    history.runs.push({
      timestamp: report.timestamp,
      metrics: analysis.metrics,
      summary: report.summary
    });

    // Mantém apenas os últimos 50 runs
    if (history.runs.length > 50) {
      history.runs = history.runs.slice(-50);
    }

    // Atualiza summary geral
    history.summary = {
      total_runs: history.runs.length,
      last_updated: report.timestamp,
      average_score: Math.round(
        history.runs.reduce((sum, r) => sum + r.summary.overall_score, 0) / history.runs.length
      )
    };

    // Salva dados
    await saveVitalsData(history);
    await writeFile(VITALS_REPORT_FILE, JSON.stringify(report, null, 2));

    // Exibe relatório
    displayReport(report);

    // Exit codes para CI/CD
    if (report.summary.critical_issues > 0) {
      console.log('\n❌ Critical performance issues detected!');
      process.exit(1);
    }

    if (report.summary.overall_score < 70) {
      console.log('\n⚠️ Performance score below threshold (70%)');
      process.exit(1);
    }

    console.log('\n✅ Web Vitals monitoring completed successfully');

  } catch (error) {
    console.error('❌ Error in Web Vitals monitoring:', error);
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { analyzeWebVitals, generateRecommendations, collectWebVitals };