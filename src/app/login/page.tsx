import type { Metadata } from 'next';
import Link from 'next/link';
import Autenticacion from '@/components/Autenticacion';
export const metadata: Metadata = { title: 'Iniciar sesión' };
export default function LoginPage() { return <div className="page-wrap"><div className="panel login-card"><span className="eyebrow">BIENVENIDO A AULA</span><h1 className="page-title">Tu aprendizaje continúa aquí</h1><p className="page-lead">Inicia sesión o crea una cuenta para usar Firebase Authentication.</p><Autenticacion/><p className="notice login-notice">¿Solo quieres probar la interfaz? Usa el botón <strong>Entrar a demo</strong> en la navegación.</p><Link className="text-link" href="/cursos">Volver al catálogo →</Link></div></div>; }
