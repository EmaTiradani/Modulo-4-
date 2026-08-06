import { describe, it, expect, afterAll } from 'vitest';
import {
  baseUrl,
  limpiarUsuariosDeTest,
  prisma,
  registrarUsuario,
} from './helpers';

describe('POST /api/auth/logout (FR-003)', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('invalida la sesión y bloquea el acceso posterior a datos propios', async () => {
    const usuario = await registrarUsuario();

    const logout = await fetch(`${baseUrl()}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: usuario.cookie },
    });
    expect(logout.status).toBe(204);

    // El servidor limpia la cookie con Max-Age=0: un navegador real dejaría
    // de reenviarla en solicitudes posteriores.
    const setCookie = logout.headers.get('set-cookie') ?? '';
    expect(setCookie).toMatch(/questit_session=;?.*max-age=0/i);

    const intentoSinCookie = await fetch(`${baseUrl()}/api/panel`);
    expect(intentoSinCookie.status).toBe(401);
  });
});
