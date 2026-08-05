import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getUsuarioAutenticado } from '@/lib/auth/middleware';
import { calcularXP, calcularNivel } from '@/lib/xp/calculo';
import { errorResponse, SESION_EXPIRADA, SIN_PERMISO } from '@/lib/api/errors';

class TareaYaCompletadaError extends Error {}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const usuario = await getUsuarioAutenticado().catch(() => null);
  if (!usuario) return SESION_EXPIRADA();

  const tarea = await prisma.tarea.findUnique({ where: { id: params.id } });
  if (!tarea || tarea.usuarioId !== usuario.id) return SIN_PERMISO();

  const tareaYaCompletada = () =>
    errorResponse(409, 'TAREA_YA_COMPLETADA', 'Esta tarea ya fue completada');

  if (tarea.estado === 'Completada') return tareaYaCompletada();

  const xpObtenida = calcularXP(tarea.dificultad);

  try {
    const usuarioActualizado = await prisma.$transaction(async (tx) => {
      const actualizadas = await tx.tarea.updateMany({
        where: { id: tarea.id, usuarioId: usuario.id, estado: 'Pendiente' },
        data: { estado: 'Completada' },
      });
      if (actualizadas.count === 0) {
        throw new TareaYaCompletadaError();
      }

      await tx.eventoHistorial.create({
        data: {
          usuarioId: usuario.id,
          tipo: 'TareaCompletada',
          tareaId: tarea.id,
          xpObtenida,
        },
      });

      return tx.usuario.update({
        where: { id: usuario.id },
        data: { xpAcumulada: { increment: xpObtenida } },
        select: { xpAcumulada: true },
      });
    });

    return NextResponse.json({
      tarea: { ...tarea, estado: 'Completada' },
      xpObtenida,
      usuario: {
        xp: usuarioActualizado.xpAcumulada,
        nivel: calcularNivel(usuarioActualizado.xpAcumulada),
      },
    });
  } catch (e) {
    if (e instanceof TareaYaCompletadaError) return tareaYaCompletada();
    return errorResponse(500, 'ERROR_INTERNO', 'Ocurrió un error, intentá nuevamente');
  }
}
