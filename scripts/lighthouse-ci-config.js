// Lighthouse CI Configuration
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000',
        'http://localhost:3000/calculadoras/simples',
        'http://localhost:3000/calculadoras/pro',
        'http://localhost:3000/calculadoras/avancada'
      ],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        // Performance budgets
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['error', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 300 }],
        
        // Network and Resource budgets
        'resource-summary:script:size': ['error', { maxNumericValue: 250000 }],
        'resource-summary:total:size': ['error', { maxNumericValue: 1000000 }],
        'unused-javascript': ['error', { maxNumericValue: 50000 }],
        'render-blocking-resources': ['error', { maxNumericValue: 2 }],
        
        // Progressive Web App
        'installable-manifest': 'warn',
        'service-worker': 'warn',
        'offline-start-url': 'warn',
        
        // Security
        'is-on-https': ['error', { minScore: 1 }],
        'uses-https': ['error', { minScore: 1 }],
        
        // User Experience
        'interactive': ['error', { maxNumericValue: 3500 }],
        'speed-index': ['error', { maxNumericValue: 3000 }],
        'uses-responsive-images': 'warn',
        'efficient-animated-content': 'warn',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      port: 9001,
      storage: './lighthouse-ci-results',
    },
  },
  
  // Configurações para diferentes ambientes
  environments: {
    development: {
      ci: {
        collect: {
          url: ['http://localhost:3000'],
          numberOfRuns: 1,
        },
        assert: {
          assertions: {
            'categories:performance': ['warn', { minScore: 0.7 }],
            'categories:accessibility': ['error', { minScore: 0.9 }],
            'first-contentful-paint': ['warn', { maxNumericValue: 3000 }],
            'largest-contentful-paint': ['warn', { maxNumericValue: 4000 }],
          },
        },
      },
    },
    
    production: {
      ci: {
        collect: {
          numberOfRuns: 5, // Mais runs para produção
        },
        assert: {
          assertions: {
            'categories:performance': ['error', { minScore: 0.95 }],
            'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
            'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],
            'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
          },
        },
      },
    },
  },
};