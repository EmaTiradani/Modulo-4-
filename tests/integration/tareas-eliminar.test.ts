import { describe, it, expect, afterAll } from 'vitest';
import { baseUrl, limpiarUsuariosDeTest, prisma, registrarUsuario } from './helpers';

async function crearTarea(cookie: string, dificultad = 'Media') {
  const res = await fetch(`${baseUrl()}/api/tareas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ titulo: 'Para eliminar', dificultad }),
  });
  return (await res.json()).tarea;
}

describe('DELETE /api/tareas/:id (FR-006, FR-021)', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('elimina una tarea propia y conserva la XP si ya estaba completada', async () => {
    const usuario = await registrarUsuario();
    const tarea = await crearTarea(usuario.cookie);

    await fetch(`${baseUrl()}/api/tareas/${tarea.id}/completar`, {
      method: 'POST',
      headers: { Cookie: usuario.cookie },
    });

    const eliminar = await fetch(`${baseUrl()}/api/tareas/${tarea.id}`, {
      method: 'DELETE',
      headers: { Cookie: usuario.cookie },
    });
    expect(eliminar.status).toBe(204);

    const usuarioActualizado = await prisma.usuario.findUnique({
      where: { id: usuario.id },
    });
    expect(usuarioActualizado?.xpAcumulada).toBe(10);

    const eventos = await prisma.eventoHistorial.count({
      where: { usuarioId: usuario.id, tareaId: null, tipo: 'TareaCompletada' },
    });
    expect(eventos).toBe(1); // tareaId quedó en null (SetNull) pero el evento persiste
  });

  it('rechaza eliminar la tarea de otro usuario', async () => {
    const propietario = await registrarUsuario();
    const otro = await registrarUsuario();
    const tarea = await crearTarea(propietario.cookie);

    const res = await fetch(`${baseUrl()}/api/tareas/${tarea.id}`, {
      method: 'DELETE',
      headers: { Cookie: otro.cookie },
    });

    expect(res.status).toBe(403);
    const sigueExistiendo = await prisma.tarea.findUnique({
      where: { id: tarea.id },
    });
    expect(sigueExistiendo).not.toBeNull();
  });
});
