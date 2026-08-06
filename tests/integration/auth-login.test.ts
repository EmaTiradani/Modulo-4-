import { describe, it, expect, afterAll } from 'vitest';
import {
  baseUrl,
  emailDeTest,
  limpiarUsuariosDeTest,
  prisma,
} from './helpers';

describe('POST /api/auth/login', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('acepta credenciales válidas (FR-002)', async () => {
    const email = emailDeTest();
    const password = 'password123';

    await fetch(`${baseUrl()}/api/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const res = await fetch(`${baseUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toContain('questit_session=');
  });

  it('rechaza credenciales inválidas con mensaje genérico (Edge Cases)', async () => {
    const email = emailDeTest();
    await fetch(`${baseUrl()}/api/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' }),
    });

    const conPasswordIncorrecta = await fetch(`${baseUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'incorrecta123' }),
    });
    const conEmailInexistente = await fetch(`${baseUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: emailDeTest(), password: 'password123' }),
    });

    expect(conPasswordIncorrecta.status).toBe(401);
    expect(conEmailInexistente.status).toBe(401);

    const dataA = await conPasswordIncorrecta.json();
    const dataB = await conEmailInexistente.json();
    expect(dataA.error.codigo).toBe('CREDENCIALES_INVALIDAS');
    expect(dataB.error.codigo).toBe('CREDENCIALES_INVALIDAS');
    // Mismo mensaje genérico en ambos casos: no revela cuál dato falló.
    expect(dataA.error.mensaje).toBe(dataB.error.mensaje);
  });
});
