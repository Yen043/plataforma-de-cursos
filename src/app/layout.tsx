import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { BarraNavegacion, PiePagina } from '@/components/Plataforma';
import './globals.css';
export const metadata: Metadata = {
  title: { default: 'Aula | Aprende a tu ritmo', template: '%s | Aula' },
  description: 'Plataforma de aprendizaje con cursos, lecciones, evaluaciones y seguimiento de progreso.',
  openGraph: { title: 'Aula | Aprende a tu ritmo', description: 'Cursos prácticos para desarrollar nuevas habilidades.', type: 'website', locale: 'es_CO' },
  robots: { index: true, follow: true },
};
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <html lang="es"><body><a className="skip-link" href="#contenido">Saltar al contenido</a><BarraNavegacion/><main id="contenido">{children}</main><PiePagina/></body></html>;
}
