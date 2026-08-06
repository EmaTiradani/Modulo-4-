import { describe, it, expect, afterAll } from 'vitest';
import { baseUrl, limpiarUsuariosDeTest, prisma, registrarUsuario } from './helpers';

describe('Persistencia tras cerrar/volver a iniciar sesión (FR-019, SC-003)', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('tarea, hábito, XP y nivel se recuperan íntegros', async () => {
    const usuario = await registrarUsuario();

    const tareaRes = await fetch(`${baseUrl()}/api/tareas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: usuario.cookie },
      body: JSON.stringify({ titulo: 'Persistente', dificultad: 'Dificil' }),
    });
    const tarea = (await tareaRes.json()).tarea;
    await fetch(`${baseUrl()}/api/tareas/${tarea.id}/completar`, {
      method: 'POST',
      headers: { Cookie: usuario.cookie },
    });

    await fetch(`${baseUrl()}/api/habitos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: usuario.cookie },
      body: JSON.stringify({ nombre: 'Persistente', dificultad: 'Facil' }),
    });

    await fetch(`${baseUrl()}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: usuario.cookie },
    });

    const login = await fetch(`${baseUrl()}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: usuario.email, password: usuario.password }),
    });
    const cookieNueva = login.headers.get('set-cookie')!.split(';')[0];

    const tareasRes = await fetch(`${baseUrl()}/api/tareas`, {
      headers: { Cookie: cookieNueva },
    });
    const habitosRes = await fetch(`${baseUrl()}/api/habitos`, {
      headers: { Cookie: cookieNueva },
    });
    const panelRes = await fetch(`${baseUrl()}/api/panel`, {
      headers: { Cookie: cookieNueva },
    });

    const tareas = (await tareasRes.json()).tareas;
    const habitos = (await habitosRes.json()).habitos;
    const panel = await panelRes.json();

    expect(tareas).toHaveLength(1);
    expect(tareas[0].estado).toBe('Completada');
    expect(habitos).toHaveLength(1);
    expect(panel.xp).toBe(20);
    expect(panel.nivel).toBe(1);
  });
});
