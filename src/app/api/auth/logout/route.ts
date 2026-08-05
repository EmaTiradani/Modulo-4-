import { destruirSesion } from '@/lib/auth/session';

export async function POST() {
  await destruirSesion();
  return new Response(null, { status: 204 });
}
