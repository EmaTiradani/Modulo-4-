import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getUsuarioAutenticado } from '@/lib/auth/middleware';
import { errorResponse, SESION_EXPIRADA, SIN_PERMISO } from '@/lib/api/errors';
import { validarNombreHabito } from '@/lib/validation/reglas';

const DIFICULTADES = ['Facil', 'Media', 'Dificil'] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const usuario = await getUsuarioAutenticado().catch(() => null);
  if (!usuario) return SESION_EXPIRADA();

  const habito = await prisma.habito.findUnique({ where: { id: params.id } });
  if (!habito || habito.usuarioId !== usuario.id) return SIN_PERMISO();

  let body: { nombre?: unknown; dificultad?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'DATOS_INVALIDOS', 'Cuerpo de solicitud inválido');
  }

  const data: {
    nombre?: string;
    dificultad?: (typeof DIFICULTADES)[number];
  } = {};

  if (body.nombre !== undefined) {
    if (typeof body.nombre !== 'string' || validarNombreHabito(body.nombre)) {
      return errorResponse(400, 'DATOS_INVALIDOS', 'Nombre inválido');
    }
    data.nombre = body.nombre;
  }

  if (body.dificultad !== undefined) {
    if (
      typeof body.dificultad !== 'string' ||
      !DIFICULTADES.includes(body.dificultad as (typeof DIFICULTADES)[number])
    ) {
      return errorResponse(400, 'DATOS_INVALIDOS', 'Dificultad inválida');
    }
    data.dificultad = body.dificultad as (typeof DIFICULTADES)[number];
  }

  const actualizado = await prisma.habito.update({
    where: { id: habito.id },
    data,
  });

  return NextResponse.json({ habito: actualizado });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const usuario = await getUsuarioAutenticado().catch(() => null);
  if (!usuario) return SESION_EXPIRADA();

  const habito = await prisma.habito.findUnique({ where: { id: params.id } });
  if (!habito || habito.usuarioId !== usuario.id) return SIN_PERMISO();

  await prisma.habito.delete({ where: { id: habito.id } });

  return new Response(null, { status: 204 });
}
