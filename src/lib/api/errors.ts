import { NextResponse } from 'next/server';

export interface ErrorBody {
  error: { codigo: string; mensaje: string };
}

export function errorResponse(
  status: number,
  codigo: string,
  mensaje: string,
): NextResponse<ErrorBody> {
  return NextResponse.json({ error: { codigo, mensaje } }, { status });
}

export const SESION_EXPIRADA = () =>
  errorResponse(
    401,
    'SESION_EXPIRADA',
    'Tu sesión expiró, iniciá sesión nuevamente',
  );

export const SIN_PERMISO = () =>
  errorResponse(403, 'SIN_PERMISO', 'No tenés permiso para esta acción');
