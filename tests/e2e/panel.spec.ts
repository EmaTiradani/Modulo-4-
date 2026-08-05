import { test, expect, type Page } from '@playwright/test';
import { emailUnico, PASSWORD_VALIDA } from './helpers';

async function registrarse(page: Page) {
  await page.goto('/registro');
  await page.getByLabel('Email').fill(emailUnico());
  await page.getByLabel('Contraseña').fill(PASSWORD_VALIDA);
  await page.getByRole('button', { name: 'Crear cuenta' }).click();
  await expect(page).toHaveURL('/panel');
}

async function completarTareaDificil(page: Page) {
  await page.goto('/tareas');
  const titulo = `Tarea ${Date.now()}-${Math.random()}`;
  await page.getByLabel('Título').fill(titulo);
  await page.getByLabel('Dificultad').selectOption('Dificil');
  await page.getByRole('button', { name: 'Crear tarea' }).click();

  // Se escopea al <li> de esta tarea específica (por su título único) en
  // vez de usar .last() sobre todos los botones "Completar": si un click
  // anterior falló silenciosamente y dejó una tarea vieja pendiente,
  // .last() (lista ordenada desc) apuntaría a esa tarea vieja, no a la
  // recién creada.
  const item = page.locator('li', { hasText: titulo });
  // El accessible name pasa a "Completando…" mientras la request está en
  // vuelo, así que hay que matchear ambos estados: si solo buscáramos
  // "Completar", el locator dejaría de resolver apenas cambia el texto y
  // toBeHidden() daría un falso positivo antes de que la tarea se
  // complete de verdad en el servidor.
  const boton = item.getByRole('button', { name: /Completar|Completando/ });
  await boton.click();
  // El botón entero desaparece del DOM recién cuando estado pasa a
  // Completada (se deja de renderizar). Esperar a que desaparezca antes
  // de navegar de nuevo (page.goto aborta cualquier fetch en curso), o
  // se pierde el XP de esa tarea silenciosamente.
  await expect(boton).toHaveCount(0);
}

test.describe('Historia 4 — Panel, estadísticas e historial', () => {
  test('panel sin actividad muestra contadores en cero (Edge Cases)', async ({
    page,
  }) => {
    await registrarse(page);
    await expect(page.getByText('0 XP')).toBeVisible();
  });

  test('205 XP muestra Nivel 3 (Acceptance Scenario US4.1)', async ({
    page,
  }) => {
    // 11 ciclos secuenciales de crear+completar tarea contra una DB real
    // remota exceden ampliamente el timeout por defecto de Playwright.
    test.setTimeout(180_000);
    await registrarse(page);
    // 10 tareas Dificil (20 XP c/u) + 1 Media (5 XP extra no aplica) -> ajustamos a 205:
    // 10 * 20 = 200, + 1 tarea Facil (5 XP) = 205.
    for (let i = 0; i < 10; i++) {
      await completarTareaDificil(page);
    }
    await page.goto('/tareas');
    await page.getByLabel('Título').fill('Última');
    await page.getByLabel('Dificultad').selectOption('Facil');
    await page.getByRole('button', { name: 'Crear tarea' }).click();
    const ultimoBoton = page
      .locator('li', { hasText: 'Última' })
      .getByRole('button', { name: /Completar|Completando/ });
    await ultimoBoton.click();
    await expect(ultimoBoton).toHaveCount(0);

    await page.goto('/panel');
    await expect(page.getByText('205 XP')).toBeVisible();
    await expect(page.getByText('3', { exact: true })).toBeVisible();
  });

  test('con menos de 20 eventos, "Cargar más" no se muestra (FR-020)', async ({
    page,
  }) => {
    await registrarse(page);
    await completarTareaDificil(page);

    await page.goto('/panel');
    await expect(page.getByRole('button', { name: 'Cargar más' })).toBeHidden();
  });

  test('con 20 o más eventos, "Cargar más" trae la siguiente página (FR-020)', async ({
    page,
  }) => {
    // 21 ciclos secuenciales de crear+completar tarea contra una DB real
    // remota exceden ampliamente el timeout por defecto de Playwright.
    test.setTimeout(300_000);
    await registrarse(page);
    for (let i = 0; i < 21; i++) {
      await completarTareaDificil(page);
    }

    await page.goto('/panel');
    const boton = page.getByRole('button', { name: 'Cargar más' });
    await expect(boton).toBeVisible();
    await boton.click();
    await expect(boton).toBeHidden();
  });
});
