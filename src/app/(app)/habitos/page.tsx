'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { apiFetch, SesionExpiradaError } from '@/lib/api/client';
import { validarNombreHabito } from '@/lib/validation/reglas';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { EmptyState } from '@/components/EmptyState';

type Dificultad = 'Facil' | 'Media' | 'Dificil';

interface Habito {
  id: string;
  nombre: string;
  dificultad: Dificultad;
}

const DIFICULTADES: Dificultad[] = ['Facil', 'Media', 'Dificil'];

export default function HabitosPage() {
  const [habitos, setHabitos] = useState<Habito[] | null>(null);
  const [cargandoLista, setCargandoLista] = useState(true);
  const [errorLista, setErrorLista] = useState<string | null>(null);

  const [nombre, setNombre] = useState('');
  const [dificultad, setDificultad] = useState<Dificultad>('Facil');
  const [errorNombre, setErrorNombre] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const [accionandoId, setAccionandoId] = useState<string | null>(null);
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const [mensajeAccion, setMensajeAccion] = useState<string | null>(null);
  const [habitoAEliminar, setHabitoAEliminar] = useState<Habito | null>(null);

  async function cargarHabitos() {
    setCargandoLista(true);
    setErrorLista(null);
    try {
      const res = await apiFetch('/api/habitos');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHabitos(data.habitos);
    } catch (e) {
      if (!(e instanceof SesionExpiradaError)) {
        setErrorLista('No se pudo cargar la lista de hábitos');
      }
    } finally {
      setCargandoLista(false);
    }
  }

  useEffect(() => {
    cargarHabitos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validarFormulario(): boolean {
    const error = validarNombreHabito(nombre);
    setErrorNombre(error);
    return !error;
  }

  async function crearHabito(e: FormEvent) {
    e.preventDefault();
    setErrorGuardar(null);
    if (!validarFormulario()) return;

    setGuardando(true);
    try {
      const res = await apiFetch('/api/habitos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, dificultad }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErrorGuardar(data?.error?.mensaje ?? 'No se pudo crear el hábito');
        return; // Datos ingresados se conservan (FR-030): no se limpia el form.
      }
      setNombre('');
      setDificultad('Facil');
      setErrorNombre(null);
      await cargarHabitos();
    } catch (e) {
      if (!(e instanceof SesionExpiradaError)) {
        setErrorGuardar('No se pudo conectar con el servidor, intentá nuevamente');
      }
    } finally {
      setGuardando(false);
    }
  }

  async function registrarCumplimiento(id: string) {
    setAccionandoId(id);
    setErrorAccion(null);
    setMensajeAccion(null);
    try {
      const res = await apiFetch(`/api/habitos/${id}/cumplir`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        if (data?.error?.codigo === 'HABITO_YA_CUMPLIDO_HOY') {
          setMensajeAccion(data.error.mensaje);
        } else {
          setErrorAccion(
            data?.error?.mensaje ?? 'No se pudo registrar el cumplimiento',
          );
        }
        return;
      }
    } catch (e) {
      if (!(e instanceof SesionExpiradaError)) {
        setErrorAccion('No se pudo conectar con el servidor, intentá nuevamente');
      }
    } finally {
      setAccionandoId(null);
    }
  }

  async function confirmarEliminar() {
    if (!habitoAEliminar) return;
    const id = habitoAEliminar.id;
    setHabitoAEliminar(null);
    setAccionandoId(id);
    setErrorAccion(null);
    try {
      const res = await apiFetch(`/api/habitos/${id}`, { method: 'DELETE' });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => null);
        setErrorAccion(data?.error?.mensaje ?? 'No se pudo eliminar el hábito');
        return;
      }
      await cargarHabitos();
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
      <h1>Hábitos</h1>

      <form onSubmit={crearHabito} noValidate>
        {errorGuardar && (
          <p className="error-mensaje" role="alert">
            {errorGuardar}
          </p>
        )}
        <div className="campo">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onBlur={() => setErrorNombre(validarNombreHabito(nombre))}
            aria-invalid={!!errorNombre}
            required
          />
          {errorNombre && <p className="error-campo">{errorNombre}</p>}
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
          {guardando ? 'Creando hábito…' : 'Crear hábito'}
        </button>
      </form>

      {cargandoLista && <p className="estado-carga">Cargando hábitos…</p>}
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
      {mensajeAccion && <p role="status">{mensajeAccion}</p>}

      {!cargandoLista && habitos && habitos.length === 0 && (
        <EmptyState
          titulo="Todavía no tenés hábitos"
          descripcion="Creá tu primer hábito con el formulario de arriba."
        />
      )}

      {!cargandoLista && habitos && habitos.length > 0 && (
        <ul>
          {habitos.map((habito) => (
            <li key={habito.id}>
              <strong>{habito.nombre}</strong> — {habito.dificultad}
              <button
                type="button"
                onClick={() => registrarCumplimiento(habito.id)}
                disabled={accionandoId === habito.id}
              >
                {accionandoId === habito.id
                  ? 'Registrando…'
                  : 'Registrar cumplimiento'}
              </button>
              <button
                type="button"
                className="secundario"
                onClick={() => setHabitoAEliminar(habito)}
                disabled={accionandoId === habito.id}
              >
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={!!habitoAEliminar}
        titulo="Eliminar hábito"
        mensaje={`¿Seguro que querés eliminar "${habitoAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmarEliminar}
        onCancel={() => setHabitoAEliminar(null)}
      />
    </div>
  );
}
