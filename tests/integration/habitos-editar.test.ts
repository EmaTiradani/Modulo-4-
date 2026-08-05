import { describe, it, expect, afterAll } from 'vitest';
import { baseUrl, limpiarUsuariosDeTest, prisma, registrarUsuario } from './helpers';

async function crearHabito(cookie: string) {
  const res = await fetch(`${baseUrl()}/api/habitos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ nombre: 'Original', dificultad: 'Facil' }),
  });
  return (await res.json()).habito;
}

describe('PATCH /api/habitos/:id (FR-009, FR-021)', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('edita un hábito propio', async () => {
    const usuario = await registrarUsuario();
    const habito = await crearHabito(usuario.cookie);

    const res = await fetch(`${baseUrl()}/api/habitos/${habito.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: usuario.cookie },
      body: JSON.stringify({ nombre: 'Actualizado' }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.habito.nombre).toBe('Actualizado');
  });

  it('rechaza sin aplicar cambios el hábito de otro usuario', async () => {
    const propietario = await registrarUsuario();
    const otro = await registrarUsuario();
    const habito = await crearHabito(propietario.cookie);

    const res = await fetch(`${baseUrl()}/api/habitos/${habito.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: otro.cookie },
      body: JSON.stringify({ nombre: 'Hackeado' }),
    });

    expect(res.status).toBe(403);
    const sinCambios = await prisma.habito.findUnique({
      where: { id: habito.id },
    });
    expect(sinCambios?.nombre).toBe('Original');
  });
});
