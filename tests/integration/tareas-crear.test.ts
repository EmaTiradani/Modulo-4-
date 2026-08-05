import { describe, it, expect, afterAll } from 'vitest';
import { baseUrl, limpiarUsuariosDeTest, prisma, registrarUsuario } from './helpers';

describe('POST /api/tareas (FR-004)', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('crea una tarea respetando título y descripción dentro de límite', async () => {
    const usuario = await registrarUsuario();

    const res = await fetch(`${baseUrl()}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: usuario.cookie },
      body: JSON.stringify({
        titulo: 'Lavar el auto',
        descripcion: 'Con jabón especial',
        dificultad: 'Media',
      }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.tarea.estado).toBe('Pendiente');
    expect(data.tarea.titulo).toBe('Lavar el auto');
  });

  it('rechaza título vacío o mayor a 100 caracteres', async () => {
    const usuario = await registrarUsuario();

    const vacio = await fetch(`${baseUrl()}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: usuario.cookie },
      body: JSON.stringify({ titulo: '', dificultad: 'Facil' }),
    });
    expect(vacio.status).toBe(400);

    const muyLargo = await fetch(`${baseUrl()}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: usuario.cookie },
      body: JSON.stringify({ titulo: 'a'.repeat(101), dificultad: 'Facil' }),
    });
    expect(muyLargo.status).toBe(400);
  });

  it('rechaza descripción mayor a 500 caracteres', async () => {
    const usuario = await registrarUsuario();

    const res = await fetch(`${baseUrl()}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: usuario.cookie },
      body: JSON.stringify({
        titulo: 'Tarea válida',
        descripcion: 'a'.repeat(501),
        dificultad: 'Facil',
      }),
    });
    expect(res.status).toBe(400);
  });
});
