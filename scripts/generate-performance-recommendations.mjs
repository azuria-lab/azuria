#!/usr/bin/env node
/**
 * Script para gerar recomendações de performance baseadas na análise do bundle
 */

import fs from 'fs/promises';

/**
 * Analisa o bundle e gera recomendações específicas
 */
async function generateRecommendations() {
  console.log('### 💡 Performance Recommendations\n');

  try {
    // Verificar se o bundle-visualizer.html existe
    const bundleExists = await fs.access('bundle-visualizer.html').then(() => true).catch(() => false);
    
    if (!bundleExists) {
      console.log('⚠️ Bundle analysis not available. Run `npm run analyze` first.\n');
      return;
    }

    const bundleHtml = await fs.readFile('bundle-visualizer.html', 'utf8');
    
    // Extrair dados do visualizer
    const dataMatch = bundleHtml.match(/const data\s*=\s*(\{.*?\});/s);
    if (!dataMatch) {
      console.log('⚠️ Could not parse bundle data.\n');
      return;
    }

    const data = JSON.parse(dataMatch[1]);
    const analysis = analyzeBundleData(data);
    
    // Gerar recomendações baseadas na análise
    generateOptimizationTips(analysis);
    
  } catch (error) {
    console.error('❌ Error generating recommendations:', error.message);
  }
}

/**
 * Analisa os dados do bundle para extrair insights
 */
function analyzeBundleData(data) {
  let totalSize = 0;
  let largeChunks = [];
  let duplicatedModules = [];
  let heavyDependencies = [];

  function analyzeNode(node, path = '') {
    if (node.children) {
      // É um diretório/chunk
      node.children.forEach(child => analyzeNode(child, `${path}/${node.label || ''}`));
    } else {
      // É um arquivo
      const size = node.statSize || 0;
      totalSize += size;
      
      // Identificar chunks grandes (>100KB)
      if (size > 100000) {
        largeChunks.push({
          name: `${path}/${node.label}`,
          size: Math.round(size / 1024)
        });
      }
      
      // Identificar dependências pesadas do node_modules
      if (path.includes('node_modules')) {
        const packageName = extractPackageName(path);
        if (packageName && size > 50000) {
          heavyDependencies.push({
            name: packageName,
            size: Math.round(size / 1024),
            path: path
          });
        }
      }
    }
  }

  analyzeNode(data);
  
  return {
    totalSize: Math.round(totalSize / 1024),
    largeChunks,
    heavyDependencies,
    duplicatedModules
  };
}

/**
 * Extrai o nome do pacote do caminho node_modules
 */
function extractPackageName(path) {
  const match = path.match(/node_modules\/(@?[^/]+(?:\/[^/]+)?)/);
  return match ? match[1] : null;
}

/**
 * Gera dicas de otimização baseadas na análise
 */
function generateOptimizationTips(analysis) {
  const tips = [];

  // Análise de tamanho total
  if (analysis.totalSize > 1000) {
    tips.push('🔸 **Bundle size is large (>1MB)**: Consider code splitting and lazy loading');
  } else if (analysis.totalSize > 500) {
    tips.push('🔸 **Bundle size is moderate**: Monitor growth and consider optimizations');
  } else {
    tips.push('✅ **Bundle size is good**: Keep monitoring as project grows');
  }

  // Análise de chunks grandes
  if (analysis.largeChunks.length > 0) {
    tips.push('🔸 **Large chunks detected**:');
    analysis.largeChunks.slice(0, 3).forEach(chunk => {
      tips.push(`   - \`${chunk.name}\`: ${chunk.size}KB - Consider code splitting`);
    });
  }

  // Análise de dependências pesadas
  if (analysis.heavyDependencies.length > 0) {
    tips.push('🔸 **Heavy dependencies found**:');
    
    // Agrupar por pacote e somar tamanhos
    const packageSizes = analysis.heavyDependencies.reduce((acc, dep) => {
      acc[dep.name] = (acc[dep.name] || 0) + dep.size;
      return acc;
    }, {});
    
    Object.entries(packageSizes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([name, size]) => {
        tips.push(`   - \`${name}\`: ${size}KB - ${getPackageOptimizationTip(name)}`);
      });
  }

  // Recomendações gerais
  tips.push('');
  tips.push('🔧 **General Optimization Tips**:');
  tips.push('   - Use dynamic imports for routes and heavy components');
  tips.push('   - Enable tree shaking for unused code elimination');
  tips.push('   - Consider replacing heavy dependencies with lighter alternatives');
  tips.push('   - Use bundle analyzer to identify optimization opportunities');
  tips.push('   - Implement proper caching strategies');

  // Outputs das dicas
  tips.forEach(tip => console.log(tip));
  console.log('');
}

/**
 * Retorna dica específica para otimização de pacotes conhecidos
 */
function getPackageOptimizationTip(packageName) {
  const tips = {
    'react-dom': 'Consider using React 18 concurrent features',
    'lodash': 'Use lodash-es or specific imports',
    'moment': 'Replace with date-fns or dayjs',
    '@radix-ui': 'Already optimized, consider selective imports',
    'framer-motion': 'Use LazyMotion for smaller bundle',
    'recharts': 'Consider lighter charting alternatives',
    'react-router-dom': 'Use code splitting with lazy routes',
    'next': 'Built-in optimizations, check for unused features'
  };
  
  return tips[packageName] || 'Check for lighter alternatives or selective imports';
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  generateRecommendations().catch(console.error);
}