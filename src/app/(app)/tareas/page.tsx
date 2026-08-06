'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch, SesionExpiradaError } from '@/lib/api/client';
import { validarTitulo, validarDescripcion } from '@/lib/validation/reglas';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';

type Dificultad = 'Facil' | 'Media' | 'Dificil';
type EstadoTarea = 'Pendiente' | 'Completada';

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string | null;
  dificultad: Dificultad;
  estado: EstadoTarea;
}

const DIFICULTADES: Dificultad[] = ['Facil', 'Media', 'Dificil'];

export default function TareasPage() {
  const [tareas, setTareas] = useState<Tarea[] | null>(null);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista, setErrorLista] = useState<string | null>(null);

  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [dificultad, setDificultad] = useState<Dificultad>('Facil');
  const [erroresCampo, setErroresCampo] = useState<{
    titulo?: string | null;
    descripcion?: string | null;
  }>({});
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const [accionandoId, setAccionandoId] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [tareaAEliminar, setTareaAEliminar] = useState<Tarea | null>(null);

  async function cargarTareas() {
    setCargandoLista(true);
    setErrorLista(null);
    try {
      const res = await apiFetch('/api/tareas');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setTareas(data.tareas);
    } catch (e) {
      if (!(e instanceof SesionExpiradaError)) {
        setErrorLista('No se pudo cargar la lista de tareas');
      }
    } finally {
      setCargandoLista(false);
    }
  }

  useEffect(() => {
    cargarTareas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validarFormulario(): boolean {
    const errorTitulo = validarTitulo(titulo);
    const errorDescripcion = descripcion ? validarDescripcion(descripcion) : null;
    setErroresCampo({ titulo: errorTitulo, descripcion: errorDescripcion });
    return !errorTitulo && !errorDescripcion;
  }

  async function crearTarea(e: FormEvent) {
    e.preventDefault();
    setErrorGuardar(null);
    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      const res = await apiFetch('/api/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion, dificultad }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorGuardar(data?.error?.mensaje ?? 'No se pudo crear la tarea');
        return; // Datos ingresados se conservan (FR-030): no se limpia el form.
      }
      setTitulo('');
      setDescripcion('');
      setDificultad('Facil');
      setErroresCampo({});
      await cargarTareas();
    } catch (e) {
      if (!(e instanceof SesionExpiradaError)) {
        setErrorGuardar('No se pudo conectar con el servidor, intentá nuevamente');
      }
    } finally {
      setGuardando(false);
    }
  }

  async function completarTarea(id: string) {
    setAccionandoId(id);
    setErrorAccion(null);
    try {
      const res = await apiFetch(`/api/tareas/${id}/completar`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorAccion(data?.error?.mensaje ?? 'No se pudo completar la tarea');
        return;
      }
      await cargarTareas();
    } catch (e) {
      if (!(e instanceof SesionExpiradaError)) {
        setErrorAccion('No se pudo conectar con el servidor, intentá nuevamente');
      }
    } finally {
      setAccionandoId(null);
    }
  }

  async function confirmarEliminar() {
    if (!tareaAEliminar) return;
    const id = tareaAEliminar.id;
    setTareaAEliminar(null);
    setAccionandoId(id);
    setErrorAccion(null);
    try {
      const res = await apiFetch(`/api/tareas/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => null);
        setErrorAccion(data?.error?.mensaje ?? 'No se pudo eliminar la tarea');
        return;
      }
      await cargarTareas();
    } catch (e) {
      if (!(e instanceof SesionExpiradaError)) {
        setErrorAccion('No se pudo conectar con el servidor, intentá nuevamente');
      }
    } finally {
      setAccionandoId(null);
    }
  }

  return (
    <div>
      <h1>Tareas</h1>

      <form onSubmit={crearTarea} noValidate>
        {errorGuardar && (
          <p className="error-mensaje" role="alert">
            {errorGuardar}
          </p>
        )}
        <div className="campo">
          <label htmlFor="titulo">Título</label>
          <input
            id="titulo"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            onBlur={() =>
              setErroresCampo((s) => ({ ...s, titulo: validarTitulo(titulo) }))
            }
            aria-invalid={!!erroresCampo.titulo}
            required
          />
          {erroresCampo.titulo && (
            <p className="error-campo">{erroresCampo.titulo}</p>
          )}
        </div>
        <div className="campo">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            onBlur={() =>
              setErroresCampo((s) => ({
                ...s,
                descripcion: descripcion
                  ? validarDescripcion(descripcion)
                  : null,
              }))
            }
            aria-invalid={!!erroresCampo.descripcion}
          />
          {erroresCampo.descripcion && (
            <p className="error-campo">{erroresCampo.descripcion}</p>
          )}
        </div>
        <div className="campo">
          <label htmlFor="dificultad">Dificultad</label>
          <select
            id="dificultad"
            value={dificultad}
            onChange={(e) => setDificultad(e.target.value as Dificultad)}
          >
            {DIFICULTADES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={guardando}>
          {guardando ? 'Creando tarea…' : 'Crear tarea'}
        </button>
      </form>

      {cargandoLista && <p className="estado-carga">Cargando tareas…</p>}
      {errorLista && (
        <p className="error-mensaje" role="alert">
          {errorLista}
        </p>
      )}
      {errorAccion && (
        <p className="error-mensaje" role="alert">
          {errorAccion}
        </p>
      )}

      {!cargandoLista && tareas && tareas.length === 0 && (
        <EmptyState
          titulo="Todavía no tenés tareas"
          descripcion="Creá tu primera tarea con el formulario de arriba."
        />
      )}

      {!cargandoLista && tareas && tareas.length > 0 && (
        <ul>
          {tareas.map((tarea) => (
            <li key={tarea.id}>
              <strong>{tarea.titulo}</strong> — {tarea.dificultad} —{' '}
              {tarea.estado}
              {tarea.estado === 'Pendiente' && (
                <button
                  type="button"
                  onClick={() => completarTarea(tarea.id)}
                  disabled={accionandoId === tarea.id}
                >
                  {accionandoId === tarea.id
                    ? 'Completando…'
                    : 'Completar'}
                </button>
              )}
              <button
                type="button"
                className="secundario"
                onClick={() => setTareaAEliminar(tarea)}
                disabled={accionandoId === tarea.id}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!tareaAEliminar}
        titulo="Eliminar tarea"
        mensaje={`¿Seguro que querés eliminar "${tareaAEliminar?.titulo}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmarEliminar}
        onCancel={() => setTareaAEliminar(null)}
      />
    </div>
  );
}
