import { spawn, type ChildProcess } from 'node:child_process';
import type { GlobalSetupContext } from 'vitest/node';

const PORT = 3100;
export const BASE_URL = `http://localhost:${PORT}`;

let server: ChildProcess | undefined;

async function esperarServidorListo(timeoutMs: number): Promise<void> {
  const inicio = Date.now();
  while (Date.now() - inicio < timeoutMs) {
    try {
      const res = await fetch(BASE_URL);
      if (res.status < 500) return;
    } catch {
      // servidor todavía no acepta conexiones
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error('El servidor de test no arrancó a tiempo');
}

export default async function setup({ provide }: GlobalSetupContext) {
  server = spawn('npx', ['next', 'dev', '-p', String(PORT)], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: { ...process.env },
    detached: true, // corre en su propio grupo de procesos
  });

  await esperarServidorListo(60_000);
  provide('baseUrl', BASE_URL);

  return async () => {
    // `next dev` genera procesos hijos (next-server) que no reciben SIGTERM
    // si se mata solo el PID del wrapper; se mata el grupo completo.
    if (server?.pid) {
      try {
        process.kill(-server.pid, 'SIGTERM');
      } catch {
        server.kill('SIGTERM');
      }
    }
  };
}

declare module 'vitest' {
  export interface ProvidedContext {
    baseUrl: string;
  }
}
