#!/usr/bin/env node
/**
 * Performance Budget Monitor
 * Monitora e valida orçamentos de performance em tempo real
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

const BUDGET_CONFIG_FILE = 'performance-budget.config.json';
const BUDGET_HISTORY_DIR = '.performance-budget';
const BUDGET_REPORT_FILE = join(BUDGET_HISTORY_DIR, 'budget-report.json');

// Configuração padrão de orçamentos
const DEFAULT_BUDGETS = {
  global: {
    // Resource budgets (em KB)
    'total-size': 1000,
    'script-size': 300,
    'stylesheet-size': 100,
    'image-size': 500,
    'font-size': 100,
    
    // Performance budgets (em ms)
    'first-contentful-paint': 2000,
    'largest-contentful-paint': 2500,
    'first-input-delay': 100,
    'total-blocking-time': 300,
    'cumulative-layout-shift': 0.1, // score, não ms
    
    // Network budgets
    'network-requests': 50,
    'third-party-size': 200,
    
    // Runtime budgets
    'dom-size': 1500, // número de elementos
    'memory-usage': 50, // MB
    'cpu-time': 5000 // ms
  },
  
  pages: {
    homepage: {
      'total-size': 800,
      'first-contentful-paint': 1500,
      'largest-contentful-paint': 2000,
    },
    
    calculator: {
      'script-size': 400, // Calculadoras podem precisar de mais JS
      'first-contentful-paint': 1800,
      'total-blocking-time': 400,
    },
    
    dashboard: {
      'total-size': 1200, // Dashboards têm mais dados
      'network-requests': 80,
      'dom-size': 2000,
    }
  }
};

/**
 * Carrega configuração de orçamentos
 */
async function loadBudgetConfig() {
  try {
    if (existsSync(BUDGET_CONFIG_FILE)) {
      const data = await readFile(BUDGET_CONFIG_FILE, 'utf-8');
      const config = JSON.parse(data);
      return { ...DEFAULT_BUDGETS, ...config };
    }
    
    // Cria configuração padrão se não existe
    await writeBudgetConfig(DEFAULT_BUDGETS);
    return DEFAULT_BUDGETS;
  } catch (error) {
    console.warn('⚠️ Failed to load budget config, using defaults:', error.message);
    return DEFAULT_BUDGETS;
  }
}

/**
 * Salva configuração de orçamentos
 */
async function writeBudgetConfig(config) {
  try {
    await writeFile(BUDGET_CONFIG_FILE, JSON.stringify(config, null, 2));
    console.log(`💾 Budget configuration saved to ${BUDGET_CONFIG_FILE}`);
  } catch (error) {
    console.error('❌ Failed to save budget config:', error);
  }
}

/**
 * Inicializa diretório de relatórios
 */
async function initializeBudgetDirectory() {
  if (!existsSync(BUDGET_HISTORY_DIR)) {
    await mkdir(BUDGET_HISTORY_DIR, { recursive: true });
    console.log(`📁 Created budget history directory: ${BUDGET_HISTORY_DIR}`);
  }
}

/**
 * Simula coleta de métricas de performance
 * Em produção, viria de ferramentas como Lighthouse, WebPageTest, etc.
 */
async function collectPerformanceMetrics(pageType = 'global') {
  // Simula dados reais de performance
  const baseMetrics = {
    'total-size': Math.random() * 1200 + 600,
    'script-size': Math.random() * 400 + 200,
    'stylesheet-size': Math.random() * 120 + 60,
    'image-size': Math.random() * 600 + 300,
    'font-size': Math.random() * 80 + 40,
    
    'first-contentful-paint': Math.random() * 2500 + 1000,
    'largest-contentful-paint': Math.random() * 3500 + 1500,
    'first-input-delay': Math.random() * 200 + 50,
    'total-blocking-time': Math.random() * 500 + 100,
    'cumulative-layout-shift': Math.random() * 0.3 + 0.05,
    
    'network-requests': Math.floor(Math.random() * 80 + 30),
    'third-party-size': Math.random() * 300 + 100,
    
    'dom-size': Math.floor(Math.random() * 2000 + 800),
    'memory-usage': Math.random() * 80 + 20,
    'cpu-time': Math.random() * 8000 + 2000
  };

  // Ajusta métricas baseado no tipo de página
  if (pageType === 'homepage') {
    baseMetrics['total-size'] *= 0.8;
    baseMetrics['script-size'] *= 0.7;
    baseMetrics['first-contentful-paint'] *= 0.8;
  } else if (pageType === 'calculator') {
    baseMetrics['script-size'] *= 1.3;
    baseMetrics['total-blocking-time'] *= 1.2;
  } else if (pageType === 'dashboard') {
    baseMetrics['total-size'] *= 1.4;
    baseMetrics['network-requests'] *= 1.5;
    baseMetrics['dom-size'] *= 1.3;
  }

  return baseMetrics;
}

/**
 * Valida métricas contra orçamentos
 */
function validateBudgets(metrics, budgets, pageType = 'global') {
  const violations = [];
  const warnings = [];
  
  // Usa orçamentos específicos da página ou globais
  const pageBudgets = budgets.pages?.[pageType] || {};
  const activeBudgets = { ...budgets.global, ...pageBudgets };

  Object.entries(metrics).forEach(([metric, value]) => {
    const budget = activeBudgets[metric];
    if (budget === undefined) return;

    const percentUsed = (value / budget) * 100;
    const isViolation = value > budget;
    const isWarning = percentUsed > 80 && !isViolation;

    if (isViolation) {
      violations.push({
        metric,
        value: Math.round(value * 100) / 100,
        budget,
        overage: Math.round((value - budget) * 100) / 100,
        percent_over: Math.round((percentUsed - 100) * 100) / 100,
        severity: percentUsed > 150 ? 'critical' : 'high'
      });
    } else if (isWarning) {
      warnings.push({
        metric,
        value: Math.round(value * 100) / 100,
        budget,
        percent_used: Math.round(percentUsed * 100) / 100,
        severity: 'medium'
      });
    }
  });

  return { violations, warnings };
}

/**
 * Gera recomendações baseadas nas violações
 */
function generateBudgetRecommendations(violations, warnings) {
  const recommendations = [];
  
  violations.forEach(violation => {
    switch (violation.metric) {
      case 'total-size':
        recommendations.push({
          type: 'resource-optimization',
          priority: 'high',
          action: 'Reduce Total Bundle Size',
          description: `Total size is ${violation.overage}KB over budget`,
          techniques: [
            'Enable gzip/brotli compression',
            'Implement tree shaking',
            'Use code splitting and lazy loading',
            'Optimize and compress images',
            'Remove unused dependencies'
          ]
        });
        break;

      case 'script-size':
        recommendations.push({
          type: 'javascript-optimization',
          priority: 'high',
          action: 'Optimize JavaScript Bundle',
          description: `JavaScript size is ${violation.overage}KB over budget`,
          techniques: [
            'Implement code splitting by route',
            'Use dynamic imports for heavy components',
            'Tree shake unused code',
            'Minify and optimize JavaScript',
            'Consider replacing heavy libraries'
          ]
        });
        break;

      case 'stylesheet-size':
        recommendations.push({
          type: 'css-optimization',
          priority: 'medium',
          action: 'Optimize CSS Bundle',
          description: `CSS size is ${violation.overage}KB over budget`,
          techniques: [
            'Remove unused CSS with PurgeCSS',
            'Use critical CSS for above-the-fold content',
            'Minify CSS files',
            'Consider CSS-in-JS solutions',
            'Optimize custom fonts and icons'
          ]
        });
        break;

      case 'image-size':
        recommendations.push({
          type: 'image-optimization',
          priority: 'high',
          action: 'Optimize Images',
          description: `Image size is ${violation.overage}KB over budget`,
          techniques: [
            'Use modern formats (WebP, AVIF)',
            'Implement responsive images',
            'Compress images with tools like imagemin',
            'Use lazy loading for below-the-fold images',
            'Consider CDN with automatic optimization'
          ]
        });
        break;

      case 'first-contentful-paint':
      case 'largest-contentful-paint':
        recommendations.push({
          type: 'rendering-optimization',
          priority: 'critical',
          action: 'Improve Page Load Performance',
          description: `${violation.metric} is ${Math.round(violation.overage)}ms over budget`,
          techniques: [
            'Optimize critical rendering path',
            'Preload important resources',
            'Minimize render-blocking resources',
            'Optimize server response times',
            'Use resource hints (dns-prefetch, preconnect)'
          ]
        });
        break;

      case 'network-requests':
        recommendations.push({
          type: 'network-optimization',
          priority: 'medium',
          action: 'Reduce Network Requests',
          description: `Network requests (${Math.round(violation.value)}) exceed budget by ${Math.round(violation.overage)}`,
          techniques: [
            'Bundle CSS and JavaScript files',
            'Use HTTP/2 for multiplexing',
            'Implement resource caching',
            'Combine small images into sprites',
            'Minimize third-party requests'
          ]
        });
        break;

      case 'dom-size':
        recommendations.push({
          type: 'dom-optimization',
          priority: 'medium',
          action: 'Optimize DOM Size',
          description: `DOM size (${Math.round(violation.value)} elements) exceeds budget by ${Math.round(violation.overage)}`,
          techniques: [
            'Implement virtual scrolling for large lists',
            'Use pagination for large datasets',
            'Remove unnecessary DOM elements',
            'Optimize component rendering',
            'Consider server-side rendering'
          ]
        });
        break;
    }
  });

  return recommendations.slice(0, 8); // Máximo 8 recomendações
}

/**
 * Gera relatório detalhado de orçamentos
 */
function generateBudgetReport(metrics, budgets, pageType, violations, warnings, recommendations) {
  const totalViolations = violations.length;
  const criticalViolations = violations.filter(v => v.severity === 'critical').length;
  
  // Calcula score geral
  const totalMetrics = Object.keys(budgets.global).length;
  const passedMetrics = totalMetrics - totalViolations;
  const budgetScore = Math.round((passedMetrics / totalMetrics) * 100);

  return {
    timestamp: new Date().toISOString(),
    page_type: pageType,
    summary: {
      budget_score: budgetScore,
      total_violations: totalViolations,
      critical_violations: criticalViolations,
      warnings: warnings.length,
      grade: getBudgetGrade(budgetScore)
    },
    metrics: Object.entries(metrics).map(([name, value]) => {
      const budget = budgets.global[name] || budgets.pages?.[pageType]?.[name];
      const percentUsed = budget ? (value / budget) * 100 : 0;
      
      // Determinar status da métrica
      let status = 'ok';
      if (violations.find(v => v.metric === name)) {
        status = 'violation';
      } else if (warnings.find(w => w.metric === name)) {
        status = 'warning';
      }
      
      return {
        name,
        value: Math.round(value * 100) / 100,
        budget: budget || null,
        percent_used: Math.round(percentUsed * 100) / 100,
        status
      };
    }),
    violations,
    warnings,
    recommendations,
    budgets_used: {
      global: budgets.global,
      page_specific: budgets.pages?.[pageType] || {}
    }
  };
}

/**
 * Atribui nota de orçamento
 */
function getBudgetGrade(score) {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Exibe relatório de orçamentos
 */
function displayBudgetReport(report) {
  console.log('\n💰 Performance Budget Report');
  console.log('═'.repeat(50));
  
  // Summary
  console.log(`\n📊 Budget Score: ${report.summary.budget_score}% (Grade: ${report.summary.grade})`);
  console.log(`📋 Page Type: ${report.page_type}`);
  console.log(`⚠️ Violations: ${report.summary.total_violations} (${report.summary.critical_violations} critical)`);
  console.log(`⚡ Warnings: ${report.summary.warnings}`);

  // Métricas principais com violações
  const violatedMetrics = report.metrics.filter(m => m.status === 'violation');
  if (violatedMetrics.length > 0) {
    console.log('\n❌ Budget Violations:');
    violatedMetrics.forEach(metric => {
      console.log(`  • ${metric.name}: ${metric.value} / ${metric.budget} (${metric.percent_used}%)`);
    });
  }

  // Warnings
  const warningMetrics = report.metrics.filter(m => m.status === 'warning');
  if (warningMetrics.length > 0) {
    console.log('\n⚠️ Budget Warnings (>80% used):');
    warningMetrics.forEach(metric => {
      console.log(`  • ${metric.name}: ${metric.value} / ${metric.budget} (${metric.percent_used}%)`);
    });
  }

  // Métricas OK (top 5)
  const okMetrics = report.metrics.filter(m => m.status === 'ok').slice(0, 5);
  if (okMetrics.length > 0) {
    console.log('\n✅ Budget Status (Sample):');
    okMetrics.forEach(metric => {
      console.log(`  • ${metric.name}: ${metric.value} / ${metric.budget} (${metric.percent_used}%)`);
    });
  }

  // Recomendações
  if (report.recommendations.length > 0) {
    console.log('\n💡 Budget Optimization Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`\n  ${index + 1}. ${rec.action} (${rec.priority} priority)`);
      console.log(`     ${rec.description}`);
      if (rec.techniques && rec.techniques.length > 0) {
        console.log(`     Techniques:`);
        rec.techniques.slice(0, 3).forEach(technique => {
          console.log(`     • ${technique}`);
        });
      }
    });
  }

  console.log('\n' + '═'.repeat(50));
}

/**
 * Função principal
 */
async function main() {
  const args = process.argv.slice(2);
  const pageType = args[0] || 'global';
  const strictMode = args.includes('--strict');

  try {
    console.log(`🔄 Monitoring performance budgets for: ${pageType}`);
    
    await initializeBudgetDirectory();
    
    // Carrega configuração de orçamentos
    const budgets = await loadBudgetConfig();
    
    // Coleta métricas de performance
    console.log('📊 Collecting performance metrics...');
    const metrics = await collectPerformanceMetrics(pageType);

    // Valida contra orçamentos
    console.log('💰 Validating against performance budgets...');
    const { violations, warnings } = validateBudgets(metrics, budgets, pageType);

    // Gera recomendações
    const recommendations = generateBudgetRecommendations(violations, warnings);

    // Gera relatório
    const report = generateBudgetReport(
      metrics, budgets, pageType, violations, warnings, recommendations
    );

    // Salva relatório
    await writeFile(BUDGET_REPORT_FILE, JSON.stringify(report, null, 2));
    console.log(`💾 Budget report saved to ${BUDGET_REPORT_FILE}`);

    // Exibe relatório
    displayBudgetReport(report);

    // Exit codes para CI/CD
    if (strictMode && violations.length > 0) {
      console.log('\n❌ Budget violations detected in strict mode!');
      process.exit(1);
    }

    if (report.summary.critical_violations > 0) {
      console.log('\n❌ Critical budget violations detected!');
      process.exit(1);
    }

    if (report.summary.budget_score < 70) {
      console.log('\n⚠️ Budget score below threshold (70%)');
      process.exit(1);
    }

    console.log('\n✅ Performance budget monitoring completed successfully');

  } catch (error) {
    console.error('❌ Error in budget monitoring:', error);
    process.exit(1);
  }
}

// Executa se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { validateBudgets, generateBudgetRecommendations, collectPerformanceMetrics };