export class SesionExpiradaError extends Error {
  constructor() {
    super('Tu sesión expiró, iniciá sesión nuevamente');
  }
}

/**
 * Wrapper de fetch para llamadas autenticadas del cliente. Si el servidor
 * responde 401 (sesión expirada, FR-027), redirige a /login mostrando el
 * motivo y corta el flujo lanzando SesionExpiradaError para que el caller
 * no intente seguir procesando la respuesta.
 */
export async function apiFetch(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, { ...init, credentials: 'same-origin' });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/login?motivo=sesion_expirada';
    }
    throw new SesionExpiradaError();
  }

  return res;
}
