export class CursorInvalidoError extends Error {}

interface CursorData {
  fecha: string;
  id: string;
}

export function encodeCursor(evento: { fecha: Date; id: string }): string {
  const data: CursorData = { fecha: evento.fecha.toISOString(), id: evento.id };
  return Buffer.from(JSON.stringify(data)).toString('base64url');
}

export function decodeCursor(cursor: string): CursorData {
  try {
    const data = JSON.parse(
      Buffer.from(cursor, 'base64url').toString('utf-8'),
    ) as CursorData;
    if (typeof data.fecha !== 'string' || typeof data.id !== 'string') {
      throw new Error('shape inválida');
    }
    return data;
  } catch {
    throw new CursorInvalidoError();
  }
}
