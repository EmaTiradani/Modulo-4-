import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getUsuarioAutenticado } from '@/lib/auth/middleware';
import { errorResponse, SESION_EXPIRADA } from '@/lib/api/errors';
import {
  encodeCursor,
  decodeCursor,
  CursorInvalidoError,
} from '@/lib/api/historial-cursor';
import type { Prisma } from '@prisma/client';

const LIMITE = 20;

export async function GET(req: NextRequest) {
  const usuario = await getUsuarioAutenticado().catch(() => null);
  if (!usuario) return SESION_EXPIRADA();

  const cursorParam = req.nextUrl.searchParams.get('cursor');

  const where: Prisma.EventoHistorialWhereInput = { usuarioId: usuario.id };

  if (cursorParam) {
    try {
      const { fecha, id } = decodeCursor(cursorParam);
      where.OR = [
        { fecha: { lt: new Date(fecha) } },
        { fecha: new Date(fecha), id: { lt: id } },
      ];
    } catch (e) {
      if (e instanceof CursorInvalidoError) {
        return errorResponse(400, 'CURSOR_INVALIDO', 'Cursor de paginación inválido');
      }
      throw e;
    }
  }

  const eventos = await prisma.eventoHistorial.findMany({
    where,
    orderBy: [{ fecha: 'desc' }, { id: 'desc' }],
    take: LIMITE,
    include: { tarea: true, habito: true },
  });

  const siguienteCursor =
    eventos.length === LIMITE
      ? encodeCursor(eventos[eventos.length - 1])
      : null;

  return NextResponse.json({
    eventos: eventos.map((evento) => ({
      id: evento.id,
      tipo: evento.tipo,
      fecha: evento.fecha,
      xpObtenida: evento.xpObtenida,
      origen:
        evento.tipo === 'TareaCompletada'
          ? { titulo: evento.tarea?.titulo ?? null }
          : { nombre: evento.habito?.nombre ?? null },
    })),
    siguienteCursor,
  });
}
