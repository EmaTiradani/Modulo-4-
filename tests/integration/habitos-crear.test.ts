import { describe, it, expect, afterAll } from 'vitest';
import { baseUrl, limpiarUsuariosDeTest, prisma, registrarUsuario } from './helpers';

describe('POST /api/habitos (FR-008)', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('crea un hábito respetando el límite de nombre', async () => {
    const usuario = await registrarUsuario();

    const res = await fetch(`${baseUrl()}/api/habitos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: usuario.cookie },
      body: JSON.stringify({ nombre: 'Leer 10 páginas', dificultad: 'Facil' }),
    });

    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.habito.nombre).toBe('Leer 10 páginas');
  });

  it('rechaza nombre vacío o mayor a 100 caracteres', async () => {
    const usuario = await registrarUsuario();

    const vacio = await fetch(`${baseUrl()}/api/habitos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: usuario.cookie },
      body: JSON.stringify({ nombre: '', dificultad: 'Facil' }),
    });
    expect(vacio.status).toBe(400);

    const muyLargo = await fetch(`${baseUrl()}/api/habitos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: usuario.cookie },
      body: JSON.stringify({ nombre: 'a'.repeat(101), dificultad: 'Facil' }),
    });
    expect(muyLargo.status).toBe(400);
  });
});
