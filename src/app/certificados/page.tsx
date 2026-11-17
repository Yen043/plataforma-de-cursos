import type { Metadata } from 'next';
import { Certificados } from '@/components/Plataforma';
export const metadata: Metadata = { title: 'Mis certificados' };
export default function CertificadosPage() { return <Certificados/>; }
