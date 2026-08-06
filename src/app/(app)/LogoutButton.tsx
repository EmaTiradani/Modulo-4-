'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, SesionExpiradaError } from '@/lib/api/client';

export function LogoutButton() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);

  async function cerrarSesion() {
    setCargando(true);
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (e) {
      if (!(e instanceof SesionExpiradaError)) {
        setCargando(false);
      }
    }
  }

  return (
    <button
      type="button"
      className="secundario"
      onClick={cerrarSesion}
      disabled={cargando}
    >
      {cargando ? 'Cerrando sesión…' : 'Cerrar sesión'}
    </button>
  );
}
