import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  // La app usa una base de datos real (sin mocks, Principio III); los
  // round-trips al pooler remoto suelen tardar varios segundos, muy por
  // encima del timeout de aserción por defecto (5s) de Playwright.
  expect: { timeout: 15_000 },
  // Corre serializado: los tests comparten una única DB real remota
  // (Supabase) y el pool de conexiones del server compartido, y correr
  // en paralelo generó contención/timeouts intermitentes.
  workers: 1,
  retries: 0,
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 15_000,
  },
  projects: [
    {
      name: 'mobile-360',
      use: { ...devices['Desktop Chrome'], viewport: { width: 360, height: 800 } },
    },
    {
      name: 'tablet-768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop-1920',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
    },
  ],
});
