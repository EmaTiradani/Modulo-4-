import { test, expect } from '@playwright/test';
import { emailUnico, PASSWORD_VALIDA } from './helpers';

test.describe('Historia 1 — Registro, login, logout', () => {
  test('registro → acceso inmediato al panel → logout → login (SC-004)', async ({
    page,
  }) => {
    const email = emailUnico();

    await page.goto('/registro');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill(PASSWORD_VALIDA);
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await expect(page).toHaveURL('/panel');

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await expect(page).toHaveURL('/login');

    await page.goto('/panel');
    await expect(page).toHaveURL('/login');

    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill(PASSWORD_VALIDA);
    await page.getByRole('button', { name: 'Iniciar sesión' }).click();
    await expect(page).toHaveURL('/panel');
  });

  test('rechaza el registro con un email ya usado (FR-022)', async ({ page }) => {
    const email = emailUnico();

    await page.goto('/registro');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill(PASSWORD_VALIDA);
    await page.getByRole('button', { name: 'Crear cuenta' }).click();
    await expect(page).toHaveURL('/panel');

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();

    await page.goto('/registro');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Contraseña').fill(PASSWORD_VALIDA);
    await page.getByRole('button', { name: 'Crear cuenta' }).click();

    await expect(page.locator('.error-mensaje')).toContainText('registrado');
    await expect(page).toHaveURL('/registro');
  });

  test('muestra estado de carga y error visible ante credenciales inválidas (FR-025)', async ({
    page,
  }) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(emailUnico());
    await page.getByLabel('Contraseña').fill(PASSWORD_VALIDA);

    // Se matchea por regex (no por el texto exacto pre-click) porque el
    // accessible name del botón cambia a "Iniciando sesión…" apenas se
    // hace click, y un locator por nombre exacto dejaría de resolver.
    const boton = page.getByRole('button', {
      name: /Iniciar sesión|Iniciando sesión/,
    });
    await boton.click();
    await expect(boton).toHaveText('Iniciando sesión…');

    await expect(page.locator('.error-mensaje')).toBeVisible();
  });

  test('bloquea el envío con email inválido o contraseña corta (FR-029)', async ({
    page,
  }) => {
    await page.goto('/registro');

    await page.getByLabel('Email').fill('no-es-un-email');
    await page.getByLabel('Email').blur();
    await expect(page.getByText('email con formato válido')).toBeVisible();

    await page.getByLabel('Contraseña').fill('corta');
    await page.getByLabel('Contraseña').blur();
    await expect(page.getByText('al menos 8 caracteres')).toBeVisible();

    await expect(page).toHaveURL('/registro');
  });
});
