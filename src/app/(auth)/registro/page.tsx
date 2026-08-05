'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { validarEmail, validarPassword } from '@/lib/validation/reglas';

export default function RegistroPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erroresCampo, setErroresCampo] = useState<{
    email?: string | null;
    password?: string | null;
  }>({});
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validarFormulario(): boolean {
    const errorEmail = validarEmail(email);
    const errorPassword = validarPassword(password);
    setErroresCampo({ email: errorEmail, password: errorPassword });
    return !errorEmail && !errorPassword;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validarFormulario()) return;

    setCargando(true);
    try {
      const res = await fetch('/api/auth/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error?.mensaje ?? 'No se pudo completar el registro');
        return;
      }

      router.push('/panel');
      router.refresh();
    } catch {
      setError('No se pudo conectar con el servidor, intentá nuevamente');
    } finally {
      setCargando(false);
    }
  }

  return (
    <main>
      <h1>Crear cuenta</h1>
      {error && (
        <p className="error-mensaje" role="alert">
          {error}
        </p>
      )}
      <form onSubmit={onSubmit} noValidate>
        <div className="campo">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() =>
              setErroresCampo((s) => ({ ...s, email: validarEmail(email) }))
            }
            aria-invalid={!!erroresCampo.email}
            required
          />
          {erroresCampo.email && (
            <p className="error-campo">{erroresCampo.email}</p>
          )}
        </div>
        <div className="campo">
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() =>
              setErroresCampo((s) => ({
                ...s,
                password: validarPassword(password),
              }))
            }
            aria-invalid={!!erroresCampo.password}
            required
          />
          {erroresCampo.password && (
            <p className="error-campo">{erroresCampo.password}</p>
          )}
        </div>
        <button type="submit" disabled={cargando}>
          {cargando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
      <p>
        ¿Ya tenés cuenta? <Link href="/login">Iniciá sesión</Link>
      </p>
    </main>
  );
}
