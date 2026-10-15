import { test, expect } from '@playwright/test';

test.describe('Frontend Smoke Tests', () => {
  test('deve renderizar a tela de login inicial', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/VetOS/i);
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('deve proteger rota /billing redirecionando para login quando desautenticado', async ({ page }) => {
    await page.goto('/billing');
    // Deve redirecionar para a tela de autenticação
    await expect(page).toHaveURL(/.*login.*/);
  });

  test('deve carregar portal do tutor em /tutor/login', async ({ page }) => {
    await page.goto('/tutor/login');
    const cpfOrPhoneInput = page.locator('input');
    await expect(cpfOrPhoneInput.first()).toBeVisible();
  });
});
