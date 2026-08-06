import { redirect } from 'next/navigation';
import Link from 'next/link';
import { leerSesion } from '@/lib/auth/session';
import { LogoutButton } from './LogoutButton';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sesion = await leerSesion();
  if (!sesion) redirect('/login');

  return (
    <>
      <header className="app-header">
        <nav>
          <Link href="/panel">Panel</Link>
          <Link href="/tareas">Tareas</Link>
          <Link href="/habitos">Hábitos</Link>
        </nav>
        <LogoutButton />
      </header>
      <main>{children}</main>
    </>
  );
}
