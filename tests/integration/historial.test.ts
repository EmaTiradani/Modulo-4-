import { describe, it, expect, afterAll } from 'vitest';
import { baseUrl, limpiarUsuariosDeTest, prisma, registrarUsuario } from './helpers';

describe('GET /api/historial (FR-020)', () => {
  afterAll(async () => {
    await limpiarUsuariosDeTest();
    await prisma.$disconnect();
  });

  it('pagina en bloques de 20, orden descendente, sin duplicar ni saltar eventos', async () => {
    const usuario = await registrarUsuario();

    async function crearYCompletarTarea(i: number) {
      const res = await fetch(`${baseUrl()}/api/tareas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: usuario.cookie,
        },
        body: JSON.stringify({ titulo: `Tarea ${i}`, dificultad: 'Facil' }),
      });
      const tarea = (await res.json()).tarea;
      await fetch(`${baseUrl()}/api/tareas/${tarea.id}/completar`, {
        method: 'POST',
        headers: { Cookie: usuario.cookie },
      });
    }

    // 25 tareas Fáciles completadas -> 25 eventos de historial. Se lanzan en
    // lotes concurrentes (en vez de secuencial) para no acumular la latencia
    // de red real hacia la base de datos remota en un solo test.
    const TOTAL = 25;
    const LOTE = 5;
    for (let inicio = 0; inicio < TOTAL; inicio += LOTE) {
      const indices = Array.from(
        { length: Math.min(LOTE, TOTAL - inicio) },
        (_, j) => inicio + j,
      );
      await Promise.all(indices.map(crearYCompletarTarea));
    }

    const primeraPagina = await fetch(`${baseUrl()}/api/historial`, {
      headers: { Cookie: usuario.cookie },
    });
    const dataPrimera = await primeraPagina.json();
    expect(dataPrimera.eventos).toHaveLength(20);
    expect(dataPrimera.siguienteCursor).not.toBeNull();

    const segundaPagina = await fetch(
      `${baseUrl()}/api/historial?cursor=${encodeURIComponent(dataPrimera.siguienteCursor)}`,
      { headers: { Cookie: usuario.cookie } },
    );
    const dataSegunda = await segundaPagina.json();
    expect(dataSegunda.eventos).toHaveLength(5);
    expect(dataSegunda.siguienteCursor).toBeNull();

    const idsPrimera = dataPrimera.eventos.map((e: { id: string }) => e.id);
    const idsSegunda = dataSegunda.eventos.map((e: { id: string }) => e.id);
    const interseccion = idsPrimera.filter((id: string) =>
      idsSegunda.includes(id),
    );
    expect(interseccion).toHaveLength(0); // sin duplicados

    const todasLasFechas = [...dataPrimera.eventos, ...dataSegunda.eventos].map(
      (e: { fecha: string }) => new Date(e.fecha).getTime(),
    );
    const ordenadoDescendente = [...todasLasFechas].sort((a, b) => b - a);
    expect(todasLasFechas).toEqual(ordenadoDescendente);
  });
});
