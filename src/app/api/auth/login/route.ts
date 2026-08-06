import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { verifyPassword } from '@/lib/auth/password';
import { crearSesion } from '@/lib/auth/session';
import { calcularNivel } from '@/lib/xp/calculo';
import { errorResponse } from '@/lib/api/errors';

export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'DATOS_INVALIDOS', 'Cuerpo de solicitud inválido');
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  const credencialesInvalidas = () =>
    errorResponse(401, 'CREDENCIALES_INVALIDAS', 'Email o contraseña incorrectos');

  if (!email || !password) return credencialesInvalidas();

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (!usuario) return credencialesInvalidas();

  const passwordValida = await verifyPassword(password, usuario.passwordHash);
  if (!passwordValida) return credencialesInvalidas();

  await crearSesion({ sub: usuario.id, email: usuario.email });

  return NextResponse.json({
    usuario: {
      id: usuario.id,
      email: usuario.email,
      xp: usuario.xpAcumulada,
      nivel: calcularNivel(usuario.xpAcumulada),
    },
  });
}
