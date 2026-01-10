import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  
  // Otimizações agressivas para CI
  retries: isCI ? 3 : 0, // Aumentado para 3 retries em CI para falhas de rede
  workers: isCI ? 1 : undefined, // Reduzido para 1 worker em CI para evitar sobrecarga e race conditions
  timeout: 60 * 1000, // Aumentado para 60 segundos por teste (mais tolerante a lentidão)
  expect: {
    timeout: 15 * 1000, // Aumentado para 15 segundos
  },
  
  // Global timeout para todo o conjunto de testes
  globalTimeout: isCI ? 30 * 60 * 1000 : undefined, // 30 minutos em CI (aumentado para dar mais tempo)
  
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
    // Timeouts aumentados para evitar falhas de conexão
    actionTimeout: 10 * 1000, // 10 segundos
    navigationTimeout: 30 * 1000, // 30 segundos
    // Otimizações de rede
    ignoreHTTPSErrors: true,
    // Desabilitar animações para testes mais rápidos
    reducedMotion: 'reduce',
    // Retry em falhas de rede
    httpCredentials: undefined,
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
    timeout: 180 * 1000, // 3 minutos para iniciar (aumentado para CI)
    stdout: 'pipe',
    stderr: 'pipe',
    // Garantir que o servidor está totalmente iniciado
    stdoutFilter: (line) => {
      // Filtrar linhas vazias e logs de build
      if (!line || line.trim() === '') {return undefined;}
      // Em CI, mostrar mais logs para debug
      if (isCI && (line.includes('Local:') || line.includes('Network:') || line.includes('ready'))) {
        return line;
      }
      // Log apenas erros críticos
      if (line.includes('Error') || line.includes('error') || line.includes('EADDRINUSE')) {
        return line;
      }
      return undefined;
    },
    // Verificar que o servidor está realmente pronto
    ignoreHTTPSErrors: true,
  },
});
