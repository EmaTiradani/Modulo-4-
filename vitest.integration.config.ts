import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/integration/**/*.test.ts'],
    setupFiles: ['dotenv/config'],
    globalSetup: ['tests/integration/global-setup.ts'],
    testTimeout: 120_000,
    hookTimeout: 60_000,
    // Corren secuencialmente: comparten un único servidor Next.js real y
    // la misma base de datos de test, evitando condiciones de carrera
    // entre archivos de test que mutan el mismo usuario/tabla.
    fileParallelism: false,
  },
});
