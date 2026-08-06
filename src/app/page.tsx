import { redirect } from 'next/navigation';
import { leerSesion } from '@/lib/auth/session';

export default async function RootPage() {
  const sesion = await leerSesion();
  redirect(sesion ? '/panel' : '/login');
}
