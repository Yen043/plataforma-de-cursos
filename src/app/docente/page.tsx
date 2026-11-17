import type { Metadata } from 'next';
import { PanelDocente } from '@/components/Plataforma';
export const metadata: Metadata = { title: 'Panel docente' };
export default function DocentePage() { return <PanelDocente/>; }
