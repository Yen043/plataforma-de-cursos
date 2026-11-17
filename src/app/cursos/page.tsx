import type { Metadata } from 'next';
import { Catalogo } from '@/components/Plataforma';
export const metadata: Metadata = { title: 'Explorar cursos', description: 'Explora cursos prácticos y aprende a tu ritmo.' };
export default function CursosPage() { return <div className="content-wrap"><Catalogo/></div>; }
