import { describe, it, expect, afterAll } from 'vitest';
import { baseUrl, limpiarUsuariosDeTest, prisma, registrarUsuario } from './helpers';

describe('Aislamiento por usuario (FR-018, SC-006)', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('un usuario no puede leer el panel, tareas, hábitos ni historial de otro', async () => {
    const dueno = await registrarUsuario();
    const intruso = await registrarUsuario();

    await fetch(`${baseUrl()}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: dueno.cookie },
      body: JSON.stringify({ titulo: 'Privada', dificultad: 'Facil' }),
    });
    await fetch(`${baseUrl()}/api/habitos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: dueno.cookie },
      body: JSON.stringify({ nombre: 'Privado', dificultad: 'Facil' }),
    });

    const tareasComoIntruso = await fetch(`${baseUrl()}/api/tareas`, {
      headers: { Cookie: intruso.cookie },
    });
    const habitosComoIntruso = await fetch(`${baseUrl()}/api/habitos`, {
      headers: { Cookie: intruso.cookie },
    });
    const panelComoIntruso = await fetch(`${baseUrl()}/api/panel`, {
      headers: { Cookie: intruso.cookie },
    });

    expect((await tareasComoIntruso.json()).tareas).toHaveLength(0);
    expect((await habitosComoIntruso.json()).habitos).toHaveLength(0);
    expect((await panelComoIntruso.json()).xp).toBe(0);
  });

  it('accede a una tarea/hábito ajeno por id manipulado directamente devuelve 403', async () => {
    const dueno = await registrarUsuario();
    const intruso = await registrarUsuario();

    const tareaRes = await fetch(`${baseUrl()}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: dueno.cookie },
      body: JSON.stringify({ titulo: 'Privada', dificultad: 'Facil' }),
    });
    const tarea = (await tareaRes.json()).tarea;

    const res = await fetch(`${baseUrl()}/api/tareas/${tarea.id}/completar`, {
      method: 'POST',
      headers: { Cookie: intruso.cookie },
    });
    expect(res.status).toBe(403);
  });
});
