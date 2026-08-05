import { PrismaClient } from '@prisma/client';
import { inject } from 'vitest';

export const prisma = new PrismaClient();

export function baseUrl(): string {
  return inject('baseUrl');
}

export async function limpiarUsuariosDeTest(): Promise<void> {
  await prisma.usuario.deleteMany({
    where: { email: { endsWith: '@questit-test.local' } },
  });
}

let contador = 0;

export function emailDeTest(): string {
  contador += 1;
  return `usuario-${Date.now()}-${contador}@questit-test.local`;
}

interface UsuarioRegistrado {
  email: string;
  password: string;
  cookie: string;
  id: string;
}

export async function registrarUsuario(): Promise<UsuarioRegistrado> {
  const email = emailDeTest();
  const password = 'password123';

  const res = await fetch(`${baseUrl()}/api/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error(`No se pudo registrar usuario de test: ${res.status}`);
  }

  const cookie = extraerCookie(res);
  const data = await res.json();

  return { email, password, cookie, id: data.usuario.id };
}

export function extraerCookie(res: Response): string {
  const setCookie = res.headers.get('set-cookie');
  if (!setCookie) throw new Error('La respuesta no trae Set-Cookie');
  return setCookie.split(';')[0];
}
