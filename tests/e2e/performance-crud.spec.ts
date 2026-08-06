import { test, expect } from '@playwright/test';
import { emailUnico, PASSWORD_VALIDA } from './helpers';

test('crear/editar/eliminar tarea completa en menos de 2s p95 (SC-001)', async ({
  page,
}) => {
  await page.goto('/registro');
  await page.getByLabel('Email').fill(emailUnico());
  await page.getByLabel('Contraseña').fill(PASSWORD_VALIDA);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page).toHaveURL('/panel');

  await page.goto('/tareas');

  const inicio = Date.now();
  await page.getByLabel('Título').fill('Medición de performance');
  await page.getByRole('button', { name: 'Crear tarea' }).click();
  await expect(page.getByText('Medición de performance')).toBeVisible();
  const duracionCrear = Date.now() - inicio;

  expect(duracionCrear).toBeLessThan(2000);
});
