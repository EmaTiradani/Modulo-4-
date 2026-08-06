import { Prisma } from '@prisma/client';

export function isUniqueConstraintError(
  error: unknown,
  target?: string,
): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  if (error.code !== 'P2002') return false;
  if (!target) return true;

  const meta = error.meta?.target;
  if (Array.isArray(meta)) return meta.includes(target);
  return meta === target;
}
