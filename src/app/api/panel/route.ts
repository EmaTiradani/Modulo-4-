import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { getUsuarioAutenticado } from '@/lib/auth/middleware';
import { calcularNivel } from '@/lib/xp/calculo';
import { SESION_EXPIRADA } from '@/lib/api/errors';

export async function GET() {
  const usuario = await getUsuarioAutenticado().catch(() => null);
  if (!usuario) return SESION_EXPIRADA();

  const [tareasCompletadas, registrosHabitoCumplidos] = await Promise.all([
    prisma.tarea.count({
      where: { usuarioId: usuario.id, estado: 'Completada' },
    }),
    prisma.eventoHistorial.count({
      where: { usuarioId: usuario.id, tipo: 'HabitoCumplido' },
    }),
  ]);

  return NextResponse.json({
    xp: usuario.xpAcumulada,
    nivel: calcularNivel(usuario.xpAcumulada),
    tareasCompletadas,
    registrosHabitoCumplidos,
  });
}
