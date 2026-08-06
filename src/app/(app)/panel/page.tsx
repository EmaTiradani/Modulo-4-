'use client';

import { useEffect, useState } from 'react';
import { apiFetch, SesionExpiradaError } from '@/lib/api/client';
import { Historial } from './historial';

interface DatosPanel {
  xp: number;
  nivel: number;
  tareasCompletadas: number;
  registrosHabitoCumplidos: number;
}

export default function PanelPage() {
  const [datos, setDatos] = useState<DatosPanel | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const res = await apiFetch('/api/panel');
        if (!res.ok) throw new Error();
        setDatos(await res.json());
      } catch (e) {
        if (!(e instanceof SesionExpiradaError)) {
          setError('No se pudo cargar el panel');
        }
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return (
    <div>
      <h1>Panel</h1>

      {cargando && <p className="estado-carga">Cargando panel…</p>}
      {error && (
        <p className="error-mensaje" role="alert">
          {error}
        </p>
      )}

      {datos && (
        <dl>
          <dt>Experiencia acumulada</dt>
          <dd>{datos.xp} XP</dd>
          <dt>Nivel</dt>
          <dd>{datos.nivel}</dd>
          <dt>Tareas completadas</dt>
          <dd>{datos.tareasCompletadas}</dd>
          <dt>Hábitos cumplidos</dt>
          <dd>{datos.registrosHabitoCumplidos}</dd>
        </dl>
      )}

      <h2>Historial</h2>
      <Historial />
    </div>
  );
}
