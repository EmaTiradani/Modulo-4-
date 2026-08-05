import { describe, it, expect, afterAll } from 'vitest';
import { baseUrl, limpiarUsuariosDeTest, prisma, registrarUsuario } from './helpers';

async function crearHabito(cookie: string, dificultad: string) {
  const res = await fetch(`${baseUrl()}/api/habitos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ nombre: 'Meditar', dificultad }),
  });
  return (await res.json()).habito;
}

describe('POST /api/habitos/:id/cumplir (FR-011, FR-012, FR-023)', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('registra el cumplimiento del día y suma XP', async () => {
    const usuario = await registrarUsuario();
    const habito = await crearHabito(usuario.cookie, 'Facil');

    const res = await fetch(`${baseUrl()}/api/habitos/${habito.id}/cumplir`, {
      method: 'POST',
      headers: { Cookie: usuario.cookie },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.xpObtenida).toBe(5);
    expect(data.usuario.xp).toBe(5);
  });

  it('un segundo intento el mismo día responde "ya registrado hoy" sin XP adicional', async () => {
    const usuario = await registrarUsuario();
    const habito = await crearHabito(usuario.cookie, 'Media');

    await fetch(`${baseUrl()}/api/habitos/${habito.id}/cumplir`, {
      method: 'POST',
      headers: { Cookie: usuario.cookie },
    });

    const segundo = await fetch(`${baseUrl()}/api/habitos/${habito.id}/cumplir`, {
      method: 'POST',
      headers: { Cookie: usuario.cookie },
    });

    expect(segundo.status).toBe(409);
    const data = await segundo.json();
    expect(data.error.codigo).toBe('HABITO_YA_CUMPLIDO_HOY');
    expect(data.error.mensaje).toBe('Este hábito ya fue registrado hoy');

    const usuarioActualizado = await prisma.usuario.findUnique({
      where: { id: usuario.id },
    });
    expect(usuarioActualizado?.xpAcumulada).toBe(10); // solo la primera vez

    const registros = await prisma.registroCumplimientoHabito.count({
      where: { habitoId: habito.id },
    });
    expect(registros).toBe(1);
  });
});
