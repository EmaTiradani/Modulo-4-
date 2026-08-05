import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getUsuarioAutenticado } from '@/lib/auth/middleware';
import { calcularXP, calcularNivel } from '@/lib/xp/calculo';
import { errorResponse, SESION_EXPIRADA, SIN_PERMISO } from '@/lib/api/errors';
import { isUniqueConstraintError } from '@/lib/db/prisma-errors';

function hoyUTC(): Date {
  const ahora = new Date();
  return new Date(
    Date.UTC(ahora.getUTCFullYear(), ahora.getUTCMonth(), ahora.getUTCDate()),
  );
}

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const usuario = await getUsuarioAutenticado().catch(() => null);
  if (!usuario) return SESION_EXPIRADA();

  const habito = await prisma.habito.findUnique({ where: { id: params.id } });
  if (!habito || habito.usuarioId !== usuario.id) return SIN_PERMISO();

  const yaCumplidoHoy = () =>
    errorResponse(
      409,
      'HABITO_YA_CUMPLIDO_HOY',
      'Este hábito ya fue registrado hoy',
    );

  const fecha = hoyUTC();

  const registroExistente = await prisma.registroCumplimientoHabito.findUnique(
    { where: { habitoId_fecha: { habitoId: habito.id, fecha } } },
  );
  if (registroExistente) return yaCumplidoHoy();

  const xpObtenida = calcularXP(habito.dificultad);

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const registro = await tx.registroCumplimientoHabito.create({
        data: { habitoId: habito.id, fecha },
      });

      await tx.eventoHistorial.create({
        data: {
          usuarioId: usuario.id,
          tipo: 'HabitoCumplido',
          habitoId: habito.id,
          registroCumplimientoId: registro.id,
          xpObtenida,
        },
      });

      const usuarioActualizado = await tx.usuario.update({
        where: { id: usuario.id },
        data: { xpAcumulada: { increment: xpObtenida } },
        select: { xpAcumulada: true },
      });

      return { registro, usuarioActualizado };
    });

    return NextResponse.json({
      registro: {
        id: resultado.registro.id,
        fecha: resultado.registro.fecha,
      },
      xpObtenida,
      usuario: {
        xp: resultado.usuarioActualizado.xpAcumulada,
        nivel: calcularNivel(resultado.usuarioActualizado.xpAcumulada),
      },
    });
  } catch (e) {
    if (isUniqueConstraintError(e, 'habitoId_fecha')) return yaCumplidoHoy();
    return errorResponse(500, 'ERROR_INTERNO', 'Ocurrió un error, intentá nuevamente');
  }
}
