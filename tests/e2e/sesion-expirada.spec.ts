import { test, expect } from '@playwright/test';
import { emailUnico, PASSWORD_VALIDA } from './helpers';

test('sesión expirada redirige a /login con mensaje visible (FR-027)', async ({
  page,
}) => {
  await page.goto('/registro');
  await page.getByLabel('Email').fill(emailUnico());
  await page.getByLabel('Contraseña').fill(PASSWORD_VALIDA);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page).toHaveURL('/panel');

  await page.route('**/api/panel', (route) =>
    route.fulfill({
      status: 401,
      body: JSON.stringify({
        error: {
          codigo: 'SESION_EXPIRADA',
          mensaje: 'Tu sesión expiró, iniciá sesión nuevamente',
        },
      }),
    }),
  );

  await page.reload();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByText('Tu sesión expiró')).toBeVisible();
});
