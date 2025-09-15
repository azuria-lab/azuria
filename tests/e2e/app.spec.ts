import { expect, type Page, test } from '@playwright/test';

test.describe('Azuria E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Home Page', () => {
    test('should load homepage successfully', async ({ page }) => {
      await expect(page).toHaveTitle(/Azuria/);
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should navigate to calculator', async ({ page }) => {
      await page.click('text=Calculadora');
      await expect(page).toHaveURL(/.*calculator/);
    });

    test('should show tour on first visit', async ({ page }) => {
      await page.goto('/', { waitUntil: 'networkidle' });
      
      // Check if tour appears for new users
      const tourElement = page.locator('[data-testid="interactive-tour"]');
      await expect(tourElement).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Calculator Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/calculator');
    });

    test('should perform basic calculation', async ({ page }) => {
      // Fill basic pricing form
      await page.fill('[data-testid="cost-input"]', '100');
      await page.fill('[data-testid="margin-input"]', '50');
      
      await page.click('[data-testid="calculate-button"]');
      
      // Verify result
      await expect(page.locator('[data-testid="result-price"]')).toContainText('200');
    });

    test('should save calculation to history', async ({ page }) => {
      // Login first (mock authentication)
      await mockLogin(page);
      
      // Perform calculation
      await page.fill('[data-testid="cost-input"]', '150');
      await page.fill('[data-testid="margin-input"]', '40');
      await page.click('[data-testid="calculate-button"]');
      
      // Save calculation
      await page.click('[data-testid="save-calculation"]');
      
      // Navigate to history
      await page.goto('/history');
      await expect(page.locator('[data-testid="calculation-item"]')).toBeVisible();
    });

    test('should validate input fields', async ({ page }) => {
      await page.click('[data-testid="calculate-button"]');
      
      // Should show validation errors
      await expect(page.locator('.error-message')).toBeVisible();
    });
  });

  test.describe('Authentication Flow', () => {
    test('should show login modal', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      await expect(page.locator('[data-testid="auth-modal"]')).toBeVisible();
    });

    test('should handle login process', async ({ page }) => {
      await page.click('[data-testid="login-button"]');
      
      await page.fill('[data-testid="email-input"]', 'test@example.com');
      await page.fill('[data-testid="password-input"]', 'password123');
      
      await page.click('[data-testid="submit-login"]');
      
      // Should show loading state
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      await expect(page.locator('h1')).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await expect(page.locator('.container')).toBeVisible();
      await expect(page.locator('nav')).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load within acceptable time', async ({ page }) => {
      const startTime = Date.now();
      await page.goto('/', { waitUntil: 'networkidle' });
      const loadTime = Date.now() - startTime;
      
      expect(loadTime).toBeLessThan(3000); // 3 second threshold
    });

    test('should have good Core Web Vitals', async ({ page }) => {
      await page.goto('/');
      
      // Wait for metrics to be available
      await page.waitForTimeout(2000);
      
      const vitals = await page.evaluate(() => {
        return (window as any).__vitals__;
      });
      
      if (vitals?.LCP) {
        expect(vitals.LCP).toBeLessThan(2500); // Good LCP threshold
      }
    });
  });

  test.describe('AI Features', () => {
    test('should open AI chatbot', async ({ page }) => {
      await page.click('[data-testid="ai-chatbot-trigger"]');
      await expect(page.locator('[data-testid="ai-chatbot"]')).toBeVisible();
    });

    test('should send message to AI', async ({ page }) => {
      await page.click('[data-testid="ai-chatbot-trigger"]');
      
      await page.fill('[data-testid="ai-input"]', 'Como calcular margem de lucro?');
      await page.click('[data-testid="ai-send"]');
      
      await expect(page.locator('[data-testid="ai-response"]')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('/');
      
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < buttonCount; i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        
        expect(ariaLabel || textContent).toBeTruthy();
      }
    });

    test('should be keyboard navigable', async ({ page }) => {
      await page.goto('/');
      
      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
      
      await page.keyboard.press('Tab');
      await expect(page.locator(':focus')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Simulate offline
      await page.route('**/*', route => route.abort());
      
      await page.goto('/');
      
      // Should show offline message
      await expect(page.locator('[data-testid="offline-message"]')).toBeVisible();
    });

    test('should show error boundary for JS errors', async ({ page }) => {
      // Inject error
      await page.evaluate(() => {
        throw new Error('Test error');
      });
      
      await expect(page.locator('[data-testid="error-boundary"]')).toBeVisible();
    });
  });
});

// Helper functions
async function mockLogin(page: Page) {
  await page.addInitScript(() => {
    // Mock authenticated user
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      access_token: 'mock-token',
      user: { id: 'test-user', email: 'test@example.com' }
    }));
  });
}