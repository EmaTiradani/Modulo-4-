import { describe, it, expect, afterAll } from 'vitest';
import { baseUrl, limpiarUsuariosDeTest, prisma, registrarUsuario } from './helpers';

async function crearHabito(cookie: string, dificultad = 'Dificil') {
  const res = await fetch(`${baseUrl()}/api/habitos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ nombre: 'Para eliminar', dificultad }),
  });
  return (await res.json()).habito;
}

describe('DELETE /api/habitos/:id (FR-010, FR-021)', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('elimina un hábito propio y conserva la XP de registros previos', async () => {
    const usuario = await registrarUsuario();
    const habito = await crearHabito(usuario.cookie);

    await fetch(`${baseUrl()}/api/habitos/${habito.id}/cumplir`, {
      method: 'POST',
      headers: { Cookie: usuario.cookie },
    });

    const eliminar = await fetch(`${baseUrl()}/api/habitos/${habito.id}`, {
      method: 'DELETE',
      headers: { Cookie: usuario.cookie },
    });
    expect(eliminar.status).toBe(204);

    const usuarioActualizado = await prisma.usuario.findUnique({
      where: { id: usuario.id },
    });
    expect(usuarioActualizado?.xpAcumulada).toBe(20);
  });

  it('rechaza eliminar el hábito de otro usuario', async () => {
    const propietario = await registrarUsuario();
    const otro = await registrarUsuario();
    const habito = await crearHabito(propietario.cookie);

    const res = await fetch(`${baseUrl()}/api/habitos/${habito.id}`, {
      method: 'DELETE',
      headers: { Cookie: otro.cookie },
    });

    expect(res.status).toBe(403);
    const sigueExistiendo = await prisma.habito.findUnique({
      where: { id: habito.id },
    });
    expect(sigueExistiendo).not.toBeNull();
  });
});
