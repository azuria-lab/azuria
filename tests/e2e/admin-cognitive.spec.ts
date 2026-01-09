/**
 * ══════════════════════════════════════════════════════════════════════════════
 * E2E TESTS - Admin Panel & Cognitive Dashboard
 * ══════════════════════════════════════════════════════════════════════════════
 *
 * Testes end-to-end para o painel administrativo e dashboard cognitivo.
 * Requer usuário admin logado.
 *
 * @module tests/e2e/admin-cognitive
 */

import { expect, test } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURAÇÃO
// ═══════════════════════════════════════════════════════════════════════════════

// Assumindo que temos um usuário admin de teste
const ADMIN_EMAIL = process.env.TEST_ADMIN_EMAIL || 'admin@azuria.test';
const ADMIN_PASSWORD = process.env.TEST_ADMIN_PASSWORD || 'TestAdmin123!';

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

async function loginAsAdmin(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login');
  
  // Preencher credenciais
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  
  // Submeter
  await page.click('button[type="submit"]');
  
  // Aguardar redirecionamento
  await page.waitForURL(/\/(dashboard|admin)/, { timeout: 10000 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// TESTES - ADMIN PANEL ACCESS
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Admin Panel Access', () => {
  test('should redirect to login if not authenticated', async ({ page }) => {
    await page.goto('/admin');
    
    // Deve redirecionar para login
    await expect(page).toHaveURL(/\/login/);
  });

  test('should redirect to home if not admin', async ({ page }) => {
    // Login com usuário comum (se configurado)
    // Este teste assume que um usuário não-admin tentando acessar /admin é redirecionado
    test.skip(!process.env.TEST_USER_EMAIL, 'Requires TEST_USER_EMAIL env var');
    
    await page.goto('/login');
    await page.fill('input[type="email"]', process.env.TEST_USER_EMAIL!);
    await page.fill('input[type="password"]', process.env.TEST_USER_PASSWORD!);
    await page.click('button[type="submit"]');
    
    await page.goto('/admin');
    
    // Deve redirecionar para home (não autorizado)
    await expect(page).toHaveURL('/');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTES - COGNITIVE DASHBOARD (Requer Admin)
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Cognitive Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Skip se não tem credenciais de admin
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'Requires TEST_ADMIN_EMAIL env var');
    await loginAsAdmin(page);
  });

  test('should access cognitive dashboard via admin panel', async ({ page }) => {
    await page.goto('/admin?tab=cognitive');
    
    // Verificar que a aba cognitiva está ativa
    await expect(page.locator('[data-value="cognitive"]')).toBeVisible();
    
    // Verificar componentes principais
    await expect(page.getByText('Sistema Cognitivo')).toBeVisible();
  });

  test('should redirect from /sistema-cognitivo to admin', async ({ page }) => {
    await page.goto('/sistema-cognitivo');
    
    // Deve redirecionar para /admin?tab=cognitive
    await expect(page).toHaveURL(/\/admin\?tab=cognitive/);
  });

  test('should display cognitive sub-tabs', async ({ page }) => {
    await page.goto('/admin?tab=cognitive');
    
    // Verificar sub-tabs
    await expect(page.getByRole('tab', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /métricas/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /alertas/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /replay/i })).toBeVisible();
  });

  test('should switch between cognitive sub-tabs', async ({ page }) => {
    await page.goto('/admin?tab=cognitive');
    
    // Clicar na aba Métricas
    await page.getByRole('tab', { name: /métricas/i }).click();
    await expect(page.getByText('Exportar JSON')).toBeVisible();
    
    // Clicar na aba Alertas
    await page.getByRole('tab', { name: /alertas/i }).click();
    await expect(page.getByText('Alertas Ativos')).toBeVisible();
    
    // Clicar na aba Replay
    await page.getByRole('tab', { name: /replay/i }).click();
    await expect(page.getByText('Iniciar Gravação')).toBeVisible();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTES - METRICS DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Metrics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'Requires TEST_ADMIN_EMAIL env var');
    await loginAsAdmin(page);
    await page.goto('/admin?tab=cognitive');
    await page.getByRole('tab', { name: /métricas/i }).click();
  });

  test('should display metrics overview', async ({ page }) => {
    // Verificar cards de métricas
    await expect(page.getByText(/total de métricas/i)).toBeVisible();
  });

  test('should toggle auto-refresh', async ({ page }) => {
    // Encontrar toggle de auto-refresh
    const toggle = page.locator('button[role="switch"]').first();
    
    // Deve estar habilitado por padrão
    await expect(toggle).toHaveAttribute('data-state', 'checked');
    
    // Clicar para desabilitar
    await toggle.click();
    await expect(toggle).toHaveAttribute('data-state', 'unchecked');
  });

  test('should export metrics as JSON', async ({ page }) => {
    // Setup download listener
    const downloadPromise = page.waitForEvent('download');
    
    // Clicar em exportar JSON
    await page.getByRole('button', { name: /exportar json/i }).click();
    
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/metrics.*\.json/);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTES - ALERTS PANEL
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Alerts Panel', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'Requires TEST_ADMIN_EMAIL env var');
    await loginAsAdmin(page);
    await page.goto('/admin?tab=cognitive');
    await page.getByRole('tab', { name: /alertas/i }).click();
  });

  test('should display alerts interface', async ({ page }) => {
    // Verificar elementos principais
    await expect(page.getByText('Alertas Ativos')).toBeVisible();
    await expect(page.getByText('Histórico')).toBeVisible();
  });

  test('should show alert rules', async ({ page }) => {
    // Clicar na aba de regras se existir
    const rulesTab = page.getByRole('tab', { name: /regras/i });
    if (await rulesTab.isVisible()) {
      await rulesTab.click();
      
      // Deve mostrar regras default
      await expect(page.getByText('Nucleus Error Rate')).toBeVisible();
    }
  });

  test('should open create rule dialog', async ({ page }) => {
    // Clicar em nova regra
    const newRuleBtn = page.getByRole('button', { name: /nova regra/i });
    if (await newRuleBtn.isVisible()) {
      await newRuleBtn.click();
      
      // Verificar dialog
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByLabel(/nome da regra/i)).toBeVisible();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTES - EVENT REPLAY PANEL
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Event Replay Panel', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!process.env.TEST_ADMIN_EMAIL, 'Requires TEST_ADMIN_EMAIL env var');
    await loginAsAdmin(page);
    await page.goto('/admin?tab=cognitive');
    await page.getByRole('tab', { name: /replay/i }).click();
  });

  test('should display replay interface', async ({ page }) => {
    // Verificar elementos principais
    await expect(page.getByText('Iniciar Gravação')).toBeVisible();
    await expect(page.getByText('Gravações Salvas')).toBeVisible();
  });

  test('should start and stop recording', async ({ page }) => {
    // Iniciar gravação
    await page.getByRole('button', { name: /iniciar gravação/i }).click();
    
    // Verificar que botão mudou para "Parar"
    await expect(page.getByRole('button', { name: /parar/i })).toBeVisible();
    
    // Parar gravação
    await page.getByRole('button', { name: /parar/i }).click();
    
    // Deve voltar ao estado inicial
    await expect(page.getByRole('button', { name: /iniciar gravação/i })).toBeVisible();
  });

  test('should change playback speed', async ({ page }) => {
    // Verificar selector de velocidade
    const speedSelect = page.locator('select').filter({ hasText: /1x/ });
    if (await speedSelect.isVisible()) {
      await speedSelect.selectOption('2');
      await expect(speedSelect).toHaveValue('2');
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TESTES - API /api/metrics
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Metrics API', () => {
  test('should return prometheus format by default', async ({ request }) => {
    const response = await request.get('/api/metrics');
    
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('text/plain');
    
    const text = await response.text();
    expect(text).toContain('azuria_cognitive');
  });

  test('should return JSON format when requested', async ({ request }) => {
    const response = await request.get('/api/metrics?format=json');
    
    expect(response.ok()).toBeTruthy();
    expect(response.headers()['content-type']).toContain('application/json');
    
    const json = await response.json();
    expect(json).toHaveProperty('counters');
    expect(json).toHaveProperty('gauges');
    expect(json).toHaveProperty('histograms');
  });

  test('should include rate limit headers', async ({ request }) => {
    const response = await request.get('/api/metrics');
    
    expect(response.headers()['x-ratelimit-limit']).toBeDefined();
    expect(response.headers()['x-ratelimit-remaining']).toBeDefined();
  });

  test('should enforce rate limiting', async ({ request }) => {
    // Fazer muitas requisições rapidamente
    const requests = Array(65).fill(null).map(() => 
      request.get('/api/metrics')
    );
    
    const responses = await Promise.all(requests);
    
    // Pelo menos uma deve ser rate limited (429)
    const rateLimited = responses.filter(r => r.status() === 429);
    expect(rateLimited.length).toBeGreaterThan(0);
  });
});
