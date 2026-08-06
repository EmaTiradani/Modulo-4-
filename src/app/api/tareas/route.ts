import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getUsuarioAutenticado, NoAutenticadoError } from '@/lib/auth/middleware';
import { errorResponse, SESION_EXPIRADA } from '@/lib/api/errors';
import { validarTitulo, validarDescripcion } from '@/lib/validation/reglas';

const DIFICULTADES = ['Facil', 'Media', 'Dificil'] as const;

export async function GET() {
  const usuario = await getUsuarioAutenticado().catch(() => null);
  if (!usuario) return SESION_EXPIRADA();

  const tareas = await prisma.tarea.findMany({
    where: { usuarioId: usuario.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ tareas });
}

export async function POST(req: NextRequest) {
  const usuario = await getUsuarioAutenticado().catch((e) => {
    if (e instanceof NoAutenticadoError) return null;
    throw e;
  });
  if (!usuario) return SESION_EXPIRADA();

  let body: { titulo?: unknown; descripcion?: unknown; dificultad?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'DATOS_INVALIDOS', 'Cuerpo de solicitud inválido');
  }

  const titulo = typeof body.titulo === 'string' ? body.titulo : '';
  const descripcion =
    typeof body.descripcion === 'string' ? body.descripcion : undefined;
  const dificultad = body.dificultad;

  if (
    validarTitulo(titulo) ||
    (descripcion && validarDescripcion(descripcion)) ||
    typeof dificultad !== 'string' ||
    !DIFICULTADES.includes(dificultad as (typeof DIFICULTADES)[number])
  ) {
    return errorResponse(400, 'DATOS_INVALIDOS', 'Datos de la tarea inválidos');
  }

  const tarea = await prisma.tarea.create({
    data: {
      usuarioId: usuario.id,
      titulo,
      descripcion: descripcion || null,
      dificultad: dificultad as (typeof DIFICULTADES)[number],
    },
  });

  return NextResponse.json({ tarea }, { status: 201 });
}
