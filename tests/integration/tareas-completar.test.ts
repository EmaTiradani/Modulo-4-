import { describe, it, expect, afterAll } from 'vitest';
import { baseUrl, limpiarUsuariosDeTest, prisma, registrarUsuario } from './helpers';

async function crearTarea(cookie: string, dificultad: string) {
  const res = await fetch(`${baseUrl()}/api/tareas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ titulo: 'Tarea Media', dificultad }),
  });
  return (await res.json()).tarea;
}

describe('POST /api/tareas/:id/completar (FR-007, FR-012, FR-024)', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('suma la XP de la dificultad y crea un EventoHistorial de forma atómica', async () => {
    const usuario = await registrarUsuario();
    const tarea = await crearTarea(usuario.cookie, 'Media');

    const res = await fetch(`${baseUrl()}/api/tareas/${tarea.id}/completar`, {
      method: 'POST',
      headers: { Cookie: usuario.cookie },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.xpObtenida).toBe(10);
    expect(data.usuario.xp).toBe(10);
    expect(data.usuario.nivel).toBe(1);

    const eventos = await prisma.eventoHistorial.count({
      where: { tareaId: tarea.id, tipo: 'TareaCompletada' },
    });
    expect(eventos).toBe(1);
  });

  it('una segunda solicitud no otorga XP adicional (idempotencia)', async () => {
    const usuario = await registrarUsuario();
    const tarea = await crearTarea(usuario.cookie, 'Facil');

    await fetch(`${baseUrl()}/api/tareas/${tarea.id}/completar`, {
      method: 'POST',
      headers: { Cookie: usuario.cookie },
    });

    const segunda = await fetch(`${baseUrl()}/api/tareas/${tarea.id}/completar`, {
      method: 'POST',
      headers: { Cookie: usuario.cookie },
    });

    expect(segunda.status).toBe(409);
    const data = await segunda.json();
    expect(data.error.codigo).toBe('TAREA_YA_COMPLETADA');

    const usuarioActualizado = await prisma.usuario.findUnique({
      where: { id: usuario.id },
    });
    expect(usuarioActualizado?.xpAcumulada).toBe(5); // solo la primera vez
  });
});
