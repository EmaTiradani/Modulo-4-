import { describe, it, expect, afterAll } from 'vitest';
import { baseUrl, limpiarUsuariosDeTest, prisma, registrarUsuario } from './helpers';

async function crearTarea(cookie: string) {
  const res = await fetch(`${baseUrl()}/api/tareas`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ titulo: 'Original', dificultad: 'Facil' }),
  });
  return (await res.json()).tarea;
}

describe('PATCH /api/tareas/:id (FR-005, FR-021)', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('edita una tarea propia', async () => {
    const usuario = await registrarUsuario();
    const tarea = await crearTarea(usuario.cookie);

    const res = await fetch(`${baseUrl()}/api/tareas/${tarea.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: usuario.cookie },
      body: JSON.stringify({ titulo: 'Actualizado' }),
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.tarea.titulo).toBe('Actualizado');
  });

  it('rechaza sin aplicar cambios la tarea de otro usuario', async () => {
    const propietario = await registrarUsuario();
    const otro = await registrarUsuario();
    const tarea = await crearTarea(propietario.cookie);

    const res = await fetch(`${baseUrl()}/api/tareas/${tarea.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Cookie: otro.cookie },
      body: JSON.stringify({ titulo: 'Hackeado' }),
    });

    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.error.codigo).toBe('SIN_PERMISO');

    const sinCambios = await prisma.tarea.findUnique({ where: { id: tarea.id } });
    expect(sinCambios?.titulo).toBe('Original');
  });
});
