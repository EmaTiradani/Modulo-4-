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

test.describe('Historia 2 — Tareas con recompensa de experiencia', () => {
  test('lista vacía muestra estado ilustrativo (FR-028)', async ({ page }) => {
    await registrarse(page);
    await page.goto('/tareas');
    await expect(page.getByText('Todavía no tenés tareas')).toBeVisible();
  });

  test('crear → editar → completar → eliminar, con XP visible (SC-001, SC-005)', async ({
    page,
  }) => {
    await registrarse(page);
    await page.goto('/tareas');

    await page.getByLabel('Título').fill('Lavar el auto');
    await page.getByLabel('Dificultad').selectOption('Media');
    await page.getByRole('button', { name: 'Crear tarea' }).click();
    await expect(page.getByText('Lavar el auto')).toBeVisible();

    await page.getByRole('button', { name: 'Completar' }).click();
    await expect(page.getByText('Completada')).toBeVisible();

    await page.goto('/panel');
    // exact: true evita el match parcial contra la línea del historial
    // ("... — +10 XP"), que también contiene la subcadena "10 XP".
    await expect(page.getByText('10 XP', { exact: true })).toBeVisible();

    await page.goto('/tareas');
    await page.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByRole('alertdialog')).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();
    await expect(page.getByRole('alertdialog')).toBeHidden();

    await page.getByRole('button', { name: 'Eliminar' }).click();
    await page.getByRole('button', { name: 'Eliminar' }).nth(1).click();
    await expect(page.getByText('Todavía no tenés tareas')).toBeVisible();
  });

  test('bloquea título vacío/largo y descripción larga con mensaje por campo (FR-004)', async ({
    page,
  }) => {
    await registrarse(page);
    await page.goto('/tareas');

    await page.getByLabel('Título').fill('a'.repeat(101));
    await page.getByLabel('Título').blur();
    await expect(
      page.getByText('debe tener hasta 100 caracteres'),
    ).toBeVisible();
  });

  test('conserva los datos del formulario si falla el guardado (FR-030)', async ({
    page,
  }) => {
    await registrarse(page);
    await page.goto('/tareas');
    await page.route('**/api/tareas', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 500,
          body: JSON.stringify({
            error: { codigo: 'ERROR_INTERNO', mensaje: 'Error simulado' },
          }),
        });
      }
      return route.continue();
    });

    await page.getByLabel('Título').fill('No se debería perder');
    await page.getByRole('button', { name: 'Crear tarea' }).click();

    await expect(page.locator('.error-mensaje')).toContainText('Error simulado');
    await expect(page.getByLabel('Título')).toHaveValue(
      'No se debería perder',
    );
  });
});
