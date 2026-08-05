'use client';

import { useEffect, useState } from 'react';
import { apiFetch, SesionExpiradaError } from '@/lib/api/client';

interface EventoHistorial {
  id: string;
  tipo: 'TareaCompletada' | 'HabitoCumplido';
  fecha: string;
  xpObtenida: number;
  origen: { titulo?: string | null; nombre?: string | null };
}

export function Historial() {
  const [eventos, setEventos] = useState<EventoHistorial[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cargarPagina(cursorActual: string | null) {
    const url = cursorActual
      ? `/api/historial?cursor=${encodeURIComponent(cursorActual)}`
      : '/api/historial';

    const res = await apiFetch(url);
    if (!res.ok) throw new Error();
    const data = await res.json();
    setEventos((prev) => [...prev, ...data.eventos]);
    setCursor(data.siguienteCursor);
  }

  useEffect(() => {
    async function cargarInicial() {
      setCargandoInicial(true);
      setError(null);
      try {
        await cargarPagina(null);
      } catch (e) {
        if (!(e instanceof SesionExpiradaError)) {
          setError('No se pudo cargar el historial');
        }
      } finally {
        setCargandoInicial(false);
      }
    }
    cargarInicial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargarMas() {
    setCargandoMas(true);
    setError(null);
    try {
      await cargarPagina(cursor);
    } catch (e) {
      if (!(e instanceof SesionExpiradaError)) {
        setError('No se pudo cargar más eventos');
      }
    } finally {
      setCargandoMas(false);
    }
  }

  if (cargandoInicial) return <p className="estado-carga">Cargando historial…</p>;

  return (
    <div>
      {error && (
        <p className="error-mensaje" role="alert">
          {error}
        </p>
      )}

      {eventos.length === 0 ? (
        <p>Todavía no hay actividad en tu historial.</p>
      ) : (
        <ul>
          {eventos.map((evento) => (
            <li key={evento.id}>
              {new Date(evento.fecha).toLocaleString()} —{' '}
              {evento.tipo === 'TareaCompletada'
                ? evento.origen.titulo
                : evento.origen.nombre}{' '}
              — +{evento.xpObtenida} XP
            </li>
          ))}
        </ul>
      )}

      {/* Botón "Cargar más" oculto cuando no hay más de 20 eventos
          o ya se cargó todo el historial (FR-020, CHK022). */}
      {cursor && (
        <button type="button" onClick={cargarMas} disabled={cargandoMas}>
          {cargandoMas ? 'Cargando…' : 'Cargar más'}
        </button>
      )}
    </div>
  );
}
