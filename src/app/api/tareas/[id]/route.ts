import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getUsuarioAutenticado } from '@/lib/auth/middleware';
import { errorResponse, SESION_EXPIRADA, SIN_PERMISO } from '@/lib/api/errors';
import { validarTitulo, validarDescripcion } from '@/lib/validation/reglas';

const DIFICULTADES = ['Facil', 'Media', 'Dificil'] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const usuario = await getUsuarioAutenticado().catch(() => null);
  if (!usuario) return SESION_EXPIRADA();

  const tarea = await prisma.tarea.findUnique({ where: { id: params.id } });
  if (!tarea || tarea.usuarioId !== usuario.id) return SIN_PERMISO();

  let body: { titulo?: unknown; descripcion?: unknown; dificultad?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'DATOS_INVALIDOS', 'Cuerpo de solicitud inválido');
  }

  const data: {
    titulo?: string;
    descripcion?: string | null;
    dificultad?: (typeof DIFICULTADES)[number];
  } = {};

  if (body.titulo !== undefined) {
    if (typeof body.titulo !== 'string' || validarTitulo(body.titulo)) {
      return errorResponse(400, 'DATOS_INVALIDOS', 'Título inválido');
    }
    data.titulo = body.titulo;
  }

  if (body.descripcion !== undefined) {
    if (
      body.descripcion !== null &&
      (typeof body.descripcion !== 'string' ||
        validarDescripcion(body.descripcion))
    ) {
      return errorResponse(400, 'DATOS_INVALIDOS', 'Descripción inválida');
    }
    data.descripcion = body.descripcion;
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

  const actualizada = await prisma.tarea.update({
    where: { id: tarea.id },
    data,
  });

  return NextResponse.json({ tarea: actualizada });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const usuario = await getUsuarioAutenticado().catch(() => null);
  if (!usuario) return SESION_EXPIRADA();

  const tarea = await prisma.tarea.findUnique({ where: { id: params.id } });
  if (!tarea || tarea.usuarioId !== usuario.id) return SIN_PERMISO();

  await prisma.tarea.delete({ where: { id: tarea.id } });

  return new Response(null, { status: 204 });
}
