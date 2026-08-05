import { describe, it, expect, afterAll } from 'vitest';
import { baseUrl, emailDeTest, limpiarUsuariosDeTest, prisma } from './helpers';

describe('POST /api/auth/registro - email duplicado (FR-022)', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('rechaza un email ya registrado sin crear una cuenta duplicada', async () => {
    const email = emailDeTest();

    const primero = await fetch(`${baseUrl()}/api/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' }),
    });
    expect(primero.status).toBe(201);

    const segundo = await fetch(`${baseUrl()}/api/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'otraPassword123' }),
    });
    expect(segundo.status).toBe(409);
    const data = await segundo.json();
    expect(data.error.codigo).toBe('EMAIL_YA_REGISTRADO');

    const cuentas = await prisma.usuario.count({ where: { email } });
    expect(cuentas).toBe(1);
  });
});
