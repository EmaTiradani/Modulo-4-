import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getUsuarioAutenticado } from '@/lib/auth/middleware';
import { errorResponse, SESION_EXPIRADA } from '@/lib/api/errors';
import { validarNombreHabito } from '@/lib/validation/reglas';

const DIFICULTADES = ['Facil', 'Media', 'Dificil'] as const;

export async function GET() {
  const usuario = await getUsuarioAutenticado().catch(() => null);
  if (!usuario) return SESION_EXPIRADA();

  const habitos = await prisma.habito.findMany({
    where: { usuarioId: usuario.id },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ habitos });
}

export async function POST(req: NextRequest) {
  const usuario = await getUsuarioAutenticado().catch(() => null);
  if (!usuario) return SESION_EXPIRADA();

  let body: { nombre?: unknown; dificultad?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'DATOS_INVALIDOS', 'Cuerpo de solicitud inválido');
  }

  const nombre = typeof body.nombre === 'string' ? body.nombre : '';
  const dificultad = body.dificultad;

  if (
    validarNombreHabito(nombre) ||
    typeof dificultad !== 'string' ||
    !DIFICULTADES.includes(dificultad as (typeof DIFICULTADES)[number])
  ) {
    return errorResponse(400, 'DATOS_INVALIDOS', 'Datos del hábito inválidos');
  }

  const habito = await prisma.habito.create({
    data: {
      usuarioId: usuario.id,
      nombre,
      dificultad: dificultad as (typeof DIFICULTADES)[number],
    },
  });

  return NextResponse.json({ habito }, { status: 201 });
}
