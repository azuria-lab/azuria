import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  
  // Otimizações agressivas para CI
  retries: isCI ? 1 : 0,
  workers: isCI ? 4 : undefined, // Aumentado para 4 workers em paralelo
  timeout: 15 * 1000, // Reduzido para 15 segundos por teste
  expect: {
    timeout: 5 * 1000, // Reduzido para 5 segundos
  },
  
  // Global timeout para todo o conjunto de testes
  globalTimeout: isCI ? 20 * 60 * 1000 : undefined, // 20 minutos em CI
  
  reporter: isCI
    ? [
        ['list'], // Lista simples em CI
        ['junit', { outputFile: 'test-results/results.xml' }],
      ]
    : [
        ['html'],
        ['json', { outputFile: 'test-results/results.json' }],
        ['junit', { outputFile: 'test-results/results.xml' }],
      ],
  
  use: {
    baseURL: 'http://127.0.0.1:4173',
    // Desabilitar recursos pesados em CI
    trace: isCI ? 'off' : 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off', // Desabilitado para performance
    // Timeouts mais agressivos
    actionTimeout: 5 * 1000, // 5 segundos
    navigationTimeout: 15 * 1000, // 15 segundos
    // Otimizações de rede
    ignoreHTTPSErrors: true,
    // Desabilitar animações para testes mais rápidos
    reducedMotion: 'reduce',
  },

  // Em CI: apenas Chromium (mais rápido)
  projects: isCI
    ? [
        {
          name: 'chromium',
          use: { 
            ...devices['Desktop Chrome'],
            // Otimizações específicas do Chromium
            launchOptions: {
              args: [
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process',
              ],
            },
          },
        },
      ]
    : [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'firefox',
          use: { ...devices['Desktop Firefox'] },
        },
        {
          name: 'webkit',
          use: { ...devices['Desktop Safari'] },
        },
      ],

  // WebServer otimizado
  webServer: {
    command: isCI 
      ? 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173'
      : 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !isCI,
    timeout: 120 * 1000, // Reduzido para 2 minutos
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
