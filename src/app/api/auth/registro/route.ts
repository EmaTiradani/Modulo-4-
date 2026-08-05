import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';
import { hashPassword } from '@/lib/auth/password';
import { crearSesion } from '@/lib/auth/session';
import { calcularNivel } from '@/lib/xp/calculo';
import { errorResponse } from '@/lib/api/errors';
import { isUniqueConstraintError } from '@/lib/db/prisma-errors';
import { validarEmail, validarPassword } from '@/lib/validation/reglas';

export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'DATOS_INVALIDOS', 'Cuerpo de solicitud inválido');
  }

  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (validarEmail(email) || validarPassword(password)) {
    return errorResponse(
      400,
      'DATOS_INVALIDOS',
      'Email o contraseña con formato inválido',
    );
  }

  try {
    const passwordHash = await hashPassword(password);
    const usuario = await prisma.usuario.create({
      data: { email, passwordHash },
      select: { id: true, email: true, xpAcumulada: true },
    });

    await crearSesion({ sub: usuario.id, email: usuario.email });

    return NextResponse.json(
      {
        usuario: {
          id: usuario.id,
          email: usuario.email,
          xp: usuario.xpAcumulada,
          nivel: calcularNivel(usuario.xpAcumulada),
        },
      },
      { status: 201 },
    );
  } catch (e) {
    if (isUniqueConstraintError(e, 'email')) {
      return errorResponse(
        409,
        'EMAIL_YA_REGISTRADO',
        'Ese email ya está registrado',
      );
    }
    return errorResponse(500, 'ERROR_INTERNO', 'Ocurrió un error, intentá nuevamente');
  }
}
