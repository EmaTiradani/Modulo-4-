import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'QuestIt',
  description:
    'Centralizá tus tareas y hábitos, y ganá experiencia por tu progreso.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
