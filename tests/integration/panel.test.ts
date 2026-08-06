import { describe, it, expect, afterAll } from 'vitest';
import { baseUrl, limpiarUsuariosDeTest, prisma, registrarUsuario } from './helpers';

describe('GET /api/panel (FR-014-FR-017, Edge Cases)', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('devuelve todo en cero para un usuario sin actividad', async () => {
    const usuario = await registrarUsuario();

    const res = await fetch(`${baseUrl()}/api/panel`, {
      headers: { Cookie: usuario.cookie },
    });

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({
      xp: 0,
      nivel: 1,
      tareasCompletadas: 0,
      registrosHabitoCumplidos: 0,
    });
  });

  it('refleja XP/nivel/contadores tras completar tarea y hábito', async () => {
    const usuario = await registrarUsuario();

    const tareaRes = await fetch(`${baseUrl()}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: usuario.cookie },
      body: JSON.stringify({ titulo: 'T', dificultad: 'Dificil' }),
    });
    const tarea = (await tareaRes.json()).tarea;
    await fetch(`${baseUrl()}/api/tareas/${tarea.id}/completar`, {
      method: 'POST',
      headers: { Cookie: usuario.cookie },
    });

    const habitoRes = await fetch(`${baseUrl()}/api/habitos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: usuario.cookie },
      body: JSON.stringify({ nombre: 'H', dificultad: 'Media' }),
    });
    const habito = (await habitoRes.json()).habito;
    await fetch(`${baseUrl()}/api/habitos/${habito.id}/cumplir`, {
      method: 'POST',
      headers: { Cookie: usuario.cookie },
    });

    const res = await fetch(`${baseUrl()}/api/panel`, {
      headers: { Cookie: usuario.cookie },
    });
    const data = await res.json();

    expect(data.xp).toBe(30); // 20 (Dificil) + 10 (Media)
    expect(data.nivel).toBe(1);
    expect(data.tareasCompletadas).toBe(1);
    expect(data.registrosHabitoCumplidos).toBe(1);
  });
});
