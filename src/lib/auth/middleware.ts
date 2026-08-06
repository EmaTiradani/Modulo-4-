import { prisma } from '@/lib/db/client';
import { leerSesion } from '@/lib/auth/session';

export class NoAutenticadoError extends Error {}

export interface UsuarioAutenticado {
  id: string;
  email: string;
  xpAcumulada: number;
}

/**
 * Punto único que impone el aislamiento por usuario (FR-018): toda ruta
 * debe obtener el usuario mediante esta función y usar `usuario.id` como
 * filtro, nunca un usuarioId recibido del cliente.
 */
export async function getUsuarioAutenticado(): Promise<UsuarioAutenticado> {
  const sesion = await leerSesion();
  if (!sesion) throw new NoAutenticadoError();

  const usuario = await prisma.usuario.findUnique({
    where: { id: sesion.sub },
    select: { id: true, email: true, xpAcumulada: true },
  });
  if (!usuario) throw new NoAutenticadoError();

  return usuario;
}
