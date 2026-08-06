import { test, expect, type Page } from '@playwright/test';
import { emailUnico, PASSWORD_VALIDA } from './helpers';

async function registrarse(page: Page) {
  const email = emailUnico();
  await page.goto('/registro');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(PASSWORD_VALIDA);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page).toHaveURL('/panel');
  return email;
}

test.describe('Historia 3 — Hábitos con seguimiento diario', () => {
  test('lista vacía muestra estado ilustrativo (FR-028)', async ({ page }) => {
    await registrarse(page);
    await page.goto('/habitos');
    await expect(page.getByText('Todavía no tenés hábitos')).toBeVisible();
  });

  test('crear hábito → cumplir → intentar de nuevo el mismo día → mensaje de duplicado', async ({
    page,
  }) => {
    await registrarse(page);
    await page.goto('/habitos');

    await page.getByLabel('Nombre').fill('Meditar');
    await page.getByLabel('Dificultad').selectOption('Facil');
    await page.getByRole('button', { name: 'Crear hábito' }).click();
    await expect(page.getByText('Meditar')).toBeVisible();

    await page.getByRole('button', { name: 'Registrar cumplimiento' }).click();
    await page.getByRole('button', { name: 'Registrar cumplimiento' }).click();

    await expect(
      page.getByText('Este hábito ya fue registrado hoy'),
    ).toBeVisible();
  });

  test('eliminar hábito pide confirmación (FR-010)', async ({ page }) => {
    await registrarse(page);
    await page.goto('/habitos');

    await page.getByLabel('Nombre').fill('Para eliminar');
    await page.getByRole('button', { name: 'Crear hábito' }).click();
    await expect(page.getByText('Para eliminar')).toBeVisible();

    await page.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('button', { name: 'Eliminar' }).nth(1).click();
    await expect(page.getByText('Todavía no tenés hábitos')).toBeVisible();
  });

  test('bloquea nombre vacío/largo con mensaje por campo (FR-008)', async ({
    page,
  }) => {
    await registrarse(page);
    await page.goto('/habitos');

    await page.getByLabel('Nombre').fill('a'.repeat(101));
    await page.getByLabel('Nombre').blur();
    await expect(
      page.getByText('debe tener hasta 100 caracteres'),
    ).toBeVisible();
  });
});
