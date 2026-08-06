import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { baseUrl, emailDeTest, limpiarUsuariosDeTest, prisma } from './helpers';

describe('POST /api/auth/registro', () => {
  beforeAll(limpiarUsuariosDeTest);
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('crea la cuenta e inicia sesión automáticamente (FR-001)', async () => {
    const email = emailDeTest();

    const res = await fetch(`${baseUrl()}/api/auth/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: 'password123' }),
    });

    expect(res.status).toBe(201);
    expect(res.headers.get('set-cookie')).toContain('questit_session=');

    const data = await res.json();
    expect(data.usuario.email).toBe(email);
    expect(data.usuario.xp).toBe(0);
    expect(data.usuario.nivel).toBe(1);
  });
});
